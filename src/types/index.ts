
// Tipos para espécies de pets (frontend e backend)
export type PetSpeciesFrontend = 'CACHORRO' | 'GATO';
export type PetSpeciesBackend = 'DOG' | 'CAT';

export interface Tutor {
  id?: number;
  name: string;
  nickname?: string;
  birthDate: string; // Formato 'YYYY-MM-DD'
  pets?: Pet[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Pet {
  id?: number;
  name: string;
  /**
   * Espécie do pet no formato do frontend ('CACHORRO' | 'GATO')
   * No backend, será convertido para 'DOG' | 'CAT'
   */
  species: PetSpeciesFrontend;
  breed: string;
  /**
   * Data de nascimento no formato 'YYYY-MM-DD'
   * Pode ser nulo se não informada
   */
  birthDate: string | null;
  color: string;
  weight: number;
  /**
   * ID do tutor (usado no frontend)
   * No backend, será mapeado para 'ownerId'
   */
  tutorId: number;
  /**
   * ID do dono (usado no backend)
   * No frontend, é mapeado de/para 'tutorId'
   */
  ownerId?: number;
  /**
   * Objeto do tutor relacionado (opcional, pode vir em consultas que incluem o relacionamento)
   */
  tutor?: Tutor;
  createdAt?: string;
  updatedAt?: string;
}

export interface Vacina {
  id?: number;
  type: string;
  date: string; // Formato 'YYYY-MM-DD'
  petId: number;
  pet?: Pet;
  createdAt?: string;
  updatedAt?: string;
}

// Tipos para formulários
export interface PetFormData extends Omit<Pet, 'id' | 'tutor' | 'ownerId' | 'createdAt' | 'updatedAt'> {
  // Campos adicionais específicos do formulário podem ser adicionados aqui
}

export interface TutorFormData extends Omit<Tutor, 'id' | 'pets' | 'createdAt' | 'updatedAt'> {
  // Campos adicionais específicos do formulário podem ser adicionados aqui
}

export interface VacinaFormData extends Omit<Vacina, 'id' | 'pet' | 'createdAt' | 'updatedAt'> {
  // Campos adicionais específicos do formulário podem ser adicionados aqui
}


export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}


export interface Pagination<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
