import nebulaWallpaper from '@/assets/images/wallpaper-nebula.avif';
import cityWallpaper from '@/assets/images/wallpaper-city.avif';
import relicWallpaper from '@/assets/images/wallpaper-moduly.avif';
import lakeWallpaper from '@/assets/images/wallpaper-lake.avif';
import modiWallpaper from '@/assets/images/images.jpeg';

export const DEFAULT_SYSTEM_MEMORY_GB = 2;

export const BRAND = {
  // Default accent color
  accentColor: '#007aff',

  // User-selectable accent colors
  accentPalette: [
    { name: 'System Blue', value: '#007aff' },
    { name: 'Midnight Purple', value: '#5856d6' },
    { name: 'Saffron Boost', value: '#ff8a00' },
    { name: 'Lotus Pink', value: '#ff4fa3' },
    { name: 'Republic Green', value: '#1fbf75' },
    { name: 'Graphite', value: '#8e8e93' },
    { name: 'Rally Red', value: '#ef4444' },
    { name: 'Deep Ink', value: '#1f2937' },
  ],

  // Desktop wallpapers
  wallpapers: [
    { id: 'default', name: 'Nebula', src: nebulaWallpaper },
    { id: 'lake', name: 'Lake Break', src: lakeWallpaper },
    { id: 'city', name: 'City Glitch', src: cityWallpaper },
    { id: 'relic', name: 'Color Relic', src: relicWallpaper },
    { id: 'modi', name: 'Classic', src: modiWallpaper },
  ],
} as const;

// Type exports for consumers
export type AccentColor = (typeof BRAND.accentPalette)[number];
export type Wallpaper = (typeof BRAND.wallpapers)[number];

// Keys in SystemConfig that should survive a "New Game" reset (BIOS settings)
export const PERSISTENT_CONFIG_KEYS = [
  'locale',
  'gpuEnabled',
  'blurEnabled',
  'reduceMotion',
  'disableShadows',
  'disableGradients'
] as const;
