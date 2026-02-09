import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, GripVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface PhotoManagerProps {
  photoUrls: string[];
  onChange: (urls: string[]) => void;
}

export default function PhotoManager({ photoUrls, onChange }: PhotoManagerProps) {
  const [newUrl, setNewUrl] = useState('');

  const addPhoto = () => {
    if (newUrl.trim() && photoUrls.length < 5) {
      onChange([...photoUrls, newUrl.trim()]);
      setNewUrl('');
    }
  };

  const removePhoto = (index: number) => {
    onChange(photoUrls.filter((_, i) => i !== index));
  };

  const movePhoto = (index: number, direction: 'up' | 'down') => {
    const newUrls = [...photoUrls];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < photoUrls.length) {
      [newUrls[index], newUrls[targetIndex]] = [newUrls[targetIndex], newUrls[index]];
      onChange(newUrls);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="Enter photo URL"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPhoto())}
        />
        <Button type="button" onClick={addPhoto} disabled={photoUrls.length >= 5 || !newUrl.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Add up to 5 photos. You can use image URLs or leave empty.
      </p>

      {photoUrls.length > 0 && (
        <div className="space-y-2">
          {photoUrls.map((url, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => movePhoto(index, 'up')}
                    disabled={index === 0}
                  >
                    <GripVertical className="w-4 h-4" />
                  </Button>
                </div>
                <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                  <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{url}</p>
                  {index === 0 && <p className="text-xs text-muted-foreground">Primary photo</p>}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePhoto(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
