export default function Loading() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <img 
          src="/logo-norma.png" 
          alt="Norma Brasil Barber Salon" 
          className="h-28 w-auto mx-auto mb-4 animate-pulse-slow object-contain"
        />
        <div className="flex gap-1 justify-center">
          <div className="w-2 h-2 bg-accent-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-accent-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-accent-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
