const CONNECTION_MSG =
  "Não foi possível conectar à API. Verifique se o backend está em execução.";
const TIMEOUT_MSG = "A requisição expirou. Tente novamente.";
const SERVER_MSG = "Servidor indisponível. Tente novamente em instantes.";

interface ApiErrorShape {
  response?: {
    status?: number;
    data?: { error?: string };
  };
  code?: string;
  message?: string;
}

export function extractApiError(err: unknown, fallback = "Ocorreu um erro inesperado."): string {
  const error = err as ApiErrorShape;

  if (!error.response) {
    if (error.code === "ECONNABORTED" || error.message?.toLowerCase().includes("timeout")) {
      return TIMEOUT_MSG;
    }
    return CONNECTION_MSG;
  }

  const status = error.response.status;
  if (status && status >= 500) {
    const serverErr = error.response.data?.error || SERVER_MSG;
    return status ? `${serverErr} (HTTP ${status})` : serverErr;
  }

  const apiErr = error.response.data?.error;
  if (apiErr) {
    return status ? `${apiErr} (HTTP ${status})` : apiErr;
  }

  return status ? `${fallback} (HTTP ${status})` : fallback;
}
