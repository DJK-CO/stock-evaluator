// JavaScript Core: Stock Evaluator Calculations and Charting

// 雲端部署後，請將下方網址替換為您的 Render 後端網址 (例如 https://my-backend.onrender.com)
const CLOUD_BACKEND_URL = "https://stock-evaluator-backend.onrender.com";

const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? ""
    : CLOUD_BACKEND_URL;

const stockPresets = {
    "2330": {
        symbol: "2330.TW",
        name: "台積電",
        price: 2405.0,
        eps: 73.68,
        bps: 227.17,
        dividend: 24.0,
        fcf: 719158.44, // 百萬 TWD
        shares: 25932.37, // 百萬股
        growth1: 18,
        growth2: 12,
        terminal: 2.0,
        discount: 8.5,
        safety: 15,
        pe: 25,
        pb: 5.8,
        rule40Growth: 22,
        rule40FCFMargin: 38,
        currency: "TWD",
        frequency: 4,
        riskLevel: "中風險",
        riskDesc: "半導體景氣循環與地緣政治風險，但製程領先具強大護城河與高定價權。",
        sellPremium: 0.20,
        strategyMode: "growth"
    },
    "0050": {
        symbol: "0050.TW",
        name: "元大台灣50 (市值型)",
        price: 107.0,
        eps: 3.42,
        bps: 25.00,
        dividend: 1.36,
        fcf: 0,
        shares: 1,
        growth1: 6,
        growth2: 4,
        terminal: 1.5,
        discount: 7.0,
        safety: 10,
        pe: 21.8,
        pb: 2.4,
        rule40Growth: 12,
        rule40FCFMargin: 0,
        isETF: true,
        etfType: "市值型",
        etfDesc: "追蹤台灣前50大市值企業，大盤估值領頭羊。",
        currency: "TWD",
        frequency: 2,
        riskLevel: "低風險",
        riskDesc: "分散投資台股權值股，波動與大盤一致，非常適合穩健長期持有。",
        sellPremium: 0.15,
        strategyMode: "index"
    },
    "00878": {
        symbol: "00878.TW",
        name: "國泰永續高股息",
        price: 33.6,
        eps: 1.70,
        bps: 18.00,
        dividend: 1.88,
        fcf: 0,
        shares: 1,
        growth1: 4,
        growth2: 3,
        terminal: 1.0,
        discount: 6.5,
        safety: 10,
        pe: 15.6,
        pb: 1.47,
        rule40Growth: 8,
        rule40FCFMargin: 0,
        isETF: true,
        etfType: "高股息",
        etfDesc: "結合ESG與高股息篩選，配息穩定度高。",
        currency: "TWD",
        frequency: 4,
        riskLevel: "低風險",
        riskDesc: "ESG篩選與季配息，股價波動度低，具備優異的抗跌防禦屬性。",
        sellPremium: 0.12,
        strategyMode: "dividend"
    },
    "006208": {
        symbol: "006208.TW",
        name: "富邦台50",
        price: 248.1,
        eps: 5.60,
        bps: 48.00,
        dividend: 4.44,
        fcf: 0,
        shares: 1,
        growth1: 6,
        growth2: 4,
        terminal: 1.5,
        discount: 7.0,
        safety: 10,
        pe: 21.0,
        pb: 2.40,
        rule40Growth: 12,
        rule40FCFMargin: 0,
        isETF: true,
        etfType: "市值型",
        etfDesc: "小資族定期定額首選，低內扣費用，追蹤台灣前50大市值企業。",
        currency: "TWD",
        frequency: 2,
        riskLevel: "低風險",
        riskDesc: "與0050相似但經理費更低，適合小資族定期定額，貼合大盤長期成長。",
        sellPremium: 0.15,
        strategyMode: "index"
    },
    "00919": {
        symbol: "00919.TW",
        name: "群益台灣精選高息",
        price: 30.82,
        eps: 2.00,
        bps: 17.00,
        dividend: 2.86,
        fcf: 0,
        shares: 1,
        growth1: 4,
        growth2: 3,
        terminal: 1.0,
        discount: 6.5,
        safety: 10,
        pe: 14.0,
        pb: 1.56,
        rule40Growth: 8,
        rule40FCFMargin: 0,
        isETF: true,
        etfType: "高股息",
        etfDesc: "社團人氣配息王，精選高股息率成分股，配息爆發力強。",
        currency: "TWD",
        frequency: 4,
        riskLevel: "中低風險",
        riskDesc: "高配息率且波動度適中，但需注意成分股產業過度集中科技股之風險。",
        sellPremium: 0.15,
        strategyMode: "dividend"
    },
    "00929": {
        symbol: "00929.TW",
        name: "復華台灣科技優息",
        price: 30.85,
        eps: 1.60,
        bps: 16.00,
        dividend: 1.32,
        fcf: 0,
        shares: 1,
        growth1: 5,
        growth2: 4,
        terminal: 1.2,
        discount: 6.8,
        safety: 10,
        pe: 14.5,
        pb: 1.33,
        rule40Growth: 10,
        rule40FCFMargin: 0,
        isETF: true,
        etfType: "高股息",
        etfDesc: "首檔月配息科技高股息，社團「每月被動收入」討論度極高。",
        currency: "TWD",
        frequency: 12,
        riskLevel: "中低風險",
        riskDesc: "純科技高股息，波動度略高於 00878 等傳統高股息，適合追求每月配息流者。",
        sellPremium: 0.15,
        strategyMode: "dividend"
    },
    "00713": {
        symbol: "00713.TW",
        name: "元大台灣高息低波",
        price: 61.5,
        eps: 3.80,
        bps: 26.00,
        dividend: 3.44,
        fcf: 0,
        shares: 1,
        growth1: 5,
        growth2: 4,
        terminal: 1.2,
        discount: 6.5,
        safety: 10,
        pe: 16.5,
        pb: 2.3,
        rule40Growth: 10,
        rule40FCFMargin: 0,
        isETF: true,
        etfType: "高股息",
        etfDesc: "季配息低波代表，特色是高股息、低波動、自動控制下行風險。",
        currency: "TWD",
        frequency: 4,
        riskLevel: "低風險",
        riskDesc: "低波因子篩選，大盤下跌時防禦力極佳，適合喜好穩定股利並防範波動者。",
        sellPremium: 0.12,
        strategyMode: "dividend"
    },
    "00940": {
        symbol: "00940.TW",
        name: "元大台灣價值高息",
        price: 12.65,
        eps: 0.70,
        bps: 10.00,
        dividend: 0.52,
        fcf: 0,
        shares: 1,
        growth1: 4,
        growth2: 3,
        terminal: 1.0,
        discount: 6.5,
        safety: 10,
        pe: 15.0,
        pb: 1.0,
        rule40Growth: 8,
        rule40FCFMargin: 0,
        isETF: true,
        etfType: "高股息",
        etfDesc: "月配息熱門高股息，主打巴菲特價值投資因子篩選高息成分股。",
        currency: "TWD",
        frequency: 12,
        riskLevel: "中低風險",
        riskDesc: "低發行價與價值因子，防禦性尚可，成分股集中於科技與傳產權值股。",
        sellPremium: 0.12,
        strategyMode: "dividend"
    },
    "AAPL": {
        symbol: "AAPL",
        name: "蘋果公司",
        price: 295.95,
        eps: 8.26,
        bps: 7.26,
        dividend: 1.08,
        fcf: 101090.75, // 百萬 USD
        shares: 14687.36, // 百萬股
        growth1: 8,
        growth2: 6,
        terminal: 2.0,
        discount: 7.5,
        safety: 15,
        pe: 30,
        pb: 44.0,
        rule40Growth: 6,
        rule40FCFMargin: 26,
        currency: "USD",
        frequency: 4,
        riskLevel: "低風險",
        riskDesc: "軟硬體生態系穩固，品牌黏著度極高，現金流極為充沛，下行風險低。",
        sellPremium: 0.15,
        strategyMode: "growth"
    },
    "NVDA": {
        symbol: "NVDA",
        name: "輝達",
        price: 204.65,
        eps: 6.53,
        bps: 8.07,
        dividend: 0.04,
        fcf: 46335.87, // 百萬 USD
        shares: 24221.0, // 百萬股
        growth1: 30,
        growth2: 15,
        terminal: 2.5,
        discount: 9.0,
        safety: 20,
        pe: 45,
        pb: 15.0,
        rule40Growth: 90,
        rule40FCFMargin: 45,
        currency: "USD",
        frequency: 4,
        riskLevel: "高風險",
        riskDesc: "AI 晶片絕對霸主，但目前估值與市場預期極高，股價波動隨財報劇烈起伏。",
        sellPremium: 0.30,
        strategyMode: "growth"
    },
    "AVGO": {
        symbol: "AVGO",
        name: "博通 (6月熱門)",
        price: 392.9,
        eps: 6.03,
        bps: 18.43,
        dividend: 2.60,
        fcf: 27212.25,
        shares: 4757.58,
        growth1: 25,
        growth2: 12,
        terminal: 2.0,
        discount: 8.5,
        safety: 15,
        pe: 33.0,
        pb: 7.1,
        rule40Growth: 45,
        rule40FCFMargin: 42,
        currency: "USD",
        frequency: 4,
        riskLevel: "中風險",
        riskDesc: "半導體網通龍頭並整合雲端軟體，受惠 AI 伺服器升級，營運穩健多角化。",
        sellPremium: 0.20,
        strategyMode: "growth"
    },
    "MSFT": {
        symbol: "MSFT",
        name: "微軟",
        price: 378.91,
        eps: 16.78,
        bps: 55.78,
        dividend: 3.64,
        fcf: 37011.25, // 百萬 USD
        shares: 7428.43, // 百萬股
        growth1: 15,
        growth2: 10,
        terminal: 2.0,
        discount: 8.0,
        safety: 15,
        pe: 35,
        pb: 12.0,
        rule40Growth: 15,
        rule40FCFMargin: 30,
        isHot: true,
        hotReason: "微軟公司 (MSFT) 是 6 月（以及當前）最熱門的 AI 領頭羊，Copilot 與雲端 Azure 成長強勁。",
        currency: "USD",
        frequency: 4,
        riskLevel: "中低風險",
        riskDesc: "辦公軟體與 Azure 雲端具極強壟斷力，AI Copilot 生態整合帶來長期護城河。",
        sellPremium: 0.18,
        strategyMode: "growth"
    },
    "TSLA": {
        symbol: "TSLA",
        name: "特斯拉",
        price: 396.38,
        eps: 1.09,
        bps: 21.90,
        dividend: 0.00,
        fcf: 5252.0, // 百萬 USD
        shares: 3755.72, // 百萬股
        growth1: 20,
        growth2: 12,
        terminal: 2.0,
        discount: 10.0,
        safety: 25,
        pe: 65,
        pb: 8.5,
        rule40Growth: 15,
        rule40FCFMargin: 10,
        currency: "USD",
        frequency: 4,
        riskLevel: "高風險",
        riskDesc: "電動車市場競爭加劇，FSD 與機器人故事占比大，易受政策與馬斯克推文影響波動。",
        sellPremium: 0.35,
        strategyMode: "growth"
    },
    "AMD": {
        symbol: "AMD",
        name: "超微半導體",
        price: 512.48,
        eps: 2.99,
        bps: 39.55,
        dividend: 0.00,
        fcf: 7173.37, // 百萬 USD
        shares: 1630.6, // 百萬股
        growth1: 22,
        growth2: 12,
        terminal: 2.0,
        discount: 9.5,
        safety: 20,
        pe: 75.0,
        pb: 4.4,
        rule40Growth: 15,
        rule40FCFMargin: 10,
        isHot: true,
        hotReason: "AI 晶片二當家，MI300X 晶片需求火爆，為輝達最強 AI 晶片挑戰者。",
        currency: "USD",
        frequency: 4,
        riskLevel: "高風險",
        riskDesc: "挑戰輝達的 AI 晶片二當家，成長性高但目前 PE 與溢價偏高，受半導體景氣影響大。",
        sellPremium: 0.30,
        strategyMode: "growth"
    },
    "TSM": {
        symbol: "TSM",
        name: "台積電 ADR (6月熱門)",
        price: 432.15,
        eps: 11.63,
        bps: 6.54,
        dividend: 24.0,
        fcf: 719158.44, // 百萬 USD
        shares: 5186.47, // 百萬股
        growth1: 18,
        growth2: 12,
        terminal: 2.0,
        discount: 8.5,
        safety: 15,
        pe: 28.0,
        pb: 6.8,
        rule40Growth: 22,
        rule40FCFMargin: 38,
        isHot: true,
        hotReason: "台積電美股 ADR，受 AI 晶片代工暴增拉動，相較台股具備高溢價，為台美社團套利與追蹤焦點。",
        currency: "USD",
        frequency: 4,
        riskLevel: "中風險",
        riskDesc: "半導體代工霸主，製程難以被超越，但需承受台海地緣政治風險與 ADR 折溢價變動。",
        sellPremium: 0.22,
        strategyMode: "growth"
    },
    "SMCI": {
        symbol: "SMCI",
        name: "超微電腦 (6月熱門)",
        price: 27.78,
        eps: 1.90,
        bps: 12.60,
        dividend: 0.00,
        fcf: -7448.38, // 百萬 USD
        shares: 601.42, // 百萬股
        growth1: 45,
        growth2: 20,
        terminal: 2.0,
        discount: 10.5,
        safety: 30,
        pe: 35,
        pb: 8.5,
        rule40Growth: 80,
        rule40FCFMargin: 10,
        isHot: true,
        hotReason: "AI 伺服器液冷架架構巨頭，2024-2026年社團頭號 AI 飆股與散熱概念股，波動極大。",
        currency: "USD",
        frequency: 4,
        riskLevel: "特高風險",
        riskDesc: "AI 液冷伺服器先驅，但面臨對手惡性競爭、毛利下滑以及財報不確定性之巨大波動。",
        sellPremium: 0.40,
        strategyMode: "growth"
    },
    "GOOGL": {
        symbol: "GOOGL",
        name: "谷歌",
        price: 363.79,
        eps: 13.10,
        bps: 39.51,
        dividend: 0.88,
        fcf: 27921.75, // 百萬 USD
        shares: 5867.16, // 百萬股
        growth1: 15,
        growth2: 10,
        terminal: 2.0,
        discount: 8.0,
        safety: 15,
        pe: 24.0,
        pb: 7.29,
        rule40Growth: 14,
        rule40FCFMargin: 28,
        isHot: true,
        hotReason: "Gemini 1.5 Pro 與 AI 搜尋升級，雲端服務增長強勁，首次發放現金股利。",
        currency: "USD",
        frequency: 4,
        riskLevel: "中風險",
        riskDesc: "搜尋廣告護城河強健，但需面臨 AI 搜尋新競爭（如 OpenAI）以及反壟斷政策之風險。",
        sellPremium: 0.20,
        strategyMode: "growth"
    },
    "VOO": {
        symbol: "VOO",
        name: "標普 500 ETF (VOO)",
        price: 681.41,
        eps: 19.00,
        bps: 390.85,
        dividend: 5.44,
        fcf: 0,
        shares: 1,
        growth1: 7,
        growth2: 5,
        terminal: 1.8,
        discount: 7.0,
        safety: 10,
        pe: 25.0,
        pb: 4.5,
        rule40Growth: 14,
        rule40FCFMargin: 0,
        isETF: true,
        etfType: "市值型",
        etfDesc: "Vanguard S&P 500 ETF，最經典的美股標普500大盤代表，長期複利穩健。",
        currency: "USD",
        frequency: 4,
        riskLevel: "低風險",
        riskDesc: "代表美國整體經濟大盤，分散度極佳，波動度溫和，為被動投資核心標的。",
        sellPremium: 0.15,
        strategyMode: "index"
    },
    "QQQ": {
        symbol: "QQQ",
        name: "納斯達克 100 ETF (QQQ)",
        price: 722.51,
        eps: 16.00,
        bps: 357.77,
        dividend: 1.77,
        fcf: 0,
        shares: 1,
        growth1: 12,
        growth2: 8,
        terminal: 2.0,
        discount: 7.5,
        safety: 10,
        pe: 30.0,
        pb: 7.0,
        rule40Growth: 18,
        rule40FCFMargin: 0,
        isETF: true,
        etfType: "市值型",
        etfDesc: "Invesco QQQ，追蹤Nasdaq 100指數，美股科技龍頭大本營，長期成長動能強。",
        currency: "USD",
        frequency: 4,
        riskLevel: "中低風險",
        riskDesc: "權重高度集中於科技龍頭巨頭，長期回報高，但科技板塊修正時波動度較 VOO 大。",
        sellPremium: 0.18,
        strategyMode: "index"
    },
    "SCHD": {
        symbol: "SCHD",
        name: "美股高股息 ETF (SCHD)",
        price: 31.93,
        eps: 4.20,
        bps: 32.00,
        dividend: 1.06,
        fcf: 0,
        shares: 1,
        growth1: 5,
        growth2: 4,
        terminal: 1.2,
        discount: 6.5,
        safety: 10,
        pe: 16.5,
        pb: 2.5,
        rule40Growth: 10,
        rule40FCFMargin: 0,
        isETF: true,
        etfType: "高股息",
        etfDesc: "Schwab US Dividend Equity ETF，美股最熱門高息增長 ETF，防禦與存股首選。",
        currency: "USD",
        frequency: 4,
        riskLevel: "低風險",
        riskDesc: "專注於連續增發股利且基本面強健的成熟企業，防守性強，非常適合 DRIP 計畫。",
        sellPremium: 0.12,
        strategyMode: "dividend"
    },
    "0052": {
        symbol: "0052.TW",
        name: "富邦科技",
        price: 62.5,
        eps: 3.66,
        bps: 27.45,
        dividend: 1.37,
        fcf: 0,
        shares: 1,
        growth1: 12,
        growth2: 8,
        terminal: 1.8,
        discount: 7.0,
        safety: 10,
        pe: 18.0,
        pb: 2.20,
        rule40Growth: 15,
        rule40FCFMargin: 0,
        isETF: true,
        etfType: "科技型",
        etfDesc: "富邦台灣科技 ETF，追蹤台灣科技板塊，台股科技巨頭與半導體比例高。",
        currency: "TWD",
        frequency: 1,
        riskLevel: "中風險",
        riskDesc: "台積電權重高達六成以上，受半導體與 AI 景氣波動影響大，但長期科技回報佳。",
        sellPremium: 0.18,
        strategyMode: "index"
    },
    "2327": {
        symbol: "2327.TW",
        name: "國巨",
        price: 1040.0,
        eps: 12.64,
        bps: 81.15,
        dividend: 6.00,
        fcf: 21481.90,
        shares: 2058.73,
        growth1: 15,
        growth2: 10,
        terminal: 2.0,
        discount: 8.5,
        safety: 15,
        pe: 13.5,
        pb: 2.20,
        rule40Growth: 18,
        rule40FCFMargin: 22,
        currency: "TWD",
        frequency: 1,
        riskLevel: "中風險",
        riskDesc: "被動元件龍頭，AI 伺服器與高階車用電容需求爆發，具備產品定價權但有景氣循環風險。",
        sellPremium: 0.20,
        strategyMode: "growth"
    },
    "2492": {
        symbol: "2492.TW",
        name: "華新科",
        price: 554.0,
        eps: 4.74,
        bps: 65.25,
        dividend: 2.40,
        fcf: 3642.43,
        shares: 484.80,
        growth1: 10,
        growth2: 6,
        terminal: 1.5,
        discount: 7.5,
        safety: 10,
        pe: 18.8,
        pb: 1.30,
        rule40Growth: 12,
        rule40FCFMargin: 15,
        currency: "TWD",
        frequency: 1,
        riskLevel: "中風險",
        riskDesc: "台灣第二大被動元件廠，消費電子與 AI PC/手機復甦之主要受惠者，具備中等波動特性。",
        sellPremium: 0.18,
        strategyMode: "growth"
    },
    "2344": {
        symbol: "2344.TW",
        name: "華邦電",
        price: 207.5,
        eps: 0.89,
        bps: 25.92,
        dividend: 0.50,
        fcf: -10663.85,
        shares: 4500.00,
        growth1: 8,
        growth2: 5,
        terminal: 1.5,
        discount: 7.5,
        safety: 10,
        pe: 16.3,
        pb: 1.20,
        rule40Growth: 8,
        rule40FCFMargin: 12,
        currency: "TWD",
        frequency: 1,
        riskLevel: "中風險",
        riskDesc: "記憶體與主動元件廠，AI 邊緣運算拉動 Nor Flash 需求，產能利用率回溫，受記憶體景氣循環影響。",
        sellPremium: 0.18,
        strategyMode: "growth"
    },
    "3481": {
        symbol: "3481.TW",
        name: "群創",
        price: 60.7,
        eps: 0.03,
        bps: 28.39,
        dividend: 1.00,
        fcf: 17172.95,
        shares: 7981.05,
        growth1: 6,
        growth2: 4,
        terminal: 1.0,
        discount: 7.0,
        safety: 10,
        pe: 18.1,
        pb: 0.60,
        rule40Growth: 6,
        rule40FCFMargin: -5,
        currency: "TWD",
        frequency: 1,
        riskLevel: "中高風險",
        riskDesc: "面板廠積極轉型半導體面板級封裝 (FOPLP) 具高成長潛力，但本業面板報價仍具高度週期性。",
        sellPremium: 0.22,
        strategyMode: "growth"
    },
    "2409": {
        symbol: "2409.TW",
        name: "友達",
        price: 26.75,
        eps: 0.90,
        bps: 19.81,
        dividend: 1.20,
        fcf: -6890.23,
        shares: 7547.10,
        growth1: 6,
        growth2: 4,
        terminal: 1.0,
        discount: 7.0,
        safety: 10,
        pe: 27.5,
        pb: 0.75,
        rule40Growth: 6,
        rule40FCFMargin: -4,
        currency: "TWD",
        frequency: 1,
        riskLevel: "中風險",
        riskDesc: "面板巨頭，跨足智慧座艙與 Micro LED 先進技術，但需注意折舊費用與景氣下行時的損益波動。",
        sellPremium: 0.18,
        strategyMode: "growth"
    },
    "2317": {
        symbol: "2317.TW", name: "鴻海", price: 270.0, eps: 13.40, bps: 126.91, dividend: 7.17, fcf: 37193.24, shares: 14001.92,
        growth1: 10, growth2: 7, terminal: 1.5, discount: 7.5, safety: 15, pe: 18.0, pb: 1.8, rule40Growth: 15, rule40FCFMargin: 8,
        currency: "TWD", frequency: 1, riskLevel: "中風險", riskDesc: "全球代工龍頭，積極布局 AI 伺服器與電動車，具備規模优势。",
        sellPremium: 0.18, strategyMode: "growth"
    },
    "2454": {
        symbol: "2454.TW", name: "聯發科", price: 4430.0, eps: 66.12, bps: 244.52, dividend: 53.50, fcf: 73559.38, shares: 1596.11,
        growth1: 15, growth2: 10, terminal: 2.0, discount: 8.5, safety: 15, pe: 22.0, pb: 5.0, rule40Growth: 18, rule40FCFMargin: 20,
        currency: "TWD", frequency: 1, riskLevel: "中風險", riskDesc: "手機晶片巨頭，受惠 AI 邊緣運算晶片增長，具備高利潤率與高股息特性。",
        sellPremium: 0.20, strategyMode: "growth"
    },
    "2308": {
        symbol: "2308.TW", name: "台達電", price: 2185.0, eps: 22.97, bps: 115.32, dividend: 11.60, fcf: 32521.96, shares: 2597.54,
        growth1: 12, growth2: 8, terminal: 1.5, discount: 7.5, safety: 15, pe: 28.0, pb: 4.0, rule40Growth: 12, rule40FCFMargin: 10,
        currency: "TWD", frequency: 1, riskLevel: "低風險", riskDesc: "電源與綠能巨頭，AI 伺服器散熱與電源轉換模組龍頭，長期成長穩健。",
        sellPremium: 0.18, strategyMode: "growth"
    },
    "2303": {
        symbol: "2303.TW", name: "聯電", price: 140.0, eps: 3.93, bps: 32.33, dividend: 2.85, fcf: 34353.80, shares: 12546.43,
        growth1: 6, growth2: 4, terminal: 1.0, discount: 7.0, safety: 10, pe: 11.5, pb: 1.9, rule40Growth: 6, rule40FCFMargin: 25,
        currency: "TWD", frequency: 1, riskLevel: "中風險", riskDesc: "成熟製程代工大廠，受景氣循環影響大，但股息配發大方，具殖利率防護。",
        sellPremium: 0.15, strategyMode: "growth"
    },
    "2382": {
        symbol: "2382.TW", name: "廣達", price: 376.0, eps: 18.92, bps: 53.83, dividend: 13.00, fcf: -98190.83, shares: 3854.52,
        growth1: 15, growth2: 10, terminal: 1.5, discount: 8.0, safety: 15, pe: 23.0, pb: 4.6, rule40Growth: 25, rule40FCFMargin: 6,
        currency: "TWD", frequency: 1, riskLevel: "中高風險", riskDesc: "AI 伺服器代工龍頭，組裝業務營收成長爆發，但需注意代工毛利率波動與估值偏高風險。",
        sellPremium: 0.22, strategyMode: "growth"
    },
    "2301": {
        symbol: "2301.TW", name: "光寶科", price: 211.0, eps: 6.59, bps: 38.83, dividend: 7.51, fcf: -3553.09, shares: 2269.10,
        growth1: 8, growth2: 6, terminal: 1.2, discount: 7.0, safety: 10, pe: 17.5, pb: 2.9, rule40Growth: 10, rule40FCFMargin: 9,
        currency: "TWD", frequency: 1, riskLevel: "中風險", riskDesc: "光電與電源大廠，受惠於 AI 伺服器電源升級，正朝向高毛利產品轉型。",
        sellPremium: 0.15, strategyMode: "growth"
    },
    "2891": {
        symbol: "2891.TW", name: "中信金", price: 71.9, eps: 4.06, bps: 27.16, dividend: 2.30, fcf: 213396.83, shares: 19676.90,
        growth1: 5, growth2: 4, terminal: 1.0, discount: 6.5, safety: 10, pe: 13.0, pb: 1.6, rule40Growth: 8, rule40FCFMargin: 0,
        currency: "TWD", frequency: 1, riskLevel: "低風險", riskDesc: "金融權值股，以銀行與人壽為獲利雙引擎，股息配發穩定，抗震存股標的。",
        sellPremium: 0.12, strategyMode: "dividend"
    },
    "2603": {
        symbol: "2603.TW", name: "長榮", price: 193.5, eps: 31.64, bps: 268.71, dividend: 16.00, fcf: 28350.01, shares: 2165.04,
        growth1: 5, growth2: 3, terminal: 0.5, discount: 9.0, safety: 25, pe: 8.8, pb: 0.8, rule40Growth: 12, rule40FCFMargin: 35,
        currency: "TWD", frequency: 1, riskLevel: "高風險", riskDesc: "航運巨頭，運價受地緣政治與景氣波動極大，但手握充沛現金，具備極高配息能力。",
        sellPremium: 0.25, strategyMode: "growth"
    },
    "2379": {
        symbol: "2379.TW", name: "瑞昱", price: 819.0, eps: 28.07, bps: 87.68, dividend: 25.00, fcf: 9227.78, shares: 512.86,
        growth1: 12, growth2: 8, terminal: 1.5, discount: 8.0, safety: 15, pe: 18.9, pb: 4.8, rule40Growth: 14, rule40FCFMargin: 16,
        currency: "TWD", frequency: 1, riskLevel: "中風險", riskDesc: "蟹蟹晶片，網通晶片領頭羊，受惠 WiFi 7 與汽車乙太網路長線需求。",
        sellPremium: 0.18, strategyMode: "growth"
    },
    "3034": {
        symbol: "3034.TW", name: "聯詠", price: 533.0, eps: 26.85, bps: 118.20, dividend: 28.00, fcf: 24000.00, shares: 600.00,
        growth1: 8, growth2: 5, terminal: 1.2, discount: 7.5, safety: 15, pe: 15.5, pb: 4.1, rule40Growth: 10, rule40FCFMargin: 20,
        currency: "TWD", frequency: 1, riskLevel: "中風險", riskDesc: "驅動 IC 龍頭，受惠 OLED 滲透率提升，股利配發率高，殖利率具吸引力。",
        sellPremium: 0.18, strategyMode: "growth"
    },
    "3711": {
        symbol: "3711.TW", name: "日月光投控", price: 608.0, eps: 10.18, bps: 79.90, dividend: 6.60, fcf: 38000.00, shares: 4380.00,
        growth1: 10, growth2: 7, terminal: 1.5, discount: 7.5, safety: 15, pe: 17.3, pb: 2.3, rule40Growth: 12, rule40FCFMargin: 12,
        currency: "TWD", frequency: 1, riskLevel: "中風險", riskDesc: "半導體封測第一大廠，先進封裝產能擴充快速，為 AI 晶片封測首選合作夥伴。",
        sellPremium: 0.18, strategyMode: "growth"
    },
    "3045": {
        symbol: "3045.TW", name: "台灣大", price: 118.5, eps: 4.70, bps: 30.05, dividend: 4.80, fcf: 15000.00, shares: 3020.00,
        growth1: 4, growth2: 3, terminal: 1.0, discount: 6.0, safety: 10, pe: 24.0, pb: 3.3, rule40Growth: 6, rule40FCFMargin: 15,
        currency: "TWD", frequency: 1, riskLevel: "低風險", riskDesc: "電信三雄之一，合併台灣之星發揮綜效，現金流極為穩定，防禦存股首選。",
        sellPremium: 0.12, strategyMode: "dividend"
    },
    "2412": {
        symbol: "2412.TW", name: "中華電", price: 145.0, eps: 5.02, bps: 51.09, dividend: 5.20, fcf: 35000.00, shares: 7750.00,
        growth1: 3, growth2: 2, terminal: 1.0, discount: 5.8, safety: 10, pe: 26.0, pb: 2.5, rule40Growth: 4, rule40FCFMargin: 18,
        currency: "TWD", frequency: 1, riskLevel: "低風險", riskDesc: "台股公債代表，寬頻與行動通訊絕對領先，極度抗震，適合退休資產配置。",
        sellPremium: 0.10, strategyMode: "dividend"
    },
    "3231": {
        symbol: "3231.TW", name: "緯創", price: 161.5, eps: 8.41, bps: 59.80, dividend: 5.50, fcf: 12000.00, shares: 2890.00,
        growth1: 15, growth2: 10, terminal: 1.5, discount: 8.0, safety: 15, pe: 22.0, pb: 3.3, rule40Growth: 28, rule40FCFMargin: 5,
        currency: "TWD", frequency: 1, riskLevel: "中高風險", riskDesc: "AI 伺服器主力代工廠，產能高度滿載，受惠於 AI 硬體基礎設施建置浪潮。",
        sellPremium: 0.20, strategyMode: "growth"
    },
    "AMZN": {
        symbol: "AMZN", name: "亞馬遜", price: 237.5, eps: 7.77, bps: 41.09, dividend: 0.00, fcf: 32000.00, shares: 10400.00,
        growth1: 18, growth2: 12, terminal: 2.0, discount: 8.5, safety: 15, pe: 52.8, pb: 8.4, rule40Growth: 12, rule40FCFMargin: 11,
        currency: "USD", frequency: 4, riskLevel: "中風險", riskDesc: "電商與 AWS 雲端運算霸主，AI 雲端服務需求強勁，現金流生成能力卓越，但無配息。",
        sellPremium: 0.20, strategyMode: "growth"
    },
    "TXN": {
        symbol: "TXN", name: "德州儀器", price: 301.88, eps: 5.84, bps: 18.44, dividend: 5.56, fcf: 5400.00, shares: 910.00,
        growth1: 8, growth2: 6, terminal: 2.0, discount: 7.5, safety: 15, pe: 27.8, pb: 10.8, rule40Growth: 8, rule40FCFMargin: 20,
        currency: "USD", frequency: 4, riskLevel: "中低風險", riskDesc: "類比晶片巨頭，擁有龐大的工業與汽車客戶群，股息連續增發，具高資本回報率。",
        sellPremium: 0.15, strategyMode: "growth"
    },
    "ABBV": {
        symbol: "ABBV", name: "艾伯維", price: 221.23, eps: 2.05, bps: -3.77, dividend: 6.92, fcf: 22000.00, shares: 1760.00,
        growth1: 6, growth2: 5, terminal: 1.5, discount: 7.0, safety: 10, pe: 26.1, pb: 21.2, rule40Growth: 6, rule40FCFMargin: 35,
        currency: "USD", frequency: 4, riskLevel: "中低風險", riskDesc: "生技製藥巨頭，以 Humira 等重磅藥物聞名，專利保護與股息配發能力極強。",
        sellPremium: 0.15, strategyMode: "dividend"
    },
    "AMGN": {
        symbol: "AMGN", name: "安進", price: 341.66, eps: 14.37, bps: 17.03, dividend: 10.08, fcf: 11000.00, shares: 535.00,
        growth1: 7, growth2: 5, terminal: 1.5, discount: 7.0, safety: 10, pe: 20.7, pb: 25.0, rule40Growth: 7, rule40FCFMargin: 30,
        currency: "USD", frequency: 4, riskLevel: "中風險", riskDesc: "全球生物製藥巨頭，產品管線豐富，現金流穩健，防守型優質配置標的。",
        sellPremium: 0.15, strategyMode: "growth"
    },
    "CVX": {
        symbol: "CVX", name: "雪佛龍", price: 177.58, eps: 5.75, bps: 92.91, dividend: 7.12, fcf: 18000.00, shares: 1850.00,
        growth1: 4, growth2: 3, terminal: 1.0, discount: 7.5, safety: 15, pe: 12.9, pb: 1.76, rule40Growth: 5, rule40FCFMargin: 12,
        currency: "USD", frequency: 4, riskLevel: "中風險", riskDesc: "石化能源巨頭，受油價與地緣政治波動影響，但具備極強的股息與資產負債表保護。",
        sellPremium: 0.15, strategyMode: "dividend"
    },
    "PEP": {
        symbol: "PEP", name: "百事公司", price: 141.59, eps: 6.37, bps: 15.63, dividend: 5.69, fcf: 8200.00, shares: 1370.00,
        growth1: 5, growth2: 4, terminal: 1.5, discount: 6.5, safety: 10, pe: 22.9, pb: 11.0, rule40Growth: 5, rule40FCFMargin: 14,
        currency: "USD", frequency: 4, riskLevel: "低風險", riskDesc: "民生消費巨頭，旗下百事可樂與樂事洋芋片具備極高的品牌定價權與抗衰退能力。",
        sellPremium: 0.12, strategyMode: "dividend"
    }
};

