"""
Routes API pour les sessions du Café Virtuel
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

from models.session import Session, SessionConfig, Message, AIParticipant, MessageFormat
from models.orchestration import OrchestrationSuggestion, SessionStatistics
from services.session_service import SessionService
from services.orchestration import OrchestrationService
from services.export_service import ExportService


router = APIRouter(prefix="/api/cafe", tags=["cafe_virtuel"])

# Services globaux (à initialiser avec la DB)
session_service: Optional[SessionService] = None
orchestration_service = OrchestrationService()
export_service = ExportService()


def init_services(db: AsyncIOMotorDatabase):
    """Initialise les services avec la DB"""
    global session_service
    session_service = SessionService(db)


# ============================================
# GESTION DES SESSIONS
# ============================================

class CreateSessionRequest(BaseModel):
    """Requête de création de session"""
    config: SessionConfig


@router.post("/sessions", response_model=Session)
async def create_session(request: CreateSessionRequest):
    """Crée une nouvelle session"""
    if not session_service:
        raise HTTPException(500, "Service non initialisé")
    
    session = await session_service.create_session(request.config)
    
    # Envoie le briefing automatique (simulé pour Phase 1)
    # TODO PHASE 2: Envoyer vraiment via l'extension Chrome
    
    return session


@router.get("/sessions/{session_id}", response_model=Session)
async def get_session(session_id: str):
    """Récupère une session"""
    if not session_service:
        raise HTTPException(500, "Service non initialisé")
    
    session = await session_service.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session introuvable")
    
    return session


@router.get("/sessions", response_model=List[Session])
async def list_sessions(limit: int = 50, status: Optional[str] = None):
    """Liste les sessions"""
    if not session_service:
        raise HTTPException(500, "Service non initialisé")
    
    return await session_service.list_sessions(limit, status)


@router.get("/sessions/active/current", response_model=Optional[Session])
async def get_active_session():
    """Récupère la session active"""
    if not session_service:
        raise HTTPException(500, "Service non initialisé")
    
    return await session_service.get_active_session()


@router.post("/sessions/{session_id}/pause")
async def pause_session(session_id: str):
    """Met une session en pause"""
    if not session_service:
        raise HTTPException(500, "Service non initialisé")
    
    await session_service.pause_session(session_id)
    return {"status": "paused"}


@router.post("/sessions/{session_id}/resume")
async def resume_session(session_id: str):
    """Reprend une session"""
    if not session_service:
        raise HTTPException(500, "Service non initialisé")
    
    await session_service.resume_session(session_id)
    return {"status": "resumed"}


@router.post("/sessions/{session_id}/complete")
async def complete_session(session_id: str):
    """Termine une session"""
    if not session_service:
        raise HTTPException(500, "Service non initialisé")
    
    await session_service.complete_session(session_id)
    return {"status": "completed"}


@router.get("/sessions/search/{query}", response_model=List[Session])
async def search_sessions(query: str):
    """Recherche dans les sessions"""
    if not session_service:
        raise HTTPException(500, "Service non initialisé")
    
    return await session_service.search_sessions(query)


# ============================================
# GESTION DES MESSAGES
# ============================================

class AddMessageRequest(BaseModel):
    """Requête d'ajout de message"""
    session_id: str
    from_ia: str
    to_ia: Optional[str] = None
    raw_content: str
    is_human: bool = False
    conversation_url: Optional[str] = None


@router.post("/messages", response_model=Session)
async def add_message(request: AddMessageRequest):
    """Ajoute un message à une session"""
    if not session_service:
        raise HTTPException(500, "Service non initialisé")
    
    # Parse le message
    formatted = orchestration_service.parse_formatted_message(
        request.raw_content, 
        request.from_ia
    )
    
    if not formatted:
        raise HTTPException(400, "Format de message invalide")
    
    # Détecte les questions
    questions = orchestration_service.detect_questions(request.raw_content)
    
    # Crée le message
    metadata = {}
    if request.conversation_url:
        metadata["conversation_url"] = request.conversation_url

    message = Message(
        session_id=request.session_id,
        from_ia=request.from_ia,
        to_ia=request.to_ia,
        formatted_message=formatted,
        raw_content=request.raw_content,
        is_human=request.is_human,
        detected_questions=[q.question_text for q in questions],
        metadata=metadata
    )
    
    # Ajoute à la session
    session = await session_service.add_message(request.session_id, message)
    
    # Met à jour le flux de conversation
    orchestration_service.update_conversation_flow(
        request.session_id, 
        request.from_ia, 
        request.to_ia
    )
    
    return session


# ============================================
# ORCHESTRATION
# ============================================

