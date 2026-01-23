"""
F1 Apex Email Service
Uses Resend for transactional emails.

Environment Variables Required:
- RESEND_API_KEY: Your Resend API key
- SMTP_FROM_EMAIL: Sender email (must be verified in Resend)
"""

import os
import resend
from typing import Optional, List, Dict, Any
from datetime import datetime

# Initialize Resend
resend.api_key = os.environ.get("RESEND_API_KEY", "")

# Email configuration - Use a real address for better deliverability
FROM_EMAIL = os.environ.get("SMTP_FROM_EMAIL", "predictions@apexpredict.live")
FROM_NAME = os.environ.get("SMTP_FROM_NAME", "F1 Apex Predictions")
REPLY_TO_EMAIL = os.environ.get("SMTP_REPLY_TO", "support@apexpredict.live")
UNSUBSCRIBE_URL = "https://apexpredict.live/settings/notifications"

# =============================================================================
# EMAIL TEMPLATES
# =============================================================================

def get_base_template(content: str, title: str = "F1 Apex") -> str:
    """Base HTML template with F1 Apex branding."""
    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #0D1117;
            color: #F0F0F0;
            margin: 0;
            padding: 20px;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(145deg, #1A1A1F 0%, #111114 100%);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 16px;
            padding: 40px;
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .logo {{
            font-size: 28px;
            font-weight: 800;
            color: #F0F0F0;
        }}
        .logo span {{
            color: #C9A962;
        }}
        .content {{
            color: #9CA3AF;
            line-height: 1.6;
        }}
        .button {{
            display: inline-block;
            background: linear-gradient(135deg, #E10600 0%, #B00500 100%);
            color: #FFFFFF !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
        }}
        .button:hover {{
            opacity: 0.9;
        }}
        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            text-align: center;
            font-size: 12px;
            color: #6B7280;
        }}
        .accent {{
            color: #00E5FF;
        }}
        .gold {{
            color: #C9A962;
        }}
        h1, h2 {{
            color: #F0F0F0;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">F1 <span>APEX</span></div>
        </div>
        <div class="content">
            {content}
        </div>
        <div class="footer">
            <p>© {datetime.now().year} F1 Apex | Telemetry Command Center</p>
            <p style="margin-top: 10px;"><a href="https://apexpredict.live/settings/notifications" style="color: #6B7280; text-decoration: underline;">Manage email preferences</a></p>
        </div>
    </div>
</body>
</html>
"""


# =============================================================================
# EMAIL TEMPLATES BY TYPE
# =============================================================================

def template_welcome(username: str) -> str:
    """Welcome email for new users."""
    content = f"""
        <h1>Welcome to the Pit Wall, {username}! 🏎️</h1>
        <p>You've just joined the most intense F1 prediction community on the grid.</p>
        <p>Here's what you can do:</p>
        <ul>
            <li>🎯 <strong>Predict</strong> qualifying and race results</li>
            <li>🏆 <strong>Compete</strong> in leagues with friends</li>
            <li>⚔️ <strong>Challenge</strong> rivals to head-to-head battles</li>
            <li>📊 <strong>Climb</strong> the global leaderboard</li>
        </ul>
        <p style="text-align: center;">
            <a href="https://apexpredict.live/guide" class="button" style="background: linear-gradient(135deg, #C9A962 0%, #A08035 100%); color: #000 !important;">Read the Manual</a>
        </p>
        <p style="text-align: center;">
            <a href="https://apexpredict.live/calendar" style="color: #6B7280; text-decoration: underline; font-size: 12px;">Go straight to Calendar</a>
        </p>
        <p>The next race is coming up. Don't miss your chance to prove you know F1 better than anyone.</p>
        <p class="gold">See you on the grid! 🏁</p>
    """
    return get_base_template(content, "Welcome to F1 Apex")


def template_race_reminder(username: str, race_name: str, time_until: str) -> str:
    """Race prediction deadline reminder."""
    content = f"""
        <h1>⏱️ Prediction Deadline Approaching!</h1>
        <p>Hey {username},</p>
        <p>The <strong class="accent">{race_name}</strong> prediction deadline is in <strong class="gold">{time_until}</strong>.</p>
        <p>Don't let your rivals get ahead—lock in your picks now!</p>
        <p style="text-align: center;">
            <a href="https://apexpredict.live/calendar" class="button">Submit Prediction</a>
        </p>
        <p>Remember: You can't change your prediction after the session starts.</p>
    """
    return get_base_template(content, f"Deadline: {race_name}")


def template_feedback_receipt(name: str, subject: str) -> str:
    """Confirmation email for feedback submission."""
    content = f"""
        <h1>Thanks for Your Feedback! 💬</h1>
        <p>Hey {name},</p>
        <p>We've received your message regarding: <strong>"{subject}"</strong></p>
        <p>Our team reviews all feedback and uses it to improve F1 Apex. While we can't respond to every message individually, we truly appreciate you taking the time to write.</p>
        <p>If your issue is urgent, you can also reach out via our social channels.</p>
        <p class="gold">Thanks for being part of the F1 Apex community!</p>
    """
    return get_base_template(content, "Feedback Received")


def template_league_invite(inviter_name: str, league_name: str, invite_code: str) -> str:
    """League invitation email."""
    content = f"""
        <h1>You've Been Invited! 🏆</h1>
        <p><strong class="accent">{inviter_name}</strong> has invited you to join their league:</p>
        <h2 style="text-align: center; color: #C9A962;">"{league_name}"</h2>
        <p>Join the league and compete against friends to see who really knows F1 best.</p>
        <p style="text-align: center;">
            <a href="https://apexpredict.live/leagues?code={invite_code}" class="button">Accept Invitation</a>
        </p>
        <p>Or use this invite code: <strong class="accent">{invite_code}</strong></p>
    """
    return get_base_template(content, f"League Invite: {league_name}")


def template_rivalry_challenge(challenger_name: str) -> str:
    """Rivalry challenge notification."""
    content = f"""
        <h1>⚔️ You've Been Challenged!</h1>
        <p><strong class="accent">{challenger_name}</strong> wants to start a rivalry with you!</p>
        <p>A rivalry is a season-long head-to-head battle. Each race, you'll go wheel-to-wheel in the prediction standings.</p>
        <p style="text-align: center;">
            <a href="https://apexpredict.live/rivalries" class="button">View Challenge</a>
        </p>
        <p>Do you have what it takes to win?</p>
    """
    return get_base_template(content, "Rivalry Challenge")


def template_password_reset(reset_link: str) -> str:
    """Password reset email."""
    content = f"""
        <h1>Reset Your Password 🔐</h1>
        <p>We received a request to reset your F1 Apex password.</p>
        <p>Click the button below to create a new password:</p>
        <p style="text-align: center;">
            <a href="{reset_link}" class="button">Reset Password</a>
        </p>
        <p><strong>This link expires in 1 hour.</strong></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
    """
    return get_base_template(content, "Password Reset")


# =============================================================================
# EMAIL SENDING FUNCTIONS
# =============================================================================

class EmailResult:
    """Result of an email send operation."""
    def __init__(self, success: bool, message: str, email_id: Optional[str] = None):
        self.success = success
        self.message = message
        self.email_id = email_id
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "message": self.message,
            "email_id": self.email_id
        }


def send_email(
    to: str,
    subject: str,
    html_content: str,
    plain_text: Optional[str] = None,
    reply_to: Optional[str] = None,
    tags: Optional[List[Dict[str, str]]] = None
) -> EmailResult:
    """
    Send an email using Resend with deliverability best practices.
    
    Args:
        to: Recipient email address
        subject: Email subject line
        html_content: HTML content of the email
        plain_text: Optional plain text fallback (auto-generated if not provided)
        reply_to: Optional reply-to address (defaults to REPLY_TO_EMAIL)
        tags: Optional tags for tracking
    
    Returns:
        EmailResult with success status and message
    """
    if not resend.api_key:
        return EmailResult(False, "RESEND_API_KEY not configured")
    
    try:
        # Auto-generate plain text from HTML if not provided
        if not plain_text:
            import re
            # Simple HTML to text conversion
            text = re.sub(r'<style[^>]*>.*?</style>', '', html_content, flags=re.DOTALL)
            text = re.sub(r'<[^>]+>', '', text)
            text = re.sub(r'\s+', ' ', text).strip()
            plain_text = text
        
        params = {
            "from": f"{FROM_NAME} <{FROM_EMAIL}>",
            "to": [to],
            "subject": subject,
            "html": html_content,
            "text": plain_text,  # Plain text for better deliverability
            "reply_to": reply_to or REPLY_TO_EMAIL,
            "headers": {
                "List-Unsubscribe": f"<{UNSUBSCRIBE_URL}>",
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
            }
        }
        
        if tags:
            params["tags"] = tags
        
        response = resend.Emails.send(params)
        
        return EmailResult(
            success=True,
            message="Email sent successfully",
            email_id=response.get("id")
        )
    
    except Exception as e:
        return EmailResult(False, f"Failed to send email: {str(e)}")


# =============================================================================
# CONVENIENCE FUNCTIONS
# =============================================================================

def send_welcome_email(to: str, username: str) -> EmailResult:
    """Send welcome email to new user."""
    html = template_welcome(username)
    return send_email(
        to=to,
        subject="Welcome to F1 Apex! 🏎️",
        html_content=html,
        tags=[{"name": "type", "value": "welcome"}]
    )


def send_race_reminder(to: str, username: str, race_name: str, time_until: str) -> EmailResult:
    """Send race prediction deadline reminder."""
    html = template_race_reminder(username, race_name, time_until)
    return send_email(
        to=to,
        subject=f"⏱️ {time_until} until {race_name} deadline!",
        html_content=html,
        tags=[{"name": "type", "value": "reminder"}]
    )


def send_feedback_receipt(to: str, name: str, subject: str) -> EmailResult:
    """Send feedback confirmation email."""
    html = template_feedback_receipt(name, subject)
    return send_email(
        to=to,
        subject="We received your feedback!",
        html_content=html,
        tags=[{"name": "type", "value": "feedback"}]
    )


def send_league_invite(to: str, inviter_name: str, league_name: str, invite_code: str) -> EmailResult:
    """Send league invitation email."""
    html = template_league_invite(inviter_name, league_name, invite_code)
    return send_email(
        to=to,
        subject=f"🏆 {inviter_name} invited you to join {league_name}!",
        html_content=html,
        tags=[{"name": "type", "value": "league_invite"}]
    )


def send_rivalry_challenge(to: str, challenger_name: str) -> EmailResult:
    """Send rivalry challenge notification."""
    html = template_rivalry_challenge(challenger_name)
    return send_email(
        to=to,
        subject=f"⚔️ {challenger_name} challenged you to a rivalry!",
        html_content=html,
        tags=[{"name": "type", "value": "rivalry"}]
    )


def send_password_reset(to: str, reset_link: str) -> EmailResult:
    """Send password reset email."""
    html = template_password_reset(reset_link)
    return send_email(
        to=to,
        subject="Reset your F1 Apex password",
        html_content=html,
        tags=[{"name": "type", "value": "password_reset"}]
    )
