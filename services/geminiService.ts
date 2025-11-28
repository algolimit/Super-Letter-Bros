
// Audio Service
// Handles loading static audio files from /public/audio with fallbacks to synthesized sound.

// CONFIGURATION: Map your local files here.
// Expected structure in your 'public' folder:
// - /audio/letters/a.mp3
// - /audio/words/kat.mp3
// - /audio/sfx/jump.mp3

const AUDIO_PATHS = {
  LETTERS: '/audio/letters', // + /a.mp3
  WORDS: '/audio/words',     // + /kat.mp3
  SFX: '/audio/sfx'          // + /jump.mp3
};

const SFX_FILES = {
  COIN: 'coin.mp3',
  JUMP: 'jump.mp3',
  BUMP: 'bump.mp3',
  POWERUP: 'powerup.mp3',
  GAMEOVER: 'gameover.mp3'
};

// --- Audio Context & State ---

let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | OscillatorNode | null = null;
const audioCache = new Map<string, AudioBuffer>();

export const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 44100,
    });
  }
  return audioContext;
};

export const stopAllSounds = () => {
  if (currentSource) {
    try {
      currentSource.stop();
      currentSource.disconnect();
    } catch (e) {
      // Ignore if already stopped
    }
    currentSource = null;
  }
  window.speechSynthesis.cancel();
};

// --- Core Loading Logic ---

// Decodes raw array buffer into AudioBuffer
async function decodeAudioData(arrayBuffer: ArrayBuffer, ctx: AudioContext): Promise<AudioBuffer> {
  return await ctx.decodeAudioData(arrayBuffer);
}

// Fetches a file from public folder, returns AudioBuffer or null if missing
async function loadAudioFile(path: string): Promise<AudioBuffer | null> {
  if (audioCache.has(path)) {
    return audioCache.get(path)!;
  }

  try {
    const response = await fetch(path);
    if (!response.ok) {
        // 404 or other error - file doesn't exist locally
        return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    const ctx = getAudioContext();
    const audioBuffer = await decodeAudioData(arrayBuffer, ctx);
    
    audioCache.set(path, audioBuffer);
    return audioBuffer;
  } catch (error) {
    console.warn(`Could not load audio file at ${path}, using fallback.`, error);
    return null;
  }
}

function playBuffer(buffer: AudioBuffer, ctx: AudioContext) {
  stopAllSounds();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
  currentSource = source;
}

// --- Speech Logic (Pronunciation) ---

// Fallback mapping for Dutch Browser TTS
const DUTCH_PRONUNCIATION_MAP: Record<string, string> = {
  'A': 'Aa', 'B': 'Bee', 'C': 'See', 'D': 'Dee', 'E': 'Ee',
  'F': 'Ef', 'G': 'Gee', 'H': 'Haa', 'I': 'Ie', 'J': 'Jee',
  'K': 'Kaa', 'L': 'El', 'M': 'Em', 'N': 'En', 'O': 'Oo',
  'P': 'Pee', 'Q': 'Kuu', 'R': 'Er', 'S': 'Es', 'T': 'Tee',
  'U': 'Uu', 'V': 'Vee', 'W': 'Wee', 'X': 'Iks', 'Y': 'Ypsilon',
  'Z': 'Zet', '0': 'Nul', '1': 'Één', '2': 'Twee', '3': 'Drie',
  '4': 'Vier', '5': 'Vijf', '6': 'Zes', '7': 'Zeven', '8': 'Acht',
  '9': 'Negen'
};

const fallbackSpeechSynthesis = (text: string, isCharacter: boolean = false) => {
    stopAllSounds();
    // If it's a character, look up the phonetic map, otherwise speak the word
    const speakText = isCharacter 
        ? (DUTCH_PRONUNCIATION_MAP[text.toUpperCase()] || text) 
        : text;

    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.lang = 'nl-NL';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
};

export const playDutchPronunciation = async (character: string): Promise<void> => {
  const ctx = getAudioContext();
  const path = `${AUDIO_PATHS.LETTERS}/${character.toLowerCase()}.mp3`;
  
  // 1. Try to load local file
  const buffer = await loadAudioFile(path);

  if (buffer) {
    playBuffer(buffer, ctx);
  } else {
    // 2. Fallback to Browser TTS
    fallbackSpeechSynthesis(character, true);
  }
};

export const playDutchWord = async (word: string): Promise<void> => {
  const ctx = getAudioContext();
  const path = `${AUDIO_PATHS.WORDS}/${word.toLowerCase()}.mp3`;

  const buffer = await loadAudioFile(path);

  if (buffer) {
    playBuffer(buffer, ctx);
  } else {
    fallbackSpeechSynthesis(word, false);
  }
};

// --- SFX Logic (Sound Effects) ---

// Helper to play SFX with fallback oscillator
async function playSfx(filename: string, fallbackFn: () => void) {
  const ctx = getAudioContext();
  const path = `${AUDIO_PATHS.SFX}/${filename}`;
  
  // Allow SFX to overlap slightly (don't stopAllSounds immediately unless it's a long sound)
  // But for this game, single channel focus is often cleaner.
  
  const buffer = await loadAudioFile(path);
  
  if (buffer) {
    // We don't use playBuffer here because we might not want to kill the previous sound completely
    // if we want overlapping effects (like collecting multiple coins). 
    // However, to keep it simple and consistent:
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  } else {
    fallbackFn();
  }
}

export const playCoinSound = () => playSfx(SFX_FILES.COIN, () => {
  // Fallback: Square Wave Coin
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(987.77, t); 
  osc.frequency.setValueAtTime(1318.51, t + 0.08); 
  
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.linearRampToValueAtTime(0.1, t + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.5);
});

export const playJumpSound = () => playSfx(SFX_FILES.JUMP, () => {
  // Fallback: Slide Up
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.linearRampToValueAtTime(450, t + 0.1);
  
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.linearRampToValueAtTime(0.0, t + 0.1);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.1);
});

