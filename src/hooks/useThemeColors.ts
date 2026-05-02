import { useAppContext } from '@/components/AppContext';
import { getComplementaryColor, mixColors } from '@/utils/colors';

/**
 * Custom hook to get theme-aware colors based on accent color and theme mode
 */
export function useThemeColors() {
    const { accentColor, themeMode, blurEnabled } = useAppContext();

    const NEUTRAL_BASE = '#15120d';

    /**
     * Get the base tint color for the current mode
     */
    const getBaseTintColor = (): string => {
        switch (themeMode) {
            case 'shades':
                return mixColors(NEUTRAL_BASE, accentColor, 0.22);
            case 'contrast': {
                const complement = getComplementaryColor(accentColor);
                return mixColors(NEUTRAL_BASE, complement, 0.2);
            }
            case 'neutral':
            default:
                return NEUTRAL_BASE;
        }
    };

    /**
     * Helper to apply opacity to a hex color
     * If blur is disabled, forces 100% opacity (no transparency)
     */
    const withOpacity = (hex: string, opacity: number): string => {
        // If blur is disabled, use 100% opacity (FF)
        if (!blurEnabled) {
            return `${hex}FF`;
        }
        const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
        return `${hex}${alpha}`;
    };

    const baseColor = getBaseTintColor();

    // Visual Hierarchy: Title (Darkest) > Sidebar (Medium) > Content (Lightest)
    return {
        accentColor,
        themeMode,
        blurEnabled,
        // General background with opacity
        getBackgroundColor: (opacity: number = 0.7) => withOpacity(baseColor, opacity),

        // Component specific colors - Hierarchy enforced
        windowBackground: withOpacity(baseColor, 0.78),
        sidebarBackground: withOpacity(mixColors(baseColor, '#1fbf75', 0.08), 0.88),
        titleBarBackground: withOpacity(mixColors(baseColor, '#ff8a00', 0.12), 0.96),
        dockBackground: withOpacity(mixColors(baseColor, '#ff8a00', 0.18), 0.62),
        menuBarBackground: withOpacity(mixColors(baseColor, '#1f1609', 0.5), 0.96),
        notificationBackground: withOpacity(baseColor, 0.9),

        // Blur style helper - disables backdrop-filter if blur is disabled
        blurStyle: blurEnabled ? { backdropFilter: 'blur(12px)' } : { backdropFilter: 'none' },
    };
}
