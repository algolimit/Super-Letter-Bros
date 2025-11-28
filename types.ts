export enum GameState {
  START = 'START',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export enum GameLevel {
  ONE = 'ONE', // Single characters
  TWO = 'TWO'  // Words
}

export interface GameStats {
  score: number;
  level: GameLevel;
}