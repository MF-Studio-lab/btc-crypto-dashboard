# BTC 加密貨幣行情儀表板

![Status](https://img.shields.io/github/deployments/MF-Studio-lab/btc-crypto-dashboard/github-pages)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

即時加密貨幣行情視覺化儀表板，串接 Binance API，支援現貨與期貨 USDT-M 雙模式。

**線上網址：** https://mf-studio-lab.github.io/btc-crypto-dashboard/

---

## 功能特色

### 技術指標
| 指標 | 參數 | 說明 |
|------|------|------|
| 布林帶 | 20,2 | 上軌/中軌/下軌，帶寬/擠壓判斷 |
| RSI | 14日 | 超買>70 🔴 / 超賣<30 🔵 |
| MACD | 12,26,9 | 柱狀圖：🟢正值（多）/ 🔴負值（空） |
| KD | 14日 | K值/D值交叉，高檔>80 / 低檔<20 |
| ATR | 14日 | 波動幅度（均值） |
| MA 均線 | 5/10/20/60日 | 多空排列判斷 ▲/▼ |
| 斐波那契 | 30日 | 回調 0-100% + 延伸 113/127/141/161.8% |
| Pi Cycle Top | MA111 vs MA350×2 | 比持幣頂部/底部訊號 |

---

## 畫面預覽

```
┌─────────────────────────────────────────────────────────────┐
│  加密貨幣行情儀表板                        [現貨|期貨] [幣種]↻│
├─────────────────────────────────────────────────────────────┤
│  $77,913.69                                                  │
│  24h: -0.30% | 7d: -5.23% | 30d: +2.94%                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────┐       │
│  │ 價格 & 布林帶 (20,2)  │  │ RSI (14) — 47.72     │       │
│  │  [K線圖表]            │  │  [折線圖]            │       │
│  └──────────────────────┘  └──────────────────────┘       │
│  ┌──────────────────────┐  ┌──────────────────────┐       │
│  │ MACD (12,26,9)        │  │ KD (14) — 低檔區     │       │
│  │  [組合圖]             │  │  [K/D線]             │       │
│  └──────────────────────┘  └──────────────────────┘       │
├─────────────────────────────────────────────────────────────┤
│  關鍵指標數值  布林上軌/中軌/下軌  ATR  斐波那契支撐/壓力   │
├─────────────────────────────────────────────────────────────┤
│  MA 均線狀態  MA5/10/20/60 多空標記  │  Pi Cycle Top       │
└─────────────────────────────────────────────────────────────┘
```

---

## 交易策略工具（Strategy Tab）

支援 **現貨 / 合約** 雙模式切換，各自擁有獨立的交易計畫與復盤數據。

### 交易計畫區
| 區塊 | 內容 |
|------|------|
| **進場條件 (Entry)** | 趨勢確認、支撐/壓力位確認、技術指標訊號、成交量確認、時間框架一致 |
| **風險控制 (Risk)** | 入場價格、倉位大小、止損價格、止盈目標、R:R 自動計算 |
| **合約參數** | 槓桿倍數、保證金、網格下限/上限/數量（僅合約模式顯示） |
| **退出條件 (Exit)** | 止盈目標、止損觸發、訊號反轉、時間止損 |
| **策略備註** | 文字記錄交易想法 |

### 心理檢查
- 冷靜狀態確認
- 虧損接受度
- 計畫內交易確認
- 止損/止盈設定確認

### 復盤日誌
- 新增交易紀錄（Modal 表單）
- 方向標記：**多 (Long)** / **空 (Short)** / **中性 (Neutral/Grid)**
- 情緒追蹤：冷靜/興奮/焦慮/恐懼/貪婪
- 交易統計：總交易數、勝率、獲利因子、平均 R:R
- 數據匯出 CSV

---

## 支援幣種

**現貨（Spot）**
- BTC 比特幣
- ETH 以太坊
- BNB
- SOL Solana
- XRP
- ADA
- DOGE
- AVAX
- DOT
- MATIC

**期貨 USDT-M（Futures）**
- GOOGL
- NVDA
- AAPL
- 以及任何 Binance USDT-M 合約

---

## 使用方式

### 即時更新
1. 選擇模式（現貨 / 期貨 USDT-M）
2. 選擇幣種
3. 點擊「更新數據」按鈕

### 交易策略工具
1. 點擊「Strategy」切換至策略頁面
2. 選擇「現貨」或「合約」模式
3. 填寫交易計畫並儲存
4. 交易後新增復盤紀錄

### 自行架設

```bash
# Clone 專案
git clone https://github.com/MF-Studio-lab/btc-crypto-dashboard.git
cd btc-crypto-dashboard

# 直接用瀏覽器開啟（無需 server）
open index.html
# 或使用 Python 會易 server
python3 -m http.server 8080
```

---

## 技術架構

| 項目 | 技術 |
|------|------|
| 前端框架 | 純 HTML + CSS + JavaScript（無框架依赖）|
| 圖表 Library | Chart.js v4.4 |
| 數據來源 | Binance 公開 API（無需 API Key）|
| 托管平台 | GitHub Pages |
| 指標計算 | 全前端即時計算 |
| 數據儲存 | LocalStorage（瀏覽器端）|

### Binance API 端點

```
現貨：https://api.binance.com/api/v3/klines?symbol={SYMBOL}&interval=1d&limit=500
期貨：https://fapi.binance.com/fapi/v1/klines?symbol={SYMBOL}&interval=1d&limit=500
```

---

## 與行情分析腳本的差異

| 功能 | 本儀表板 | 行情分析腳本 |
|------|---------|-------------|
| 部署方式 | GitHub Pages 網頁 | 終端機文字輸出 |
| 更新方式 | 手動點擊 | 可自動化 Cron |
| 視覺化 | 圖表呈現 | 文字數值 |
| Pi Cycle Top | ✅ | ✅ |
| 通知推送 | ❌ | ✅（Telegram） |
| 交易策略規劃 | ✅ | ❌ |
| 合約網格參數 | ✅ | ❌ |

---

## 資料來源

- [Binance 公開 API](https://github.com/binance/binance-official-api-docs)
- Pi Cycle Top 原理：[LookIntoBitcoin](https://www.lookintobitcoin.com/charts/pi-cycle-top-indicator/)

---

## 相關專案

- [crypto-market-analysis](https://github.com/MF-Studio-lab/crypto-market-analysis) — 行情分析腳本技能
- [hermes-backup](https://github.com/MF-Studio-lab/hermes-backup) — Hermes Agent 備份系統

---

## License

MIT License © 2026 MF-Studio-lab