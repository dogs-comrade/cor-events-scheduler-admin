import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:8282/api/v1';

interface ApiError {
  error: string;
  details?: Record<string, string>;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      // Обработка известных ошибок от сервера
      const errorMessage = error.response.data?.error || 'Произошла ошибка при выполнении запроса';
      const errorDetails = error.response.data?.details;
      
      const enhancedError = new Error(errorMessage) as any;
      enhancedError.details = errorDetails;
      enhancedError.status = error.response.status;
      
      return Promise.reject(enhancedError);
    }
    
    if (error.request) {
      // Ошибка сети или сервер не ответил
      return Promise.reject(new Error('Не удалось связаться с сервером. Проверьте подключение к интернету.'));
    }
    
    // Что-то случилось при настройке запроса
    return Promise.reject(new Error('Произошла ошибка при отправке запроса.'));
  }
);