export const playBumpSound = () => playSfx(SFX_FILES.BUMP, () => {
  stopAllSounds();
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.linearRampToValueAtTime(50, t + 0.1);
  
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.linearRampToValueAtTime(0.001, t + 0.15);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.15);
  currentSource = osc;
});

export const playPowerUpSound = () => playSfx(SFX_FILES.POWERUP, () => {
  stopAllSounds();
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'triangle';
  const notes = [440.00, 554.37, 659.25, 880.00, 1108.73, 1318.51, 1760.00, 2217.46, 2637.02];

  notes.forEach((freq, i) => {
      osc.frequency.setValueAtTime(freq, t + (i * 0.12));
  });
  
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.setValueAtTime(0.1, t + 1.0);
  gain.gain.linearRampToValueAtTime(0.001, t + 1.5);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 1.5);
  currentSource = osc;
});

export const playGameOverSound = () => playSfx(SFX_FILES.GAMEOVER, () => {
  stopAllSounds();
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'triangle';
  const notes = [
      { freq: 493.88, time: 0.0, dur: 0.15 },
      { freq: 698.46, time: 0.15, dur: 0.15 },
      { freq: 698.46, time: 0.45, dur: 0.15 },
      { freq: 698.46, time: 0.60, dur: 0.12 },
      { freq: 659.25, time: 0.72, dur: 0.12 },
      { freq: 587.33, time: 0.84, dur: 0.12 },
      { freq: 523.25, time: 0.96, dur: 0.30 },
  ];

  notes.forEach((note) => {
      osc.frequency.setValueAtTime(note.freq, t + note.time);
  });
  
  gain.gain.setValueAtTime(0.15, t);
  notes.forEach(note => {
     gain.gain.setValueAtTime(0.15, t + note.time);
     gain.gain.linearRampToValueAtTime(0.01, t + note.time + note.dur - 0.01);
  });

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 1.4);
  currentSource = osc;
});
