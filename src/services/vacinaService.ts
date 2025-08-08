import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/vacinas',
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

export interface Vacina {
  id?: number;
  type: string;
  date: string;
  petId: number;
  createdAt?: string;
  updatedAt?: string;
}

export const vacinaService = {
  async listVacinas(): Promise<Vacina[]> {
    console.log('Buscando lista de vacinas...');
    const response = await api.get<Vacina[]>('');
    console.log('Vacinas recebidas:', response.data);
    return response.data;
  },

  async getVacina(id: number): Promise<Vacina> {
    console.log(`Buscando vacina com ID ${id}...`);
    const response = await api.get<Vacina>(`/${id}`);
    console.log('Vacina recebida:', response.data);
    return response.data;
  },

  async createVacina(vacina: Omit<Vacina, 'id'>): Promise<Vacina> {
    console.log('Criando nova vacina:', vacina);
    try {
      const response = await api.post<Vacina>('', vacina);
      console.log('Vacina criada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar vacina:', error);
      throw error;
    }
  },

  async updateVacina(id: number, vacina: Partial<Vacina>): Promise<Vacina> {
    console.log(`Atualizando vacina ID ${id}:`, vacina);
    const response = await api.put<Vacina>(`/${id}`, vacina);
    console.log('Vacina atualizada com sucesso:', response.data);
    return response.data;
  },

  async deleteVacina(id: number): Promise<void> {
    console.log(`Excluindo vacina ID ${id}...`);
    await api.delete(`/${id}`);
    console.log(`Vacina ID ${id} excluída com sucesso`);
  },

  async getVacinasByPetId(petId: number): Promise<Vacina[]> {
    console.log(`Buscando vacinas para o pet ID ${petId}...`);
    const response = await api.get<Vacina[]>('', { params: { petId } });
    console.log(`Vacinas encontradas para o pet ${petId}:`, response.data);
    return response.data;
  }
};

export default vacinaService;
