import React, { useState, useEffect } from 'react';
import { X, Calendar, MessageSquare, Plus, Check, Trash2, Edit2, Link2 } from 'lucide-react';
import { useTaskComments } from '../../hooks/useTaskComments';

interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  project_id: number | null;
  parent_id: number | null;
  depends_on: number | null;
  is_completed: boolean;
  recurrence: string;
  project?: { id: number; name: string; color: string };
  parent?: { id: number; title: string };
  dependsTask?: { id: number; title: string };
  subtasks?: Task[];
}

interface Project {
  id: number;
  name: string;
  color: string;
}

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: any) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  projects?: Project[];
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose, onUpdate, onDelete, projects = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [newComment, setNewComment] = useState('');
  const { comments, fetchComments, addComment, deleteComment } = useTaskComments();

  useEffect(() => {
    if (task) {
      setEditData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        due_date: task.due_date,
        project_id: task.project_id,
      });
      fetchComments(task.id);
    }
  }, [task]);

  const handleSave = async () => {
    if (task) {
      await onUpdate(task.id, editData);
      setIsEditing(false);
    }
  };

  const handleAddComment = async () => {
    if (task && newComment.trim()) {
      await addComment(task.id, newComment.trim());
      setNewComment('');
    }
  };

  const handleToggleSubtask = async (subtaskId: number, isCompleted: boolean) => {
    if (task) {
      await onUpdate(subtaskId, { is_completed: !isCompleted });
    }
  };

  const handleDeleteSubtask = async (subtaskId: number) => {
    if (task) {
      await onDelete(subtaskId);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'todo': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'done': return 'Terminée';
      case 'in_progress': return 'En cours';
      case 'todo': return 'À faire';
      default: return status;
    }
  };

  const getRecurrenceLabel = (recurrence: string) => {
    switch (recurrence) {
      case 'daily': return 'Quotidienne';
      case 'weekly': return 'Hebdomadaire';
      case 'monthly': return 'Mensuelle';
      default: return 'Aucune';
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
          {isEditing ? (
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="text-2xl font-bold text-text-dark border-b-2 border-primary focus:outline-none"
            />
          ) : (
            <h2 className="text-2xl font-bold text-text-dark">{task.title}</h2>
          )}
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6 text-text-soft" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                {getStatusLabel(task.status)}
              </span>
            </div>
            {task.recurrence !== 'none' && (
              <div className="flex items-center gap-2 text-text-soft text-xs">
                <Calendar className="w-4 h-4" />
                {getRecurrenceLabel(task.recurrence)}
              </div>
            )}
            {task.project && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: task.project.color }}></div>
                <span className="text-sm text-text-soft">{task.project.name}</span>
              </div>
            )}
          </div>

          {task.description && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-text-dark">{task.description}</p>
            </div>
          )}

          {(task.parent || task.dependsTask || task.due_date) && (
            <div className="space-y-2">
              {task.parent && (
                <div className="flex items-center gap-2 text-sm text-text-soft">
                  <Link2 className="w-4 h-4" />
                  Sous-tâche de: <span className="font-medium text-text-dark">{task.parent.title}</span>
                </div>
              )}
              {task.dependsTask && (
                <div className="flex items-center gap-2 text-sm text-text-soft">
                  <Link2 className="w-4 h-4" />
                  Dépend de: <span className="font-medium text-text-dark">{task.dependsTask.title}</span>
                </div>
              )}
              {task.due_date && (
                <div className="flex items-center gap-2 text-sm text-text-soft">
                  <Calendar className="w-4 h-4" />
                  Échéance: <span className="font-medium text-text-dark">
                    {new Date(task.due_date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-semibold text-text-dark mb-3 flex items-center gap-2">
              <Check className="w-5 h-5" />
              Sous-tâches ({task.subtasks?.length || 0})
            </h3>
            {task.subtasks && task.subtasks.length > 0 ? (
              <div className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <button
                      onClick={() => handleToggleSubtask(subtask.id, subtask.is_completed)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        subtask.is_completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                      }`}
                    >
                      {subtask.is_completed && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className={`flex-1 ${subtask.is_completed ? 'line-through text-text-soft' : 'text-text-dark'}`}>
                      {subtask.title}
                    </span>
                    <button onClick={() => handleDeleteSubtask(subtask.id)} className="p-1 text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-soft">Aucune sous-tâche</p>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-semibold text-text-dark mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Commentaires ({comments.length})
            </h3>
            <div className="space-y-3 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-dark">
                      {comment.user?.name || 'Utilisateur'}
                    </span>
                    <button onClick={() => deleteComment(comment.id)} className="p-1 text-text-soft hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-sm text-text-dark">{comment.content}</p>
                  <span className="text-xs text-text-soft">
                    {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Ajouter un commentaire..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleAddComment}
                className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex space-x-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => onDelete(task.id)}
              className="flex-1 px-6 py-3 border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors"
            >
              Supprimer
            </button>
            {isEditing ? (
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-colors"
              >
                Enregistrer
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 px-6 py-3 bg-gray-100 text-text-dark font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Modifier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;