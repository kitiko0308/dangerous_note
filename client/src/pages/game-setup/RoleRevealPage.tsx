import { useState } from "react";
import { toFullWidth } from "../../utils/numberFormat";
import kiraImg from "../../assets/img/kira_hito.png";
import lImg from "../../assets/img/L_hito.png";
import siminnImg from "../../assets/img/siminn_hito.png";
import aiBg from "../../assets/img/ai.png";
import sunaarasiBg from "../../assets/img/sunaarasi.png";
import type { Player } from "../../types";

type Props = {
  players: Player[];
  onNext: () => void;
};

export default function RoleRevealPage({ players, onNext }: Props) {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isShowing, setIsShowing] = useState(false);
  const [previewRole, setPreviewRole] = useState<Player["role"]>(
    () => players[0]?.role ?? "villager",
  );

  const currentPlayer = players[currentPlayerIndex];

  // Inject responsive CSS once to crop image bottoms on small screens
  const cropCss = `
    /* mobile: show more of the lower area while trimming a small bit from the top */
    @media (max-width: 720px) {
      .role-reveal__art { overflow: hidden; height: 60vh; }
      .role-reveal__art-image, .role-kira-art, .role-l-art {
        width: 100%;
        height: 120%;
        object-fit: cover;
        /* move focal point slightly down so top is cropped a little and more lower part is visible */
        object-position: center 20%;
      }
    }
  `;

  if (
    typeof window !== "undefined" &&
    !document.getElementById("role-reveal-crop-styles")
  ) {
    const style = document.createElement("style");
    style.id = "role-reveal-crop-styles";
    style.innerHTML = cropCss;
    document.head.appendChild(style);
  }

  // previewRole は初期化で players[0] の役職に合わせるため、
  // isShowing の変化で同期させる useEffect は不要です。

  // 役職名の日本語表示用
  const roleNames = {
    kira: "キラ",
    l: "L",
    villager: "市民",
  };

  const roleAccentColors = {
    kira: "#dc2626",
    l: "#3b82f6",
    villager: "#22c55e",
  } as const;

  const handleNext = () => {
    if (currentPlayerIndex < players.length - 1) {
      const nextIdx = currentPlayerIndex + 1;
      setCurrentPlayerIndex(nextIdx);
      // 先に previewRole を次プレイヤーの役職にしておくことで
      // Next Player 押下時のタブ選択ラグを防ぐ
      setPreviewRole(players[nextIdx].role);
      setIsShowing(false);
    } else {
      onNext();
    }
  };

  // isShowing の有無による表示切替:
  // - isShowing=true のときは左側画像 + 右側パネルの詳細レイアウト（タブで previewRole を切替）
  // - isShowing=false のときは簡易な確認レイアウトを表示
  const displayRole = isShowing ? previewRole : currentPlayer.role;
  const isVillager = isShowing && displayRole === "villager";
  const isL = isShowing && displayRole === "l";
  const isKira = isShowing && displayRole === "kira";
  const accentColor = roleAccentColors[displayRole];
  const tabRoles = (() => {
    const base: Player["role"][] = ["kira", "l", "villager"];
    if (currentPlayer && base.includes(currentPlayer.role)) {
      return [
        currentPlayer.role,
        ...base.filter((r) => r !== currentPlayer.role),
      ];
    }
    return base;
  })();
  const roleIntroText =
    displayRole !== currentPlayer.role
      ? "彼は..."
      : `${currentPlayer.nickname} さんの役職は...`;

  if (isVillager || isL || isKira) {
    return (
      <div
        className="title-screen"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.12), rgba(0,0,0,0.12)), url(${aiBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="title-screen__grain" aria-hidden="true" />
        <div className="title-screen__vignette" aria-hidden="true" />

        <main className="role-reveal__main">
          {/* ヘッダー */}
          <div className="role-reveal__header">
            <h2 className="title-logo role-reveal__title">役職の確認</h2>
            <p className="title-sub">
              <span style={{ color: "#dc2626" }}>
                {toFullWidth(currentPlayerIndex + 1)}
              </span>{" "}
              / {toFullWidth(players.length)} 人目の確認
            </p>
          </div>

          {/* 左画像 + 右パネルレイアウト */}
          <div className="role-reveal__layout">
            {/* 右: 画像 */}
            <div className="role-reveal__art">
              {isShowing && (
                <p
                  className="role-reveal-tabs-hint"
                  style={{ transform: "translateX(75px)" }}
                >
                  ▼ 他の役職を確認する
                </p>
              )}
              {isShowing && (
                <div className="role-reveal__tabs">
                  {tabRoles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setPreviewRole(role)}
                      className="role-preview-tab role-reveal__tab"
                      aria-pressed={displayRole === role}
                      style={{
                        transform:
                          displayRole === role ? "scale(1.12)" : "scale(1)",
                        padding:
                          displayRole === role ? "10px 16px" : "8px 12px",
                        fontSize: displayRole === role ? "14px" : "13px",
                        borderColor:
                          displayRole === role
                            ? roleAccentColors[role]
                            : "rgba(255,255,255,.12)",
                        background:
                          displayRole === role
                            ? `${roleAccentColors[role]}22`
                            : "rgba(0,0,0,.35)",
                        color: displayRole === role ? "#ffffff" : "#cbd5e1",
                        zIndex: displayRole === role ? 2 : 1,
                      }}
                    >
                      {roleNames[role]}
                    </button>
                  ))}
                </div>
              )}
              <img
                src={isKira ? kiraImg : isL ? lImg : siminnImg}
                alt={isKira ? "キラ" : isL ? "L" : "市民"}
                className={
                  isKira
                    ? "role-kira-art-side role-reveal__art-image"
                    : isL
                      ? "role-l-art-side role-reveal__art-image"
                      : "role-villager-art-side role-reveal__art-image"
                }
              />
            </div>

            {/* 右: 情報パネル */}
            <div className="role-reveal__panel">
              {/* 役職確認パネル */}
              <div
                className="role-reveal__card"
                style={{ boxShadow: `0 0 18px ${accentColor}14` }}
              >
                <p className="role-reveal__intro">{roleIntroText}</p>
                <h1
                  className="role-reveal__role-name"
                  style={{ color: accentColor }}
                >
                  {roleNames[displayRole]}
                </h1>
                {isKira && (
                  <p
                    className="role-reveal__role-copy"
                    style={{ color: "#fca5a5" }}
                  >
                    名前を書かれた人間は死ぬ。
                  </p>
                )}
                {isL && (
                  <p
                    className="role-reveal__role-copy"
                    style={{ color: "#93c5fd" }}
                  >
                    真実は、調査すればするほど浮かび上がる。
                  </p>
                )}
                {isVillager && (
                  <p
                    className="role-reveal__role-copy"
                    style={{ color: "#86efac" }}
                  >
                    あなたの一票が、村を救う。
                  </p>
                )}
              </div>

              {isKira ? (
                <>
                  {/* キラの勝利条件パネル (先に表示) */}
                  <div
                    className="role-reveal__card"
                    style={{ boxShadow: `0 0 18px ${accentColor}14` }}
                  >
                    <h3 className="role-reveal__section-title">勝利条件</h3>
                    <p className="role-reveal__rule">
                      ♦　
                      <span style={{ color: "#dc2626" }}>追放されなければ</span>
                      勝利する。
                    </p>
                    <p className="role-reveal__rule role-reveal__rule--spaced">
                      　　ただし、5ターン以内に誰も殺せなかった場合は敗北する。
                    </p>
                  </div>

                  {/* キラの能力パネル (勝利条件の下) */}
                  <div
                    className="role-reveal__card"
                    style={{ boxShadow: `0 0 18px ${accentColor}14` }}
                  >
                    <h3 className="role-reveal__section-title">能力</h3>
                    <p className="role-reveal__rule">
                      ♦　<span style={{ color: "#ffffff" }}>毎晩</span>
                      、ランダムで1人の本名の
                      <span style={{ color: "#dc2626" }}>一文字を知る</span>
                      ことができる。
                    </p>
                    <p className="role-reveal__rule role-reveal__rule--spaced">
                      ♦　ミニゲームで
                      <span style={{ color: "#ffffff" }}>1位</span>
                      になった場合、アイテム{" "}
                      <span>
                        <span style={{ color: "#ffffff" }}>【　</span>
                        <span style={{ color: accentColor }}>死神の目</span>
                        <span style={{ color: "#ffffff" }}>　】</span>
                      </span>{" "}
                      を入手できる。
                    </p>
                    <p className="role-reveal__rule role-reveal__rule--spaced">
                      　　
                      <span>
                        <span style={{ color: "#ffffff" }}>【　</span>
                        <span style={{ color: accentColor }}>死神の目</span>
                        <span style={{ color: "#ffffff" }}>　】</span>
                      </span>{" "}
                      を使用すると、その夜にランダムで1人の
                      <span style={{ color: "#dc2626" }}>本名を知る</span>
                      ことができる。
                    </p>
                  </div>
                </>
              ) : isL ? (
                <>
                  {/* L の勝利条件パネル (先に表示) */}
                  <div
                    className="role-reveal__card"
                    style={{ boxShadow: `0 0 18px ${accentColor}14` }}
                  >
                    <h3 className="role-reveal__section-title">勝利条件</h3>
                    <p className="role-reveal__rule">
                      ♦　<span style={{ color: "#3b82f6" }}>キラを追放</span>
                      する。
                    </p>
                    <p className="role-reveal__rule role-reveal__rule--spaced">
                      ♦　キラが5ターン以内に誰も裁けなかった場合、市民陣営の勝利となる。
                    </p>
                  </div>

                  {/* L の能力パネル (勝利条件の下) */}
                  <div
                    className="role-reveal__card"
                    style={{ boxShadow: `0 0 18px ${accentColor}14` }}
                  >
                    <h3 className="role-reveal__section-title">能力</h3>
                    <p className="role-reveal__rule">
                      ♦　毎晩、プレイヤー1人の、その日のミニゲームの
                      <span style={{ color: "#3b82f6" }}>「順位」を調査</span>
                      できる。
                    </p>
                    <p className="role-reveal__rule role-reveal__rule--spaced">
                      ♦　昼のミニゲームで1位になったとき、アイテム{" "}
                      <span>
                        <span style={{ color: "#ffffff" }}>【　</span>
                        <span style={{ color: accentColor }}>
                          ショートケーキ
                        </span>
                        <span style={{ color: "#ffffff" }}>　】</span>
                      </span>{" "}
                      を入手できる。
                    </p>
                    <p className="role-reveal__rule role-reveal__rule--spaced">
                      　　
                      <span>
                        <span style={{ color: "#ffffff" }}>【　</span>
                        <span style={{ color: accentColor }}>
                          ショートケーキ
                        </span>
                        <span style={{ color: "#ffffff" }}>　】</span>
                      </span>{" "}
                      を使用すると、任意のプレイヤー1人を指名し、その人が
                      <span style={{ color: "#3b82f6" }}>キラか</span>
                      <span style={{ color: "#3b82f6" }}>どうかを知る</span>
                      ことができる。
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* 市民の勝利条件パネル */}
                  <div
                    className="role-reveal__card"
                    style={{ boxShadow: `0 0 18px ${accentColor}14` }}
                  >
                    <h3 className="role-reveal__section-title">勝利条件</h3>
                    <p className="role-reveal__rule">
                      ♦　<span style={{ color: "#22c55e" }}>キラを追放</span>
                      する。
                    </p>
                    <p className="role-reveal__rule role-reveal__rule--spaced">
                      ♦　キラが5ターン以内に誰も裁けなかった場合、市民陣営の勝利となる。
                    </p>
                  </div>

                  {/* 市民の能力パネル */}
                  <div
                    className="role-reveal__card"
                    style={{ boxShadow: `0 0 18px ${accentColor}14` }}
                  >
                    <h3 className="role-reveal__section-title">能力</h3>
                    <p className="role-reveal__rule">
                      ♦　特殊能力は
                      <span style={{ color: "#22c55e" }}>持たない</span>。
                    </p>
                    <p className="role-reveal__rule role-reveal__rule--spaced">
                      ♦　夜の行動では「休む」を選択する。
                    </p>
                    <p className="role-reveal__rule role-reveal__rule--spaced">
                      ♦　話し合いと投票でキラ（敵）を追放へ導く。
                    </p>
                  </div>
                </>
              )}

              {/* ボタン */}
              <button
                className="dn-button role-reveal-action-button role-reveal__action"
                onClick={handleNext}
              >
                {currentPlayerIndex < players.length - 1 ? (
                  "Next Player"
                ) : currentPlayer.role === "kira" ? (
                  <>
                    <span style={{ color: accentColor }}>狩り</span>を始める
                  </>
                ) : (
                  <>
                    <span style={{ color: accentColor }}>裁き</span>を始める
                  </>
                )}
              </button>
            </div>
          </div>

          {/* プログレスドット */}
          <div className="role-reveal__dots">
            {players.map((_, i) => (
              <div
                key={i}
                className="role-reveal__progress-dot"
                style={{
                  backgroundColor:
                    i === currentPlayerIndex
                      ? "var(--kira-red)"
                      : "var(--border-color)",
                }}
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // isShowing が false の場合に表示される既存の簡易レイアウト
  return (
    <div
      className="title-screen"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.12), rgba(0,0,0,0.12)), url(${aiBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="title-screen__grain" aria-hidden="true" />
      <div className="title-screen__vignette" aria-hidden="true" />

      <main className="title-content">
        {isShowing && currentPlayer.role === "kira" && (
          <img src={kiraImg} alt="kira" className="role-kira-art" />
        )}
        {isShowing && currentPlayer.role === "l" && (
          <img src={lImg} alt="L" className="role-l-art" />
        )}
        <div className="role-reveal__simple-wrap">
          <h2 className="title-logo role-reveal__title">役職の確認</h2>
          <p className="title-sub">
            <span style={{ color: "#dc2626" }}>
              {toFullWidth(currentPlayerIndex + 1)}
            </span>
            / {toFullWidth(players.length)}{" "}
          </p>

          <div
            className="dn-panel role-reveal__simple-panel"
            style={
              !isShowing
                ? {
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.28), rgba(0,0,0,0.28)), url(${sunaarasiBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            {!isShowing ? (
              <>
                <p className="role-reveal-warning">
                  <strong>
                    {currentPlayer.nickname ||
                      `プレイヤー ${currentPlayer.id + 1}`}
                  </strong>{" "}
                  さん以外、
                  <br />
                  頁を覗いてはならない。
                </p>
                <button
                  className="dn-button dn-button-primary"
                  onClick={() => setIsShowing(true)}
                >
                  役職を確認する
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: 18, color: "var(--text-dim)" }}>
                  {currentPlayer.nickname} さんの役職は...
                </p>
                <h1
                  style={{
                    fontSize: 56,
                    margin: "18px 0",
                    color:
                      currentPlayer.role === "kira"
                        ? "var(--kira-red)"
                        : "var(--l-blue)",
                  }}
                >
                  {roleNames[currentPlayer.role]}
                </h1>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-dim)",
                    marginBottom: 20,
                  }}
                >
                  確認したらボタンを押して隠してください
                </p>
                <button
                  className="dn-button role-reveal-action-button"
                  onClick={handleNext}
                >
                  {currentPlayerIndex < players.length - 1 ? (
                    "Next Player"
                  ) : currentPlayer.role === "kira" ? (
                    <>
                      <span style={{ color: accentColor }}>狩り</span>を始める
                    </>
                  ) : (
                    <>
                      <span style={{ color: accentColor }}>裁き</span>を始める
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          <div className="role-reveal__simple-dots">
            {players.map((_, i) => (
              <div
                key={i}
                className="role-reveal__progress-dot"
                style={{
                  backgroundColor:
                    i === currentPlayerIndex
                      ? "var(--kira-red)"
                      : "var(--border-color)",
                }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
