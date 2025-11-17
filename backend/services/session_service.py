"""
Service de gestion des sessions
"""
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.session import Session, SessionConfig, Message, AIParticipant
from models.orchestration import SessionStatistics, ConversationFlow


class SessionService:
    """Service de gestion des sessions"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.sessions_collection = db.sessions
        self.messages_collection = db.messages
        
    async def create_session(self, config: SessionConfig) -> Session:
        """Crée une nouvelle session"""
        session = Session(
            config=config,
            messages=[],
            stats={
                "total_messages": 0,
                "messages_per_ia": {p.name: 0 for p in config.participants},
                "states_distribution": {
                    "certitude": 0,
                    "probable": 0,
                    "incertain": 0,
                    "intuition": 0,
                    "oracle": 0,
                    "recherche": 0
                },
                "oracle_moments": 0,
                "questions_detected": 0
            }
        )
        
        # Sauvegarde en base
        await self.sessions_collection.insert_one(session.model_dump())
        
        return session
    
    async def get_session(self, session_id: str) -> Optional[Session]:
        """Récupère une session par son ID"""
        doc = await self.sessions_collection.find_one({"id": session_id})
        if doc:
            return Session(**doc)
        return None
    
    async def add_message(self, session_id: str, message: Message) -> Session:
        """Ajoute un message à une session"""
        session = await self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        # Ajoute le message
        session.messages.append(message)
        session.updated_at = datetime.now()
        
        # Met à jour les stats
        session.stats["total_messages"] += 1
        session.stats["messages_per_ia"][message.from_ia] = \
            session.stats["messages_per_ia"].get(message.from_ia, 0) + 1
        
        # Mise à jour des stats seulement si le message est bien formaté
        if message.formatted_message:
            state_key = message.formatted_message.state.value
            session.stats["states_distribution"][state_key] += 1
            
            if message.formatted_message.state.value == "oracle":
                session.stats["oracle_moments"] += 1
        
        if message.detected_questions:
            session.stats["questions_detected"] += len(message.detected_questions)
        
        # Sauvegarde
        await self.sessions_collection.update_one(
            {"id": session_id},
            {"$set": session.model_dump()}
        )
        
        # Sauvegarde aussi le message individuellement
        await self.messages_collection.insert_one(message.model_dump())
        
        return session
    
    async def get_active_session(self) -> Optional[Session]:
        """Récupère la session active"""
        doc = await self.sessions_collection.find_one({"status": "active"})
        if doc:
            return Session(**doc)
        return None
    
    async def pause_session(self, session_id: str):
        """Met une session en pause"""
        await self.sessions_collection.update_one(
            {"id": session_id},
            {"$set": {"status": "paused", "updated_at": datetime.now()}}
        )
    
    async def resume_session(self, session_id: str):
        """Reprend une session"""
        await self.sessions_collection.update_one(
            {"id": session_id},
            {"$set": {"status": "active", "updated_at": datetime.now()}}
        )
    
    async def complete_session(self, session_id: str):
        """Termine une session"""
        session = await self.get_session(session_id)
        if session:
            # Calcule la durée
            duration = (session.updated_at - session.created_at).total_seconds() / 60
            
            await self.sessions_collection.update_one(
                {"id": session_id},
                {"$set": {
                    "status": "completed",
                    "updated_at": datetime.now(),
                    "stats.duration_minutes": duration
                }}
            )
    
    async def list_sessions(
        self, 
        limit: int = 50,
        status: Optional[str] = None
    ) -> List[Session]:
        """Liste les sessions"""
        query = {}
        if status:
            query["status"] = status
        
        cursor = self.sessions_collection.find(query).sort("created_at", -1).limit(limit)
        docs = await cursor.to_list(length=limit)
        
        return [Session(**doc) for doc in docs]
    
    async def search_sessions(self, query_text: str) -> List[Session]:
        """Recherche dans l'historique des sessions"""
        # Recherche dans les sujets et messages
        sessions = []
        
        # Recherche par sujet
        cursor = self.sessions_collection.find({
            "$or": [
                {"config.subject": {"$regex": query_text, "$options": "i"}},
                {"config.summary": {"$regex": query_text, "$options": "i"}}
            ]
        })
        
        async for doc in cursor:
            sessions.append(Session(**doc))
        
        # Recherche dans les messages
        message_cursor = self.messages_collection.find({
            "raw_content": {"$regex": query_text, "$options": "i"}
        })
        
        async for msg_doc in message_cursor:
            session_id = msg_doc["session_id"]
            if not any(s.id == session_id for s in sessions):
                session_doc = await self.sessions_collection.find_one({"id": session_id})
                if session_doc:
                    sessions.append(Session(**session_doc))
        
        return sessions
    
    async def get_session_statistics(self, session_id: str) -> SessionStatistics:
        """Génère les statistiques détaillées d'une session"""
        session = await self.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        # Compte les cafés servis
        cafes_served = {
            "expresso": 0,
            "long": 0,
            "cosmique": 0,
            "gourmand": 0
        }
        
        for msg in session.messages:
            cafe = msg.formatted_message.cafe_type.value
            cafes_served[cafe] += 1
        
        # Moments Oracle
        oracle_moments = []
        for msg in session.messages:
            if msg.formatted_message.state.value == "oracle":
                oracle_moments.append({
                    "ia": msg.from_ia,
                    "timestamp": msg.timestamp.isoformat(),
                    "message_id": msg.id
                })
        
        # Conversation flow
        flow = ConversationFlow(session_id=session_id)
        for msg in session.messages:
            if msg.formatted_message.interlocutor != "Tous":
                flow.add_interaction(msg.from_ia, msg.formatted_message.interlocutor)
        
        # Durée
        duration = (session.updated_at - session.created_at).total_seconds() / 60
        
        return SessionStatistics(
            session_id=session_id,
            total_messages=session.stats["total_messages"],
            messages_per_ia=session.stats["messages_per_ia"],
            states_distribution=session.stats["states_distribution"],
            oracle_moments=oracle_moments,
            questions_detected=session.stats["questions_detected"],
            cafes_served=cafes_served,
            conversation_flow=flow,
            duration_minutes=duration
        )
    
    async def update_participant_availability(
        self, 
        session_id: str, 
        ia_name: str, 
        is_available: bool,
        tokens_remaining: Optional[int] = None
    ):
        """Met à jour la disponibilité d'une IA"""
        session = await self.get_session(session_id)
        if not session:
            return
        
        for participant in session.config.participants:
            if participant.name == ia_name:
                participant.is_available = is_available
                if tokens_remaining is not None:
                    participant.tokens_remaining = tokens_remaining
                break
        
        await self.sessions_collection.update_one(
            {"id": session_id},
            {"$set": {"config.participants": [p.model_dump() for p in session.config.participants]}}
        )
