import type { ApiError, Contact, CreateContactInput, UpdateContactInput } from "../types/contact";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

interface DataResponse<T> {
  data: T;
}

interface BackendErrorBody {
  error?: {
    message?: string;
    code?: string;
    details?: string;
  };
  message?: string;
  code?: string;
  details?: string;
}

export async function getHealth(): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.ok;
}

export async function getContacts(): Promise<Contact[]> {
  const response = await request<DataResponse<Contact[]>>("/api/contacts");
  return response.data;
}

export async function createContact(input: CreateContactInput): Promise<number> {
  const response = await request<DataResponse<{ id: number }>>("/api/contacts", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data.id;
}

export async function updateContact(id: number, input: UpdateContactInput): Promise<void> {
  await request<DataResponse<{ id: number; updated: boolean }>>(`/api/contacts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });
  } catch {
    throw toApiError("Unable to reach the integration server.");
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return response.json() as Promise<T>;
}

async function parseApiError(response: Response): Promise<ApiError> {
  let body: BackendErrorBody | undefined;

  try {
    body = (await response.json()) as BackendErrorBody;
  } catch {
    return toApiError("Odoo could not complete the request. Please try again.", response.status);
  }

  const error = body.error ?? body;
  const message =
    error.details ||
    error.message ||
    (response.status >= 500
      ? "Odoo could not complete the request. Please try again."
      : "The request could not be completed.");

  return {
    message,
    code: error.code,
    details: error.details,
    status: response.status,
  };
}

function toApiError(message: string, status?: number): ApiError {
  return { message, status };
}
