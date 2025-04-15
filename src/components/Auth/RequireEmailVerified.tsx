import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";

const RequireEmailVerified: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const session = useSession();
    const location = useLocation();
  
    const isVerified = session?.user?.email_confirmed_at;
  
    if (!session) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  
    if (!isVerified) {
      return <Navigate to="/verify-email" replace />;
    }
  
    return <>{children}</>;
  };
  

export default RequireEmailVerified;