const etfHoldings = {
    "0050": [
        { symbol: "2330.TW", name: "台積電", weight: 55.0 },
        { symbol: "2317.TW", name: "鴻海", weight: 9.0 },
        { symbol: "2454.TW", name: "聯發科", weight: 8.0 },
        { symbol: "2308.TW", name: "台達電", weight: 3.0 },
        { symbol: "2303.TW", name: "聯電", weight: 2.5 }
    ],
    "0052": [
        { symbol: "2330.TW", name: "台積電", weight: 61.0 },
        { symbol: "2317.TW", name: "鴻海", weight: 5.5 },
        { symbol: "2454.TW", name: "聯發科", weight: 5.2 },
        { symbol: "2308.TW", name: "台達電", weight: 3.0 },
        { symbol: "2303.TW", name: "聯電", weight: 2.8 }
    ],
    "006208": [
        { symbol: "2330.TW", name: "台積電", weight: 55.0 },
        { symbol: "2317.TW", name: "鴻海", weight: 9.0 },
        { symbol: "2454.TW", name: "聯發科", weight: 8.0 },
        { symbol: "2308.TW", name: "台達電", weight: 3.0 },
        { symbol: "2303.TW", name: "聯電", weight: 2.5 }
    ],
    "00878": [
        { symbol: "2317.TW", name: "鴻海", weight: 5.0 },
        { symbol: "2454.TW", name: "聯發科", weight: 4.5 },
        { symbol: "2382.TW", name: "廣達", weight: 4.0 },
        { symbol: "2301.TW", name: "光寶科", weight: 3.5 },
        { symbol: "2891.TW", name: "中信金", weight: 3.5 }
    ],
    "00919": [
        { symbol: "2603.TW", name: "長榮", weight: 9.0 },
        { symbol: "2303.TW", name: "聯電", weight: 8.0 },
        { symbol: "2454.TW", name: "聯發科", weight: 7.0 },
        { symbol: "2379.TW", name: "瑞昱", weight: 6.0 },
        { symbol: "3034.TW", name: "聯詠", weight: 6.0 }
    ],
    "00929": [
        { symbol: "2454.TW", name: "聯發科", weight: 8.0 },
        { symbol: "2303.TW", name: "聯電", weight: 7.5 },
        { symbol: "3711.TW", name: "日月光投控", weight: 6.5 },
        { symbol: "3034.TW", name: "聯詠", weight: 6.0 },
        { symbol: "2382.TW", name: "廣達", weight: 5.5 }
    ],
    "00713": [
        { symbol: "2454.TW", name: "聯發科", weight: 6.0 },
        { symbol: "2317.TW", name: "鴻海", weight: 5.5 },
        { symbol: "2891.TW", name: "中信金", weight: 5.0 },
        { symbol: "3045.TW", name: "台灣大", weight: 4.5 },
        { symbol: "2412.TW", name: "中華電", weight: 4.5 }
    ],
    "00940": [
        { symbol: "2603.TW", name: "長榮", weight: 8.0 },
        { symbol: "2454.TW", name: "聯發科", weight: 6.5 },
        { symbol: "2303.TW", name: "聯電", weight: 6.0 },
        { symbol: "3231.TW", name: "緯創", weight: 5.5 },
        { symbol: "2382.TW", name: "廣達", weight: 5.0 }
    ],
    "VOO": [
        { symbol: "MSFT", name: "微軟", weight: 7.0 },
        { symbol: "AAPL", name: "蘋果公司", weight: 6.5 },
        { symbol: "NVDA", name: "輝達", weight: 6.0 },
        { symbol: "AMZN", name: "亞馬遜", weight: 3.8 },
        { symbol: "GOOGL", name: "谷歌", weight: 3.8 }
    ],
    "QQQ": [
        { symbol: "MSFT", name: "微軟", weight: 8.5 },
        { symbol: "AAPL", name: "蘋果公司", weight: 8.2 },
        { symbol: "NVDA", name: "輝達", weight: 7.8 },
        { symbol: "AMZN", name: "亞馬遜", weight: 5.0 },
        { symbol: "AVGO", name: "博通", weight: 4.8 }
    ],
    "SCHD": [
        { symbol: "TXN", name: "德州儀器", weight: 4.5 },
        { symbol: "ABBV", name: "艾伯維", weight: 4.3 },
        { symbol: "AMGN", name: "安進", weight: 4.2 },
        { symbol: "CVX", name: "雪佛龍", weight: 4.0 },
        { symbol: "PEP", name: "百事公司", weight: 4.0 }
    ]
};

