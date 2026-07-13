
import { getCurrentUser } from "@/api/api";
import useTokenStore from "@/store";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useTokenValidation = () => {
  const token = useTokenStore((state) => state.token);
  const setToken = useTokenStore((state) => state.setToken);
  const setUser = useTokenStore((state) => state.setUser);
  const setIsUserLoading = useTokenStore((state) => state.setIsUserLoading);

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    const loadProfile = async () => {
      setIsUserLoading(true);
      try {
        const [userResponse] = await Promise.all([
          getCurrentUser(),
        ]);
        
        const payload = userResponse?.data?.data;
        console.log(payload)



        setUser({
          id: payload?.id ?? null,
          first_name: payload?.first_name ?? "",
          last_name: payload?.last_name ?? "",
          email: payload?.email ?? "",
        });
      } catch (error: any) {
        console.error("Failed to load user profile:", error);

        // Only redirect to login if it's a 401 (unauthorized) error
        // Don't redirect for network errors or other issues
        if (error?.response?.status === 401) {
          setToken("");
          setUser(null);
          navigate("/login");
        } else {
          // For other errors, just log but don't logout the user
          // The user data might already be in store from login
          console.warn("Non-401 error loading profile, keeping user logged in");
        }
      } finally {
        setIsUserLoading(false);
      }
    };

    loadProfile();
  }, [
    navigate,
    setIsUserLoading,
    setToken,
    setUser,
    token,
  ]);
};
