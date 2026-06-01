import { useEffect, useState } from 'react';
import { Users, Loader2 } from 'lucide-react';
import api from '../../lib/axios';

interface MemberWorkload {
  user_id: number;
  user_name: string;
  user_email: string;
  total_seconds: number;
  entries_count: number;
  by_day: Record<string, number>;
  by_project: {
    project_id: number;
    project_name: string | null;
    project_color: string | null;
    total_seconds: number;
  }[];
}

interface WorkloadData {
  team_id: number;
  team_name: string;
  period: string;
  date_start: string;
  members: MemberWorkload[];
}

interface Team {
  id: number;
  name: string;
}

interface TeamMembership {
  team: Team;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${mins}min`;
  return `${hours}h${mins > 0 ? mins : ''}`;
};

const Workload: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [data, setData] = useState<WorkloadData | null>(null);
  const [loading, setLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(true);

  useEffect(() => {
    api.get('/teams/my')
      .then(res => {
        const tms: Team[] = res.data.map((m: TeamMembership) => m.team);
        setTeams(tms);
        if (tms.length > 0) setSelectedTeamId(tms[0].id);
      })
      .catch(() => {})
      .finally(() => setTeamsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedTeamId) return;
    setLoading(true);
    api.get(`/teams/${selectedTeamId}/workload`, { params: { period } })
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedTeamId, period]);

  const maxSeconds = data ? Math.max(...data.members.map(m => m.total_seconds), 1) : 1;

  if (teamsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-text-dark">Charge de travail</h1>
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-dark mb-2">Aucune équipe</h3>
          <p className="text-text-soft">Rejoignez ou créez une équipe pour voir la charge de travail</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Charge de travail</h1>
          <p className="text-text-soft mt-1">Temps enregistré par membre d'équipe</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTeamId ?? ''}
            onChange={e => setSelectedTeamId(Number(e.target.value))}
            className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden">
            {(['today', 'week', 'month'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  period === p ? 'bg-primary text-white' : 'text-text-soft hover:text-text-dark'
                }`}
              >
                {p === 'today' ? 'Aujourd\'hui' : p === 'week' ? 'Cette semaine' : 'Ce mois'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : data ? (
        <div className="space-y-4">
          {data.members.map(member => {
            const pct = maxSeconds > 0 ? (member.total_seconds / maxSeconds) * 100 : 0;
            return (
              <div key={member.user_id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {member.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-dark">{member.user_name}</h3>
                      <p className="text-sm text-text-soft">{member.entries_count} entrées</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-text-dark">{formatDuration(member.total_seconds)}</div>
                    <div className="text-xs text-text-soft">
                      {period === 'today' ? 'aujourd\'hui' : period === 'week' ? 'cette semaine' : 'ce mois'}
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {member.by_project.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-text-soft uppercase tracking-wider">Par projet</p>
                    {member.by_project.map(p => (
                      <div key={p.project_id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.project_color || '#00B4DB' }} />
                          <span className="text-text-dark">{p.project_name || 'Sans projet'}</span>
                        </div>
                        <span className="text-text-soft font-medium">{formatDuration(p.total_seconds)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default Workload;
