// StatsCard component with min-h-[140px] equal height spec
import { motion } from 'framer-motion';

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'blue', delay = 0 }) {
  const colorMap = {
    blue: {
      bg: 'from-blue-600/20 to-indigo-600/10 border-blue-500/30',
      iconBg: 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.45)]',
      text: 'text-blue-400',
    },
    purple: {
      bg: 'from-purple-600/20 to-pink-600/10 border-purple-500/30',
      iconBg: 'bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.45)]',
      text: 'text-purple-400',
    },
    emerald: {
      bg: 'from-emerald-600/20 to-teal-600/10 border-emerald-500/30',
      iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.45)]',
      text: 'text-emerald-400',
    },
    amber: {
      bg: 'from-amber-600/20 to-orange-600/10 border-amber-500/30',
      iconBg: 'bg-gradient-to-tr from-amber-600 to-orange-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.45)]',
      text: 'text-amber-400',
    },
  };

  const current = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.05 }}
      className={`
        rounded-[20px] p-6 bg-gradient-to-br ${current.bg}
        backdrop-blur-xl border shadow-xl relative overflow-hidden
        flex flex-col justify-between min-h-[145px]
      `}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <p className="text-[12px] font-extrabold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold text-white mt-1.5 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {value}
          </h3>
        </div>
        <div className={`p-3.5 rounded-[16px] ${current.iconBg} flex-shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {subtitle && (
        <p className="text-xs text-slate-400 font-semibold border-t border-white/10 pt-3 mt-2">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
