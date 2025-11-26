// SteamRankKorea.jsx (FINAL FIXED FOR profile_img)
import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const API_URL = "https://steamrank-backend.onrender.com/api/rankings";

const formatPrice = (price) => {
  if (!price) return "가격 정보 없음";
  if (String(price).toLowerCase() === "free") return "무료 플레이";

  const num = parseFloat(price);
  if (!isNaN(num)) return `$${num}`;
  return price;
};

function SteamRankKorea() {
  const [date, setDate] = useState("");
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const itemRefs = useRef({});

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}?date=${date}`);
      const data = await response.json();
      setGames(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!search.trim()) return setFiltered([]);

    const res = games.filter((g) =>
      g.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(res.slice(0, 6));
  }, [search, games]);

  const scrollToGame = (appid) => {
    const el = itemRefs.current[appid];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="app-container">
      <h1 className="title">🎮 SteamRank Korea</h1>

      <div className="controls">
        <input
          type="date"
          className="date-input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button className="fetch-btn" onClick={fetchData}>
          조회
        </button>
      </div>

      <div className="search-wrapper">
        <input
          type="text"
          placeholder="게임 검색..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filtered.length > 0 && (
          <div className="autocomplete">
            {filtered.map((g) => (
              <div
                key={g.steam_appid}
                className="autocomplete-item"
                onClick={() => {
                  scrollToGame(g.steam_appid);
                  setSearch("");
                  setFiltered([]);
                }}
              >
                {g.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <h2 className="subtitle">📋 {date} 한국 게임 동접자 랭킹</h2>

      <div className="game-list">
        {games.map((game, idx) => {
          // 🔥 여기! API 구조에 맞춘 최종 이미지 필드
          const imgSrc =
            game.profile_img ||
            "https://via.placeholder.com/160x90?text=No+Image";

          return (
            <div
              key={game.steam_appid}
              ref={(el) => (itemRefs.current[game.steam_appid] = el)}
              className="game-item"
            >
              <div className="rank">#{idx + 1}</div>

              <img
                className="game-img"
                src={imgSrc}
                alt={game.name}
                onError={(e) =>
                  (e.target.src =
                    "https://via.placeholder.com/160x90?text=No+Image")
                }
              />

              <div className="game-info">
                <div className="game-title">
                  <a
                    href={`https://store.steampowered.com/app/${game.steam_appid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {game.name}
                  </a>
                </div>

                <div className="price">{formatPrice(game.price)}</div>
                <div className="players">
                  현재 동접자: {game.players.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="footer">
        이 사이트는 비영리 캡스톤 디자인 과제 프로젝트이며,<br />
        Valve Corporation과 관련이 없습니다.
      </footer>
    </div>
  );
}

export default SteamRankKorea;
