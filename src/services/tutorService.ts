import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/tutores',
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

export interface Tutor {
  id?: number;
  name: string;
  nickname?: string;
  birthDate: string;
}

export const tutorService = {
  async listTutors(): Promise<Tutor[]> {
    console.log('Buscando lista de tutores...');
    const response = await api.get<Tutor[]>('/tutores');
    console.log('Tutores recebidos:', response.data);
    return response.data;
  },

  async getTutor(id: number): Promise<Tutor> {
    console.log(`Buscando tutor com ID ${id}...`);
    const response = await api.get<Tutor>(`/tutores/${id}`);
    console.log('Tutor recebido:', response.data);
    return response.data;
  },

  async createTutor(tutor: Omit<Tutor, 'id'>): Promise<Tutor> {
    console.log('[tutorService] Criando novo tutor:', JSON.stringify(tutor, null, 2));
    try {
      const response = await api.post<Tutor>('', tutor);
      console.log('[tutorService] Tutor criado com sucesso:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('[tutorService] Erro ao criar tutor:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('[tutorService] Dados da resposta de erro:', error.response.data);
          console.error('[tutorService] Status do erro:', error.response.status);
          console.error('[tutorService] Cabeçalhos da resposta:', error.response.headers);
        } else if (error.request) {
          console.error('[tutorService] Nenhuma resposta recebida:', error.request);
        } else {
          console.error('[tutorService] Erro ao configurar a requisição:', error.message);
        }
      } else if (error instanceof Error) {
        console.error('[tutorService] Erro inesperado:', error.message);
        console.error('[tutorService] Erro inesperado:', error.message);
      }
      
      throw error;
    }
  },

  async updateTutor(id: number, tutor: Partial<Tutor>): Promise<Tutor> {
    console.log(`Atualizando tutor ID ${id}:`, tutor);
    const response = await api.put<Tutor>(`/tutores/${id}`, tutor);
    console.log('Tutor atualizado com sucesso:', response.data);
    return response.data;
  },

  async deleteTutor(id: number): Promise<void> {
    console.log(`Excluindo tutor ID ${id}...`);
    await api.delete(`/tutores/${id}`);
    console.log('Tutor excluído com sucesso');
  },

  async searchTutors(name: string): Promise<Tutor[]> {
    console.log(`Buscando tutores com nome: ${name}`);
    const response = await api.get<Tutor[]>('/tutores/search', {
      params: { nome: name }
    });
    console.log('Tutores encontrados:', response.data);
    return response.data;
  }
};

export default tutorService;
