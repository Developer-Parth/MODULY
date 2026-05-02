import { ReactNode, useState } from "react";
import { AlertTriangle, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import pkg from "@/../package.json";
import { validateIntegrity } from "@/utils/integrity";
import { ConnectivityBadge } from "@/components/ui/ConnectivityBadge";
import { useI18n } from "@/i18n/index";
import { useAppContext } from "@/components/AppContext";
import background from "@/assets/images/images.jpeg";

interface GameScreenLayoutProps {
    children: ReactNode;
    footerActions?: ReactNode;
    className?: string;
    zIndex?: number;
    mode?: 'terminal' | 'glass';
}

export function GameScreenLayout({
    children,
    footerActions,
    className = "",
    zIndex = 40,
    mode = 'terminal',
}: GameScreenLayoutProps) {
    const { t } = useI18n();
    const { accentColor } = useAppContext();
    const [isIntegrityValid] = useState(() => validateIntegrity());

    const terminalStyle = {
        backgroundImage: `
          radial-gradient(circle at center, transparent 24%, #000 100%),
          linear-gradient(135deg, rgba(255,138,0,0.16), transparent 34%, rgba(31,191,117,0.14)),
          radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 18px 18px',
        backgroundPosition: 'center, center, 0 0'
    };

    const glassStyle = {
        backgroundImage: `url(${background})`,
    };

    return (
        <div
            className={`fixed inset-0 flex flex-col ${mode === 'glass' ? 'bg-cover bg-center font-sans overflow-y-auto overflow-x-hidden' : 'bg-black font-mono overflow-hidden'} ${className}`}
            style={{
                zIndex,
                ...(mode === 'terminal' ? terminalStyle : glassStyle)
            }}
        >
            {mode === 'glass' && <div className="fixed inset-0 bg-black/55 backdrop-blur-sm pointer-events-none" />}

            <div className="relative z-20 flex flex-col items-center justify-start h-full w-full max-h-screen p-6 sm:p-12 pb-8 overflow-hidden">
                <div className="flex-1" />

                <div className={`flex flex-col items-center select-none shrink-0 relative z-0 ${mode === 'glass' ? 'mb-4 md:mb-8 animate-in fade-in zoom-in-95 duration-1000' : 'justify-start animate-in fade-in zoom-in-95 duration-1000'}`}>
                    {mode === 'terminal' && (
                        <div className="flex items-center max-w-full justify-center relative">
                            <div className="flex flex-col items-center shrink min-w-0">
                                <div className="flex items-end justify-center gap-3 max-w-full">
                                    <div
                                        className="font-black text-white whitespace-nowrap leading-none uppercase max-w-full"
                                        style={{
                                            fontSize: 'clamp(30px, 8vw, 118px)',
                                            textShadow: '8px 8px 0 rgba(255,138,0,0.35), -5px -5px 0 rgba(31,191,117,0.26)'
                                        }}
                                    >
                                        MODULY
                                    </div>
                                </div>

                                <div
                                    className="mt-3 flex flex-col items-center text-white/50 uppercase text-center font-bold"
                                    style={{ gap: 'min(1vh, 8px)', fontSize: 'clamp(12px, 1vw, 24px)', letterSpacing: '0.2em' }}
                                >
                                    <div className="flex items-center" style={{ gap: 'min(1vh, 8px)' }}>
                                        <span className="bg-orange-300/70 rounded-full" style={{ width: 'clamp(3px, 0.25vw, 5px)', height: 'clamp(3px, 0.25vw, 5px)' }} />
                                        <span>CHAI WALA SIMULATOR</span>
                                        <span className="bg-green-300/70 rounded-full" style={{ width: 'clamp(3px, 0.25vw, 5px)', height: 'clamp(3px, 0.25vw, 5px)' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {mode === 'glass' && (
                        <>
                            <motion.div
                                whileHover="hover"
                                initial="initial"
                                className="relative w-24 h-24 md:w-40 md:h-40 flex items-center justify-center mx-auto mb-6 group cursor-pointer"
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.16, 0.34, 0.16] }}
                                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 rounded-full blur-2xl md:blur-[80px]"
                                    style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
                                />

                                <motion.div
                                    variants={{ hover: { scale: 1.35, opacity: 0.45 } }}
                                    className="absolute inset-0 rounded-full blur-2xl md:blur-3xl opacity-0 transition-opacity duration-700"
                                    style={{ backgroundColor: accentColor }}
                                />

                                <motion.div
                                    variants={{
                                        hover: {
                                            scale: 1.08,
                                            borderColor: "rgba(255,255,255,0.35)",
                                            backgroundColor: "rgba(255,255,255,0.1)",
                                            boxShadow: `0 0 54px ${accentColor}44`,
                                        },
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    className="absolute inset-4 md:inset-6 rounded-[36px] border border-orange-200/20 backdrop-blur-3xl bg-white/5 shadow-2xl flex items-center justify-center overflow-hidden rotate-6"
                                />

                                <motion.div
                                    animate={{ rotate: 360, scale: [1, 1.18, 1, 1.12, 1] }}
                                    transition={{
                                        rotate: { duration: 38, repeat: Infinity, ease: "linear" },
                                        scale: { duration: 3, repeat: Infinity, times: [0, 0.08, 0.16, 0.24, 1], ease: "easeInOut" },
                                    }}
                                    variants={{ hover: { scale: 1.25, filter: "drop-shadow(0 0 30px rgba(255,255,255,0.7))" } }}
                                    className="absolute inset-0 z-10 flex items-center justify-center"
                                >
                                    <Sparkles
                                        size={32}
                                        strokeWidth={1.8}
                                        className="text-white md:w-16 md:h-16 w-10 h-10"
                                    />
                                </motion.div>

                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <motion.div
                                        animate={{ opacity: [0.35, 0.7, 0.35] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="w-3 h-3 md:w-4 md:h-4 rounded-full blur-md"
                                        style={{ backgroundColor: accentColor }}
                                    />
                                </div>
                            </motion.div>

                            <h1 className="text-4xl md:text-6xl font-black mb-2 text-white drop-shadow-lg text-center">
                                MODULY
                            </h1>
                            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-white/55 text-xs md:text-sm tracking-[0.2em] uppercase text-center">
                                <span>MODULY desk</span>
                                <span className="hidden md:inline">-</span>
                                <span>chai-fi desktop simulator</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex-1" />

                <div className="w-full flex justify-center items-center shrink min-h-0 relative z-100">
                    {children}
                </div>

                <div className="flex-1" />

                <div className="shrink-0 text-center flex flex-col gap-2 items-center w-full max-w-lg relative z-10">
                    <div className={`flex flex-col justify-center items-center gap-2 ${mode === 'glass' ? 'text-xs font-mono' : 'w-full text-[10px] uppercase font-mono text-white/30 tracking-widest'}`}>
                        <div className={`flex items-center ${mode === 'glass' ? 'gap-2' : 'gap-4'}`}>
                            {mode === 'terminal' ? (
                                <>
                                    {isIntegrityValid ? (
                                        <span className="text-emerald-500/60 flex items-center gap-1.5">
                                            <ShieldCheck className="w-3 h-3" />
                                            <span className="hidden sm:inline">{t("game.footer.originalDistribution")}</span>
                                            <span className="sm:hidden">VALID</span>
                                        </span>
                                    ) : (
                                        <span className="text-red-500 flex items-center gap-1.5">
                                            <AlertTriangle className="w-3 h-3" />
                                            <span>INVALID</span>
                                        </span>
                                    )}
                                    <span className="w-1 h-1 bg-white/10 rounded-full" />
                                    <ConnectivityBadge />
                                </>
                            ) : (
                                <>
                                    <span className="text-white/10 hidden md:inline">-</span>
                                    {isIntegrityValid ? (
                                        <span className="text-emerald-500/60 flex items-center gap-1.5 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
                                            <ShieldCheck className="w-3 h-3" />
                                            <span className="hidden sm:inline">{t("game.footer.originalDistribution")}</span>
                                            <span className="sm:hidden">Valid</span>
                                        </span>
                                    ) : (
                                        <span className="text-red-500 flex items-center gap-1.5 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 animate-pulse">
                                            <AlertTriangle className="w-3 h-3" />
                                            <span className="hidden sm:inline">{t("game.footer.temperedDistribution")}</span>
                                            <span className="sm:hidden">Invalid</span>
                                        </span>
                                    )}
                                    <span className="text-white/10">-</span>
                                    <ConnectivityBadge />
                                </>
                            )}
                        </div>

                        <div className={`flex items-center justify-center ${mode === 'glass' ? 'gap-2 md:gap-4 text-[10px] md:text-xs font-mono text-white/50' : 'gap-2 text-white/20'}`}>
                            {footerActions || (
                                <span>{pkg.build.productName} {pkg.version}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
