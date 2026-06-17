// JavaScript Core: Stock Evaluator Calculations and Charting

// 雲端部署後，請將下方網址替換為您的 Render 後端網址 (例如 https://my-backend.onrender.com)
const CLOUD_BACKEND_URL = "https://stock-evaluator-backend.onrender.com";

const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? ""
    : CLOUD_BACKEND_URL;

// Preset Stock Data
const stockPresets = {
    "2330": {
        symbol: "2330.TW",
        name: "台積電",
        price: 920.0,
        eps: 40.2,
        bps: 162.5,
        dividend: 16.0,
        fcf: 480000, // 百萬 TWD
        shares: 25930, // 百萬股
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
        price: 185.0,
        eps: 8.50,
        bps: 75.00,
        dividend: 5.50,
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
        name: "國泰永續高股息 (高股息)",
        price: 23.5,
        eps: 1.50,
        bps: 16.00,
        dividend: 1.40,
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
        price: 108.0,
        eps: 5.20,
        bps: 45.00,
        dividend: 3.50,
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
        price: 25.0,
        eps: 1.80,
        bps: 16.00,
        dividend: 2.20,
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
        price: 20.0,
        eps: 1.40,
        bps: 15.00,
        dividend: 1.60,
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
        name: "元大台灣高息低波 (00713)",
        price: 58.0,
        eps: 3.50,
        bps: 24.50,
        dividend: 3.20,
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
        name: "元大台灣價值高息 (00940)",
        price: 10.2,
        eps: 0.65,
        bps: 10.00,
        dividend: 0.72,
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
        price: 214.3,
        eps: 6.60,
        bps: 4.85,
        dividend: 1.00,
        fcf: 104000, // 百萬 USD
        shares: 15280, // 百萬股
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
        price: 127.4,
        eps: 2.00,
        bps: 12.50,
        dividend: 0.04,
        fcf: 27000, // 百萬 USD
        shares: 24500, // 百萬股
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
        price: 175.0,
        eps: 5.20,
        bps: 24.50,
        dividend: 2.12,
        fcf: 18500,
        shares: 465,
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
        price: 420.0,
        eps: 11.80,
        bps: 37.00,
        dividend: 3.00,
        fcf: 70000, // 百萬 USD
        shares: 7430, // 百萬股
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
        price: 184.8,
        eps: 2.52,
        bps: 21.30,
        dividend: 0.00,
        fcf: 4400, // 百萬 USD
        shares: 3180, // 百萬股
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
        price: 160.0,
        eps: 2.10,
        bps: 36.50,
        dividend: 0.00,
        fcf: 1200, // 百萬 USD
        shares: 1610, // 百萬股
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
        price: 180.0,
        eps: 6.50,
        bps: 26.50,
        dividend: 1.80,
        fcf: 15000, // 百萬 USD
        shares: 5180, // 百萬股
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
        price: 850.0,
        eps: 22.00,
        bps: 85.00,
        dividend: 0.00,
        fcf: 1200, // 百萬 USD
        shares: 58, // 百萬股
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
        price: 175.0,
        eps: 7.20,
        bps: 24.00,
        dividend: 0.80,
        fcf: 69000, // 百萬 USD
        shares: 12400, // 百萬股
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
        price: 500.0,
        eps: 18.50,
        bps: 110.00,
        dividend: 6.20,
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
        price: 460.0,
        eps: 15.00,
        bps: 65.00,
        dividend: 2.50,
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
        price: 82.0,
        eps: 4.20,
        bps: 32.00,
        dividend: 2.80,
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
    }
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
    sliderDiscount.value = data.discount;
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
    
    // Perform calculations for all tabs unconditionally to prevent leftover currency symbols in background tabs
    calculateValuation();
    calculateCompoundInterest();
    calculateDRIP();
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
    // Model A: DCF (Discounted Cash Flow)
    // ==========================================
    let dcfValue = 0;
    const fcfPerShare = fcf / shares;
    let projectedFcf = fcfPerShare;
    let sumPvOfFcf = 0;

    // 10 years prediction
    for (let year = 1; year <= 10; year++) {
        const growth = year <= 5 ? g1 : g2;
        projectedFcf = projectedFcf * (1 + growth);
        const pv = projectedFcf / Math.pow(1 + discount, year);
        sumPvOfFcf += pv;
    }
    // Terminal value
    const fcfYear10 = projectedFcf;
    let terminalValue = 0;
    if (discount > gTerminal) {
        terminalValue = (fcfYear10 * (1 + gTerminal)) / (discount - gTerminal);
    }
    const pvOfTerminalValue = terminalValue / Math.pow(1 + discount, 10);
    dcfValue = sumPvOfFcf + pvOfTerminalValue;
    if (dcfValue < 0) dcfValue = 0;

    // ==========================================
    // Model B: Graham Number
    // ==========================================
    let grahamValue = 0;
    if (eps > 0 && bps > 0) {
        grahamValue = Math.sqrt(22.5 * eps * bps);
    }

    // ==========================================
    // Model C: DDM (Dividend Discount Model)
    // ==========================================
    let ddmValue = 0;
    if (dividend > 0 && discount > gTerminal) {
        ddmValue = (dividend * (1 + gTerminal)) / (discount - gTerminal);
    }

    // ==========================================
    // Model D: Multipliers (PE & PB Relative Valuation)
    // ==========================================
    const peValuation = eps * pe;
    const pbValuation = bps * pb;
    const multiplierValue = (peValuation + pbValuation) / 2;

    const currentPresetKey = selectPreset.value;
    const isETFSelected = stockPresets[currentPresetKey] ? stockPresets[currentPresetKey].isETF : false;

    // Display model results
    calcDcfEl.textContent = isETFSelected ? "不適用" : formatCurrency(dcfValue);
    calcGrahamEl.textContent = isETFSelected ? "不適用" : formatCurrency(grahamValue);
    calcDdmEl.textContent = dividend <= 0 ? "不適用 (無配息)" : formatCurrency(ddmValue);
    calcMultiplierEl.textContent = formatCurrency(multiplierValue);

    // ==========================================
    // Weights Calculation
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
    } else {
        weightErrorEl.textContent = "";
        intrinsicValue = (dcfValue * wDcf + grahamValue * wGraham + ddmValue * wDdm + multiplierValue * wMult) / 100;
        displayPriceIntrinsic.textContent = formatCurrency(intrinsicValue);
        displayPriceIntrinsic.style.color = "";
    }

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
        if (riskLevel.includes("低")) {
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

async function refreshRealtimeData() {
    if (!btnRefresh) return;
    
    // Add loading spinner class
    const icon = btnRefresh.querySelector("i");
    if (icon) {
        icon.classList.remove("icon-spin-disabled");
        icon.classList.add("icon-spin-enabled");
    }
    btnRefresh.disabled = true;
    lblTimestamp.textContent = "正在抓取市場數據...";
    
    try {
        const response = await fetch(`${API_BASE}/api/refresh`);
        if (!response.ok) throw new Error("後端更新數據出錯");
        
        const data = await response.json();
        
        // Merge fetched data into stockPresets
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
            }
        }
        
        const now = new Date();
        lblTimestamp.textContent = `最後更新：${now.toLocaleTimeString()}`;
        
        // Reload current active preset to show updated prices
        loadPreset(selectPreset.value);
        console.log("✅ 成功獲取並載入最新即時數據。");
    } catch (err) {
        console.error("更新即時數據失敗:", err);
        lblTimestamp.textContent = "更新失敗，請檢查後端是否運行中";
    } finally {
        if (icon) {
            icon.classList.remove("icon-spin-enabled");
            icon.classList.add("icon-spin-disabled");
        }
        btnRefresh.disabled = false;
    }
}

btnRefresh.addEventListener("click", () => {
    refreshRealtimeData();
});

// ==========================================
// Tabs Switching Logic
// ==========================================
const tabs = [
    { btnId: "tab-btn-valuation", contentId: "tab-content-valuation", key: "valuation" },
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
    } else if (tabKey === "compound") {
        calculateCompoundInterest();
    } else if (tabKey === "drip") {
        calculateDRIP();
    }
}

// Attach event listeners to tab buttons
document.getElementById("tab-btn-valuation").addEventListener("click", () => switchTab("valuation"));
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

// Initial Setup on Page Load
window.addEventListener("load", () => {
    // Load local Nvidia first for instant preview
    loadPreset("NVDA");
    // Immediately attempt to fetch fresh market values from Python server
    refreshRealtimeData();
    
    // 設定每 5 分鐘自動刷新機制 (台股交易日 09:00-13:30)
    setInterval(() => {
        if (isTaiwanTradingTime()) {
            console.log("⏰ 偵測到當前為台股交易時間，系統正在自動重新整理最新股價與財務指標...");
            refreshRealtimeData();
        } else {
            console.log("💤 非台股交易時間，系統暫停自動刷新以節省資源。");
        }
    }, 5 * 60 * 1000);
});
