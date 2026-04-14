import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

const Select = ({ label, options = [], value, onChange, placeholder = "Pilih opsi...", error, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Menutup dropdown saat klik di luar area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`flex flex-col gap-1.5 w-full relative ${className}`} ref={dropdownRef}>
      {label && <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>}

      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full cursor-pointer
          py-2.5 px-4 rounded-xl border-2 transition-all duration-300
          ${isOpen ? 'border-indigo-500 ring-4 ring-indigo-500/10 bg-white' : 'border-slate-100 bg-slate-50'}
          ${error ? 'border-rose-400' : ''}
        `}
      >
        <span className={`${!selectedOption ? 'text-slate-400' : 'text-slate-700'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <FiChevronDown className="text-slate-400" />
        </motion.div>
      </div>

      {/* Options Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 5 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 w-full bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  px-4 py-2.5 text-sm cursor-pointer transition-colors
                  ${value === option.value ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}
                `}
              >
                {option.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && <span className="text-xs text-rose-500 font-medium ml-1">{error}</span>}
    </div>
  );
};

export default Select;  