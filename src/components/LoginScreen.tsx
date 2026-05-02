import { useState, useRef, useEffect } from 'react';
import { useFileSystem, User } from '@/components/FileSystemContext';
import { cn } from '@/components/ui/utils';
import { ArrowRight, Loader2, Power, RefreshCcw, UserCircle2 } from 'lucide-react';
import { feedback } from '@/services/soundFeedback';
import { hasSavedSession, clearSession, softReset } from '@/utils/memory';
import { useAppContext } from '@/components/AppContext';
import { useI18n } from '@/i18n/index';
import { motion, AnimatePresence } from 'motion/react';
import nebulaWallpaper from '@/assets/images/wallpaper-nebula.avif';
import cityWallpaper from '@/assets/images/wallpaper-city.avif';
import relicWallpaper from '@/assets/images/wallpaper-aurora.avif';
import lakeWallpaper from '@/assets/images/wallpaper-lake.avif';
import modiWallpaper from '@/assets/images/images.jpeg';

export function LoginScreen() {
    const { users, login, currentUser, logout, resetFileSystem } = useFileSystem();
    const { exposeRoot, accentColor, isLocked, setIsLocked, wallpaper } = useAppContext();
    const { t } = useI18n();

    // Map wallpaper config to actual image
    const WALLPAPERS: Record<string, string> = {
      default: modiWallpaper,
      rally: modiWallpaper,
      nebula: nebulaWallpaper,
      city: cityWallpaper,
      relic: relicWallpaper,
      lake: lakeWallpaper,
    };
    const bgImage = WALLPAPERS[wallpaper] || WALLPAPERS.default;

    const lockedUser = isLocked ? users.find(u => u.username === currentUser) : null;
    const [selectedUser, setSelectedUser] = useState<User | null>(lockedUser || null);
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selectedUser && inputRef.current) {
            inputRef.current.focus();
        }
    }, [selectedUser]);

    const handleLogin = async () => {
        if (!selectedUser) return;

        try {
            setIsLoggingIn(true);
            setError(false);
            
            // Add a small artificial delay for the smooth animation effect
            await new Promise(resolve => setTimeout(resolve, 800));

            let success = false;
            if (isLocked) {
                success = login(selectedUser.username, password);
                if (success) {
                    feedback.click();
                    setIsLocked(false);
                }
            } else {
                success = login(selectedUser.username, password);
                if (success) feedback.click();
            }

            if (!success) {
                setIsLoggingIn(false);
                setError(true);
                inputRef.current?.focus();
            } else {
                setIsLoggingIn(false);
            }
        } catch (e) {
            console.error('Login error:', e);
            setIsLoggingIn(false);
            setError(true);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleLogin();
    };

    const handleBack = () => {
        if (isLocked) {
            setIsLocked(false);
            setSelectedUser(null);
            logout();
        } else {
            setSelectedUser(null);
            setPassword('');
            setError(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[50000] flex flex-col items-center justify-center overflow-hidden bg-cover bg-center transition-[background-image] duration-1000"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            {/* Backdrop Blur & Overlay */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-2xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/60 pointer-events-none" />

            <div className="relative z-10 w-full max-w-md flex flex-col items-center">
                
                {/* Main Glass Panel */}
                <motion.div 
                    layout
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                    className="w-full bg-white/5 border border-white/10 backdrop-blur-3xl rounded-[32px] shadow-2xl p-8 overflow-hidden relative"
                >
                    {/* Decorative glow inside panel */}
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none" style={{ backgroundColor: accentColor, opacity: 0.15 }} />

                    <AnimatePresence mode="wait">
                        {!selectedUser ? (
                            <motion.div 
                                key="user-list"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full flex flex-col gap-6"
                            >
                                <div className="text-center space-y-1">
                                    <h2 className="text-white text-2xl font-semibold tracking-tight">{t('login.selectUser') || 'Welcome'}</h2>
                                    <p className="text-white/50 text-sm">Sign in to continue to MODULY</p>
                                </div>

                                <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {users.filter(u => exposeRoot || u.username !== 'root').map((user) => (
                                        <motion.button
                                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.15)" }}
                                            whileTap={{ scale: 0.98 }}
                                            key={user.uid}
                                            onClick={() => {
                                                feedback.click();
                                                setSelectedUser(user);
                                                setPassword('');
                                                setError(false);
                                            }}
                                            className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 transition-colors text-left group relative overflow-hidden"
                                        >
                                            <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                                                <UserCircle2 className="w-8 h-8 text-white/80" />
                                                {(currentUser === user.username || hasSavedSession(user.username)) && (
                                                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-black/50" />
                                                )}
                                            </div>
                                            <div className="flex-1 relative z-10">
                                                <div className="text-white font-medium text-lg">{user.fullName}</div>
                                                <div className="text-white/40 text-sm flex items-center gap-2">
                                                    @{user.username}
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ArrowRight className="w-4 h-4 text-white" />
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="password-input"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full flex flex-col items-center"
                            >
                                <motion.div 
                                    layoutId="avatar"
                                    className="relative mb-6"
                                >
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
                                        <UserCircle2 className="w-12 h-12 text-white" />
                                    </div>
                                </motion.div>

                                <h2 className="text-2xl font-semibold text-white mb-1">{selectedUser.fullName}</h2>
                                <p className="text-white/50 text-sm mb-8 text-center px-4">
                                    {hasSavedSession(selectedUser.username) 
                                        ? t('login.restoringPreviousSession') || 'Restoring previous session...'
                                        : t('login.enterPasswordToUnlock') || 'Enter your password to unlock'}
                                </p>

                                <div className="w-full relative mb-6">
                                    <input
                                        ref={inputRef}
                                        type="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError(false);
                                        }}
                                        onKeyDown={handleKeyDown}
                                        placeholder={t('login.passwordPlaceholder') || 'Password'}
                                        className={cn(
                                            "w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 text-center outline-none transition-all shadow-inner focus:bg-black/30",
                                            error ? "border-red-500/50 focus:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-shake" : "focus:border-white/30"
                                        )}
                                        style={{
                                            boxShadow: error ? undefined : (password ? `0 0 20px ${accentColor}30` : undefined),
                                            borderColor: error ? undefined : (password ? `${accentColor}50` : undefined)
                                        }}
                                        autoFocus
                                    />
                                    <AnimatePresence>
                                        {error && (
                                            <motion.p 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute -bottom-6 left-0 right-0 text-center text-red-400 text-xs font-medium"
                                            >
                                                {t('login.incorrectPassword') || 'Incorrect password'}
                                                {(selectedUser.passwordHint || selectedUser.username === 'root' || selectedUser.username === 'user' || selectedUser.username === 'guest') && (
                                                    <span className="opacity-75">. {t('login.hint')}: {selectedUser.passwordHint || (selectedUser.username === 'root' ? 'admin' : selectedUser.username === 'user' ? '1234' : 'guest')}</span>
                                                )}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="w-full flex gap-3">
                                    {hasSavedSession(selectedUser.username) && (
                                        <button
                                            onClick={() => {
                                                if (window.confirm(t('login.logOutConfirm', { username: selectedUser.username }) || 'Are you sure you want to log out?')) {
                                                    clearSession(selectedUser.username);
                                                    setSelectedUser(null);
                                                }
                                            }}
                                            className="px-4 py-3 rounded-2xl font-medium text-sm transition-all bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 text-white/70 hover:text-white"
                                        >
                                            {t('login.logOut') || 'Log Out'}
                                        </button>
                                    )}
                                    <button
                                        onClick={handleLogin}
                                        disabled={!password || isLoggingIn}
                                        className={cn(
                                            "flex-1 py-4 px-6 rounded-2xl font-semibold text-white shadow-lg transition-all",
                                            "active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed",
                                            "flex items-center justify-center gap-2 group"
                                        )}
                                        style={{ backgroundColor: accentColor }}
                                    >
                                        {isLoggingIn ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                {t('login.enterSystem') || 'Unlock'} 
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        )}
                                    </button>
                                </div>

                                <button
                                    onClick={handleBack}
                                    className="mt-6 text-white/40 hover:text-white/80 text-sm transition-colors font-medium flex items-center gap-2"
                                >
                                    <ArrowRight className="w-4 h-4 rotate-180" />
                                    {isLocked ? (t('login.switchAccount') || 'Switch Account') : (t('login.back') || 'Back')}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Bottom Utility Bar */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6 z-20">
                <button
                    onClick={() => {
                        softReset();
                        window.location.reload();
                    }}
                    className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-medium"
                >
                    <RefreshCcw className="w-4 h-4" />
                    {t('login.softReset') || 'Restart'}
                </button>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <button
                    onClick={() => {
                        if (window.confirm(t('login.hardResetConfirm') || 'Factory Reset? All data will be lost.')) {
                            resetFileSystem();
                            window.location.reload();
                        }
                    }}
                    className="flex items-center gap-2 text-white/40 hover:text-red-400 transition-colors text-sm font-medium"
                >
                    <Power className="w-4 h-4" />
                    {t('login.hardReset') || 'Factory Reset'}
                </button>
            </div>
        </div>
    );
}

