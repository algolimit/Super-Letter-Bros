import React from 'react';

export const CoinAnimation: React.FC = () => {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-10 h-14 md:w-14 md:h-16 z-0 pointer-events-none mb-2">
       {/* Pixel Art Coin */}
      <div className="w-full h-full bg-yellow-400 rounded-full border-4 border-black relative animate-coin-float shadow-lg flex items-center justify-center">
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
interface MarioProps {
    isJumping: boolean;
    isMoving?: boolean;
}

export const Mario: React.FC<MarioProps> = ({ isJumping, isMoving = false }) => {
    return (
        <div className={`
            relative w-16 h-16 md:w-20 md:h-20 transition-transform duration-200 ease-in-out
            /* 
               Jump Height Calculation:
               Mobile: Block Bottom (8rem/128px) - Mario Height (4rem/64px) = Gap 64px. 
                       + Slight visual overlap (8px) = ~72px translation.
               Desktop: Block Bottom (16rem/256px) - Mario Height (5rem/80px) = Gap 176px.
                       + Slight visual overlap (4px) = ~180px translation.
            */
            ${isJumping ? 'translate-y-[-72px] md:translate-y-[-180px]' : 'translate-y-0'}
        `}>
             <style>{`
                @keyframes idle-breathe {
                    0%, 100% { transform: scaleY(1); }
                    50% { transform: scaleY(0.97) translateY(1px); }
                }
                @keyframes waddle {
                    0%, 100% { transform: rotate(-5deg); }
                    50% { transform: rotate(5deg); }
                }
                @keyframes walk-leg-left {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-2px); }
                }
                @keyframes walk-leg-right {
                    0%, 100% { transform: translateY(-2px); }
                    50% { transform: translateY(0); }
                }
                .mario-idle {
                    animation: idle-breathe 2s ease-in-out infinite;
                    transform-origin: bottom center;
                }
                .mario-moving {
                    animation: waddle 0.3s linear infinite;
                    transform-origin: bottom center;
                }
                .leg-left-anim {
                    animation: walk-leg-left 0.3s steps(2) infinite;
                }
                .leg-right-anim {
                    animation: walk-leg-right 0.3s steps(2) infinite;
                }
                /* Improved Coin Float to match new position */
                @keyframes coin-float-up {
                    0% { transform: translate(-50%, 0) scaleX(1); opacity: 0; }
                    20% { transform: translate(-50%, -40px) scaleX(1); opacity: 1; }
                    50% { transform: translate(-50%, -50px) scaleX(0.1); } /* Spin */
                    80% { transform: translate(-50%, -55px) scaleX(1); opacity: 1; }
                    100% { transform: translate(-50%, -70px) scaleX(1); opacity: 0; }
                }
                .animate-coin-float {
                    animation: coin-float-up 0.8s ease-out forwards;
                }
             `}</style>

             {/* SVG Pixel Mario */}
            <svg 
                viewBox="0 0 12 16" 
                className={`w-full h-full drop-shadow-lg ${isJumping ? '' : (isMoving ? 'mario-moving' : 'mario-idle')}`} 
                shapeRendering="crispEdges"
            >
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
                <rect x="2" y="5" width="6" height="3" fill="#E52521" /> 
                <rect x="3" y="5" width="6" height="3" fill="#E52521" /> 
                
                {/* Overalls (Blue) */}
                <rect x="4" y="8" width="4" height="4" fill="#049CD8" />
                
                {/* Arm Left */}
                { isJumping ? (
                     <rect x="1" y="4" width="2" height="3" fill="#E52521" /> 
                ) : (
                    <rect x="2" y="8" width="2" height="3" fill="#049CD8" /> 
                )}
                
                {/* Arm Right */}
                 { isJumping ? (
                    <rect x="9" y="4" width="2" height="3" fill="#E52521" /> 
                 ) : (
                    <rect x="8" y="8" width="2" height="3" fill="#049CD8" />
                 )}
                
                {/* Buttons (Yellow) */}
                <rect x="4" y="9" width="1" height="1" fill="#FBD000" />
                <rect x="7" y="9" width="1" height="1" fill="#FBD000" />

                {/* Hands (Skin) */}
                <rect x={isJumping ? "0" : "0"} y={isJumping ? "3" : "7"} width="2" height="2" fill="#FBD000" />
                <rect x={isJumping ? "10" : "10"} y={isJumping ? "3" : "7"} width="2" height="2" fill="#FBD000" />

                {/* Boots (Brown) */}
                <g className={isMoving && !isJumping ? 'leg-left-anim' : ''}>
                     <rect x="1" y="12" width="3" height="2" fill="#4B3621" />
                </g>
                <g className={isMoving && !isJumping ? 'leg-right-anim' : ''}>
                    <rect x="8" y="12" width="3" height="2" fill="#4B3621" />
                </g>
            </svg>
        </div>
    )
}

export const Heart: React.FC<{ filled: boolean }> = ({ filled }) => (
    <div className={`w-5 h-5 md:w-8 md:h-8 transition-transform duration-200 ${filled ? 'scale-100' : 'scale-90 opacity-50'}`}>
        <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-sm" shapeRendering="crispEdges">
             <path 
                d="M4 1H8H12V2H13V3H14V4H15V8H14V9H13V10H12V11H11V12H10V13H9V14H7V13H6V12H5V11H4V10H3V9H2V8H1V4H2V3H3V2H4V1Z" 
                fill={filled ? "#E52521" : "#4a0d0c"} 
             />
             <path 
                d="M4 2H8H12V3H13V4H14V8H13V9H12V10H11V11H10V12H9V13H7V12H6V11H5V10H4V9H3V8H2V4H3V3H4V2Z"
                fill={filled ? "#ff6b6b" : "#631210"} 
                className="opacity-20"
             />
        </svg>
    </div>
);