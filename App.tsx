import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Background } from './components/Background';
import { Block } from './components/Block';
import { CoinAnimation, StarAnimation, Mario, Heart } from './components/Rewards';
import { GameState, GameLevel } from './types';
import { 
  playDutchPronunciation, 
  playDutchWord,
  getAudioContext, 
  playCoinSound, 
  playBumpSound, 
  playPowerUpSound,
  playJumpSound,
  playGameOverSound,
  stopAllSounds
} from './services/geminiService';

// Level 1: Single Characters
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
const NUMBERS = "0123456789".split('');
const ALL_CHARS = [...LETTERS, ...NUMBERS];

// Level 2: 100+ Common Dutch Words for Children
const DUTCH_WORDS = [
    // Familie
    "MAMA", "PAPA", "OMA", "OPA", "BABY", "BROER", "ZUS", "OOM", "TANTE",
    // Dieren
    "HOND", "KAT", "VIS", "VOGEL", "KOE", "PAARD", "SCHAAP", "EEND", "KONIJN", 
    "KIP", "VARKEN", "AAP", "OLIFANT", "BEER", "MUIS", "SLANG", "TIJGER", "VLINDER",
    // Huis & Spullen
    "HUIS", "DEUR", "RAAM", "STOEL", "TAFEL", "BED", "LAMP", "KLOK", "BAD",
    // Vervoer
    "AUTO", "FIETS", "TREIN", "BUS", "BOOT", "VLIEGTUIG", "STEP",
    // Speelgoed & School
    "BAL", "POP", "BOEK", "PEN", "POTLOOD", "TAS", "SCHOOL", "GOM", "BLOK",
    // Eten & Drinken
    "APPEL", "PEER", "BANAAN", "BROOD", "MELK", "KAAS", "EI", "KOEK", "IJS", "WATER", "SAP", "SNOEP",
    // Natuur & Weer
    "ZON", "MAAN", "STER", "BOOM", "BLOEM", "GRAS", "WOLK", "REGEN", "SNEEUW", "WIND", "BOS", "ZEE", "STRAND",
    // Lichaam
    "NEUS", "OOG", "OOR", "MOND", "HAND", "VOET", "BUIK", "HAAR", "TAND",
    // Kleding
    "JAS", "BROEK", "SCHOEN", "SOK", "MUTS", "TRUI", "JURK",
    // Kleuren
    "ROOD", "BLAUW", "GEEL", "GROEN", "WIT", "ZWART", "ROZE",
    // Overig
    "GROOT", "KLEIN", "LIEF", "BLIJ", "BOOS", "TUIN", "PARK"
];

const getRandomChar = () => ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
const getRandomWord = () => DUTCH_WORDS[Math.floor(Math.random() * DUTCH_WORDS.length)];

