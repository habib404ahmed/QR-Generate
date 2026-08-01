// Success Page — Premium Responsive Group Number Reveal with Confetti & Glassmorphism
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ShieldCheck, Home, AlertCircle, Sparkles, Camera, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';

export default function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const { groupNumber, name, alreadyRegistered } = state;

  useEffect(() => {
    if (!groupNumber) return;

    // Trigger multi-stage confetti
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#3b82f6'],
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#3b82f6'],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    // Play chime sound using Web Audio API
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playNote = (freq, start, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
        gain.gain.setValueAtTime(0.35, audioCtx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration);
      };
      playNote(523.25, 0, 0.3); // C5
      playNote(659.25, 0.15, 0.3); // E5
      playNote(783.99, 0.3, 0.5); // G5
      playNote(1046.5, 0.45, 0.9); // C6
    } catch (e) {
      // Audio fallback
    }
  }, [groupNumber]);

  if (!groupNumber) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center p-4 sm:p-6">
        <div className="glass-strong rounded-[24px] p-6 sm:p-10 max-w-md w-full text-center border border-white/15 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/40">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            No Registration Found
          </h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Please register on the main portal first to receive your group number.
          </p>
          <Button onClick={() => navigate('/')} fullWidth>
            Go to Registration
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[320px] sm:h-[600px] bg-indigo-600/25 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 220 }}
        className="w-full max-w-[420px] sm:max-w-[540px] relative z-10 my-auto"
      >
        <div className="glass-strong rounded-[24px] sm:rounded-[32px] p-5 sm:p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/20 relative overflow-hidden backdrop-blur-xl">
          {/* Top Status Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-xs font-semibold mb-4"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{alreadyRegistered ? 'Registration Status: Active' : 'Registration Complete'}</span>
          </motion.div>

          {/* Header Title */}
          <motion.h1
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight flex items-center justify-center gap-2"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <Sparkles className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <span>Registration Successful</span>
          </motion.h1>

          <p className="text-slate-300 text-sm sm:text-base font-medium mb-5">
            Welcome, <span className="text-indigo-300 font-bold">{name || 'Fresher'}</span>!
          </p>

          {/* Subtitle */}
          <p className="text-indigo-400/90 text-xs sm:text-sm uppercase tracking-widest font-extrabold mb-3">
            YOUR ASSIGNED GROUP IS
          </p>

          {/* Group Number Card — Fully Fluid & Scaled for Mobile */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 16, stiffness: 200, delay: 0.1 }}
            className="my-3 py-5 sm:py-7 px-3 sm:px-6 rounded-[20px] sm:rounded-[24px] bg-gradient-to-br from-indigo-950/90 via-purple-950/80 to-slate-950/95 border border-indigo-500/50 shadow-[0_0_50px_rgba(99,102,241,0.4)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

            <h2
              className="text-[44px] xs:text-[54px] sm:text-[76px] font-black gradient-text tracking-tight leading-none whitespace-nowrap"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              GROUP {groupNumber}
            </h2>
          </motion.div>

          {/* Screenshot Hint Box */}
          <div className="mt-4 mb-5 p-3.5 sm:p-4 rounded-[16px] bg-indigo-950/40 border border-indigo-500/25 text-left text-xs sm:text-sm text-slate-300 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-indigo-300">
              <Camera className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>Take a Screenshot Now</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Show this group number at the entrance desk to join your assigned group mentor.
            </p>
          </div>

          {/* Back Button */}
          <Button
            onClick={() => navigate('/')}
            variant="secondary"
            fullWidth
            size="lg"
            className="!py-3.5 text-sm sm:text-base font-bold shadow-lg"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back to Registration</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
