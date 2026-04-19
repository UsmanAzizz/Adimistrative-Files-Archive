import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, title, message = '', duration = 2000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Container Toast: Top Right */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const { id, type, title, message, duration } = toast;

  let icon = <FiInfo size={24} className="text-blue-500" />;
  let bgClass = "bg-white border-slate-100";
  let titleClass = "text-slate-800";
  let barClass = "bg-blue-500";

  if (type === 'success') {
    icon = <FiCheckCircle size={24} className="text-emerald-500" />;
    titleClass = "text-emerald-700";
    barClass = "bg-emerald-500";
  } else if (type === 'error') {
    icon = <FiAlertCircle size={24} className="text-rose-500" />;
    titleClass = "text-rose-700";
    barClass = "bg-rose-500";
  } else if (type === 'info') {
    icon = <FiInfo size={24} className="text-blue-500" />;
    titleClass = "text-blue-700";
    barClass = "bg-blue-500";
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`relative w-80 p-4 rounded-2xl shadow-xl shadow-slate-200/50 border flex items-start gap-4 pointer-events-auto overflow-hidden ${bgClass}`}
    >
      {/* Progress Bar (Garis memendek) */}
      <motion.div 
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-1 ${barClass}`}
      />
      
      <div className="shrink-0 pl-1 mt-0.5">
        {icon}
      </div>
      
      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className={`text-sm font-black tracking-tight ${titleClass}`}>{title}</h4>
        {message && (
          <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
            {message}
          </p>
        )}
      </div>

      <button 
        onClick={() => onRemove(id)}
        className="shrink-0 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <FiX size={16} />
      </button>
    </motion.div>
  );
};
