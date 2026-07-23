import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-server'

// Uses the service-role client, not the anon-key one — this table has RLS
// enabled with no policies (see supabase/migrations/002_otp_codes.sql), so
// the anon key genuinely cannot read or write it. Only this route (and
// verify-otp) can touch OTP codes, which is the point: nothing client-side
// should ever be able to list pending codes.
export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const supabase = createServiceRoleClient()

  // Delete old codes for this email
  await supabase.from('otp_codes').delete().eq('email', email)

  // Store new code
  const { error: dbError } = await supabase.from('otp_codes').insert({ email, code, expires_at })

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  // Send email via Resend
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Tipflow <noreply@tipflow.xyz>',
      to: email,
      subject: 'Your Tipflow login code',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 20px">
          <h1 style="font-size:24px;color:#111;margin-bottom:8px">Your login code</h1>
          <p style="color:#666;margin-bottom:32px">Enter this code to sign in to Tipflow:</p>
          <div style="background:#f5f5f5;border-radius:12px;padding:32px;text-align:center;margin-bottom:32px">
            <span style="font-size:48px;font-weight:900;letter-spacing:12px;color:#F97316">
              ${code}
            </span>
          </div>
          <p style="color:#999;font-size:13px">This code expires in 10 minutes.</p>
          <p style="color:#999;font-size:13px">If you did not request this, ignore this email.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:32px 0"/>
          <p style="color:#ccc;font-size:12px">Tipflow — Tip any streamer. Instantly.</p>
        </div>
      `,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    return NextResponse.json({ error: err.message || 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
