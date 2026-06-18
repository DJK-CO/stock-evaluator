# Python Backend: Stock and ETF Automated Analyzer using yfinance
import sys
import json
import os
import yfinance as yf
import time

# Memory Cache for API performance optimization (TTL: 10 minutes)
_CACHE_DATA = None
_CACHE_TIME = 0
_CACHE_TTL = 600


# Preset mappings for fallbacks or base data
TICKERS = {
    "2330.TW": {"currency": "TWD", "isETF": False},
    "0050.TW": {"currency": "TWD", "isETF": True, "etfType": "市值型", "etfDesc": "追蹤台灣前50大市值企業，大盤估值領頭羊。"},
    "006208.TW": {"currency": "TWD", "isETF": True, "etfType": "市值型", "etfDesc": "小資族定期定額首選，低內扣費用，追蹤台灣前50大市值企業。"},
    "00878.TW": {"currency": "TWD", "isETF": True, "etfType": "高股息", "etfDesc": "結合ESG與高股息篩選，配息穩定度高。"},
    "00919.TW": {"currency": "TWD", "isETF": True, "etfType": "高股息", "etfDesc": "社團人氣配息王，精選高股息率成分股，配息爆發力強。"},
    "00929.TW": {"currency": "TWD", "isETF": True, "etfType": "高股息", "etfDesc": "首檔月配息科技高股息，社團「每月被動收入」討論度極高。"},
    "00713.TW": {"currency": "TWD", "isETF": True, "etfType": "高股息", "etfDesc": "元大台灣高息低波，季配息，兼具高股利與極佳的抗震波動控制特性。"},
    "00940.TW": {"currency": "TWD", "isETF": True, "etfType": "高股息", "etfDesc": "元大台灣價值高息，月配息熱門話題標的，巴菲特價值因子選股。"},
    "AAPL": {"currency": "USD", "isETF": False},
    "NVDA": {"currency": "USD", "isETF": False},
    "AVGO": {"currency": "USD", "isETF": False},
    "TSLA": {"currency": "USD", "isETF": False},
    "MSFT": {"currency": "USD", "isETF": False, "isHot": True, "hotReason": "微軟公司 (MSFT) 是 6 月（以及當前）最熱門的 AI 領頭羊，Copilot 與雲端 Azure 成長強勁。"},
    "AMD": {"currency": "USD", "isETF": False, "isHot": True, "hotReason": "超微半導體 (AMD) 發表 MI325X/MI350 系列 AI 晶片，MI300X 銷量超預期，為輝達最強 AI 晶片挑戰者。"},
    "GOOGL": {"currency": "USD", "isETF": False, "isHot": True, "hotReason": "谷歌 (GOOGL) 推出 I/O 2026 大會最新 Gemini 1.5 系列 AI 搜尋，雲端與廣告業務在 AI 賦能下強勢增長。"},
    "TSM": {"currency": "USD", "isETF": False, "isHot": True, "hotReason": "台積電美股 ADR，受 AI 晶片代工暴增拉動，相較台股具備高溢價，為台美社團套利與追蹤焦點。"},
    "SMCI": {"currency": "USD", "isETF": False, "isHot": True, "hotReason": "AI 伺服器液冷架構巨頭，2024-2026年社團頭號 AI 飆股與散熱概念股，波動極大。"},
    "VOO": {"currency": "USD", "isETF": True, "etfType": "市值型", "etfDesc": "Vanguard S&P 500 ETF，最經典的美股標普500大盤代表，長期複利穩健。"},
    "QQQ": {"currency": "USD", "isETF": True, "etfType": "市值型", "etfDesc": "Invesco QQQ，追蹤Nasdaq 100指數，美股科技龍頭大本營，長期成長動能強。"},
    "SCHD": {"currency": "USD", "isETF": True, "etfType": "高股息", "etfDesc": "Schwab US Dividend Equity ETF，美股最熱門高息增長 ETF，防禦與存股首選。"},
    "0052.TW": {"currency": "TWD", "isETF": True, "etfType": "科技型", "etfDesc": "富邦台灣科技 ETF，追蹤台灣科技板塊，台股科技巨頭與半導體比例高。", "isHot": True, "hotReason": "富邦科技 (0052.TW) 為台股成分股純度最高的科技/半導體 ETF，台積電佔比高達 60% 以上，為社團中熱門度僅次於 0050 的『台股科技大盤』代表。"},
    "2327.TW": {"currency": "TWD", "isETF": False, "isHot": True, "hotReason": "國巨 (2327.TW) 為被動元件全球龍頭。受益於 AI 伺服器與高階車用電容 (MLCC) 需求爆發，其高階被動元件市佔率領先，是 2026 被動元件板塊最具話題性的熱門股。"},
    "2492.TW": {"currency": "TWD", "isETF": False, "isHot": True, "hotReason": "華新科 (2492.TW) 為台灣第二大被動元件廠。受益於終端消費電子復甦與 AI 手機/PC 換代拉動的 MLCC/電阻需求，為社團中低價位被動元件投資焦點。"},
    "2344.TW": {"currency": "TWD", "isETF": False, "isHot": True, "hotReason": "華邦電 (2344.TW) 為記憶體與主動元件大廠。Nor Flash 與 Specialty DRAM 受惠於 AI 邊緣運算設備大增，產能滿載，為 2026 記憶體循環復甦的主要主動元件代表。"},
    "3481.TW": {"currency": "TWD", "isETF": False, "isHot": True, "hotReason": "群創 (3481.TW) 因積極轉型半導體扇出型面板級封裝 (FOPLP)，切入 AI 晶片先進封裝市場，股價受先進封裝產能供不應求拉動，成為社團人氣最高的面板與半導體轉型飆股。"},
    "2409.TW": {"currency": "TWD", "isETF": False, "isHot": True, "hotReason": "友達 (2409.TW) 為面板巨頭，除面板報價回溫外，積極跨足 Micro LED 與高階車用智慧座艙解決方案，Micro LED 先進顯示技術量產進度領先，是社團討論車用與新顯示技術的首選。"}
}

