import { ContactPage } from '@/views/Contact'
import { getPageBySlug } from '@/lib/api/server'

export default async function Contact() {
  const pageData = await getPageBySlug('contact')
  return <ContactPage pageData={pageData} />
}

