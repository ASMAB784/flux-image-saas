'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';

export default function Sidebar({
  activeTab,
  setActiveTab,
  credits = null,
  userProfile = null,
}) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/login');
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const username = userProfile?.username || 'user';
  const displayName = userProfile?.displayName || username;
  const initials = displayName?.slice(0, 2)?.toUpperCase() || 'U';
  const imagesLeft =
    typeof credits === 'number' ? Math.floor(credits / 10) : null;

  return (
    <aside className="w-64 bg-[#0f1626] border-r border-slate-800/60 p-6 flex flex-col justify-between hidden md:flex shrink-0">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-slate-950 font-black text-lg">F</span>
          </div>

          <span className="text-lg font-bold tracking-wider bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            FluxCraft AI
          </span>
        </div>

        <nav className="space-y-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('generate')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'generate'
                ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 text-cyan-400'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <span>✨</span> Generate Images
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'gallery'
                ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 text-cyan-400'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <span>🖼️</span> My Gallery
          </button>
        </nav>
      </div>

      <div className="space-y-3">
        <div className="p-4 bg-slate-950/40 border border-slate-800/50 rounded-xl flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
            {initials}
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-300 truncate">
              {displayName}
            </span>

            <span className="text-[10px] text-slate-500 truncate">
              @{username}
            </span>

            <div className="flex justify-between items-center mt-0.5">
              <span className="text-[10px] text-cyan-400 font-medium">
                Trial Plan
              </span>

              <span className="text-[10px] font-bold text-yellow-500">
                {imagesLeft === null ? '...' : `${imagesLeft} Images left`}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
}