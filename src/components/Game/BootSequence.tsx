import { useEffect, useState } from 'react';
import { soundManager } from '../../services/sound';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface BootSequenceProps {
    onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
    const [progress, setProgress] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [statusText, setStatusText] = useState('Initializing system...');

    useEffect(() => {
        // Preload the OS chunk
        const loadOS = async () => {
            try {
                // Play BIOS start sound
                soundManager.play('biosStart');
                await import('../OS'); // Trigger the dynamic import
                setIsLoaded(true);
            } catch (e) {
                console.error("Failed to load OS chunk", e);
                // Proceed anyway, Suspense will catch it or error out
                setIsLoaded(true);
            }
        };
        loadOS();

        // Simulate boot sequence stages
        const stages = [
            { p: 15, text: 'Waking up cores...' },
            { p: 35, text: 'Mounting virtual volumes...' },
            { p: 50, text: 'Initializing neural engine...' },
            { p: 75, text: 'Loading interface assets...' },
            { p: 90, text: 'Applying aesthetics...' },
            { p: 100, text: 'Ready.' },
        ];

        let currentStage = 0;
        
        const advanceStage = () => {
            if (currentStage < stages.length) {
                const stage = stages[currentStage];
                setProgress(stage.p);
                setStatusText(stage.text);
                currentStage++;
                
                // Randomize delay between stages for realism
                const delay = Math.random() * 600 + 400; 
                setTimeout(advanceStage, delay);
            }
        };

        // Start sequence
        const initialDelay = setTimeout(advanceStage, 500);
        
        return () => clearTimeout(initialDelay);
    }, []);

    // Check completion
    useEffect(() => {
        if (progress >= 100 && isLoaded) {
            const timer = setTimeout(onComplete, 800); // Small pause at 100%
            return () => clearTimeout(timer);
        }
    }, [progress, isLoaded, onComplete]);

    return (
        <div className="fixed inset-0 bg-[#0f172a] text-white flex flex-col items-center justify-center z-[50000] overflow-hidden selection:bg-white selection:text-black">
            
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen" />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center gap-12"
            >
                {/* Logo Area */}
                <div className="relative">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="w-32 h-32 rounded-full border border-white/10 border-t-orange-500 border-r-orange-500 shadow-[0_0_40px_rgba(255,138,0,0.3)]"
                    />
                    <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-2 rounded-full border border-white/5 border-b-cyan-400 border-l-cyan-400"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50 tracking-tighter">
                            MODULY
                        </span>
                    </div>
                </div>

                {/* Progress Area */}
                <div className="flex flex-col items-center gap-4 w-64">
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-orange-500 via-orange-400 to-cyan-400 shadow-[0_0_10px_rgba(255,138,0,0.5)]"
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={statusText}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-white/50 text-xs font-medium tracking-wide"
                        >
                            {statusText}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
