import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
