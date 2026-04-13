const API_BASE_URL = '/api/v1';
const NOT_FOUND_ROUTE = '/404';
const LOGIN_ROUTE = '/login';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
};

const isAuthEndpoint = (endpoint: string): boolean => {
  return endpoint.startsWith('/auth/');
};

const shouldRedirectToLogin = (status: number, endpoint: string): boolean => {
  if (status !== 401 || isAuthEndpoint(endpoint)) {
    return false;
  }

  const currentPath = window.location.pathname;
  return currentPath !== LOGIN_ROUTE && currentPath !== '/registration';
};

const shouldRedirectToNotFound = (status: number, endpoint: string): boolean => {
  if (status !== 403 || isAuthEndpoint(endpoint)) {
    return false;
  }

  const currentPath = window.location.pathname;
  return currentPath !== LOGIN_ROUTE && currentPath !== '/registration' && currentPath !== NOT_FOUND_ROUTE;
};

const redirectToLogin = () => {
  removeAuthToken();
  window.location.replace(LOGIN_ROUTE);
};

const redirectToNotFound = () => {
  window.location.replace(NOT_FOUND_ROUTE);
};

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  return baseApiRequest<T>(endpoint, options, true);
};

export const apiRequestPreserveErrors = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  return baseApiRequest<T>(endpoint, options, false);
};

const baseApiRequest = async <T>(
  endpoint: string,
  options: RequestInit,
  redirectOnForbidden: boolean
): Promise<T> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    if (shouldRedirectToLogin(response.status, endpoint)) {
      redirectToLogin();
      throw new Error('Unauthorized');
    }

    if (redirectOnForbidden && shouldRedirectToNotFound(response.status, endpoint)) {
      redirectToNotFound();
      throw new Error('Access denied');
    }

    const error = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`,
    }));
    throw new Error(error.message || 'API request failed');
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

export const uploadFile = async <T>(
  endpoint: string,
  formData: FormData
): Promise<T> => {
  const token = getAuthToken();
  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    if (shouldRedirectToLogin(response.status, endpoint)) {
      redirectToLogin();
      throw new Error('Unauthorized');
    }

    if (shouldRedirectToNotFound(response.status, endpoint)) {
      redirectToNotFound();
      throw new Error('Access denied');
    }

    const error = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`,
    }));
    throw new Error(error.message || 'File upload failed');
  }

  return response.json();
};

export const downloadFile = async (endpoint: string): Promise<Blob> => {
  const token = getAuthToken();
  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    if (shouldRedirectToLogin(response.status, endpoint)) {
      redirectToLogin();
      throw new Error('Unauthorized');
    }

    if (shouldRedirectToNotFound(response.status, endpoint)) {
      redirectToNotFound();
      throw new Error('Access denied');
    }

    throw new Error('File download failed');
  }

  return response.blob();
};
