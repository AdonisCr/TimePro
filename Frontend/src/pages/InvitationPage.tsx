import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Users, ArrowRight } from 'lucide-react';
import api from '../lib/axios';

interface InvitationData {
  team_name: string;
  invited_by: string;
  email: string;
  token: string;
}

const InvitationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [authToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    if (!token) return;
    api.get(`/invitations/${token}`)
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.message || 'Invitation invalide'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = () => {
    if (!token) return;
    setAccepting(true);
    api.post(`/invitations/${token}/accept`)
      .then(() => {
        setAccepted(true);
        setTimeout(() => navigate('/dashboard'), 2000);
      })
      .catch(err => setError(err.response?.data?.message || 'Erreur'))
      .finally(() => setAccepting(false));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-dark mb-2">Invitation invalide</h1>
          <p className="text-text-soft mb-6">{error}</p>
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
            Retour à l'accueil <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-dark mb-2">Invitation acceptée !</h1>
          <p className="text-text-soft">Vous êtes maintenant membre de <strong>{data?.team_name}</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 max-w-md w-full">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Users className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-text-dark text-center mb-2">
          Invitation à rejoindre
        </h1>
        <p className="text-xl font-semibold text-primary text-center mb-6">
          {data?.team_name}
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-text-soft text-center">
          Invité par <strong className="text-text-dark">{data?.invited_by}</strong>
          <br />
          <span className="text-xs">{data?.email}</span>
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center mb-4">{error}</p>
        )}

        {authToken ? (
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full bg-primary hover:bg-primary-hover disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {accepting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            {accepting ? 'Acceptation...' : 'Accepter l\'invitation'}
          </button>
        ) : (
          <div className="space-y-3">
            <Link
              to={`/login?redirect=/invitation/${token}`}
              className="block w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-semibold text-center transition-colors"
            >
              Se connecter
            </Link>
            <Link
              to={`/signup?redirect=/invitation/${token}`}
              className="block w-full border border-primary text-primary hover:bg-primary/5 py-3 rounded-xl font-semibold text-center transition-colors"
            >
              Créer un compte
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationPage;
