import React, { useState } from "react";
import "./App.css";

const API_BASE = "https://steamrank-backend.onrender.com";


function SteamRankKorea() {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔎 자동완성 검색 (한국 게임 names)
  const handleSearch = async (value) => {
    setSearchText(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/search?q=${encodeURIComponent(value)}`
      );
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("검색 실패:", error);
    }
  };

  // 📅 날짜별 한국 게임 랭킹 조회
  const fetchRankings = async () => {
    if (!selectedDate) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/rankings?date=${selectedDate}`)
      const data = await res.json();
      setRankings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("랭킹 불러오기 실패:", error);
    }

    setLoading(false);
  };

  // 엔터 입력 시 랭킹 호출
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && selectedDate) {
      fetchRankings();
    }
  };

  const goToSteam = (steamAppId) => {
    if (!steamAppId) return;
    window.open(`https://store.steampowered.com/app/${steamAppId}`, "_blank");
  };

  return (
    <div className="app-container">
      <h1>🎮 SteamRank Korea</h1>

      {/* 🔎 검색 입력 */}
      <div className="search-box">
        <input
          type="text"
          placeholder="게임 검색..."
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
        />

        {searchResults.length > 0 && (
          <ul className="autocomplete-list">
            {searchResults.map((game, idx) => (
              <li
                key={idx}
                onClick={() => {
                  setSearchText(game);
                  setSearchResults([]);
                }}
              >
                {game}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 📅 날짜 선택 */}
      <div className="date-box">
        <input
          type="date"
          onKeyDown={handleKeyDown}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <button onClick={fetchRankings}>조회</button>
      </div>

      {/* 📊 결과 */}
      {loading && <p>⏳ 불러오는 중...</p>}

      {!loading && rankings.length > 0 && (
        <div className="rankings-container">
          <h2>📈 {selectedDate} 한국 게임 동접자 랭킹</h2>

          <ul className="rankings-list">
            {rankings.map((item) => (
              <li
                key={item.appid}
                className="ranking-item"
                onClick={() => goToSteam(item.steam_appid)}
              >
                <span className="rank">#{item.rank}</span>

                {item.profile_img && (
                  <img
                    src={item.profile_img}
                    alt={item.name}
                    className="thumbnail"
                  />
                )}

                <div className="info">
                  <div className="title">{item.name}</div>
                  <div className="sub">
                    <span className="price">
                      {item.price ? item.price : "가격 정보 없음"}
                    </span>
                  </div>
                </div>

                <span className="players">
                  현재 동접자:{" "}
                  {item.players !== null && item.players !== undefined
                    ? item.players.toLocaleString()
                    : 0}
                  명
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && selectedDate && rankings.length === 0 && (
        <p>⚠️ 해당 날짜의 한국 게임 랭킹 데이터가 없습니다.</p>
      )}
    </div>
  );
}

export default SteamRankKorea;
