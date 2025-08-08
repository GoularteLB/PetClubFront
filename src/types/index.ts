// Tipos comuns para a aplicação

export interface Tutor {
  id?: number;
  name: string;
  nickname?: string;
  birthDate: string; // Formato: YYYY-MM-DD
  pets?: Pet[]; // Array de pets do tutor
  createdAt?: string;
  updatedAt?: string;
}

export interface Pet {
  id?: number;
  name: string;
  species: string;
  breed: string;
  birthDate: string | null;
  color: string;
  weight: number;
  tutorId: number;
  tutor?: Tutor;
  createdAt?: string;
  updatedAt?: string;
}

export interface Vacina {
  id?: number;
  type: string;
  date: string; // Formato: YYYY-MM-DD
  petId: number;
  pet?: Pet;
  createdAt?: string;
  updatedAt?: string;
}

// Tipos para formulários
export interface PetFormData extends Omit<Pet, 'id' | 'tutor' | 'createdAt' | 'updatedAt'> {}
export interface TutorFormData extends Omit<Tutor, 'id' | 'createdAt' | 'updatedAt'> {}
export interface VacinaFormData extends Omit<Vacina, 'id' | 'pet' | 'createdAt' | 'updatedAt'> {}

// Tipos para respostas da API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Tipos para erros da API
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Tipos para paginação
export interface Pagination<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
