
export interface Tutor {
  id?: number;
  name: string;
  nickname?: string;
  birthDate: string;
    pets?: Pet[];
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
  date: string;
  petId: number;
  pet?: Pet;
  createdAt?: string;
  updatedAt?: string;
}

export interface PetFormData extends Omit<Pet, 'id' | 'tutor' | 'createdAt' | 'updatedAt'> {}
export interface TutorFormData extends Omit<Tutor, 'id' | 'createdAt' | 'updatedAt'> {}
export interface VacinaFormData extends Omit<Vacina, 'id' | 'pet' | 'createdAt' | 'updatedAt'> {}


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
