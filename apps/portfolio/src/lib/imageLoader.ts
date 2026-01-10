import { ImageLoaderProps } from 'next/image'

export default function supabaseLoader({ src, width, quality }: ImageLoaderProps) {
  // If the image is not from supabase storage, return as is (or handle other sources if needed)
  if (!src.includes(' supabase.co/storage/v1/object/public')) {
      return src
  }

  // Supabase Storage supports image transformations via query params
  // https://supabase.com/docs/guides/storage/image-transformations
  const params = new URLSearchParams()
  params.set('width', width.toString())
  params.set('quality', (quality || 75).toString())
  params.set('format', 'origin') // Use origin format but resized, or 'webp' if we want to force it. Next/image usually asks for webp via Accept header if unoptimized, but with loader we control URL. 
  // Actually, Supabase 'format=origin' keeps original. If we want webp, we should specify.
  // Next.js Image component handles format negotation if we don't force it in the URL, BUT since we are using a loader,
  // we are generating the URL that the browser fetches.
  // Let's force webp for better compression if not SVG.
  
  if (!src.endsWith('.svg')) {
      params.set('format', 'webp')
  }

  return `${src}?${params.toString()}`
}