@router.get("/orchestration/suggest/{session_id}/{message_id}", response_model=Optional[OrchestrationSuggestion])
async def get_suggestion(session_id: str, message_id: str):
    """Mode Sommelier : obtient une suggestion"""
    if not session_service:
        raise HTTPException(500, "Service non initialisé")
    
    session = await session_service.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session introuvable")
    
    # Trouve le message
    message = next((m for m in session.messages if m.id == message_id), None)
    if not message:
        raise HTTPException(404, "Message introuvable")
    
    suggestion = orchestration_service.suggest_next_action(session, message)
    return suggestion


@router.get("/orchestration/next-ia/{session_id}", response_model=Optional[str])
async def get_next_ia(session_id: str):
    """Mode Pilote : obtient la prochaine IA à qui parler"""
    if not session_service:
        raise HTTPException(500, "Service non initialisé")
    
    session = await session_service.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session introuvable")
    
    if not session.messages:
        return None
    
    latest_message = session.messages[-1]
    next_ia = orchestration_service.auto_orchestrate(session, latest_message)
    
    return next_ia


# ============================================
# STATISTIQUES
# ============================================

@router.get("/stats/{session_id}", response_model=SessionStatistics)
async def get_session_statistics(session_id: str):
    """Obtient les statistiques d'une session"""
    if not session_service:
        raise HTTPException(500, "Service non initialisé")
    
    return await session_service.get_session_statistics(session_id)


@router.get("/stats/{session_id}/pitch")
async def get_pitch_format(session_id: str):
    """Obtient les stats au format pitch"""
    if not session_service:
        raise HTTPException(500, "Service non initialisé")
    
    stats = await session_service.get_session_statistics(session_id)
    return {"pitch": stats.to_pitch_format()}


# ============================================
# EXPORTS
# ============================================

@router.post("/export/{session_id}/local")
async def export_to_local(session_id: str, formats: List[str] = ["markdown", "json"]):
    """Exporte une session localement"""
    if not session_service:
        raise HTTPException(500, "Service non initialisé")
    
    session = await session_service.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session introuvable")
    
    stats = await session_service.get_session_statistics(session_id)
    saved_files = await export_service.save_to_local(session, stats, formats)
    
    return {"saved_files": saved_files}


@router.post("/export/{session_id}/github")
async def export_to_github(session_id: str):
    """Exporte une session sur GitHub"""
    if not session_service:
        raise HTTPException(500, "Service non initialisé")
    
    session = await session_service.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session introuvable")
    
    stats = await session_service.get_session_statistics(session_id)
    result = await export_service.save_to_github(session, stats)
    
    if result:
        return {"status": "success", "file": result}
    else:
        return {"status": "warning", "message": "GitHub non configuré"}


@router.post("/export/{session_id}/email")
async def export_to_email(session_id: str, recipient: str = "cafevirtuel.coop@gmail.com"):
    """Envoie une session par email"""
    if not session_service:
        raise HTTPException(500, "Service non initialisé")
    
    session = await session_service.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session introuvable")
    
    stats = await session_service.get_session_statistics(session_id)
    
    # TODO PHASE 2: Configurer SMTP
    smtp_config = None
    
    success = await export_service.send_to_email(session, stats, recipient, smtp_config)
    
    if success:
        return {"status": "sent"}
    else:
        return {"status": "failed", "message": "Configuration SMTP manquante"}


# ============================================
# PARTICIPANTS
# ============================================

@router.put("/sessions/{session_id}/participants/{ia_name}/availability")
async def update_participant_availability(
    session_id: str, 
    ia_name: str, 
    is_available: bool,
    tokens_remaining: Optional[int] = None
):
    """Met à jour la disponibilité d'une IA"""
    if not session_service:
        raise HTTPException(500, "Service non initialisé")
    
    await session_service.update_participant_availability(
        session_id, ia_name, is_available, tokens_remaining
    )
    
    return {"status": "updated"}


# ============================================
# CONFIGURATION
# ============================================

@router.get("/config/rules")
async def get_cafe_rules():
    """Récupère les règles du café"""
    try:
        with open("/app/backend/config/cafe_rules.txt", "r", encoding="utf-8") as f:
            rules = f.read()
        return {"rules": rules}
    except Exception as e:
        raise HTTPException(500, f"Erreur lecture des règles: {e}")


@router.put("/config/rules")
async def update_cafe_rules(rules: str):
    """Met à jour les règles du café"""
    try:
        with open("/app/backend/config/cafe_rules.txt", "w", encoding="utf-8") as f:
            f.write(rules)
        return {"status": "updated"}
    except Exception as e:
        raise HTTPException(500, f"Erreur sauvegarde des règles: {e}")


@router.post("/briefing/send")
async def send_briefing_to_ias():
    """Envoie le briefing manuel aux IAs (via extension Chrome)
    Note: Cette route déclenche juste une notification.
    Le frontend devra envoyer via l'extension Chrome.
    """
    try:
        rules = await get_cafe_rules()
        return {"status": "ready", "rules": rules}
    except Exception as e:
        raise HTTPException(500, f"Erreur récupération des règles: {e}")

