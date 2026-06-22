// src/modules/email/email.service.ts
import { Resend } from 'resend';
import config from '../../config';

const FROM_EMAIL = 'our nara <hello@our-nara.com>';

// Lazy client — only instantiated when a key is present, so the server starts fine without it
function getClient(): Resend | null {
  if (!config.resendApiKey || config.resendApiKey.startsWith('re_REPLACE')) {
    console.warn('[EmailService] RESEND_API_KEY not configured — emails will be skipped.');
    return null;
  }
  return new Resend(config.resendApiKey);
}


// ─── Email Templates ────────────────────────────────────────────────────────

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>our nara</title>
</head>
<body style="margin:0;padding:0;background-color:#fafaf8;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafaf8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#ffffff;border-radius:16px 16px 0 0;padding:28px 36px;border-bottom:1px solid #f0eee9;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-family:Georgia,serif;font-size:18px;letter-spacing:0.12em;color:#1a1a1a;font-weight:400;">our nara</span>
                  </td>
                  <td align="right">
                    <span style="font-size:11px;color:#aaa;letter-spacing:0.08em;">CONSCIOUS BEAUTY</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:36px 36px 28px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f5f4f0;border-radius:0 0 16px 16px;padding:20px 36px;text-align:center;">
              <p style="margin:0 0 6px;font-size:11px;color:#aaa;">
                You're receiving this email because you have an account with our nara.
              </p>
              <p style="margin:0;font-size:11px;color:#bbb;">
                © ${new Date().getFullYear()} our nara · All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function welcomeTemplate(firstName: string): string {
  return baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a1a;letter-spacing:-0.02em;">
      Welcome to our nara, ${firstName}! 🌿
    </h1>
    <p style="margin:0 0 20px;font-size:14px;color:#666;line-height:1.7;">
      We're so glad you're here. Your account has been created and you're all set to explore our curated collection of premium K-Beauty skincare.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
      <tr>
        <td>
          <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#888;letter-spacing:0.1em;text-transform:uppercase;">What you can do next</p>
          <ul style="margin:0;padding-left:18px;font-size:13px;color:#555;line-height:2;">
            <li>Take our Skin Quiz for personalized recommendations</li>
            <li>Explore our curated skincare collections</li>
            <li>Save items to your wishlist</li>
            <li>Enjoy free shipping on orders over ₹999</li>
          </ul>
        </td>
      </tr>
    </table>

    <table cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <a href="http://localhost:3000/products"
             style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;font-size:13px;font-weight:600;padding:14px 32px;border-radius:100px;letter-spacing:0.02em;">
            Start Shopping →
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:28px 0 0;font-size:12px;color:#aaa;line-height:1.6;">
      Questions? Reply to this email or visit our help center.<br />
      <span style="color:#c8b89a;">With care, the our nara team ♥</span>
    </p>
  `);
}

function loginAlertTemplate(firstName: string, loginTime: string, email: string): string {
  return baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1a1a1a;letter-spacing:-0.02em;">
      New Sign-In Detected
    </h1>
    <p style="margin:0 0 20px;font-size:14px;color:#666;line-height:1.7;">
      Hi ${firstName}, we noticed a new sign-in to your our nara account.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
      <tr>
        <td style="padding-bottom:10px;border-bottom:1px solid #ebe9e4;">
          <p style="margin:0;font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:0.08em;">Account</p>
          <p style="margin:4px 0 0;font-size:13px;color:#333;font-weight:500;">${email}</p>
        </td>
      </tr>
      <tr>
        <td style="padding-top:10px;">
          <p style="margin:0;font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:0.08em;">Time</p>
          <p style="margin:4px 0 0;font-size:13px;color:#333;font-weight:500;">${loginTime}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px;font-size:13px;color:#666;line-height:1.7;">
      If this was you, no action needed. If you didn't sign in, please change your password immediately.
    </p>

    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-right:12px;">
          <a href="http://localhost:3000/profile"
             style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;font-size:13px;font-weight:600;padding:12px 28px;border-radius:100px;">
            Secure My Account
          </a>
        </td>
        <td>
          <a href="http://localhost:3000/auth/login"
             style="display:inline-block;border:1.5px solid #ddd;color:#555;text-decoration:none;font-size:13px;font-weight:500;padding:12px 28px;border-radius:100px;">
            It was me
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:28px 0 0;font-size:12px;color:#aaa;">
      <span style="color:#c8b89a;">our nara team ♥</span>
    </p>
  `);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export class EmailService {
  /**
   * Send a welcome email after successful registration.
   */
  static async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    const client = getClient();
    if (!client) return;
    try {
      await client.emails.send({
        from: FROM_EMAIL,
        to,
        replyTo: 'theournara@gmail.com',
        subject: `Welcome to our nara, ${firstName}! 🌿`,
        html: welcomeTemplate(firstName),
      });
      console.log(`[EmailService] Welcome email sent to ${to}`);
    } catch (err) {
      // Non-blocking — log but don't throw
      console.error('[EmailService] Failed to send welcome email:', err);
    }
  }

  /**
   * Send a login notification email.
   */
  static async sendLoginAlert(to: string, firstName: string): Promise<void> {
    const client = getClient();
    if (!client) return;
    try {
      const loginTime = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'short',
      });
      await client.emails.send({
        from: FROM_EMAIL,
        to,
        replyTo: 'theournara@gmail.com',
        subject: 'New sign-in to your our nara account',
        html: loginAlertTemplate(firstName, loginTime, to),
      });
      console.log(`[EmailService] Login alert sent to ${to}`);
    } catch (err) {
      console.error('[EmailService] Failed to send login alert:', err);
    }
  }
}
