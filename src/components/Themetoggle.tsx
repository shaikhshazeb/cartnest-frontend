import { useTheme } from "@/context/ThemeContext";

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div style={{ position: "relative", width: "44px", height: "24px" }}>
      <style>{`
        .theme-switch-input { opacity: 0; width: 0; height: 0; position: absolute; }
        .theme-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; border-radius: 34px; overflow: hidden; transition: 0.4s; }
        .theme-sun-moon { position: absolute; height: 18px; width: 18px; left: 3px; bottom: 3px; border-radius: 50%; transition: 0.4s; }
        .theme-moon-dot { opacity: 0; transition: 0.4s; fill: gray; }
        .theme-cloud-light { position: absolute; fill: #eee; animation: theme-cloud-move 6s infinite; }
        .theme-cloud-dark { position: absolute; fill: #ccc; animation: theme-cloud-move 6s infinite; animation-delay: 1s; }
        .theme-stars { transform: translateY(-32px); opacity: 0; transition: 0.4s; }
        .theme-star { fill: white; position: absolute; transition: 0.4s; animation: theme-star-twinkle 2s infinite; }
        @keyframes theme-cloud-move { 0%,100% { transform: translateX(0px); } 40% { transform: translateX(4px); } 80% { transform: translateX(-4px); } }
        @keyframes theme-star-twinkle { 0%,100% { transform: scale(1); } 40% { transform: scale(1.2); } 80% { transform: scale(0.8); } }
        @keyframes theme-rotate { 0% { transform: translateX(26px) rotate(0); } 100% { transform: translateX(26px) rotate(360deg); } }
      `}</style>

      <input
        className="theme-switch-input"
        type="checkbox"
        checked={isDark}
        onChange={toggleTheme}
        id="theme-toggle"
      />
      <label htmlFor="theme-toggle" style={{ display: "block", position: "absolute", inset: 0, cursor: "pointer" }}>
        <div
          className="theme-slider"
          style={{ background: isDark ? "#000" : "#2196f3" }}
        >
          <div
            className="theme-sun-moon"
            style={{
              background: isDark ? "white" : "yellow",
              transform: isDark ? "translateX(20px)" : "translateX(0)",
              animation: isDark ? "theme-rotate 0.6s ease-in-out" : "none",
            }}
          >
            {/* Moon dots */}
            {[
              { left: "10px", top: "3px", w: "6px" },
              { left: "2px", top: "10px", w: "10px" },
              { left: "16px", top: "18px", w: "3px" },
            ].map((d, i) => (
              <svg key={i} viewBox="0 0 100 100" className="theme-moon-dot"
                style={{ position: "absolute", left: d.left, top: d.top, width: d.w, height: d.w, opacity: isDark ? 1 : 0, fill: "gray" }}>
                <circle cx="50" cy="50" r="50" />
              </svg>
            ))}
            {/* Light rays */}
            {[
              { left: "-8px", top: "-8px", w: "43px" },
              { left: "-50%", top: "-50%", w: "55px" },
              { left: "-18px", top: "-18px", w: "60px" },
            ].map((r, i) => (
              <svg key={i} viewBox="0 0 100 100"
                style={{ position: "absolute", left: r.left, top: r.top, width: r.w, height: r.w, zIndex: -1, fill: "white", opacity: "10%" }}>
                <circle cx="50" cy="50" r="50" />
              </svg>
            ))}
            {/* Clouds */}
            {[
              { left: "30px", top: "15px", w: "40px", dark: true },
              { left: "44px", top: "10px", w: "20px", dark: true },
              { left: "18px", top: "24px", w: "30px", dark: true },
              { left: "36px", top: "18px", w: "40px", dark: false },
              { left: "48px", top: "14px", w: "20px", dark: false },
              { left: "22px", top: "26px", w: "30px", dark: false },
            ].map((c, i) => (
              <svg key={i} viewBox="0 0 100 100"
                className={c.dark ? "theme-cloud-dark" : "theme-cloud-light"}
                style={{ position: "absolute", left: c.left, top: c.top, width: c.w, height: c.w }}>
                <circle cx="50" cy="50" r="50" />
              </svg>
            ))}
          </div>

          {/* Stars */}
          <div className="theme-stars" style={{ transform: isDark ? "translateY(0)" : "translateY(-32px)", opacity: isDark ? 1 : 0 }}>
            {[
              { w: "20px", top: "2px", left: "3px", delay: "0.3s" },
              { w: "6px", top: "16px", left: "3px", delay: "0s" },
              { w: "12px", top: "20px", left: "10px", delay: "0.6s" },
              { w: "18px", top: "0px", left: "18px", delay: "1.3s" },
            ].map((s, i) => (
              <svg key={i} viewBox="0 0 20 20" className="theme-star"
                style={{ position: "absolute", width: s.w, height: s.w, top: s.top, left: s.left, animationDelay: s.delay }}>
                <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
              </svg>
            ))}
          </div>
        </div>
      </label>
    </div>
  );
};

export default ThemeToggle;