import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaUserPlus, FaPaw, FaEdit, FaTrash, FaBirthdayCake, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Tutor } from '../../types';
import { tutorService } from '../../services/tutorService';
import { authService } from '../../services/authService';
import TutorForm from '../../components/forms/TutorForm';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import './TutorManagement.css';

interface TutorFormData {
  name: string;
  nickname?: string;
  birthDate: string;
}

interface TutorManagementState {
  tutors: Tutor[];
  isLoading: boolean;
  isDeleting: number | null;
  isModalOpen: boolean;
  isEditing: boolean;
  formData: TutorFormData;
  errors: Record<string, string>;
  deleteDialogOpen: number | null;
  deletingTutor: Tutor | null;
  currentTutorId: number | null;
}

const TutorManagement = () => {
  const navigate = useNavigate();
  
  const [state, setState] = useState<TutorManagementState>({
    tutors: [],
    isLoading: true,
    isDeleting: null,
    isModalOpen: false,
    isEditing: false,
    formData: {
      name: '',
      nickname: '',
      birthDate: ''
    },
    errors: {},
    deleteDialogOpen: null,
    deletingTutor: null,
    currentTutorId: null
  });
  

  const {
    tutors,
    isLoading,
    isDeleting,
    isModalOpen,
    isEditing,
    formData,
    errors,
    deleteDialogOpen,
    deletingTutor,
    currentTutorId
  } = state;

  const updateState = (updates: Partial<TutorManagementState>) => {
    setState(prev => ({
      ...prev,
      ...updates
    }));
  };

  const fetchTutors = async () => {
    try {
      updateState({ isLoading: true });
      const data = await tutorService.listTutors();
      updateState({ tutors: data, isLoading: false });
    } catch (error) {
      console.error('Erro ao carregar tutores:', error);
      toast.error('Erro ao carregar a lista de tutores');
      updateState({ tutors: [], isLoading: false });
    }
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTutors();
  }, [navigate]);

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

    updateState({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const formattedData = {
        name: formData.name.trim(),
        nickname: formData.nickname?.trim() || undefined,
        birthDate: formData.birthDate
      };
      
      if (isEditing && currentTutorId) {
        await tutorService.updateTutor(currentTutorId, formattedData);
        toast.success('Tutor atualizado com sucesso!');
      } else {
        await tutorService.createTutor(formattedData);
        toast.success('Tutor cadastrado com sucesso!');
      }
      
      resetForm();
      updateState({ isModalOpen: false });
      fetchTutors();
    } catch (error: any) {
      console.error('Erro ao salvar tutor:', error);
      
      if (error.response?.status === 400 && error.response?.data?.includes('Já existe um tutor com esse nome')) {
        toast.error('Já existe um tutor cadastrado com este nome. Por favor, use um nome diferente.');
        updateState({
          errors: {
            ...state.errors,
            name: 'Este nome já está em uso. Por favor, escolha outro.'
          }
        });
      } else {
        const errorMessage = error.response?.data?.message || 'Erro ao salvar tutor. Tente novamente.';
        toast.error(errorMessage);
      }
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
    
    updateState({
      formData: {
        ...formData,
        [name]: processedValue
      },
      errors: {
        ...errors,
        [name]: ''
      }
    });
  };

  const resetForm = () => {
    updateState({
      formData: {
        name: '',
        nickname: '',
        birthDate: ''
      },
      errors: {},
      currentTutorId: null,
      isEditing: false
    });
  };

  const openNewTutorModal = () => {
    resetForm();
    updateState({ isModalOpen: true });
  };

  const openEditTutorModal = (tutor: Tutor) => {
    updateState({
      formData: {
        name: tutor.name,
        nickname: tutor.nickname || '',
        birthDate: tutor.birthDate
      },
      currentTutorId: tutor.id || null,
      isEditing: true,
      isModalOpen: true
    });
  };

  const handleDeleteClick = (tutor: Tutor) => {
    updateState({
      deleteDialogOpen: tutor.id || null,
      deletingTutor: tutor
    });
  };

  const handleDeleteConfirm = async () => {
    if (!state.deleteDialogOpen || !state.deletingTutor) return;
    
    try {
      updateState({ isDeleting: state.deleteDialogOpen });
      await tutorService.deleteTutor(state.deleteDialogOpen);
      
      const updatedTutors = state.tutors.filter(tutor => tutor.id !== state.deleteDialogOpen);
      updateState({ 
        tutors: updatedTutors,
        isDeleting: null,
        deleteDialogOpen: null,
        deletingTutor: null
      });
      
      toast.success('Tutor excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir tutor:', error);
      toast.error('Erro ao excluir tutor. Tente novamente.');
      updateState({ isDeleting: null });
    }
  };

  const handleDeleteCancel = () => {
    updateState({
      deleteDialogOpen: null,
      deletingTutor: null
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informada';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="tutor-management">
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Carregando tutores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tutor-management">
      <header className="tutor-header">
        <h1>Gerenciar Tutores</h1>
        <div className="header-actions">
          <button 
            className="primary-btn"
            onClick={() => navigate('/pets')}
          >
            <FaPaw /> Gerenciar Pets
          </button>
          <button 
            className="add-tutor-btn" 
            onClick={openNewTutorModal}
            title="Adicionar Tutor"
          >
            <FaUserPlus />
          </button>
        </div>
      </header>

      {tutors.length === 0 ? (
        <div className="no-items-message">
          <div className="empty-state">
            <FaUser className="empty-icon" />
            <h3>Nenhum tutor cadastrado</h3>
            <p>Comece adicionando seu primeiro tutor para gerenciar os pets.</p>
            <button 
              className="primary-btn"
              onClick={() => navigate('/tutors/new')}
            >
              <FaUserPlus /> Adicionar Primeiro Tutor
            </button>
          </div>
        </div>
      ) : (
        <div className="tutors-grid">
          {tutors.map((tutor) => (
            <div key={tutor.id} className="tutor-card">
              <div className="tutor-info">
                <div className="tutor-card-header">
                  <FaUser className="user-icon" />
                  <h3>{tutor.name}</h3>
                </div>
                
                <div className="tutor-details">
                  {tutor.nickname && (
                    <p className="tutor-detail">
                      <span className="detail-label">Apelido</span>
                      <span className="detail-value">{tutor.nickname}</span>
                    </p>
                  )}
                  
                  <p className="tutor-detail">
                    <span className="detail-label">
                      <FaBirthdayCake className="detail-icon" /> Nascimento
                    </span>
                    <span className="detail-value">{formatDate(tutor.birthDate)}</span>
                  </p>
                  
                  <p className="tutor-detail">
                    <span className="detail-label">
                      <FaPaw className="detail-icon" /> Pets
                    </span>
                    <span className="pets-count">
                      {tutor.pets?.length || 0}
                    </span>
                  </p>
                </div>
              </div>
              <div className="tutor-actions">
                <button 
                  className="edit-btn"
                  onClick={() => tutor.id && openEditTutorModal(tutor)}
                  title="Editar tutor"
                >
                  <FaEdit />
                </button>
                <button 
                  className={`delete-btn ${isDeleting === tutor.id ? 'deleting' : ''}`}
                  onClick={() => handleDeleteClick(tutor)}
                  disabled={isDeleting === tutor.id}
                  title="Excluir tutor"
                >
                  {isDeleting === tutor.id ? (
                    <span className="deleting-spinner"></span>
                  ) : (
                    <FaTrash />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => {
          updateState({ isModalOpen: false });
          resetForm();
        }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button 
              className="close-modal-btn"
              onClick={() => {
                updateState({ isModalOpen: false });
                resetForm();
              }}
              aria-label="Fechar"
            >
              <FaTimes />
            </button>
            
            <h2>{state.isEditing ? 'Editar Tutor' : 'Adicionar Novo Tutor'}</h2>
            
            <TutorForm
              formData={state.formData}
              errors={state.errors}
              isSubmitting={state.isLoading}
              onSubmit={handleSubmit}
              onChange={handleChange}
              onCancel={() => {
                updateState({ isModalOpen: false });
                resetForm();
              }}
              submitText={state.isEditing ? 'Salvar Alterações' : 'Cadastrar Tutor'}
              cancelText="Cancelar"
            />
          </div>
        </div>
      )}

      {}
      <ConfirmationModal
        isOpen={!!deleteDialogOpen}
        title="Confirmar Exclusão"
        message={
          <p>
            Tem certeza que deseja excluir o tutor <strong>{deletingTutor?.name}</strong>? 
            Esta ação não pode ser desfeita.
          </p>
        }
        confirmText="Confirmar Exclusão"
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isProcessing={isDeleting === deleteDialogOpen}
        variant="danger"
      />
    </div>
  );
};

export default TutorManagement;
