import psycopg2
import requests
import json
import time

DB = {
    "host": "dpg-d4i86fkhg0os73fi4keg-a",
    "dbname": "steamrank_db",
    "user": "steamrank_db_user",
    "password": "xkUGR7Y35UidHw6HooptU41A0GXXg1Jh",
    "port": 5432,
    "sslmode": "require",
}


def get_db_connection():
    return psycopg2.connect(
        host=DB["host"],
        dbname=DB["dbname"],
        user=DB["user"],
        password=DB["password"],
        port=DB["port"],
        sslmode=DB["sslmode"],
    )


# ===============================
#      강화된 appdetails API
# ===============================
def fetch_appdetails(appid: str):
    url = f"https://store.steampowered.com/api/appdetails?appids={appid}"

    try:
        resp = requests.get(url, timeout=6)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"✖ API 요청 실패 ({appid}): {e}")
        return None

    entry = data.get(str(appid))
    if not isinstance(entry, dict):
        print(f"✖ API entry 이상 ({appid}): {entry}")
        return None

    if not entry.get("success", False):
        print(f"✖ appdetails success=False ({appid})")
        return None

    game = entry.get("data")
    if not isinstance(game, dict):
        print(f"✖ data 필드 없음 ({appid}) → {game}")
        return None

    # 썸네일 이미지
    profile_img = game.get("header_image")

    # 🔥 가격 처리
    price_str = None
    price_info = game.get("price_overview")
    is_free = game.get("is_free", False)

    if is_free:
        # 무료 플레이
        price_str = "free"
    elif isinstance(price_info, dict):
        currency = price_info.get("currency")
        final = price_info.get("final")  # 예: USD 10.99 -> 1099

        if final is not None:
            # 달러인 경우 소수점 둘째 자리까지 나누기
            if currency == "USD":
                price_str = f"{final / 100:.2f}"  # "10.99" 형태
            else:
                # 원화/엔화 등은 소수점 없이 사용 (나중에 KRW 포맷에 쓰자)
                price_str = str(final)
    # price_str 가 None 이면 "가격 정보 없음" 으로 처리

    return profile_img, price_str


# ===============================
#        DB UPDATE
# ===============================
def update_game_in_db(conn, appid: str, name: str, details):
    profile_img, price = details

    with conn.cursor() as cur:
        cur.execute(
            """
            UPDATE games
               SET steam_appid = %s,
                   profile_img = %s,
                   price       = %s
             WHERE steam_appid = %s OR name = %s
            """,
            (appid, profile_img, price, appid, name),
        )

        if cur.rowcount == 0:
            print(f"⚠ DB에 매칭되는 행 없음 → appid={appid}, name={name}")


# ===============================
#       파일 전체 처리
# ===============================
def process_file(file_path: str):

    print(f"▶ 파일 로딩: {file_path}")
    conn = get_db_connection()

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            for raw in f:
                line = raw.strip()
                if not line:
                    continue

                try:
                    appid, name = line.split("\t", 1)
                except ValueError:
                    print(f"✖ 형식 잘못됨, 건너뜀 → {line}")
                    continue

                appid = appid.strip()
                name = name.strip()

                print(f"\n▶ 처리 중: {appid}   {name}")

                # API 호출
                details = fetch_appdetails(appid)
                if not details:
                    print(f"✖ 처리 실패: {appid} {name} (API에서 데이터 없음)")
                    continue

                # DB 업데이트
                try:
                    update_game_in_db(conn, appid, name, details)
                    conn.commit()
                    print(f"✔ 완료: {name}")
                except Exception as e:
                    conn.rollback()
                    print(f"✖ DB 오류 발생, 건너뜀 ({appid} {name}): {e}")

    finally:
        conn.close()


if __name__ == "__main__":
    process_file("games.txt")
