import { ChangeEvent, FormEvent } from 'react';
import { FaUser, FaBirthdayCake } from 'react-icons/fa';
import './TutorForm.css';

export interface TutorFormData {
  name: string;
  nickname?: string;
  birthDate: string;
}

interface TutorFormProps {
  formData: TutorFormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  onSubmit: (e: FormEvent) => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  submitText?: string;
  cancelText?: string;
}

const TutorForm = ({
  formData,
  errors,
  isSubmitting,
  onSubmit,
  onChange,
  onCancel,
  submitText = 'Salvar',
  cancelText = 'Cancelar'
}: TutorFormProps) => {
  return (
    <form onSubmit={onSubmit} className="tutor-form">
      <div className="form-group">
        <label htmlFor="name">
          <FaUser className="input-icon" />
          Nome Completo *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={onChange}
          placeholder="Digite o nome completo"
          className={errors.name ? 'has-error' : ''}
          disabled={isSubmitting}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="nickname">
          <FaUser className="input-icon" />
          Apelido (Opcional)
        </label>
        <input
          type="text"
          id="nickname"
          name="nickname"
          value={formData.nickname || ''}
          onChange={onChange}
          placeholder="Como prefere ser chamado?"
          className={errors.nickname ? 'has-error' : ''}
          disabled={isSubmitting}
        />
        {errors.nickname && <span className="error-message">{errors.nickname}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="birthDate">
          <FaBirthdayCake className="input-icon" />
          Data de Nascimento *
        </label>
        <input
          type="date"
          id="birthDate"
          name="birthDate"
          value={formData.birthDate}
          onChange={onChange}
          max={new Date().toISOString().split('T')[0]}
          className={errors.birthDate ? 'has-error' : ''}
          disabled={isSubmitting}
        />
        {errors.birthDate && <span className="error-message">{errors.birthDate}</span>}
      </div>
      
      <div className="form-actions">
        <button 
          type="button"
          className="cancel-btn"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {cancelText}
        </button>
        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="submitting-spinner"></span>
          ) : null}
          {submitText}
        </button>
      </div>
    </form>
  );
};

export default TutorForm;