// Global chart instance
let valuationChart = null;

// DOM Elements
const selectPreset = document.getElementById("stock-preset");
const inputSymbol = document.getElementById("stock-symbol");
const inputName = document.getElementById("stock-name");
const inputPrice = document.getElementById("current-price");
const inputEps = document.getElementById("input-eps");
const inputBps = document.getElementById("input-bps");
const inputDividend = document.getElementById("input-dividend");
const inputFcf = document.getElementById("input-fcf");
const inputShares = document.getElementById("input-shares");

const sliderGrowth1 = document.getElementById("slider-growth-1");
const sliderGrowth2 = document.getElementById("slider-growth-2");
const sliderTerminal = document.getElementById("slider-terminal");
const sliderDiscount = document.getElementById("slider-discount");
const sliderSafety = document.getElementById("slider-safety");

const valGrowth1 = document.getElementById("val-growth-1");
const valGrowth2 = document.getElementById("val-growth-2");
const valTerminal = document.getElementById("val-terminal");
const valDiscount = document.getElementById("val-discount");
const valSafety = document.getElementById("val-safety");

const inputPe = document.getElementById("input-pe");
const inputPb = document.getElementById("input-pb");

// Output Elements
const displayEps = document.getElementById("display-eps");
const displayBps = document.getElementById("display-bps");
const displayDividend = document.getElementById("display-dividend");
const displayFcf = document.getElementById("display-fcf");
const displayShares = document.getElementById("display-shares");

const badgeSymbol = document.getElementById("badge-symbol");
const badgeName = document.getElementById("badge-name");
const displayPriceNow = document.getElementById("display-price-now");
const displayPriceIntrinsic = document.getElementById("display-price-intrinsic");

const statusRing = document.getElementById("status-ring");
const statusPercent = document.getElementById("status-percent");
const verdictTag = document.getElementById("verdict-tag");
const verdictDesc = document.getElementById("verdict-desc");

const rule40Status = document.getElementById("rule-40-status");
const rule40Bar = document.getElementById("rule-40-bar");
const rule40Detail = document.getElementById("rule-40-detail");

const safetyBuyPrice = document.getElementById("safety-buy-price");
const safetyDiscountPct = document.getElementById("safety-discount-pct");

const calcDcfEl = document.getElementById("calc-dcf");
const calcGrahamEl = document.getElementById("calc-graham");
const calcDdmEl = document.getElementById("calc-ddm");
const calcMultiplierEl = document.getElementById("calc-multiplier");

// Weights inputs
const weightDcfInput = document.getElementById("weight-dcf");
const weightGrahamInput = document.getElementById("weight-graham");
const weightDdmInput = document.getElementById("weight-ddm");
const weightMultInput = document.getElementById("weight-mult");
const weightErrorEl = document.getElementById("weight-error");

// App state
let currentModelWeights = {
    dcf: 40,
    graham: 20,
    ddm: 10,
    mult: 30
};
let currentCurrency = "USD";

const formatCurrency = (val) => {
    if (val === "不適用" || val === null || val === undefined || isNaN(parseFloat(val))) {
        return "不適用";
    }
    const num = parseFloat(val);
    if (currentCurrency === "TWD") {
        return `NT$ ${new Intl.NumberFormat('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num)}`;
    } else {
        return `$ ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)}`;
    }
};

const formatNumber = (val) => {
    return new Intl.NumberFormat('zh-TW').format(Math.round(val));
};

