"use client";

import { AuthContext } from "@/context/AuthContext";
import { useContext } from "react";

// Hook personalizado para acceder al contexto de autenticación
export function useAuth() {
  return useContext(AuthContext);
}
