import React, { useState, useRef } from "react";
import "./App.css";

function SteamRankKorea() {
  const [date, setDate] = useState("2025-11-26");
  const [rankings, setRankings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  const itemRefs = useRef({});

  // API 호출
  const fetchRankings = async () => {
    try {
      const response = await fetch(
        `https://steamrank-backend.onrender.com/api/rankings?date=${date}`
      );
      const data = await response.json();
      setRankings(data);
    } catch (error) {
      console.error("Error fetching rankings:", error);
    }
  };

  // 검색 자동완성 처리
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredSuggestions([]);
      return;
    }

    const suggestions = rankings.filter((game) =>
      game.name.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredSuggestions(suggestions.slice(0, 5));
  };

  // 자동 스크롤 함수
  const scrollToGame = (appid) => {
    const element = itemRefs.current[appid];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="page-container">
      <div className="content-wrap">

        {/* 헤더 */}
        <h1 className="header">🎮 SteamRank Korea</h1>

        {/* 날짜 + 조회 버튼 */}
        <div className="top-controls">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button onClick={fetchRankings}>조회</button>
        </div>

        {/* 검색창 */}
        <div style={{ marginTop: "15px", position: "relative", textAlign: "center" }}>
          <input
            type="text"
            placeholder="게임 검색..."
            value={searchQuery}
            onChange={handleSearch}
            style={{
              width: "300px",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
            }}
          />

          {/* 자동완성 박스 */}
          {filteredSuggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "45px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "300px",
                backgroundColor: "#2a2a2a",
                borderRadius: "8px",
                overflow: "hidden",
                zIndex: 10,
              }}
            >
              {filteredSuggestions.map((game) => (
                <div
                  key={game.steam_appid}
                  onClick={() => scrollToGame(game.steam_appid)}
                  style={{
                    padding: "10px",
                    cursor: "pointer",
                    borderBottom: "1px solid #444",
                    color: "white",
                    textAlign: "left",
                  }}
                >
                  {game.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 날짜 타이틀 */}
        <div className="date-title">📈 {date} 한국 게임 동접자 랭킹</div>

        {/* 게임 목록 */}
        <div className="game-list">
          {rankings.map((game, index) => (
            <div
              key={game.steam_appid}
              className="game-card"
              ref={(el) => (itemRefs.current[game.steam_appid] = el)}
              onClick={() =>
                window.open(
                  `https://store.steampowered.com/app/${game.steam_appid}`,
                  "_blank"
                )
              }
              style={{ cursor: "pointer" }}
            >
              <div className="rank-number">#{index + 1}</div>

              <img className="thumb" src={game.profile_img} alt={game.name} />

              <div className="game-info">
                <div className="game-title">{game.name}</div>

                <div className="game-sub">
                  {game.price === "무료" ||
                  game.price?.toLowerCase() === "free" ||
                  game.price === "$free"
                    ? "무료 플레이"
                    : game.price || "가격 정보 없음"}
                </div>

                <div className="game-sub">현재 동접자: {game.players}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        이 사이트는 비영리 캡스톤 디자인 과제 프로젝트이며, Valve Corporation과 관련이 없습니다.
      </div>
    </div>
  );
}

export default SteamRankKorea;
