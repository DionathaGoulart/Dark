import { ProjectPage } from '@/views/ProjectPage'
import { getProjectBySlug, getProjectImages } from '@/lib/api/server'
import { notFound } from 'next/navigation'

export const revalidate = 60

export default async function ProjectSlugPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  
  if (!project) {
    notFound()
  }

  const projectImages = await getProjectImages(project.id)

  return <ProjectPage project={project} images={projectImages} />
}

