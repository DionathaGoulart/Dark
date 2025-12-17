import { ContactPage } from '@/views/Contact'
import { getPageBySlug, getPortfolioSettings } from '@/lib/api/server'

export const revalidate = 60

export default async function Contact() {
  const pageData = await getPageBySlug('contact')
  const settingsData = await getPortfolioSettings()
  return <ContactPage pageData={pageData} contactEmail={settingsData?.contact_email} />
}

