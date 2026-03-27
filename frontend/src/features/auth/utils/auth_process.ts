import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "../../dashboard/services/api/utils";

export function getCookie(name: string): string {
  const v = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
  return v ? (v.pop() ?? "") : "";
}

export const getAuthUrlPath = (name: string) => {
  return `/dinoauth/${name}/`;
};

export const dinoauth = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // allow to send HttpOnly cookie
  headers: {
    "X-CSRFToken": getCookie("csrf_token"),
  },
});

// take csrf_token into header automatically
dinoauth.interceptors.request.use((config) => {
  const csrfToken = getCookie("csrf_token");
  config.headers["X-CSRFToken"] = csrfToken;

  return config;
});

// automatically update access_token
dinoauth.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig;
    const requestUrl = originalRequest?.url || "";

    // Don't retry for login, logout, token refresh, or profile check endpoints
    const skipRetryUrls = [
      getAuthUrlPath("token"),
      getAuthUrlPath("token/refresh"),
      getAuthUrlPath("logout"),
    ];

    const shouldSkipRetry = skipRetryUrls.some((url) =>
      requestUrl.includes(url)
    );

    if (error.response?.status === 401 && !shouldSkipRetry) {
      try {
        await dinoauth.post(getAuthUrlPath("token/refresh"));
        return dinoauth(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);
