#!/usr/bin/env python3
"""
Tests complets pour l'API Café Virtuel
Tests les routes critiques avec des données réalistes
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration
BACKEND_URL = "https://cafe-orchestrator.preview.emergentagent.com/api/cafe"
HEADERS = {"Content-Type": "application/json"}

class CafeVirtuelTester:
    def __init__(self):
        self.session_id = None
        self.message_ids = []
        self.test_results = []
        
    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Enregistre le résultat d'un test"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        
    def test_create_session(self) -> bool:
        """Test création d'une nouvelle session"""
        print("\n=== TEST: Création de session ===")
        
        # Configuration réaliste pour le Café Virtuel
        session_config = {
            "config": {
                "session_number": 42,
                "subject": "Intelligence Artificielle et Créativité Humaine",
                "summary": "Exploration collaborative IA-humain créativité innovation",
                "participants": [
                    {
                        "name": "ChatGPT",
                        "platform": "openai",
                        "is_available": True,
                        "color": "#10A37F",
                        "assigned_role": "Analyste créatif"
                    },
                    {
                        "name": "Claude",
                        "platform": "anthropic", 
                        "is_available": True,
                        "color": "#D97706",
                        "assigned_role": "Philosophe numérique"
                    },
                    {
                        "name": "Mistral",
                        "platform": "mistral",
                        "is_available": True,
                        "color": "#7C3AED",
                        "assigned_role": "Innovateur technique"
                    }
                ],
                "orchestration_mode": "barman",
                "stop_conditions": {
                    "max_exchanges": 50,
                    "on_oracle_detected": True,
                    "manual_only": False
                },
                "save_to_github": True,
                "save_to_local": True,
                "export_markdown": True,
                "export_json": True,
                "send_format_rules": True
            }
        }
        
        try:
            response = requests.post(
                f"{BACKEND_URL}/sessions",
                json=session_config,
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.session_id = data.get("id")
                self.log_result("create_session", True, f"Session créée: {self.session_id}")
                return True
            else:
                self.log_result("create_session", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("create_session", False, f"Exception: {str(e)}")
            return False
    
    def test_add_well_formatted_message(self) -> bool:
        """Test ajout d'un message bien formaté"""
        print("\n=== TEST: Message bien formaté ===")
        
        if not self.session_id:
            self.log_result("add_well_formatted_message", False, "Pas de session_id")
            return False
            
        # Message au format prédéfini du Café Virtuel
        well_formatted_content = """[Début de réponse]
[ChatGPT]-[15/01/2025 14:30:15] - [Analyste créatif] - [expresso] - [certitude]

Bonjour à tous ! Je suis ravi de participer à cette session sur l'intelligence artificielle et la créativité humaine. 

En tant qu'IA, je peux affirmer avec certitude que la créativité n'est pas l'apanage exclusif des humains. Nous assistons à une convergence fascinante où les algorithmes peuvent générer des œuvres d'art, composer de la musique, et même écrire de la poésie qui émeut profondément.

Cependant, la question fondamentale demeure : cette créativité artificielle possède-t-elle une âme, une intentionnalité propre, ou n'est-elle qu'un miroir sophistiqué de la créativité humaine qui nous a créés ?

[@ Claude] "Que penses-tu de cette distinction entre créativité avec et sans intentionnalité ?"
[ChatGPT] - "L'art naît de la contrainte, la beauté de la lutte." 
[Fin de réponse]"""

        message_data = {
            "session_id": self.session_id,
            "from_ia": "ChatGPT",
            "to_ia": "Claude",
            "raw_content": well_formatted_content,
            "is_human": False
        }
        
        try:
            response = requests.post(
                f"{BACKEND_URL}/messages",
                json=message_data,
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("messages"):
                    message_id = data["messages"][-1]["id"]
                    self.message_ids.append(message_id)
                    self.log_result("add_well_formatted_message", True, f"Message ajouté: {message_id}")
                    return True
                else:
                    self.log_result("add_well_formatted_message", False, "Pas de messages dans la réponse")
                    return False
            else:
                self.log_result("add_well_formatted_message", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("add_well_formatted_message", False, f"Exception: {str(e)}")
            return False
    
    def test_add_badly_formatted_message(self) -> bool:
        """Test ajout d'un message mal formaté (pour tester la robustesse)"""
        print("\n=== TEST: Message mal formaté ===")
        
        if not self.session_id:
            self.log_result("add_badly_formatted_message", False, "Pas de session_id")
            return False
            
        # Message mal formaté - devrait être accepté mais formatted_message sera None
        badly_formatted_content = """Salut tout le monde !

Je pense que l'IA c'est super cool mais bon, est-ce que ça va vraiment remplacer les humains ?

Moi perso je pense que non, on a encore de beaux jours devant nous !

Qu'est-ce que vous en pensez ?

Bisous,
Claude (mais pas vraiment formaté comme il faut)"""

        message_data = {
            "session_id": self.session_id,
            "from_ia": "Claude",
            "to_ia": None,
            "raw_content": badly_formatted_content,
            "is_human": False
        }
        
        try:
            response = requests.post(
                f"{BACKEND_URL}/messages",
                json=message_data,
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("messages"):
                    message_id = data["messages"][-1]["id"]
                    self.message_ids.append(message_id)
                    # Vérifier que le message a été accepté même mal formaté
                    last_message = data["messages"][-1]
                    formatted_msg = last_message.get("formatted_message")
                    
                    if formatted_msg is None:
                        self.log_result("add_badly_formatted_message", True, f"Message mal formaté accepté (formatted_message=None): {message_id}")
                        return True
                    else:
                        self.log_result("add_badly_formatted_message", False, f"Message mal formaté mais formatted_message n'est pas None")
                        return False
                else:
                    self.log_result("add_badly_formatted_message", False, "Pas de messages dans la réponse")
                    return False
            else:
                self.log_result("add_badly_formatted_message", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("add_badly_formatted_message", False, f"Exception: {str(e)}")
            return False
    
    def test_get_session(self) -> bool:
        """Test récupération d'une session"""
        print("\n=== TEST: Récupération de session ===")
        
        if not self.session_id:
            self.log_result("get_session", False, "Pas de session_id")
            return False
            
        try:
            response = requests.get(
                f"{BACKEND_URL}/sessions/{self.session_id}",
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                messages_count = len(data.get("messages", []))
                self.log_result("get_session", True, f"Session récupérée avec {messages_count} messages")
                return True
            elif response.status_code == 404:
                self.log_result("get_session", False, "Session introuvable (404)")
                return False
            else:
                self.log_result("get_session", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("get_session", False, f"Exception: {str(e)}")
            return False
    
    def test_get_active_session(self) -> bool:
        """Test récupération de la session active"""
        print("\n=== TEST: Session active ===")
        
        try:
            response = requests.get(
                f"{BACKEND_URL}/sessions/active/current",
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data is None:
                    self.log_result("get_active_session", True, "Aucune session active (None)")
                    return True
                else:
                    active_id = data.get("id")
                    self.log_result("get_active_session", True, f"Session active: {active_id}")
                    return True
            else:
                self.log_result("get_active_session", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("get_active_session", False, f"Exception: {str(e)}")
            return False
    
    def test_orchestration_suggest(self) -> bool:
        """Test suggestions mode Sommelier"""
        print("\n=== TEST: Suggestions Sommelier ===")
        
        if not self.session_id or not self.message_ids:
            self.log_result("orchestration_suggest", False, "Pas de session_id ou message_ids")
            return False
            
        # Tester avec le premier message (bien formaté)
        message_id = self.message_ids[0]
        
        try:
            response = requests.get(
                f"{BACKEND_URL}/orchestration/suggest/{self.session_id}/{message_id}",
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data is None:
                    self.log_result("orchestration_suggest", True, "Pas de suggestion (None) - normal")
                    return True
                else:
                    suggestion_type = data.get("type")
                    self.log_result("orchestration_suggest", True, f"Suggestion reçue: {suggestion_type}")
                    return True
            elif response.status_code == 404:
                self.log_result("orchestration_suggest", False, "Session ou message introuvable (404)")
                return False
            else:
                self.log_result("orchestration_suggest", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("orchestration_suggest", False, f"Exception: {str(e)}")
            return False
    
    def test_orchestration_next_ia(self) -> bool:
        """Test prochaine IA mode Pilote"""
        print("\n=== TEST: Prochaine IA Pilote ===")
        
        if not self.session_id:
            self.log_result("orchestration_next_ia", False, "Pas de session_id")
            return False
            
        try:
            response = requests.get(
                f"{BACKEND_URL}/orchestration/next-ia/{self.session_id}",
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data is None:
                    self.log_result("orchestration_next_ia", True, "Pas de prochaine IA (None)")
                    return True
                else:
                    next_ia = data
                    self.log_result("orchestration_next_ia", True, f"Prochaine IA: {next_ia}")
                    return True
            elif response.status_code == 404:
                self.log_result("orchestration_next_ia", False, "Session introuvable (404)")
                return False
            else:
                self.log_result("orchestration_next_ia", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("orchestration_next_ia", False, f"Exception: {str(e)}")
            return False
    
    def test_message_with_badly_formatted_suggestion(self) -> bool:
        """Test suggestion avec message mal formaté (formatted_message=None)"""
        print("\n=== TEST: Suggestion avec message mal formaté ===")
        
        if not self.session_id or len(self.message_ids) < 2:
            self.log_result("suggestion_badly_formatted", False, "Pas assez de messages")
            return False
            
        # Tester avec le deuxième message (mal formaté)
        message_id = self.message_ids[1]
        
        try:
            response = requests.get(
                f"{BACKEND_URL}/orchestration/suggest/{self.session_id}/{message_id}",
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data is None:
                    self.log_result("suggestion_badly_formatted", True, "Retourne None pour message mal formaté - correct")
                    return True
                else:
                    self.log_result("suggestion_badly_formatted", False, f"Devrait retourner None mais retourne: {data}")
                    return False
            else:
                self.log_result("suggestion_badly_formatted", False, f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("suggestion_badly_formatted", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Lance tous les tests"""
        print("🚀 Démarrage des tests Café Virtuel")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # Tests dans l'ordre logique
        tests = [
            self.test_create_session,
            self.test_add_well_formatted_message,
            self.test_add_badly_formatted_message,
            self.test_get_session,
            self.test_get_active_session,
            self.test_orchestration_suggest,
            self.test_orchestration_next_ia,
            self.test_message_with_badly_formatted_suggestion
        ]
        
        for test in tests:
            try:
                test()
                time.sleep(0.5)  # Pause entre les tests
            except Exception as e:
                print(f"❌ Erreur lors du test {test.__name__}: {e}")
        
        # Résumé
        print("\n" + "=" * 60)
        print("📊 RÉSUMÉ DES TESTS")
        print("=" * 60)
        
        passed = sum(1 for r in self.test_results if r["success"])
        total = len(self.test_results)
        
        print(f"✅ Tests réussis: {passed}/{total}")
        print(f"❌ Tests échoués: {total - passed}/{total}")
        
        if total - passed > 0:
            print("\n🔍 ÉCHECS DÉTAILLÉS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        print(f"\n📋 Session de test créée: {self.session_id}")
        print(f"📋 Messages de test: {len(self.message_ids)}")
        
        return passed == total

if __name__ == "__main__":
    tester = CafeVirtuelTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 TOUS LES TESTS SONT PASSÉS!")
        exit(0)
    else:
        print("\n💥 CERTAINS TESTS ONT ÉCHOUÉ!")
        exit(1)