MOCK_FALLBACKS = {
    "2330.TW": {
        "price": 920.0, "eps": 45.0, "bps": 180.0, "dividend": 20.0, "fcf": 480000.0, "shares": 25930.0,
        "growth1": 18, "growth2": 12, "terminal": 2.0, "discount": 8.5, "safety": 15, "pe": 25, "pb": 5.8, "rule40Growth": 22, "rule40FCFMargin": 38
    },
    "0050.TW": {
        "price": 185.0, "eps": 9.00, "bps": 80.00, "dividend": 6.50, "fcf": 0.0, "shares": 1.0,
        "growth1": 6, "growth2": 4, "terminal": 1.5, "discount": 7.0, "safety": 10, "pe": 21.8, "pb": 2.4, "rule40Growth": 12, "rule40FCFMargin": 0
    },
    "006208.TW": {
        "price": 108.0, "eps": 5.60, "bps": 48.00, "dividend": 4.20, "fcf": 0.0, "shares": 1.0,
        "growth1": 6, "growth2": 4, "terminal": 1.5, "discount": 7.0, "safety": 10, "pe": 21.0, "pb": 2.40, "rule40Growth": 12, "rule40FCFMargin": 0
    },
    "00878.TW": {
        "price": 23.5, "eps": 1.70, "bps": 18.00, "dividend": 1.80, "fcf": 0.0, "shares": 1.0,
        "growth1": 4, "growth2": 3, "terminal": 1.0, "discount": 6.5, "safety": 10, "pe": 15.6, "pb": 1.47, "rule40Growth": 8, "rule40FCFMargin": 0
    },
    "00919.TW": {
        "price": 25.0, "eps": 2.00, "bps": 17.00, "dividend": 2.88, "fcf": 0.0, "shares": 1.0,
        "growth1": 4, "growth2": 3, "terminal": 1.0, "discount": 6.5, "safety": 10, "pe": 14.0, "pb": 1.56, "rule40Growth": 8, "rule40FCFMargin": 0
    },
    "00929.TW": {
        "price": 20.0, "eps": 1.60, "bps": 16.00, "dividend": 2.20, "fcf": 0.0, "shares": 1.0,
        "growth1": 5, "growth2": 4, "terminal": 1.2, "discount": 6.8, "safety": 10, "pe": 14.5, "pb": 1.33, "rule40Growth": 10, "rule40FCFMargin": 0
    },
    "AAPL": {
        "price": 214.3, "eps": 7.20, "bps": 6.00, "dividend": 1.04, "fcf": 104000.0, "shares": 15280.0,
        "growth1": 8, "growth2": 6, "terminal": 2.0, "discount": 7.5, "safety": 15, "pe": 30, "pb": 44.0, "rule40Growth": 6, "rule40FCFMargin": 26
    },
    "NVDA": {
        "price": 127.4, "eps": 3.80, "bps": 14.00, "dividend": 0.04, "fcf": 27000.0, "shares": 24500.0,
        "growth1": 30, "growth2": 15, "terminal": 2.5, "discount": 9.0, "safety": 20, "pe": 45, "pb": 15.0, "rule40Growth": 90, "rule40FCFMargin": 45
    },
    "AVGO": {
        "price": 175.0, "eps": 5.50, "bps": 28.00, "dividend": 2.12, "fcf": 18500.0, "shares": 465.0,
        "growth1": 25, "growth2": 12, "terminal": 2.0, "discount": 8.5, "safety": 15, "pe": 33.0, "pb": 7.1, "rule40Growth": 45, "rule40FCFMargin": 42
    },
    "MSFT": {
        "price": 420.0, "eps": 12.50, "bps": 40.00, "dividend": 3.00, "fcf": 70000.0, "shares": 7430.0,
        "growth1": 15, "growth2": 10, "terminal": 2.0, "discount": 8.0, "safety": 15, "pe": 35, "pb": 12.0, "rule40Growth": 15, "rule40FCFMargin": 30
    },
    "TSLA": {
        "price": 184.8, "eps": 2.60, "bps": 22.00, "dividend": 0.00, "fcf": 4400.0, "shares": 3180.0,
        "growth1": 20, "growth2": 12, "terminal": 2.0, "discount": 10.0, "safety": 25, "pe": 65, "pb": 8.5, "rule40Growth": 15, "rule40FCFMargin": 10
    },
    "AMD": {
        "price": 160.0, "eps": 2.20, "bps": 38.00, "dividend": 0.00, "fcf": 1200.0, "shares": 1610.0,
        "growth1": 22, "growth2": 12, "terminal": 2.0, "discount": 9.5, "safety": 20, "pe": 75.0, "pb": 4.4, "rule40Growth": 15, "rule40FCFMargin": 10
    },
    "GOOGL": {
        "price": 175.0, "eps": 7.50, "bps": 26.00, "dividend": 0.80, "fcf": 69000.0, "shares": 12400.0,
        "growth1": 15, "growth2": 10, "terminal": 2.0, "discount": 8.0, "safety": 15, "pe": 24.0, "pb": 7.29, "rule40Growth": 14, "rule40FCFMargin": 28
    },
    "TSM": {
        "price": 180.0, "eps": 6.80, "bps": 28.00, "dividend": 1.80, "fcf": 15000.0, "shares": 5180.0,
        "growth1": 18, "growth2": 12, "terminal": 2.0, "discount": 8.5, "safety": 15, "pe": 28.0, "pb": 6.8, "rule40Growth": 22, "rule40FCFMargin": 38
    },
    "SMCI": {
        "price": 850.0, "eps": 24.00, "bps": 90.00, "dividend": 0.00, "fcf": 1200.0, "shares": 58.0,
        "growth1": 45, "growth2": 20, "terminal": 2.0, "discount": 10.5, "safety": 30, "pe": 35.0, "pb": 8.5, "rule40Growth": 80, "rule40FCFMargin": 10
    },
    "00713.TW": {
        "price": 58.0, "eps": 3.80, "bps": 26.00, "dividend": 3.80, "fcf": 0.0, "shares": 1.0,
        "growth1": 5, "growth2": 4, "terminal": 1.2, "discount": 6.5, "safety": 10, "pe": 16.5, "pb": 2.3, "rule40Growth": 10, "rule40FCFMargin": 0
    },
    "00940.TW": {
        "price": 10.2, "eps": 0.70, "bps": 10.00, "dividend": 0.80, "fcf": 0.0, "shares": 1.0,
        "growth1": 4, "growth2": 3, "terminal": 1.0, "discount": 6.5, "safety": 10, "pe": 15.0, "pb": 1.0, "rule40Growth": 8, "rule40FCFMargin": 0
    },
    "VOO": {
        "price": 500.0, "eps": 19.00, "bps": 115.00, "dividend": 6.80, "fcf": 0.0, "shares": 1.0,
        "growth1": 7, "growth2": 5, "terminal": 1.8, "discount": 7.0, "safety": 10, "pe": 25.0, "pb": 4.5, "rule40Growth": 14, "rule40FCFMargin": 0
    },
    "QQQ": {
        "price": 460.0, "eps": 16.00, "bps": 70.00, "dividend": 3.00, "fcf": 0.0, "shares": 1.0,
        "growth1": 12, "growth2": 8, "terminal": 2.0, "discount": 7.5, "safety": 10, "pe": 30.0, "pb": 7.0, "rule40Growth": 18, "rule40FCFMargin": 0
    },
    "SCHD": {
        "price": 82.0, "eps": 4.30, "bps": 34.00, "dividend": 2.90, "fcf": 0.0, "shares": 1.0,
        "growth1": 5, "growth2": 4, "terminal": 1.2, "discount": 6.5, "safety": 10, "pe": 16.5, "pb": 2.5, "rule40Growth": 10, "rule40FCFMargin": 0
    },
    "0052.TW": {
        "price": 205.0, "eps": 12.00, "bps": 90.00, "dividend": 4.50, "fcf": 0.0, "shares": 1.0,
        "growth1": 12, "growth2": 8, "terminal": 1.8, "discount": 7.0, "safety": 10, "pe": 18.0, "pb": 2.20, "rule40Growth": 15, "rule40FCFMargin": 0
    },
    "2327.TW": {
        "price": 650.0, "eps": 48.00, "bps": 290.00, "dividend": 20.00, "fcf": 12000.0, "shares": 418.0,
        "growth1": 15, "growth2": 10, "terminal": 2.0, "discount": 8.5, "safety": 15, "pe": 13.5, "pb": 2.20, "rule40Growth": 18, "rule40FCFMargin": 22
    },
    "2492.TW": {
        "price": 98.0, "eps": 5.20, "bps": 76.00, "dividend": 3.00, "fcf": 1800.0, "shares": 485.0,
        "growth1": 10, "growth2": 6, "terminal": 1.5, "discount": 7.5, "safety": 10, "pe": 18.8, "pb": 1.30, "rule40Growth": 12, "rule40FCFMargin": 15
    },
    "2344.TW": {
        "price": 24.5, "eps": 1.50, "bps": 21.00, "dividend": 0.80, "fcf": 4500.0, "shares": 3980.0,
        "growth1": 8, "growth2": 5, "terminal": 1.5, "discount": 7.5, "safety": 10, "pe": 16.3, "pb": 1.20, "rule40Growth": 8, "rule40FCFMargin": 12
    },
    "3481.TW": {
        "price": 14.5, "eps": 0.80, "bps": 24.00, "dividend": 0.50, "fcf": -2000.0, "shares": 9560.0,
        "growth1": 6, "growth2": 4, "terminal": 1.0, "discount": 7.0, "safety": 10, "pe": 18.1, "pb": 0.60, "rule40Growth": 6, "rule40FCFMargin": -5
    },
    "2409.TW": {
        "price": 16.5, "eps": 0.60, "bps": 22.00, "dividend": 0.50, "fcf": -1500.0, "shares": 7690.0,
        "growth1": 6, "growth2": 4, "terminal": 1.0, "discount": 7.0, "safety": 10, "pe": 27.5, "pb": 0.75, "rule40Growth": 6, "rule40FCFMargin": -4
    }
}

