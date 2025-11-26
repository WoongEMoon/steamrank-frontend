import React, { useState, useEffect } from "react";
import "./App.css";

function SteamRankKorea() {
  const [rankings, setRankings] = useState([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    fetchRankings(today);
  }, []);

  const fetchRankings = async (selectedDate) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://steamrank-backend.onrender.com/api/rankings?date=${selectedDate}`
      );
      const data = await res.json();
      setRankings(data);
    } catch (err) {
      console.error("불러오기 실패:", err);
      setRankings([]);
    }
    setLoading(false);
  };

  const handleSearchClick = () => {
    fetchRankings(date);
  };

  const openSteamPage = (appid) => {
    const url = `https://store.steampowered.com/app/${appid}/`;
    window.open(url, "_blank");
  };

  return (
    <div>
      <div className="header">
        <h1>🎮 SteamRank Korea</h1>
      </div>

      <div className="top-controls">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={handleSearchClick}>조회</button>
      </div>

      <div className="date-title">
        <span>📈</span> <span>{date} 한국 게임 동접자 랭킹</span>
      </div>

      {loading && <p style={{ textAlign: "center" }}>불러오는 중...</p>}

      <div className="game-list">
        {rankings.length === 0 && !loading && (
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            데이터를 찾을 수 없습니다.
          </p>
        )}

        {rankings.map((game, index) => (
          <div
            key={game.steam_appid}
            className="game-card"
            onClick={() => openSteamPage(game.steam_appid)}
            style={{ cursor: "pointer" }}   // 클릭 가능한 느낌
          >
            <div className="rank-number">#{index + 1}</div>

            <img
              src={game.profile_img}
              alt={game.name}
              className="thumb"
            />

            <div className="game-info">
              <div className="game-title">{game.name}</div>
              <div className="game-sub">{game.price || "가격 정보 없음"}</div>
              <div className="game-sub">현재 동접자: {game.players}</div>
            </div>

            <div className="right-label">동접자 수 기준 랭킹</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SteamRankKorea;