// Load Preset Data into UI
function loadPreset(key) {
    if (key === "custom") {
        return; // Allow editing without resetting
    }
    const data = stockPresets[key];
    if (!data) return;

    inputSymbol.value = data.symbol;
    inputName.value = data.name;
    inputPrice.value = data.price;
    inputEps.value = data.eps;
    inputBps.value = data.bps;
    inputDividend.value = data.dividend;
    inputFcf.value = data.fcf;
    inputShares.value = data.shares;

    sliderGrowth1.value = data.growth1;
    sliderGrowth2.value = data.growth2;
    sliderTerminal.value = data.terminal;
    // CAPM 動態折現率
    const computedDiscount = data.beta ? Math.round((4.2 + data.beta * 5.5) * 10) / 10 : data.discount;
    sliderDiscount.value = computedDiscount;
    sliderSafety.value = data.safety;

    inputPe.value = data.pe;
    inputPb.value = data.pb;

    // Check if ETF to show/hide banner and auto-adjust weights
    const etfBanner = document.getElementById("etf-warning-banner");
    if (data.isETF) {
        if (etfBanner) etfBanner.style.display = "flex";
        weightDcfInput.value = 0;
        weightGrahamInput.value = 0;
        weightDdmInput.value = 50;
        weightMultInput.value = 50;
    } else {
        if (etfBanner) etfBanner.style.display = "none";
        weightDcfInput.value = 40;
        weightGrahamInput.value = 20;
        weightDdmInput.value = 10;
        weightMultInput.value = 30;
    }

    currentCurrency = data.currency || "USD";

    // Synchronize current stock parameters to the DRIP and Compound calculators
    const dripPrice = document.getElementById("drip-price");
    const dripDividend = document.getElementById("drip-dividend");
    const compRate = document.getElementById("comp-rate");
    const dripFrequency = document.getElementById("drip-frequency");
    if (dripPrice) dripPrice.value = data.price;
    if (dripDividend) dripDividend.value = data.dividend;
    if (compRate) compRate.value = data.discount || 8.0;
    if (dripFrequency) dripFrequency.value = data.frequency || 4;

    // Update Slider text displays
    updateSliderLabels();
    
    // Reset valuation river state on preset load
    currentRiverType = 'pe';
    const btnPE = document.getElementById("btn-river-pe");
    const btnPB = document.getElementById("btn-river-pb");
    if (btnPE && btnPB) {
        btnPE.classList.add("active");
        btnPB.classList.remove("active");
        btnPE.style.borderColor = "var(--accent)";
        btnPE.style.background = "rgba(var(--accent-rgb), 0.15)";
        btnPE.style.color = "var(--accent)";
        btnPB.style.borderColor = "var(--border)";
        btnPB.style.background = "rgba(255,255,255,0.05)";
        btnPB.style.color = "var(--text-secondary)";
    }
    cachedRiverData = null;
    if (activeTab === "river") {
        loadRiverData();
    }

    // Perform calculations for all tabs unconditionally to prevent leftover currency symbols in background tabs
    calculateValuation();
    calculateCompoundInterest();
    calculateDRIP();
    updateValuationAlerts();
    updateEtfHoldings(key);
}

// 掃描所有 Presets 並在頂端顯示今日便宜價與均線支撐警報
function updateValuationAlerts() {
    const alertsContainer = document.getElementById("valuation-alerts-container");
    const wrapper = document.getElementById("alerts-list-wrapper");
    if (!alertsContainer || !wrapper) return;

    wrapper.innerHTML = "";
    let alertCount = 0;

    for (const [key, data] of Object.entries(stockPresets)) {
        if (key === "custom") continue;

        const price = data.price;
        const eps = data.eps;
        const bps = data.bps;
        const dividend = data.dividend;
        const fcf = data.fcf;
        const shares = data.shares;
        const g1 = data.growth1 / 100;
        const g2 = data.growth2 / 100;
        const gTerminal = data.terminal / 100;
        const discount = data.discount / 100;
        const safetyMargin = data.safety / 100;
        const pe = data.pe;
        const pb = data.pb;

        // 1. 計算 DCF
        let dcfValue = 0;
        const fcfPerShare = fcf / shares;
        let projectedFcf = fcfPerShare;
        let sumPvOfFcf = 0;
        for (let year = 1; year <= 10; year++) {
            const growth = year <= 5 ? g1 : g2;
            projectedFcf = projectedFcf * (1 + growth);
            sumPvOfFcf += projectedFcf / Math.pow(1 + discount, year);
        }
        let terminalValue = 0;
        if (discount > gTerminal) {
            terminalValue = (projectedFcf * (1 + gTerminal)) / (discount - gTerminal);
        }
        dcfValue = sumPvOfFcf + (terminalValue / Math.pow(1 + discount, 10));
        if (dcfValue < 0) dcfValue = 0;

        // 2. 計算 Graham
        let grahamValue = 0;
        if (eps > 0 && bps > 0) {
            grahamValue = Math.sqrt(22.5 * eps * bps);
        }

        // 3. 計算 DDM
        let ddmValue = 0;
        if (dividend > 0 && discount > gTerminal) {
            ddmValue = (dividend * (1 + gTerminal)) / (discount - gTerminal);
        }

        // 4. 計算 Multiplier
        const multiplierValue = (eps * pe + bps * pb) / 2;

        // 5. 綜合內在價值
        let intrinsic = 0;
        if (data.isETF) {
            intrinsic = (ddmValue * 50 + multiplierValue * 50) / 100;
        } else {
            intrinsic = (dcfValue * 40 + grahamValue * 20 + ddmValue * 10 + multiplierValue * 30) / 100;
        }

        const buyPrice = intrinsic * (1 - safetyMargin);

        let isTriggered = false;
        let alertType = ""; // "value" 或 "support"
        let alertDesc = "";

        if (price > 0 && price <= buyPrice) {
            isTriggered = true;
            alertType = "value";
            alertDesc = "低於便宜價 (超值甜甜價)";
        } else if (price > 0 && data.isETF && price <= (intrinsic * 0.92)) {
            isTriggered = true;
            alertType = "support";
            alertDesc = "跌破均線支撐 (中期買點)";
        } else if (price > 0 && !data.isETF && price <= (intrinsic * 0.90)) {
            isTriggered = true;
            alertType = "support";
            alertDesc = "接近年線支撐 (打折特惠)";
        }

        if (isTriggered) {
            alertCount++;
            const capsule = document.createElement("div");
            capsule.className = `alert-capsule ${alertType}`;
            
            const typeColor = alertType === "value" ? "#34d399" : "#3b82f6";
            const bgOpacity = alertType === "value" ? "rgba(52, 211, 153, 0.12)" : "rgba(59, 130, 246, 0.12)";
            
            capsule.style.display = "inline-flex";
            capsule.style.alignItems = "center";
            capsule.style.gap = "0.35rem";
            capsule.style.padding = "0.35rem 0.65rem";
            capsule.style.borderRadius = "20px";
            capsule.style.fontSize = "0.78rem";
            capsule.style.fontWeight = "600";
            capsule.style.color = typeColor;
            capsule.style.background = bgOpacity;
            capsule.style.border = `1px solid ${typeColor}33`;
            capsule.style.cursor = "pointer";
            capsule.style.transition = "transform 0.2s, background 0.2s";
            
            capsule.innerHTML = `
                <i data-lucide="${alertType === 'value' ? 'sparkles' : 'trending-down'}" style="width:0.85rem; height:0.85rem;"></i>
                <span>${data.name} (${data.symbol.replace(".TW", "")}): ${alertDesc}</span>
            `;
            
            capsule.addEventListener("mouseenter", () => {
                capsule.style.transform = "translateY(-2px)";
                capsule.style.background = alertType === "value" ? "rgba(52, 211, 153, 0.2)" : "rgba(59, 130, 246, 0.2)";
            });
            capsule.addEventListener("mouseleave", () => {
                capsule.style.transform = "translateY(0)";
                capsule.style.background = bgOpacity;
            });
            
            capsule.addEventListener("click", () => {
                selectPreset.value = key;
                loadPreset(key);
                document.querySelector(".summary-dashboard").scrollIntoView({ behavior: 'smooth' });
            });

            wrapper.appendChild(capsule);
        }
    }

    if (alertCount > 0) {
        alertsContainer.style.display = "flex";
        alertsContainer.style.flexDirection = "column";
        alertsContainer.style.gap = "0.6rem";
        alertsContainer.style.background = "rgba(236, 72, 153, 0.04)";
        alertsContainer.style.border = "1px dashed rgba(236, 72, 153, 0.25)";
        alertsContainer.style.borderRadius = "12px";
        alertsContainer.style.padding = "0.85rem";
        alertsContainer.style.marginBottom = "1rem";
        
        const header = alertsContainer.querySelector(".alerts-header");
        if (header) {
            header.style.display = "flex";
            header.style.alignItems = "center";
            header.style.gap = "0.4rem";
            header.style.fontSize = "0.88rem";
            header.style.color = "var(--text-primary)";
        }
        
        wrapper.style.display = "flex";
        wrapper.style.flexWrap = "wrap";
        wrapper.style.gap = "0.5rem";
        
        if (window.lucide) window.lucide.createIcons();
    } else {
        alertsContainer.style.display = "none";
    }
}

