"use strict";

/* ===============================
   タイマーの状態を表す定数
   =============================== */
const TIMER_STATE = {
  IDLE: "idle", // 初期状態・リセット直後
  RUNNING: "running", // 計測中
};

/* ===============================
   DOM要素の取得
   =============================== */

// 時刻表示（分:秒 と ミリ秒）
const timeMain = document.getElementById("time-main");
const timeMs = document.getElementById("time-ms");

// ボタン
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop"); // LAPボタンとして使用
const resetBtn = document.getElementById("reset");

// ラップ表示用リスト
const lapsUl = document.getElementById("laps");

/* ===============================
   状態を管理する変数
   =============================== */

let timerState = TIMER_STATE.IDLE; // 現在の状態
let intervalId = null; // setInterval のID
let startTime = 0; // スタートした瞬間の時刻（ms）
let laps = []; // ラップタイムを保存する配列

/* ===============================
   時刻表示を更新する関数
   =============================== */
/**
 * @param {number} minutes       分
 * @param {number} seconds       秒
 * @param {number} milliseconds ミリ秒（2桁）
 */
function updateDisplay(minutes, seconds, milliseconds) {
  timeMain.textContent =
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}`;

  timeMs.textContent = `.${String(milliseconds).padStart(2, "0")}`;
}

/* ===============================
   ミリ秒 → 表示用文字列に変換
   LAP表示専用
   =============================== */
/**
 * @param {number} ms 経過時間（ミリ秒）
 * @returns {string} "m:ss.xx" 形式の文字列
 */
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);

  return (
    `${minutes}:${String(seconds).padStart(2, "0")}.` +
    `${String(milliseconds).padStart(2, "0")}`
  );
}

/* ===============================
   ボタンの有効 / 無効を制御
   =============================== */
function updateUI() {
  // RUNNING中は START を押せない
  startBtn.disabled = timerState === TIMER_STATE.RUNNING;
  startBtn.classList.toggle("inactive", startBtn.disabled);

  // RUNNING中だけ LAP（STOP）を押せる
  stopBtn.disabled = timerState !== TIMER_STATE.RUNNING;
  stopBtn.classList.toggle("inactive", stopBtn.disabled);
}

/* ===============================
   ラップ表示
   =============================== */
function renderLaps() {
  // 一旦全削除して描き直す
  lapsUl.innerHTML = "";

  laps.forEach((lap, index) => {
    const li = document.createElement("li");

    // 最新が上に来るので番号は逆順
    li.innerHTML = `
  <span class="lap-index">Lap ${laps.length - index}</span>
  <span class="lap-time">${lap}</span>
`;

    lapsUl.appendChild(li);
  });
}

/* ===============================
   ラップを初期化
   =============================== */
function resetLaps() {
  laps = []; // データを消す
  lapsUl.innerHTML = ""; // 表示も消す
}

/* ===============================
   タイマーの心臓部分
   一定間隔で呼ばれる
   =============================== */
function tick() {
  // スタートからの経過時間（ms）
  const diff = Date.now() - startTime;

  // 分・秒・ミリ秒に分解
  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((diff % 1000) / 10);

  // 表示更新
  updateDisplay(minutes, seconds, milliseconds);
}

/* ===============================
   イベント処理
   =============================== */

// START：計測開始
startBtn.addEventListener("click", () => {
  if (timerState === TIMER_STATE.RUNNING) return;

  timerState = TIMER_STATE.RUNNING;
  startTime = Date.now(); // 今の時刻を基準にする
  intervalId = setInterval(tick, 10);
  updateUI();
});

// STOP（LAP）：止めずに記録
stopBtn.addEventListener("click", () => {
  if (timerState !== TIMER_STATE.RUNNING) return;

  const lapTime = Date.now() - startTime; // 今の経過時間
  laps.unshift(formatTime(lapTime)); // 最新を先頭に追加
  renderLaps();
});

// RESET：すべて初期状態に戻す
resetBtn.addEventListener("click", () => {
  clearInterval(intervalId);
  intervalId = null;

  timerState = TIMER_STATE.IDLE;
  startTime = 0;

  resetLaps();
  updateDisplay(0, 0, 0);
  updateUI();
});

/* ===============================
   初期表示
   =============================== */
updateDisplay(0, 0, 0);
updateUI();
