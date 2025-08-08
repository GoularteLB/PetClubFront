import axios, { AxiosError } from 'axios';
import type { Pet, Tutor } from '../types';

export type { Pet };

// Configuração base da instância do axios para a API de pets
const api = axios.create({
  // URL base para todas as requisições de pets
  baseURL: '/pets',
  
  // Configuração de timeout (10 segundos)
  timeout: 10000,
  
  // Configuração de credenciais
  withCredentials: true,
  
  // Configuração de cabeçalhos padrão
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  
  // Configuração de parâmetros de string de consulta
  paramsSerializer: {
    indexes: null // Desativa a notação de colchetes para arrays (ex: array=1&array=2 em vez de array[]=1&array[]=2)
  },
  
  // Configuração de redirecionamento
  maxRedirects: 5,
  
  // Configuração de resposta
  responseType: 'json',
  
  // Configuração de validação de status
  validateStatus: (status) => {
    return status >= 200 && status < 400; // Resolve apenas se o código de status for menor que 400
  },
  
  // Configuração de timeout para requisições de upload/download
  timeoutErrorMessage: 'Tempo limite da requisição excedido. Por favor, tente novamente.',
  
  // Desativa a transformação automática da resposta (útil para APIs que retornam texto puro)
  transformResponse: [
    function (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    }
  ]
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    config.headers['Content-Type'] = 'application/json';
    
    console.log('Enviando requisição:', {
      url: config.url,
      method: config.method,
      params: config.params,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization ? 'Bearer [TOKEN]' : undefined
      },
      data: config.data ? '[DATA]' : undefined
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.debug('Detalhes completos da requisição:', config);
    }
    
    return config;
  },
  (error) => {
    console.error('Erro ao configurar a requisição:', error);
    
    const requestError = new Error('Falha ao configurar a requisição. Tente novamente.') as any;
    requestError.isRequestError = true;
    requestError.originalError = error;
    
    return Promise.reject(requestError);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Resposta recebida:', {
      url: response.config?.url,
      method: response.config?.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error: AxiosError) => {
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    };
    
    console.error('Erro na resposta da API:', errorDetails);
    
    if (error.response) {
      if (error.response.status === 401) {
        console.error('Erro de autenticação: Token inválido ou expirado');
      }
      
      if (error.response.status === 403) {
        console.error('Acesso negado: Você não tem permissão para acessar este recurso');
      }
      
      if (error.response.status === 404) {
        console.error('Recurso não encontrado:', error.config?.url);
      }
      
      if (error.response.status === 422) {
        console.error('Erro de validação:', error.response.data);
      }
      
      if (error.response.status >= 500) {
        console.error('Erro interno do servidor:', error.response.data);
      }
    } else if (error.request) {
      console.error('Sem resposta do servidor. Verifique sua conexão com a internet.');
      
      const networkError = new Error('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.') as any;
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    } else {
      console.error('Erro ao configurar a requisição:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export const petService = {
  async getPets(): Promise<Pet[]> {
    console.log('Buscando lista de pets...');
    try {
      interface ApiPet {
        id?: number;
        name: string;
        species: string;
        breed: string;
        birthDate: string | null;
        color: string;
        weight: number;
        ownerId: number;
        tutor?: Tutor;
        createdAt?: string;
        updatedAt?: string;
      }
      
      const response = await api.get<ApiPet[]>('');
      console.log('Pets recebidos do backend:', response.data);
      
      const formattedPets: Pet[] = response.data.map(pet => ({
        ...pet,
        species: pet.species === 'DOG' ? 'CACHORRO' : 'GATO',
        tutorId: pet.ownerId, 
        birthDate: pet.birthDate ? new Date(pet.birthDate).toISOString().split('T')[0] : null
      }));
      
      console.log('Pets formatados para o frontend:', formattedPets);
      return formattedPets;
    } catch (error) {
      console.error('Erro ao buscar pets:', error);
      if (axios.isAxiosError(error)) {
        console.error('Detalhes do erro:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw error;
    }
  },

  async getPet(id: number): Promise<Pet> {
    console.log(`Buscando pet com ID ${id}...`);
    try {
      interface ApiPet {
        id?: number;
        name: string;
        species: string;
        breed: string;
        birthDate: string | null;
        color: string;
        weight: number;
        ownerId: number;
        tutor?: Tutor;
        createdAt?: string;
        updatedAt?: string;
      }
      
      const response = await api.get<ApiPet>(`/${id}`);
      console.log('Pet recebido do backend:', response.data);
      
      const formattedPet: Pet = {
        ...response.data,
        species: response.data.species === 'DOG' ? 'CACHORRO' : 'GATO',
        tutorId: response.data.ownerId, 
        birthDate: response.data.birthDate ? 
          new Date(response.data.birthDate).toISOString().split('T')[0] : 
          null
      };
      
      console.log('Pet formatado para o frontend:', formattedPet);
      return formattedPet;
    } catch (error) {
      console.error(`Erro ao buscar pet com ID ${id}:`, error);
      if (axios.isAxiosError(error)) {
        console.error('Detalhes do erro:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw error;
    }
  },

  async createPet(pet: Omit<Pet, 'id'>): Promise<Pet> {
    console.log('Iniciando criação de novo pet...');
    console.log('Dados recebidos para criação:', pet);
    
    try {
      if (!pet.name || !pet.species || !pet.breed || !pet.tutorId) {
        throw new Error('Nome, espécie, raça e tutor são campos obrigatórios');
      }
      
      const petData = {
        name: pet.name.trim(),
        species: pet.species === 'CACHORRO' ? 'DOG' : 'CAT',
        breed: pet.breed.trim(),
        birthDate: pet.birthDate ? new Date(pet.birthDate).toISOString().split('T')[0] : null,
        color: pet.color ? pet.color.trim() : '',
        weight: pet.weight ? Number(pet.weight) : 0,
        ownerId: pet.tutorId
      };
      
      console.log('Dados formatados para envio ao backend:', petData);
      
      const response = await api.post<Pet>('', petData);
      
      const formattedPet: Pet = {
        ...response.data,
        species: response.data.species === 'DOG' ? 'CACHORRO' : 'GATO',
        tutorId: (response.data as any).ownerId,
        birthDate: response.data.birthDate ? 
          new Date(response.data.birthDate).toISOString().split('T')[0] : 
          null
      };
      
      console.log('Pet criado com sucesso:', formattedPet);
      return formattedPet;
    } catch (error) {
      console.error('Erro ao criar pet:', error);
      if (axios.isAxiosError(error)) {
        console.error('Detalhes do erro:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
        
        // Se o erro for de validação, podemos extrair mensagens úteis
        if (error.response?.status === 400) {
          const validationErrors = error.response.data;
          console.error('Erros de validação:', validationErrors);
          throw new Error('Erro de validação: ' + JSON.stringify(validationErrors));
        }
      }
      throw error;
    }
  },

  async updatePet(id: number, pet: Partial<Pet>): Promise<Pet> {
    console.log(`Iniciando atualização do pet ID ${id}...`);
    console.log('Dados recebidos para atualização:', pet);
    
    try {
        const petData: any = { ...pet };
      
      if (pet.species) {
        petData.species = pet.species === 'CACHORRO' ? 'DOG' : 'CAT';
      }
      
      if (pet.birthDate) {
        petData.birthDate = new Date(pet.birthDate).toISOString().split('T')[0];
      }
      
        if (pet.weight !== undefined) {
        petData.weight = Number(pet.weight) || 0;
      }
      
      if (pet.tutorId) {
        petData.ownerId = pet.tutorId;
      }
      
      const { tutorId, tutor, createdAt, updatedAt, ...dataToSend } = petData;
      
      console.log('Dados formatados para envio ao backend:', dataToSend);
      
      const response = await api.put<Pet>(`/${id}`, dataToSend);
      
      const formattedPet: Pet = {
        ...response.data,
        species: response.data.species === 'DOG' ? 'CACHORRO' : 'GATO',
        tutorId: (response.data as any).ownerId,
        birthDate: response.data.birthDate ? 
          new Date(response.data.birthDate).toISOString().split('T')[0] : 
          null
      };
      
      console.log('Pet atualizado com sucesso:', formattedPet);
      return formattedPet;
    } catch (error) {
      console.error(`Erro ao atualizar pet ID ${id}:`, error);
      if (axios.isAxiosError(error)) {
        console.error('Detalhes do erro:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw error;
    }
  },

  async deletePet(id: number): Promise<void> {
    console.log(`Iniciando exclusão do pet ID ${id}...`);
    try {
      await api.delete(`/${id}`);
      console.log(`Pet ID ${id} excluído com sucesso`);
    } catch (error) {
      console.error(`Erro ao excluir pet ID ${id}:`, error);
      if (axios.isAxiosError(error)) {
        console.error('Detalhes do erro:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
        
        if (error.response?.status === 404) {
          console.warn(`Pet ID ${id} não encontrado (pode já ter sido excluído)`);
          return; 
        }
      }
      throw error;
    }
  },

  async searchPets(name: string): Promise<Pet[]> {
    console.log(`Buscando pets com o nome: ${name}`);
    try {
      interface ApiPet {
        id?: number;
        name: string;
        species: string;
        breed: string;
        birthDate: string | null;
        color: string;
        weight: number;
        ownerId: number;
        tutor?: Tutor;
        createdAt?: string;
        updatedAt?: string;
      }
      
      const response = await api.get<ApiPet[]>('/search', {
        params: { name }
      });
      
      console.log('Pets encontrados no backend:', response.data);
      
      const formattedPets: Pet[] = response.data.map(pet => ({
        ...pet,
        species: pet.species === 'DOG' ? 'CACHORRO' : 'GATO',
        tutorId: pet.ownerId,
        birthDate: pet.birthDate ? 
          new Date(pet.birthDate).toISOString().split('T')[0] : 
          null
      }));
      
      console.log('Pets formatados para o frontend:', formattedPets);
      return formattedPets;
    } catch (error) {
      console.error('Erro ao buscar pets por nome:', error);
      if (axios.isAxiosError(error)) {
        console.error('Detalhes do erro:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw error;
    }
  }
};
