import React from "react";
import Image from "next/image";

interface ArenaImageProps {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  quality?: number;
  overlay?: boolean;
  glow?: boolean;
}

/**
 * ArenaImage — optimized artwork wrapper.
 *
 * If a source is missing it renders a neutral arena gradient instead of a
 * broken image, so a missing asset can never take a page down again.
 */
export function ArenaImage({
  src,
  alt,
  className = "",
  priority = false,
  fill = false,
  width,
  height,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px",
  quality = 80,
  overlay = false,
  glow = false,
}: ArenaImageProps) {
  // next/image requires either fill or explicit dimensions. The wrapper always
  // carries the caller's sizing classes, so defaulting to fill is safe and
  // prevents a missing-width crash from taking down the page.
  const useFill = fill || width === undefined || height === undefined;
  // Overlay callers pass `absolute`; the base `relative` would compete with it
  // and can collapse the fill parent to zero height.
  const positionClass = className.includes("absolute") ? "" : "relative";

  return (
    <div className={`${positionClass} overflow-hidden bg-arena-surface ${glow ? "shadow-glow" : ""} ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          priority={priority}
          fill={useFill}
          width={useFill ? undefined : width}
          height={useFill ? undefined : height}
          sizes={sizes}
          quality={quality}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="h-full w-full"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, rgba(176,38,255,0.35), transparent 55%), radial-gradient(circle at 75% 80%, rgba(0,212,255,0.3), transparent 55%)",
          }}
        />
      )}
      {overlay && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05050b] via-[#05050b]/50 to-transparent" />
      )}
      {glow && (
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-arena-purple/25" />
      )}
    </div>
  );
}

export default ArenaImage;
