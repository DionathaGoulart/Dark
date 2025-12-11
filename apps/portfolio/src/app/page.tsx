import { HomePage } from '@/views/Home'
import { getHomeImages } from '@/lib/api/server'

export default async function Home() {
  const homeImages = await getHomeImages()
  return <HomePage homeImages={homeImages} />
}
