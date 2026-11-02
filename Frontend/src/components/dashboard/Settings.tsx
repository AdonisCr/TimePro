import React, { useState, useRef, useCallback } from 'react';
import { User, Bell, Shield, Save, Eye, EyeOff, LogOut, Camera, Moon, Sun, Monitor, Loader2, Check, ZoomIn, ZoomOut } from 'lucide-react';
import api from '../../lib/axios';
import { useTheme } from '../../context/ThemeContext';

interface UserData {
  id: number;
  name: string;
  email: string;
  profile_photo_url: string | null;
  profile_photo_path: string | null;
}

interface SettingsProps {
  user?: UserData | null;
  onLogout: () => void;
  onProfileUpdate?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onLogout, onProfileUpdate }) => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  // Demandé uniquement si l'adresse email change.
  const [emailPassword, setEmailPassword] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(user?.profile_photo_url || null);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cropModal, setCropModal] = useState<{
    file: File;
    imageUrl: string;
  } | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const CROP_SIZE = 280;

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setCropModal({ file, imageUrl });
    setCropZoom(1);
    setCropPos({ x: 0, y: 0 });
    if (e.target) e.target.value = '';
  };

  const getCropBox = () => {
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container) return null;

    const dispW = img.clientWidth;
    const dispH = img.clientHeight;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const scaleX = natW / dispW;
    const scaleY = natH / dispH;

    const cropLeft = (CROP_SIZE / 2 - dispW / 2 - cropPos.x) * -1;
    const cropTop = (CROP_SIZE / 2 - dispH / 2 - cropPos.y) * -1;

    const sx = Math.max(0, cropLeft * scaleX);
    const sy = Math.max(0, cropTop * scaleY);
    const sw = Math.min(natW - sx, CROP_SIZE * scaleX);
    const sh = Math.min(natH - sy, CROP_SIZE * scaleY);

    return { sx, sy, sw, sh, img };
  };

  const handleCropConfirm = async () => {
    const box = getCropBox();
    if (!box || !cropModal) return;

    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;

    ctx.save();
    ctx.beginPath();
    ctx.arc(150, 150, 150, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(box.img, box.sx, box.sy, box.sw, box.sh, 0, 0, 300, 300);
    ctx.restore();

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (!blob) return;

    const croppedFile = new File([blob], cropModal.file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
    URL.revokeObjectURL(cropModal.imageUrl);
    setCropModal(null);

    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('avatar', croppedFile);

    try {
      const res = await api.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPhotoUrl(res.data.user.profile_photo_url);
      setSuccess('Photo de profil mise à jour');
      onProfileUpdate?.();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => {
    if (cropModal) URL.revokeObjectURL(cropModal.imageUrl);
    setCropModal(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropPos.x, y: e.clientY - cropPos.y });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setCropPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handleMouseUp = () => setIsDragging(false);

  const handleAvatarDelete = async () => {
    setUploading(true);
    try {
      await api.delete('/user/avatar');
      setPhotoUrl(null);
      setSuccess('Photo de profil supprimée');
      onProfileUpdate?.();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Erreur');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    const emailChanged = profileData.email.trim().toLowerCase() !== (user?.email || '').toLowerCase();

    if (emailChanged && !emailPassword) {
      setError('Saisissez votre mot de passe actuel pour changer d\'adresse email.');
      setLoading(false);
      return;
    }

    try {
      const payload: Record<string, string> = {
        name: profileData.name,
        email: profileData.email,
      };

      if (emailChanged) {
        payload.current_password = emailPassword;
      }

      const res = await api.put('/user', payload);
      setSuccess(res.data?.message || 'Profil mis à jour');
      setEmailPassword('');
      onProfileUpdate?.();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const firstError = e.response?.data?.errors
        ? Object.values(e.response.data.errors)[0]?.[0]
        : undefined;
      setError(firstError || e.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    if (passwordData.password !== passwordData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      await api.post('/user/password', {
        current_password: passwordData.current_password,
        password: passwordData.password,
        password_confirmation: passwordData.password_confirmation,
      });
      setSuccess('Mot de passe mis à jour');
      setPasswordData({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {profileData.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-white rounded-full">
                    <Camera className="w-4 h-4 text-text-dark" />
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text-dark">{profileData.name}</h3>
                <p className="text-text-soft">{profileData.email}</p>
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-sm text-primary hover:underline font-medium">
                    {uploading ? 'Upload...' : 'Changer la photo'}
                  </button>
                  {photoUrl && (
                    <button type="button" onClick={handleAvatarDelete} className="text-sm text-red-500 hover:underline font-medium">
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Nom</label>
                <input type="text" value={profileData.name} onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Email</label>
                <input type="email" value={profileData.email} onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" required />
              </div>
            </div>

            {profileData.email.trim().toLowerCase() !== (user?.email || '').toLowerCase() && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Mot de passe actuel (obligatoire pour changer d'email)
                </label>
                <input
                  type="password"
                  value={emailPassword}
                  onChange={e => setEmailPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 border border-amber-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="••••••••"
                />
                <p className="mt-2 text-xs text-amber-800">
                  Votre nouvelle adresse devra être vérifiée. Un message sera aussi envoyé à votre ancienne adresse.
                </p>
              </div>
            )}

            <div className="border-t border-gray-100 pt-6">
              <h4 className="font-semibold text-text-dark mb-4">Apparence</h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                    theme === 'light' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-primary' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${theme === 'light' ? 'text-primary' : 'text-text-dark'}`}>Clair</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('auto')}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                    theme === 'auto' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Monitor className={`w-6 h-6 ${theme === 'auto' ? 'text-primary' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${theme === 'auto' ? 'text-primary' : 'text-text-dark'}`}>Auto</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                    theme === 'dark' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-primary' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-primary' : 'text-text-dark'}`}>Sombre</span>
                </button>
              </div>
              <p className="text-xs text-text-soft mt-2 text-center">
                {theme === 'auto' ? '🌙 Passera en mode sombre automatiquement entre 20h et 7h' : 
                 theme === 'dark' ? '🌙 Mode sombre activé en permanence' : 
                 '☀️ Mode clair activé en permanence'}
              </p>
            </div>

            {success && <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">{success}</div>}
            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>}

            <div className="flex justify-end">
              <button type="submit" disabled={loading}
                className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Enregistrer</span>
              </button>
            </div>
          </form>
        );

      case 'security':
        return (
          <form onSubmit={handlePasswordUpdate} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-dark mb-4">Changer le mot de passe</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Mot de passe actuel</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={passwordData.current_password} autoComplete="current-password"
                      onChange={e => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-soft hover:text-text-dark">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Nouveau mot de passe</label>
                  <input type="password" value={passwordData.password} autoComplete="new-password"
                    onChange={e => setPasswordData({ ...passwordData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" minLength={8} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Confirmer le mot de passe</label>
                  <input type="password" value={passwordData.password_confirmation} autoComplete="new-password"
                    onChange={e => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" minLength={8} required />
                </div>
              </div>
            </div>

            {success && <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">{success}</div>}
            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>}

            <div className="flex justify-end">
              <button type="submit" disabled={loading}
                className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Mettre à jour</span>
              </button>
            </div>
          </form>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Notifications</h3>
            <p className="text-text-soft text-sm">Gérez vos préférences de notifications.</p>
            {[
              { label: 'Rappels de tâches', desc: 'Recevoir une notification avant l\'échéance d\'une tâche' },
              { label: 'Mentions', desc: 'Être notifié quand quelqu\'un vous mentionne' },
              { label: 'Invitations', desc: 'Notifications pour les invitations à rejoindre une équipe' },
              { label: 'Rapports hebdomadaires', desc: 'Recevoir un résumé de votre activité chaque semaine' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-text-dark text-sm">{item.label}</p>
                  <p className="text-xs text-text-soft">{item.desc}</p>
                </div>
                <div className="relative w-12 h-6 rounded-full bg-gray-300 cursor-not-allowed opacity-50">
                  <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow" />
                </div>
              </div>
            ))}
            <p className="text-xs text-text-soft italic mt-4">Configuration des notifications disponible prochainement.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Paramètres</h1>
          <p className="text-text-soft mt-1">Gérez votre compte et vos préférences</p>
        </div>
        <button onClick={onLogout} className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-left ${
                    activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-text-soft hover:bg-gray-50 hover:text-text-dark'
                  }`}>
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {cropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={handleCropCancel}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-dark">Ajuster la photo</h3>
              <button onClick={handleCropCancel} className="text-text-soft hover:text-text-dark text-xl leading-none">&times;</button>
            </div>

            <div className="flex justify-center gap-4 mb-4">
              <div
                ref={containerRef}
                className="relative overflow-hidden bg-gray-100 rounded-full select-none"
                style={{ width: CROP_SIZE, height: CROP_SIZE }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  ref={imageRef}
                  src={cropModal.imageUrl}
                  alt=""
                  className="absolute block pointer-events-none"
                  draggable={false}
                  onLoad={() => {
                    const img = imageRef.current;
                    if (!img) return;
                    const maxDim = CROP_SIZE;
                    if (img.naturalWidth >= img.naturalHeight) {
                      img.style.width = `${maxDim}px`;
                      img.style.height = 'auto';
                    } else {
                      img.style.width = 'auto';
                      img.style.height = `${maxDim}px`;
                    }
                    img.style.left = '50%';
                    img.style.top = '50%';
                    img.style.transform = 'translate(-50%, -50%)';
                  }}
                  style={{
                    transform: `translate(calc(-50% + ${cropPos.x}px), calc(-50% + ${cropPos.y}px)) scale(${cropZoom})`,
                  }}
                />
                <div className="absolute inset-0 rounded-full shadow-[0_0_0_999px_rgba(0,0,0,0.5)] pointer-events-none" />
              </div>
              <canvas id="crop-preview" className="w-24 h-24 rounded-full shadow" />
            </div>

            <div className="flex items-center justify-center gap-4 mt-4">
              <button onClick={() => setCropZoom(z => Math.max(z - 0.1, 0.3))} className="p-2 text-text-soft hover:text-text-dark rounded-lg hover:bg-gray-100">
                <ZoomOut className="w-5 h-5" />
              </button>
              <input
                type="range"
                min={30}
                max={300}
                value={Math.round(cropZoom * 100)}
                onChange={e => setCropZoom(Number(e.target.value) / 100)}
                className="w-40 accent-primary"
              />
              <button onClick={() => setCropZoom(z => Math.min(z + 0.1, 3))} className="p-2 text-text-soft hover:text-text-dark rounded-lg hover:bg-gray-100">
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-text-soft text-center mt-2">Faites glisser l'image pour la positionner</p>

            <div className="flex gap-3 mt-5">
              <button onClick={handleCropCancel} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-text-dark font-medium hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button onClick={handleCropConfirm} disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                <span>{uploading ? 'Upload...' : 'Appliquer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
