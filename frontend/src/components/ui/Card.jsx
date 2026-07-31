// Glassmorphism Card component
import { motion } from 'framer-motion';

export default function Card({
  children,
  className = '',
  hover = false,
  glow = false,
  ...props
}) {
  return (
    <motion.div
      className={`
        glass p-6
        ${hover ? 'hover:bg-white/10 transition-all duration-300 cursor-pointer' : ''}
        ${glow ? 'shadow-[0_0_30px_rgba(139,92,246,0.15)]' : 'shadow-[0_8px_32px_rgba(0,0,0,0.4)]'}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
