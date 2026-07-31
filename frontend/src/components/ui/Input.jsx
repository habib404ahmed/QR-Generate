// High-contrast, generously-spaced Input and Select components
// Spec: Height 56px, Border Radius 14px, Left Padding 18px, Font Size 16px
// Spec: Label Bold, Uppercase, Tracking-wider, 14px, 8-10px space above input

export function Input({
  label,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="text-[14px] font-bold uppercase tracking-wider text-slate-200 mb-2.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`
            w-full h-[56px] px-[18px] rounded-[14px]
            bg-slate-900/90 border border-slate-700/80
            text-slate-100 placeholder-slate-500 text-[16px] font-medium
            transition-all duration-300
            focus:outline-none focus:border-purple-500 focus:bg-slate-900
            focus:shadow-[0_0_20px_rgba(59,130,246,0.35)]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-rose-500 focus:border-rose-500 focus:shadow-[0_0_20px_rgba(244,63,94,0.35)]' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-rose-400 text-xs font-semibold flex items-center gap-1.5 mt-2">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export function Select({
  label,
  error,
  options = [],
  placeholder = 'Select Department',
  className = '',
  ...props
}) {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="text-[14px] font-bold uppercase tracking-wider text-slate-200 mb-2.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            w-full h-[56px] px-[18px] pr-10 rounded-[14px]
            bg-slate-900/90 border border-slate-700/80
            text-slate-100 text-[16px] font-medium cursor-pointer
            transition-all duration-300
            focus:outline-none focus:border-purple-500 focus:bg-slate-900
            focus:shadow-[0_0_20px_rgba(59,130,246,0.35)]
            ${error ? 'border-rose-500' : ''}
            ${props.value === '' ? 'text-slate-500' : 'text-slate-100'}
            ${className}
          `}
          style={{ WebkitAppearance: 'none', appearance: 'none' }}
          {...props}
        >
          <option value="" disabled className="bg-slate-900 text-slate-500">
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value || opt} value={opt.value || opt} className="bg-slate-900 text-slate-100 py-2">
              {opt.label || opt}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-rose-400 text-xs font-semibold flex items-center gap-1.5 mt-2">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
