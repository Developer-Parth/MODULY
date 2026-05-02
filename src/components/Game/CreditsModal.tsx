import { motion } from 'motion/react';
import { Sparkles, X } from 'lucide-react';
import pkg from '@/../package.json';
import { feedback } from '@/services/soundFeedback';

interface CreditsModalProps {
    onClose: () => void;
}

export function CreditsModal({ onClose }: CreditsModalProps) {
    return (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 16 }}
                className="max-w-2xl w-full mx-4 rounded-[28px] border border-orange-200/25 bg-[#15120d]/95 shadow-2xl overflow-hidden font-mono text-white"
            >
                <div className="flex justify-between items-center p-6 border-b border-orange-200/20 bg-linear-to-r from-orange-500/20 to-green-500/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-orange-500 text-black shadow-[0_0_24px_rgba(255,138,0,0.35)]">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-wider uppercase">MODULY Credits</h2>
                            <p className="text-xs text-white/55 uppercase tracking-widest mt-1">{pkg.build.productName} v{pkg.version}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { feedback.click(); onClose(); }}
                        className="p-2 rounded-xl hover:bg-white hover:text-black transition-colors border border-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 space-y-6 bg-[radial-gradient(circle_at_20%_20%,rgba(255,138,0,0.16),transparent_28%),radial-gradient(circle_at_85%_70%,rgba(31,191,117,0.14),transparent_30%)]">
                    <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
                        <h3 className="text-sm uppercase tracking-widest text-orange-200 mb-2">Hackathon Build</h3>
                        <p className="text-sm text-white/70 leading-relaxed">
                            This private build was reskinned for a Modi meme/brainrot desktop theme while keeping the original desktop simulator features intact.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
                            <h3 className="text-sm uppercase tracking-widest text-green-200 mb-2">Runtime</h3>
                            <p className="text-sm text-white/70 leading-relaxed">
                                React, Vite, TypeScript, Tailwind, Radix primitives, Lucide icons, and Motion power the desktop shell.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
                            <h3 className="text-sm uppercase tracking-widest text-cyan-200 mb-2">License</h3>
                            <p className="text-sm text-white/70 leading-relaxed">
                                License metadata is retained as {pkg.license}. Keep it with the project archive.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-orange-200/20 text-[10px] uppercase tracking-widest text-white/45 flex justify-between">
                    <span>{pkg.build.productName}</span>
                    <span>Private Hackathon Build</span>
                </div>
            </motion.div>
        </div>
    );
}
