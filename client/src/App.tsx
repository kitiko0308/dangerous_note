import "./App.css";

function App() {
  const menuItems = [
    { label: "ゲームをはじめる", primary: true },
    { label: "ルール説明", primary: false },
    { label: "設定", primary: false },
  ];

  return (
    <div className="title-screen">
      <div className="title-screen__grain" aria-hidden="true" />
      <div className="title-screen__vignette" aria-hidden="true" />

      <aside className="prop-book" aria-hidden="true">
        <div className="prop-book__cover" />
        <div className="prop-book__feather" />
      </aside>

      <div className="shadow-creature" aria-hidden="true" />
      <div className="blood-orb" aria-hidden="true" />

      <main className="title-content">
        <h1 className="title-logo">
          <span>DANGEROUS</span>
          <span>NOTE</span>
          <i className="title-logo__quill" aria-hidden="true" />
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

export default App;
