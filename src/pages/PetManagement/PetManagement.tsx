import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { petService, Pet } from '../../services/petService';
import { authService } from '../../services/authService';
import { FaPaw, FaPlus, FaEdit, FaTrash, FaUser, FaPhone, FaEnvelope, FaBirthdayCake, FaWeight, FaCat, FaDog, FaUserFriends, FaSyringe, FaDove, FaMouse } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './PetManagement.css';

const PetManagement = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<{id: number, name: string} | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPet, setCurrentPet] = useState<Partial<Pet>>({
    name: '',
    species: 'CACHORRO',
    breed: '',
    birthDate: null,
    color: '',
    weight: 0,
    tutorId: 0
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setCurrentUser(user);
    setCurrentPet(prev => ({
      ...prev,
      tutorId: user.id
    }));
    
    loadPets();
  }, [navigate]);
  
  const loadPets = async () => {
    try {
      setLoading(true);
      const petsData = await petService.getPets();
      setPets(petsData);
    } catch (error) {
      console.error('Erro ao carregar pets:', error);
      toast.error('Erro ao carregar a lista de pets');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let parsedValue: any = value;
    
    if (name === 'weight') {
      parsedValue = parseFloat(value) || 0;
    } else if (name === 'birthDate' && value) {
      parsedValue = value;
    } else if (name === 'tutorId') {
      parsedValue = parseInt(value, 10) || 0;
    }
    
    setCurrentPet(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };
  
  const getSpeciesIcon = (species: string) => {
    switch(species) {
      case 'CACHORRO':
        return <FaDog className="species-icon" />;
      case 'GATO':
        return <FaCat className="species-icon" />;
      case 'PASSARO':
        return <FaDove className="species-icon" />;
      case 'ROEDOR':
        return <FaMouse className="species-icon" />;
      default:
        return <FaDog className="species-icon" />;
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informada';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Usuário não autenticado. Por favor, faça login novamente.');
      navigate('/login');
      return;
    }
    
    if (!currentPet.name || !currentPet.species || !currentPet.breed || 
        currentPet.weight === undefined) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    try {
      if (isEditing && currentPet.id) {
        await petService.updatePet(currentPet.id, currentPet);
        toast.success('Pet atualizado com sucesso!');
      } else {
        await petService.createPet({
          ...currentPet,
          tutorId: currentUser.id
        } as Omit<Pet, 'id'>);
        toast.success('Pet cadastrado com sucesso!');
      }
      
      resetForm();
      setIsModalOpen(false);
      await loadPets();
    } catch (error) {
      console.error('Erro ao salvar pet:', error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Erro desconhecido';
        toast.error(`Erro ao salvar pet: ${errorMessage}`);
      } else if (error instanceof Error) {
        toast.error(`Erro: ${error.message}`);
      } else {
        toast.error('Ocorreu um erro inesperado. Por favor, tente novamente.');
      }
    }
  };
  
  const handleEditPet = (pet: Pet) => {
    setCurrentPet({
      ...pet,
      birthDate: pet.birthDate ? pet.birthDate.split('T')[0] : null
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };
  
  const handleDeletePet = async (petId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este pet?')) {
      return;
    }
    
    try {
      await petService.deletePet(petId);
      toast.success('Pet excluído com sucesso!');
      await loadPets();
    } catch (error) {
      console.error('Erro ao excluir pet:', error);
      toast.error('Erro ao excluir o pet. Tente novamente.');
    }
  };
  
  const resetForm = () => {
    setCurrentPet({
      name: '',
      species: 'CACHORRO',
      breed: '',
      birthDate: null,
      color: '',
      weight: 0,
      tutorId: currentUser?.id || 0
    });
    setIsEditing(false);
  };

  const openNewPetModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="pet-management">
      <header className="pet-header">
        <h1>Meus Pets</h1>
        <div className="header-actions">
          <button 
            className="primary-btn"
            onClick={() => navigate('/tutors')}
          >
            <FaUserFriends /> Gerenciar Tutores
          </button>
          <button 
            className="primary-btn"
            onClick={() => navigate('/vaccines')}
          >
            <FaSyringe /> Gerenciar Vacinas
          </button>
          <button 
            className="add-pet-btn" 
            onClick={openNewPetModal} 
            title="Adicionar Pet"
          >
            <FaPlus />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="loading-message">
          <p>Carregando pets...</p>
        </div>
      ) : pets.length === 0 ? (
        <div className="no-pets-message">
          <p>Nenhum pet cadastrado ainda. Clique no botão "+" para adicionar um novo pet.</p>
        </div>
      ) : (
        <div className="pets-grid">
          {pets.map((pet) => (
            <div key={pet.id} className="pet-card">
              <div className="pet-card-header">
                {getSpeciesIcon(pet.species)}
                <h3>{pet.name}</h3>
              </div>
              <div className="pet-details">
                <p><strong>Espécie:</strong> {pet.species}</p>
                <p><strong>Raça:</strong> {pet.breed}</p>
                {pet.color && <p><strong>Cor:</strong> {pet.color}</p>}
                {pet.weight > 0 && <p><strong>Peso:</strong> {pet.weight} kg</p>}
                <p><strong>Data de Nascimento:</strong> {formatDate(pet.birthDate)}</p>
              </div>
              <div className="pet-actions">
                <button 
                  className="edit-btn"
                  onClick={() => handleEditPet(pet)}
                  title="Editar pet"
                >
                  <FaEdit />
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => pet.id && handleDeletePet(pet.id)}
                  title="Excluir pet"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => {
          setIsModalOpen(false);
          resetForm();
        }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{isEditing ? 'Editar Pet' : 'Adicionar Novo Pet'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nome do Pet</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={currentPet.name || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="species">Espécie</label>
                <select
                  id="species"
                  name="species"
                  value={currentPet.species || ''}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione uma espécie</option>
                  <option value="CACHORRO">Cachorro</option>
                  <option value="GATO">Gato</option>
                  <option value="PASSARO">Pássaro</option>
                  <option value="ROEDOR">Roedor</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="breed">Raça *</label>
                <select
                  id="breed"
                  name="breed"
                  value={currentPet.breed || ''}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione uma raça</option>
                  <option value="LABRADOR">Labrador</option>
                  <option value="POODLE">Poodle</option>
                  <option value="BULLDOG">Bulldog</option>
                  <option value="SIAMESE">Siamês</option>
                  <option value="PERSIAN">Persa</option>
                  <option value="OTHER">Outro</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="birthDate">Data de Nascimento (opcional)</label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={currentPet.birthDate || ''}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="color">Cor (opcional)</label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={currentPet.color || ''}
                  onChange={handleInputChange}
                  placeholder="Ex: Preto, Branco, etc."
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="weight">Peso (kg) *</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  min="0"
                  step="0.1"
                  value={currentPet.weight || ''}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: 5.5"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit">
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetManagement;
