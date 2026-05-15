import { NextRequest, NextResponse } from 'next/server';

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  lang?: string;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function buildEmailHtml(data: Required<ContactPayload>, timestamp: string) {
  const rows = [
    ['Name', data.name],
    ['Email', data.email],
    ['Subject', data.subject || '(no subject)'],
    ['Language', data.lang],
    ['Submitted', timestamp],
  ];

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#171717">
      <h1 style="font-size:20px;margin:0 0 16px">New ALUPLEXamp inquiry</h1>
      <table style="border-collapse:collapse;margin-bottom:20px">
        <tbody>
          ${rows
            .map(
              ([label, value]) => `
                <tr>
                  <td style="padding:6px 12px 6px 0;color:#666;font-weight:700">${escapeHtml(label)}</td>
                  <td style="padding:6px 0">${escapeHtml(value)}</td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
      <h2 style="font-size:16px;margin:0 0 8px">Message</h2>
      <div style="white-space:pre-wrap;border:1px solid #e5e5e5;border-radius:8px;padding:14px;background:#fafafa">${escapeHtml(data.message)}</div>
    </div>
  `;
}

async function sendContactEmail(payload: Required<ContactPayload>, timestamp: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.CONTACT_TO_EMAIL || 'info@aluplex.sk')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);
  const from = process.env.CONTACT_FROM_EMAIL || 'ALUPLEXamp <onboarding@resend.dev>';

  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('missing_resend_api_key');
    }

    console.log('[CONTACT FORM] RESEND_API_KEY is not set; skipping email in development.');
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: payload.email,
      subject: `[ALUPLEXamp] ${payload.subject || `New inquiry from ${payload.name}`}`,
      html: buildEmailHtml(payload, timestamp),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[CONTACT FORM] Resend failed:', response.status, errorText);
    throw new Error('email_send_failed');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactPayload = await request.json();

    // Validate required fields
    if (!body.name?.trim() || !body.email?.trim() || !body.message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'missing_fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'invalid_email' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const name = body.name.trim().slice(0, 100);
    const email = body.email.trim().slice(0, 200);
    const subject = (body.subject || '').trim().slice(0, 200);
    const message = body.message.trim().slice(0, 5000);
    const lang = body.lang || 'sk';
    const payload = { name, email, subject, message, lang };

    const timestamp = new Date().toISOString();
    console.log(`[CONTACT FORM] ${timestamp}`);
    console.log(`  Name: ${name}`);
    console.log(`  Email: ${email}`);
    console.log(`  Subject: ${subject || '(no subject)'}`);
    console.log(`  Language: ${lang}`);
    console.log(`  Message: ${message.slice(0, 100)}${message.length > 100 ? '...' : ''}`);

    await sendContactEmail(payload, timestamp);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CONTACT FORM] Server error:', error);
    return NextResponse.json(
      { success: false, error: 'server_error' },
      { status: 500 }
    );
  }
}
