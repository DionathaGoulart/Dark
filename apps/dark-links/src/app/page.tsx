import { HomePage } from '@/views/Home'
import { getSettings, getLinkCards } from '@/lib/api/server'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const settings = await getSettings()
  const cards = await getLinkCards()

  return <HomePage settings={settings} cards={cards} />
}

