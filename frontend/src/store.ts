import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";


export interface AuthUser {
  id: number | null;
  first_name: string;
  last_name: string;
  email: string;
}

export interface TokenStore {
  token: string;
  user: AuthUser | null;
  isUserLoading: boolean;
  setToken: (data: string) => void;
  setUser: (user: AuthUser | null) => void;
  setIsUserLoading: (isLoading: boolean) => void;
  clearSession: () => void;
}

const useTokenStore = create<TokenStore>()(
  
  devtools(
    persist(
      (set) => ({
        token: "",
        user: null,
        isUserLoading: false,
        setToken: (data: string) => set(() => ({ token: data })),
        setUser: (user: AuthUser | null) => set(() => ({ user })),
        setIsUserLoading: (isLoading: boolean) =>
          set(() => ({ isUserLoading: isLoading })),
        clearSession: () =>
          set(() => ({
            token: "",
            user: null,
            isUserLoading: false,
      
          })),
      }),
      { name: "token-store" }
    )
  )
);
export default useTokenStore;
