import React, { useState, useEffect, useRef } from "react";

function SteamRankKorea() {
  const [date, setDate] = useState("2025-11-26");
  const [rankings, setRankings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  const itemRefs = useRef({});

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

  const scrollToGame = (appid) => {
    const element = itemRefs.current[appid];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredSuggestions([]);
      return;
    }

    const suggestions = rankings.filter((game) =>
      game.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSuggestions(suggestions.slice(0, 5));
  };

  return (
    <div style={{ padding: "20px", color: "white", textAlign: "center" }}>
      <h1 style={{ fontSize: "48px" }}>
        🎮 <span style={{ color: "#ffffff" }}>SteamRank Korea</span>
      </h1>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{ padding: "10px", marginRight: "10px" }}
      />
      <button onClick={fetchRankings} style={{ padding: "10px 20px" }}>
        조회
      </button>

      {/* 검색창 */}
      <div style={{ marginTop: "15px", position: "relative" }}>
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
                }}
              >
                {game.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <h2 style={{ marginTop: "30px", fontSize: "24px" }}>
        📈 {date} 한국 게임 동접자 랭킹
      </h2>

      <div style={{ marginTop: "20px" }}>
        {rankings.map((game, index) => (
          <div
            ref={(el) => (itemRefs.current[game.steam_appid] = el)}
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#1e1e1e",
              padding: "20px",
              marginBottom: "20px",
              borderRadius: "12px",
              width: "900px",
              margin: "0 auto 20px",
              cursor: "pointer",
            }}
            onClick={() =>
              window.open(
                `https://store.steampowered.com/app/${game.steam_appid}`,
                "_blank"
              )
            }
          >
            <span style={{ fontSize: "32px", width: "60px" }}>#{index + 1}</span>

            <img
              src={game.profile_img}
              alt={game.name}
              style={{
                width: "200px",
                height: "110px",
                objectFit: "cover",
                borderRadius: "8px",
                marginRight: "20px",
              }}
            />

            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "22px", fontWeight: "bold" }}>
                {game.name}
              </div>

              <div style={{ marginTop: "5px", color: "#bbb" }}>
                {game.price === "무료" || game.price === "Free" || game.price === "$free"
                  ? "무료 플레이"
                  : game.price
                  ? game.price
                  : "가격 정보 없음"}
              </div>

              <div style={{ marginTop: "5px", color: "#bbb" }}>
                현재 동접자: {game.players}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: "50px", color: "#666" }}>
        이 사이트는 비영리 캡스톤 디자인 과제 프로젝트이며, Valve Corporation과 관련이 없습니다.
      </p>
    </div>
  );
}

export default SteamRankKorea;
