// Success Page — Huge Group Number Reveal with Confetti & Animations
// Spec: 🎉 Registration Successful, Your Group Is, Huge 90px Desktop / 70px Mobile number
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ShieldCheck, Home, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';

export default function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const { groupNumber, name, alreadyRegistered } = state;

  useEffect(() => {
    if (!groupNumber) return;

    // Trigger multi-stage confetti
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'],
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
        <div className="glass-strong rounded-[24px] p-8 sm:p-10 max-w-md w-full text-center border border-white/15 shadow-2xl">
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
    <div className="min-h-screen animated-bg flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/25 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="w-[92%] max-w-[440px] sm:w-full sm:max-w-[580px] relative z-10 my-auto"
      >
        <div className="glass-strong rounded-[24px] p-[28px] sm:p-[44px] text-center shadow-2xl border border-white/20 relative overflow-hidden">
          {/* Header Title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-extrabold text-white mb-2"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            🎉 Registration Successful
          </motion.div>

          <p className="text-indigo-300 text-base font-semibold mb-6">
            Welcome, <span className="text-white font-bold">{name || 'Fresher'}</span>! {alreadyRegistered && '(Already Registered)'}
          </p>

          {/* Subtitle */}
          <p className="text-slate-400 text-sm uppercase tracking-widest font-bold mb-3">
            Your Group Is
          </p>

          {/* Huge Group Number (90px Desktop / 70px Mobile) with Float Effect & Glow */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 180, delay: 0.15 }}
            className="animate-float my-4 py-6 px-4 rounded-[20px] bg-gradient-to-br from-indigo-950/80 via-purple-950/60 to-slate-950/90 border border-indigo-500/40 shadow-[0_0_60px_rgba(99,102,241,0.45)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
            <h1
              className="text-[70px] sm:text-[90px] font-black gradient-text tracking-tight leading-none"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              GROUP {groupNumber}
            </h1>
          </motion.div>

          {/* Guidance Info Box */}
          <div className="p-4 rounded-[16px] bg-slate-950/70 border border-slate-800/90 text-left text-xs text-slate-300 space-y-2 my-6">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Mentorship Station Notice</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Please take a screenshot of this page. Show this group number at the entrance desk to join your assigned group mentor.
            </p>
          </div>

          {/* Home Button */}
          <Button
            onClick={() => navigate('/')}
            variant="secondary"
            fullWidth
            size="lg"
          >
            <Home className="w-5 h-5" />
            <span>Back to Registration</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
