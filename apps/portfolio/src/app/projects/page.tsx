import { ProjectsPage } from '@/views/Projects'
import { getProjects } from '@/lib/api/server'

// Cache por 60 segundos, revalida em background
export const revalidate = 60

export default async function Projects() {
  const projects = await getProjects()
  return <ProjectsPage projects={projects} />
}

