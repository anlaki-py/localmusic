/**
 * Reusable menu item component for dropdown menus.
 * Used in sort menus, player menus, and navigation.
 */

import { clsx } from 'clsx';
import { Check, LucideIcon } from 'lucide-react';

interface MenuItemProps {
  /** Display label text */
  label: string;
  /** Whether this item is currently selected/active */
  isActive: boolean;
  /** Optional icon to display before the label */
  icon?: LucideIcon;
  /** Click handler */
  onClick: () => void;
  /** Whether the menu item is disabled */
  disabled?: boolean;
}

/**
 * A styled menu item for use in dropdown menus.
 * Shows a checkmark when active and optional icon.
 * 
 * @param props - Component props
 */
export const MenuItem = ({
  label,
  isActive,
  icon: Icon,
  onClick,
  disabled = false,
}: MenuItemProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'w-full text-left px-4 py-2.5 text-sm flex items-center justify-between',
        'hover:bg-aki-800 transition-colors',
        isActive ? 'text-aki-accent' : 'text-white',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon
            size={14}
            className={isActive ? 'text-aki-accent' : 'text-aki-muted'}
          />
        )}
        <span>{label}</span>
      </div>
      {isActive && <Check size={14} />}
    </button>
  );
};
