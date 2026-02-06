import { useState } from 'react';
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
  const { toast } = useToast();

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
    } catch (error) {
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

  const images = mediaFiles.filter(f => f.type === 'image');
  const videos = mediaFiles.filter(f => f.type === 'video');

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
              <div key={i} className="relative group">
                <img 
                  src={media.url} 
                  alt={media.name}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center gap-2">
                  <a 
                    href={media.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Button size="sm" variant="secondary">
                      <Icon name="Eye" size={16} />
                    </Button>
                  </a>
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
    </div>
  );
}

export default MediaUploader;
