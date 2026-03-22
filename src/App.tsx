/**
 * Main application component.
 * Sets up routing, layout, and global providers.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AudioProvider } from '@/context/AudioContext';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { PlayerBar } from '@/components/player/PlayerBar';
import { AudioController } from '@/components/player/AudioController';
import { LyricsPanel } from '@/components/ui/LyricsPanel';
import { Home } from '@/pages/Home';

function App() {
  return (
    <AudioProvider>
      <BrowserRouter>
        <div className="flex h-screen bg-aki-900 text-white overflow-hidden selection:bg-aki-accent selection:text-black">
          {/* Main content area */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </ErrorBoundary>
          </main>

          {/* Lyrics panel (desktop only) */}
          <LyricsPanel />

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
