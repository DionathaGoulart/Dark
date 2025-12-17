import { ProjectPage } from '@/views/ProjectPage'
import { getProjectBySlug, getProjectImages } from '@/lib/api/server'
import { notFound } from 'next/navigation'

export const revalidate = 60

export default async function FacesOfHorrorPage() {
  const project = await getProjectBySlug('facesofhorror')
  
  if (!project) {
    notFound()
  }

  const projectImages = await getProjectImages(project.id)

  return <ProjectPage project={project} images={projectImages} />
}

