import { SITE_URL } from '../transporter'

interface WelcomeEmailOptions {
  email: string
}

/**
 * Returns the subject line and HTML body for the welcome email
 * sent immediately after a new subscriber signs up.
 */
export function buildWelcomeEmail({ email: _email }: WelcomeEmailOptions): {
  subject: string
  html: string
} {
  const subject = 'Welcome to Sage Narrative'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f5f0;font-family:Georgia,Cambria,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f5f0;">
    <tr>
      <td align="center" style="padding:48px 16px;">

        <!-- Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header bar -->
          <tr>
            <td style="background-color:#5b6300;padding:36px 48px 32px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:700;color:#d3e056;letter-spacing:-0.3px;">
                Sage Narrative
              </p>
              <p style="margin:8px 0 0;font-size:13px;color:rgba(211,224,86,0.65);font-family:Arial,sans-serif;letter-spacing:0.05em;text-transform:uppercase;">
                Deep Insights Weekly
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 48px 32px;">

              <p style="margin:0 0 20px;font-size:28px;font-weight:700;color:#181d12;line-height:1.2;font-family:Georgia,serif;">
                Welcome — you're in.
              </p>

              <p style="margin:0 0 18px;font-size:16px;color:#464841;line-height:1.7;font-family:Arial,sans-serif;">
                Thank you for subscribing to <strong style="color:#181d12;">Sage Narrative</strong>. You've joined a community of thoughtful readers who value depth over speed, and reflection over noise.
              </p>

              <p style="margin:0 0 18px;font-size:16px;color:#464841;line-height:1.7;font-family:Arial,sans-serif;">
                Every week we publish carefully crafted essays across three disciplines:
              </p>

              <!-- Feature list -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 28px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #e0e5d2;">
                    <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:#d3e056;margin-right:12px;vertical-align:middle;"></span>
                    <span style="font-size:15px;color:#181d12;font-family:Arial,sans-serif;"><strong>Stories</strong> — Human narratives and cultural essays.</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #e0e5d2;">
                    <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:#d3e056;margin-right:12px;vertical-align:middle;"></span>
                    <span style="font-size:15px;color:#181d12;font-family:Arial,sans-serif;"><strong>Tech</strong> — The technologies quietly shaping how we live.</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:#d3e056;margin-right:12px;vertical-align:middle;"></span>
                    <span style="font-size:15px;color:#181d12;font-family:Arial,sans-serif;"><strong>Insights</strong> — Reflections on the examined life.</span>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 32px;font-size:15px;color:#767870;line-height:1.7;font-family:Arial,sans-serif;font-style:italic;">
                No noise. No filler. One email per week.
              </p>

              <!-- CTA button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-radius:100px;background-color:#5b6300;">
                    <a href="${SITE_URL}/blog"
                       target="_blank"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;letter-spacing:0.01em;">
                      Read the latest essays
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 48px;">
              <div style="height:1px;background-color:#e0e5d2;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px 32px;">
              <p style="margin:0;font-size:12px;color:#767870;line-height:1.6;font-family:Arial,sans-serif;">
                You're receiving this because you subscribed at <a href="${SITE_URL}" style="color:#5b6300;text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, '')}</a>.
                You can unsubscribe at any time by replying to this email with "unsubscribe".
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#9a9b93;font-family:Arial,sans-serif;">
                © ${new Date().getFullYear()} Sage Narrative. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, html }
}
