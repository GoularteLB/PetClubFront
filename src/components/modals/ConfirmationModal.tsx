import { FaTimes } from 'react-icons/fa';
import './ConfirmationModal.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  isProcessing = false,
  variant = 'danger'
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  const variantClasses = {
    danger: 'danger',
    warning: 'warning',
    info: 'info'
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button 
          className="close-modal-btn"
          onClick={onCancel}
          disabled={isProcessing}
          aria-label="Fechar"
        >
          <FaTimes />
        </button>
        
        <div className={`confirmation-dialog ${variantClasses[variant]}`}>
          <h2>{title}</h2>
          <div className="confirmation-message">
            {message}
          </div>
          
          <div className="form-actions">
            <button 
              type="button"
              className="cancel-btn"
              onClick={onCancel}
              disabled={isProcessing}
            >
              {cancelText}
            </button>
            <button 
              type="button"
              className={`confirm-btn ${variantClasses[variant]}`}
              onClick={onConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="processing-spinner"></span>
              ) : null}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
