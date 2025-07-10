// Image optimization utilities for better performance and loading

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  placeholder?: string;
  loading?: "lazy" | "eager";
  className?: string;
}

// Validate URL to prevent malicious URLs
const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.protocol === "https:" &&
      (parsedUrl.hostname === "images.unsplash.com" ||
        parsedUrl.hostname === "unsplash.com")
    );
  } catch {
    return false;
  }
};

// Generate optimized image URL with Unsplash parameters
export const getOptimizedImageUrl = (
  baseUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    fit?: "crop" | "scale" | "fill";
  } = {},
): string => {
  // Validate input URL
  if (!isValidUrl(baseUrl)) {
    return baseUrl; // Return original if not valid Unsplash URL
  }

  const { width = 400, height = 300, quality = 80, fit = "crop" } = options;

  // Validate numeric parameters
  const safeWidth = Math.max(1, Math.min(2000, Math.floor(Number(width))));
  const safeHeight = Math.max(1, Math.min(2000, Math.floor(Number(height))));
  const safeQuality = Math.max(1, Math.min(100, Math.floor(Number(quality))));

  try {
    const url = new URL(baseUrl);
    url.searchParams.set("w", safeWidth.toString());
    url.searchParams.set("h", safeHeight.toString());
    url.searchParams.set("fit", fit);
    url.searchParams.set("q", safeQuality.toString());
    url.searchParams.set("auto", "format");
    return url.toString();
  } catch {
    return baseUrl; // Return original on error
  }
};

// Generate placeholder image for loading states
export const generatePlaceholder = (
  width: number,
  height: number,
  color: string = "e2e8f0",
): string => {
  // Sanitize inputs to prevent injection
  const safeWidth = Math.max(1, Math.min(2000, Math.floor(Number(width))));
  const safeHeight = Math.max(1, Math.min(2000, Math.floor(Number(height))));
  const safeColor =
    color.replace(/[^a-fA-F0-9]/g, "").substring(0, 6) || "e2e8f0";

  const svgString = `<svg width="${safeWidth}" height="${safeHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#${safeColor}"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="#94a3b8" text-anchor="middle" dy=".3em">Loading...</text></svg>`;

  return `data:image/svg+xml;base64,${btoa(svgString)}`;
};

// Preload critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Lazy loading intersection observer
export const createLazyLoadObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
) => {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null;
  }

  return new IntersectionObserver(
    (entries) => {
      entries.forEach(callback);
    },
    {
      rootMargin: "50px 0px",
      threshold: 0.1,
    },
  );
};

// Game-specific image mappings
export const gameImages = {
  chess: {
    main: "https://images.unsplash.com/photo-1528819622765-d6bcf132ac11",
    thumbnail: "https://images.unsplash.com/photo-1528819622765-d6bcf132ac11",
    icon: "♛",
    gradient: "from-amber-500 via-orange-500 to-red-500",
  },
  ludo: {
    main: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5",
    thumbnail: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5",
    icon: "🎲",
    gradient: "from-green-500 via-emerald-500 to-teal-500",
  },
  maze: {
    main: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1",
    thumbnail: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1",
    icon: "🧩",
    gradient: "from-purple-500 via-violet-500 to-indigo-500",
  },
  game2048: {
    main: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937",
    thumbnail: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937",
    icon: "🎯",
    gradient: "from-cyan-500 via-blue-500 to-indigo-500",
  },
  math: {
    main: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
    icon: "🧮",
    gradient: "from-pink-500 via-rose-500 to-red-500",
  },
  wordsearch: {
    main: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570",
    thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570",
    icon: "📝",
    gradient: "from-emerald-500 via-teal-500 to-green-500",
  },
};

// High-quality game images for better visual appeal
export const enhancedGameImages = {
  chess: {
    hero: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&h=600&fit=crop&q=85",
    card: "https://images.unsplash.com/photo-1528819622765-d6bcf132ac11?w=400&h=300&fit=crop&q=80",
    background:
      "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=1200&h=800&fit=crop&q=70",
  },
  ludo: {
    hero: "https://images.unsplash.com/photo-1611996575749-79a3a250f79e?w=800&h=600&fit=crop&q=85",
    card: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop&q=80",
    background:
      "https://images.unsplash.com/photo-1594736797933-d0fce2b98d64?w=1200&h=800&fit=crop&q=70",
  },
  maze: {
    hero: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&q=85",
    card: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=400&h=300&fit=crop&q=80",
    background:
      "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1200&h=800&fit=crop&q=70",
  },
  game2048: {
    hero: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop&q=85",
    card: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300&fit=crop&q=80",
    background:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=800&fit=crop&q=70",
  },
  math: {
    hero: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=600&fit=crop&q=85",
    card: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop&q=80",
    background:
      "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=1200&h=800&fit=crop&q=70",
  },
  wordsearch: {
    hero: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&q=85",
    card: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&q=80",
    background:
      "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=1200&h=800&fit=crop&q=70",
  },
};

// WebP support detection
export const supportsWebP = (): boolean => {
  if (typeof window === "undefined") return false;

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL("image/webp").indexOf("webp") !== -1;
};

// Image format optimization
export const getOptimalFormat = (originalUrl: string): string => {
  if (supportsWebP() && originalUrl.includes("unsplash.com")) {
    const url = new URL(originalUrl);
    url.searchParams.set("fm", "webp");
    return url.toString();
  }
  return originalUrl;
};

// Responsive image srcSet generation
export const generateSrcSet = (
  baseUrl: string,
  sizes: number[] = [400, 800, 1200],
): string => {
  if (!baseUrl.includes("unsplash.com")) return "";

  return sizes
    .map((size) => {
      const url = new URL(baseUrl);
      url.searchParams.set("w", size.toString());
      url.searchParams.set("auto", "format");
      return `${url.toString()} ${size}w`;
    })
    .join(", ");
};
