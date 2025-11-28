import React from 'react';

export const CoinAnimation: React.FC = () => {
  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-14 md:w-14 md:h-16 animate-coin-float z-0 pointer-events-none">
       {/* Pixel Art Coin */}
      <div className="w-full h-full bg-yellow-400 rounded-full border-4 border-black relative animate-coin-spin shadow-lg flex items-center justify-center">
         <div className="w-2/3 h-4/5 border-2 border-yellow-200 rounded-full opacity-50"></div>
      </div>
    </div>
  );
};

export const StarAnimation: React.FC = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[60] flex items-center justify-center overflow-hidden bg-black/20 backdrop-blur-[2px]">
             {/* Spinning rays */}
             <div className="absolute w-[150vmax] h-[150vmax] bg-[conic-gradient(from_0deg,_#fcd34d_0deg,_transparent_20deg,_#fcd34d_40deg,_transparent_60deg,_#fcd34d_80deg,_transparent_100deg,_#fcd34d_120deg,_transparent_140deg,_#fcd34d_160deg,_transparent_180deg,_#fcd34d_200deg,_transparent_220deg,_#fcd34d_240deg,_transparent_260deg,_#fcd34d_280deg,_transparent_300deg,_#fcd34d_320deg,_transparent_340deg,_#fcd34d_360deg)] opacity-40 animate-spin-slow origin-center"></div>
             
             {/* The Star */}
             <div className="relative animate-bounce-wild w-32 h-32 md:w-48 md:h-48 text-yellow-300 drop-shadow-[0_4px_0_rgba(0,0,0,1)]">
                 <svg viewBox="0 0 51 48" fill="currentColor" stroke="black" strokeWidth="2">
                     <path d="M25.5 0L31.5 18H51L35 29L41 48L25.5 37L10 48L16 29L0 18H19.5L25.5 0Z" />
                 </svg>
                 {/* Eyes */}
                 <div className="absolute top-10 left-8 w-3 h-8 bg-black rounded-full"></div>
                 <div className="absolute top-10 right-8 w-3 h-8 bg-black rounded-full"></div>
             </div>
             
             <div className="absolute bottom-20 text-4xl md:text-6xl text-white font-bold text-stroke-black animate-pulse pixel-font w-full text-center">
                LEVEL UP!
             </div>
        </div>
    )
}

// Simple CSS Pixel Mario
export const Mario: React.FC<{ isJumping: boolean }> = ({ isJumping }) => {
    return (
        <div className={`
            relative w-16 h-16 md:w-20 md:h-20 transition-transform duration-200 ease-in-out
            ${isJumping ? 'translate-y-[-50px] md:translate-y-[-80px]' : 'translate-y-0'}
        `}>
             {/* SVG Pixel Mario fallback */}
            <svg viewBox="0 0 12 16" className="w-full h-full drop-shadow-lg" shapeRendering="crispEdges">
                {/* Hat (Red) */}
                <rect x="3" y="0" width="5" height="1" fill="#E52521" />
                <rect x="2" y="1" width="9" height="1" fill="#E52521" />
                
                {/* Face (Skin) */}
                <rect x="2" y="2" width="7" height="1" fill="#FBD000" />
                <rect x="2" y="3" width="8" height="1" fill="#FBD000" />
                <rect x="5" y="3" width="1" height="1" fill="black" /> {/* Eye */}
                <rect x="8" y="3" width="1" height="1" fill="black" /> {/* Eye/Nose line */}
                
                {/* Mustache/Hair (Black/Brown) */}
                <rect x="1" y="2" width="1" height="3" fill="#4B3621" /> {/* Sideburn */}
                <rect x="2" y="4" width="1" height="1" fill="#4B3621" />
                <rect x="4" y="4" width="4" height="1" fill="black" /> {/* Mustache */}

                {/* Body (Red/Blue) */}
                <rect x="2" y="5" width="6" height="3" fill="#E52521" /> {/* Stick to Red for Mario */}
                <rect x="3" y="5" width="6" height="3" fill="#E52521" /> 
                
                {/* Overalls (Blue) */}
                <rect x="4" y="8" width="4" height="4" fill="#049CD8" />
                <rect x="2" y="8" width="2" height="3" fill="#049CD8" /> {/* Arm/Shoulder straps */}
                <rect x="8" y="8" width="2" height="3" fill="#049CD8" />
                
                {/* Buttons (Yellow) */}
                <rect x="4" y="9" width="1" height="1" fill="#FBD000" />
                <rect x="7" y="9" width="1" height="1" fill="#FBD000" />

                {/* Hands (Skin) */}
                <rect x="0" y="7" width="2" height="2" fill="#FBD000" />
                <rect x="10" y="7" width="2" height="2" fill="#FBD000" />

                {/* Boots (Brown) */}
                <rect x="1" y="12" width="3" height="2" fill="#4B3621" />
                <rect x="8" y="12" width="3" height="2" fill="#4B3621" />
            </svg>
        </div>
    )
}