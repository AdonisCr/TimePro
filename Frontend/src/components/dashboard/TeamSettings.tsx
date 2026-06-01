import { useState, useEffect } from 'react';
import { Users, Plus, Mail, X, ChevronRight, Shield, UserCog, Trash2, Loader2, UserPlus } from 'lucide-react';
import api from '../../lib/axios';

interface User {
  id: number;
  name: string;
  email: string;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  pivot: {
    role: 'admin' | 'member' | 'viewer';
    joined_at: string;
  };
}

interface TeamInvitation {
  id: number;
  email: string;
  role: string;
  invited_by: number;
  expires_at: string;
  accepted_at: string | null;
}

interface Team {
  id: number;
  name: string;
  description: string | null;
  owner_id: number;
  owner: User;
  members: TeamMember[];
  projects: { id: number; name: string }[];
  invitations: TeamInvitation[];
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  member: 'Membre',
  viewer: 'Lecteur',
};

const ROLE_ICONS: Record<string, typeof Shield> = {
  admin: Shield,
  member: Users,
  viewer: UserCog,
};

const TeamSettings: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api.get('/user').then(res => setUser(res.data)).catch(() => {});
    setLoading(true);
    api.get('/teams')
      .then(res => {
        const tms: Team[] = res.data;
        setTeams(tms);
        if (tms.length > 0 && !selectedTeamId) setSelectedTeamId(tms[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectedTeam = teams.find(t => t.id === selectedTeamId) || null;
  const currentMember = selectedTeam?.members.find(m => m.id === user?.id);
  const isAdmin = currentMember?.pivot.role === 'admin';

  const handleCreateTeam = () => {
    if (!createName.trim()) return;
    api.post('/teams', { name: createName })
      .then(res => {
        setTeams(prev => [res.data, ...prev]);
        setSelectedTeamId(res.data.id);
        setShowCreateModal(false);
        setCreateName('');
      })
      .catch(() => {});
  };

  const handleUpdateName = () => {
    if (!newName.trim() || !selectedTeam) return;
    api.put(`/teams/${selectedTeam.id}`, { name: newName })
      .then(res => {
        setTeams(prev => prev.map(t => t.id === selectedTeam.id ? res.data : t));
        setEditingName(false);
      })
      .catch(() => {});
  };

  const handleInvite = () => {
    if (!inviteEmail.trim() || !selectedTeam) return;
    setInviting(true);
    setInviteError('');
    api.post(`/teams/${selectedTeam.id}/members`, { email: inviteEmail })
      .then(res => {
        setTeams(prev => prev.map(t => t.id === selectedTeam.id ? res.data : t));
        setInviteEmail('');
      })
      .catch(err => {
        setInviteError(err.response?.data?.message || 'Erreur lors de l\'invitation');
      })
      .finally(() => setInviting(false));
  };

  const handleRemoveMember = (member: TeamMember) => {
    if (!selectedTeam) return;
    api.delete(`/teams/${selectedTeam.id}/members/${member.id}`)
      .then(() => {
        setTeams(prev => prev.map(t => {
          if (t.id !== selectedTeam.id) return t;
          return { ...t, members: t.members.filter(m => m.id !== member.id) };
        }));
      })
      .catch(() => {});
  };

  const handleChangeRole = (member: TeamMember, role: string) => {
    if (!selectedTeam) return;
    api.patch(`/teams/${selectedTeam.id}/members/${member.id}`, { role })
      .then(() => {
        setTeams(prev => prev.map(t => {
          if (t.id !== selectedTeam.id) return t;
          return {
            ...t,
            members: t.members.map(m => m.id === member.id ? { ...m, pivot: { ...m.pivot, role: role as 'admin' | 'member' | 'viewer' } } : m),
          };
        }));
      })
      .catch(() => {});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Équipe</h1>
          <p className="text-text-soft mt-1">Gérez vos équipes et collaborateurs</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Créer une équipe</span>
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-dark mb-2">Aucune équipe</h3>
          <p className="text-text-soft mb-6">Créez votre première équipe pour collaborer</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Créer une équipe
          </button>
        </div>
      ) : (
        <div className="flex gap-6">
          <div className="w-64 shrink-0 space-y-1">
            {teams.map(team => (
              <button
                key={team.id}
                onClick={() => setSelectedTeamId(team.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  selectedTeamId === team.id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-text-soft hover:bg-gray-50 hover:text-text-dark'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  selectedTeamId === team.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{team.name}</div>
                  <div className="text-xs text-text-soft">{team.members.length} membre{team.members.length > 1 ? 's' : ''}</div>
                </div>
                <ChevronRight className={`w-4 h-4 ${selectedTeamId === team.id ? 'text-primary' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>

          {selectedTeam && (
            <div className="flex-1 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center text-2xl font-bold text-white">
                      {selectedTeam.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      {editingName ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                            autoFocus
                          />
                          <button onClick={handleUpdateName} className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium">OK</button>
                          <button onClick={() => setEditingName(false)} className="px-3 py-1.5 text-text-soft hover:text-text-dark text-sm">Annuler</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-text-dark">{selectedTeam.name}</h2>
                          {isAdmin && (
                            <button onClick={() => { setNewName(selectedTeam.name); setEditingName(true); }} className="p-1 hover:bg-gray-100 rounded transition-colors">
                              <svg className="w-4 h-4 text-text-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                          )}
                        </div>
                      )}
                      <p className="text-sm text-text-soft">
                        {selectedTeam.members.length} membre{selectedTeam.members.length > 1 ? 's' : ''}
                        {selectedTeam.projects.length > 0 && ` · ${selectedTeam.projects.length} projet${selectedTeam.projects.length > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <label className="flex items-center gap-2 text-sm font-semibold text-text-dark mb-3">
                      <UserPlus className="w-4 h-4" />
                      Inviter un membre
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-soft" />
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={e => { setInviteEmail(e.target.value); setInviteError(''); }}
                          placeholder="email@exemple.com"
                          onKeyDown={e => e.key === 'Enter' && handleInvite()}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                        />
                      </div>
                      <button
                        onClick={handleInvite}
                        disabled={inviting || !inviteEmail.trim()}
                        className="px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                      >
                        {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Inviter
                      </button>
                    </div>
                    {inviteError && <p className="text-sm text-red-500 mt-2">{inviteError}</p>}
                  </div>
                )}

                <h3 className="font-semibold text-text-dark mb-4">Membres</h3>
                <div className="space-y-1">
                  {selectedTeam.members.map(member => {
                    const RoleIcon = ROLE_ICONS[member.pivot.role] || Users;
                    const isOwner = member.id === selectedTeam.owner_id;
                    return (
                      <div key={member.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white font-semibold text-sm">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-text-dark">{member.name}</span>
                              {isOwner && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Propriétaire</span>
                              )}
                            </div>
                            <p className="text-sm text-text-soft">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isAdmin && !isOwner ? (
                            <select
                              value={member.pivot.role}
                              onChange={e => handleChangeRole(member, e.target.value)}
                              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="admin">Admin</option>
                              <option value="member">Membre</option>
                              <option value="viewer">Lecteur</option>
                            </select>
                          ) : (
                            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                              member.pivot.role === 'admin' ? 'bg-purple-50 text-purple-700' :
                              member.pivot.role === 'member' ? 'bg-blue-50 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              <RoleIcon className="w-3 h-3" />
                              {ROLE_LABELS[member.pivot.role]}
                            </span>
                          )}
                          {isAdmin && !isOwner && (
                            <button
                              onClick={() => handleRemoveMember(member)}
                              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                              title="Retirer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedTeam.invitations && selectedTeam.invitations.filter(i => !i.accepted_at).length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="font-semibold text-text-dark mb-3">Invitations en attente</h3>
                    <div className="space-y-2">
                      {selectedTeam.invitations.filter(i => !i.accepted_at).map(inv => (
                        <div key={inv.id} className="flex items-center justify-between py-2 px-3 bg-amber-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                              <Mail className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-dark">{inv.email}</p>
                              <p className="text-xs text-amber-600">
                                Expire le {new Date(inv.expires_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">En attente</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-text-dark">Nouvelle équipe</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-text-soft" />
              </button>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleCreateTeam(); }} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-text-dark mb-2">Nom de l'équipe *</label>
                <input
                  type="text"
                  value={createName}
                  onChange={e => setCreateName(e.target.value)}
                  placeholder="Ex: Design, Marketing, Dev..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                  required
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-6 py-3 border border-gray-200 text-text-soft font-semibold rounded-xl hover:bg-gray-50 transition-colors">Annuler</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-colors">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamSettings;
