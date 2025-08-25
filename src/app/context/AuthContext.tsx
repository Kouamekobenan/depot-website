// "use client";
// import React, { createContext, useContext, useEffect, useState } from "react";
// import api from "../prisma/api";
// import { User } from "../types/type";
// interface AuthContextType {
//   user: User | null;
//   isAuthenticated: boolean;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<User>;
//   logout: () => void;
// }
// const AuthContext = createContext<AuthContextType | null>(null);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [isClient, setIsClient] = useState(false);
//   // Vérifier si on est côté client
//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   useEffect(() => {
//     // Ne s'exécute que côté client
//     if (!isClient) return;
//     const checkAuth = async () => {
//       try {
//         // Vérifier si electronAPI est disponible
//         if (typeof window === "undefined" || !window.electronAPI) {
//           console.log("ElectronAPI non disponible");
//           setLoading(false);
//           return;
//         }

//         const token = await window.electronAPI.getToken();
//         console.log("Token récupéré :", token);

//         if (!token) {
//           setLoading(false);
//           return;
//         }

//         const res = await api.get<User>("/auth/me", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         setUser(res.data);
//         console.log(res.data);
//         setIsAuthenticated(true);
//       } catch (error: unknown) {
//         console.error("Erreur lors de l'authentification :", error);
//         setUser(null);
//         setIsAuthenticated(false);
//         // Nettoyer le token invalide
//         if (window.electronAPI) {
//           await window.electronAPI.deleteToken();
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkAuth();
//   }, [isClient]);

//   const login = async (email: string, password: string): Promise<User> => {
//     try {
//       const response = await api.post("/auth/login", { email, password });
//       const token = response.data?.token?.access_token;

//       if (!token) {
//         throw new Error("Token non trouvé dans la réponse");
//       }

//       // Vérifier que electronAPI est disponible avant de l'utiliser
//       if (window.electronAPI) {
//         await window.electronAPI.setToken(token);
//       } else {
//         // Fallback: stocker dans localStorage si electronAPI n'est pas dispo
//         localStorage.setItem("auth_token", token);
//       }

//       setIsAuthenticated(true);

//       const userProfile = await api.get<User>("/auth/me", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setUser(userProfile.data);

//       // Notification seulement si electronAPI est disponible
//       if (window.electronAPI) {
//         window.electronAPI.notifyLoginSuccess(
//           "Connexion réussie",
//           `Bienvenue ${userProfile.data.name} !`
//         );
//       }

//       return userProfile.data;
//     } catch (error: unknown) {
//       console.error("Échec de la connexion :", error);
//       setUser(null);
//       setIsAuthenticated(false);
//       const message = "Identifiants incorrects";
//       throw new Error(message);
//     }
//   };

//   const logout = async () => {
//     try {
//       if (window.electronAPI) {
//         await window.electronAPI.deleteToken();
//       } else {
//         // Fallback: nettoyer localStorage
//         localStorage.removeItem("auth_token");
//       }
//     } catch (error) {
//       console.error("Erreur lors du logout :", error);
//     } finally {
//       setIsAuthenticated(false);
//       setUser(null);
//     }
//   };

//   // Affichage de chargement pendant l'hydratation
//   if (!isClient) {
//     return (
//       <AuthContext.Provider
//         value={{
//           user: null,
//           isAuthenticated: false,
//           loading: true,
//           login,
//           logout,
//         }}
//       >
//         {children}
//       </AuthContext.Provider>
//     );
//   }

