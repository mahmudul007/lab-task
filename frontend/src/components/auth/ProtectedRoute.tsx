import useTokenStore from "@/store";
import { Navigate, Outlet } from "react-router-dom";
import { useTokenValidation } from "@/components/hooks/useTokenValidation";

const ProtectedRoutes = () => {
  useTokenValidation();
  const token = useTokenStore((state) => state.token);
  const isUserLoading = useTokenStore((state) => state.isUserLoading);

  if (isUserLoading) {
    return (
      <p>Authenticating...........</p>
    );
  }

  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;
