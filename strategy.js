// Strategy Page Functions - Spot/Futures Trading Plan & Review
(function() {
'use strict';

let currentMode = 'spot';
const STRATEGY_KEY = 'btcStrategyData';

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
  if (tab === 'market') {
    document.getElementById('marketTab').classList.add('active');
    document.getElementById('market-page').classList.add('active');
  } else {
    document.getElementById('strategyTab').classList.add('active');
    document.getElementById('strategy-page').classList.add('active');
  }
}

function switchStrategyMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.strategy-mode-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('mode-' + mode).classList.add('active');
  const container = document.getElementById('strategy-content');
  if (mode === 'futures') {
    container.classList.add('futures-mode');
  } else {
    container.classList.remove('futures-mode');
  }
  loadLocalData();
  renderReviewTable();
}

function loadLocalData() {
  const data = getData();
  // Load checklist
  const checklistItems = document.querySelectorAll('.checklist input[type="checkbox"]');
  if (data.checklist) {
    checklistItems.forEach((cb, i) => {
      if (data.checklist[i] !== undefined) {
        cb.checked = data.checklist[i];
        cb.parentElement.classList.toggle('checked', cb.checked);
      }
    });
  }
  // Load fields
  if (data.entryPrice) document.getElementById('entryPrice').value = data.entryPrice;
  if (data.positionSize) document.getElementById('positionSize').value = data.positionSize;
  if (data.stopLoss) document.getElementById('stopLoss').value = data.stopLoss;
  if (data.takeProfit) document.getElementById('takeProfit').value = data.takeProfit;
  if (data.notes) document.getElementById('strategyNote').value = data.notes;
  if (data.mood) selectMood(document.querySelector('.mood-btn[data-mood="' + data.mood + '"]'), false);
  // Futures fields
  if (data.leverage) document.getElementById('leverage').value = data.leverage;
  if (data.margin) document.getElementById('margin').value = data.margin;
  if (data.gridLower) document.getElementById('gridLower').value = data.gridLower;
  if (data.gridUpper) document.getElementById('gridUpper').value = data.gridUpper;
  if (data.gridCount) document.getElementById('gridCount').value = data.gridCount;
  calculateRR();
}

function getData() {
  const key = STRATEGY_KEY + '_' + currentMode;
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : {};
}

function saveLocalData() {
  const checklist = Array.from(document.querySelectorAll('.checklist input[type="checkbox"]')).map(cb => cb.checked);
  const data = {
    checklist: checklist,
    entryPrice: document.getElementById('entryPrice').value,
    positionSize: document.getElementById('positionSize').value,
    stopLoss: document.getElementById('stopLoss').value,
    takeProfit: document.getElementById('takeProfit').value,
    notes: document.getElementById('strategyNote').value,
    mood: document.querySelector('.mood-btn.active')?.dataset.mood || '',
    mode: currentMode
  };
  if (currentMode === 'futures') {
    data.leverage = document.getElementById('leverage')?.value || '';
    data.margin = document.getElementById('margin')?.value || '';
    data.gridLower = document.getElementById('gridLower')?.value || '';
    data.gridUpper = document.getElementById('gridUpper')?.value || '';
    data.gridCount = document.getElementById('gridCount')?.value || '';
  }
  localStorage.setItem(STRATEGY_KEY + '_' + currentMode, JSON.stringify(data));
}

function updateChecklist(cb) {
  cb.parentElement.classList.toggle('checked', cb.checked);
  saveLocalData();
}

function selectMood(btn, save = true) {
  if (!btn) return;
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (save) saveLocalData();
}

function calculateRR() {
  const entry = parseFloat(document.getElementById('entryPrice').value) || 0;
  const sl = parseFloat(document.getElementById('stopLoss').value) || 0;
  const tp = parseFloat(document.getElementById('takeProfit').value) || 0;
  if (entry > 0 && sl > 0 && tp > 0) {
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    const rr = risk > 0 ? (reward / risk).toFixed(2) : 0;
    document.getElementById('rrRatio').value = '1:' + rr;
  } else {
    document.getElementById('rrRatio').value = '自動計算';
  }
}

function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function addTradeRecord() {
  const symbol = document.getElementById('tradeSymbol').value.toUpperCase();
  const direction = document.getElementById('tradeDirection').value;
  const entry = parseFloat(document.getElementById('tradeEntry').value);
  const exit = parseFloat(document.getElementById('tradeExit').value);
  const result = document.getElementById('tradeResult').value;
  const rr = document.getElementById('tradeRR').value;
  const mood = document.getElementById('tradeMood').value;
  const notes = document.getElementById('tradeNotes').value;
  if (!symbol || !entry || !exit) {
    alert('請填寫幣種、入場價和出場價');
    return;
  }
  const records = getRecords();
  records.push({
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    symbol,
    direction,
    entry,
    exit,
    result,
    rr,
    mood,
    notes,
    mode: currentMode
  });
  localStorage.setItem(STRATEGY_KEY + '_' + currentMode + '_records', JSON.stringify(records));
  renderReviewTable();
  closeModal('addTradeModal');
  clearModalForm();
}

