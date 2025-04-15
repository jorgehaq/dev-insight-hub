import { useState, useEffect, useCallback } from 'react';
import { endpoints } from '../api';

/**
 * Hook personalizado para realizar llamadas a la API con estados de carga y error
 * @param {Function} apiFunction - Función de la API a llamar
 * @param {Array} dependencies - Dependencias para recargar los datos (opcional)
 * @param {boolean} loadOnMount - Si debe cargar los datos al montar el componente
 * @returns {Object} Objeto con estados y funciones para manejar la API
 */
const useApi = (apiFunction, dependencies = [], loadOnMount = true) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(null);

  // Función para ejecutar la llamada a la API
  const executeRequest = useCallback(async (...args) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiFunction(...args);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error al realizar la solicitud');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiFunction]);

  // Efecto para cargar datos inicialmente o cuando cambien las dependencias
  useEffect(() => {
    if (loadOnMount && params !== null) {
      executeRequest(...params);
    }
  }, [...dependencies, params, loadOnMount]);

  // Función para recargar los datos con los mismos parámetros
  const refetch = useCallback(() => {
    if (params !== null) {
      return executeRequest(...params);
    }
    return Promise.resolve(null);
  }, [executeRequest, params]);

  // Función para establecer los parámetros y ejecutar la solicitud
  const execute = useCallback((...args) => {
    setParams(args);
    return executeRequest(...args);
  }, [executeRequest]);

  return {
    data,
    isLoading,
    error,
    execute,
    refetch,
    setData
  };
};

// Hooks específicos para cada recurso
export const useAuth = () => {
  const login = useApi(endpoints.auth.login, [], false);
  const getProfile = useApi(endpoints.auth.me, [], false);
  
  return {
    login: login.execute,
    getProfile: getProfile.execute,
    profile: getProfile.data,
    isLoadingProfile: getProfile.isLoading,
    profileError: getProfile.error
  };
};

export const useRepositories = (loadOnMount = true) => {
  const getAll = useApi(endpoints.repositories.getAll, [], loadOnMount);
  const getById = useApi(endpoints.repositories.getById, [], false);
  const create = useApi(endpoints.repositories.create, [], false);
  const update = useApi(endpoints.repositories.update, [], false);
  const remove = useApi(endpoints.repositories.delete, [], false);
  const analyze = useApi(endpoints.repositories.analyze, [], false);
  
  return {
    repositories: getAll.data,
    isLoading: getAll.isLoading,
    error: getAll.error,
    refetchRepositories: getAll.refetch,
    getRepository: getById.execute,
    createRepository: create.execute,
    updateRepository: update.execute,
    deleteRepository: remove.execute,
    analyzeRepository: analyze.execute,
    currentRepository: getById.data,
    isLoadingRepository: getById.isLoading,
    repositoryError: getById.error
  };
};

export const useAnalyses = (loadOnMount = true) => {
  const getAll = useApi(endpoints.analyses.getAll, [], loadOnMount);
  const getById = useApi(endpoints.analyses.getById, [], false);
  const getByRepository = useApi(endpoints.analyses.getByRepository, [], false);
  
  return {
    analyses: getAll.data,
    isLoading: getAll.isLoading,
    error: getAll.error,
    refetchAnalyses: getAll.refetch,
    getAnalysis: getById.execute,
    getRepositoryAnalyses: getByRepository.execute,
    currentAnalysis: getById.data,
    isLoadingAnalysis: getById.isLoading,
    analysisError: getById.error,
    repositoryAnalyses: getByRepository.data,
    isLoadingRepositoryAnalyses: getByRepository.isLoading,
    repositoryAnalysesError: getByRepository.error
  };
};

export default useApi;