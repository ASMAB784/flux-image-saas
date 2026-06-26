'use client';

import { useEffect, useState } from 'react';

export default function GalleryDisplay({ refreshKey = 0 }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  async function fetchUserImages() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/gallery', {
        method: 'GET',
        cache: 'no-store',
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load gallery.');
      }

      setImages(data.images || []);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setError(err.message || 'Failed to load gallery.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUserImages();
  }, [refreshKey]);

  async function handleCopyLink(imageUrl, imageId) {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopiedId(imageId);

      setTimeout(() => {
        setCopiedId(null);
      }, 1500);
    } catch (err) {
      console.error('Copy failed:', err);
      alert('Failed to copy image link.');
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-slate-800/60 bg-[#0f1626] overflow-hidden animate-pulse"
          >
            <div className="aspect-square bg-slate-900" />
            <div className="p-4 space-y-3">
              <div className="h-3 w-full rounded bg-slate-800" />
              <div className="h-3 w-2/3 rounded bg-slate-800" />
              <div className="flex gap-2 pt-2">
                <div className="h-7 flex-1 rounded bg-slate-800" />
                <div className="h-7 flex-1 rounded bg-slate-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
        ⚠️ {error}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-900/20 border border-slate-800/40 rounded-2xl p-6 w-full">
        <div className="text-4xl mb-3">🖼️</div>
        <p className="text-slate-300 text-sm font-semibold">
          Your gallery is empty.
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Images you generate will show up here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-400">
          {images.length} image{images.length > 1 ? 's' : ''} generated
        </p>

        <button
          type="button"
          onClick={fetchUserImages}
          className="text-xs rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-300 hover:bg-slate-800 transition"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
        {images.map((img) => (
          <div
            key={img.id}
            className="group relative bg-[#0f1626] border border-slate-800/60 rounded-2xl overflow-hidden shadow-lg transition-all hover:border-cyan-500/40 hover:shadow-cyan-500/10"
          >
            <a
              href={img.image_url}
              target="_blank"
              rel="noreferrer"
              className="block aspect-square relative overflow-hidden bg-slate-950"
            >
              <img
                src={img.image_url}
                alt={img.prompt || 'Generated image'}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="rounded-full bg-slate-950/80 border border-slate-700 px-3 py-1.5 text-xs text-slate-200">
                  🔍 View
                </span>
              </div>
            </a>

            <div className="p-4 space-y-3 bg-gradient-to-t from-slate-950/80 to-slate-950/40">
              <p className="text-xs text-slate-300 line-clamp-2 font-medium min-h-[32px]">
                {img.prompt || 'No prompt'}
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-cyan-400 border border-slate-700/50">
                  {img.aspect_ratio || '1:1'}
                </span>

                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-violet-300 border border-slate-700/50">
                  {img.style || 'none'}
                </span>
              </div>

              <div className="text-[10px] text-slate-500">
                {img.created_at
                  ? new Date(img.created_at).toLocaleString()
                  : 'Unknown date'}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <a
                  href={img.image_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-center text-[10px] bg-slate-800 hover:bg-slate-700 py-2 rounded-lg font-medium transition-all text-slate-200"
                >
                  View
                </a>

                <a
                  href={`/api/download?url=${encodeURIComponent(img.image_url)}`}
                  className="text-center text-[10px] bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-2 rounded-lg font-bold transition-all"
                >
                  Download
                </a>

                <button
                  type="button"
                  onClick={() => handleCopyLink(img.image_url, img.id)}
                  className="text-center text-[10px] bg-slate-800 hover:bg-slate-700 py-2 rounded-lg font-medium transition-all text-slate-200"
                >
                  {copiedId === img.id ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}