// 實作 ETF 成分股深度透視與穿透估值計算
function updateEtfHoldings(key) {
    const panel = document.getElementById("etf-holdings-panel");
    const grid = document.getElementById("etf-holdings-grid");
    const bar = document.getElementById("etf-health-bar");
    const text = document.getElementById("etf-health-score-text");
    
    if (!panel || !grid) return;
    
    const holdings = etfHoldings[key];
    if (!holdings) {
        panel.style.display = "none";
        return;
    }
    
    panel.style.display = "block";
    grid.innerHTML = "";
    
    let totalWeightUsed = 0;
    let weightedScoreSum = 0;
    
    holdings.forEach(item => {
        const compPresetKey = item.symbol.replace(".TW", "");
        const preset = stockPresets[compPresetKey];
        
        let price = preset ? preset.price : 0;
        let statusText = "計算中";
        let statusColor = "#94a3b8";
        let healthFactor = 80;
        
        if (preset) {
            const eps = preset.eps;
            const bps = preset.bps;
            const dividend = preset.dividend;
            const fcf = preset.fcf;
            const shares = preset.shares;
            const g1 = preset.growth1 / 100;
            const g2 = preset.growth2 / 100;
            const gTerminal = preset.terminal / 100;
            const discount = preset.discount / 100;
            const safetyMargin = preset.safety / 100;
            const pe = preset.pe;
            const pb = preset.pb;
            const sellPremium = preset.sellPremium || 0.2;
            
            // DCF
            let dcfValue = 0;
            const fcfPerShare = fcf / shares;
            let projectedFcf = fcfPerShare;
            let sumPvOfFcf = 0;
            for (let year = 1; year <= 10; year++) {
                const growth = year <= 5 ? g1 : g2;
                projectedFcf = projectedFcf * (1 + growth);
                sumPvOfFcf += projectedFcf / Math.pow(1 + discount, year);
            }
            let terminalValue = 0;
            if (discount > gTerminal) {
                terminalValue = (projectedFcf * (1 + gTerminal)) / (discount - gTerminal);
            }
            dcfValue = sumPvOfFcf + (terminalValue / Math.pow(1 + discount, 10));
            if (dcfValue < 0) dcfValue = 0;
            
            // Graham
            let grahamValue = 0;
            if (eps > 0 && bps > 0) {
                grahamValue = Math.sqrt(22.5 * eps * bps);
            }
            
            // DDM
            let ddmValue = 0;
            if (dividend > 0 && discount > gTerminal) {
                ddmValue = (dividend * (1 + gTerminal)) / (discount - gTerminal);
            }
            
            // Multiplier
            const multiplierValue = (eps * pe + bps * pb) / 2;
            
            const intrinsic = (dcfValue * 0.4 + grahamValue * 0.2 + ddmValue * 0.1 + multiplierValue * 0.3);
            const buyPrice = intrinsic * (1 - safetyMargin);
            const sellPrice = intrinsic * (1 + sellPremium);
            
            price = preset.price;
            
            if (price <= buyPrice) {
                statusText = "便宜 🟢";
                statusColor = "#34d399";
                healthFactor = 100;
            } else if (price > buyPrice && price <= sellPrice) {
                statusText = "合理 🔵";
                statusColor = "#60a5fa";
                healthFactor = 80;
            } else {
                statusText = "偏高 🔴";
                statusColor = "#f87171";
                healthFactor = 40;
            }
        }
        
        totalWeightUsed += item.weight;
        weightedScoreSum += (item.weight * healthFactor);
        
        const card = document.createElement("div");
        card.style.background = "rgba(255, 255, 255, 0.02)";
        card.style.border = "1px solid rgba(255, 255, 255, 0.05)";
        card.style.borderRadius = "8px";
        card.style.padding = "0.75rem";
        card.style.display = "flex";
        card.style.flexDirection = "column";
        card.style.justifyContent = "space-between";
        card.style.gap = "0.25rem";
        
        const currencySym = key === "VOO" || key === "QQQ" || key === "SCHD" ? "$" : "NT$";
        const formattedPrice = price > 0 ? `${currencySym} ${price.toFixed(1)}` : "載入中";
        
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:700; font-size:0.88rem; color:var(--text-primary);">${item.name}</span>
                <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">${item.weight.toFixed(1)}%</span>
            </div>
            <div style="font-size:0.75rem; color:var(--text-secondary); margin-bottom:0.15rem;">${item.symbol}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed rgba(255,255,255,0.05); padding-top:0.35rem; margin-top:0.15rem;">
                <span style="font-size:0.8rem; font-family:'Outfit',sans-serif; color:var(--text-muted);">${formattedPrice}</span>
                <span style="font-size:0.78rem; font-weight:700; color:${statusColor};">${statusText}</span>
            </div>
        `;
        
        grid.appendChild(card);
    });
    
    let finalScore = 80;
    if (totalWeightUsed > 0) {
        finalScore = Math.round(weightedScoreSum / totalWeightUsed);
    }
    
    if (bar && text) {
        bar.style.width = `${finalScore}%`;
        
        let scoreText = "";
        let scoreColor = "#10b981";
        
        if (finalScore >= 85) {
            scoreText = `${finalScore} 分 (持股估值極為安全 🟢)`;
            scoreColor = "#34d399";
            bar.style.background = "linear-gradient(90deg, #34d399, #60a5fa)";
        } else if (finalScore >= 70) {
            scoreText = `${finalScore} 分 (持股估值十分合理 🔵)`;
            scoreColor = "#60a5fa";
            bar.style.background = "linear-gradient(90deg, #60a5fa, #3b82f6)";
        } else {
            scoreText = `${finalScore} 分 (成分股估值偏高，注意回檔 🔴)`;
            scoreColor = "#f87171";
            bar.style.background = "linear-gradient(90deg, #f87171, #fb923c)";
        }
        
        text.textContent = scoreText;
        text.style.color = scoreColor;
    }
}


// Update slider labels based on current values
function updateSliderLabels() {
    valGrowth1.textContent = `${sliderGrowth1.value}%`;
    valGrowth2.textContent = `${sliderGrowth2.value}%`;
    valTerminal.textContent = `${sliderTerminal.value}%`;
    valDiscount.textContent = `${sliderDiscount.value}%`;
    valSafety.textContent = `${sliderSafety.value}%`;
}

// Core Valuations Math
function calculateValuation() {
    // Determine dynamic currency based on preset or ticker symbol
    const symbol = inputSymbol.value;
    const activePreset = stockPresets[selectPreset.value];
    if (selectPreset.value !== "custom" && activePreset) {
        currentCurrency = activePreset.currency || "USD";
    } else {
        // Fallback for custom ticker: if ends with .TW, TWD, else USD
        currentCurrency = symbol.toUpperCase().endsWith(".TW") ? "TWD" : "USD";
    }

    const cSymbol = currentCurrency === "TWD" ? "NT$" : "$";
    
    // Update labels dynamic currencies
    const lblCurrentPrice = document.getElementById("lbl-current-price");
    const lblEps = document.getElementById("lbl-eps");
    const lblBps = document.getElementById("lbl-bps");
    const lblDividend = document.getElementById("lbl-dividend");
    const lblFcf = document.getElementById("lbl-fcf");
    
    if (lblCurrentPrice) lblCurrentPrice.textContent = `當前股價 (${cSymbol})`;
    if (lblEps) lblEps.textContent = `每股盈餘 (EPS, ${cSymbol})`;
    if (lblBps) lblBps.textContent = `每股淨值 (BPS, ${cSymbol})`;
    if (lblDividend) lblDividend.textContent = `預期股利 (${cSymbol})`;
    if (lblFcf) lblFcf.textContent = `自由現金流 (FCF, 百萬 ${cSymbol})`;

    // 1. Gather values from UI
    const price = parseFloat(inputPrice.value) || 0;
    const eps = parseFloat(inputEps.value) || 0;
    const bps = parseFloat(inputBps.value) || 0;
    const dividend = parseFloat(inputDividend.value) || 0;
    const fcf = parseFloat(inputFcf.value) || 0;
    const shares = parseFloat(inputShares.value) || 1;

    const g1 = (parseFloat(sliderGrowth1.value) || 0) / 100;
    const g2 = (parseFloat(sliderGrowth2.value) || 0) / 100;
    const gTerminal = (parseFloat(sliderTerminal.value) || 0) / 100;
    const discount = (parseFloat(sliderDiscount.value) || 0) / 100;
    const safetyMargin = (parseFloat(sliderSafety.value) || 0) / 100;

    const pe = parseFloat(inputPe.value) || 0;
    const pb = parseFloat(inputPb.value) || 0;

    // Update basic display stats
    displayEps.textContent = formatCurrency(eps);
    displayBps.textContent = formatCurrency(bps);
    displayDividend.textContent = formatCurrency(dividend);
    displayFcf.textContent = formatNumber(fcf);
    displayShares.textContent = formatNumber(shares);

    badgeSymbol.textContent = inputSymbol.value;
    badgeName.textContent = inputName.value;
    displayPriceNow.textContent = formatCurrency(price);

    // ==========================================
    // CAPM & Piotroski UI Updates
    // ==========================================
    const currentPresetKey = selectPreset.value;
    const isETFSelected = stockPresets[currentPresetKey] ? stockPresets[currentPresetKey].isETF : false;
    
    const defaultPiotroski = isETFSelected 
        ? { score: 7, details: [true, true, true, true, true, true, true, false, false] }
        : { score: 6, details: [true, true, true, false, true, true, true, false, false] };
        
    const pData = (activePreset && activePreset.piotroski) ? activePreset.piotroski : defaultPiotroski;
    const currentBeta = (activePreset && activePreset.beta) ? activePreset.beta : 1.0;
    
    // 渲染 F-Score Badge 與 9 個亮燈
    const fscoreBadge = document.getElementById("fscore-badge");
    if (fscoreBadge) {
        fscoreBadge.textContent = `${pData.score} / 9`;
        if (pData.score >= 7) {
            fscoreBadge.style.color = "#34d399";
            fscoreBadge.style.background = "rgba(52, 211, 153, 0.12)";
            fscoreBadge.style.border = "1px solid rgba(52, 211, 153, 0.25)";
        } else if (pData.score <= 4) {
            fscoreBadge.style.color = "#f87171";
            fscoreBadge.style.background = "rgba(239, 68, 68, 0.12)";
            fscoreBadge.style.border = "1px solid rgba(239, 68, 68, 0.25)";
        } else {
            fscoreBadge.style.color = "#fbbf24";
            fscoreBadge.style.background = "rgba(245, 158, 11, 0.12)";
            fscoreBadge.style.border = "1px solid rgba(245, 158, 11, 0.25)";
        }
    }
    
    for (let i = 1; i <= 9; i++) {
        const dot = document.getElementById(`f-dot-${i}`);
        if (dot) {
            if (pData.details[i - 1]) {
                dot.style.background = "rgba(52, 211, 153, 0.15)";
                dot.style.color = "#34d399";
                dot.style.border = "1px solid rgba(52, 211, 153, 0.3)";
            } else {
                dot.style.background = "rgba(255, 255, 255, 0.02)";
                dot.style.color = "var(--text-muted)";
                dot.style.border = "1px solid rgba(255, 255, 255, 0.05)";
            }
        }
    }
    
    // 渲染 CAPM 資訊
    const capmDiscountEl = document.getElementById("capm-discount-label");
    const capmBetaEl = document.getElementById("capm-beta-value");
    const computedDiscountVal = Math.round((4.2 + currentBeta * 5.5) * 10) / 10;
    
    if (capmDiscountEl) capmDiscountEl.textContent = `${computedDiscountVal}%`;
    if (capmBetaEl) capmBetaEl.textContent = currentBeta.toFixed(2);

    // ==========================================
    // Reusable Single-Scenario Valuation function
    // ==========================================
    function computeScenarioValuation(growth1Rate, growth2Rate, termRate, discRate) {
        // Model A: DCF
        let dcf = 0;
        const fcfPerShare = fcf / shares;
        let projFcf = fcfPerShare;
        let sumFcf = 0;
        for (let year = 1; year <= 10; year++) {
            const g = year <= 5 ? growth1Rate : growth2Rate;
            projFcf = projFcf * (1 + g);
            sumFcf += projFcf / Math.pow(1 + discRate, year);
        }
        let termVal = 0;
        if (discRate > termRate) {
            termVal = (projFcf * (1 + termRate)) / (discRate - termRate);
        }
        dcf = sumFcf + (termVal / Math.pow(1 + discRate, 10));
        if (dcf < 0) dcf = 0;

        // Model B: Graham
        let graham = 0;
        if (eps > 0 && bps > 0) {
            graham = Math.sqrt(22.5 * eps * bps);
        }

        // Model C: DDM
        let ddm = 0;
        if (dividend > 0 && discRate > termRate) {
            ddm = (dividend * (1 + termRate)) / (discRate - termRate);
        }

        // Model D: Multipliers
        const peVal = eps * pe;
        const pbVal = bps * pb;
        const mult = (peVal + pbVal) / 2;

        // Display Base case details on the UI
        if (growth1Rate === g1 && discRate === discount) {
            calcDcfEl.textContent = isETFSelected ? "不適用" : formatCurrency(dcf);
            calcGrahamEl.textContent = isETFSelected ? "不適用" : formatCurrency(graham);
            calcDdmEl.textContent = dividend <= 0 ? "不適用 (無配息)" : formatCurrency(ddm);
            calcMultiplierEl.textContent = formatCurrency(mult);
            
            // Model E: EPV (Zero-Growth Benchmark)
            const epvVal = isETFSelected ? (dividend / discRate) : (eps / discRate);
            const calcEpvEl = document.getElementById("calc-epv");
            if (calcEpvEl) {
                calcEpvEl.textContent = epvVal <= 0 ? "不適用" : formatCurrency(epvVal);
            }
        }

        const wDcf = parseInt(weightDcfInput.value) || 0;
        const wGraham = parseInt(weightGrahamInput.value) || 0;
        const wDdm = parseInt(weightDdmInput.value) || 0;
        const wMult = parseInt(weightMultInput.value) || 0;
        
        return (dcf * wDcf + graham * wGraham + ddm * wDdm + mult * wMult) / 100;
    }

    // ==========================================
    // Multi-Scenario Analysis Calculation
    // ==========================================
    const wDcf = parseInt(weightDcfInput.value) || 0;
    const wGraham = parseInt(weightGrahamInput.value) || 0;
    const wDdm = parseInt(weightDdmInput.value) || 0;
    const wMult = parseInt(weightMultInput.value) || 0;
    const totalWeight = wDcf + wGraham + wDdm + wMult;

    let intrinsicValue = 0;

    if (totalWeight !== 100) {
        weightErrorEl.textContent = `❌ 權重總和為 ${totalWeight}%，必須為 100%`;
        displayPriceIntrinsic.textContent = "無法計算";
        displayPriceIntrinsic.style.color = "var(--text-muted)";
        return;
    }

    weightErrorEl.textContent = "";

    // 1. 基準情境 (Base, 50% 機率)
    const valBase = computeScenarioValuation(g1, g2, gTerminal, discount);

    // 2. 悲觀情境 (Bear, 20% 機率)
    const valBear = computeScenarioValuation(g1 * 0.50, g2 * 0.50, gTerminal * 0.80, discount + 0.015);

    // 3. 樂觀情境 (Bull, 30% 機率)
    const valBull = computeScenarioValuation(g1 * 1.30, g2 * 1.30, gTerminal * 1.20, discount - 0.010);

    // 4. 機率加權綜合內在價值
    intrinsicValue = (valBear * 20 + valBase * 50 + valBull * 30) / 100;

    // 5. 渲染多情境 UI
    const valBearEl = document.getElementById("val-bear");
    const valBaseEl = document.getElementById("val-base");
    const valBullEl = document.getElementById("val-bull");
    const valBearLabel = document.getElementById("val-bear-label");
    const valBullLabel = document.getElementById("val-bull-label");
    const rangeBar = document.getElementById("val-range-bar");

    if (valBearEl) valBearEl.textContent = formatCurrency(valBear);
    if (valBaseEl) valBaseEl.textContent = formatCurrency(valBase);
    if (valBullEl) valBullEl.textContent = formatCurrency(valBull);
    if (valBearLabel) valBearLabel.textContent = formatCurrency(valBear);
    if (valBullLabel) valBullLabel.textContent = formatCurrency(valBull);
    
    if (rangeBar) {
        const rangePct = valBull > valBear ? ((valBase - valBear) / (valBull - valBear)) * 100 : 50;
        rangeBar.style.left = "0%";
        rangeBar.style.width = `${Math.min(100, Math.max(0, rangePct))}%`;
    }

    displayPriceIntrinsic.textContent = formatCurrency(intrinsicValue);
    displayPriceIntrinsic.style.color = "";


    // ==========================================
    // Rule of 40 Analysis
    // ==========================================
    // FCF margin calculation: FCF / Revenue. If we don't have Revenue, we look at the preset, otherwise estimate based on EPS & PE
    let r40Score = 0;
    if (activePreset && selectPreset.value !== "custom") {
        r40Score = activePreset.rule40Growth + activePreset.rule40FCFMargin;
        rule40Detail.textContent = `營收成長率 (${activePreset.rule40Growth}%) + FCF利潤率 (${activePreset.rule40FCFMargin}%) = ${r40Score}%`;
    } else {
        // Mock standard rule of 40 for custom stock: estimate FCF Margin as 20%, Growth as 1.5 * g1 * 100
        const estimatedFCFMargin = 20; 
        const estimatedGrowth = Math.max(0, Math.round(g1 * 100));
        r40Score = estimatedGrowth + estimatedFCFMargin;
        rule40Detail.textContent = `預估營收成長率 (${estimatedGrowth}%) + 預估FCF利潤率 (${estimatedFCFMargin}%) = ${r40Score}%`;
    }

    rule40Bar.style.width = `${Math.min(100, r40Score)}%`;
    if (r40Score >= 40) {
        rule40Status.textContent = "符合";
        rule40Status.className = "indicator-status badge-pass";
        rule40Bar.style.background = "linear-gradient(90deg, #10b981, #34d399)";
    } else {
        rule40Status.textContent = "未達標";
        rule40Status.className = "indicator-status badge-fail";
        rule40Bar.style.background = "linear-gradient(90deg, #ef4444, #f87171)";
    }

    // ==========================================
    // Margin of Safety & Risk Trade Decision UI updates
    // ==========================================
    const targetBuyPrice = intrinsicValue * (1 - safetyMargin);
    safetyBuyPrice.textContent = formatCurrency(targetBuyPrice);
    safetyDiscountPct.textContent = `${sliderSafety.value}%`;

    // 1. Determine risk parameters based on preset or custom logic
    let riskLevel = "中風險";
    let riskDesc = "自訂輸入標的。請根據設定的財務指標與期望報酬率評估其風險。";
    let sellPremium = 0.20; // Default 20% premium for sell suggestion

    if (selectPreset.value !== "custom" && activePreset) {
        riskLevel = activePreset.riskLevel || "中風險";
        riskDesc = activePreset.riskDesc || "";
        sellPremium = activePreset.sellPremium !== undefined ? activePreset.sellPremium : 0.20;
    } else {
        // Custom dynamic logic
        const isCustomETF = symbol.toUpperCase().endsWith(".TW") && 
            (symbol.startsWith("0050") || symbol.startsWith("0056") || symbol.startsWith("00878") || symbol.startsWith("00919") || symbol.startsWith("00929") || symbol.startsWith("006208"));
        
        if (isETFSelected || isCustomETF) {
            riskLevel = "低風險";
            riskDesc = "自訂 ETF 標的。通常具有高分散性，波動度低，適合長期資產配置或定期定額。";
            sellPremium = 0.12;
        } else if (g1 > 0.25 || pe > 40) {
            riskLevel = "高風險";
            riskDesc = "自訂高成長或高乘數標的。預期成長率或合理本益比偏高，市場情緒影響大，股價波動風險顯著。";
            sellPremium = 0.30;
        } else if (g1 < 0.10 && pe < 20) {
            riskLevel = "低風險";
            riskDesc = "自訂價值保守型標的。成長預期溫和，但估值乘數在合理安全區間，防禦性格強。";
            sellPremium = 0.15;
        } else {
            riskLevel = "中風險";
            riskDesc = "自訂標準型企業。各項財務與估值指標均在合理中游水平，波動度溫和。";
            sellPremium = 0.20;
        }
    }

    // 2. Calculate trade targets
    const buyPrice = targetBuyPrice; // Synchronized with safety-margin discounted price
    const sellPrice = intrinsicValue * (1 + sellPremium);

    // 3. Update DOM Elements
    const badgeRisk = document.getElementById("stock-risk-badge");
    const descRisk = document.getElementById("stock-risk-desc");
    const tradeBuyEl = document.getElementById("trade-buy-price");
    const tradeSellEl = document.getElementById("trade-sell-price");
    const tradeTipEl = document.getElementById("trade-action-tip");

    if (badgeRisk) {
        badgeRisk.textContent = riskLevel;
        if (riskLevel === "低風險") {
            badgeRisk.style.color = "#34d399";
            badgeRisk.style.background = "rgba(16, 185, 129, 0.15)";
            badgeRisk.style.border = "1px solid rgba(16, 185, 129, 0.25)";
        } else if (riskLevel.includes("高") || riskLevel.includes("特高")) {
            badgeRisk.style.color = "#f87171";
            badgeRisk.style.background = "rgba(239, 68, 68, 0.15)";
            badgeRisk.style.border = "1px solid rgba(239, 68, 68, 0.25)";
        } else {
            badgeRisk.style.color = "#fbbf24";
            badgeRisk.style.background = "rgba(245, 158, 11, 0.15)";
            badgeRisk.style.border = "1px solid rgba(245, 158, 11, 0.25)";
        }
    }
    if (descRisk) descRisk.textContent = riskDesc;
    if (tradeBuyEl) tradeBuyEl.textContent = formatCurrency(buyPrice);
    if (tradeSellEl) tradeSellEl.textContent = formatCurrency(sellPrice);

    if (tradeTipEl) {
        if (price < buyPrice) {
            tradeTipEl.innerHTML = `<i data-lucide="check" style="width:0.85rem; height:0.85rem; display:inline-block; vertical-align:middle; margin-right:0.2rem;"></i>當前市價已跌入安全買進區，安全邊際充足！`;
            tradeTipEl.style.color = "#34d399";
        } else if (price > sellPrice) {
            tradeTipEl.innerHTML = `<i data-lucide="trending-down" style="width:0.85rem; height:0.85rem; display:inline-block; vertical-align:middle; margin-right:0.2rem;"></i>當前市價已高於建議賣出價，溢價過高，建議部分分批獲利了結。`;
            tradeTipEl.style.color = "#f87171";
        } else {
            tradeTipEl.innerHTML = `<i data-lucide="arrow-right-left" style="width:0.85rem; height:0.85rem; display:inline-block; vertical-align:middle; margin-right:0.2rem;"></i>當前市價介於買賣合理區間，適合持續持有或定期定額。`;
            tradeTipEl.style.color = "#c084fc";
        }
    }

    // Margin of Safety percentage indicator (how much current price is discounted relative to intrinsic value)
    let discountPct = 0;
    if (intrinsicValue > 0) {
        discountPct = ((intrinsicValue - price) / intrinsicValue) * 100;
    }

    // Set ring conic gradient and styles
    statusPercent.textContent = `${discountPct > 0 ? '+' : ''}${discountPct.toFixed(1)}%`;
    
    // conic gradient coloring
    let ringColor = "var(--warning)";
    if (discountPct >= (safetyMargin * 100)) {
        // High margin of safety (undervalued)
        ringColor = "var(--success)";
        verdictTag.textContent = "安全邊際充足 (推薦買入)";
        verdictTag.className = "verdict-tag verdict-undervalued";
        verdictDesc.textContent = `當前股價低於合理買入價 ${formatCurrency(targetBuyPrice)}，具備極佳的安全防護與上行空間。`;
    } else if (discountPct >= 0) {
        // Fair value
        ringColor = "var(--warning)";
        verdictTag.textContent = "合理價區間 (建議持有)";
        verdictTag.className = "verdict-tag verdict-fair";
        verdictDesc.textContent = `當前股價接近內在價值，安全邊際稍微不足。適合定期定額或繼續持有。`;
    } else {
        // Overvalued
        ringColor = "var(--danger)";
        verdictTag.textContent = "溢價過高 (建議觀望)";
        verdictTag.className = "verdict-tag verdict-overvalued";
        verdictDesc.textContent = `當前股價高於估算內在價值。建議保持耐心，等待市場回檔、安全邊際出現後再佈局。`;
    }

    // Update conic gradient: positive discount fills green/yellow, negative fills red
    const degree = Math.min(360, Math.max(0, (discountPct + 50) * 3.6)); // maps [-50%, 50%] to [0, 360] deg
    statusRing.style.background = `conic-gradient(${ringColor} ${degree}deg, rgba(255, 255, 255, 0.05) 0deg)`;

    // Dynamic Hot/ETF notices
    const isHotSelected = stockPresets[currentPresetKey] ? stockPresets[currentPresetKey].isHot : false;
    const hotReasonText = stockPresets[currentPresetKey] ? stockPresets[currentPresetKey].hotReason : "";
    if (isHotSelected && hotReasonText) {
        verdictDesc.innerHTML = `${verdictDesc.textContent}<br><span style="display:inline-block; margin-top:0.5rem; color:#a855f7; font-weight:600;"><i data-lucide="sparkles" style="width:0.9rem; height:0.9rem; display:inline-block; vertical-align:middle; margin-right:0.25rem;"></i>熱門焦點：${hotReasonText}</span>`;
    } else if (isETFSelected && stockPresets[currentPresetKey]) {
        verdictDesc.innerHTML = `${verdictDesc.textContent}<br><span style="display:inline-block; margin-top:0.5rem; color:#6366f1; font-weight:600;"><i data-lucide="info" style="width:0.9rem; height:0.9rem; display:inline-block; vertical-align:middle; margin-right:0.25rem;"></i>ETF 特性：${stockPresets[currentPresetKey].etfDesc}</span>`;
    }

    // 永遠在最下方加入牛頓非理性市場警示
    verdictDesc.innerHTML += `<br><span class="newton-quote" style="display:inline-block; margin-top:0.6rem; padding:0.4rem 0.6rem; background:rgba(245, 158, 11, 0.06); border:1px solid rgba(245, 158, 11, 0.15); border-radius:8px; color:#f59e0b; font-size:0.78rem; line-height:1.45; text-align:left;"><i data-lucide="lightbulb" style="width:0.8rem; height:0.8rem; display:inline-block; vertical-align:middle; margin-right:0.25rem;"></i><strong>投資智慧：</strong>「我可以計算出天體的運行軌跡，卻無法計算出人類的瘋狂。」—— 艾薩克·牛頓。當市場處於狂熱泡沫或非理性時期，估值模型僅供錨定價值底線，請務必嚴守安全邊際。</span>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // ==========================================
    // Long-term Investment Strategy & Execution Advice UI updates
    // ==========================================
    let strategyMode = "growth";
    if (selectPreset.value !== "custom" && activePreset) {
        strategyMode = activePreset.strategyMode || "growth";
    } else {
        // Custom dynamic logic
        const isCustomETF = symbol.toUpperCase().endsWith(".TW") && 
            (symbol.startsWith("0050") || symbol.startsWith("0056") || symbol.startsWith("00878") || symbol.startsWith("00919") || symbol.startsWith("00929") || symbol.startsWith("006208") || symbol.startsWith("00713") || symbol.startsWith("00940"));
        
        if (isETFSelected || isCustomETF) {
            const yieldRate = price > 0 ? (dividend / price) : 0;
            if (yieldRate >= 0.04) {
                strategyMode = "dividend";
            } else {
                strategyMode = "index";
            }
        } else {
            if (g1 >= 0.15) {
                strategyMode = "growth";
            } else {
                strategyMode = "growth"; // Default to growth/value individuals
            }
        }
    }

    let strategyName = "";
    let strategyDescText = "";
    let strategyExecText = "";
    let strategyLongtermText = "";

    if (strategyMode === "growth") {
        strategyName = "🚀 高成長 AI 股模式";
        strategyDescText = "此標的具備極強的獲利與營收增長爆發力，估值常享有較高溢價。然而，由於市場預期極高，股價受財報與宏觀情緒影響劇烈，回檔幅度通常較大。";
        strategyExecText = "不宜在歷史高點一次性追高。建議採取「拉回分批佈局」或「定期定額 (DCA)」。當股價拉回至建議買進價（安全邊際價）或以下，可分批（例如每次 15%~20% 資金）金字塔式逢低買入；當股價大幅超越建議賣出價時，建議部分獲利了結。";
        strategyLongtermText = "適合 1~3 年的動態成長追蹤。每季應嚴格檢視其營收年增率、毛利率與營業利益率，確認其成長軌跡未發生重大質變，並隨時根據最新盈餘與 FCF 修正估值水準。";
    } else if (strategyMode === "index") {
        strategyName = "📈 大盤指數市值型 ETF 模式";
        strategyDescText = "此標的追蹤整體市場大盤（如標普500、台股前50大企業等），代表整體國運與產業科技發展，長期走勢穩健向上。下行風險低，具備高度市場分散性。";
        strategyExecText = "最實用的操作是「無視短期股價波動，每月定期定額 (DCA) 買入」。若市場發生恐慌性修正、導致股價跌破建議買進價時，是極佳的金字塔式手動大幅加碼契機（例如下跌愈多，扣款金額愈大）。";
        strategyLongtermText = "適合 10 年以上的超長期資產配置。利用標的本身的自動汰弱留強機制，享受整體市場的雪球複利效果，無須因短期市場恐慌而輕易賣出，是累積長期淨值資產的核心。";
    } else if (strategyMode === "dividend") {
        strategyName = "💰 高股息定存存股型模式";
        strategyDescText = "此標的以提供穩定且高於大盤平均的現金流為核心目的。其股價波動通常相對溫和，投資的核心目標在於「累積持有總股數/張數」，而非賺取高額資本利得。";
        strategyExecText = "每季或每月「除息日後」通常伴隨股價回檔，是極佳的介入買點。此外，收到股息後，強烈建議在數日內執行「無腦立刻再投資 (DRIP)」，將股息全部買回原標的，以發揮股數複利增值威力。";
        strategyLongtermText = "長期持有策略應將重點放在「累積總股數/張數」，股息再投資是資產滾動的關鍵引擎。除非標的基本面變質、成分股篩選規則重大變更，否則應維持長期存股滾存。";
    }

    const nameEl = document.getElementById("strategy-mode-name");
    const descEl = document.getElementById("strategy-mode-desc");
    const execEl = document.getElementById("strategy-execution");
    const ltEl = document.getElementById("strategy-longterm");

    if (nameEl) nameEl.textContent = strategyName;
    if (descEl) descEl.textContent = strategyDescText;
    if (execEl) execEl.textContent = strategyExecText;
    if (ltEl) ltEl.textContent = strategyLongtermText;

    // ==========================================
    // Update Chart.js Visualization
    // ==========================================
    updateValuationChart(price, intrinsicValue, isETFSelected ? 0 : dcfValue, isETFSelected ? 0 : grahamValue, ddmValue, multiplierValue);
}

// Chart.js Manager
function updateValuationChart(currentPrice, intrinsicValue, dcf, graham, ddm, multiplier) {
    const ctx = document.getElementById('valuationChart').getContext('2d');
    
    const chartData = {
        labels: ['當前市價', '綜合內在價值', 'DCF 估值', '葛拉漢公式', '股利折現 (DDM)', '乘數估值'],
        datasets: [{
            label: `股票估值對比 (${currentCurrency === "TWD" ? "NT$" : "$"})`,
            data: [currentPrice, intrinsicValue, dcf, graham, ddm, multiplier],
            backgroundColor: [
                'rgba(248, 250, 252, 0.15)', // 當前市價
                'rgba(99, 102, 241, 0.85)',  // 綜合內在價值
                'rgba(99, 102, 241, 0.45)',  // DCF
                'rgba(139, 92, 246, 0.45)',  // Graham
                'rgba(236, 72, 153, 0.45)',  // DDM
                'rgba(6, 182, 212, 0.45)'    // Multipliers
            ],
            borderColor: [
                'rgba(248, 250, 252, 0.5)',
                'rgba(99, 102, 241, 1)',
                '#6366f1',
                '#8b5cf6',
                '#ec4899',
                '#06b6d4'
            ],
            borderWidth: 1.5,
            borderRadius: 6,
            borderSkipped: false
        }]
    };

    if (valuationChart) {
        // Update data and refresh
        valuationChart.data = chartData;
        valuationChart.update();
    } else {
        // Create new chart
        valuationChart = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleFont: { family: 'Outfit', size: 13 },
                        bodyFont: { family: 'Inter', size: 12 },
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return ` 價值: ${formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: { family: 'Outfit', size: 11 }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: { family: 'Inter', size: 11 }
                        }
                    }
                }
            }
        });
    }
}

// Event Listeners
selectPreset.addEventListener("change", (e) => {
    loadPreset(e.target.value);
});

// Update calculation on user typing inside inputs
const inputs = [
    inputSymbol, inputName, inputPrice, inputEps, inputBps, inputDividend, inputFcf, inputShares,
    inputPe, inputPb, weightDcfInput, weightGrahamInput, weightDdmInput, weightMultInput
];

inputs.forEach(input => {
    input.addEventListener("input", () => {
        // If user modifies inputs manually, set selector to "custom"
        if (selectPreset.value !== "custom") {
            // Check if matches preset values, if not, set to Custom
            selectPreset.value = "custom";
        }
        calculateValuation();
    });
});

// Sliders event listener
const sliders = [sliderGrowth1, sliderGrowth2, sliderTerminal, sliderDiscount, sliderSafety];
sliders.forEach(slider => {
    slider.addEventListener("input", () => {
        if (selectPreset.value !== "custom") {
            selectPreset.value = "custom";
        }
        updateSliderLabels();
        calculateValuation();
    });
});

// Weights update validation
[weightDcfInput, weightGrahamInput, weightDdmInput, weightMultInput].forEach(wInput => {
    wInput.addEventListener("change", () => {
        calculateValuation();
    });
});

// API Refresh Handler
const btnRefresh = document.getElementById("btn-api-refresh");
const lblTimestamp = document.getElementById("update-timestamp");

// 將獲取到的資料合併到 stockPresets 的統一函數
function mergeRealtimeData(data) {
    for (const [key, val] of Object.entries(data)) {
        const presetKey = key.endsWith(".TW") ? key.replace(".TW", "") : key;
        if (stockPresets[presetKey]) {
            stockPresets[presetKey].price = val.price;
            stockPresets[presetKey].eps = val.eps;
            stockPresets[presetKey].bps = val.bps;
            stockPresets[presetKey].dividend = val.dividend;
            stockPresets[presetKey].fcf = val.fcf;
            stockPresets[presetKey].shares = val.shares;
            stockPresets[presetKey].pe = val.pe;
            stockPresets[presetKey].pb = val.pb;
            stockPresets[presetKey].rule40Growth = val.rule40Growth;
            stockPresets[presetKey].rule40FCFMargin = val.rule40FCFMargin;
            if (val.beta !== undefined) stockPresets[presetKey].beta = val.beta;
            if (val.piotroski !== undefined) stockPresets[presetKey].piotroski = val.piotroski;
        }
    }
}

// 載入本地靜態數據檔案 (雙重保險)
async function loadStaticRealtimeData() {
    try {
        const response = await fetch("realtime_data.json");
        if (!response.ok) throw new Error("無法讀取本地靜態 realtime_data.json");
        const data = await response.json();
        
        mergeRealtimeData(data);
        console.log("✅ 成功載入本地靜態數據檔案 (realtime_data.json)。");
        
        const now = new Date();
        if (lblTimestamp) {
            lblTimestamp.textContent = `最後更新：${now.toLocaleTimeString()} (快取資料)`;
        }
        
        // 重載當前 Preset 顯示
        loadPreset(selectPreset.value);
    } catch (err) {
        console.warn("⚠️ 載入本地靜態數據檔案失敗，將使用預設引數:", err);
    }
}

async function refreshRealtimeData(isForce = false) {
    if (!btnRefresh) return;
    
    // Add loading spinner class
    const icon = btnRefresh.querySelector("i");
    if (icon) {
        icon.classList.remove("icon-spin-disabled");
        icon.classList.add("icon-spin-enabled");
    }
    btnRefresh.disabled = true;
    lblTimestamp.textContent = "🌐 正在從 Yahoo Finance 抓取最新市場數據...";
    
    try {
        const forceParam = isForce ? '?force=true' : '';
        const response = await fetch(`${API_BASE}/api/refresh${forceParam}`);
        if (!response.ok) throw new Error("後端更新數據出錯");
        
        const data = await response.json();
        
        // 使用統一合併函數
        mergeRealtimeData(data);
        
        const now = new Date();
        const timeStr = now.toLocaleString("zh-TW", { 
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false 
        });
        const tickerCount = Object.keys(data).length;
        lblTimestamp.textContent = `🌐 即時更新：${timeStr}（共 ${tickerCount} 檔股票/ETF 已從網路同步）`;
        
        // Reload current active preset to show updated prices
        loadPreset(selectPreset.value);
        console.log(`✅ 成功從 Yahoo Finance 獲取 ${tickerCount} 檔即時數據。`);
    } catch (err) {
        console.error("更新即時數據失敗:", err);
        lblTimestamp.textContent = "❌ 網路更新失敗，目前顯示的是本地快取數據。請檢查後端是否運行中。";
    } finally {
        if (icon) {
            icon.classList.remove("icon-spin-enabled");
            icon.classList.add("icon-spin-disabled");
        }
        btnRefresh.disabled = false;
    }
}

btnRefresh.addEventListener("click", () => {
    // 手動按鈕強制跳過後端快取，直接從 Yahoo Finance 重新抓取
    refreshRealtimeData(true);
});

// ==========================================
// Tabs Switching Logic
// ==========================================
const tabs = [
    { btnId: "tab-btn-valuation", contentId: "tab-content-valuation", key: "valuation" },
    { btnId: "tab-btn-river", contentId: "tab-content-river", key: "river" },
    { btnId: "tab-btn-compound", contentId: "tab-content-compound", key: "compound" },
    { btnId: "tab-btn-drip", contentId: "tab-content-drip", key: "drip" }
];

let activeTab = "valuation";

function switchTab(tabKey) {
    activeTab = tabKey;
    tabs.forEach(tab => {
        const btn = document.getElementById(tab.btnId);
        const content = document.getElementById(tab.contentId);
        if (tab.key === tabKey) {
            btn.classList.add("active");
            content.style.display = "block";
        } else {
            btn.classList.remove("active");
            content.style.display = "none";
        }
    });

    // Re-trigger calculation and charts updates when active
    if (tabKey === "valuation") {
        calculateValuation();
    } else if (tabKey === "river") {
        loadRiverData();
    } else if (tabKey === "compound") {
        calculateCompoundInterest();
    } else if (tabKey === "drip") {
        calculateDRIP();
    }
}

// Attach event listeners to tab buttons
document.getElementById("tab-btn-valuation").addEventListener("click", () => switchTab("valuation"));
document.getElementById("tab-btn-river").addEventListener("click", () => switchTab("river"));
document.getElementById("tab-btn-compound").addEventListener("click", () => switchTab("compound"));
document.getElementById("tab-btn-drip").addEventListener("click", () => switchTab("drip"));

// ==========================================
// Compound Interest Calculations & Charting
// ==========================================
let compoundChartInstance = null;

// DOM Elements Compound
const compInitialInput = document.getElementById("comp-initial");
const compMonthlyInput = document.getElementById("comp-monthly");
const compRateInput = document.getElementById("comp-rate");
const compYearsSlider = document.getElementById("comp-years");
const valCompYearsDisp = document.getElementById("val-comp-years");

const compFinalBalanceDisp = document.getElementById("comp-final-balance");
const compTotalPrincipalDisp = document.getElementById("comp-total-principal");
const compTotalInterestDisp = document.getElementById("comp-total-interest");

const lblCompInitial = document.getElementById("lbl-comp-initial");
const lblCompMonthly = document.getElementById("lbl-comp-monthly");
const lblCompFinalBal = document.getElementById("lbl-comp-final-bal");
const lblCompTotalPrin = document.getElementById("lbl-comp-total-prin");
const lblCompTotalInt = document.getElementById("lbl-comp-total-int");

function calculateCompoundInterest() {
    const initial = parseFloat(compInitialInput.value) || 0;
    const monthly = parseFloat(compMonthlyInput.value) || 0;
    const rate = (parseFloat(compRateInput.value) || 0) / 100;
    const years = parseInt(compYearsSlider.value) || 10;
    
    valCompYearsDisp.textContent = `${years}年`;

    // Dynamic Labels Currency
    const cSymbol = currentCurrency === "TWD" ? "NT$" : "$";
    lblCompInitial.textContent = `初始本金 (${cSymbol})`;
    lblCompMonthly.textContent = `每月定期定額投入 (${cSymbol})`;
    lblCompFinalBal.textContent = `期末預估總資產 (${cSymbol})`;
    lblCompTotalPrin.textContent = `累積投入本金 (${cSymbol})`;
    lblCompTotalInt.textContent = `累積複利收益 (${cSymbol})`;

    // Trajectory calculation month-by-month
    let balance = initial;
    let totalPrincipal = initial;
    
    const yearsArray = [0];
    const principalArray = [initial];
    const interestArray = [0];
    
    for (let y = 1; y <= years; y++) {
        for (let m = 1; m <= 12; m++) {
            balance = balance * (1 + rate / 12) + monthly;
            totalPrincipal += monthly;
        }
        yearsArray.push(y);
        principalArray.push(Math.round(totalPrincipal));
        interestArray.push(Math.round(balance - totalPrincipal));
    }
    
    const finalInterest = balance - totalPrincipal;
    
    // Update Outputs Displays
    compFinalBalanceDisp.textContent = formatCurrency(balance);
    compTotalPrincipalDisp.textContent = formatCurrency(totalPrincipal);
    compTotalInterestDisp.textContent = formatCurrency(finalInterest);
    
    // Render/Update Trajectory chart
    updateCompoundChart(yearsArray, principalArray, interestArray);
}

function updateCompoundChart(labels, principalData, interestData) {
    const ctx = document.getElementById('compoundChart').getContext('2d');
    
    const chartData = {
        labels: labels.map(y => `${y} 年`),
        datasets: [
            {
                label: '累積本金投入',
                data: principalData,
                backgroundColor: 'rgba(99, 102, 241, 0.25)',
                borderColor: '#6366f1',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            },
            {
                label: '累積複利收益',
                data: interestData,
                backgroundColor: 'rgba(16, 185, 129, 0.25)',
                borderColor: '#10b981',
                borderWidth: 2,
                fill: true,
                tension: 0.2
            }
        ]
    };

    if (compoundChartInstance) {
        compoundChartInstance.data = chartData;
        compoundChartInstance.update();
    } else {
        compoundChartInstance = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: '#f8fafc', font: { family: 'Inter' } }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleFont: { family: 'Outfit', size: 13 },
                        bodyFont: { family: 'Inter', size: 12 },
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return ` ${context.dataset.label}: ${formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        stacked: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 11 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }
                    }
                }
            }
        });
    }
}

