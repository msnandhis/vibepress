'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MediaSelector } from './media-selector';
import { MediaItem, MediaType } from '@/types/media';
import { Image, Film, Music, FileText, Plus } from 'lucide-react';

interface MediaButtonProps {
  onSelect: (items: MediaItem | MediaItem[]) => void;
  multiple?: boolean;
  mediaType?: MediaType | 'all';
  variant?: 'button' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export function MediaButton({
  onSelect,
  multiple = false,
  mediaType = 'all',
  variant = 'button',
  className,
  children
}: MediaButtonProps) {
  const [open, setOpen] = useState(false);

  const getIcon = () => {
    switch (mediaType) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Film className="h-4 w-4" />;
      case 'audio':
        return <Music className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <Plus className="h-4 w-4" />;
    }
  };

  const getButtonText = () => {
    if (children) return children;

    const typeText = mediaType === 'all' ? 'Media' :
      mediaType.charAt(0).toUpperCase() + mediaType.slice(1);

    return multiple ? `Add ${typeText}` : `Select ${typeText}`;
  };

  return (
    <>
      <Button
        variant={variant === 'icon' ? 'outline' : 'default'}
        size={variant === 'icon' ? 'icon' : 'default'}
        onClick={() => setOpen(true)}
        className={className}
      >
        {variant === 'icon' ? getIcon() : (
          <>
            {getIcon()}
            <span className="ml-2">{getButtonText()}</span>
          </>
        )}
      </Button>

      <MediaSelector
        open={open}
        onOpenChange={setOpen}
        onSelect={onSelect}
        multiple={multiple}
        mediaType={mediaType}
        title={multiple ? `Select ${mediaType}s` : `Select ${mediaType}`}
        description={`Choose ${mediaType === 'all' ? 'media files' : mediaType + 's'} to insert`}
      />
    </>
  );
}

// Specific media type buttons for convenience
export function ImageButton(props: Omit<MediaButtonProps, 'mediaType'>) {
  return <MediaButton {...props} mediaType="image" />;
}

export function VideoButton(props: Omit<MediaButtonProps, 'mediaType'>) {
  return <MediaButton {...props} mediaType="video" />;
}

export function AudioButton(props: Omit<MediaButtonProps, 'mediaType'>) {
  return <MediaButton {...props} mediaType="audio" />;
}

export function DocumentButton(props: Omit<MediaButtonProps, 'mediaType'>) {
  return <MediaButton {...props} mediaType="document" />;
}