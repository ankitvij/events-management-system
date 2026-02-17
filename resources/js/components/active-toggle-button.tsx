import { CheckCircle2, Circle } from 'lucide-react';

type ActiveToggleButtonProps = {
    active?: boolean;
    onToggle: () => void;
    label: string;
    disabled?: boolean;
    size?: 'sm' | 'md';
};

export default function ActiveToggleButton({ active = false, onToggle, label, disabled = false, size = 'sm' }: ActiveToggleButtonProps) {
    const iconSize = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';

    return (
        <button
            type="button"
            className="btn-secondary"
            onClick={onToggle}
            aria-label={active ? `Set ${label} inactive` : `Set ${label} active`}
            title={active ? 'Set inactive' : 'Set active'}
            aria-pressed={active}
            disabled={disabled}
        >
            {active ? (
                <CheckCircle2 className={`${iconSize} text-green-600`} />
            ) : (
                <Circle className={`${iconSize} text-gray-400`} />
            )}
        </button>
    );
}