def fetch_realtime_data(force=False):
    global _CACHE_DATA, _CACHE_TIME
    
    current_time = time.time()
    if not force and _CACHE_DATA and (current_time - _CACHE_TIME < _CACHE_TTL):
        print(f"[Cache Hit!] 從記憶體快取讀取即時數據 (剩餘有效時間: {int(_CACHE_TTL - (current_time - _CACHE_TIME))} 秒)")
        return _CACHE_DATA
        
    results = {}
    if force:
        print("強制繞過快取，重新從 Yahoo Finance 抓取數據...")
    else:
        print("快取過期或未建立，開始從 Yahoo Finance 抓取即時數據...")

    
    for symbol, meta in TICKERS.items():
        print(f"正在更新: {symbol} ...")
        fallback = MOCK_FALLBACKS[symbol]
        try:
            ticker = yf.Ticker(symbol)
            
            # Safe info retrieval to prevent yfinance crash
            try:
                info = ticker.info
                if not isinstance(info, dict):
                    info = {}
            except Exception:
                info = {}
            
            # Fetch current price
            price = info.get("currentPrice") or info.get("regularMarketPrice")
            if not price:
                try:
                    hist = ticker.history(period="1d")
                    if not hist.empty:
                        price = float(hist['Close'].iloc[-1])
                except Exception:
                    pass
            if not price:
                price = fallback["price"]
            
            # Get financial stats
            eps = info.get("trailingEps") or info.get("forwardEps") or fallback["eps"]
            bps = info.get("bookValue") or fallback["bps"]
            
            # Dividends (Try info first, fallback to historical sum if missing)
            dividend = info.get("dividendRate") or info.get("trailingAnnualDividendRate")
            if dividend is None or dividend <= 0:
                try:
                    div_history = ticker.dividends
                    if div_history is not None and not div_history.empty:
                        import pandas as pd
                        now = pd.Timestamp.now(tz=div_history.index.tz)
                        one_year_ago = now - pd.Timedelta(days=365)
                        recent_divs = div_history[div_history.index >= one_year_ago]
                        if not recent_divs.empty:
                            dividend = float(recent_divs.sum())
                            print(f"  [歷史配息計算] {symbol} 過去一年累計股利為: {dividend}")
                except Exception as ex:
                    print(f"  計算歷史股利出錯 ({symbol}): {ex}")
            
            if dividend is None or dividend <= 0:
                dividend = fallback["dividend"]
            
            # FCF and Shares
            fcf = info.get("freeCashflow")
            if not fcf:
                try:
                    cf = ticker.cashflow
                    if "Free Cash Flow" in cf.index:
                        fcf = cf.loc["Free Cash Flow"].iloc[0] / 1000000.0 # to millions
                    elif "Operating Cash Flow" in cf.index and "Capital Expenditure" in cf.index:
                        fcf = (cf.loc["Operating Cash Flow"].iloc[0] + cf.loc["Capital Expenditure"].iloc[0]) / 1000000.0
                except:
                    pass
            else:
                fcf = fcf / 1000000.0 # to millions
                
            if not fcf:
                fcf = fallback["fcf"]
                
            shares = info.get("sharesOutstanding")
            if shares:
                shares = shares / 1000000.0 # to millions
            else:
                shares = fallback["shares"]
                
            # If it is ETF, overwrite missing stats with custom fallback to prevent corporate valuation errors
            if meta.get("isETF"):
                eps = fallback["eps"]
                bps = fallback["bps"]
                fcf = fallback["fcf"]
                shares = fallback["shares"]

                
            # Name
            name = info.get("longName") or info.get("shortName")
            # If name has Chinese characters in fallback, use fallback name for readability
            if symbol == "2330.TW":
                name = "台積電"
            elif symbol == "0050.TW":
                name = "元大台灣50 (市值型)"
            elif symbol == "006208.TW":
                name = "富邦台50"
            elif symbol == "00878.TW":
                name = "國泰永續高股息"
            elif symbol == "00919.TW":
                name = "群益台灣精選高息"
            elif symbol == "00929.TW":
                name = "復華台灣科技優息"
            elif symbol == "0052.TW":
                name = "富邦科技"
            elif symbol == "2327.TW":
                name = "國巨"
            elif symbol == "2492.TW":
                name = "華新科"
            elif symbol == "2344.TW":
                name = "華邦電"
            elif symbol == "3481.TW":
                name = "群創"
            elif symbol == "2409.TW":
                name = "友達"
            elif not name:
                name = fallback.get("name") or symbol

            # PE / PB
            pe_val = info.get("trailingPE") or fallback["pe"]
            pb_val = info.get("priceToBook") or fallback["pb"]
            
            # Rule of 40 factors
            rev_growth = info.get("revenueGrowth")
            if rev_growth:
                growth_pct = int(rev_growth * 100)
            else:
                growth_pct = fallback["rule40Growth"]
                
            operating_margins = info.get("operatingMargins") or 0.2
            fcf_margin_pct = int(operating_margins * 100) if operating_margins else fallback["rule40FCFMargin"]

            results[symbol] = {
                "symbol": symbol,
                "name": name,
                "price": round(float(price), 2),
                "eps": round(float(eps), 2),
                "bps": round(float(bps), 2),
                "dividend": round(float(dividend), 2),
                "fcf": round(float(fcf), 2),
                "shares": round(float(shares), 2),
                "growth1": fallback["growth1"],
                "growth2": fallback["growth2"],
                "terminal": fallback["terminal"],
                "discount": fallback["discount"],
                "safety": fallback["safety"],
                "pe": round(float(pe_val), 1),
                "pb": round(float(pb_val), 2),
                "currency": meta["currency"],
                "isETF": meta.get("isETF", False),
                "etfType": meta.get("etfType", ""),
                "etfDesc": meta.get("etfDesc", ""),
                "rule40Growth": growth_pct,
                "rule40FCFMargin": fcf_margin_pct
            }
            print(f"[OK] Success fetching {symbol}: Price {price} {meta['currency']}")
            
        except Exception as e:
            print(f"[ERROR] Failed fetching {symbol}: {str(e)}. Using fallback data.")
            results[symbol] = {
                "symbol": symbol,
                "name": {
                    "2330.TW": "台積電",
                    "0050.TW": "元大台灣50",
                    "006208.TW": "富邦台50",
                    "00878.TW": "國泰永續高股息",
                    "00919.TW": "群益台灣精選高息",
                    "00929.TW": "復華台灣科技優息",
                    "0052.TW": "富邦科技",
                    "2327.TW": "國巨",
                    "2492.TW": "華新科",
                    "2344.TW": "華邦電",
                    "3481.TW": "群創",
                    "2409.TW": "友達"
                }.get(symbol, symbol),
                "price": fallback["price"],
                "eps": fallback["eps"],
                "bps": fallback["bps"],
                "dividend": fallback["dividend"],
                "fcf": fallback["fcf"],
                "shares": fallback["shares"],
                "growth1": fallback["growth1"],
                "growth2": fallback["growth2"],
                "terminal": fallback["terminal"],
                "discount": fallback["discount"],
                "safety": fallback["safety"],
                "pe": fallback["pe"],
                "pb": fallback["pb"],
                "currency": meta["currency"],
                "isETF": meta.get("isETF", False),
                "etfType": meta.get("etfType", ""),
                "etfDesc": meta.get("etfDesc", ""),
                "rule40Growth": fallback["rule40Growth"],
                "rule40FCFMargin": fallback["rule40FCFMargin"]
            }
            
    # Write to local file
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "realtime_data.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=4)
        
    print(f"所有數據已導出至 {output_path}。")
    
    # Update memory cache
    _CACHE_DATA = results
    _CACHE_TIME = current_time
    
    return results


