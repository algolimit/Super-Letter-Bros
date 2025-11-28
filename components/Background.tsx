import React from 'react';

export const Background: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative w-full h-screen bg-[#5c94fc] overflow-hidden flex flex-col">
      {/* Animated Clouds */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute top-10 animate-cloud-slow opacity-90">
            <Cloud scale={1} />
          </div>
          <div className="absolute top-32 left-[60%] animate-cloud-medium opacity-80">
            <Cloud scale={0.7} />
          </div>
          <div className="absolute top-12 left-[85%] animate-cloud-fast opacity-90">
            <Cloud scale={0.9} />
          </div>
      </div>

      {/* Hills (Decoration) */}
      <div className="absolute bottom-[90px] md:bottom-[116px] left-0 w-full flex items-end justify-between px-10 pointer-events-none z-0">
         <Hill color="bg-[#00994d]" height="h-24 md:h-32" width="w-48 md:w-64" border="border-[#006020]" />
         <div className="flex-1"></div>
         <Hill color="bg-[#008040]" height="h-32 md:h-48" width="w-64 md:w-96" border="border-[#005018]" />
      </div>

      {/* Main Content Area */}
      <div className="flex-grow z-10 relative">
        {children}
      </div>

      {/* Ground */}
      <div className="h-24 md:h-32 w-full bg-[url('https://www.transparenttextures.com/patterns/brick-wall.png')] bg-[#944026] border-t-[4px] border-black z-20 relative flex-shrink-0">
        
        {/* Grass Top Layer */}
        <div className="absolute -top-4 left-0 w-full h-4 flex overflow-hidden">
             {/* Repeating grass pattern */}
             <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIj48cGF0aCBkPSJNMCAyMEw1IDBMMTAgMjBIMVoiIGZpbGw9IiM3M2M1NDQiLz48cGF0aCBkPSJNMTAgMjBMMTUgMEwyMCAyMEgxMVoiIGZpbGw9IiM2MmIxMzUiLz48L3N2Zz4=')] bg-repeat-x bg-contain"></div>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-2 bg-[#73c544] opacity-50"></div>
      </div>

      <style>{`
        @keyframes cloud-move {
            from { transform: translateX(-200px); }
            to { transform: translateX(100vw); }
        }
        .animate-cloud-slow { animation: cloud-move 50s linear infinite; }
        .animate-cloud-medium { animation: cloud-move 35s linear infinite; }
        .animate-cloud-fast { animation: cloud-move 25s linear infinite; }
      `}</style>
    </div>
  );
};

const Cloud: React.FC<{ scale: number }> = ({ scale }) => (
  <div style={{ transform: `scale(${scale})` }} className="relative">
    <div className="w-24 h-24 bg-white rounded-full absolute top-0 left-0"></div>
    <div className="w-32 h-32 bg-white rounded-full absolute -top-10 left-12"></div>
    <div className="w-24 h-24 bg-white rounded-full absolute top-0 left-32"></div>
    <div className="w-20 h-20 bg-white rounded-full absolute top-4 left-48"></div>
  </div>
);

const Hill: React.FC<{ color: string, height: string, width: string, border: string }> = ({ color, height, width, border }) => (
    <div className={`${width} ${height} ${color} rounded-t-[100%] border-4 border-b-0 ${border} relative overflow-hidden`}>
        {/* Hill spots */}
        <div className="absolute top-4 left-[20%] w-4 h-4 bg-black/10 rounded-full"></div>
        <div className="absolute top-10 left-[60%] w-6 h-6 bg-black/10 rounded-full"></div>
        <div className="absolute bottom-4 right-[20%] w-5 h-5 bg-black/10 rounded-full"></div>
    </div>
);