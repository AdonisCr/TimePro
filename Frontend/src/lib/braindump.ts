export type BrainDumpPriority = 'low' | 'medium' | 'high';

export type BrainDumpStatus = 'pending' | 'accepted' | 'rejected' | 'converted';

export interface BrainDumpItem {
  id: number;
  text: string;
  estimated_minutes: number;
  priority: BrainDumpPriority;
  status: BrainDumpStatus;
}

export interface BrainDumpItemPatch {
  estimated_minutes?: number;
  priority?: BrainDumpPriority;
  status?: 'pending' | 'accepted' | 'rejected';
}

export interface BrainDumpResponse {
  id: number;
  items: BrainDumpItem[];
}

export interface PlanBlock {
  task_id: number;
  title: string;
  start: string;
  end: string;
  minutes: number;
}

export interface Plan {
  date: string;
  blocks: PlanBlock[];
}

export interface ConfirmResponse {
  tasks: unknown[];
  plan: Plan;
}

export interface PlanningTodayResponse {
  date: string;
  blocks: PlanBlock[];
}