def get_valuation_river(symbol):
    """
    計算並獲取過去 3 年的估值河流數據（個股）或移動平均線數據（ETF）
    並包含本地日級快取機制
    """
    import os
    import json
    import time
    import math
    from datetime import datetime
    import pandas as pd
    import yfinance as yf
    
    symbol = symbol.upper().strip()
    
    # 建立快取目錄
    cache_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "river_cache")
    os.makedirs(cache_dir, exist_ok=True)
    cache_path = os.path.join(cache_dir, f"{symbol}.json")
    
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    # 檢查快取
    if os.path.exists(cache_path):
        try:
            with open(cache_path, "r", encoding="utf-8") as f:
                cached_data = json.load(f)
                if cached_data.get("cache_date") == today_str:
                    print(f"[River Cache Hit!] 讀取歷史河流快取: {symbol}")
                    return cached_data
        except Exception as ex:
            print(f"讀取河流快取失敗: {ex}")
            
    # 沒有快取或過期，從 yfinance 重新拉取
    print(f"快取不存在或已過期，開始拉取 {symbol} 3年歷史數據...")
    
    # 獲取 meta 資訊
    meta = TICKERS.get(symbol, {"currency": "USD", "isETF": False})
    fallback = MOCK_FALLBACKS.get(symbol, {
        "price": 100.0, "eps": 5.0, "bps": 30.0, "pe": 20.0, "pb": 3.0, "growth1": 8.0
    })
    
    is_etf = meta.get("isETF", False)
    
    try:
        ticker = yf.Ticker(symbol)
        # 抓取 3 年日線數據
        hist = ticker.history(period="3y")
        if hist.empty:
            raise ValueError("yfinance 回傳的歷史股價為空")
    except Exception as e:
        print(f"[River Fetch Error] 拉取 {symbol} 歷史股價失敗: {e}。使用 Fallback 生成模擬歷史數據。")
        # 如果 yfinance 完蛋，生成一份乾淨的模擬歷史數據以求穩定性
        import pandas as pd
        dates = pd.date_range(end=datetime.now(), periods=150, freq='W')
        close_prices = []
        base_price = fallback["price"]
        import random
        random.seed(42) # 固定隨機數種子以保證數據穩定
        for i in range(150):
            # 隨機漫步模擬歷史股價
            base_price = base_price * (1 + random.uniform(-0.04, 0.05))
            close_prices.append(round(base_price, 2))
        
        hist = pd.DataFrame({
            "Close": close_prices
        }, index=dates)

    # 開始處理數據
    hist = hist.sort_index()
    
    # 日期序列轉字串 (YYYY-MM-DD)
    hist['DateStr'] = hist.index.strftime("%Y-%m-%d")
    
    result_data = {
        "symbol": symbol,
        "name": "台積電" if symbol == "2330.TW" else (fallback.get("name") or symbol),
        "isETF": is_etf,
        "currency": meta["currency"],
        "cache_date": today_str,
        "dates": [],
        "close": [],
    }
    
    if is_etf:
        # ETF 計算 20MA, 60MA, 120MA, 240MA
        hist['MA20'] = hist['Close'].rolling(window=20).mean()
        hist['MA60'] = hist['Close'].rolling(window=60).mean()
        hist['MA120'] = hist['Close'].rolling(window=120).mean()
        hist['MA240'] = hist['Close'].rolling(window=240).mean()
        
        # 降採樣 (每 5 天取一筆，避免點數太多)
        sampled = hist.iloc[::5].copy()
        
        # 定義輔助函數來安全清理 nan
        def clean_val(val):
            try:
                if val is None or pd.isnull(val) or (isinstance(val, float) and math.isnan(val)):
                    return None
                return round(float(val), 2)
            except:
                return None
        
        result_data["dates"] = sampled['DateStr'].tolist()
        result_data["close"] = [clean_val(x) for x in sampled['Close']]
        result_data["ma20"] = [clean_val(x) for x in sampled['MA20']]
        result_data["ma60"] = [clean_val(x) for x in sampled['MA60']]
        result_data["ma120"] = [clean_val(x) for x in sampled['MA120']]
        result_data["ma240"] = [clean_val(x) for x in sampled['MA240']]
        
    else:
        # 個股計算 PE / PB 河流圖
        # 讀取當前的即時數據以獲取最新的 EPS/BPS (維持一致性)，否則用 fallback
        latest_eps = fallback["eps"]
        latest_bps = fallback["bps"]
        pe_mid = fallback["pe"]
        pb_mid = fallback["pb"]
        growth = fallback["growth1"] / 100.0 # 轉小數，如 0.18
        
        # 嘗試從已生成的 realtime_data.json 中讀取最新值
        realtime_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "realtime_data.json")
        if os.path.exists(realtime_path):
            try:
                with open(realtime_path, "r", encoding="utf-8") as f:
                    rt = json.load(f)
                    if symbol in rt:
                        latest_eps = rt[symbol].get("eps", latest_eps)
                        latest_bps = rt[symbol].get("bps", latest_bps)
                        pe_mid = rt[symbol].get("pe", pe_mid)
                        pb_mid = rt[symbol].get("pb", pb_mid)
            except Exception as e:
                print(f"讀取 realtime_data 失敗: {e}")
                
        # 降採樣 (每 5 天取一筆)
        sampled = hist.iloc[::5].copy()
        
        dates_list = sampled['DateStr'].tolist()
        close_list = [round(float(x), 2) for x in sampled['Close']]
        
        pe_bands = {
            "cheap_0_6": [],
            "low_0_8": [],
            "fair_1_0": [],
            "high_1_2": [],
            "expensive_1_4": []
        }
        pb_bands = {
            "cheap_0_6": [],
            "low_0_8": [],
            "fair_1_0": [],
            "high_1_2": [],
            "expensive_1_4": []
        }
        
        # 基準點日期 T (最後一個採樣點)
        last_date = sampled.index[-1]
        
        for idx, row in sampled.iterrows():
            # 計算歷史平滑 EPS & BPS
            days_diff = (last_date - idx).days
            years_diff = days_diff / 365.25
            
            # 歷史上當時的 EPS 和 BPS
            hist_eps = latest_eps * ((1 + growth) ** (-years_diff))
            hist_bps = latest_bps * ((1 + growth) ** (-years_diff))
            
            # PE 河流區間
            pe_bands["cheap_0_6"].append(round(hist_eps * pe_mid * 0.6, 2))
            pe_bands["low_0_8"].append(round(hist_eps * pe_mid * 0.8, 2))
            pe_bands["fair_1_0"].append(round(hist_eps * pe_mid * 1.0, 2))
            pe_bands["high_1_2"].append(round(hist_eps * pe_mid * 1.2, 2))
            pe_bands["expensive_1_4"].append(round(hist_eps * pe_mid * 1.4, 2))
            
            # PB 河流區間
            pb_bands["cheap_0_6"].append(round(hist_bps * pb_mid * 0.6, 2))
            pb_bands["low_0_8"].append(round(hist_bps * pb_mid * 0.8, 2))
            pb_bands["fair_1_0"].append(round(hist_bps * pb_mid * 1.0, 2))
            pb_bands["high_1_2"].append(round(hist_bps * pb_mid * 1.2, 2))
            pb_bands["expensive_1_4"].append(round(hist_bps * pb_mid * 1.4, 2))
            
        result_data["dates"] = dates_list
        result_data["close"] = close_list
        result_data["pe_mid"] = pe_mid
        result_data["pb_mid"] = pb_mid
        result_data["pe_bands"] = pe_bands
        result_data["pb_bands"] = pb_bands
        
    # 儲存到快取
    try:
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(result_data, f, ensure_ascii=False, indent=4)
        print(f"[River Cache Saved] 成功儲存 {symbol} 快取。")
    except Exception as ex:
        print(f"儲存河流快取失敗: {ex}")
        
    return result_data


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # CLI Mode: Analyze single stock
        sym = sys.argv[1].upper()
        print(f"--- 動態分析報告: {sym} ---")
        # Just run a quick query and output report
        try:
            ticker = yf.Ticker(sym)
            price = ticker.info.get("currentPrice") or ticker.info.get("regularMarketPrice")
            eps = ticker.info.get("trailingEps") or 0.0
            bps = ticker.info.get("bookValue") or 0.0
            div = ticker.info.get("dividendRate") or 0.0
            print(f"當前價格: ${price}")
            print(f"EPS: {eps}")
            print(f"每股淨值 (BPS): {bps}")
            print(f"預期股利: {div}")
            if eps > 0 and bps > 0:
                graham = (22.5 * eps * bps) ** 0.5
                print(f"葛拉漢估值: ${graham:.2f}")
        except Exception as e:
            print(f"分析失敗: {e}")
    else:
        # Normal Mode: Fetch and write JSON
        fetch_realtime_data()