// Attach compound inputs listeners
[compInitialInput, compMonthlyInput, compRateInput].forEach(inp => {
    inp.addEventListener("input", calculateCompoundInterest);
});
compYearsSlider.addEventListener("input", calculateCompoundInterest);

// ==========================================
// DRIP (Dividend Reinvestment) Calculations & Charting
// ==========================================
let dripChartInstance = null;

// DOM Elements DRIP
const dripPriceInput = document.getElementById("drip-price");
const dripSharesInput = document.getElementById("drip-shares");
const dripDividendInput = document.getElementById("drip-dividend");
const dripAnnualAddInput = document.getElementById("drip-annual-add");
const dripReinvestCheck = document.getElementById("drip-reinvest");
const dripYearsSlider = document.getElementById("drip-years");
const valDripYearsDisp = document.getElementById("val-drip-years");

const dripFinalSharesDisp = document.getElementById("drip-final-shares");
const dripFinalIncomeDisp = document.getElementById("drip-final-income");
const dripTotalDividendsDisp = document.getElementById("drip-total-dividends");

const lblDripPrice = document.getElementById("lbl-drip-price");
const lblDripDividend = document.getElementById("lbl-drip-dividend");
const lblDripAnnualAdd = document.getElementById("lbl-drip-annual-add");
const lblDripFinalInc = document.getElementById("lbl-drip-final-inc");
const lblDripTotalDiv = document.getElementById("lbl-drip-total-div");

function calculateDRIP() {
    const price = parseFloat(dripPriceInput.value) || 1;
    let shares = parseFloat(dripSharesInput.value) || 0;
    const dividend = parseFloat(dripDividendInput.value) || 0;
    const annualAdd = parseFloat(dripAnnualAddInput.value) || 0;
    const reinvest = dripReinvestCheck.checked;
    const years = parseInt(dripYearsSlider.value) || 10;
    const frequency = parseInt(document.getElementById("drip-frequency").value) || 4;

    valDripYearsDisp.textContent = `${years}年`;

    const warningBanner = document.getElementById("drip-no-dividend-warning");
    if (warningBanner) {
        warningBanner.style.display = dividend <= 0 ? "flex" : "none";
    }

    // Dynamic Labels Currency
    const cSymbol = currentCurrency === "TWD" ? "NT$" : "$";
    lblDripPrice.textContent = `目前股價 (${cSymbol})`;
    lblDripDividend.textContent = `預估每股發放股利 (年, ${cSymbol})`;
    lblDripAnnualAdd.textContent = `每年額外加碼本金 (${cSymbol})`;
    lblDripFinalInc.textContent = `期末年領股息預估 (${cSymbol})`;
    lblDripTotalDiv.textContent = `累積領取總股息 (${cSymbol})`;

    // Simulation variables
    let currentShares = shares;
    let totalDividendsReceived = 0;
    
    const yearsArray = [0];
    const sharesArray = [shares];
    const incomeArray = [shares * dividend];
    
    for (let y = 1; y <= years; y++) {
        // 模擬一年中 frequency 次的配息與再投資
        const singleDivRate = dividend / frequency;
        for (let f = 1; f <= frequency; f++) {
            const divReceived = currentShares * singleDivRate;
            totalDividendsReceived += divReceived;
            
            if (reinvest && price > 0) {
                currentShares += divReceived / price;
            }
        }
        
        // 每年底加碼本金買入
        if (price > 0) {
            currentShares += annualAdd / price;
        }
        
        yearsArray.push(y);
        sharesArray.push(Math.round(currentShares));
        incomeArray.push(Math.round(currentShares * dividend));
    }
    
    // Update Outputs
    dripFinalSharesDisp.textContent = `${formatNumber(currentShares)} 股`;
    dripFinalIncomeDisp.textContent = formatCurrency(currentShares * dividend);
    dripTotalDividendsDisp.textContent = formatCurrency(totalDividendsReceived);
    
    // Render/Update DRIP chart
    updateDRIPChart(yearsArray, sharesArray, incomeArray);
}

function updateDRIPChart(labels, sharesData, incomeData) {
    const ctx = document.getElementById('dripChart').getContext('2d');
    
    const chartData = {
        labels: labels.map(y => `${y} 年`),
        datasets: [
            {
                label: '累積股數 (股)',
                data: sharesData,
                borderColor: '#a855f7',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                borderWidth: 2,
                yAxisID: 'y-shares',
                tension: 0.2
            },
            {
                label: `年領股息 (${currentCurrency === "TWD" ? "NT$" : "$"})`,
                data: incomeData,
                borderColor: '#ec4899',
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                borderWidth: 2,
                yAxisID: 'y-income',
                tension: 0.2
            }
        ]
    };

    if (dripChartInstance) {
        dripChartInstance.data = chartData;
        dripChartInstance.update();
    } else {
        dripChartInstance = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: '#f8fafc', font: { family: 'Inter' } }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleFont: { family: 'Outfit', size: 13 },
                        bodyFont: { family: 'Inter', size: 12 },
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                if (context.dataset.yAxisID === 'y-shares') {
                                    return ` ${context.dataset.label}: ${formatNumber(context.raw)} 股`;
                                } else {
                                    return ` ${context.dataset.label}: ${formatCurrency(context.raw)}`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    'y-shares': {
                        type: 'linear',
                        position: 'left',
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#a855f7', font: { family: 'Outfit', size: 11 } },
                        title: { display: true, text: '累積持有股數', color: '#a855f7' }
                    },
                    'y-income': {
                        type: 'linear',
                        position: 'right',
                        grid: { drawOnChartArea: false }, // only draw grid for left axis
                        ticks: { color: '#ec4899', font: { family: 'Outfit', size: 11 } },
                        title: { display: true, text: '預估年領股息', color: '#ec4899' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }
                    }
                }
            }
        });
    }
}

// Attach DRIP inputs listeners
[dripPriceInput, dripSharesInput, dripDividendInput, dripAnnualAddInput].forEach(inp => {
    inp.addEventListener("input", calculateDRIP);
});
document.getElementById("drip-frequency").addEventListener("change", calculateDRIP);
dripReinvestCheck.addEventListener("change", calculateDRIP);
dripYearsSlider.addEventListener("input", calculateDRIP);


// ==========================================
// Valuation River Charting
// ==========================================
let riverChartInstance = null;
let currentRiverType = 'pe'; // 'pe' or 'pb'
let cachedRiverData = null;

// DOM Elements River
const riverStockInfo = document.getElementById("river-stock-info");
const btnRiverPE = document.getElementById("btn-river-pe");
const btnRiverPB = document.getElementById("btn-river-pb");
const riverTypeSelectorWrapper = document.getElementById("river-type-selector-wrapper");
const riverDesc = document.getElementById("river-desc");
const riverStatusText = document.getElementById("river-status-text");
const riverChartTitle = document.getElementById("river-chart-title");