function getRecords() {
  const key = STRATEGY_KEY + '_' + currentMode + '_records';
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function renderReviewTable() {
  const tbody = document.querySelector('#reviewTable tbody');
  const records = getRecords();
  if (records.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:#8b949e;padding:20px;">尚無交易紀錄</td></tr>';
    return;
  }
  tbody.innerHTML = records.map(r => {
    const pnl = ((r.exit - r.entry) / r.entry * 100).toFixed(2);
    const isWin = r.result === 'win';
    const modeLabel = r.mode === 'futures' ? '合約' : '現貨';
    const modeClass = r.mode === 'futures' ? 'futures' : 'spot';
    return '<tr>' +
      '<td>' + r.date + '</td>' +
      '<td><span class="order-type-tag ' + modeClass + '">' + modeLabel + '</span></td>' +
      '<td>' + r.symbol + '</td>' +
      '<td><span class="tag ' + r.direction + '">' + (r.direction === 'buy' ? '多' : '空') + '</span></td>' +
      '<td>$' + r.entry.toFixed(2) + '</td>' +
      '<td>$' + r.exit.toFixed(2) + '</td>' +
      '<td><span class="tag ' + (isWin ? 'win' : 'loss') + '">' + (isWin ? '獲利' : '虧損') + ' ' + pnl + '%</span></td>' +
      '<td>' + (r.rr || '-') + '</td>' +
      '<td>' + (r.mood || '-') + '</td>' +
      '<td><button class="delete-btn" onclick="deleteRecord(' + r.id + ')">&#10005;</button></td>' +
    '</tr>';
  }).join('');
}

function deleteRecord(id) {
  if (!confirm('確定刪除這筆紀錄？')) return;
  let records = getRecords();
  records = records.filter(r => r.id !== id);
  localStorage.setItem(STRATEGY_KEY + '_' + currentMode + '_records', JSON.stringify(records));
  renderReviewTable();
}

function saveStrategyPlan() {
  saveLocalData();
  alert('交易計畫已儲存 (' + (currentMode === 'spot' ? '現貨' : '合約') + ')');
}

function resetStrategyPlan() {
  if (!confirm('確定重置當前' + (currentMode === 'spot' ? '現貨' : '合約') + '交易計畫？')) return;
  document.querySelectorAll('.checklist input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
    cb.parentElement.classList.remove('checked');
  });
  document.getElementById('entryPrice').value = '';
  document.getElementById('positionSize').value = '';
  document.getElementById('stopLoss').value = '';
  document.getElementById('takeProfit').value = '';
  document.getElementById('strategyNote').value = '';
  document.getElementById('rrRatio').value = '自動計算';
  if (currentMode === 'futures') {
    document.getElementById('leverage').value = '';
    document.getElementById('margin').value = '';
    document.getElementById('gridLower').value = '';
    document.getElementById('gridUpper').value = '';
    document.getElementById('gridCount').value = '';
  }
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  saveLocalData();
}
function exportJournal() {
  const records = getRecords();
  if (records.length === 0) { alert('尚無交易紀錄可匯出'); return; }
  const csv = ['\uFEFF日期,幣種,方向,入場價,出場價,結果,R:R,情緒,備註'].concat(
    records.map(r => r.date + ',' + r.symbol + ',' + (r.direction === 'buy' ? '多' : '空') + ',' + r.entry + ',' + r.exit + ',' + (r.result === 'win' ? '獲利' : '虧損') + ',' + (r.rr || '-') + ',' + (r.mood || '-') + ',' + (r.notes || ''))
  ).join('');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'trading-journal-' + currentMode + '-' + new Date().toISOString().split('T')[0] + '.csv';
  link.click();
}

function clearJournal() {
  if (!confirm('確定清空所有' + (currentMode === 'spot' ? '現貨' : '合約') + '交易紀錄？此操作不可恢復！')) return;
  localStorage.removeItem(STRATEGY_KEY + '_' + currentMode + '_records');
  renderReviewTable();
}

function clearModalForm() {
  document.getElementById('tradeSymbol').value = '';
  document.getElementById('tradeEntry').value = '';
  document.getElementById('tradeExit').value = '';
  document.getElementById('tradeRR').value = '';
  document.getElementById('tradeMood').value = '';
  document.getElementById('tradeNotes').value = '';
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  switchStrategyMode('spot');
});
})();
