/**
 * Updated sidebar navigation component.
 * Fixed icon types to use LucideIcon instead of any.
 */

import { Home, Disc, Mic, Folder, ListMusic, LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

interface NavItemProps {
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Display label */
  label: string;
  /** Route path */
  to: string;
}

/**
 * Navigation item component for sidebar.
 * Shows icon and label with active state styling.
 */
const NavItem = ({ icon: Icon, label, to }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-md transition-colors cursor-pointer',
        isActive ? 'bg-aki-800 text-white' : 'text-aki-muted hover:text-white hover:bg-aki-800'
      )}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

/**
 * Sidebar navigation for desktop.
 * Shows app logo and main navigation links.
 */
export const Sidebar = () => {
  return (
    <aside className="hidden md:flex w-64 bg-black h-full flex-col p-4 border-r border-aki-800">
      {/* Logo */}
      <div className="mb-8 px-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Disc className="text-aki-accent" /> AkiFlac
        </h1>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 space-y-1">
        <NavItem icon={Home} label="Home" to="/" />
        <NavItem icon={Mic} label="Artists" to="/artists" />
        <NavItem icon={Disc} label="Albums" to="/albums" />
        <NavItem icon={Folder} label="Local Files" to="/files" />
      </nav>

      {/* Playlists section */}
      <div className="mt-8">
        <h3 className="px-4 text-xs font-bold text-aki-muted uppercase tracking-wider mb-2">
          Playlists
        </h3>
        <NavItem icon={ListMusic} label="Favorites" to="/playlist/fav" />
      </div>
    </aside>
  );
};
