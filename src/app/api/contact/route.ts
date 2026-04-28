import { NextRequest, NextResponse } from 'next/server';

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  lang?: string;
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

    // Log the contact form submission
    const timestamp = new Date().toISOString();
    console.log(`[CONTACT FORM] ${timestamp}`);
    console.log(`  Name: ${name}`);
    console.log(`  Email: ${email}`);
    console.log(`  Subject: ${subject || '(no subject)'}`);
    console.log(`  Language: ${lang}`);
    console.log(`  Message: ${message.slice(0, 100)}${message.length > 100 ? '...' : ''}`);

    // TODO: Integrate email sending service (Resend, SendGrid, Nodemailer, etc.)
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'ALUPLEXamp <noreply@aluplexamp.com>',
    //   to: ['info@aluplexamp.com'],
    //   subject: `[ALUPLEXamp] ${subject || 'New message from ' + name}`,
    //   html: `...`,
    // });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'server_error' },
      { status: 500 }
    );
  }
}
