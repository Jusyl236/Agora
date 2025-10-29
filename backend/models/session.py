"""
Modèles de données pour les sessions du Café Virtuel
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class CafeType(str, Enum):
    """Types de cafés disponibles"""
    EXPRESSO = "expresso"
    LONG = "long"
    COSMIQUE = "cosmique"
    GOURMAND = "gourmand"


class Mem4RistorState(str, Enum):
    """États Mem4Ristor"""
    CERTITUDE = "certitude"
    PROBABLE = "probable"
    INCERTAIN = "incertain"
    INTUITION = "intuition"
    ORACLE = "oracle"
    RECHERCHE = "recherche"


class OrchestrationMode(str, Enum):
    """Modes d'orchestration"""
    BARMAN = "barman"  # Contrôle manuel total
    PILOTE = "pilote"  # Orchestration automatique
    SOMMELIER = "sommelier"  # Suggestions validables


class MessageFormat(BaseModel):
    """Format prédéfini des messages"""
    ia_name: str
    timestamp: datetime
    role: str  # Rôle en 3-4 mots
    cafe_type: CafeType
    state: Mem4RistorState
    content: str
    interlocutor: str  # @ qui le message est adressé
    next_question: str  # Question pour la suite
    signature: str  # Signature ou mot d'esprit
    
    def to_formatted_string(self) -> str:
        """Convertit en format texte prédéfini"""
        lines = [
            "[Début de réponse]",
            f"[{self.ia_name}]-[{self.timestamp.strftime('%d/%m/%Y %H:%M:%S')}] - [{self.role}] - [{self.cafe_type.value}] - [{self.state.value}]",
            "",
            self.content,
            "",
            f"[@ {self.interlocutor}] \"{self.next_question}\"",
            f"[{self.ia_name}] - {self.signature}",
            "[Fin de réponse]"
        ]
        return "\n".join(lines)


class Message(BaseModel):
    """Message dans une session"""
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    session_id: str
    from_ia: str  # Nom de l'IA source
    to_ia: Optional[str] = None  # Destinataire (si spécifié)
    formatted_message: MessageFormat
    raw_content: str  # Contenu brut capturé
    timestamp: datetime = Field(default_factory=datetime.now)
    is_human: bool = False  # True si message de Julien
    detected_questions: List[str] = []  # Questions détectées automatiquement
    metadata: Dict[str, Any] = {}


class AIParticipant(BaseModel):
    """IA participante à une session"""
    name: str
    platform: str  # chatgpt, claude, mistral, etc.
    is_available: bool = True
    tab_id: Optional[str] = None
    is_local: bool = False  # True pour Ollama/LM Studio
    tokens_remaining: Optional[int] = None  # Estimation des tokens restants
    color: str = "#000000"
    logo_url: Optional[str] = None
    assigned_role: Optional[str] = None  # Rôle libre (peut changer)


class StopCondition(BaseModel):
    """Conditions d'arrêt du Mode Pilote"""
    max_exchanges: Optional[int] = None
    on_oracle_detected: bool = False
    on_certitude_convergence: bool = False
    manual_only: bool = True


class SessionConfig(BaseModel):
    """Configuration d'une session"""
    session_number: int
    subject: str
    summary: str  # Résumé en 10 mots
    participants: List[AIParticipant]
    orchestration_mode: OrchestrationMode = OrchestrationMode.BARMAN
    stop_conditions: StopCondition = Field(default_factory=StopCondition)
    
    # Sauvegardes
    save_to_github: bool = True
    github_auto_interval: int = 15  # minutes
    save_to_email: bool = False
    save_to_local: bool = True
    
    # Formats d'export
    export_markdown: bool = True
    export_json: bool = True
    export_html: bool = False
    export_pdf: bool = False
    
    # Briefing
    send_format_rules: bool = True
    send_cafe_definitions: bool = True
    send_state_definitions: bool = True
    
    # Fichier de règles
    rules_file_path: str = "/app/backend/config/cafe_rules.txt"


class Session(BaseModel):
    """Session complète du Café Virtuel"""
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    config: SessionConfig
    messages: List[Message] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    status: str = "active"  # active, paused, completed
    
    # Statistiques
    stats: Dict[str, Any] = {
        "total_messages": 0,
        "messages_per_ia": {},
        "states_distribution": {},
        "oracle_moments": 0,
        "questions_detected": 0
    }


class SessionTemplate(BaseModel):
    """Template de session pré-configuré"""
    name: str
    description: str
    default_participants: List[str]  # Noms des IAs
    default_cafe_type: CafeType
    orchestration_mode: OrchestrationMode
    suggested_subject: str
