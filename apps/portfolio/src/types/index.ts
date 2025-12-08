// ================================
// MAIN TYPES EXPORT
// ================================

// Common types
export * from './common'

// Router types
export * from './router'

// Layout types
export * from './layout'

// UI types
export * from './ui'

// Feature-specific types
export * from './projects'
export * from './contact'

// Re-export feature types for convenience (avoiding conflicts)
export type {
  CloudinaryOptions as GalleryCloudinaryOptions,
  ColumnCount as GalleryColumnCount,
  ErrorStateProps as GalleryErrorStateProps,
  FolderCardProps as GalleryFolderCardProps,
  FolderGridProps as GalleryFolderGridProps,
  FolderItem as GalleryFolderItem,
  GridConfig as GalleryGridConfig,
  GridLoadingSkeletonProps as GalleryGridLoadingSkeletonProps,
  ImageCardProps as GalleryImageCardProps,
  ImageCardPropsExtended as GalleryImageCardPropsExtended,
  ImageItem as GalleryImageItem,
  ImageLoaderProps as GalleryImageLoaderProps,
  LoadingState as GalleryLoadingState,
  MasonryGridLoaderProps as GalleryMasonryGridLoaderProps,
  MasonryGridProps as GalleryMasonryGridProps,
  MasonryGridPropsExtended as GalleryMasonryGridPropsExtended,
  OptimizedUrls as GalleryOptimizedUrls
} from '../features/gallery/types'
