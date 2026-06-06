import axios from "axios";

export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong"
): string => {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    return String(error.response.data.message);
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};
