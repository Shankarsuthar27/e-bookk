import React, { useState } from 'react';

/**
 * Realistic Book Cover component:
 * - If coverImage or coverUrl is available, displays the actual image with a 3D book spine gradient and page edge illusion.
 * - If image fails to load or is absent, falls back to the artistic typographic layout with gradient background.
 */
export default function BookCover({
  title,
  author,
  coverImage,
  coverUrl,
  coverBg = 'bg-slate-800',
  className = ''
}) {
  const [hasError, setHasError] = useState(false);
  const imageSource = (!hasError && (coverImage || coverUrl)) ? (coverImage || coverUrl) : null;

  if (imageSource) {
    return (
      <div className={`relative w-full aspect-[2/3] overflow-hidden rounded-r-lg rounded-l-[3px] shadow-lg bg-slate-900 group select-none ${className}`}>
        {/* Book spine 3D curvature and shadow */}
        <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-gradient-to-r from-black/50 via-white/10 to-transparent z-20 pointer-events-none" />
        <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-white/20 z-20 pointer-events-none" />
        
        {/* Actual book cover image */}
        <img
          src={imageSource}
          alt={title}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gloss / sheen lighting overlay across the cover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/15 pointer-events-none z-10" />

        {/* Fine border and book page ridge */}
        <div className="absolute inset-0 rounded-r-lg rounded-l-[3px] ring-1 ring-inset ring-black/15 pointer-events-none z-20" />
      </div>
    );
  }

  // Fallback typography spine cover
  return (
    <div className={`relative w-full aspect-[2/3] ${coverBg} flex flex-col justify-between p-5 shadow-lg ${className} overflow-hidden group select-none rounded-r-lg rounded-l-[3px]`}>
      {/* Decorative spine crease */}
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-white/15" />
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 to-transparent" />
      
      <div className="mt-6 z-10 pl-2">
        <h3 className="font-serif font-bold text-white text-lg leading-snug tracking-wide break-words group-hover:scale-105 transition-transform duration-300 origin-left">
          {title}
        </h3>
      </div>
      <div className="z-10 pl-2">
        <p className="text-white/80 text-xs font-medium tracking-wider uppercase">{author}</p>
      </div>
      
      {/* Texture overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay pointer-events-none" />
    </div>
  );
}
