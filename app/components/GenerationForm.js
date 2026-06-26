'use client';

import { useState } from 'react';

export default function GenerationForm({
  onImageGenerated,
  onCreditsUpdated,
}) {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [style, setStyle] = useState('none');

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function handleGenerate(e) {
    e.preventDefault();

    setError('');
    setSuccessMessage('');

    const cleanPrompt = prompt.trim();

    if (!cleanPrompt) {
      setError('Please write a prompt before generating an image.');
      return;
    }

    if (cleanPrompt.length < 3) {
      setError('Prompt is too short. Please describe the image better.');
      return;
    }

    if (cleanPrompt.length > 1000) {
      setError('Prompt is too long. Please keep it under 1000 characters.');
      return;
    }

    if (isGenerating) {
      return;
    }

    try {
      setIsGenerating(true);

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

      if (!data?.imageUrl) {
        throw new Error('Image generated, but no image URL was returned.');
      }

      if (typeof onImageGenerated === 'function') {
        onImageGenerated(data.imageUrl);
      }

      if (
        typeof onCreditsUpdated === 'function' &&
        typeof data.remainingCredits !== 'undefined'
      ) {
        onCreditsUpdated(data.remainingCredits);
      }

      setSuccessMessage('Image generated successfully.');
    } catch (err) {
      setError(err.message || 'Unexpected error occurred.');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <form
      onSubmit={handleGenerate}
      className="w-full space-y-5 rounded-2xl border border-white/10 bg-zinc-950/70 p-5 shadow-xl"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-200">
          Prompt
        </label>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          disabled={isGenerating}
          rows={5}
          className="w-full resize-none rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <div className="mt-1 flex justify-between text-xs text-zinc-500">
          <span>Be specific for better results.</span>
          <span>{prompt.trim().length}/1000</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-200">
            Aspect Ratio
          </label>

          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            disabled={isGenerating}
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="1:1">Square - 1:1</option>
            <option value="16:9">Landscape - 16:9</option>
            <option value="9:16">Portrait - 9:16</option>
            <option value="4:3">Classic - 4:3</option>
            <option value="3:4">Vertical - 3:4</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-200">
            Style
          </label>

          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            disabled={isGenerating}
            className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="none">None</option>
            <option value="cinematic">Cinematic</option>
            <option value="anime">Anime</option>
            <option value="3d render">3D Render</option>
            <option value="photorealistic">Photorealistic</option>
            <option value="digital art">Digital Art</option>
            <option value="fantasy art">Fantasy Art</option>
            <option value="pixel art">Pixel Art</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          ⚠️ {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          ✅ {successMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isGenerating}
        className="w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
      >
        {isGenerating ? 'Generating image...' : 'Generate Image'}
      </button>

      {isGenerating && (
        <div className="text-center text-xs text-zinc-500">
          This may take a few seconds. Please do not close the page.
        </div>
      )}
    </form>
  );
}