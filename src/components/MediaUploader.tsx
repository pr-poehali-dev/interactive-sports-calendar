import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface MediaFile {
  id?: number;
  type: 'image' | 'video';
  name: string;
  url: string;
}

interface MediaUploaderProps {
  eventId: number;
  existingMedia?: MediaFile[];
  onMediaUpdate?: (media: MediaFile[]) => void;
  isReadOnly?: boolean;
}

export function MediaUploader({ eventId, existingMedia = [], onMediaUpdate, isReadOnly = false }: MediaUploaderProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(existingMedia);
  const [isUploading, setIsUploading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMediaFiles(existingMedia);
    setImageErrors(new Set());
  }, [JSON.stringify(existingMedia)]);

  const images = mediaFiles.filter(f => f.type === 'image');
  const videos = mediaFiles.filter(f => f.type === 'video');
  console.log('[MediaUploader] render', { eventId, mediaFiles, images: images.length, existingMedia });

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const prevImage = useCallback(() => {
    setLightboxIndex(i => (i !== null ? (i - 1 + images.length) % images.length : null));
  }, [images.length]);

  const nextImage = useCallback(() => {
    setLightboxIndex(i => (i !== null ? (i + 1) % images.length : null));
  }, [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, prevImage, nextImage]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'video') => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadedMedia: MediaFile[] = [];

      for (const file of files) {
        const reader = new FileReader();
        const fileContent = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(file);
        });

        const response = await fetch('https://functions.poehali.dev/d33abef9-76df-4869-9223-096e3c85c33f', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_id: eventId,
            file_type: fileType,
            file_name: file.name,
            file_data: fileContent,
            mime_type: file.type
          })
        });

        const result = await response.json();

        if (result.success) {
          uploadedMedia.push({
            id: result.id,
            type: fileType,
            name: result.file_name,
            url: result.url
          });
        }
      }

      const updatedMedia = [...mediaFiles, ...uploadedMedia];
      setMediaFiles(updatedMedia);
      onMediaUpdate?.(updatedMedia);

      toast({
        title: "Файлы загружены",
        description: `Загружено ${uploadedMedia.length} файл(ов)`
      });
    } catch {
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить файлы",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = (index: number) => {
    const updatedMedia = mediaFiles.filter((_, i) => i !== index);
    setMediaFiles(updatedMedia);
    onMediaUpdate?.(updatedMedia);
  };

  return (
    <div className="space-y-6">
      {!isReadOnly && (
        <>
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Icon name="Image" size={18} className="text-blue-600" />
              Фотографии мероприятия
            </Label>
            <input
              type="file"
              multiple
              accept="image/*"
              disabled={isUploading}
              onChange={(e) => handleFileUpload(e, 'image')}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                cursor-pointer disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              {isUploading ? 'Загрузка...' : 'Загрузите фотографии с мероприятия (JPG, PNG)'}
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Icon name="Video" size={18} className="text-purple-600" />
              Видеоматериалы
            </Label>
            <input
              type="file"
              multiple
              accept="video/*"
              disabled={isUploading}
              onChange={(e) => handleFileUpload(e, 'video')}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-50 file:text-purple-700
                hover:file:bg-purple-100
                cursor-pointer disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              {isUploading ? 'Загрузка...' : 'Загрузите видео с мероприятия (MP4, MOV)'}
            </p>
          </div>
        </>
      )}

      {images.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Icon name="Image" size={18} className="text-blue-600" />
            Загруженные фотографии ({images.length})
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((media, i) => (
              <div key={media.url} className="relative group">
                {imageErrors.has(media.url) ? (
                  <div className="w-full h-32 bg-muted rounded-lg border-2 border-gray-200 flex items-center justify-center">
                    <Icon name="ImageOff" size={32} className="text-muted-foreground" />
                  </div>
                ) : (
                  <img
                    src={media.url}
                    alt={media.name}
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer"
                    onClick={() => openLightbox(i)}
                    onError={() => {
                      setImageErrors(prev => new Set(prev).add(media.url));
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => openLightbox(i)}
                  >
                    <Icon name="Maximize2" size={16} />
                  </Button>
                  {!isReadOnly && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveMedia(mediaFiles.findIndex(m => m.url === media.url))}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1 truncate">{media.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Icon name="Video" size={18} className="text-purple-600" />
            Загруженные видео ({videos.length})
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((media, i) => (
              <div key={i} className="relative group">
                <video
                  src={media.url}
                  controls
                  className="w-full h-48 rounded-lg border-2 border-gray-200"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-gray-600 truncate flex-1">{media.name}</p>
                  {!isReadOnly && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveMedia(mediaFiles.findIndex(m => m.url === media.url))}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mediaFiles.length === 0 && isReadOnly && (
        <div className="text-center py-8 text-gray-500">
          <Icon name="ImageOff" size={48} className="mx-auto mb-3 opacity-50" />
          <p>Медиафайлы еще не загружены</p>
        </div>
      )}

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black bg-opacity-95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors p-2"
            onClick={closeLightbox}
          >
            <Icon name="X" size={32} />
          </button>

          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2 bg-black bg-opacity-40 rounded-full"
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
              >
                <Icon name="ChevronLeft" size={36} />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2 bg-black bg-opacity-40 rounded-full"
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
              >
                <Icon name="ChevronRight" size={36} />
              </button>
            </>
          )}

          <div className="max-w-5xl max-h-[90vh] px-16 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].name}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <p className="text-white text-sm mt-3 opacity-70">{images[lightboxIndex].name}</p>
            {images.length > 1 && (
              <p className="text-white text-xs mt-1 opacity-50">{lightboxIndex + 1} / {images.length}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaUploader;