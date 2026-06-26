import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
            <span className="text-lg font-black text-slate-950">F</span>
          </div>

          <span className="text-lg font-bold tracking-wide">
            FluxCraft AI
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-900"
          >
            Log in
          </Link>

          <Link
            href="/login?mode=signup"
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
            AI Image Generation Studio
          </div>

          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
            Create stunning AI images in seconds.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-400">
            FluxCraft AI helps creators generate cinematic, anime, fantasy,
            cyberpunk, and photorealistic images using simple prompts, aspect
            ratios, and artistic styles.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login?mode=signup"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-center text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500"
            >
              Start Creating
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              View Dashboard
            </Link>
          </div>

          <div className="mt-8 grid max-w-lg grid-cols-3 gap-4 text-center">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-xl font-bold text-white">Fast</p>
              <p className="mt-1 text-xs text-slate-500">Generation</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-xl font-bold text-white">Gallery</p>
              <p className="mt-1 text-xs text-slate-500">Saved images</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-xl font-bold text-white">Credits</p>
              <p className="mt-1 text-xs text-slate-500">Pay as you go</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[2rem] bg-cyan-500/10 blur-3xl" />

          <div className="relative rounded-[2rem] border border-slate-800 bg-[#0f1626] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">
                  Preview
                </p>
                <h2 className="mt-1 text-lg font-bold text-white">
                  AI Generated Result
                </h2>
              </div>

              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                Flux
              </span>
            </div>

            <div className="aspect-square overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
              <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.25),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(37,99,235,0.25),_transparent_35%)]">
                <div className="text-center">
                  <div className="text-6xl">🎨</div>
                  <p className="mt-4 text-sm text-slate-300">
                    Your generated image appears here
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs text-slate-500">Prompt</p>
              <p className="mt-2 text-sm text-slate-300">
                A futuristic neon city skyline at night, cinematic lighting,
                high detail, surreal atmosphere.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: 'Multiple Styles',
              desc: 'Generate cinematic, anime, cyberpunk, fantasy, 3D render, and more.',
              icon: '✨',
            },
            {
              title: 'Private Gallery',
              desc: 'Every user gets a private gallery with view, download, and copy link actions.',
              icon: '🖼️',
            },
            {
              title: 'Credit System',
              desc: 'Users generate images using credits, making it ready for pay-as-you-go monetization.',
              icon: '⚡',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6"
            >
              <div className="text-3xl">{feature.icon}</div>

              <h3 className="mt-4 text-lg font-bold text-white">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}