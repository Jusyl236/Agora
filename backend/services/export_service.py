"""
Service d'export et sauvegarde des sessions
"""
import os
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from typing import Optional
from datetime import datetime
from pathlib import Path
from models.session import Session
from models.orchestration import SessionStatistics


class ExportService:
    """Service d'export des sessions"""
    
    def __init__(self):
        self.export_dir = Path("/app/exports")
        self.export_dir.mkdir(exist_ok=True)
    
    def export_to_markdown(self, session: Session, stats: Optional[SessionStatistics] = None) -> str:
        """Exporte une session en Markdown"""
        md_lines = []
        
        # En-tête
        md_lines.append(f"# Session {session.config.session_number} - {session.config.subject}")
        md_lines.append(f"\n**Date**: {session.created_at.strftime('%d/%m/%Y %H:%M')}")
        md_lines.append(f"**Résumé**: {session.config.summary}")
        md_lines.append(f"\n## Participants\n")
        
        for p in session.config.participants:
            status = "✅" if p.is_available else "❌"
            md_lines.append(f"- {status} **{p.name}** ({p.platform})")
        
        md_lines.append(f"\n---\n")
        md_lines.append(f"\n## Transcript de la session\n")
        
        # Messages
        for msg in session.messages:
            fm = msg.formatted_message
            
            # Emoji pour l'état
            state_emoji = {
                "certitude": "🟢",
                "probable": "🟡",
                "incertain": "🟠",
                "intuition": "🔵",
                "oracle": "🔮",
                "recherche": "🔍"
            }
            
            emoji = state_emoji.get(fm.state.value, "⚪")
            
            md_lines.append(f"\n### {emoji} [{fm.ia_name}] - {fm.timestamp.strftime('%H:%M:%S')}")
            md_lines.append(f"**Rôle**: {fm.role} | **Café**: {fm.cafe_type.value} | **État**: {fm.state.value}\n")
            md_lines.append(fm.content)
            md_lines.append(f"\n> [@ {fm.interlocutor}] \"{fm.next_question}\"")
            md_lines.append(f"\n*— {fm.signature}*\n")
            md_lines.append("---\n")
        
        # Statistiques si fournies
        if stats:
            md_lines.append("\n## Statistiques de la session\n")
            md_lines.append(stats.to_pitch_format())
        
        return "\n".join(md_lines)
    
    def export_to_json(self, session: Session) -> str:
        """Exporte une session en JSON"""
        return json.dumps(session.model_dump(), indent=2, default=str, ensure_ascii=False)
    
    def export_to_html(self, session: Session, stats: Optional[SessionStatistics] = None) -> str:
        """Exporte une session en HTML"""
        # Template HTML simple mais élégant
        html = f"""
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Session {session.config.session_number} - {session.config.subject}</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
        }}
        .message {{
            background: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            border-left: 4px solid #ccc;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .message.certitude {{ border-left-color: #10b981; }}
        .message.probable {{ border-left-color: #fbbf24; }}
        .message.incertain {{ border-left-color: #f97316; }}
        .message.intuition {{ border-left-color: #3b82f6; }}
        .message.oracle {{ border-left-color: #8b5cf6; }}
        .message.recherche {{ border-left-color: #6b7280; }}
        .message-header {{
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
        }}
        .ia-name {{
            font-weight: bold;
            font-size: 1.1em;
        }}
        .metadata {{
            color: #6b7280;
            font-size: 0.9em;
        }}
        .content {{
            line-height: 1.6;
            margin-bottom: 15px;
        }}
        .question {{
            background: #f3f4f6;
            padding: 10px;
            border-radius: 4px;
            font-style: italic;
        }}
        .signature {{
            text-align: right;
            color: #6b7280;
            font-style: italic;
        }}
        .stats {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>☕ Session {session.config.session_number}: {session.config.subject}</h1>
        <p><strong>Date:</strong> {session.created_at.strftime('%d/%m/%Y %H:%M')}</p>
        <p><strong>Résumé:</strong> {session.config.summary}</p>
    </div>
    
    <h2>Participants</h2>
    <ul>
"""
        
        for p in session.config.participants:
            status = "✅" if p.is_available else "❌"
            html += f"        <li>{status} <strong>{p.name}</strong> ({p.platform})</li>\n"
        
        html += "    </ul>\n\n    <h2>Transcript</h2>\n"
        
        for msg in session.messages:
            fm = msg.formatted_message
            state_class = fm.state.value
            
            html += f"""
    <div class="message {state_class}">
        <div class="message-header">
            <div class="ia-name">{fm.ia_name}</div>
            <div class="metadata">
                {fm.timestamp.strftime('%H:%M:%S')} | {fm.role} | ☕ {fm.cafe_type.value} | {fm.state.value}
            </div>
        </div>
        <div class="content">
            {fm.content.replace(chr(10), '<br>')}
        </div>
        <div class="question">
            → [@ {fm.interlocutor}] "{fm.next_question}"
        </div>
        <div class="signature">
            — {fm.signature}
        </div>
    </div>
"""
        
        if stats:
            html += f"""
    <div class="stats">
        <h2>Statistiques</h2>
        <pre>{stats.to_pitch_format()}</pre>
    </div>
"""
        
        html += """
</body>
</html>
"""
        return html
    
    async def save_to_local(
        self, 
        session: Session, 
        stats: Optional[SessionStatistics] = None,
        formats: list = ["markdown", "json"]
    ) -> dict:
        """Sauvegarde locale"""
        saved_files = {}
        
        session_dir = self.export_dir / f"session_{session.config.session_number}"
        session_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        base_name = f"{session.config.subject[:30]}_{timestamp}"
        
        if "markdown" in formats:
            md_content = self.export_to_markdown(session, stats)
            md_file = session_dir / f"{base_name}.md"
            md_file.write_text(md_content, encoding='utf-8')
            saved_files["markdown"] = str(md_file)
        
        if "json" in formats:
            json_content = self.export_to_json(session)
            json_file = session_dir / f"{base_name}.json"
            json_file.write_text(json_content, encoding='utf-8')
            saved_files["json"] = str(json_file)
        
        if "html" in formats:
            html_content = self.export_to_html(session, stats)
            html_file = session_dir / f"{base_name}.html"
            html_file.write_text(html_content, encoding='utf-8')
            saved_files["html"] = str(html_file)
        
        return saved_files
    
    async def save_to_github(
        self,
        session: Session,
        stats: Optional[SessionStatistics] = None,
        repo_path: str = "/app/cafe_virtuel_repo"
    ):
        """Sauvegarde automatique sur GitHub"""
        # Note: Cette fonction nécessite que le repo soit déjà cloné et configuré
        # Pour la PHASE 1, on simule juste la sauvegarde locale
        
        repo_dir = Path(repo_path)
        if not repo_dir.exists():
            print(f"⚠️ Repo GitHub non configuré: {repo_path}")
            return None
        
        session_dir = repo_dir / f"session{session.config.session_number}"
        session_dir.mkdir(exist_ok=True)
        
        # Génère le Markdown
        md_content = self.export_to_markdown(session, stats)
        
        # Nom du fichier selon le format de Julien
        timestamp = session.updated_at.strftime('%Y%m%d_%H%M%S')
        filename = f"[Session {session.config.session_number}] - {timestamp} - {session.config.subject} - {session.config.summary}.md"
        
        md_file = session_dir / filename
        md_file.write_text(md_content, encoding='utf-8')
        
        # Commit automatique (nécessite git configuré)
        try:
            os.system(f"cd {repo_path} && git add .")
            os.system(f"cd {repo_path} && git commit -m 'Session {session.config.session_number} - {timestamp}'")
            # os.system(f"cd {repo_path} && git push")  # Désactivé pour sécurité
            print(f"✅ Session sauvegardée dans le repo GitHub: {md_file}")
            return str(md_file)
        except Exception as e:
            print(f"❌ Erreur lors du commit GitHub: {e}")
            return None
    
    async def send_to_email(
        self,
        session: Session,
        stats: Optional[SessionStatistics] = None,
        recipient: str = "cafevirtuel.coop@gmail.com",
        smtp_config: Optional[dict] = None
    ):
        """Envoie la session par email"""
        if not smtp_config:
            print("⚠️ Configuration SMTP manquante")
            return False
        
        try:
            # Prépare le message
            msg = MIMEMultipart()
            msg['From'] = smtp_config.get('sender', 'cafe.virtuel@emergent.sh')
            msg['To'] = recipient
            msg['Subject'] = f"[Session {session.config.session_number}] - {session.created_at.strftime('%d/%m/%Y %H:%M')} - {session.config.subject} - {session.config.summary}"
            
            # Corps en Markdown
            md_content = self.export_to_markdown(session, stats)
            msg.attach(MIMEText(md_content, 'plain', 'utf-8'))
            
            # Pièce jointe JSON
            json_content = self.export_to_json(session)
            attachment = MIMEApplication(json_content.encode('utf-8'))
            attachment.add_header('Content-Disposition', 'attachment', 
                                filename=f"session_{session.config.session_number}.json")
            msg.attach(attachment)
            
            # Envoi
            with smtplib.SMTP(smtp_config['host'], smtp_config['port']) as server:
                server.starttls()
                server.login(smtp_config['username'], smtp_config['password'])
                server.send_message(msg)
            
            print(f"✅ Email envoyé à {recipient}")
            return True
            
        except Exception as e:
            print(f"❌ Erreur lors de l'envoi de l'email: {e}")
            return False
