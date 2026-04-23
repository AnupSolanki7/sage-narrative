import { SITE_URL } from '../transporter'

interface NewPostEmailOptions {
  title: string
  excerpt?: string
  slug: string
  authorName?: string
  coverImage?: string
  category?: string
  readingTime?: number
}

/**
 * Returns the subject line and HTML body for the new-post notification
 * email sent to all active subscribers when a post is published.
 */
export function buildNewPostEmail({
  title,
  excerpt,
  slug,
  authorName,
  coverImage,
  category,
  readingTime,
}: NewPostEmailOptions): { subject: string; html: string } {
  const subject = `New essay: ${title}`
  const postUrl = `${SITE_URL}/blog/${slug}`
  const categoryLabel = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : 'Essay'

  const coverImageBlock = coverImage
    ? `
        <!-- Cover image -->
        <tr>
          <td style="padding:0;">
            <a href="${postUrl}" target="_blank" style="display:block;">
              <img src="${coverImage}"
                   alt="${title.replace(/"/g, '&quot;')}"
                   width="560"
                   style="display:block;width:100%;height:auto;border-radius:0;"
              />
            </a>
          </td>
        </tr>`
    : ''

  const readTimeLabel =
    readingTime && readingTime > 0 ? ` · ${readingTime} min read` : ''

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f0;font-family:Georgia,Cambria,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f5f0;">
    <tr>
      <td align="center" style="padding:48px 16px;">

        <!-- Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background-color:#5b6300;padding:24px 48px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0;font-family:Georgia,serif;font-size:18px;font-weight:700;color:#d3e056;">
                      Sage Narrative
                    </p>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;background-color:rgba(211,224,86,0.15);border:1px solid rgba(211,224,86,0.3);border-radius:100px;padding:4px 12px;font-size:11px;color:#d3e056;font-family:Arial,sans-serif;letter-spacing:0.08em;text-transform:uppercase;">
                      New ${categoryLabel}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${coverImageBlock}

          <!-- Body -->
          <tr>
            <td style="padding:40px 48px 16px;">

              <p style="margin:0 0 6px;font-size:11px;color:#767870;letter-spacing:0.1em;text-transform:uppercase;font-family:Arial,sans-serif;">
                ${categoryLabel}${authorName ? ` · ${authorName}` : ''}${readTimeLabel}
              </p>

              <h1 style="margin:0 0 18px;font-size:26px;font-weight:700;color:#181d12;line-height:1.25;font-family:Georgia,serif;">
                <a href="${postUrl}" target="_blank" style="color:#181d12;text-decoration:none;">
                  ${title}
                </a>
              </h1>

              ${
                excerpt
                  ? `<p style="margin:0 0 28px;font-size:16px;color:#464841;line-height:1.7;font-family:Arial,sans-serif;">
                  ${excerpt}
                </p>`
                  : ''
              }

              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:8px;">
                <tr>
                  <td style="border-radius:100px;background-color:#5b6300;">
                    <a href="${postUrl}"
                       target="_blank"
                       style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;">
                      Read now →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:24px 48px 0;">
              <div style="height:1px;background-color:#e0e5d2;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 48px 32px;">
              <p style="margin:0;font-size:12px;color:#767870;line-height:1.6;font-family:Arial,sans-serif;">
                You're receiving this because you subscribed to <a href="${SITE_URL}" style="color:#5b6300;text-decoration:none;">Sage Narrative</a>.
                Reply "unsubscribe" to stop receiving emails.
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
