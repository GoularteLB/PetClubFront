import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { petService, Pet } from '../../services/petService';
import { authService } from '../../services/authService';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './PetManagement.css';

const PetManagement = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<{id: number, name: string} | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPet, setCurrentPet] = useState<Omit<Pet, 'id'>>({
    name: '',
    species: '',
    breed: '',
    birthDate: null,
    color: '',
    weight: 0,
    ownerId: 0
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
      ownerId: user.id
    }));
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let parsedValue: any = value;
    
    if (name === 'weight') {
      parsedValue = parseFloat(value) || 0;
    } else if (name === 'birthDate' && value) {
      parsedValue = value;
    } else if (name === 'ownerId') {
      parsedValue = parseInt(value, 10) || 1;
    }
    
    setCurrentPet(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Usuário não autenticado. Por favor, faça login novamente.');
      navigate('/login');
      return;
    }
    
    if (!currentPet.name || !currentPet.species || !currentPet.breed || 
        currentPet.weight === undefined) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    try {
      console.log('Enviando dados do pet:', currentPet);
      
      await petService.createPet({
        ...currentPet,
        ownerId: currentUser.id
      });
      
      setCurrentPet({ 
        name: '',
        species: '',
        breed: '',
        birthDate: null,
        color: '',
        weight: 0,
        ownerId: currentUser.id
      });
      
      setIsModalOpen(false);
      alert('Pet cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar pet:', error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Erro desconhecido';
        alert(`Erro ao salvar pet: ${errorMessage}`);
      } else if (error instanceof Error) {
        alert(`Erro: ${error.message}`);
      } else {
        alert('Ocorreu um erro inesperado. Por favor, tente novamente.');
      }
    }
  };

  const openNewPetModal = () => {
    setCurrentPet({ 
      name: '',
      species: '',
      breed: '',
      birthDate: null,
      color: '',
      weight: 0,
      ownerId: 1
    });
    setIsModalOpen(true);
  };

  return (
    <div className="pet-management">
      <header className="pet-header">
        <h1>Meus Pets</h1>
        <button className="add-pet-btn" onClick={openNewPetModal}>
          <FaPlus />
        </button>
      </header>

      <div className="no-pets-message">
        <p>Nenhum pet cadastrado ainda. Clique no botão "+" para adicionar um novo pet.</p>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Adicionar Novo Pet</h2>
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
