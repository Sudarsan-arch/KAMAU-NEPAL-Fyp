import React, { useState, useEffect } from 'react';
import { UserCircle, Loader2 } from 'lucide-react';

/**
 * OptimizedImage component for Kamau Nepal
 * - Handles base64, external, and internal paths
 * - Supports lazy loading
 * - Shows a loading skeleton while image is fetching
 * - Falls back to a default icon on error
 */
const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  fallbackIcon: FallbackIcon = UserCircle,
  objectFit = 'cover'
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Normalize the source path
  const getNormalizedSrc = () => {
    if (!src) return null;
    const trimmedSrc = src.toString().trim();
    
    // If it's already an absolute URL or a data URI, return as is
    if (trimmedSrc.startsWith('data:') || trimmedSrc.startsWith('http')) {
      return trimmedSrc;
    }
    
    // For local paths, normalize slashes and ensure no leading slash
    let cleanPath = trimmedSrc.replace(/\\/g, '/');
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);
    
    // Encode parts but keep slashes
    const encodedPath = cleanPath.split('/').map(encodeURIComponent).join('/');
    
    // Prepend a single leading slash
    return '/' + encodedPath;
  };

  const normalizedSrc = getNormalizedSrc();

  useEffect(() => {
    // Reset state when src changes
    setLoaded(false);
    setError(false);
    
    // Check if the image path is available and might be in cache
    if (normalizedSrc) {
      const img = new Image();
      img.src = normalizedSrc;
      if (img.complete) {
        setLoaded(true);
      }
    }
  }, [normalizedSrc]);

  if (!normalizedSrc || error) {
    return (
      <div className={`bg-slate-100 flex items-center justify-center text-slate-400 ${className}`}>
        <FallbackIcon size={className.includes('w-20') ? 48 : 24} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
          <Loader2 className="text-slate-200 animate-spin" size={24} />
        </div>
      )}
      <img
        src={normalizedSrc}
        alt={alt}
        className={`w-full h-full object-${objectFit} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
};

export default OptimizedImage;
