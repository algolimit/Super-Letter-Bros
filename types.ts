export enum GameState {
  START = 'START',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  GAME_OVER = 'GAME_OVER'
}

export enum GameLevel {
  ONE = 'ONE', // Single characters
  TWO = 'TWO'  // Words
}

export interface GameStats {
  score: number;
  level: GameLevel;
}