import { cn } from "@/lib/utils";

interface PlaceholderImageProps {
  width?: number;
  height?: number;
  className?: string;
  children?: React.ReactNode;
}

export function PlaceholderImage({
  width = 150,
  height = 150,
  className,
  children,
}: PlaceholderImageProps) {
  // SVG placeholder como data URI para evitar CORS
  const svgDataUri = `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect x="50%" y="50%" width="1" height="1" fill="#9ca3af" transform="translate(-12, -6)">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
      </rect>
      <text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="14">
        ${width}x${height}
      </text>
    </svg>
  `)}`;

  return (
    <div className={cn("relative inline-block", className)}>
      <img
        src={svgDataUri}
        alt={`Placeholder ${width}x${height}`}
        width={width}
        height={height}
        className="object-cover rounded"
      />
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
