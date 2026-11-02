import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { Loader2 } from 'lucide-react';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    // Évite un double appel en React StrictMode : le code est à usage unique.
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        navigate('/login?error=oauth_failed');
        return;
      }

      if (!code) {
        navigate('/login');
        return;
      }

      try {
        // Échange le code à usage unique contre un token : le token ne
        // transite jamais par l'URL.
        const response = await api.post('/auth/oauth/exchange', { code });
        login(response.data.access_token, response.data.user);
        navigate('/dashboard');
      } catch {
        navigate('/login?error=oauth_failed');
      }
    };

    run();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
        <p className="text-text-soft">Connexion en cours...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
