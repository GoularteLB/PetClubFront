import axios, { AxiosError } from 'axios';
import type { Pet, ApiResponse } from '../types';

// Re-exportar o tipo Pet para compatibilidade com importações existentes
export type { Pet };

const api = axios.create({
  baseURL: 'http://localhost:8080/pets',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Enviando requisição para:', config.url);
    return config;
  },
  (error) => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Resposta recebida:', response.config?.url, response.status, response.data);
    return response;
  },
  (error: AxiosError) => {
    console.error('Erro na resposta:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export const petService = {
  async getPets(): Promise<Pet[]> {
    console.log('Buscando lista de pets...');
    const response = await api.get<Pet[]>('');
    console.log('Pets recebidos:', response.data);
    return response.data;
  },

  async getPet(id: number): Promise<Pet> {
    console.log(`Buscando pet com ID ${id}...`);
    const response = await api.get<Pet>(`/${id}`);
    console.log('Pet recebido:', response.data);
    return response.data;
  },

  async createPet(pet: Omit<Pet, 'id'>): Promise<Pet> {
    console.log('Criando novo pet:', pet);
    try {
      const response = await api.post<Pet>('', pet);
      console.log('Pet criado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar pet:', error);
      throw error;
    }
  },

  async updatePet(id: number, pet: Partial<Pet>): Promise<Pet> {
    console.log(`Atualizando pet ID ${id}:`, pet);
    const response = await api.put<Pet>(`/${id}`, pet);
    console.log('Pet atualizado com sucesso:', response.data);
    return response.data;
  },

  async deletePet(id: number): Promise<void> {
    console.log(`Excluindo pet ID ${id}...`);
    await api.delete(`/${id}`);
    console.log(`Pet ID ${id} excluído com sucesso`);
  },

  async searchPets(name: string): Promise<Pet[]> {
    console.log(`Buscando pets com nome: ${name}`);
    const response = await api.get<Pet[]>('/search', {
      params: { name }
    });
    console.log('Resultados da busca:', response.data);
    return response.data;
  }
};
