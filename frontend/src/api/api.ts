import useTokenStore from "@/store";
import type { LoginData, RegisterData } from "@/types/auth";
import type { CreatePostData } from "@/types/post";
import axios from "axios";


const environment = import.meta.env.VITE_ENVIRONMENT;

export const baseURL =
  environment === "local"
    ? import.meta.env.VITE_BASE_URL
    : import.meta.env.VITE_PROD_URL;

export const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useTokenStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Avoid redirect loops or page reloads when failing to login
      const isLoginRequest = error.config?.url?.includes("/login");

      const currentPath = window.location.pathname;
      const isLoginPage =
        currentPath.includes("/login") || currentPath === "/login";

      if (!isLoginRequest && !isLoginPage) {
        const tokenStore = useTokenStore.getState();
        tokenStore.setToken("");
        tokenStore.setUser(null);
        tokenStore.setIsUserLoading(false);
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
// register api
export const registerAPI = (data: RegisterData): Promise<any> => {
  return api.post("/auth/register", data);
};
export const logInAPI= (data: LoginData): Promise<any> => {
  return api.post("/auth/login", data);
};
export const getCurrentUser = () => {
  return api.get("/auth/me");
};
export const logOut = () => {
  return api.get("/auth/logout");
};
export const createPost = (data: CreatePostData): Promise<any> => {
  return api.post("/posts", data);
};
export const getPosts = () => {
  return api.get("/posts");
};
export const postLike = (postId: string) => {
  return api.post(`/posts/${postId}/like`);
};
export const postUnlike = (postId: string) => {
  return api.delete(`/posts/${postId}/like`);
};
export const commentPost = (postId: string, comment: string) => {
  return api.post(`/posts/${postId}/comment`, { comment });
};
export const postCommentDelete = (commentId: string) => {
  return api.delete(`/comments/${commentId}`);
};
export const commentLike = (commentId: string) => {
  return api.post(`/comments/${commentId}/like`);
};
export const commentUnlike = (commentId: string) => {
  return api.delete(`/comments/${commentId}/like`);
};

