// 役職の種類
export type Role = "kira" | "l" | "villager";

// 所持アイテム
export type Item = "death_note_eye" | "shortcake";

// プレイヤー情報の型
export type Player = {
  id: number;
  nickname: string;
  realName: string;
  role: Role;
  isAlive: boolean;
  items: Item[];
  revealedChars: number[]; // 本名の何文字目がバレているか（全員に公開）
  kiraRevealedChars: number[]; // キラだけが知っている文字（キラ専用）
  isKilledByKira?: boolean; // キラによって殺害されたか
  miniGameRank?: number;
};

// 画面遷移の型
export type ScreenState = "title" | "rules" | "setup" | "role_reveal" | "play" | "result";

// ゲーム内フェーズの型
// 投票結果（exile_result）を追加
export type GamePhase = "morning" | "mini_game" | "minigame_result" | "voting" | "exile_result" | "midnight";

// 勝敗結果の型
export type GameResult = "villager_win" | "kira_win" | null;
