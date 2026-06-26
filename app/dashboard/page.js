'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import GalleryDisplay from '../components/GalleryDisplay';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('generate');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [style, setStyle] = useState('none');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [remainingCredits, setRemainingCredits] = useState(null);
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const response = await fetch('/api/me', {
          method: 'GET',
          cache: 'no-store',
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load user profile.');
        }

        setUserProfile(data.user);
        setRemainingCredits(data.user.credits);
      } catch (err) {
        console.error('Profile loading error:', err);
      }
    }

    loadUserProfile();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (loading) return;

    const cleanPrompt = prompt.trim();

    setError('');
    setSuccessMessage('');
    setGeneratedImage(null);

    if (!cleanPrompt) {
      setError('Please write a prompt before generating an image.');
      return;
    }

    if (cleanPrompt.length < 3) {
      setError('Prompt is too short. Please describe the image better.');
      return;
    }

    if (cleanPrompt.length > 1000) {
      setError('Prompt is too long. Maximum is 1000 characters.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: cleanPrompt,
          aspectRatio,
          style,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || 'Something went wrong while generating the image.'
        );
      }

      if (!data.success || !data.imageUrl) {
        throw new Error(
          'The image was generated, but no image URL was returned.'
        );
      }

      setGeneratedImage(data.imageUrl);
      setRemainingCredits(data.remainingCredits);

      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              credits: data.remainingCredits,
            }
          : prev
      );

      setSuccessMessage('Image generated successfully.');
      setGalleryRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        credits={remainingCredits}
        userProfile={userProfile}
      />

      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === 'generate' ? (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                  AI Studio
                </p>

                <h1 className="mt-2 text-2xl font-bold">
                  Dashboard / Image Generation
                </h1>

                {userProfile && (
                  <p className="mt-2 text-sm text-slate-300">
                    Welcome,{' '}
                    <span className="font-semibold text-cyan-300">
                      @{userProfile.username}
                    </span>
                  </p>
                )}

                <p className="mt-2 text-sm text-slate-400">
                  Create AI images using prompt, aspect ratio, and artistic style.
                </p>
              </div>

              {remainingCredits !== null && (
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
                  Credits: <span className="font-bold">{remainingCredits}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <form
                onSubmit={handleGenerate}
                className="space-y-6 bg-[#0f1626] p-6 rounded-2xl border border-slate-800/60"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    Enter Image Description (Prompt)
                  </label>

                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what you want to create..."
                    disabled={loading}
                    className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:border-cyan-500 transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />

                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Write a detailed prompt for better results.</span>
                    <span>{prompt.trim().length}/1000</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                      Aspect Ratio
                    </label>

                    <select
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value)}
                      disabled={loading}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 text-slate-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="1:1">1:1 Square - Instagram</option>
                      <option value="16:9">16:9 Landscape - YouTube</option>
                      <option value="9:16">9:16 Portrait - TikTok/Reels</option>
                      <option value="4:3">4:3 Standard Photo</option>
                      <option value="3:4">3:4 Vertical Photo</option>
                      <option value="3:2">3:2 DSLR Camera Style</option>
                      <option value="21:9">21:9 UltraWide Cinematic</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                      Artistic Style
                    </label>

                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      disabled={loading}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500 text-slate-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="none">No Style - Flux Default</option>
                      <option value="cinematic">Cinematic - Movie Lighting</option>
                      <option value="anime">Anime / Manga Style</option>
                      <option value="3d-render">3D Pixar / Blender Render</option>
                      <option value="cyberpunk">Cyberpunk / Neon City</option>
                      <option value="pixel-art">Retro Pixel Art</option>
                      <option value="oil-painting">Classic Oil Painting</option>
                      <option value="photorealistic">Photorealistic</option>
                      <option value="digital-art">Digital Art</option>
                      <option value="fantasy-art">Fantasy Art</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating Magic...' : 'Generate Magic ✨'}
                </button>

                {loading && (
                  <div className="text-center text-xs text-slate-500">
                    Please wait. Image generation may take a few seconds.
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
                    ⚠️ {error}
                  </div>
                )}

                {successMessage && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs text-center">
                    ✅ {successMessage}
                  </div>
                )}
              </form>

              <div className="bg-[#0f1626] rounded-2xl border border-slate-800/60 flex flex-col items-center justify-center p-6 min-h-[400px]">
                {loading ? (
                  <div className="text-center space-y-4 text-slate-400">
                    <div className="mx-auto h-12 w-12 rounded-full border-4 border-slate-700 border-t-cyan-400 animate-spin" />
                    <div>
                      <h3 className="text-sm font-semibold text-slate-300">
                        Generating your image...
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        The AI is creating your result.
                      </p>
                    </div>
                  </div>
                ) : generatedImage ? (
                  <div className="space-y-4 w-full h-full flex flex-col items-center justify-center">
                    <img
                      src={generatedImage}
                      alt="Generated Result"
                      className="max-h-[350px] rounded-xl object-contain shadow-2xl border border-slate-800"
                    />

                    <div className="flex gap-3">
                      <a
                        href={generatedImage}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs bg-slate-800 hover:bg-slate-700 py-2 px-4 rounded-lg font-medium transition-all"
                      >
                        🔍 Open Full Resolution
                      </a>

                      <a
                        href={`/api/download?url=${encodeURIComponent(
                          generatedImage
                        )}`}
                        className="text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-2 px-4 rounded-lg font-bold transition-all"
                      >
                        📥 Download
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2 text-slate-500">
                    <span className="text-3xl">🎨</span>
                    <h3 className="text-sm font-semibold text-slate-400">
                      Digital Canvas
                    </h3>
                    <p className="text-xs max-w-xs">
                      Enter your prompt on the left and click generate to view your masterpiece here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8">
            <div>
              <h1 className="text-2xl font-bold">Dashboard / My Gallery</h1>
              <p className="mt-2 text-sm text-slate-400">
                View, download, and copy links for your generated images.
              </p>
            </div>

            <GalleryDisplay refreshKey={galleryRefreshKey} />
          </div>
        )}
      </main>
    </div>
  );
}