async function loadRiverData() {
    // 獲取當前所選的 symbol
    const select = document.getElementById("stock-preset");
    const selectedPresetKey = select.value;
    let symbol = "";
    
    if (selectedPresetKey === "custom") {
        symbol = document.getElementById("stock-symbol").value.toUpperCase().trim();
    } else {
        symbol = stockPresets[selectedPresetKey].symbol;
    }
    
    if (!symbol) {
        riverStatusText.textContent = "請輸入或選擇一個有效的股票代號";
        return;
    }
    
    riverStockInfo.textContent = symbol;
    riverStatusText.textContent = `正在獲取 ${symbol} 的歷史河流數據，請稍候...`;
    
    try {
        const res = await fetch(`${API_BASE}/api/river?symbol=${symbol}`);
        if (!res.ok) {
            throw new Error(`HTTP 錯誤! 狀態碼: ${res.status}`);
        }
        const data = await res.json();
        cachedRiverData = data;
        drawRiverChart();
    } catch (err) {
        console.error("載入歷史估值河流數據失敗:", err);
        riverStatusText.innerHTML = `<span style="color: #f87171;">數據載入失敗：${err.message}。後端服務可能仍在啟動中或網路超時，請點擊「即時數據更新」或重試。</span>`;
    }
}

function drawRiverChart() {
    if (!cachedRiverData) return;
    
    const ctx = document.getElementById("riverChart").getContext("2d");
    const isETF = cachedRiverData.isETF;
    const labels = cachedRiverData.dates;
    const closeData = cachedRiverData.close;
    const currentPrice = closeData[closeData.length - 1];
    const currencySym = cachedRiverData.currency === "TWD" ? "NT$" : "$";
    
    // 清除舊圖表
    if (riverChartInstance) {
        riverChartInstance.destroy();
        riverChartInstance = null;
    }
    
    if (isETF) {
        // ETF 均線圖
        riverTypeSelectorWrapper.style.display = "none";
        riverChartTitle.innerHTML = `<i data-lucide="waves"></i> 歷史移動平均均線走勢圖 (ETF)`;
        riverDesc.textContent = "針對 ETF 採用均線估值法。20MA (月線) 代表短期支撐，60MA (季線) 代表中期支撐，120MA (半年線) 代表中長期支撐，240MA (年線) 為長期支撐防禦線。";
        if (window.lucide) window.lucide.createIcons();
        
        const ma20 = cachedRiverData.ma20;
        const ma60 = cachedRiverData.ma60;
        const ma120 = cachedRiverData.ma120;
        const ma240 = cachedRiverData.ma240;
        
        // 估值定位分析
        let statusHtml = "";
        const ref240 = ma240[ma240.length - 1];
        const ref120 = ma120[ma120.length - 1];
        const ref60 = ma60[ma60.length - 1];
        
        if (ref240 && currentPrice < ref240) {
            statusHtml = `當前股價 <span style="color: #4ade80;">${currencySym} ${currentPrice}</span> 低於年線 (${currencySym} ${ref240.toFixed(2)})，為 <strong style="color: #4ade80;">超跌極佳買點</strong>！長期安全邊際極高。`;
        } else if (ref120 && currentPrice < ref120) {
            statusHtml = `當前股價 <span style="color: #a3e635;">${currencySym} ${currentPrice}</span> 介於半年線與年線之間，為 <strong style="color: #a3e635;">中期甜美佈局點</strong>。`;
        } else if (ref60 && currentPrice < ref60) {
            statusHtml = `當前股價 <span style="color: #60a5fa;">${currencySym} ${currentPrice}</span> 介於季線與半年線之間，為 <strong style="color: #60a5fa;">合理分批進場點</strong>。`;
        } else {
            statusHtml = `當前股價 <span style="color: #f87171;">${currencySym} ${currentPrice}</span> 高於所有短中長期均線，<strong style="color: #f87171;">偏高偏貴</strong>，建議分批定期定額，耐心等待修正支撐位。`;
        }
        riverStatusText.innerHTML = statusHtml;
        
        // 繪圖
        riverChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '收盤價',
                        data: closeData,
                        borderColor: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.05)',
                        borderWidth: 2.5,
                        tension: 0.1,
                        pointRadius: 0,
                        pointHoverRadius: 5
                    },
                    {
                        label: '20MA',
                        data: ma20,
                        borderColor: '#a855f7',
                        borderWidth: 1.5,
                        borderDash: [2, 2],
                        tension: 0.1,
                        pointRadius: 0
                    },
                    {
                        label: '60MA',
                        data: ma60,
                        borderColor: '#ec4899',
                        borderWidth: 1.5,
                        borderDash: [3, 3],
                        tension: 0.1,
                        pointRadius: 0
                    },
                    {
                        label: '120MA',
                        data: ma120,
                        borderColor: '#eab308',
                        borderWidth: 1.5,
                        tension: 0.1,
                        pointRadius: 0
                    },
                    {
                        label: '240MA',
                        data: ma240,
                        borderColor: '#10b981',
                        borderWidth: 1.8,
                        tension: 0.1,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { labels: { color: '#f8fafc', font: { family: 'Inter', size: 11 } } },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        titleFont: { family: 'Outfit' },
                        bodyFont: { family: 'Inter' },
                        callbacks: {
                            label: function(context) {
                                return ` ${context.dataset.label}: ${currencySym} ${context.raw !== null ? context.raw.toFixed(2) : '無'}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 11 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 10 }, maxTicksLimit: 12 }
                    }
                }
            }
        });
        
    } else {
        // 個股 PE/PB 河流圖
        riverTypeSelectorWrapper.style.display = "block";
        riverChartTitle.innerHTML = `<i data-lucide="waves"></i> 歷史估值河流走勢 (${currentRiverType.toUpperCase()})`;
        
        let bands = null;
        let midVal = 0;
        
        if (currentRiverType === 'pe') {
            riverDesc.textContent = "本益比河流圖：以歷史 TTM EPS 乘上當前設定的本益比倍數中軸 (0.6x, 0.8x, 1.0x, 1.2x, 1.4x) 來劃分 5 個估值河流區間，反映股價相對於獲利能力的評價高低。";
            bands = cachedRiverData.pe_bands;
            midVal = cachedRiverData.pe_mid;
        } else {
            riverDesc.textContent = "本淨比河流圖：以歷史每股淨值 (BPS) 乘上當前設定的本淨比倍數中軸 (0.6x, 0.8x, 1.0x, 1.2x, 1.4x) 來劃分 5 個估值河流區間，適用於波動較大或重資產個股。";
            bands = cachedRiverData.pb_bands;
            midVal = cachedRiverData.pb_mid;
        }
        if (window.lucide) window.lucide.createIcons();
        
        const cheap = bands.cheap_0_6;
        const low = bands.low_0_8;
        const fair = bands.fair_1_0;
        const high = bands.high_1_2;
        const expensive = bands.expensive_1_4;
        
        // 估值定位分析
        let statusHtml = "";
        const cVal = cheap[cheap.length - 1];
        const lVal = low[low.length - 1];
        const fVal = fair[fair.length - 1];
        const hVal = high[high.length - 1];
        
        if (currentPrice < cVal) {
            statusHtml = `當前股價 <span style="color: #4ade80;">${currencySym} ${currentPrice}</span> 低於 0.6x 河流底 (${currencySym} ${cVal.toFixed(2)})，為 <strong style="color: #4ade80;">極度便宜 (極佳安全邊際)</strong>！`;
        } else if (currentPrice < lVal) {
            statusHtml = `當前股價 <span style="color: #a3e635;">${currencySym} ${currentPrice}</span> 處於 <strong style="color: #a3e635;">便宜偏低區間</strong>。`;
        } else if (currentPrice < fVal) {
            statusHtml = `當前股價 <span style="color: #60a5fa;">${currencySym} ${currentPrice}</span> 處於 <strong style="color: #60a5fa;">合理價值區間</strong>。`;
        } else if (currentPrice < hVal) {
            statusHtml = `當前股價 <span style="color: #fb923c;">${currencySym} ${currentPrice}</span> 處於 <strong style="color: #fb923c;">偏高溢價區間</strong>，注意拉回風險。`;
        } else {
            statusHtml = `當前股價 <span style="color: #f87171;">${currencySym} ${currentPrice}</span> 高於 1.2x 河流頂 (${currencySym} ${hVal.toFixed(2)})，處於 <strong style="color: #f87171;">極度昂貴 (泡沫溢價)</strong> 區間！`;
        }
        riverStatusText.innerHTML = statusHtml;
        
        // 河流圖的資料集
        const datasets = [
            {
                label: '收盤價',
                data: closeData,
                borderColor: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderWidth: 2.5,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 6,
                zIndex: 10
            },
            {
                label: `昂貴價 (${(midVal * 1.2).toFixed(1)}x)`,
                data: expensive,
                borderColor: 'rgba(239, 68, 68, 0.4)', // 紅色
                borderWidth: 1,
                fill: '-1',
                backgroundColor: 'rgba(239, 68, 68, 0.03)',
                tension: 0.1,
                pointRadius: 0
            },
            {
                label: `偏高價 (${(midVal * 1.0).toFixed(1)}x)`,
                data: high,
                borderColor: 'rgba(249, 115, 22, 0.3)', // 橘色
                borderWidth: 1,
                fill: '-1',
                backgroundColor: 'rgba(249, 115, 22, 0.03)',
                tension: 0.1,
                pointRadius: 0
            },
            {
                label: `合理價 (${(midVal * 0.8).toFixed(1)}x)`,
                data: fair,
                borderColor: 'rgba(59, 130, 246, 0.3)', // 藍色
                borderWidth: 1,
                fill: '-1',
                backgroundColor: 'rgba(59, 130, 246, 0.03)',
                tension: 0.1,
                pointRadius: 0
            },
            {
                label: `偏低價 (${(midVal * 0.6).toFixed(1)}x)`,
                data: low,
                borderColor: 'rgba(163, 230, 53, 0.3)', // 嫩綠
                borderWidth: 1,
                fill: '-1',
                backgroundColor: 'rgba(163, 230, 53, 0.03)',
                tension: 0.1,
                pointRadius: 0
            },
            {
                label: '便宜價',
                data: cheap,
                borderColor: 'rgba(34, 197, 94, 0.3)', // 綠色
                borderWidth: 1,
                tension: 0.1,
                pointRadius: 0
            }
        ];
        
        riverChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { labels: { color: '#f8fafc', font: { family: 'Inter', size: 10 } } },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        titleFont: { family: 'Outfit' },
                        bodyFont: { family: 'Inter' },
                        callbacks: {
                            label: function(context) {
                                return ` ${context.dataset.label}: ${currencySym} ${context.raw !== null ? context.raw.toFixed(2) : '無'}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 11 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 10 }, maxTicksLimit: 12 }
                    }
                }
            }
        });
    }
}

// 綁定按鈕事件
btnRiverPE.addEventListener("click", () => {
    if (currentRiverType === 'pe') return;
    currentRiverType = 'pe';
    btnRiverPE.classList.add("active");
    btnRiverPB.classList.remove("active");
    // 更新 inline 樣式以實現高質感視覺切換
    btnRiverPE.style.borderColor = "var(--accent)";
    btnRiverPE.style.background = "rgba(var(--accent-rgb), 0.15)";
    btnRiverPE.style.color = "var(--accent)";
    btnRiverPB.style.borderColor = "var(--border)";
    btnRiverPB.style.background = "rgba(255,255,255,0.05)";
    btnRiverPB.style.color = "var(--text-secondary)";
    drawRiverChart();
});

btnRiverPB.addEventListener("click", () => {
    if (currentRiverType === 'pb') return;
    currentRiverType = 'pb';
    btnRiverPB.classList.add("active");
    btnRiverPE.classList.remove("active");
    // 更新 inline 樣式
    btnRiverPB.style.borderColor = "var(--accent)";
    btnRiverPB.style.background = "rgba(var(--accent-rgb), 0.15)";
    btnRiverPB.style.color = "var(--accent)";
    btnRiverPE.style.borderColor = "var(--border)";
    btnRiverPE.style.background = "rgba(255,255,255,0.05)";
    btnRiverPE.style.color = "var(--text-secondary)";
    drawRiverChart();
});
// 判斷是否處於台灣股市交易時間 (週一至週五 9:00 - 13:30)
function isTaiwanTradingTime() {
    const now = new Date();
    // 轉換為台灣時間 (UTC+8)
    const twTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Taipei" }));
    const day = twTime.getDay(); // 0: 日, 1-5: 一至五, 6: 六
    const hours = twTime.getHours();
    const minutes = twTime.getMinutes();
    const timeInMinutes = hours * 60 + minutes;
    
    const isWeekday = (day >= 1 && day <= 5);
    const isTradingHours = (timeInMinutes >= 540 && timeInMinutes <= 810); // 9:00 (540分) 到 13:30 (810分)
    
    return isWeekday && isTradingHours;
}

// 判斷是否處於美股交易時間 (美東 9:30 - 16:00 = 台灣 21:30 - 04:30+1)
function isUSTradingTime() {
    const now = new Date();
    const usTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const day = usTime.getDay();
    const hours = usTime.getHours();
    const minutes = usTime.getMinutes();
    const timeInMinutes = hours * 60 + minutes;
    
    const isWeekday = (day >= 1 && day <= 5);
    const isTradingHours = (timeInMinutes >= 570 && timeInMinutes <= 960); // 9:30 到 16:00
    
    return isWeekday && isTradingHours;
}

// Initial Setup on Page Load
window.addEventListener("load", async () => {
    // Load local Nvidia first for instant preview
    loadPreset("NVDA");
    // 首先嘗試載入靜態數據檔案 (快取雙重保險，讓頁面秒開)
    await loadStaticRealtimeData();
    // 每次開啟頁面，一律從網路即時抓取最新數據（這是核心！）
    refreshRealtimeData();
    
    // 智慧自動刷新機制：
    // - 台股/美股交易時段：每 5 分鐘自動更新
    // - 非交易時段：每 30 分鐘自動更新（股價不變但財報數據可能更新）
    setInterval(() => {
        if (isTaiwanTradingTime() || isUSTradingTime()) {
            console.log("⏰ 偵測到交易時間（台股或美股），系統正在自動從網路更新最新數據...");
            refreshRealtimeData();
        } else {
            console.log("💤 非主要交易時段，30 分鐘週期靜默更新中...");
        }
    }, 5 * 60 * 1000); // 每 5 分鐘檢查一次
    
    // 非交易時段也要有一個較長週期的更新，確保數據不會太過陳舊
    setInterval(() => {
        if (!isTaiwanTradingTime() && !isUSTradingTime()) {
            console.log("🔄 非交易時段定期更新（每 30 分鐘），確保數據新鮮度...");
            refreshRealtimeData();
        }
    }, 30 * 60 * 1000); // 每 30 分鐘
});
