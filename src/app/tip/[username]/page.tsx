import TipCardLoader from '@/components/fan/TipCardLoader'
import { getStreamerByUsername } from '@/lib/streamers'

export default async function TipPage({ params }: { params: { username: string } }) {
  const streamer = await getStreamerByUsername(params.username)

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center p-4">
      <TipCardLoader username={params.username} initialStreamer={streamer} />
    </main>
  )
}
