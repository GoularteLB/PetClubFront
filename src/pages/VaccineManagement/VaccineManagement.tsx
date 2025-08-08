import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSyringe, FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaTimes, FaPaw, FaUserFriends } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Vacina } from '../../types';
import { vacinaService } from '../../services/vacinaService';
import { authService } from '../../services/authService';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import './VaccineManagement.css';

interface VaccineFormData {
  type: string;
  date: string;
  petId: number;
}

interface VaccineManagementState {
  vacinas: Vacina[];
  isLoading: boolean;
  isDeleting: number | null;
  isModalOpen: boolean;
  isEditing: boolean;
  formData: VaccineFormData;
  errors: Record<string, string>;
  deleteDialogOpen: number | null;
  deletingVaccine: Vacina | null;
  currentVaccineId: number | null;
}

const VaccineManagement = () => {
  const navigate = useNavigate();
  
  const [state, setState] = useState<VaccineManagementState>({
    vacinas: [],
    isLoading: true,
    isDeleting: null,
    isModalOpen: false,
    isEditing: false,
    formData: {
      type: '',
      date: '',
      petId: 0
    },
    errors: {},
    deleteDialogOpen: null,
    deletingVaccine: null,
    currentVaccineId: null
  });

  const {
    vacinas,
    isLoading,
    isDeleting,
    isModalOpen,
    isEditing,
    formData,
    errors,
    deleteDialogOpen,
    deletingVaccine,
    currentVaccineId
  } = state;

  const updateState = (updates: Partial<VaccineManagementState>) => {
    setState(prev => ({
      ...prev,
      ...updates
    }));
  };

  const fetchVacinas = async () => {
    try {
      updateState({ isLoading: true });
      const data = await vacinaService.listVacinas();
      updateState({ vacinas: data, isLoading: false });
    } catch (error) {
      console.error('Erro ao carregar vacinas:', error);
      toast.error('Erro ao carregar a lista de vacinas');
      updateState({ vacinas: [], isLoading: false });
    }
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    fetchVacinas();
  }, [navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.type.trim()) {
      newErrors.type = 'Tipo da vacina é obrigatório';
    } else if (formData.type.trim().length < 3) {
      newErrors.type = 'O tipo deve ter pelo menos 3 caracteres';
    } else if (formData.type.trim().length > 100) {
      newErrors.type = 'O tipo não pode ter mais de 100 caracteres';
    }
    
    if (!formData.date) {
      newErrors.date = 'Data da vacina é obrigatória';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const vaccineDate = new Date(formData.date);
      
      if (vaccineDate > today) {
        newErrors.date = 'A data não pode ser futura';
      }
    }
    
    if (!formData.petId) {
      newErrors.petId = 'É necessário selecionar um pet';
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
        type: formData.type.trim(),
        date: formData.date,
        petId: formData.petId
      };
      
      if (isEditing && currentVaccineId) {
        await vacinaService.updateVacina(currentVaccineId, formattedData);
        toast.success('Vacina atualizada com sucesso!');
      } else {
        await vacinaService.createVacina(formattedData);
        toast.success('Vacina cadastrada com sucesso!');
      }
      
      resetForm();
      updateState({ isModalOpen: false });
      fetchVacinas();
    } catch (error: any) {
      console.error('Erro ao salvar vacina:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao salvar vacina. Tente novamente.';
      toast.error(errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    if (name === 'type' && value.length > 100) {
      processedValue = value.slice(0, 100);
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
        type: '',
        date: '',
        petId: 0
      },
      errors: {},
      currentVaccineId: null,
      isEditing: false
    });
  };

  const openNewVaccineModal = () => {
    resetForm();
    updateState({ isModalOpen: true });
  };

  const openEditVaccineModal = (vacina: Vacina) => {
    updateState({
      formData: {
        type: vacina.type,
        date: vacina.date,
        petId: vacina.petId
      },
      currentVaccineId: vacina.id || null,
      isEditing: true,
      isModalOpen: true
    });
  };

  const handleDeleteClick = (vacina: Vacina) => {
    updateState({
      deleteDialogOpen: vacina.id || null,
      deletingVaccine: vacina
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialogOpen || !deletingVaccine) return;
    
    try {
      updateState({ isDeleting: deleteDialogOpen });
      await vacinaService.deleteVacina(deleteDialogOpen);
      
      const updatedVacinas = vacinas.filter(v => v.id !== deleteDialogOpen);
      updateState({ 
        vacinas: updatedVacinas,
        isDeleting: null,
        deleteDialogOpen: null,
        deletingVaccine: null
      });
      
      toast.success('Vacina excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir vacina:', error);
      toast.error('Erro ao excluir vacina. Tente novamente.');
      updateState({ isDeleting: null });
    }
  };

  const handleDeleteCancel = () => {
    updateState({
      deleteDialogOpen: null,
      deletingVaccine: null
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informada';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="vaccine-management">
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Carregando vacinas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vaccine-management">
      <header className="vaccine-header">
        <h1>Gerenciar Vacinas</h1>
        <div className="header-actions">
          <button 
            className="primary-btn"
            onClick={() => navigate('/pets')}
          >
            <FaPaw /> Gerenciar Pets
          </button>
          <button 
            className="primary-btn"
            onClick={() => navigate('/tutors')}
          >
            <FaUserFriends /> Gerenciar Tutores
          </button>
          <button 
            className="add-vaccine-btn" 
            onClick={openNewVaccineModal}
            title="Adicionar Vacina"
          >
            <FaPlus />
          </button>
        </div>
      </header>

      {vacinas.length === 0 ? (
        <div className="no-items-message">
          <div className="empty-state">
            <FaSyringe className="empty-icon" />
            <h3>Nenhuma vacina cadastrada</h3>
            <p>Comece adicionando sua primeira vacina para gerenciar o histórico.</p>
            <button 
              className="primary-btn"
              onClick={openNewVaccineModal}
            >
              <FaPlus /> Adicionar Primeira Vacina
            </button>
          </div>
        </div>
      ) : (
        <div className="vaccines-grid">
          {vacinas.map((vacina) => (
            <div key={vacina.id} className="vaccine-card">
              <div className="vaccine-info">
                <div className="vaccine-card-header">
                  <FaSyringe className="vaccine-icon" />
                  <h3>{vacina.type}</h3>
                </div>
                
                <div className="vaccine-details">
                  <p className="vaccine-detail">
                    <span className="detail-label">
                      <FaCalendarAlt className="detail-icon" /> Data
                    </span>
                    <span className="detail-value">{formatDate(vacina.date)}</span>
                  </p>
                  
                  {vacina.pet && (
                    <p className="vaccine-detail">
                      <span className="detail-label">
                        <FaPaw className="detail-icon" /> Pet
                      </span>
                      <span className="detail-value">{vacina.pet.name}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="vaccine-actions">
                <button 
                  className="edit-btn"
                  onClick={() => vacina.id && openEditVaccineModal(vacina)}
                  title="Editar vacina"
                >
                  <FaEdit />
                </button>
                <button 
                  className={`delete-btn ${isDeleting === vacina.id ? 'deleting' : ''}`}
                  onClick={() => handleDeleteClick(vacina)}
                  disabled={isDeleting === vacina.id}
                  title="Excluir vacina"
                >
                  {isDeleting === vacina.id ? (
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

      {}
      {isModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => {
            updateState({ isModalOpen: false });
            resetForm();
          }}
        >
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
            
            <h2>{isEditing ? 'Editar Vacina' : 'Adicionar Nova Vacina'}</h2>
            
            <form onSubmit={handleSubmit} className="vaccine-form">
              <div className="form-group">
                <label htmlFor="type">Tipo da Vacina *</label>
                <input
                  type="text"
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={errors.type ? 'input-error' : ''}
                  placeholder="Ex: Antirrábica, V8, etc."
                />
                {errors.type && <span className="error-message">{errors.type}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="date">Data da Vacina *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={errors.date ? 'input-error' : ''}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.date && <span className="error-message">{errors.date}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="petId">Pet *</label>
                <select
                  id="petId"
                  name="petId"
                  value={formData.petId}
                  onChange={handleChange}
                  className={errors.petId ? 'input-error' : ''}
                >
                  <option value="">Selecione um pet</option>
                  {vacinas.map(vacina => (
                    <option key={vacina.id} value={vacina.id}>
                      {vacina.type}
                    </option>
                  ))}
                </select>
                {errors.petId && <span className="error-message">{errors.petId}</span>}
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="secondary-btn"
                  onClick={() => {
                    updateState({ isModalOpen: false });
                    resetForm();
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="primary-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading-spinner"></span>
                  ) : isEditing ? (
                    'Salvar Alterações'
                  ) : (
                    'Cadastrar Vacina'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={!!deleteDialogOpen}
        title="Confirmar Exclusão"
        message={
          <p>
            Tem certeza que deseja excluir a vacina <strong>{deletingVaccine?.type}</strong>? 
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

export default VaccineManagement;
