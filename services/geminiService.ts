import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Audio Context Singleton
let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | OscillatorNode | null = null;
const audioCache = new Map<string, AudioBuffer>();

export const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 24000, // Gemini TTS uses 24kHz
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
      // Ignore errors if already stopped
    }
    currentSource = null;
  }
  window.speechSynthesis.cancel();
};

const DUTCH_PRONUNCIATION_MAP: Record<string, string> = {
  'A': 'Aa',
  'B': 'Bee',
  'C': 'See',
  'D': 'Dee',
  'E': 'Ee',
  'F': 'Ef',
  'G': 'Gee',
  'H': 'Haa',
  'I': 'Ie',
  'J': 'Jee',
  'K': 'Kaa',
  'L': 'El',
  'M': 'Em',
  'N': 'En',
  'O': 'Oo',
  'P': 'Pee',
  'Q': 'Kuu',
  'R': 'Er',
  'S': 'Es',
  'T': 'Tee',
  'U': 'Uu',
  'V': 'Vee',
  'W': 'Wee',
  'X': 'Iks',
  'Y': 'Ypsilon',
  'Z': 'Zet',
  '0': 'Nul',
  '1': 'Één',
  '2': 'Twee',
  '3': 'Drie',
  '4': 'Vier',
  '5': 'Vijf',
  '6': 'Zes',
  '7': 'Zeven',
  '8': 'Acht',
  '9': 'Negen'
};

// Helper to decode Base64 string to byte array
function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode raw PCM to AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext
): Promise<AudioBuffer> {
  // Gemini sends raw PCM (Int16, 24kHz, Mono usually)
  // We need to convert Int16 to Float32 for Web Audio API
  const dataInt16 = new Int16Array(data.buffer);
  const channelCount = 1;
  const sampleRate = 24000;
  
  const audioBuffer = ctx.createBuffer(channelCount, dataInt16.length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);
  
  for (let i = 0; i < dataInt16.length; i++) {
    // Convert 16-bit integer (-32768 to 32767) to float (-1.0 to 1.0)
    channelData[i] = dataInt16[i] / 32768.0;
  }
  
  return audioBuffer;
}

const playBuffer = (buffer: AudioBuffer, ctx: AudioContext) => {
  stopAllSounds();
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
  currentSource = source;
};

const fallbackSpeechSynthesis = (text: string) => {
    stopAllSounds();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'nl-NL';
    utterance.rate = 0.9;
    utterance.pitch = 1.2; // Higher pitch for "fun" fallback
    window.speechSynthesis.speak(utterance);
};

export const playDutchWord = async (word: string): Promise<void> => {
    // For full words, we just want natural pronunciation, not spelled out
    const ctx = getAudioContext();
    const cacheKey = `WORD_${word.toUpperCase()}`;
    
    if (audioCache.has(cacheKey)) {
        playBuffer(audioCache.get(cacheKey)!, ctx);
        return;
    }

    try {
        const prompt = `Zeg het woord "${word}" duidelijk en vrolijk in het Nederlands.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Puck' }, 
                    },
                },
            },
        });
  
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
        if (base64Audio) {
            const rawBytes = decodeBase64(base64Audio);
            const audioBuffer = await decodeAudioData(rawBytes, ctx);
            audioCache.set(cacheKey, audioBuffer);
            playBuffer(audioBuffer, ctx);
        } else {
            fallbackSpeechSynthesis(word);
        }
    } catch (error) {
        console.error("Gemini TTS Error:", error);
        fallbackSpeechSynthesis(word);
    }
}

export const playDutchPronunciation = async (character: string): Promise<void> => {
  const ctx = getAudioContext();
  const charUpper = character.toUpperCase();
  const textToSpeak = DUTCH_PRONUNCIATION_MAP[charUpper] || character.toLowerCase();

  // 1. Check Cache
  if (audioCache.has(charUpper)) {
      playBuffer(audioCache.get(charUpper)!, ctx);
      return;
  }

  // 2. Try Gemini TTS
  try {
      // Prompt designed for "Mario-like" enthusiasm
      const prompt = `Zeg op een energieke, vrolijke en hoge toon in het Nederlands: ${textToSpeak}`;
      
      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: prompt }] }],
          config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: {
                    // 'Puck' is often lighter/more playful. 'Zephyr' is also good.
                    prebuiltVoiceConfig: { voiceName: 'Puck' }, 
                  },
              },
          },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (base64Audio) {
          const rawBytes = decodeBase64(base64Audio);
          const audioBuffer = await decodeAudioData(rawBytes, ctx);
          
          // Cache it
          audioCache.set(charUpper, audioBuffer);
          
          playBuffer(audioBuffer, ctx);
      } else {
          console.warn("No audio data returned from Gemini, using fallback.");
          fallbackSpeechSynthesis(textToSpeak);
      }

  } catch (error) {
      console.error("Gemini TTS Error:", error);
      fallbackSpeechSynthesis(textToSpeak);
  }
};

// --- SFX Generation (Oscillators for 8-bit feel) ---

export const playCoinSound = () => {
  stopAllSounds(); 
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'square';
  // Classic Mario Coin: B5 followed quickly by E6
  osc.frequency.setValueAtTime(987.77, t); 
  osc.frequency.setValueAtTime(1318.51, t + 0.08); 
  
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.linearRampToValueAtTime(0.1, t + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(t);
  osc.stop(t + 0.5);
  
  currentSource = osc;
};

export const playJumpSound = () => {
  // Jump sound overlays, don't stop previous (like pronunciation) abruptly unless needed
  // stopAllSounds(); 
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'square';
  // Classic Jump: Slide up
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.linearRampToValueAtTime(450, t + 0.1);
  
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.linearRampToValueAtTime(0.0, t + 0.1);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(t);
  osc.stop(t + 0.1);
  
  // We don't set currentSource here to allow overlap with voice
};

export const playBumpSound = () => {
  stopAllSounds();
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  // Bump is a low square wave interfering with itself or just low freq
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
};

export const playPowerUpSound = () => {
  stopAllSounds();
  const ctx = getAudioContext();
  const t = ctx.currentTime;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'triangle';
  
  // Power up arpeggio
  const notes = [
      440.00, // A4
      554.37, // C#5
      659.25, // E5
      880.00, // A5
      1108.73, // C#6
      1318.51, // E6
      1760.00, // A6
      2217.46, // C#7
      2637.02  // E7
  ];

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
};