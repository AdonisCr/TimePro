<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation à rejoindre une équipe</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f3f4f6;">
    <table cellpadding="0" cellspacing="0" style="width: 100%; max-width: 560px; margin: 40px auto;">
        <tr>
            <td style="background: linear-gradient(135deg, #00B4DB, #0083B0); padding: 40px 32px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Time Pro</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">Invitation à rejoindre <strong>{{ $invitation->team->name }}</strong></p>
            </td>
        </tr>
        <tr>
            <td style="background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">Bonjour,</p>
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                    <strong>{{ $invitation->inviter->name }}</strong> vous invite à rejoindre l'équipe <strong>{{ $invitation->team->name }}</strong> sur Time Pro.
                </p>
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                    Cliquez sur le bouton ci-dessous pour accepter l'invitation :
                </p>
                <div style="text-align: center; margin: 24px 0;">
                    <a href="{{ $acceptUrl }}" style="background: #00B4DB; color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                        Accepter l'invitation
                    </a>
                </div>
                <p style="color: #9ca3af; font-size: 14px; margin: 24px 0 0; text-align: center;">
                    Ce lien expire dans 7 jours. Si vous n'avez pas de compte, vous pourrez en créer un.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
