// 画面遷移や勝敗などの共通の型（Type）を定義するファイル

// 今どの画面を開いているかの型定義
export type ScreenState = "title" | "setup" | "play" | "result";

// 勝敗結果の型定義
export type GameResult = "villager_win" | "kira_win" | "kira_lose" | null;
