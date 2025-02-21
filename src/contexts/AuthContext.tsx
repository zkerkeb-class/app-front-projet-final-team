import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

interface User {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  image_url?: any;
  user_type: 'standard' | 'artist';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: FormData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t } = useTranslation();

  // Fonction pour vérifier le token et récupérer les informations utilisateur
  const verifyTokenAndGetUser = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/getMe`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Error verifying token:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('AuthProvider initializing...');
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      console.log('Stored credentials:', {
        hasToken: !!token,
      });

      if (token) {
        try {
          const userData = await verifyTokenAndGetUser(token);
          console.log('User data retrieved:', userData);
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('userId', userData.id.toString());
          localStorage.setItem('username', userData.username);
        } catch (error) {
          console.error('Error during initialization:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          localStorage.removeItem('username');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!accessToken || !refreshToken) {
        setLoading(false);
        setUser(null);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/getMe`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
      } else {
        try {
          await refreshAccessToken();
          const newAccessToken = localStorage.getItem('accessToken');
          const retryResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/getMe`,
            {
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            },
          );

          if (retryResponse.ok) {
            const userData = await retryResponse.json();
            setUser(userData);
            localStorage.setItem('userData', JSON.stringify(userData));
          } else {
            throw new Error(t('auth.errors.userDataFetchFailed'));
          }
        } catch (refreshError) {
          console.error('Erreur lors du rafraîchissement:', refreshError);
          logout();
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de l'authentification:",
        error,
      );
      logout();
    } finally {
      setLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('Pas de refresh token');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        },
      );

      if (!response.ok) {
        throw new Error('Échec du rafraîchissement du token');
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await response.json();
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      return newAccessToken;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      logout();
      throw error;
    }
  };

  const setupTokenRefresh = () => {
    // Rafraîchir le token toutes les 14 minutes (le token expire après 15 minutes)
    const REFRESH_INTERVAL = 14 * 60 * 1000;

    const intervalId = setInterval(async () => {
      try {
        if (user) {
          await refreshAccessToken();
        }
      } catch (error) {
        console.error('Erreur lors du rafraîchissement automatique:', error);
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login...');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        },
      );

      if (!response.ok) {
        throw new Error('Identifiants invalides');
      }

      const {
        user: userData,
        accessToken,
        refreshToken,
      } = await response.json();

      // Stocker toutes les informations nécessaires
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userId', userData.id.toString());
      localStorage.setItem('username', userData.username);

      setUser(userData);
      router.push('/');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const register = async (formData: FormData) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || t('auth.errors.registrationFailed'));
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userData', JSON.stringify(data.user));
      setUser(data.user);
      router.push('/');
    } catch (error: any) {
      throw new Error(error.message || t('auth.errors.registrationFailed'));
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    router.push('/auth/login');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth doit êêtre utilisé à l'intérieur d'un AuthProvider",
    );
  }
  return context;
}
