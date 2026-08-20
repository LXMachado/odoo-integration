export interface Contact {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  is_company: boolean;
}

export interface CreateContactInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  is_company: boolean;
}

export interface UpdateContactInput {
  name?: string;
  email?: string | null;
  phone?: string | null;
  is_company?: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: string;
  status?: number;
}
