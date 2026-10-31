import { useState } from 'react';
import { useTags } from '../../hooks/useTags';
import { Plus, X } from 'lucide-react';

interface TagsInputProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TagsInput = ({ selectedTags, onTagsChange }: TagsInputProps) => {
  const { tags, addTag } = useTags();
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState({ name: '', color: '#00B4DB' });

  const handleAdd = () => {
    if (newTag.name.trim()) {
      addTag(newTag);
      setNewTag({ name: '', color: '#00B4DB' });
      setIsAdding(false);
    }
  };

  const handleToggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(t => t !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tagId => {
            const tag = tags.find(t => t.id === tagId);
            if (!tag) return null;
            
            return (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
                <button
                  onClick={() => handleToggleTag(tag.id)}
                  className="hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Available tags */}
      <div className="flex flex-wrap gap-2">
        {tags.filter(t => !selectedTags.includes(t.id)).map(tag => (
          <button
            key={tag.id}
            onClick={() => handleToggleTag(tag.id)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border border-gray-200 text-text-soft hover:border-gray-300 transition-colors"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
            {tag.name}
          </button>
        ))}
        
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border border-dashed border-gray-300 text-text-soft hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="w-3 h-3" />
          Ajouter
        </button>
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <input
            type="color"
            value={newTag.color}
            onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
            className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
          />
          <input
            type="text"
            placeholder="Nom du tag"
            value={newTag.name}
            onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            autoFocus
          />
          <button
            onClick={handleAdd}
            disabled={!newTag.name.trim()}
            className="px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
          >
            Ajouter
          </button>
          <button
            onClick={() => setIsAdding(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TagsInput;
