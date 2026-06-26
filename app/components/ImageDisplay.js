'use client';

export default function ImageDisplay({ loading, imageUrl }) {
  return (
    <div className="bg-[#0f1626]/20 border border-slate-800/40 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden h-full w-full">
      
      {/* Loading State (Skeleton) */}
      {loading && (
        <div className="w-full h-full flex flex-col items-center justify-center space-y-4 animate-pulse">
          <div className="w-full aspect-square max-w-[400px] bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden">
            <span className="text-xs text-slate-500">Flux is drawing your imagination...</span>
          </div>
        </div>
      )}

      {/* Success State (Image Rendered) */}
      {!loading && imageUrl && (
        <div className="w-full h-full flex flex-col items-center justify-center space-y-4 animate-fadeIn">
          <div className="w-full aspect-square max-w-[400px] overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950 shadow-2xl">
            <img src={imageUrl} alt="AI Generated" className="object-contain w-full h-full" />
          </div>
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium py-2.5 px-5 rounded-xl transition flex items-center gap-2 text-xs"
          >
            📥 Open Full Resolution Image
          </a>
        </div>
      )}

      {/* Default State (Empty Showcase) */}
      {!loading && !imageUrl && (
        <div className="text-center space-y-2">
          <div className="text-4xl">🎨</div>
          <h3 className="text-sm font-semibold text-slate-400">Digital Canvas</h3>
          <p className="text-xs text-slate-600 max-w-xs">
            Enter your prompt on the left and click generate to view your masterpiece here.
          </p>
        </div>
      )}

    </div>
  );
}