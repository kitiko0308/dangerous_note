import React from 'react';
import titleBook from "../assets/img/title_book.png";

type Props = {
  onStart: () => void;
  onShowRules: () => void;
};

export default function TitleScreen({ onStart, onShowRules }: Props) {
  const menuItems = [
    { label: "ゲームをはじめる", primary: true, onClick: onStart },
    { label: "ルール説明", primary: false, onClick: onShowRules },
  ];

  return (
    <div
      className="title-screen"
      style={{ backgroundImage: `url(${titleBook})` }}
    >
      <div className="title-screen__grain" aria-hidden="true" />
      <div className="title-screen__vignette" aria-hidden="true" />

      <main className="title-content">
        <h1 className="title-logo">
          <span>DANGEROUS</span>
          <span>NOTE</span>
        </h1>

        <p className="title-sub">デンジャラスノート</p>
        <p className="title-tagline">
          人を疑い、<strong>真実</strong>を見抜け。
        </p>

        <nav className="title-menu" aria-label="タイトルメニュー">
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className={
                item.primary
                  ? "title-menu__button title-menu__button--primary"
                  : "title-menu__button"
              }
            >
              {item.label}
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}
