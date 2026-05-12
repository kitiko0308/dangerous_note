// 共通の型定義
export type ScreenState = "title" | "setup" | "role_reveal" | "play" | "result";
export type GamePhase = "morning" | "mini_game" | "noon_result" | "voting" | "night";
export type GameResult = "villager_win" | "kira_win" | "kira_lose" | null;

export type Player = {
  id: number;
  nickname: string;
  realName: string;
  role: "villager" | "l" | "kira";
  isAlive: boolean;
  miniGameRank?: number;
};
