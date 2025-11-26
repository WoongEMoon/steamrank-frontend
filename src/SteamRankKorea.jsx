import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function SteamRankKorea() {
    const [date, setDate] = useState("");
    const [games, setGames] = useState([]);
    const [search, setSearch] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    const gameRefs = useRef({});
    // { steam_appid: DOM Element }

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        setDate(today);
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(
                `https://steamrank-backend.onrender.com/api/rankings?date=${date}`
            );

            if (!response.ok) {
                setGames([]);
                return;
            }

            const result = await response.json();
            setGames(result);
        } catch (error) {
            setGames([]);
        }
    };

    const handleSearchChange = (value) => {
        setSearch(value);

        if (!value.trim()) {
            setSuggestions([]);
            return;
        }

        const filtered = games
            .filter((g) =>
                g.name.toLowerCase().includes(value.toLowerCase())
            )
            .slice(0, 8); // 자동완성 최대 8개

        setSuggestions(filtered);
    };

    const handleSuggestionClick = (appId) => {
        setSearch("");
        setSuggestions([]);

        const element = gameRefs.current[appId];
        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    };

    return (
        <div className="container">
            <h1 className="title">
                🎮 SteamRank Korea
            </h1>

            <div className="input-row">
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="date-input"
                />
                <button className="btn" onClick={fetchData}>
                    조회
                </button>
            </div>

            {/* 🔍 검색창 */}
            <div className="search-box">
                <input
                    type="text"
                    className="search-input"
                    placeholder="게임 검색..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />

                {suggestions.length > 0 && (
                    <div className="autocomplete-box">
                        {suggestions.map((game) => (
                            <div
                                key={game.steam_appid}
                                className="autocomplete-item"
                                onClick={() =>
                                    handleSuggestionClick(game.steam_appid)
                                }
                            >
                                {game.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <h2 className="ranking-title">📈 {date} 한국 게임 동접자 랭킹</h2>

            <div className="game-list">
                {games.length === 0 && (
                    <p className="no-data">데이터를 찾을 수 없습니다.</p>
                )}

                {games.map((game, idx) => (
                    <div
                        className="game-card"
                        key={game.steam_appid}
                        ref={(el) => (gameRefs.current[game.steam_appid] = el)}
                    >
                        <div className="rank">#{idx + 1}</div>

                        <img
                            src={game.profile_img}
                            alt={game.name}
                            className="game-img"
                        />

                        <div className="game-info">
                            <h3 className="game-name">{game.name}</h3>
                            <p className="price">
                                {game.price === null
                                    ? "가격 정보 없음"
                                    : game.price === 0
                                    ? "무료 플레이"
                                    : `$${game.price}`}
                            </p>
                            <p className="players">
                                현재 동접자: {game.players}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <p className="footer">
                이 사이트는 비영리 캡스톤 디자인 과제 프로젝트이며,<br />
                Valve Corporation과 관련이 없습니다.
            </p>
        </div>
    );
}

export default SteamRankKorea;
