import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'auto' | string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  onClick?: () => void;
  zoomable?: boolean;
}

export default function Image({
  src,
  alt,
  width,
  height,
  className,
  aspectRatio = 'portrait',
  objectFit = 'contain',
  loading = 'lazy',
  fetchPriority = 'auto',
  onClick,
  zoomable = false,
}: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const aspectRatioClasses: Record<string, string> = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    auto: 'aspect-auto',
  };

  const aspectClass = aspectRatioClasses[aspectRatio] || aspectRatio;

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted',
          aspectClass,
          className
        )}
      >
        <div className="text-center p-4">
          <div className="text-muted-foreground text-sm">Imagem não disponível</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden bg-muted', aspectClass, className)}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <div className="w-8 h-8 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
        </div>
      )}
      <img
        key={src}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        className={cn(
          'w-full h-full transition-opacity duration-300',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'fill' && 'object-fill',
          objectFit === 'none' && 'object-none',
          objectFit === 'scale-down' && 'object-scale-down',
          isLoaded ? 'opacity-100' : 'opacity-0',
          zoomable && 'cursor-zoom-in'
        )}
        onLoad={() => {
          setIsLoaded(true);
          setHasError(false);
        }}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        onClick={onClick}
      />
    </div>
  );
}
