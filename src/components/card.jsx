import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  variant = 'default', 
  className = '', 
  hover = true,
  animate = true,
  onClick, // Tambahkan prop ini
  ...props 
}) => {
  
  const variantStyles = {
    default: "bg-white border-slate-100 shadow-sm",
    glass: "bg-white/70 backdrop-blur-xl border-white/40 shadow-lg",
    emerald: "bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-900/20",
    dark: "bg-slate-900 border-slate-800 text-white shadow-2xl",
    outline: "bg-transparent border-slate-200 border-dashed hover:border-emerald-400",
    none: "" 
  };

  const motionProps = animate ? {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" },
    whileHover: hover ? { y: -6, transition: { duration: 0.2 } } : {}
  } : {};

  const Component = animate ? motion.div : 'div';   

  return (
    <Component
      {...motionProps}
      onClick={onClick} // Pasang handler klik di sini
      {...props}
      className={`
        relative overflow-hidden 
        rounded-[2rem] border 
        transition-all duration-300 
        select-none
        ${variantStyles[variant] !== undefined ? variantStyles[variant] : variantStyles.default} 
        ${className}
      `}
    >
      {(variant === 'emerald' || variant === 'none') && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      )}
      {children}
    </Component>
  );
};

export default Card;