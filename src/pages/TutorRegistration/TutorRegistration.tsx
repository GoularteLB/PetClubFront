import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { tutorService, Tutor } from '../../services/tutorService';
import './TutorRegistration.css';

const TutorRegistration = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Tutor, 'id'>>({
    name: '',
    nickname: '',
    birthDate: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'O nome deve ter pelo menos 3 caracteres';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'O nome não pode ter mais de 100 caracteres';
    }
    
    if (!formData.birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 120);
      
      if (isNaN(birthDate.getTime())) {
        newErrors.birthDate = 'Data de nascimento inválida';
      } else if (birthDate > today) {
        newErrors.birthDate = 'A data de nascimento não pode ser no futuro';
      } else if (birthDate < minDate) {
        newErrors.birthDate = 'Por favor, insira uma data de nascimento válida';
      }
    }
    
  
    if (formData.nickname && formData.nickname.length > 50) {
      newErrors.nickname = 'O apelido não pode ter mais de 50 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const formattedData: Omit<Tutor, 'id'> = {
        name: formData.name.trim(),
        nickname: formData.nickname?.trim() || undefined,
        birthDate: formData.birthDate
      };
      
      console.log('Enviando dados para o servidor:', formattedData);
      await tutorService.createTutor(formattedData);
      
      toast.success('Cadastro realizado com sucesso!');
      
      navigate('/login', { 
        state: { 
          message: 'Cadastro realizado com sucesso! Faça login para continuar.' 
        } 
      });
      
    } catch (error: any) {
      console.error('Erro ao cadastrar tutor:', error);
      
      if (error.response?.status === 400 && error.response?.data?.includes('Já existe um tutor com esse nome')) {
        toast.error('Já existe um tutor cadastrado com este nome. Por favor, use um nome diferente.');
        setErrors(prev => ({
          ...prev,
          name: 'Este nome já está em uso. Por favor, escolha outro.'
        }));
      } else {
        const errorMessage = error.response?.data?.message || 'Erro ao realizar cadastro. Tente novamente.';
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    if (name === 'name' && value.length > 100) {
      processedValue = value.slice(0, 100);
    } else if (name === 'nickname' && value.length > 50) {
      processedValue = value.slice(0, 50);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="tutor-registration">
      <div className="tutor-registration__image-container">
        <h1>Cadastre-se no PetClub</h1>
        <p>Faça parte da nossa comunidade de amantes de animais de estimação.</p>
      </div>
      
      <div className="tutor-registration__form-container">
        <form className="tutor-registration__form" onSubmit={handleSubmit}>
          <h2 className="tutor-registration__title">Criar Conta</h2>
          
          <div className="tutor-registration__form-group">
            <label htmlFor="name">Nome Completo *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Digite seu nome completo"
              disabled={isLoading}
            />
            {errors.name && <span className="tutor-registration__error">{errors.name}</span>}
          </div>
          
          <div className="tutor-registration__form-group">
            <label htmlFor="nickname">Apelido (Opcional)</label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={formData.nickname || ''}
              onChange={handleChange}
              placeholder="Como prefere ser chamado?"
              disabled={isLoading}
            />
          </div>
          
          <div className="tutor-registration__form-group">
            <label htmlFor="birthDate">Data de Nascimento *</label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              disabled={isLoading}
            />
            {errors.birthDate && <span className="tutor-registration__error">{errors.birthDate}</span>}
          </div>
          
          <button 
            type="submit" 
            className="tutor-registration__button"
            disabled={isLoading}
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
          
          <p className="tutor-registration__login-link">
            Já tem uma conta? <Link to="/login">Faça login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default TutorRegistration;
