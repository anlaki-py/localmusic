/**
 * Sort menu component for the library header.
 * Provides dropdown controls for sort criteria and order.
 */

import { useRef } from 'react';
import { ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { useClickOutside } from '@/hooks/useClickOutside';
import { MenuItem } from '@/components/ui/MenuItem';
import { SortOption, SortOrder } from '@/types';

interface SortMenuProps {
  /** Whether the menu is currently open */
  isOpen: boolean;
  /** Callback to toggle menu open state */
  onToggle: () => void;
  /** Current sort criteria */
  sortBy: SortOption;
  /** Current sort direction */
  sortOrder: SortOrder;
  /** Whether library is currently loading */
  isLoading: boolean;
  /** Handler to change sort criteria */
  onSortByChange: (option: SortOption) => void;
  /** Handler to change sort direction */
  onSortOrderChange: (order: SortOrder) => void;
  /** Handler to refresh library */
  onRefresh: () => void;
}

/**
 * Dropdown menu for controlling library sort order.
 * Includes sort criteria, sort direction, and refresh action.
 * 
 * @param props - Component props
 */
export const SortMenu = ({
  isOpen,
  onToggle,
  sortBy,
  sortOrder,
  isLoading,
  onSortByChange,
  onSortOrderChange,
  onRefresh,
}: SortMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useClickOutside(menuRef, () => {
    if (isOpen) onToggle();
  });

  // Handle refresh and close menu
  const handleRefresh = () => {
    onRefresh();
    onToggle();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu toggle button */}
      <button
        onClick={onToggle}
        className="p-2 rounded-full bg-aki-700/50 hover:bg-aki-700 transition-all text-white"
        aria-label="Sort options"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-64 bg-aki-900 border border-aki-700 rounded-lg shadow-xl z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
          {/* Sort criteria section */}
          <div className="px-4 py-2 text-[10px] font-bold text-aki-muted uppercase tracking-wider bg-aki-800/30">
            Sort By
          </div>
          
          <MenuItem
            label="Date Added"
            isActive={sortBy === 'dateAdded'}
            onClick={() => onSortByChange('dateAdded')}
          />
          <MenuItem
            label="Date Modified"
            isActive={sortBy === 'dateModified'}
            onClick={() => onSortByChange('dateModified')}
          />
          <MenuItem
            label="Title"
            isActive={sortBy === 'title'}
            onClick={() => onSortByChange('title')}
          />
          <MenuItem
            label="Artist"
            isActive={sortBy === 'artist'}
            onClick={() => onSortByChange('artist')}
          />
          <MenuItem
            label="Album"
            isActive={sortBy === 'album'}
            onClick={() => onSortByChange('album')}
          />

          <div className="h-[1px] bg-aki-800 my-1" />

          {/* Sort order section */}
          <div className="px-4 py-2 text-[10px] font-bold text-aki-muted uppercase tracking-wider bg-aki-800/30">
            Order
          </div>
          
          <MenuItem
            label="Ascending (A-Z / Oldest)"
            isActive={sortOrder === 'asc'}
            icon={ArrowUp}
            onClick={() => onSortOrderChange('asc')}
          />
          <MenuItem
            label="Descending (Z-A / Newest)"
            isActive={sortOrder === 'desc'}
            icon={ArrowDown}
            onClick={() => onSortOrderChange('desc')}
          />

          <div className="h-[1px] bg-aki-800 my-1" />

          {/* Refresh action */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-aki-800 text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={clsx(isLoading && 'animate-spin')} />
            <span>Refresh Library</span>
          </button>
        </div>
      )}
    </div>
  );
};
