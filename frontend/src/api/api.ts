import useTokenStore from "@/store";
import type { LoginData, RegisterData } from "@/types/auth";
import type { CreatePostData } from "@/types/post";
import axios from "axios";


const environment = import.meta.env.VITE_ENVIRONMENT;

export const baseURL =
  environment === "local"
    ? import.meta.env.VITE_BASE_URL
    : import.meta.env.VITE_PROD_URL;

export const mediaUrl =
  environment === "local"
    ? import.meta.env.VITE_MEDIA_LOCAL_URL
    : import.meta.env.VITE_MEDIA_PROD_URL;

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
  const formData = new FormData();
  formData.append("text_content", data.text_content ?? "");
  formData.append("is_private", data.is_private ? "1" : "0");
  if (data.images) {
    data.images.forEach((img) => formData.append("images[]", img));
  }
  return api.post("/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const getPosts = (page?: number) => {
  return api.get("/posts", { params: { page } });
};
export const togglePostLike = (postId: string | number) => {
  return api.get(`/posts/${postId}/like`);
};
export const getPostComments = (postId: string | number, page?: number) => {
  return api.get(`/posts/${postId}/comments`, { params: { page } });
};
export const commentPost = (postId: string | number, text_content: string) => {
  return api.post(`/posts/${postId}/comments`, { text_content });
};
export const postCommentDelete = (commentId: string | number) => {
  return api.delete(`/comments/${commentId}`);
};
export const toggleCommentLike = (commentId: string | number) => {
  return api.post(`/comments/${commentId}/like`);
};
export const getCommentReplies = (commentId: string | number, page?: number) => {
  return api.get(`/comments/${commentId}/replies`, { params: { page } });
};
export const replyComment = (commentId: string | number, text_content: string) => {
  return api.post(`/comments/${commentId}/replies`, { text_content });
};
// post likers
export const getPostLikers = (postId: string | number, page?: number) => {
  return api.get(`/posts/${postId}/likers`, { params: { page } });
};
// comment likers
export const getCommentLikers = (commentId: string | number, page?: number) => {
  return api.get(`/comments/${commentId}/likers`, { params: { page } });
};


