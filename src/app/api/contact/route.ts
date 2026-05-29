import { NextRequest, NextResponse } from 'next/server';
import { siteSettings } from '@/lib/site';

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  lang?: string;
  website?: string;
  'cf-website'?: string;
}

type SanitizedContactPayload = Required<Omit<ContactPayload, 'website' | 'cf-website'>>;

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function buildEmailHtml(data: SanitizedContactPayload, timestamp: string) {
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

function getClientIp(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function isRateLimited(key: string) {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  rateLimitStore.set(key, current);
  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateAndSanitize(body: ContactPayload): SanitizedContactPayload | NextResponse {
  const name = normalizeString(body.name);
  const email = normalizeString(body.email).toLowerCase();
  const subject = normalizeString(body.subject);
  const message = normalizeString(body.message);
  const lang = normalizeString(body.lang) || 'sk';

  if (!name || !email || !message) {
    return NextResponse.json(
      { success: false, error: 'missing_fields' },
      { status: 400 }
    );
  }

  if (name.length > 100 || email.length > 200 || subject.length > 200 || message.length > 5000) {
    return NextResponse.json(
      { success: false, error: 'field_too_long' },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { success: false, error: 'invalid_email' },
      { status: 400 }
    );
  }

  return {
    name,
    email,
    subject,
    message,
    lang: ['sk', 'en', 'de'].includes(lang) ? lang : 'sk',
  };
}

async function sendContactEmail(payload: SanitizedContactPayload, timestamp: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = (
    siteSettings.contactSettings?.formEmail ||
    process.env.CONTACT_TO_EMAIL ||
    'info@aluplexamp.com'
  )
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

    if (normalizeString(body.website) || normalizeString(body['cf-website'])) {
      return NextResponse.json({ success: true });
    }

    const ip = getClientIp(request);
    const rateLimitKey = `${ip}:${normalizeString(body.email).toLowerCase() || 'anonymous'}`;
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { success: false, error: 'rate_limited' },
        { status: 429 }
      );
    }

    const payload = validateAndSanitize(body);
    if (payload instanceof NextResponse) return payload;

    const timestamp = new Date().toISOString();
    console.log(`[CONTACT FORM] ${timestamp}`);
    console.log(`  Name: ${payload.name}`);
    console.log(`  Email: ${payload.email}`);
    console.log(`  Subject: ${payload.subject || '(no subject)'}`);
    console.log(`  Language: ${payload.lang}`);
    console.log(`  Message: ${payload.message.slice(0, 100)}${payload.message.length > 100 ? '...' : ''}`);

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
