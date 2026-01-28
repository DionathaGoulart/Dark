'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client';
import { MainLayout } from '@/shared'
import { ArrowLeft, Trash2, Image as ImageIcon, Upload, X, ArrowUp, ArrowDown, Edit, Save } from 'lucide-react'

interface ProjectImage {
  id?: string
  project_id: string
  image_url: string
  alt_text_pt?: string
  alt_text_en?: string
  order_index: number
  is_active: boolean
  layout_type?: 'solo' | 'grid-2' | 'grid-3' | 'grid-5'
  aspect_ratio?: 'square' | 'wide' | 'portrait' | 'card' | 'cinema' | 'tall' | 'auto' | 'landscape'
  object_fit?: 'cover' | 'contain'
  grid_group_id?: string
  padding_horizontal?: number | null
  padding_vertical?: number | null
  grid_dominant_side?: 'none' | 'left' | 'right'
}

export default function ProjectImagesPage() {
  const params = useParams()
  const projectId = params.id as string
  const [loading, setLoading] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [project, setProject] = useState<any>(null)
  const [images, setImages] = useState<ProjectImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [editingImage, setEditingImage] = useState<ProjectImage | null>(null)
  const [editingGridImages, setEditingGridImages] = useState<ProjectImage[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadLayoutType, setUploadLayoutType] = useState<'solo' | 'grid-2' | 'grid-3' | 'grid-5'>('solo')
  const [uploadAspectRatio, setUploadAspectRatio] = useState<'square' | 'wide' | 'portrait' | 'card' | 'cinema' | 'tall' | 'auto' | 'landscape'>('auto')
  const [uploadObjectFit, setUploadObjectFit] = useState<'cover' | 'contain'>('cover')
  const [uploadGridDominantSide, setUploadGridDominantSide] = useState<'none' | 'left' | 'right'>('none')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    alt_text_pt: '',
    alt_text_en: '',
    layout_type: 'solo' as 'solo' | 'grid-2' | 'grid-3' | 'grid-5',
    aspect_ratio: 'auto' as 'square' | 'wide' | 'portrait' | 'card' | 'cinema' | 'tall' | 'auto' | 'landscape',
    object_fit: 'cover' as 'cover' | 'contain',
    padding_horizontal: null as number | null,
    padding_vertical: null as number | null,
    grid_dominant_side: 'none' as 'none' | 'left' | 'right'
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const loadProject = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) throw error
      setProject(data)
    } catch (error) {
      console.error('Erro ao carregar projeto:', error)
    }
  }, [projectId])

  const loadImages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_project_images')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true })

      if (error) throw error
      setImages(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar imagens:', error)
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    const getUserAndData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/login')
        return
      }
      loadProject()
      loadImages()
    }
    getUserAndData()
  }, [router, loadProject, loadImages])

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validImageTypes.includes(file.type)) {
        alert('Tipo de arquivo inválido. Use imagens (JPG, PNG, GIF, WEBP)')
        return null
      }

      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        alert('Arquivo muito grande. Tamanho máximo: 10MB')
        return null
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `project-${projectId}-${Date.now()}.${fileExt}`
      const filePath = `portfolio/projects/${projectId}/${fileName}`

      const { error } = await supabase.storage
        .from('portfolio-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Erro ao fazer upload:', error)
        throw error
      }

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-assets')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error)
      alert('Erro ao fazer upload do arquivo. Tente novamente.')
      return null
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Armazenar arquivos e abrir modal de configuração
    setPendingFiles(Array.from(files))
    setIsUploadModalOpen(true)
    e.target.value = ''
  }

  const handleConfirmUpload = async () => {
    if (pendingFiles.length === 0) return

    setUploading(true)
    setIsUploadModalOpen(false)

    try {
      // Determinar quantas imagens são necessárias para o grid
      // const gridSize = uploadLayoutType === 'grid-2' ? 2 // Removed unused variable
      //   : uploadLayoutType === 'grid-3' ? 3
      //     : uploadLayoutType === 'grid-5' ? 5
      //       : 1

      const newImages: ProjectImage[] = []
      const baseOrderIndex = images.length

      // Se for grid, agrupar imagens em grupos do tamanho especificado
      if (uploadLayoutType.startsWith('grid-')) {
        // Gerar um grid_group_id único para todas as imagens deste upload
        const generateUUID = () => {
          // Fallback para navegadores que não suportam crypto.randomUUID
          if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID()
          }
          // Fallback alternativo
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0
            const v = c === 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
          })
        }
        const gridGroupId = generateUUID()

        for (let i = 0; i < pendingFiles.length; i++) {
          const file = pendingFiles[i]
          const url = await uploadFile(file)
          if (url) {
            // Todas as imagens do grid recebem o mesmo layout_type
            newImages.push({
              project_id: projectId,
              image_url: url,
              alt_text_pt: '',
              alt_text_en: '',
              order_index: baseOrderIndex + i,
              is_active: true,
              layout_type: uploadLayoutType, // Todas recebem o mesmo layout_type
              aspect_ratio: uploadAspectRatio,
              object_fit: uploadObjectFit,
              grid_group_id: gridGroupId, // Todas as imagens do upload compartilham o mesmo grupo
              grid_dominant_side: uploadLayoutType === 'grid-2' ? uploadGridDominantSide : undefined
            })
          }
        }
      } else {
        // Solo - cada imagem é independente
        for (let i = 0; i < pendingFiles.length; i++) {
          const file = pendingFiles[i]
          const url = await uploadFile(file)
          if (url) {
            newImages.push({
              project_id: projectId,
              image_url: url,
              alt_text_pt: '',
              alt_text_en: '',
              order_index: baseOrderIndex + i,
              is_active: true,
              layout_type: 'solo',
              aspect_ratio: uploadAspectRatio,
              object_fit: uploadObjectFit,
              grid_group_id: undefined
            })
          }
        }
      }

      if (newImages.length > 0) {
        const { error } = await supabase
          .from('portfolio_project_images')
          .insert(newImages)

        if (error) throw error
        loadImages()
        alert(`${newImages.length} imagem(ns) adicionada(s) com sucesso!`)
      }
    } catch (error) {
      console.error('Erro ao processar arquivos:', error)
      alert('Erro ao processar arquivos. Tente novamente.')
    } finally {
      setUploading(false)
      setPendingFiles([])
      setUploadLayoutType('solo')
      setUploadAspectRatio('auto')
      setUploadObjectFit('cover')
      setUploadGridDominantSide('none')
    }
  }

  const handleCancelUpload = () => {
    setIsUploadModalOpen(false)
    setPendingFiles([])
    setUploadLayoutType('solo')
    setUploadAspectRatio('auto')
    setUploadObjectFit('cover')
    setUploadGridDominantSide('none')
  }

  const extractFilePathFromUrl = (url: string): string | null => {
    try {
      // Extrai o caminho do arquivo da URL do Supabase Storage
      // Formato: https://[project].supabase.co/storage/v1/object/public/portfolio-assets/portfolio/projects/[id]/filename.jpg
      const urlObj = new URL(url)
      const pathMatch = urlObj.pathname.match(/\/portfolio-assets\/(.+)/)
      if (pathMatch && pathMatch[1]) {
        return pathMatch[1]
      }
      return null
    } catch (error) {
      console.error('Erro ao extrair caminho do arquivo:', error)
      return null
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta imagem?')) {
      return
    }

    try {
      // Buscar a imagem para obter a URL antes de deletar
      const imageToDelete = images.find(img => img.id === id)
      if (!imageToDelete) {
        alert('Imagem não encontrada')
        return
      }

      // Deletar o arquivo do storage se a URL for do Supabase Storage
      if (imageToDelete.image_url && imageToDelete.image_url.includes('supabase.co/storage')) {
        const filePath = extractFilePathFromUrl(imageToDelete.image_url)
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('portfolio-assets')
            .remove([filePath])

          if (storageError) {
            console.warn('Erro ao deletar arquivo do storage:', storageError)
            // Continua mesmo se houver erro no storage para deletar do banco
          }
        }
      }

      // Deletar do banco de dados
      const { error } = await supabase
        .from('portfolio_project_images')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadImages()
      alert('Imagem removida com sucesso!')
    } catch (error) {
      console.error('Erro ao remover imagem:', error)
      alert('Erro ao remover imagem. Tente novamente.')
    }
  }

  const handleDeleteGrid = async (gridGroupId: string) => {
    if (!confirm('Tem certeza que deseja remover todo o grid? Todas as imagens do grid serão removidas.')) {
      return
    }

    try {
      // Buscar todas as imagens do grid
      const gridImages = images.filter(img => img.grid_group_id === gridGroupId)

      if (gridImages.length === 0) {
        alert('Nenhuma imagem encontrada no grid')
        return
      }

      // Deletar arquivos do storage
      const filePaths: string[] = []
      for (const img of gridImages) {
        if (img.image_url && img.image_url.includes('supabase.co/storage')) {
          const filePath = extractFilePathFromUrl(img.image_url)
          if (filePath) {
            filePaths.push(filePath)
          }
        }
      }

      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('portfolio-assets')
          .remove(filePaths)

        if (storageError) {
          console.warn('Erro ao deletar arquivos do storage:', storageError)
          // Continua mesmo se houver erro no storage
        }
      }

      // Deletar todas as imagens do grid do banco de dados
      const imageIds = gridImages.map(img => img.id).filter(Boolean) as string[]
      const { error } = await supabase
        .from('portfolio_project_images')
        .delete()
        .in('id', imageIds)

      if (error) throw error
      loadImages()
      alert(`Grid removido com sucesso! ${gridImages.length} imagem(ns) removida(s).`)
    } catch (error) {
      console.error('Erro ao remover grid:', error)
      alert('Erro ao remover grid. Tente novamente.')
    }
  }

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const index = images.findIndex(img => img.id === id)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= images.length) return

    const newImages = [...images]
    const [moved] = newImages.splice(index, 1)
    newImages.splice(newIndex, 0, moved)

    const updates = newImages.map((img, idx) => ({
      id: img.id,
      order_index: idx
    }))

    try {
      for (const update of updates) {
        if (update.id) {
          const { error } = await supabase
            .from('portfolio_project_images')
            .update({ order_index: update.order_index })
            .eq('id', update.id)

          if (error) throw error
        }
      }
      loadImages()
    } catch (error) {
      console.error('Erro ao reordenar imagens:', error)
      alert('Erro ao reordenar imagens. Tente novamente.')
    }
  }

  const handleMoveInGrid = async (id: string, direction: 'up' | 'down') => {
    const currentImage = images.find(img => img.id === id)
    if (!currentImage || !currentImage.grid_group_id) return

    // Filtrar apenas imagens do mesmo grid
    const gridImages = images
      .filter(img => img.grid_group_id === currentImage.grid_group_id)
      .sort((a, b) => a.order_index - b.order_index)

    const index = gridImages.findIndex(img => img.id === id)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= gridImages.length) return

    // Reordenar dentro do grid
    const reorderedGrid = [...gridImages]
    const [moved] = reorderedGrid.splice(index, 1)
    reorderedGrid.splice(newIndex, 0, moved)

    // Atualizar order_index apenas das imagens do grid, mantendo a ordem relativa
    // Pegar o order_index da primeira imagem do grid como base
    const baseOrderIndex = gridImages[0].order_index

    try {
      for (let i = 0; i < reorderedGrid.length; i++) {
        if (reorderedGrid[i].id) {
          const { error } = await supabase
            .from('portfolio_project_images')
            .update({ order_index: baseOrderIndex + i })
            .eq('id', reorderedGrid[i].id)

          if (error) throw error
        }
      }
      loadImages()
    } catch (error) {
      console.error('Erro ao reordenar imagens no grid:', error)
      alert('Erro ao reordenar imagens no grid. Tente novamente.')
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('portfolio_project_images')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      loadImages()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status. Tente novamente.')
    }
  }

  const openEditModal = (image: ProjectImage) => {
    setEditingImage(image)

    // Se a imagem pertence a um grid, carregar todas as imagens do grid
    if (image.grid_group_id) {
      const gridImages = images
        .filter(img => img.grid_group_id === image.grid_group_id)
        .sort((a, b) => a.order_index - b.order_index)
      setEditingGridImages(gridImages)
    } else {
      setEditingGridImages([])
    }

    setFormData({
      alt_text_pt: image.alt_text_pt || '',
      alt_text_en: image.alt_text_en || '',
      layout_type: image.layout_type || 'solo',
      aspect_ratio: image.aspect_ratio || 'auto',
      object_fit: image.object_fit || 'cover',
      padding_horizontal: image.padding_horizontal ?? null,
      padding_vertical: image.padding_vertical ?? null,
      grid_dominant_side: image.grid_dominant_side || 'none'
    })
    setIsModalOpen(true)
  }

  const closeEditModal = () => {
    setIsModalOpen(false)
    setEditingImage(null)
    setEditingGridImages([])
    setFormData({
      alt_text_pt: '',
      alt_text_en: '',
      layout_type: 'solo',
      aspect_ratio: 'auto',
      object_fit: 'cover',
      padding_horizontal: null,
      padding_vertical: null,
      grid_dominant_side: 'none'
    })
  }

  const handleSaveLayout = async () => {
    if (!editingImage?.id) return

    try {
      // Se está editando um grid, atualizar todas as imagens do grid
      if (editingGridImages.length > 0) {
        const updateData: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
          layout_type: formData.layout_type,
          aspect_ratio: formData.aspect_ratio,
          object_fit: formData.object_fit,
          padding_horizontal: formData.padding_horizontal || null,
          padding_vertical: formData.padding_vertical || null,
          grid_dominant_side: formData.layout_type === 'grid-2' ? formData.grid_dominant_side : null,
          updated_at: new Date().toISOString()
        }

        // Atualizar todas as imagens do grid com as mesmas configurações
        const imageIds = editingGridImages.map(img => img.id).filter(Boolean) as string[]

        const { error } = await supabase
          .from('portfolio_project_images')
          .update(updateData)
          .in('id', imageIds)

        if (error) throw error

        // Atualizar textos alternativos individualmente (podem ser diferentes)
        for (const img of editingGridImages) {
          if (img.id) {
            await supabase
              .from('portfolio_project_images')
              .update({
                alt_text_pt: formData.alt_text_pt || null,
                alt_text_en: formData.alt_text_en || null
              })
              .eq('id', img.id)
          }
        }

        closeEditModal()
        loadImages()
        alert(`Configurações do grid (${editingGridImages.length} imagens) salvas com sucesso!`)
        return
      }

      // Se não é grid, editar individualmente (comportamento antigo)
      const belongsToGrid = editingImage.grid_group_id !== null && editingImage.grid_group_id !== undefined
      const originalLayoutType = editingImage.layout_type || 'solo'
      const newLayoutType = formData.layout_type

      const shouldUnlinkFromGrid = belongsToGrid && (
        originalLayoutType !== newLayoutType ||
        newLayoutType === 'solo' ||
        (originalLayoutType.startsWith('grid-') && !newLayoutType.startsWith('grid-'))
      )

      const updateData: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
        alt_text_pt: formData.alt_text_pt || null,
        alt_text_en: formData.alt_text_en || null,
        layout_type: formData.layout_type,
        aspect_ratio: formData.aspect_ratio,
        object_fit: formData.object_fit,
        padding_horizontal: formData.padding_horizontal || null,
        padding_vertical: formData.padding_vertical || null,
        grid_dominant_side: formData.layout_type === 'grid-2' ? formData.grid_dominant_side : null,
        updated_at: new Date().toISOString()
      }

      if (shouldUnlinkFromGrid) {
        updateData.grid_group_id = null
        if (!newLayoutType.startsWith('grid-')) {
          updateData.layout_type = 'solo'
        }
      }

      const { error } = await supabase
        .from('portfolio_project_images')
        .update(updateData)
        .eq('id', editingImage.id)

      if (error) throw error
      closeEditModal()
      loadImages()
      alert(shouldUnlinkFromGrid
        ? 'Imagem desvinculada do grid e configurada como solo!'
        : 'Configurações de layout salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar layout:', error)
      alert('Erro ao salvar layout. Tente novamente.')
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-primary-black dark:text-primary-white">Carregando...</div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.push('/dashboard/portfolio/projects')}
          className="mb-6 flex items-center gap-2 text-primary-black dark:text-primary-white hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={20} />
          Voltar para Projetos
        </button>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary-black dark:text-primary-white mb-2">
              Imagens do Projeto
            </h1>
            <p className="text-primary-black/70 dark:text-primary-white/70">
              {project ? `${project.title_pt} (/${project.slug})` : 'Carregando...'}
            </p>
          </div>
          <div className="flex gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-6 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Adicionar Imagens
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {images.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-primary-black dark:border-primary-white rounded-lg">
              <ImageIcon size={48} className="mx-auto mb-4 text-primary-black/50 dark:text-primary-white/50" />
              <p className="text-primary-black/70 dark:text-primary-white/70 mb-4">
                Nenhuma imagem encontrada. Clique em &quot;Adicionar Imagens&quot; para começar.
              </p>
            </div>
          ) : (() => {
            // Agrupar imagens respeitando a ordem sequencial do order_index
            // Imagens solo são grupos individuais, imagens de grid são agrupadas
            // Mas mantendo a ordem global (solo, grid, solo, grid, etc.)
            const groupedImages: Array<{ groupKey: string | 'solo', images: ProjectImage[], orderIndex: number }> = []
            const processedIds = new Set<string>()

            // Processar imagens na ordem do order_index
            const sortedImages = [...images].sort((a, b) => a.order_index - b.order_index)

            sortedImages.forEach((image) => {
              // Pular se já foi processada (faz parte de um grid já processado)
              if (image.id && processedIds.has(image.id)) return

              if (image.grid_group_id) {
                // É um grid - agrupar todas as imagens do mesmo grid_group_id
                // que ainda não foram processadas
                const gridImages = sortedImages.filter(
                  img => img.grid_group_id === image.grid_group_id &&
                    img.id && !processedIds.has(img.id)
                ).sort((a, b) => a.order_index - b.order_index)

                // Marcar todas como processadas
                gridImages.forEach(img => {
                  if (img.id) processedIds.add(img.id)
                })

                // Usar o menor order_index do grid como posição na sequência
                const minOrderIndex = Math.min(...gridImages.map(img => img.order_index))

                groupedImages.push({
                  groupKey: image.grid_group_id,
                  images: gridImages,
                  orderIndex: minOrderIndex
                })
              } else {
                // É uma imagem solo - criar grupo individual
                if (image.id) processedIds.add(image.id)
                groupedImages.push({
                  groupKey: 'solo',
                  images: [image],
                  orderIndex: image.order_index
                })
              }
            })

            // Reordenar grupos pela ordem sequencial (order_index mínimo de cada grupo)
            groupedImages.sort((a, b) => a.orderIndex - b.orderIndex)

            return groupedImages.map((group, groupIndex) => {
              const { groupKey, images: groupImages } = group
              const isGrid = groupKey !== 'solo'
              const firstImage = groupImages[0]
              const layoutType = firstImage.layout_type || 'solo'
              const gridSize = layoutType === 'grid-2' ? 2 : layoutType === 'grid-3' ? 3 : layoutType === 'grid-5' ? 5 : 1

              // Criar uma chave única para cada grupo
              const uniqueKey = isGrid ? groupKey : `solo-${firstImage.id || groupIndex}`

              return (
                <div
                  key={uniqueKey}
                  className={`border-2 border-primary-black dark:border-primary-white p-6 rounded-lg ${isGrid ? 'bg-primary-black/5 dark:bg-primary-white/5' : ''}`}
                >
                  {/* Header do Grupo */}
                  {isGrid && (
                    <div className="mb-4 pb-4 border-b-2 border-primary-black/20 dark:border-primary-white/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black rounded text-sm font-semibold">
                            Grid {layoutType.replace('grid-', '')} Colunas
                          </span>
                          <span className="text-sm text-primary-black/50 dark:text-primary-white/50">
                            {groupImages.length} imagem(ns)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => firstImage.id && handleMove(firstImage.id, 'up')}
                              disabled={groupIndex === 0}
                              className="p-2 border-2 border-primary-black dark:border-primary-white rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary-black dark:hover:bg-primary-white hover:text-primary-white dark:hover:text-primary-black transition-all"
                              title="Mover grupo para cima"
                            >
                              <ArrowUp size={16} />
                            </button>
                            <button
                              onClick={() => firstImage.id && handleMove(firstImage.id, 'down')}
                              disabled={groupIndex === groupedImages.length - 1}
                              className="p-2 border-2 border-primary-black dark:border-primary-white rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary-black dark:hover:bg-primary-white hover:text-primary-black dark:hover:text-primary-white transition-all"
                              title="Mover grupo para baixo"
                            >
                              <ArrowDown size={16} />
                            </button>
                          </div>
                          <button
                            onClick={() => firstImage.grid_group_id && handleDeleteGrid(firstImage.grid_group_id)}
                            className="px-4 py-2 border-2 border-red-500 rounded hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center gap-2"
                            title="Remover grid inteiro"
                          >
                            <Trash2 size={16} />
                            Remover Grid
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-primary-black/50 dark:text-primary-white/50">
                        <span className="font-semibold">Aspect:</span> {firstImage.aspect_ratio || 'auto'} |
                        <span className="font-semibold"> Fit:</span> {firstImage.object_fit || 'cover'}
                      </div>
                    </div>
                  )}

                  {/* Imagens do Grupo */}
                  <div className={`${isGrid ? 'grid gap-4' : 'space-y-4'}`} style={isGrid ? { gridTemplateColumns: `repeat(${Math.min(gridSize, groupImages.length)}, 1fr)` } : {}}>
                    {groupImages.map((image, imageIndex) => (
                      <div
                        key={image.id}
                        className={`${isGrid ? 'relative' : 'flex items-center gap-6'} border-2 border-primary-black/30 dark:border-primary-white/30 p-4 rounded-lg`}
                      >
                        {/* Botões de reordenação - sempre visíveis, mas posicionados diferente para grid vs solo */}
                        <div className={`${isGrid ? 'absolute top-2 right-2 flex flex-row gap-1 z-10' : 'flex flex-col gap-2'}`}>
                          <button
                            onClick={() => image.id && (isGrid ? handleMoveInGrid(image.id, 'up') : handleMove(image.id, 'up'))}
                            disabled={imageIndex === 0}
                            className="p-2 border-2 border-primary-black dark:border-primary-white rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary-black dark:hover:bg-primary-white hover:text-primary-white dark:hover:text-primary-black transition-all bg-primary-white dark:bg-primary-black"
                            title={isGrid ? "Mover para cima no grid" : "Mover para cima"}
                          >
                            <ArrowUp size={16} />
                          </button>
                          <button
                            onClick={() => image.id && (isGrid ? handleMoveInGrid(image.id, 'down') : handleMove(image.id, 'down'))}
                            disabled={imageIndex === groupImages.length - 1}
                            className="p-2 border-2 border-primary-black dark:border-primary-white rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary-black dark:hover:bg-primary-white hover:text-primary-black dark:hover:text-primary-white transition-all bg-primary-white dark:bg-primary-black"
                            title={isGrid ? "Mover para baixo no grid" : "Mover para baixo"}
                          >
                            <ArrowDown size={16} />
                          </button>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-sm font-medium text-primary-black/50 dark:text-primary-white/50">
                              #{image.order_index}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${image.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                              {image.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <img // eslint-disable-line @next/next/no-img-element
                            src={image.image_url}
                            alt={image.alt_text_pt || 'Project image'}
                            className={`${isGrid ? 'w-full' : 'w-full max-w-md'} h-48 object-cover rounded border-2 border-primary-black dark:border-primary-white`}
                          />
                          <div className="mt-2 text-sm text-primary-black/70 dark:text-primary-white/70 space-y-1">
                            {image.alt_text_pt && (
                              <div>PT: {image.alt_text_pt}</div>
                            )}
                            {image.alt_text_en && (
                              <div>EN: {image.alt_text_en}</div>
                            )}
                            {!isGrid && (
                              <div className="mt-2 pt-2 border-t border-primary-black/20 dark:border-primary-white/20">
                                <div className="text-xs">
                                  <span className="font-semibold">Layout:</span> {image.layout_type || 'solo'} |
                                  <span className="font-semibold"> Aspect:</span> {image.aspect_ratio || 'auto'} |
                                  <span className="font-semibold"> Fit:</span> {image.object_fit || 'cover'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => openEditModal(image)}
                            className="px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-black dark:hover:bg-primary-white hover:text-primary-white dark:hover:text-primary-black transition-all duration-300 flex items-center gap-2"
                            title="Editar layout e textos"
                          >
                            <Edit size={16} />
                            Editar Layout
                          </button>
                          <button
                            onClick={() => image.id && handleToggleActive(image.id, image.is_active)}
                            className={`px-4 py-2 rounded text-sm ${image.is_active ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors`}
                          >
                            {image.is_active ? 'Desativar' : 'Ativar'}
                          </button>
                          <button
                            onClick={() => image.id && handleDelete(image.id)}
                            className="px-4 py-2 border-2 border-red-500 rounded hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          })()}
        </div>

        {/* Modal de Configuração de Upload */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-primary-white dark:bg-primary-black border-2 border-primary-black dark:border-primary-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                  Configurar Upload
                </h2>
                <button
                  onClick={handleCancelUpload}
                  className="p-2 hover:bg-primary-black/10 dark:hover:bg-primary-white/10 rounded transition-colors"
                >
                  <X size={24} className="text-primary-black dark:text-primary-white" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-primary-black/70 dark:text-primary-white/70 mb-4">
                    {pendingFiles.length} arquivo(s) selecionado(s)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                    Tipo de Layout
                  </label>
                  <select
                    value={uploadLayoutType}
                    onChange={(e) => setUploadLayoutType(e.target.value as 'solo' | 'grid-2' | 'grid-3' | 'grid-5')}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                  >
                    <option value="solo">Solo (Imagem única)</option>
                    <option value="grid-2">Grid 2 Colunas</option>
                    <option value="grid-3">Grid 3 Colunas</option>
                    <option value="grid-5">Grid 5 Colunas</option>
                  </select>
                  <p className="text-xs text-primary-black/50 dark:text-primary-white/50 mt-1">
                    {uploadLayoutType.startsWith('grid-')
                      ? `As ${pendingFiles.length} imagem(ns) serão agrupadas em grid(s) de ${uploadLayoutType.split('-')[1]} colunas`
                      : 'Cada imagem será exibida individualmente'}
                  </p>
                </div>

                {uploadLayoutType === 'grid-2' && (
                  <div>
                    <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                      Lado Dominante (Apenas Grid 2 Colunas)
                    </label>
                    <select
                      value={uploadGridDominantSide}
                      onChange={(e) => setUploadGridDominantSide(e.target.value as 'none' | 'left' | 'right')}
                      className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                    >
                      <option value="none">Nenhum (largura igual - 50% cada)</option>
                      <option value="left">Esquerda Dominante (esquerda maior)</option>
                      <option value="right">Direita Dominante (direita maior)</option>
                    </select>
                    <p className="text-xs text-primary-black/50 dark:text-primary-white/50 mt-1">
                      Define qual lado do grid de 2 colunas terá maior largura
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                    Aspect Ratio (Proporção)
                  </label>
                  <select
                    value={uploadAspectRatio}
                    onChange={(e) => setUploadAspectRatio(e.target.value as 'auto' | 'square' | 'wide' | 'landscape' | 'portrait' | 'card' | 'cinema' | 'tall')}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                  >
                    <option value="auto">Auto (automático)</option>
                    <option value="square">Square (1:1)</option>
                    <option value="wide">Wide (16:9)</option>
                    <option value="landscape">Landscape (4:3)</option>
                    <option value="portrait">Portrait (3:4)</option>
                    <option value="card">Card (4:5)</option>
                    <option value="cinema">Cinema (21:9)</option>
                    <option value="tall">Tall (9:16)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                    Object Fit (Ajuste)
                  </label>
                  <select
                    value={uploadObjectFit}
                    onChange={(e) => setUploadObjectFit(e.target.value as 'cover' | 'contain')}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                  >
                    <option value="cover">Cover (preencher)</option>
                    <option value="contain">Contain (conter)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCancelUpload}
                  className="px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded text-primary-black dark:text-primary-white hover:bg-primary-black/10 dark:hover:bg-primary-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Confirmar Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição de Layout */}
        {isModalOpen && editingImage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-primary-white dark:bg-primary-black border-2 border-primary-black dark:border-primary-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-primary-black dark:text-primary-white">
                    {editingGridImages.length > 0 ? 'Editar Grid' : 'Editar Layout da Imagem'}
                  </h2>
                  {editingGridImages.length > 0 && (
                    <p className="text-sm text-primary-black/60 dark:text-primary-white/60 mt-1">
                      Editando {editingGridImages.length} imagem(ns) do grid - alterações serão aplicadas a todas
                    </p>
                  )}
                </div>
                <button
                  onClick={closeEditModal}
                  className="p-2 hover:bg-primary-black/10 dark:hover:bg-primary-white/10 rounded transition-colors"
                >
                  <X size={24} className="text-primary-black dark:text-primary-white" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {editingGridImages.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-primary-black/60 dark:text-primary-white/60">
                      Preview do Grid ({editingGridImages.length} imagens):
                    </p>
                    <div className={`grid gap-2 ${editingGridImages.length === 2 ? 'grid-cols-2' : editingGridImages.length === 3 ? 'grid-cols-3' : editingGridImages.length === 5 ? 'grid-cols-5' : 'grid-cols-3'}`}>
                      {editingGridImages.map((img) => (
                        <img // eslint-disable-line @next/next/no-img-element
                          key={img.id}
                          src={img.image_url}
                          alt={img.alt_text_pt || 'Preview'}
                          className="w-full h-32 object-cover rounded border-2 border-primary-black dark:border-primary-white"
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <img // eslint-disable-line @next/next/no-img-element
                    src={editingImage.image_url}
                    alt={editingImage.alt_text_pt || 'Preview'}
                    className="w-full h-64 object-cover rounded border-2 border-primary-black dark:border-primary-white"
                  />
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                    Texto Alternativo (Português)
                  </label>
                  <input
                    type="text"
                    value={formData.alt_text_pt}
                    onChange={(e) => setFormData({ ...formData, alt_text_pt: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                    placeholder="Descrição da imagem em português"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                    Texto Alternativo (English)
                  </label>
                  <input
                    type="text"
                    value={formData.alt_text_en}
                    onChange={(e) => setFormData({ ...formData, alt_text_en: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                    placeholder="Image description in English"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                    Tipo de Layout
                  </label>
                  {editingGridImages.length > 0 ? (
                    <div>
                      <select
                        value={formData.layout_type}
                        onChange={(e) => setFormData({ ...formData, layout_type: e.target.value as 'grid-2' | 'grid-3' | 'grid-5' })}
                        className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                      >
                        <option value="grid-2">Grid 2 Colunas</option>
                        <option value="grid-3">Grid 3 Colunas</option>
                        <option value="grid-5">Grid 5 Colunas</option>
                      </select>
                      <p className="text-xs text-primary-black/50 dark:text-primary-white/50 mt-1">
                        Alterar o layout do grid afetará todas as {editingGridImages.length} imagens
                      </p>

                      {(formData.layout_type === 'grid-2') && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                            Lado Dominante (Apenas Grid 2 Colunas)
                          </label>
                          <select
                            value={formData.grid_dominant_side}
                            onChange={(e) => setFormData({ ...formData, grid_dominant_side: e.target.value as 'none' | 'left' | 'right' })}
                            className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                          >
                            <option value="none">Nenhum (largura igual - 50% cada)</option>
                            <option value="left">Esquerda Dominante (esquerda maior)</option>
                            <option value="right">Direita Dominante (direita maior)</option>
                          </select>
                          <p className="text-xs text-primary-black/50 dark:text-primary-white/50 mt-1">
                            Define qual lado do grid de 2 colunas terá maior largura
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <select
                        value={formData.layout_type}
                        onChange={(e) => setFormData({ ...formData, layout_type: e.target.value as 'solo' | 'grid-2' | 'grid-3' | 'grid-5' })}
                        className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                      >
                        <option value="solo">Solo (Imagem única)</option>
                        <option value="grid-2">Grid 2 Colunas</option>
                        <option value="grid-3">Grid 3 Colunas</option>
                        <option value="grid-5">Grid 5 Colunas</option>
                      </select>
                      {editingImage.grid_group_id && (
                        <div className="mt-2 p-3 bg-yellow-500/20 border-2 border-yellow-500 rounded">
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 font-semibold mb-1">
                            ⚠️ Esta imagem pertence a um grid
                          </p>
                          <p className="text-xs text-yellow-600 dark:text-yellow-400">
                            Ao mudar o layout, a imagem será desvinculada do grid e ficará como solo.
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-primary-black/50 dark:text-primary-white/50 mt-1">
                        Define como a imagem aparece: sozinha ou em grid com outras
                      </p>

                      {formData.layout_type === 'grid-2' && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                            Lado Dominante (Apenas Grid 2 Colunas)
                          </label>
                          <select
                            value={formData.grid_dominant_side}
                            onChange={(e) => setFormData({ ...formData, grid_dominant_side: e.target.value as 'none' | 'left' | 'right' })}
                            className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                          >
                            <option value="none">Nenhum (largura igual - 50% cada)</option>
                            <option value="left">Esquerda Dominante (esquerda maior)</option>
                            <option value="right">Direita Dominante (direita maior)</option>
                          </select>
                          <p className="text-xs text-primary-black/50 dark:text-primary-white/50 mt-1">
                            Define qual lado do grid de 2 colunas terá maior largura
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                    Aspect Ratio (Proporção)
                  </label>
                  <select
                    value={formData.aspect_ratio}
                    onChange={(e) => setFormData({ ...formData, aspect_ratio: e.target.value as 'auto' | 'square' | 'wide' | 'landscape' | 'portrait' | 'card' | 'cinema' | 'tall' })}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                  >
                    <option value="auto">Auto (automático)</option>
                    <option value="square">Square (1:1)</option>
                    <option value="wide">Wide (16:9)</option>
                    <option value="landscape">Landscape (4:3)</option>
                    <option value="portrait">Portrait (3:4)</option>
                    <option value="card">Card (4:5)</option>
                    <option value="cinema">Cinema (21:9)</option>
                    <option value="tall">Tall (9:16)</option>
                  </select>
                  <p className="text-xs text-primary-black/50 dark:text-primary-white/50 mt-1">
                    Define a proporção da imagem
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                    Object Fit (Ajuste)
                  </label>
                  <select
                    value={formData.object_fit}
                    onChange={(e) => setFormData({ ...formData, object_fit: e.target.value as 'cover' | 'contain' })}
                    className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                  >
                    <option value="cover">Cover (preencher)</option>
                    <option value="contain">Contain (conter)</option>
                  </select>
                  <p className="text-xs text-primary-black/50 dark:text-primary-white/50 mt-1">
                    Cover: preenche o espaço | Contain: mantém proporção completa
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                      Padding Lateral (px) <span className="text-xs text-primary-black/50 dark:text-primary-white/50">(opcional)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.padding_horizontal ?? ''}
                      onChange={(e) => setFormData({ ...formData, padding_horizontal: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                      placeholder="Ex: 20"
                    />
                    <p className="text-xs text-primary-black/50 dark:text-primary-white/50 mt-1">
                      Espaçamento nas laterais (esquerda e direita)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-black dark:text-primary-white mb-2">
                      Padding Vertical (px) <span className="text-xs text-primary-black/50 dark:text-primary-white/50">(opcional)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.padding_vertical ?? ''}
                      onChange={(e) => setFormData({ ...formData, padding_vertical: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded bg-transparent dark:bg-primary-black text-primary-black dark:text-primary-white [&>option]:bg-primary-white dark:[&>option]:bg-primary-black [&>option]:text-primary-black dark:[&>option]:text-primary-white"
                      placeholder="Ex: 20"
                    />
                    <p className="text-xs text-primary-black/50 dark:text-primary-white/50 mt-1">
                      Espaçamento em cima e embaixo
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 border-2 border-primary-black dark:border-primary-white rounded text-primary-black dark:text-primary-white hover:bg-primary-black/10 dark:hover:bg-primary-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveLayout}
                  className="px-4 py-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white rounded hover:bg-primary-white dark:hover:bg-primary-black hover:text-primary-black dark:hover:text-primary-white transition-all duration-300 flex items-center gap-2"
                >
                  <Save size={20} />
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

