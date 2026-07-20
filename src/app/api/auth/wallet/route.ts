import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { deriveWalletFromUserId } from '@/lib/walletDerivation'

// Returns the caller's own deterministic wallet — never accepts a
// client-supplied user id. The id always comes from the verified Supabase
// session attached to this request's own cookies, so this endpoint can
// only ever return the caller's own wallet, never anyone else's.
export async function POST() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const wallet = deriveWalletFromUserId(data.user.id)
  return NextResponse.json({ address: wallet.address, privateKey: wallet.privateKey })
}
