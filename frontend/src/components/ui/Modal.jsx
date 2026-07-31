// Confirmation Modal component
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

export default function Modal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmVariant = 'primary', children }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative glass-strong p-6 w-full max-w-md z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-white/70 mb-6 leading-relaxed">{message}</p>
            {children}
            {onConfirm && (
              <div className="flex gap-3 mt-4">
                <Button variant="secondary" onClick={onClose} fullWidth>Cancel</Button>
                <Button variant={confirmVariant} onClick={onConfirm} fullWidth>{confirmText}</Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
