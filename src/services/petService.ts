import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
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

export interface Pet {
  id?: number;
  name: string;
  species: string;
  breed: string;
  birthDate: string | null;
  color: string;
  weight: number;
  ownerId: number;
  tutorId?: number; // Mantido para compatibilidade
  createdAt?: string;
  updatedAt?: string;
}

export const petService = {
  async getPets(): Promise<Pet[]> {
    console.log('Buscando lista de pets...');
    const response = await api.get<Pet[]>('/pets');
    console.log('Pets recebidos:', response.data);
    return response.data;
  },

  async getPet(id: number): Promise<Pet> {
    console.log(`Buscando pet com ID ${id}...`);
    const response = await api.get<Pet>(`/pets/${id}`);
    console.log('Pet recebido:', response.data);
    return response.data;
  },

  async createPet(pet: Omit<Pet, 'id'>): Promise<Pet> {
    console.log('Criando novo pet:', pet);
    const response = await api.post<Pet>('/pets', pet);
    console.log('Pet criado com sucesso:', response.data);
    return response.data;
  },

  async updatePet(id: number, pet: Partial<Pet>): Promise<Pet> {
    console.log(`Atualizando pet ID ${id}:`, pet);
    const response = await api.put<Pet>(`/pets/${id}`, pet);
    console.log('Pet atualizado com sucesso:', response.data);
    return response.data;
  },

  async deletePet(id: number): Promise<void> {
    console.log(`Excluindo pet ID ${id}...`);
    await api.delete(`/pets/${id}`);
    console.log('Pet excluído com sucesso');
  },

  async updatePetName(id: number, name: string): Promise<Pet> {
    console.log(`Atualizando nome do pet ID ${id} para:`, name);
    const response = await api.put<Pet>(`/pets/${id}/name`, { name });
    console.log('Nome do pet atualizado com sucesso:', response.data);
    return response.data;
  }
};
