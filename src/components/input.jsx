import { useState } from 'react';

const Input = ({ label, icon: Icon, type, value, onChange, placeholder, required }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex flex-col gap-2 w-full font-sans">
      {/* Label - Dibuat lebih tipis dan bersih */}
      {label && (
        <label className="text-[10px] font-bold text-slate-400/80 ml-2 uppercase tracking-[0.15em]">
          {label}
        </label>
      )}

      <div className="relative group">
        {/* Ikon */}
        {Icon && (
          <Icon 
            className={`
              absolute left-5 top-1/2 -translate-y-1/2 text-xl transition-all duration-300 z-10
              ${isFocused ? 'text-emerald-500 scale-110' : 'text-slate-300'}
            `}
          />
        )}

        {/* Input Field */}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full outline-none transition-all duration-300
            rounded-[1.25rem] border-[1.5px] py-4
            
            /* TYPOGRAPHY TUNING */
            text-[0.95rem] font-semibold tracking-wide leading-relaxed
            
            ${Icon ? 'pl-14 pr-6' : 'px-6'}
            ${isFocused 
              ? 'border-emerald-500 bg-white text-slate-900 shadow-[0_10px_25px_-5px_rgba(16,185,129,0.1)]' 
              : 'border-slate-100 bg-slate-50 text-slate-600'
            }
            
            /* Placeholder lebih soft */
            placeholder:text-slate-300 placeholder:font-medium placeholder:tracking-normal
          `}
        />
      </div>
    </div>
  );
};

export default Input;