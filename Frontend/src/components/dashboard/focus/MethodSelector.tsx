import { METHODS, type FocusMethod } from '../../../lib/focus';

interface MethodSelectorProps {
  value: FocusMethod;
  onChange: (method: FocusMethod) => void;
  disabled?: boolean;
}

const MethodSelector = ({ value, onChange, disabled = false }: MethodSelectorProps) => {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wider text-gray-400 text-center">
        Méthode de focus
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {METHODS.map((method) => {
          const isActive = method.id === value;
          return (
            <button
              key={method.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(method.id)}
              title={method.description}
              className={`px-3 py-2 rounded-xl text-left transition-colors border ${
                isActive
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
              } ${disabled && !isActive ? 'opacity-40 cursor-not-allowed' : ''} ${
                disabled ? 'cursor-not-allowed' : ''
              }`}
            >
              <span className="block text-sm font-semibold leading-tight">
                {method.label}
              </span>
              <span
                className={`block text-xs leading-tight ${
                  isActive ? 'text-white/80' : 'text-gray-400'
                }`}
              >
                {method.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MethodSelector;
