import { PrintsPage } from '@/views/Prints'
import { getPageBySlug } from '@/lib/api/server'

export default async function Stores() {
  const pageData = await getPageBySlug('stores')
  return <PrintsPage pageData={pageData} />
}

