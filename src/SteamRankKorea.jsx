import React, { useState } from "react";
import "./App.css";

const API_BASE = "https://steamrank-backend.onrender.com";

function SteamRankKorea() {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔎 자동완성 검색
  const handleSearch = async (value) => {
    setSearchText(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(value)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("검색 실패:", error);
    }
  };

  // 📅 날짜별 랭킹 조회
  const fetchRankings = async () => {
    if (!selectedDate) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/rank?date=${selectedDate}`);
      const data = await res.json();

      // FastAPI는 배열을 반환하므로 data 그대로 사용
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

        {/* 검색 자동완성 리스트 */}
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
        <button onClick={fetchRankings}>불러오기</button>
      </div>

      {/* 📊 결과 */}
      {loading && <p>⏳ 불러오는 중...</p>}

      {!loading && rankings.length > 0 && (
        <div className="rankings-container">
          <h2>📈 {selectedDate} 랭킹</h2>

          <ul className="rankings-list">
            {rankings.map((item, idx) => (
              <li key={idx} className="ranking-item">
                <span className="rank">#{item.rank}</span>
                <span className="name">{item.name}</span>
                <span className="players">
                  {item.concurrent_players.toLocaleString()}명
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && selectedDate && rankings.length === 0 && (
        <p>⚠️ 해당 날짜의 랭킹 데이터가 없습니다.</p>
      )}
    </div>
  );
}

export default SteamRankKorea;
