import { AboutPage } from '@/views/About'
import { getPageBySlug } from '@/lib/api/server'

export const dynamic = 'force-dynamic'

export default async function About() {
  const pageData = await getPageBySlug('about')
  return <AboutPage pageData={pageData} />
}

