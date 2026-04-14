import { motion } from 'framer-motion';

const Button = ({ children, type = "button", onClick, className = "", disabled }) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      // Animasi tetap menggunakan variabel atau hex agar sinkron
      whileHover={!disabled ? { y: -3, backgroundColor: '#059669' } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      style={{
        width: '100%',
        padding: '14px 24px',
        backgroundColor: '#10b981', // Emerald 500
        color: 'white',
        border: 'none',
        borderRadius: '1rem', // Sedikit lebih tegas tapi tetap modern
        fontWeight: '700',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '0.95rem',
        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        opacity: disabled ? 0.6 : 1,
        transition: 'box-shadow 0.3s ease, background-color 0.3s ease'
      }}
      className={className} // Tetap jaga-jaga jika ingin tambah class Tailwind dari luar
    >
      {children}
    </motion.button>
  );
};

export default Button;