const INITIAL_LIVES = 6;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [level, setLevel] = useState<GameLevel>(GameLevel.ONE);
  
  // Game Data
  const [targetChar, setTargetChar] = useState<string>(''); // For Level 1
  const [targetWord, setTargetWord] = useState<string>(''); // For Level 2
  const [wordIndex, setWordIndex] = useState<number>(0);    // For Level 2
  
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [lives, setLives] = useState<number>(INITIAL_LIVES);
  
  // Visual States
  const [isError, setIsError] = useState<boolean>(false);
  const [showCoin, setShowCoin] = useState<boolean>(false);
  const [showStar, setShowStar] = useState<boolean>(false);
  const [isJumping, setIsJumping] = useState<boolean>(false);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [hitIndices, setHitIndices] = useState<number[]>([]); 
  
  const isProcessingRef = useRef(false);

  // --- Game Loop Control ---

  const startGame = useCallback(async (selectedLevel: GameLevel) => {
    // Resume audio context on user interaction
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        await ctx.resume();
    }
    setLevel(selectedLevel);
    setScore(0);
    setStreak(0);
    setLives(INITIAL_LIVES);
    nextRound(selectedLevel);
  }, []);

  const handleBackToMenu = () => {
      stopAllSounds();
      setGameState(GameState.START);
      setIsError(false);
      setShowCoin(false);
      setShowStar(false);
      setHitIndices([]);
      setLives(INITIAL_LIVES);
      setIsMoving(false);
  };

  const nextRound = useCallback((currentLevel: GameLevel) => {
    isProcessingRef.current = false;
    setGameState(GameState.PLAYING);
    setIsError(false);
    setShowCoin(false);
    setShowStar(false);
    setHitIndices([]);
    setWordIndex(0);
    setIsJumping(false);
    setIsMoving(false);

    if (currentLevel === GameLevel.ONE) {
        const next = getRandomChar();
        setTargetChar(next);
        setTimeout(() => playDutchPronunciation(next), 400);
    } else {
        const nextWord = getRandomWord();
        setTargetWord(nextWord);
        // Say the full word first, then the first letter
        setTimeout(async () => {
            await playDutchWord(nextWord);
            setTimeout(() => {
                if(nextWord.length > 0) playDutchPronunciation(nextWord[0]);
            }, 1000); // Wait for word to finish
        }, 400);
    }
  }, []);

  // --- Input Handling ---

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameState !== GameState.PLAYING || isProcessingRef.current) return;

    const pressedKey = e.key.toUpperCase();
    
    // Ignore non-character keys
    if (e.key.length > 1) return;

    let currentTarget = '';
    
    if (level === GameLevel.ONE) {
        currentTarget = targetChar;
    } else {
        currentTarget = targetWord[wordIndex];
    }

    if (pressedKey === currentTarget) {
      // SUCCESS LOGIC
      handleSuccess();
    } else {
      // ERROR LOGIC
      handleError(currentTarget);
    }
  }, [gameState, level, targetChar, targetWord, wordIndex, streak]);

  const handleSuccess = () => {
      isProcessingRef.current = true;
      playJumpSound();
      setIsJumping(true);

      // Hit animation timing
      setTimeout(() => {
         const newStreak = streak + 1;
         setScore(prev => prev + 100);
         setStreak(newStreak);
         setShowCoin(true);
         
         // Mark block as hit
         if (level === GameLevel.TWO) {
             setHitIndices(prev => [...prev, wordIndex]);
         }

         // Check if Round Complete
         const isRoundComplete = level === GameLevel.ONE ? true : (wordIndex === targetWord.length - 1);

         if (isRoundComplete) {
             // Round Complete (Level 1 or End of Word in Level 2)
             if (newStreak % 5 === 0 || (level === GameLevel.TWO)) {
                // Word completion in L2 always gets a star/powerup sound because it's harder
                playPowerUpSound();
                if (level === GameLevel.TWO) {
                   // Say word again for reinforcement
                   setTimeout(() => playDutchWord(targetWord), 1000);
                }
                setShowStar(true);
                setTimeout(() => {
                   nextRound(level);
                }, 3500);
             } else {
                playCoinSound();
                setTimeout(() => {
                   nextRound(level);
                }, 1200);
             }
         } else {
             // Level 2: Mid-word progression
             playCoinSound();
             setTimeout(() => {
                 setIsJumping(false);
                 setShowCoin(false);
                 setWordIndex(prev => prev + 1);
                 
                 // Trigger visual walking animation matching CSS transition
                 if (level === GameLevel.TWO) {
                     setIsMoving(true);
                     setTimeout(() => setIsMoving(false), 500); // 500ms duration
                 }

                 isProcessingRef.current = false; // Allow next input
                 
                 // Pronounce next letter
                 if (wordIndex + 1 < targetWord.length) {
                    playDutchPronunciation(targetWord[wordIndex + 1]);
                 }
             }, 800);
         }

      }, 250); // Jump apex
  };

  const handleError = (target: string) => {
      // Calculate new lives immediately
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
          setGameState(GameState.GAME_OVER);
          playGameOverSound();
      } else {
          setIsError(true);
          setStreak(0);
          playBumpSound();
          setTimeout(() => setIsError(false), 300);
          
          // Re-pronounce
          setTimeout(() => {
            if (!isProcessingRef.current) {
                 playDutchPronunciation(target);
            }
          }, 600);
      }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <Background>
      <div className="w-full h-full relative flex flex-col justify-between">
        
        {/* HUD */}
        {(gameState !== GameState.START) && (
            <div className="absolute top-4 left-4 md:left-10 right-4 flex items-start gap-4 md:gap-8 text-lg md:text-3xl text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)] z-40 pixel-font pointer-events-none w-full">
                
                {/* Back Button */}
                <button 
                    onClick={handleBackToMenu}
                    className="pointer-events-auto bg-[#E52521] text-xs md:text-sm border-2 border-white px-2 py-2 md:px-4 rounded shadow-md hover:bg-[#c41f1b] active:translate-y-1 transition-all flex flex-col items-center justify-center gap-1 shrink-0"
                    aria-label="Menu"
                >
                    <span className="text-xl">🏠</span>
                </button>

                <div className="flex flex-col shrink-0">
                    <span className="text-xs md:text-lg text-yellow-400 mb-1">PUNTEN</span>
                    <span>{score.toString().padStart(6, '0')}</span>
                </div>

                {/* Lives Display - Centered or close to center */}
                <div className="flex flex-col items-center mx-auto md:mx-4 shrink-0">
                    <span className="text-xs md:text-lg text-red-400 mb-1">LEVENS</span>
                    <div className="flex gap-1 md:gap-2">
                        {[...Array(INITIAL_LIVES)].map((_, i) => (
                            <Heart key={i} filled={i < lives} />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col shrink-0">
                    <span className="text-xs md:text-lg text-yellow-400 mb-1">REEKS</span>
                    <span>{streak}</span>
                </div>
                
                {level === GameLevel.TWO && (
                    <div className="hidden md:flex flex-col ml-auto mr-4 md:mr-12 text-right">
                        <span className="text-xs md:text-lg text-green-400 mb-1">WOORD</span>
                        <span className="tracking-widest">{targetWord}</span>
                    </div>
                )}
            </div>
        )}

        {gameState === GameState.START ? (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
              <div className="bg-[#5c94fc] p-8 md:p-12 rounded-2xl border-[6px] border-black shadow-[12px_12px_0_rgba(0,0,0,0.5)] text-center max-w-2xl animate-bounce-short">
                <h1 className="text-3xl md:text-5xl text-yellow-300 mb-8 pixel-font drop-shadow-[4px_4px_0_#000]">
                  Super<br/>Letter<br/>Bros
                </h1>
                
                <div className="flex flex-col md:flex-row gap-6 justify-center">
                    <button 
                        onClick={() => startGame(GameLevel.ONE)}
                        className="bg-[#E52521] hover:bg-[#c41f1b] text-white py-4 px-6 border-b-[6px] border-[#9e1a17] active:translate-y-2 rounded-lg transition-all pixel-font shadow-xl flex flex-col items-center gap-2 group"
                    >
                        <span className="text-xl md:text-2xl">LEVEL 1</span>
                        <span className="text-xs opacity-80 font-sans">Letters & Cijfers</span>
                    </button>

                    <button 
                        onClick={() => startGame(GameLevel.TWO)}
                        className="bg-[#43B047] hover:bg-[#38943b] text-white py-4 px-6 border-b-[6px] border-[#2d7a30] active:translate-y-2 rounded-lg transition-all pixel-font shadow-xl flex flex-col items-center gap-2 group"
                    >
                        <span className="text-xl md:text-2xl">LEVEL 2</span>
                        <span className="text-xs opacity-80 font-sans">Woorden Leren</span>
                    </button>
                </div>
              </div>
          </div>
        ) : gameState === GameState.GAME_OVER ? (
           <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm">
              <div className="bg-[#2a2a2a] p-8 md:p-12 rounded-xl border-[4px] border-white shadow-[0_0_20px_rgba(0,0,0,0.8)] text-center animate-shake">
                  <h2 className="text-4xl md:text-6xl text-[#E52521] mb-6 pixel-font drop-shadow-[4px_4px_0_#000]">GAME OVER</h2>
                  <div className="text-white text-lg md:text-2xl mb-8 pixel-font space-y-4">
                      <p>PUNTEN: <span className="text-yellow-400">{score}</span></p>
                      <p>BESTE REEKS: <span className="text-yellow-400">{streak}</span></p>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                      <button 
                          onClick={() => startGame(level)}
                          className="bg-[#43B047] hover:bg-[#38943b] text-white py-3 px-6 border-b-[4px] border-[#2d7a30] active:translate-y-1 rounded pixel-font"
                      >
                          OPNIEUW SPELEN
                      </button>
                      <button 
                          onClick={handleBackToMenu}
                          className="bg-gray-600 hover:bg-gray-500 text-white py-3 px-6 border-b-[4px] border-gray-800 active:translate-y-1 rounded pixel-font"
                      >
                          NAAR MENU
                      </button>
                  </div>
              </div>
           </div>
        ) : (
          <>
            {/* GAME AREA */}
            {/* Anchored from bottom for consistent jump height calculation */}
            {/* Mobile: 32 tailwind units (8rem) from bottom. Desktop: 64 units (16rem). */}
            <div className="absolute bottom-32 md:bottom-64 w-full flex flex-col items-center justify-center z-20">
                
                {/* Level 1: Single Block */}
                {level === GameLevel.ONE && (
                    <div className="relative">
                        {showCoin && <CoinAnimation />}
                        <Block 
                            char={targetChar} 
                            isHit={level === GameLevel.ONE ? (showCoin || showStar) : false}
                            isError={isError} 
                        />
                        <div className="mt-8 bg-white border-[3px] border-black px-4 py-2 rounded-xl relative shadow-md animate-pulse mx-auto w-max">
                            <p className="text-black pixel-font text-xs md:text-sm font-bold">DRUK OP "{targetChar}"</p>
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-black"></div>
                        </div>
                    </div>
                )}

                {/* Level 2: Word Blocks */}
                {level === GameLevel.TWO && (
                     /* 
                        We use CSS variables for block "pitch" (width + gap) to help calculate Mario's translation.
                        Mobile: 4rem block + 0.5rem gap = 4.5rem
                        Desktop: 5rem block + 1rem gap = 6rem
                     */
                     <div className="relative flex gap-2 md:gap-4 [--block-pitch:4.5rem] md:[--block-pitch:6rem]">
                        
                        {targetWord.split('').map((char, index) => (
                            <div key={index} className="relative">
                                {/* Coin is now positioned relative to the specific block it comes from */}
                                {showCoin && index === wordIndex && <CoinAnimation />}
                                <Block 
                                    char={char} 
                                    isHit={hitIndices.includes(index)}
                                    isError={isError && index === wordIndex}
                                    size="small" 
                                />
                            </div>
                        ))}
                     </div>
                )}
            </div>

            {/* Mario Player */}
            {/* 
                Mario container also respects the same block pitch.
                Transform logic: Center is 0. 
                Move relative to index offset from center: (index - center) * pitch.
            */}
            <div className="absolute bottom-0 left-0 w-full flex justify-center items-end z-30 pb-1 [--block-pitch:4.5rem] md:[--block-pitch:6rem]">
                 <div 
                    className="transition-transform duration-500 ease-in-out"
                    style={{
                        transform: level === GameLevel.TWO 
                            ? `translateX(calc((${wordIndex} - ${(targetWord.length - 1) / 2}) * var(--block-pitch)))`
                            : 'translateX(0)'
                    }}
                 >
                    <Mario isJumping={isJumping} isMoving={isMoving} />
                 </div>
            </div>

            {/* Replay Sound */}
            <div className="absolute bottom-6 right-6 z-50">
                <button 
                    onClick={() => {
                        if(level === GameLevel.ONE) playDutchPronunciation(targetChar);
                        else playDutchWord(targetWord);
                    }}
                    className="bg-[#FBD000] w-14 h-14 rounded-full border-[3px] border-black hover:scale-110 active:scale-95 transition-transform shadow-lg flex items-center justify-center"
                >
                    <span className="text-2xl">🔊</span>
                </button>
            </div>

            {showStar && <StarAnimation />}
          </>
        )}
      </div>
    </Background>
  );
};

export default App;