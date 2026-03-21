/**
 * Updated mobile navigation component.
 * Fixed icon types and removed unused Heart import.
 */

import { Home, Disc, Mic, Folder, LucideIcon } from 'lucide-react';
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
 * Navigation item component for mobile nav.
 * Compact layout with icon and small label.
 */
const NavItem = ({ icon: Icon, label, to }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={clsx(
        'flex flex-col items-center justify-center w-full h-full space-y-1',
        isActive ? 'text-white' : 'text-aki-muted'
      )}
    >
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
};

/**
 * Bottom navigation bar for mobile devices.
 * Fixed at bottom with safe-area padding for iOS.
 */
export const MobileNav = () => {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-aki-900 border-t border-aki-800 flex items-center justify-around z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <NavItem icon={Home} label="Home" to="/" />
      <NavItem icon={Mic} label="Artists" to="/artists" />
      <NavItem icon={Disc} label="Albums" to="/albums" />
      <NavItem icon={Folder} label="Files" to="/files" />
    </nav>
  );
};
