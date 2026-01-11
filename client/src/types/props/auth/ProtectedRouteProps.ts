import React from "react";

export interface ProtectedRouteProps{
  children: React.ReactNode;
  requiredRole: string;
  redirectTo?: string;
};