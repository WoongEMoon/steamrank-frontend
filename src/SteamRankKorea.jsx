import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const API_URL = "https://steamrank-backend.onrender.com/api/rankings";

// 가격 포맷 함수
const formatPrice = (price) => {
    if (!price) return "가격 정보 없음";
    if (price === "free") return "무료 플레이";

    // USD (10.99 형태)
    if (/^\d+\.\d{2}$/.test(price)) {
        return `$${price}`;
    }

    // 정수 가격 → 원화로 처리
    if (/^\d+$/.test(price)) {
        return `${Number(price).toLocaleString()}원`;
    }

    return price;
};

function SteamRankKorea() {
    const [date, setDate] = useState("");
    const [games, setGames] = useState([]);
    const [search, setSearch] = useState("");
    const [filtered, setFiltered] = useState([]);
    const itemRefs = useRef({});

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        setDate(today);
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(`${API_URL}?date=${date}`);
            const data = await response.json();
            setGames(data);
        } catch (error) {
            console.error("API error:", error);
        }
    };

    useEffect(() => {
        if (search.trim() === "") {
            setFiltered([]);
            return;
        }
        const result = games.filter((g) =>
            g.name.toLowerCase().includes(search.toLowerCase())
        );
        setFiltered(result.slice(0, 6));
    }, [search, games]);

    const scrollToGame = (appid) => {
        const element = itemRefs.current[appid];
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    return (
        <div className="app-container">
            <h1 className="title">
                🎮 <span>SteamRank Korea</span>
            </h1>

            <div className="controls">
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="date-input"
                />
                <button className="fetch-btn" onClick={fetchData}>
                    조회
                </button>
            </div>

            {/* 검색창 */}
            <div className="search-wrapper">
                <input
                    type="text"
                    placeholder="게임 검색..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />

                {filtered.length > 0 && (
                    <div className="autocomplete">
                        {filtered.map((g) => (
                            <div
                                key={g.appid}
                                className="autocomplete-item"
                                onClick={() => {
                                    scrollToGame(g.appid);
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

            <h2 className="subtitle">
                📋 {date} 한국 게임 동접자 랭킹
            </h2>

            <div className="game-list">
                {games.map((game, idx) => (
                    <div
                        key={game.appid}
                        ref={(el) => (itemRefs.current[game.appid] = el)}
                        className="game-item"
                    >
                        <div className="rank">#{idx + 1}</div>

                        <img
                            src={game.img}
                            alt={game.name}
                            className="game-img"
                            onError={(e) =>
                                (e.target.src =
                                    "https://via.placeholder.com/200x100?text=No+Image")
                            }
                        />

                        <div className="game-info">
                            <div className="game-title">
                                <a
                                    href={`https://store.steampowered.com/app/${game.appid}`}
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
                ))}
            </div>

            <footer className="footer">
                이 사이트는 비영리 캡스톤 디자인 과제 프로젝트이며,<br />
                Valve Corporation과 관련이 없습니다.
            </footer>
        </div>
    );
}

export default SteamRankKorea;
