import { Trash, Trash2, Grid, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useMemo, memo } from 'react';
import type { WindowState } from '@/hooks/useWindowManager';
import { useAppContext } from '@/components/AppContext';
import { useFileSystem } from '@/components/FileSystemContext';
import { useI18n } from '@/i18n/index';
import { cn } from '@/components/ui/utils';
import { getDockApps } from '@/config/appRegistry';
import { AppIcon } from '@/components/ui/AppIcon';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface DockProps {
  onOpenApp: (appType: string, data?: any) => void;
  onRestoreWindow: (windowId: string) => void;
  onFocusWindow: (windowId: string) => void;
  windows: WindowState[];
}

function DockComponent({ onOpenApp, onRestoreWindow, onFocusWindow, windows }: DockProps) {
  const { t } = useI18n();
  const { reduceMotion, disableShadows, devMode } = useAppContext();
  const { getNodeAtPath, homePath, installedApps } = useFileSystem();

  const trashNode = getNodeAtPath(`${homePath}/.Trash`);
  const isTrashEmpty = !trashNode?.children || trashNode.children.length === 0;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [shouldHide, setShouldHide] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get visible apps based on installed apps
  const visibleApps = useMemo(() => {
    return getDockApps(installedApps);
  }, [installedApps, devMode]);

  const MAX_VISIBLE_APPS = 7;

  // Split apps into Pinned (System) and User apps
  const { pinnedApps, userApps } = useMemo(() => {
    const pinned = ['settings', 'terminal'];
    return {
      pinnedApps: visibleApps.filter(app => pinned.includes(app.id)),
      userApps: visibleApps.filter(app => !pinned.includes(app.id))
    };
  }, [visibleApps]);

  const primaryUserApps = userApps.slice(0, MAX_VISIBLE_APPS);
  const overflowUserApps = userApps.slice(MAX_VISIBLE_APPS);

  const filteredOverflowApps = useMemo(() => {
    if (!searchQuery) return overflowUserApps;
    return overflowUserApps.filter(app => {
      const appName = app.nameKey ? t(app.nameKey) : app.name;
      return appName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [overflowUserApps, searchQuery, t]);

  // Group windows by app type
  const windowsByApp = useMemo(() => {
    const map: Record<string, WindowState[]> = {};
    windows.forEach(w => {
      const appType = w.id.split('-')[0];
      if (!map[appType]) map[appType] = [];
      map[appType].push(w);
    });
    return map;
  }, [windows]);

  // Memoize intersection calculation
  const hasIntersection = useMemo(() => {
    const hasMaximizedWindow = windows.some(w => w.isMaximized && !w.isMinimized);
    if (hasMaximizedWindow) return true;

    const dockBounds = {
      left: window.innerWidth / 2 - 420,
      right: window.innerWidth / 2 + 420,
      top: window.innerHeight - 110,
      bottom: window.innerHeight,
    };

    return windows.some(w => {
      if (w.isMinimized) return false;
      const windowBounds = w.isMaximized
        ? { left: 0, right: window.innerWidth, top: 28, bottom: window.innerHeight }
        : {
          left: w.position.x,
          right: w.position.x + w.size.width,
          top: w.position.y,
          bottom: w.position.y + w.size.height,
        };

      return !(
        windowBounds.right < dockBounds.left ||
        windowBounds.left > dockBounds.right ||
        windowBounds.bottom < dockBounds.top ||
        windowBounds.top > dockBounds.bottom
      );
    });
  }, [windows]);

  useEffect(() => {
    setShouldHide(hasIntersection);
  }, [hasIntersection]);

  const handleAppClick = (appId: string, e: React.MouseEvent) => {
    const appWindows = windowsByApp[appId] || [];

    if (e.altKey) {
      onOpenApp(appId);
      return;
    }

    if (appWindows.length === 0) {
      onOpenApp(appId);
    } else {
      const minimizedWindows = appWindows.filter(w => w.isMinimized);
      const visibleWindows = appWindows.filter(w => !w.isMinimized);

      const globalTopWindow = windows.reduce((max, w) => w.zIndex > max.zIndex ? w : max, windows[0]);
      const isAppFocused = globalTopWindow && globalTopWindow.id.startsWith(appId);

      if (minimizedWindows.length > 0) {
        if (isAppFocused || visibleWindows.length === 0) {
          const toRestore = minimizedWindows.reduce((max, w) => w.zIndex > max.zIndex ? w : max, minimizedWindows[0]);
          onRestoreWindow(toRestore.id);
          return;
        }
      }

      if (visibleWindows.length > 0) {
        const topWindow = visibleWindows.reduce((max, w) => w.zIndex > max.zIndex ? w : max, visibleWindows[0]);
        onFocusWindow(topWindow.id);
      }
    }
  };

  const renderAppIcon = (app: any, index: number, isOverflow = false) => {
    const appWindows = windowsByApp[app.id] || [];
    const hasWindows = appWindows.length > 0;
    const windowCount = appWindows.length;
    const appName = app.nameKey ? t(app.nameKey) : app.name;
    const isHovered = hoveredIndex === index;

    // Magnification effect simulation based on distance from hovered index
    let scale = 1;
    let yOffset = 0;
    if (!isOverflow && hoveredIndex !== null) {
      const distance = Math.abs(hoveredIndex - index);
      if (distance === 0) {
        scale = 1.35;
        yOffset = -12;
      } else if (distance === 1) {
        scale = 1.15;
        yOffset = -6;
      } else if (distance === 2) {
        scale = 1.05;
        yOffset = -2;
      }
    }

    return (
      <div key={app.id} className="flex flex-col items-center gap-2 relative">
        <motion.button
          aria-label={appName}
          className="relative group flex items-center justify-center outline-none"
          onMouseEnter={() => !isOverflow && setHoveredIndex(index)}
          onMouseLeave={() => !isOverflow && setHoveredIndex(null)}
          onClick={(e) => handleAppClick(app.id, e)}
          animate={reduceMotion ? {} : { scale: isOverflow ? 1 : scale, y: isOverflow ? 0 : yOffset }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          whileTap={reduceMotion ? { scale: 1 } : { scale: 0.9 }}
        >
          <AppIcon
            app={app}
            size="md"
            className={cn(
              "w-[50px] h-[50px] rounded-[14px]",
              !disableShadows && "shadow-xl"
            )}
            showIcon={true}
          />

          {hasWindows && (
            <div className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 flex gap-[2px] z-10">
              {Array.from({ length: Math.min(windowCount, 3) }).map((_, i) => {
                const visibleCount = appWindows.filter(w => !w.isMinimized).length;
                const isVisibleDot = i < visibleCount;

                return (
                  <div
                    key={i}
                    className={cn(
                        "w-1 h-1 rounded-full transition-colors", 
                        isVisibleDot ? "bg-white/80" : "bg-white/30"
                    )}
                    style={isVisibleDot ? {
                      boxShadow: `0 0 4px rgba(255,255,255,0.8)`
                    } : undefined}
                  />
                );
              })}
            </div>
          )}

          <AnimatePresence>
            {!isOverflow && isHovered && (
              <motion.div
                className="absolute bottom-[calc(100%+14px)] px-3 py-1 bg-black/60 backdrop-blur-xl text-white text-xs font-medium rounded-lg whitespace-nowrap border border-white/10 z-50 shadow-2xl pointer-events-none"
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {appName}
                {hasWindows && <span className="opacity-50 ml-1">({windowCount})</span>}
                <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-black/60" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
        {isOverflow && <div className="text-xs text-white/80 mt-1">{appName}</div>}
      </div>
    );
  };

  return (
    <div className="absolute left-1/2 bottom-4 -translate-x-1/2 z-[5000] pointer-events-none sticky-dock-container pb-2 pt-16 px-16">
      <div className="pointer-events-auto">
        <motion.div
          id="dock-main"
          className={cn(
            "rounded-full p-2 border border-white/10 relative overflow-visible",
            !disableShadows && "shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          )}
          style={{ 
              background: "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.02))", 
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "inset 0 1px 1px rgba(255,255,255,0.15)"
          }}
          initial={{ y: 100, opacity: 0 }}
          animate={{
            y: shouldHide ? 120 : 0,
            opacity: shouldHide ? 0 : 1
          }}
          transition={{ duration: 0.3, type: "spring", bounce: 0.1 }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className="flex flex-row gap-2 items-center px-1">
            {/* Primary User Apps */}
            {primaryUserApps.map((app, index) => renderAppIcon(app, index))}

            {/* Overflow Menu */}
            {overflowUserApps.length > 0 && (
              <Popover onOpenChange={(open) => !open && setSearchQuery('')}>
                <PopoverTrigger asChild>
                  <div className="relative flex items-center justify-center">
                    <motion.button
                      className="relative group flex items-center justify-center w-[50px] h-[50px] rounded-[14px] bg-white/5 border border-white/10 outline-none"
                      onMouseEnter={() => setHoveredIndex(MAX_VISIBLE_APPS)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      animate={{ scale: hoveredIndex === MAX_VISIBLE_APPS ? 1.2 : 1, y: hoveredIndex === MAX_VISIBLE_APPS ? -8 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      whileTap={reduceMotion ? { scale: 1 } : { scale: 0.9 }}
                    >
                      <Grid className="w-6 h-6 text-white/80 group-hover:text-white" />
                      <AnimatePresence>
                        {hoveredIndex === MAX_VISIBLE_APPS && (
                          <motion.div
                            className="absolute bottom-[calc(100%+14px)] px-3 py-1 bg-black/60 backdrop-blur-xl text-white text-xs font-medium rounded-lg whitespace-nowrap border border-white/10 z-50 shadow-2xl pointer-events-none"
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            {t('appStore.categories.all')}
                            <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-black/60" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  align="center"
                  sideOffset={24}
                  className={cn(
                    "w-80 p-4 border border-white/10 flex flex-col gap-4 text-white rounded-[24px] bg-black/40 backdrop-blur-2xl",
                    !disableShadows ? 'shadow-2xl' : 'shadow-none'
                  )}
                >
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <input
                      type="text"
                      placeholder={t('appStore.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 max-h-[300px] overflow-y-auto scrollbar-hide p-2">
                    {filteredOverflowApps.length > 0 ? (
                      filteredOverflowApps.map((app, index) => renderAppIcon(app, index + MAX_VISIBLE_APPS, true))
                    ) : (
                      <div className="col-span-3 text-center text-white/50 text-sm py-8 font-medium">
                        {t('appStore.empty.title')}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Separator between User Apps and System Apps */}
            {(primaryUserApps.length > 0 || overflowUserApps.length > 0) && (
              <div className="h-10 w-[1px] bg-white/10 mx-1 rounded-full" />
            )}

            {/* Pinned System Apps (Terminal, Settings) */}
            {pinnedApps.map((app, index) => renderAppIcon(app, index + 100))}

            {/* Separator before Trash */}
            <div className="h-10 w-[1px] bg-white/10 mx-1 rounded-full" />

            {/* Trash Icon */}
            <div className="relative flex items-center justify-center">
                <motion.button
                aria-label={t('fileManager.places.trash')}
                className={cn(
                    "relative w-[50px] h-[50px] rounded-[14px] flex items-center justify-center text-white transition-all border outline-none",
                    !disableShadows && "shadow-xl",
                    isTrashEmpty ? "bg-white/5 border-white/10" : "bg-white/10 border-white/20"
                )}
                onMouseEnter={() => setHoveredIndex(visibleApps.length + 1)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                    onOpenApp('finder', { path: `${homePath}/.Trash` });
                }}
                animate={{ scale: hoveredIndex === visibleApps.length + 1 ? 1.2 : 1, y: hoveredIndex === visibleApps.length + 1 ? -8 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                whileTap={reduceMotion ? { scale: 1 } : { scale: 0.9 }}
                >
                {isTrashEmpty ? <Trash className="w-6 h-6 text-white/80" /> : <Trash2 className="w-6 h-6 text-white" />}

                <AnimatePresence>
                    {hoveredIndex === visibleApps.length + 1 && (
                    <motion.div
                        className="absolute bottom-[calc(100%+14px)] px-3 py-1 bg-black/60 backdrop-blur-xl text-white text-xs font-medium rounded-lg whitespace-nowrap border border-white/10 z-50 shadow-2xl pointer-events-none"
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        {t('fileManager.places.trash')}
                        <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-black/60" />
                    </motion.div>
                    )}
                </AnimatePresence>
                </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export const Dock = memo(DockComponent);
