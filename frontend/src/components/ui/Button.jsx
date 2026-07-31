// Premium Button component matching specs
// Spec: Height 58px, Full Width, Text 18px Bold, Rounded 16px, Gradient, Glow, Loading Spinner
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-[0_6px_30px_rgba(99,102,241,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] border border-indigo-400/40',
  secondary: 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 border border-slate-700/80 shadow-lg backdrop-blur-md',
  danger: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-[0_6px_25px_rgba(225,29,72,0.45)] border border-rose-400/40',
  success: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_6px_25px_rgba(16,185,129,0.45)] border border-emerald-400/40',
  ghost: 'hover:bg-slate-800/70 text-slate-300 hover:text-white',
};

const sizes = {
  sm: 'h-[44px] px-4 text-sm font-bold rounded-[12px] gap-2',
  md: 'h-[50px] px-6 text-base font-bold rounded-[14px] gap-2.5',
  lg: 'h-[58px] px-8 text-[18px] font-extrabold rounded-[16px] gap-3',
  xl: 'h-[64px] px-10 text-[20px] font-extrabold rounded-[18px] gap-3.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.015, y: disabled || loading ? 0 : -2 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        transition-all duration-300 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        flex items-center justify-center relative overflow-hidden tracking-wide
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Processing...</span>
        </>
      ) : children}
    </motion.button>
  );
}
