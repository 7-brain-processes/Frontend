import { translateApiMessage } from '../utils/translateApiMessage';

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

const isAuthEndpointWithoutToken = (endpoint: string): boolean => {
  return endpoint.startsWith('/auth/register') || endpoint.startsWith('/auth/login');
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

const parseJsonSafely = async <T>(response: Response): Promise<T | null> => {
  const contentLength = response.headers.get('content-length');
  if (contentLength === '0') {
    return null;
  }

  const text = await response.text();
  if (!text || !text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
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
  const skipAuthHeader = isAuthEndpointWithoutToken(endpoint);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (skipAuthHeader) {
    delete headers['Authorization'];
  } else if (token) {
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
      throw new Error(translateApiMessage('Unauthorized'));
    }

    if (redirectOnForbidden && shouldRedirectToNotFound(response.status, endpoint)) {
      redirectToNotFound();
      throw new Error(translateApiMessage('Access denied'));
    }

    const parsedError = await parseJsonSafely<{ message?: string }>(response);
    const error = parsedError || {
      message: `HTTP error! status: ${response.status}`,
    };
    throw new Error(translateApiMessage(error.message, 'Ошибка запроса к серверу'));
  }

  if (response.status === 204) {
    return {} as T;
  }

  const data = await parseJsonSafely<T>(response);
  if (data === null) {
    return {} as T;
  }

  return data;
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
      throw new Error(translateApiMessage('Unauthorized'));
    }

    if (shouldRedirectToNotFound(response.status, endpoint)) {
      redirectToNotFound();
      throw new Error(translateApiMessage('Access denied'));
    }

    const parsedError = await parseJsonSafely<{ message?: string }>(response);
    const error = parsedError || {
      message: `HTTP error! status: ${response.status}`,
    };
    throw new Error(translateApiMessage(error.message, 'Ошибка загрузки файла'));
  }

  const data = await parseJsonSafely<T>(response);
  if (data === null) {
    return {} as T;
  }

  return data;
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
      throw new Error(translateApiMessage('Unauthorized'));
    }

    if (shouldRedirectToNotFound(response.status, endpoint)) {
      redirectToNotFound();
      throw new Error(translateApiMessage('Access denied'));
    }

    throw new Error(translateApiMessage('File download failed'));
  }

  return response.blob();
};
