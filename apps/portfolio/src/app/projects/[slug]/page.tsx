import { ProjectPage } from '@/views/ProjectPage'
import { getProjectBySlug, getProjectImages } from '@/lib/api/server'
import { notFound } from 'next/navigation'

export default async function ProjectSlugPage({
  params
}: {
  params: { slug: string }
}) {
  const project = await getProjectBySlug(params.slug)
  
  if (!project) {
    notFound()
  }

  const projectImages = await getProjectImages(project.id)

  return <ProjectPage project={project} images={projectImages} />
}

