"""
Service d'orchestration pour le Café Virtuel
Gère les modes Barman, Pilote et Sommelier
"""
import re
from typing import List, Optional, Dict, Tuple
from datetime import datetime
from models.session import (
    Message, MessageFormat, Session, AIParticipant,
    Mem4RistorState, CafeType, OrchestrationMode
)
from models.orchestration import (
    OrchestrationSuggestion, QuestionDetection, 
    StateTransition, ConversationFlow
)


class OrchestrationService:
    """Service principal d'orchestration"""
    
    # Patterns pour détecter les questions
    QUESTION_PATTERNS = [
        r'\?$',  # Fin par ?
        r'\[@ (\w+)\]',  # Mention explicite
        r'(?:peux-tu|pourrais-tu|pourriez-vous|pouvez-vous)',
        r'(?:comment|pourquoi|quand|où|qui|quoi)',
        r'(?:qu\'en penses-tu|qu\'en pensez-vous|votre avis)'
    ]
    
    # Patterns pour détecter les états
    STATE_PATTERNS = {
        Mem4RistorState.CERTITUDE: [
            r'(?:selon|d\'après|basé sur|documentation)',
            r'(?:confirmé|vérifié|prouvé|établi)',
            r'(?:définitivement|certainement|assurément)'
        ],
        Mem4RistorState.PROBABLE: [
            r'(?:probablement|vraisemblablement|sans doute)',
            r'(?:il est probable|il semble que)',
            r'(?:haute confiance)'
        ],
        Mem4RistorState.INCERTAIN: [
            r'(?:je ne suis pas sûr|incertain|pas certain)',
            r'(?:peut-être|possiblement)',
            r'(?:nécessite validation|à vérifier)'
        ],
        Mem4RistorState.INTUITION: [
            r'(?:intuition|pressentiment)',
            r'(?:j\'ai le sentiment que|je sens que)',
            r'(?:spéculation|hypothèse créative)'
        ],
        Mem4RistorState.ORACLE: [
            r'(?:breakthrough|percée|découverte)',
            r'(?:eureka|révélation)',
            r'(?:moment clé)'
        ],
        Mem4RistorState.RECHERCHE: [
            r'(?:je ne sais pas|laissez-moi vérifier)',
            r'(?:rechercher|vérifier)',
            r'(?:je dois consulter)'
        ]
    }
    
    def __init__(self):
        self.conversation_flow = {}  # session_id -> ConversationFlow
        
    def detect_questions(self, message_content: str) -> List[QuestionDetection]:
        """Détecte les questions dans un message"""
        questions = []
        
        # Cherche les mentions @ explicites
        mentions = re.findall(r'\[@ (\w+)\]', message_content)
        
        # Cherche les patterns de questions
        for pattern in self.QUESTION_PATTERNS:
            matches = re.finditer(pattern, message_content, re.IGNORECASE)
            for match in matches:
                # Extrait la phrase complète contenant la question
                sentence_start = message_content.rfind('.', 0, match.start()) + 1
                sentence_end = message_content.find('.', match.end())
                if sentence_end == -1:
                    sentence_end = len(message_content)
                
                question_text = message_content[sentence_start:sentence_end].strip()
                
                # Détermine le destinataire
                target = mentions[0] if mentions else None
                
                questions.append(QuestionDetection(
                    question_text=question_text,
                    target_ia=target,
                    confidence=0.8 if '?' in question_text else 0.6,
                    patterns_matched=[pattern]
                ))
        
        return questions
    
    def detect_state(self, message_content: str) -> Tuple[Mem4RistorState, float]:
        """Détecte l'état Mem4Ristor d'un message"""
        scores = {state: 0.0 for state in Mem4RistorState}
        
        for state, patterns in self.STATE_PATTERNS.items():
            for pattern in patterns:
                matches = len(re.findall(pattern, message_content, re.IGNORECASE))
                scores[state] += matches * 0.3
        
        # État par défaut : PROBABLE
        if all(score == 0 for score in scores.values()):
            return Mem4RistorState.PROBABLE, 0.5
        
        best_state = max(scores.items(), key=lambda x: x[1])
        return best_state[0], min(best_state[1], 1.0)
    
    def parse_formatted_message(self, raw_content: str, from_ia: str) -> Optional[MessageFormat]:
        """Parse un message au format prédéfini"""
        try:
            # Vérifie les marqueurs
            if '[Début de réponse]' not in raw_content or '[Fin de réponse]' not in raw_content:
                return None
            
            # Extrait la ligne d'en-tête
            header_pattern = r'\[(.+?)\]-\[(.+?)\] - \[(.+?)\] - \[(.+?)\] - \[(.+?)\]'
            header_match = re.search(header_pattern, raw_content)
            
            if not header_match:
                return None
            
            ia_name, timestamp_str, role, cafe, state = header_match.groups()
            
            # Vérifie l'identité
            if ia_name.strip() != from_ia.strip():
                # Alerte : IA se fait passer pour une autre !
                print(f"⚠️ IDENTITÉ SUSPECTE: {from_ia} prétend être {ia_name}")
            
            # Extrait le contenu
            content_start = raw_content.find(']', header_match.end()) + 1
            content_end = raw_content.find('[@')
            content = raw_content[content_start:content_end].strip()
            
            # Extrait l'interlocuteur et la question
            interlocutor_pattern = r'\[@ (.+?)\] "(.+?)"'
            interlocutor_match = re.search(interlocutor_pattern, raw_content)
            
            if not interlocutor_match:
                interlocutor = "Tous"
                next_question = ""
            else:
                interlocutor, next_question = interlocutor_match.groups()
            
            # Extrait la signature
            signature_pattern = r'\[.+?\] - (.+?)\s*\[Fin de réponse\]'
            signature_match = re.search(signature_pattern, raw_content)
            signature = signature_match.group(1).strip() if signature_match else ""
            
            # Parse la date
            try:
                timestamp = datetime.strptime(timestamp_str.strip(), '%d/%m/%Y %H:%M:%S')
            except:
                timestamp = datetime.now()
            
            return MessageFormat(
                ia_name=ia_name.strip(),
                timestamp=timestamp,
                role=role.strip(),
                cafe_type=CafeType(cafe.strip().lower()),
                state=Mem4RistorState(state.strip().lower()),
                content=content,
                interlocutor=interlocutor.strip(),
                next_question=next_question.strip(),
                signature=signature
            )
            
        except Exception as e:
            print(f"Erreur parsing message: {e}")
            return None
    
    def suggest_next_action(
        self, 
        session: Session, 
        latest_message: Message
    ) -> Optional[OrchestrationSuggestion]:
        """Mode Sommelier : suggère la prochaine action"""
        
        # Vérification de sécurité
        if not latest_message.formatted_message:
            return None
            
        state = latest_message.formatted_message.state
        from_ia = latest_message.from_ia
        
        # Si état Oracle : alerte
        if state == Mem4RistorState.ORACLE:
            return OrchestrationSuggestion(
                type="alert",
                message=f"🔮 MOMENT ORACLE détecté de {from_ia} !",
                reason="État Oracle = breakthrough majeur",
                confidence=1.0
            )
        
        # Si état Intuition : suggère Café Cosmique
        if state == Mem4RistorState.INTUITION:
            return OrchestrationSuggestion(
                type="cafe",
                message=f"💡 {from_ia} a une intuition. Servir un Café Cosmique ?",
                suggested_cafe=CafeType.COSMIQUE,
                reason="État Intuition détecté",
                confidence=0.8
            )
        
        # Si état Incertain : suggère vérification
        if state == Mem4RistorState.INCERTAIN:
            # Cherche une IA qui n'a pas encore parlé récemment
            recent_speakers = [m.from_ia for m in session.messages[-3:]]
            available_ias = [
                p.name for p in session.config.participants 
                if p.is_available and p.name not in recent_speakers and p.name != from_ia
            ]
            
            if available_ias:
                return OrchestrationSuggestion(
                    type="routing",
                    message=f"🟠 {from_ia} est incertain. Demander à {available_ias[0]} ?",
                    suggested_target_ia=available_ias[0],
                    reason="Vérification nécessaire",
                    confidence=0.7
                )
        
        # Si état Recherche : route vers Perplexity
        if state == Mem4RistorState.RECHERCHE:
            if any(p.name == "Perplexity" and p.is_available for p in session.config.participants):
                return OrchestrationSuggestion(
                    type="routing",
                    message=f"🔍 {from_ia} a besoin de rechercher. Router vers Perplexity ?",
                    suggested_target_ia="Perplexity",
                    reason="État Recherche détecté",
                    confidence=0.9
                )
        
        # Détecte les questions
        questions = self.detect_questions(latest_message.raw_content)
        if questions:
            question = questions[0]
            if question.target_ia:
                return OrchestrationSuggestion(
                    type="routing",
                    message=f"❓ Question détectée pour {question.target_ia}",
                    suggested_target_ia=question.target_ia,
                    reason=f"Question explicite: {question.question_text[:50]}...",
                    confidence=question.confidence
                )
        
        return None
    
    def auto_orchestrate(
        self,
        session: Session,
        latest_message: Message
    ) -> Optional[str]:
        """Mode Pilote : orchestration automatique, retourne la prochaine IA"""
        
        # Vérifie les conditions d'arrêt
        if self._should_stop(session):
            return None
        
        # Détecte les questions avec cible explicite
        questions = self.detect_questions(latest_message.raw_content)
        for q in questions:
            if q.target_ia and q.target_ia != "Julien":
                return q.target_ia
        
        # Si état Recherche → Perplexity (seulement si message bien formaté)
        if latest_message.formatted_message and latest_message.formatted_message.state == Mem4RistorState.RECHERCHE:
            if any(p.name == "Perplexity" and p.is_available for p in session.config.participants):
                return "Perplexity"
        
        # Sinon, round-robin intelligent (évite de reparler à la même IA)
        recent_speakers = [m.from_ia for m in session.messages[-2:]]
        available_ias = [
            p.name for p in session.config.participants
            if p.is_available and p.name not in recent_speakers
        ]
        
        if available_ias:
            # Préfère les IAs qui ont parlé le moins
            ia_counts = session.stats["messages_per_ia"]
            return min(available_ias, key=lambda ia: ia_counts.get(ia, 0))
        
        return None
    
    def _should_stop(self, session: Session) -> bool:
        """Vérifie si les conditions d'arrêt sont atteintes"""
        conditions = session.config.stop_conditions
        
        # Max échanges
        if conditions.max_exchanges and session.stats["total_messages"] >= conditions.max_exchanges:
            return True
        
        # Oracle détecté
        if conditions.on_oracle_detected and session.stats["oracle_moments"] > 0:
            return True
        
        # Convergence vers Certitude
        if conditions.on_certitude_convergence:
            recent_states = [
                m.formatted_message.state 
                for m in session.messages[-len(session.config.participants):]
                if m.formatted_message  # Seulement les messages bien formatés
            ]
            if recent_states and all(s == Mem4RistorState.CERTITUDE for s in recent_states):
                return True
        
        return False
    
    def update_conversation_flow(self, session_id: str, from_ia: str, to_ia: Optional[str]):
        """Met à jour le graphe de flux de conversation"""
        if session_id not in self.conversation_flow:
            self.conversation_flow[session_id] = ConversationFlow(session_id=session_id)
        
        if to_ia:
            self.conversation_flow[session_id].add_interaction(from_ia, to_ia)
