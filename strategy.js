// Strategy Page Functions
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
  if (tab === 'market') {
    document.getElementById('marketTab').classList.add选派('active');
    document.getElementById('market-page').classList.add('active');
  } else {
    document.getElementById('strategyTab').classList.add('active');
    document.getElementById('strategy-page').classList.add('active');
  }
}

function updateChecklist(cb) {
  cb.parentElement.classList.toggle('checked', cb.checked);
  saveLocalData();
}

function selectMood(btn) {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  saveLocalData();
}

function calculateRR() {
  const entry = parseFloat(document.getElementById('entryPrice').value) || 0;
  const sl = parseFloat(document.getElementById('stopLoss').value) || 0;
  const tp = parseFloat(document.getElementById('takeProfit').value) || 0;
  if (entry > 0 && sl > 0 && tp > 0) {
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    document.getElementById('rrRatio').value = (reward / risk).toFixed(2) + ':1';
  }
}
 // Auto-calculate R:R on input
['entryPrice','stopLoss','takeProfit'].forEach(function(id) {
  var el = document.getElementById(id);
  if (el) el.addEventListener('input', calculateRR);
});

// ===== LOCAL STORAGE =====
function saveLocalData() {
  var data = {
    entryChecklist: Array.from(document.querySelectorAll('#entryChecklist input')).map(cb => cb.checked),
    exitChecklist: Array.from(document.querySelectorAll('#exitChecklist input')).map(cb => cb.checked),
    psyChecklist: Array.from(document.querySelectorAll('#psyChecklist input')).map(cb => cb.checked),
    entryPrice: document.getElementById('entryPrice').value,
    stopLoss: document.getElementById('stopLoss').value,
    takeProfit: document.getElementById('takeProfit').value,
    positionSize: document.getElementById('positionSize').value,
    strategyNote: document.getElementById('strategyNote').value,
    mood: document.querySelector('.mood-btn.active')?.dataset.mood || ''
  };
  localStorage.setItem('strategyData', JSON.stringify(data));
}

function loadLocalData() {
  var data = JSON.parse(localStorage.getItem('strategyData') || '{}');
  if (data.entryChecklist) {
    document.querySelectorAll('#entryChecklist input').forEach(function(cb, i) {
      cb.checked = data.entryChecklist[i] || false;
      updateChecklist(cb);
    });
  }
  if (data.exitChecklist) {
    document.querySelectorAll('#exitChecklist input').forEach(function(cb, i) {
      cb.checked = data.exitChecklist[i] || false;
      updateChecklist(cb);
    });
  }
  if (data.psyChecklist) {
    document.querySelectorAll('#psyChecklist input').forEach(function(cb, i) {
      cb.checked = data.psyChecklist[i] || false;
      updateChecklist(cb);
    });
  }
  if (data.entryPrice) document.getElementById('entryPrice').value = data.entryPrice;
  if (data.stopLoss) document.getElementById('stopLoss').value = data.stopLoss;
  if (data.takeProfit) document.getElementById('takeProfit').value = data.takeProfit;
  if (data.positionSize) document.getElementById('positionSize').value = data.positionSize;
  if (data.strategyNote) document.getElementById('strategyNote').value = data.strategyNote;
  if (data.mood) {
    document.querySelectorAll('.mood-btn').forEach(function(b) {
      if (b.dataset.mood === data.mood) b.classList.add('active');
    });
  }
  calculateRR();
}

// Load data on page load
window.addEventListener('load', function() {
  if (document.getElementById('strategy-page')) {
    loadLocalData();
    loadJournal();
  }
});

// ===== JOURNAL FUNCTIONS =====
function loadJournal() {
  var journal = JSON.parse(localStorage.getItem('tradeJournal') || '[]');
  var tbody = document.getElementById('journalBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  journal.forEach(function(rec, idx) {
    var row = document.createElement('tr');
    row.innerHTML = '<td>'+rec.date+'</td><td>'+rec.coin+'</td><td>'+rec.dir+'</td><td>'+rec.entry+'</td><td>'+rec.exit+'</td><td class="'+(rec.result==='Win'?'win':'loss')+'">'+rec.result+'</td><td>'+rec.rr+'</td><td>'+rec.mood+'</td><td><button onclick="deleteRecord('+idx+')" style="background:#f85149;color:#fff;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;">刪除</button></td>';
    tbody.appendChild(row);
  });
  updateStats();
}

function addTradeRecord() {
  var coin = prompt('幣種 (e.g. BTC):', 'BTC');
  if (!coin) return;
  var date = new Date().toISOString().slice(0,10);
  var dir = prompt('方向 (Long/Short):', 'Long');
  var entry = prompt('入場價格:', '0');
  var exit = prompt('出場價格:', '0');
  var result = parseFloat(exit) >= parseFloat(entry) ? 'Win' : 'Loss';
  var rr = prompt('R:R Ratio:', '1:1');
  var mood = document.querySelector('.mood-btn.active')?.textContent || '-';
  var journal = JSON.parse(localStorage.getItem('tradeJournal') || '[]');
  journal.push({ date: date, coin: coin, dir: dir, entry: entry, exit: exit, result: result, rr: rr, mood: mood });
  localStorage.setItem('tradeJournal', JSON.stringify(journal));
  loadJournal();
}

function deleteRecord(idx) {
  var journal = JSON.parse(localStorage.getItem('tradeJournal') || '[]');
  journal.splice(idx, 1);
  localStorage.setItem('tradeJournal', JSON.stringify(journal));
  loadJournal();
}

function clearJournal() {
  if (confirm('確定要清空所有交易紀錄嗎？此操作無法復原。')) {
    localStorage.removeItem('tradeJournal');
    loadJournal();
  }
}

function exportJournal() {
  var journal = JSON.parse(localStorage.getItem('tradeJournal') || '[]');
  var csv = ['Date,Coin,Direction,Entry,Exit,Result,R:R,Mood'].concat(
    journal.map(function(r) { return '"'+r.date+'","'+r.coin+'","'+r.dir+'",'+r.entry+','+r.exit+','+r.result+','+r.rr+',"'+r.mood+'"'; })
  ).join('\n');
  var blob = new Blob([csv], { type: 'text/csv' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'trading_journal.csv';
  a.click();
}

function updateStats() {
  var journal = JSON.parse(localStorage.getItem('tradeJournal') || '[]');
  var total = journal.length;
  var wins = journal.filter(function(r) { return r.result === 'Win'; }).length;
  var losses = total - wins;
  var wr = total > 0 ? (wins / total * 100).toFixed(0) : 0;
  var pf = losses > 0 ? (wins / losses).toFixed(2) : wins > 0 ? '∞' : '0';
  document.getElementById('totalTrades').textContent = total;
  document.getElementById('winRate').textContent = wr + '%';
  document.getElementById('profitFactor').textContent = pf;
}

function saveStrategyPlan() {
  saveLocalData();
  alert('✅余人，交易計畫已儲存至本地！');
}

function resetStrategyPlan() {
  if (confirm('確定要重置所有計畫資料嗎？')) {
    localStorage.removeItem('strategyData');
    location.reload();
  }
}
