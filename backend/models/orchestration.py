"""
Modèles pour l'orchestration intelligente
"""
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
from .session import Mem4RistorState, CafeType


class OrchestrationSuggestion(BaseModel):
    """Suggestion du mode Sommelier"""
    type: str  # "cafe", "routing", "stop", "alert"
    message: str
    suggested_cafe: Optional[CafeType] = None
    suggested_target_ia: Optional[str] = None
    reason: str
    confidence: float  # 0.0 à 1.0
    timestamp: datetime = datetime.now()


class QuestionDetection(BaseModel):
    """Question détectée dans un message"""
    question_text: str
    target_ia: Optional[str] = None  # @ qui la question est posée
    confidence: float
    patterns_matched: List[str]  # Patterns regex qui ont matché


class StateTransition(BaseModel):
    """Transition d'état détectée"""
    ia_name: str
    previous_state: Optional[Mem4RistorState]
    new_state: Mem4RistorState
    message_id: str
    timestamp: datetime = datetime.now()
    
    def should_trigger_action(self) -> Optional[str]:
        """Détermine si cette transition nécessite une action"""
        if self.new_state == Mem4RistorState.ORACLE:
            return "alert_oracle"
        elif self.new_state == Mem4RistorState.INCERTAIN:
            return "suggest_verification"
        elif self.new_state == Mem4RistorState.INTUITION:
            return "suggest_cosmique"
        elif self.new_state == Mem4RistorState.RECHERCHE:
            return "route_to_perplexity"
        return None


class ConversationFlow(BaseModel):
    """Flux de conversation entre IAs"""
    session_id: str
    edges: List[Dict[str, str]] = []  # {"from": "ChatGPT", "to": "Claude", "count": 5}
    
    def add_interaction(self, from_ia: str, to_ia: str):
        """Ajoute une interaction au graphe"""
        edge = next((e for e in self.edges if e["from"] == from_ia and e["to"] == to_ia), None)
        if edge:
            edge["count"] = int(edge["count"]) + 1
        else:
            self.edges.append({"from": from_ia, "to": to_ia, "count": "1"})
    
    def get_most_active_pair(self) -> Optional[Dict[str, str]]:
        """Retourne la paire d'IAs la plus active"""
        if not self.edges:
            return None
        return max(self.edges, key=lambda e: int(e["count"]))


class SessionStatistics(BaseModel):
    """Statistiques détaillées d'une session"""
    session_id: str
    total_messages: int = 0
    messages_per_ia: Dict[str, int] = {}
    
    # États Mem4Ristor
    states_distribution: Dict[str, int] = {
        "certitude": 0,
        "probable": 0,
        "incertain": 0,
        "intuition": 0,
        "oracle": 0,
        "recherche": 0
    }
    
    # Moments clés
    oracle_moments: List[Dict] = []  # {"ia": "name", "timestamp": "...", "message_id": "..."}
    state_transitions: List[StateTransition] = []
    
    # Questions
    questions_detected: int = 0
    questions_by_ia: Dict[str, int] = {}
    
    # Cafés servis
    cafes_served: Dict[str, int] = {
        "expresso": 0,
        "long": 0,
        "cosmique": 0,
        "gourmand": 0
    }
    
    # Flux de conversation
    conversation_flow: ConversationFlow
    
    # Durée
    duration_minutes: float = 0.0
    
    def to_pitch_format(self) -> str:
        """Format pour pitch à Musk/Altman"""
        return f"""
# Session {self.session_id} - Statistiques

## Participation
- **Total de messages**: {self.total_messages}
- **IAs actives**: {len(self.messages_per_ia)}
- **Distribution par IA**:
{chr(10).join(f"  - {ia}: {count} messages" for ia, count in self.messages_per_ia.items())}

## États Mem4Ristor
- 🟢 **Certitude**: {self.states_distribution['certitude']}
- 🟡 **Probable**: {self.states_distribution['probable']}
- 🟠 **Incertain**: {self.states_distribution['incertain']}
- 🔵 **Intuition**: {self.states_distribution['intuition']}
- 🔮 **Oracle**: {self.states_distribution['oracle']} ⭐
- 🔍 **Recherche**: {self.states_distribution['recherche']}

## Moments Oracle ⭐
{chr(10).join(f"- {m['ia']} à {m['timestamp']}" for m in self.oracle_moments)}

## Collaboration
- **Questions détectées**: {self.questions_detected}
- **Cafés servis**:
  - ☕ Expresso: {self.cafes_served['expresso']}
  - ☕ Long: {self.cafes_served['long']}
  - ☕ Cosmique: {self.cafes_served['cosmique']}
  - 🍰 Gourmand: {self.cafes_served['gourmand']}

## Durée
⏱️ {self.duration_minutes:.1f} minutes

---
*"Ce soir, nous avons prouvé que {len(self.messages_per_ia)} IAs + 1 barman > somme des parties."*
"""