//   return (
//     <AuthContext.Provider
//       value={{ user, isAuthenticated, loading, login, logout }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../types/type";
import api, { TokenManager } from "../prisma/api"; // Importez TokenManager depuis votre API

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>; // Fonction utile pour rafraîchir les données utilisateur
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer les données utilisateur
  const fetchUserProfile = async (token?: string): Promise<User | null> => {
    try {
      // Si pas de token fourni, essayer de le récupérer
      const authToken = token || (await TokenManager.getToken());
      if (!authToken) return null;

      const response = await api.get<User>("/auth/me");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      // Si erreur 401, le token sera automatiquement supprimé par l'intercepteur
      return null;
    }
  };

  // Vérifier auth au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const token = await TokenManager.getToken();

        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          return;
        }

        const userData = await fetchUserProfile(token);

        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Si pas d'utilisateur, nettoyer
          await TokenManager.deleteToken();
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification auth:", error);
        await TokenManager.deleteToken();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true);

      // Tentative de connexion
      const response = await api.post("/auth/login", { email, password });

      // Vérifier la structure de la réponse
      const token =
        response.data?.token?.access_token ||
        response.data?.access_token ||
        response.data?.token;

      if (!token) {
        throw new Error("Token manquant dans la réponse du serveur");
      }

      // Sauvegarder le token
      await TokenManager.setToken(token);

      // Récupérer le profil utilisateur
      const userProfile = await fetchUserProfile(token);

      if (!userProfile) {
        throw new Error("Impossible de récupérer le profil utilisateur");
      }

      // Mettre à jour l'état
      setUser(userProfile);
      setIsAuthenticated(true);

      // Notification desktop (Electron uniquement)
      if (
        typeof window !== "undefined" &&
        window.electronAPI &&
        window.electronAPI.notifyLoginSuccess
      ) {
        try {
          window.electronAPI.notifyLoginSuccess(
            "Connexion réussie",
            `Bienvenue ${userProfile.name || "utilisateur"}!`
          );
        } catch (notifError) {
          console.warn("Erreur notification Electron:", notifError);
        }
      }

      return userProfile;
    } catch (error: unknown) {
      console.error("Échec de la connexion:", error);

      // Nettoyer en cas d'erreur
      await TokenManager.deleteToken();
      setUser(null);
      setIsAuthenticated(false);

      // Type guard pour les erreurs Axios
      const isAxiosError = (
        err: unknown
      ): err is { response?: { status: number } } => {
        return typeof err === "object" && err !== null && "response" in err;
      };

      // Gérer différents types d'erreurs
      if (isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error("Identifiants incorrects");
        } else if (error.response && error.response.status >= 500) {
          throw new Error("Erreur serveur. Veuillez réessayer plus tard.");
        } else if (!error.response) {
          throw new Error(
            "Erreur de connexion. Vérifiez votre connexion internet."
          );
        }
      }

      // Récupérer le message d'erreur de manière sécurisée
      const errorMessage =
        error instanceof Error ? error.message : "Erreur lors de la connexion";
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      // Optionnel: appeler l'endpoint de déconnexion sur le serveur
      try {
        await api.post("/auth/logout");
      } catch (error) {
        console.warn("Erreur lors de la déconnexion serveur:", error);
        // On continue même si la déconnexion serveur échoue
      }

      // Nettoyer côté client
      await TokenManager.deleteToken();
      setIsAuthenticated(false);
      setUser(null);

      // Notification Electron
      if (
        typeof window !== "undefined" &&
        window.electronAPI &&
        window.electronAPI.notifyLoginSuccess
      ) {
        try {
          window.electronAPI.notifyLoginSuccess(
            "Déconnexion",
            "Vous avez été déconnecté avec succès"
          );
        } catch (notifError) {
          console.warn("Erreur notification déconnexion:", notifError);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour rafraîchir les données utilisateur
  const refreshUser = async (): Promise<void> => {
    try {
      if (!isAuthenticated) return;

      const userData = await fetchUserProfile();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement utilisateur:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Hook personnalisé pour vérifier si l'utilisateur est connecté (utile pour les guards)
export const useRequireAuth = () => {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Rediriger vers la page de connexion si pas authentifié
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }, [isAuthenticated, loading]);

  return { isAuthenticated, loading };
};