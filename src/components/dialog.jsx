import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';

const Dialog = ({ isOpen, onClose, title, children, size = 'sm', type = 'default' }) => {
  const maxWidths = { sm: '340px', md: '400px', lg: '500px' };

  const statusConfig = {
    success: { icon: FiCheckCircle, color: '#10b981', bg: '#ecfdf5' },
    error: { icon: FiAlertCircle, color: '#ef4444', bg: '#fef2f2' },
    warning: { icon: FiAlertTriangle, color: '#f59e0b', bg: '#fffbeb' },
    info: { icon: FiInfo, color: '#3b82f6', bg: '#eff6ff' },
    default: { icon: null, color: '', bg: '' }
  };

  const config = statusConfig[type] || statusConfig.default;
  const StatusIcon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px',
        }}>
          {/* Backdrop: BLUR DIHAPUS agar tidak membebani GPU */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            transition={{ duration: 0.2 }} // Animasi linear biasa lebih ringan
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
            }}
          />

          {/* Modal Card: Pakai animasi Tween (bukan Spring) agar FPS stabil */}
          <motion.div
            key="modal-card"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: maxWidths[size], 
              backgroundColor: '#ffffff',
              borderRadius: '2rem', 
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center', 
              padding: '40px 24px',
              // Force hardware acceleration
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          >
            {StatusIcon && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{ 
                  padding: '20px', 
                  borderRadius: '1.2rem', 
                  backgroundColor: config.bg,
                  marginBottom: '20px',
                  display: 'flex'
                }}
              >
                <StatusIcon size={40} color={config.color} />
              </motion.div>
            )}

            <h3 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '1.4rem', 
              fontWeight: '900', 
              color: '#0f172a',
              textAlign: 'center'
            }}>
              {title}
            </h3>

            <div style={{ 
              color: '#64748b', 
              fontSize: '0.95rem', 
              textAlign: 'center',
              marginBottom: '8px'
            }}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Dialog;