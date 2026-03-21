/**
 * Main application component.
 * Sets up routing, layout, and global providers.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AudioProvider } from '@/context/AudioContext';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { PlayerBar } from '@/components/player/PlayerBar';
import { AudioController } from '@/components/player/AudioController';
import { Home } from '@/pages/Home';

/**
 * Main App component.
 * Provides routing, audio context, and layout structure.
 */
function App() {
  return (
    <AudioProvider>
      <BrowserRouter>
        <div className="flex h-screen bg-aki-900 text-white overflow-hidden selection:bg-aki-accent selection:text-black">
          {/* Desktop sidebar */}
          <Sidebar />

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/artists" element={<div className="p-10 text-center text-aki-muted">Coming Soon</div>} />
                <Route path="/albums" element={<div className="p-10 text-center text-aki-muted">Coming Soon</div>} />
                <Route path="/files" element={<div className="p-10 text-center text-aki-muted">Coming Soon</div>} />
                <Route path="*" element={<div className="p-10 text-center text-aki-muted">Page Not Found</div>} />
              </Routes>
            </ErrorBoundary>
          </main>

          {/* Mobile navigation */}
          <MobileNav />

          {/* Player UI */}
          <PlayerBar />

          {/* Hidden audio element */}
          <AudioController />
        </div>
      </BrowserRouter>
    </AudioProvider>
  );
}

export default App;
