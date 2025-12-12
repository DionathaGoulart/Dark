import { PrintsPage } from '@/views/Prints'
import { getPageBySlug, getStoreCards } from '@/lib/api/server'

export default async function Stores() {
  const pageData = await getPageBySlug('stores')
  const storeCards = await getStoreCards()
  return <PrintsPage pageData={pageData} storeCards={storeCards} />
}

