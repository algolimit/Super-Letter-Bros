import React from 'react';

interface BlockProps {
  char: string;
  isHit: boolean;
  isError: boolean;
  size?: 'normal' | 'small';
}

export const Block: React.FC<BlockProps> = ({ char, isHit, isError, size = 'normal' }) => {
  // Size classes
  const sizeClasses = size === 'normal' 
    ? 'w-32 h-32 md:w-40 md:h-40 text-6xl md:text-7xl' 
    : 'w-16 h-16 md:w-20 md:h-20 text-3xl md:text-4xl'; // Smaller for words

  return (
    <div className={`relative ${isError ? 'animate-shake' : ''} z-20`}>
        <div 
          className={`
            ${sizeClasses}
            transition-transform duration-100 ease-out
            border-[4px] border-black rounded-sm
            flex items-center justify-center
            relative overflow-hidden
            select-none
            ${isHit ? 'bg-amber-700 translate-y-[-5px]' : 'bg-[#FBD000]'}
            shadow-[4px_4px_0_rgba(0,0,0,0.3)]
          `}
        >
            {/* Box Detail - Bolts */}
            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-amber-900/50 rounded-full"></div>
            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-900/50 rounded-full"></div>
            <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-amber-900/50 rounded-full"></div>
            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-amber-900/50 rounded-full"></div>

            {/* Inner bevel shine */}
            <div className="absolute inset-0 border-[3px] border-white/30 pointer-events-none"></div>

            {/* Content */}
            { !isHit ? (
                 <span 
                 className={`
                   relative z-10 
                   font-black pixel-font
                   text-white
                 `}
                 style={{ 
                     textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' 
                 }}
               >
                   {char}
               </span>
            ) : (
                <div className="w-full h-full bg-amber-800 opacity-20"></div>
            )}
           
        </div>
    </div>
  );
};