import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const API_BASE = "https://steamrank-backend.onrender.com";

function SteamRankKorea() {
  const [selectedDate, setSelectedDate] = useState("");
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔍 자동검색용
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const listRef = useRef(null);

  // 📅 날짜별 랭킹 불러오기
  const fetchRankings = async () => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/rankings?date=${selectedDate}`);
      const data = await res.json();
      const cleanData = Array.isArray(data) ? data : [];

      setRankings(cleanData);

      // 날짜 설정 후 자동검색 결과 초기화
      setSearchResults([]);
    } catch (error) {
      console.error("랭킹 불러오기 실패:", error);
    }
    setLoading(false);
  };

  // 🔍 검색 로직
  useEffect(() => {
    if (!searchText.trim() || rankings.length === 0) {
      setSearchResults([]);
      return;
    }

    const q = searchText.toLowerCase();

    const filtered = rankings.filter((g) =>
      g.name.toLowerCase().includes(q)
    );

    setSearchResults(filtered.slice(0, 8)); // 자동완성 최대 8개
  }, [searchText, rankings]);

  // 검색 항목 클릭 → 해당 아이템으로 스크롤 이동
  const scrollToGame = (appid) => {
    if (!listRef.current) return;

    const target = document.getElementById(`game-${appid}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      setSearchResults([]);
      setSearchText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && selectedDate) fetchRankings();
  };

  const goToSteam = (steamAppId) => {
    if (!steamAppId) return;
    window.open(`https://store.steampowered.com/app/${steamAppId}`, "_blank");
  };

  return (
    <div className="container">

      <h1 className="title">🎮 SteamRank Korea</h1>

      {/* 🔍 검색 박스 */}
      <div className="search-box">
        <input
          type="text"
          placeholder="게임 검색..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        {/* 자동 완성 박스 */}
        {searchResults.length > 0 && (
          <ul className="autocomplete-box">
            {searchResults.map((item) => (
              <li key={item.appid} onClick={() => scrollToGame(item.appid)}>
                {item.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 날짜 박스 */}
      <div className="date-box">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={fetchRankings}>조회</button>
      </div>

      {/* 로딩 */}
      {loading && <p>⏳ 불러오는 중...</p>}

      {/* 랭킹 */}
      {!loading && rankings.length > 0 && (
        <div ref={listRef} className="rankings-container">
          <h2>📈 {selectedDate} 한국 게임 동접자 랭킹</h2>

          <ul className="rankings-list">
            {rankings.map((item, index) => (
              <li
                key={item.appid}
                id={`game-${item.appid}`}
                className="ranking-item"
                onClick={() => goToSteam(item.steam_appid)}
              >
                <span className="rank">#{index + 1}</span>

                {item.profile_img && (
                  <img
                    src={item.profile_img}
                    alt={item.name}
                    className="thumbnail"
                  />
                )}

                <div className="info">
                  <div className="title">{item.name}</div>
                  <div className="sub">{item.price || "가격 정보 없음"}</div>
                </div>

                <span className="players">
                  현재 동접자:{" "}
                  {item.players ? item.players.toLocaleString() : 0}명
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 데이터 없음 */}
      {!loading && selectedDate && rankings.length === 0 && (
        <p>⚠️ 해당 날짜의 한국 게임 랭킹 데이터가 없습니다.</p>
      )}
    </div>
  );
}

export default SteamRankKorea;
