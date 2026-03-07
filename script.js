/* --- Reze OS V42 [Final Ultimate] - 音效完全版 --- */

// --- 全域變數 ---
let combatMode = false;
let particles = [];
const canvas = document.getElementById('fx-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// --- 記憶體設定 ---
const MEMORY = {
    SONG: 'reze_saved_song_url',
    LOG: 'reze_saved_log'
};

// --- 音效系統設定 (SFX System) ---
// 請確保你的資料夾內有這三個檔案，否則沒聲音
const SFX = {
    hover: new Audio('hover.mp3'),  // 滑鼠滑過
    click: new Audio('click.mp3'),  // 點擊確認
    boom:  new Audio('boom.mp3')    // 戰鬥模式/爆炸
};

// 音量調整 (0.0 ~ 1.0) -> 避免嚇到自己
SFX.hover.volume = 0.2; // 輕微的聲音
SFX.click.volume = 0.4; // 清楚的機械聲
SFX.boom.volume  = 0.6; // 震撼的聲音

// 預設歌曲
const DEFAULT_SONG = "https://open.spotify.com/embed/artist/38WbKH6oKAZskBhqDFA8Uj?utm_source=generator";

// --- 初始化 ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("Reze System: 系統啟動中 (含音效模組)...");

    loadMemory();
    initClock();
    startRezeStatusLoop();
    bindEvents();
    
    // 綁定所有互動音效
    initInteractionSounds();

    if (canvas) {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        animateParticles();
        document.addEventListener('mousemove', handleMouseMove);
    }
});

/* --- 0. 音效觸發函式 --- */
function playSound(type) {
    // 簡單的防錯機制
    if (SFX[type]) {
        SFX[type].currentTime = 0; // 每次播放都從頭開始 (適合快速連點)
        SFX[type].play().catch(e => console.log("等待使用者互動後才能播放音效"));
    }
}

// 自動幫所有按鈕加音效
function initInteractionSounds() {
    // 針對所有 App 圖示、按鈕、輸入框加入滑過與點擊音效
    const interactiveElements = document.querySelectorAll('.app-icon, .ignite-btn, .choker-pin, .log-trigger, .search-icon, .fa-floppy-disk');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => playSound('hover'));
        el.addEventListener('click', () => playSound('click'));
    });
}

/* --- 1. 核心記憶功能 --- */
function loadMemory() {
    console.log("正在讀取記憶...");
    const savedSong = localStorage.getItem(MEMORY.SONG);
    const frame = document.getElementById('spotify-frame');
    const container = document.getElementById('spotify-container');
    const disc = document.getElementById('disc');

    if (frame) {
        if (savedSong && savedSong.includes('embed')) {
            frame.src = savedSong;
            if(container) container.classList.add('active');
            if(disc) disc.classList.add('playing');
        } else {
            frame.src = DEFAULT_SONG;
        }
    }

    const savedLog = localStorage.getItem(MEMORY.LOG);
    const logInput = document.getElementById('logInput');
    if (savedLog && logInput) logInput.value = savedLog;
}

function handleSpotifySearch(e) {
    if (e.key === 'Enter') {
        playSound('click'); // 音效
        let val = e.target.value.trim();
        const frame = document.getElementById('spotify-frame');
        
        if (!val || !frame) return;

        if (val.includes('open.spotify.com') && !val.includes('/embed')) {
            val = val.replace('/track/', '/embed/track/')
                     .replace('/playlist/', '/embed/playlist/')
                     .replace('/album/', '/embed/album/');
        }
        if (val.indexOf('?') > -1) val = val.split('?')[0]; 

        frame.src = val;
        localStorage.setItem(MEMORY.SONG, val);
        e.target.value = ''; 
        ensureMusicPlayingState();
    }
}

function ensureMusicPlayingState() {
    const container = document.getElementById('spotify-container');
    const disc = document.getElementById('disc');
    if (container) container.classList.add('active');
    if (disc) disc.classList.add('playing');
}

/* --- 2. 事件綁定 --- */
function bindEvents() {
    const startBtn = document.getElementById('start-btn');
    if (startBtn) startBtn.addEventListener('click', startSystem);

    const safetyPin = document.getElementById('safety-pin');
    if (safetyPin) safetyPin.addEventListener('click', toggleCombatMode);

    const musicBtn = document.getElementById('music-btn');
    const disc = document.getElementById('disc');
    if (musicBtn) musicBtn.addEventListener('click', toggleMusicUI);
    if (disc) disc.addEventListener('click', toggleMusicUI);

    const spotifyInput = document.getElementById('spotify-input');
    if (spotifyInput) spotifyInput.addEventListener('keypress', handleSpotifySearch);

    const gInput = document.getElementById('g-search-input');
    const gIcon = document.getElementById('g-search-icon');
    if (gInput) gInput.addEventListener('keypress', (e) => { 
        if (e.key === 'Enter') { playSound('click'); executeSearch(); } 
    });
    if (gIcon) gIcon.addEventListener('click', executeSearch);

    const logBtn = document.getElementById('log-btn');
    const saveLogBtn = document.getElementById('save-log-btn');
    const logInput = document.getElementById('logInput');
    
    if (logBtn) logBtn.addEventListener('click', () => {
        playSound('click');
        document.getElementById('logPanel').classList.toggle('active');
    });
    
    if (saveLogBtn) saveLogBtn.addEventListener('click', saveLog);
    if (logInput) logInput.addEventListener('blur', saveLog);
}

function saveLog() {
    playSound('click'); // 存檔音效
    const input = document.getElementById('logInput');
    if (input) {
        localStorage.setItem(MEMORY.LOG, input.value);
        const btn = document.getElementById('save-log-btn');
        if(btn) btn.style.color = "var(--accent)";
        setTimeout(() => { if(btn) btn.style.color = ""; }, 500);
    }
}

/* --- 3. 系統功能 --- */
function startSystem() {
    // 這一點擊非常重要，它解鎖了瀏覽器的音效播放權限
    playSound('click'); 
    
    const bootScreen = document.getElementById('boot-screen');
    if (bootScreen) {
        bootScreen.style.opacity = "0";
        bootScreen.style.transform = "scale(1.1)";
        setTimeout(() => { bootScreen.style.display = "none"; }, 800);
    }
}

function initClock() {
    updateTime();
    setInterval(updateTime, 1000);
}

function updateTime() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const clock = document.getElementById('clock');
    if (clock) clock.innerText = `${h}:${m}`;
    const dateEl = document.getElementById('date');
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    if (dateEl) dateEl.innerText = `${now.getMonth() + 1}月${now.getDate()}日 (${days[now.getDay()]})`;
    updateGreeting(now.getHours());
}

function updateGreeting(hour) {
    const el = document.getElementById('greeting');
    if (!el) return;
    if (hour < 6) el.innerText = "深夜の任務か？";
    else if (hour < 11) el.innerText = "おはよう、レゼ。";
    else if (hour < 17) el.innerText = "こんにちは。";
    else el.innerText = "こんばんは、レゼ。";
}

function executeSearch() {
    const input = document.getElementById('g-search-input');
    if (input && input.value.trim()) {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(input.value.trim())}`, '_blank');
        input.value = '';
    }
}

function toggleMusicUI() {
    playSound('click');
    const container = document.getElementById('spotify-container');
    const disc = document.getElementById('disc');
    if (container) {
        container.classList.toggle('active');
        if (container.classList.contains('active') && disc) {
            disc.classList.add('playing');
        }
    }
}

/* --- 4. 戰鬥模式 (含音效) --- */
function toggleCombatMode() {
    combatMode = !combatMode;
    document.body.classList.toggle('combat-mode');
    
    // ★★★ 觸發音效 ★★★
    if (combatMode) {
        playSound('boom'); // 爆炸聲
    } else {
        playSound('click'); // 關閉聲
    }

    const statusText = document.getElementById('status-text');
    if (statusText) {
        statusText.innerText = combatMode ? "戦闘準備完了" : "通常モード";
        statusText.style.color = combatMode ? "var(--danger)" : "#fff";
    }

  if (combatMode) {
    // 爆炸時使用劇烈震動
    document.body.classList.add('red-alert', 'violent-shake');
    setTimeout(() => document.body.classList.remove('red-alert', 'violent-shake'), 600); // 震動久一點
    explodeParticles(window.innerWidth / 2, window.innerHeight / 2);
}
    updateRezeStatus();
}

const quotesNormal = ["君の心臓をもらう。", "田舎のネズミが好き...", "学校...楽しかったな。", "Safety pin: SECURE"];
const quotesCombat = ["Boom!", "皆殺しモード。", "ターゲット：排除開始。", "Danger Level: CRITICAL"];

function startRezeStatusLoop() { setInterval(updateRezeStatus, 6000); }
function updateRezeStatus() {
    const el = document.getElementById('reze-status-text');
    if (!el) return;
    const list = combatMode ? quotesCombat : quotesNormal;
    el.style.opacity = '0';
    setTimeout(() => {
        el.innerText = list[Math.floor(Math.random() * list.length)];
        el.style.opacity = '1';
        el.style.color = combatMode ? "var(--danger)" : "rgba(255,255,255,0.7)";
    }, 500);
}

/* --- 5. 視覺特效 (煙花 + 慢消散版) --- */
function resizeCanvas() { if(canvas){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }}

function handleMouseMove(e) {
    const bg = document.getElementById('bg-video');
    if(bg) {
        // 背景視差移動 (讓你的 video.mp4 跟著滑鼠動)
        const x = (window.innerWidth - e.pageX * 2) / 100;
        const y = (window.innerHeight - e.pageY * 2) / 100;
        bg.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
    }
    // 滑鼠軌跡 (少量)
    if(Math.random() > 0.8) particles.push(new Particle(e.pageX, e.pageY, 'trail'));
}

// 煙花配色 (蕾潔風格：紫、紅、青、白)
const FIREWORK_COLORS = ['#ff4d4d', '#a64dff', '#4dffdb', '#ffff66', '#ffffff'];

class Particle {
    constructor(x, y, type) {
        this.x = x; 
        this.y = y; 
        this.type = type;
        this.life = 1.0; 

        if(type === 'explode') {
            // --- 煙花物理設定 ---
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 12 + 2; // 速度快慢不一，製造層次
            
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            
            this.color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
            this.size = Math.random() * 4 + 2;
            
            // ★ 關鍵：極慢的消散速度 (讓煙花停留更久)
            this.decay = Math.random() * 0.005 + 0.005; 
            
            this.gravity = 0.05;  // 輕微重力 (飄落感)
            this.friction = 0.96; // 空氣阻力 (炸開後停滯在空中)

        } else if (type === 'shockwave') {
            // 衝擊波
            this.size = 1;
            this.maxSize = Math.random() * 100 + 200;
            this.decay = 0.05;
            this.vx = 0; this.vy = 0;
            this.color = '#fff';
        } else {
            // 滑鼠軌跡
            this.vx = (Math.random()-0.5)*2; 
            this.vy = (Math.random()-0.5)*2;
            this.size = Math.random() * 3 + 1;
            this.decay = 0.02;
            this.gravity = 0;
            this.friction = 1;
            this.color = combatMode ? 'rgba(255, 50, 50, 0.5)' : 'rgba(212, 163, 255, 0.5)';
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;

        if (this.type === 'explode') {
            this.vx *= this.friction; // 阻力讓速度變慢
            this.vy *= this.friction;
            this.vy += this.gravity;  // 重力往下掉
        } else if (this.type === 'shockwave') {
            this.size += 15; 
            if (this.size > this.maxSize) this.life = 0;
        }
    }

    draw() {
        if(!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.life;

        if (this.type === 'explode') {
            // 煙花光暈
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.fillStyle = this.color;
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
            ctx.fill();

        } else if (this.type === 'shockwave') {
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.life})`;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
            ctx.stroke();

        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.restore();
    }
}

// 觸發煙花
function explodeParticles(x, y) {
    // 產生大量粒子
    for(let i=0; i<150; i++) {
        particles.push(new Particle(x, y, 'explode'));
    }
    // 產生衝擊波
    particles.push(new Particle(x, y, 'shockwave'));
    
    // 畫面閃光 (需配合 HTML 的 #flash-overlay)
    triggerFlash();
}

function triggerFlash() {
    const flash = document.getElementById('flash-overlay');
    if(flash) {
        flash.style.opacity = '0.6';
        setTimeout(() => { flash.style.opacity = '0'; }, 150);
    }
}

// --- 修正版動畫迴圈 (讓影片透出來) ---
function animateParticles() {
    if(!ctx) return;

    // 🔴 關鍵修改在這裡：
    // 原本是塗黑 (fillRect)，現在改為「完全清除」 (clearRect)
    // 這樣 Canvas 就會變回透明，底下的 video.mp4 才能被看見
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for(let i=0; i<particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        // 當粒子壽命結束，將其移除
        if(particles[i].life <= 0){ 
            particles.splice(i,1); 
            i--; 
        }
    }
    requestAnimationFrame(animateParticles);
}
function updateClock() {
    const now = new Date();
    
    // 1. 獲取時間數字
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // 2. 獲取日期與星期
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const weekDay = days[now.getDay()];

    // 3. 更新 HTML 內容 (針對拆開後的 ID)
    const hEl = document.getElementById('clock-h');
    const mEl = document.getElementById('clock-m');
    const sEl = document.getElementById('clock-s');

    // ★ 只有數字變動時才更新 (防止閃爍的關鍵)
    if (hEl && hEl.innerText !== hours) hEl.innerText = hours;
    if (mEl && mEl.innerText !== minutes) mEl.innerText = minutes;
    if (sEl && sEl.innerText !== seconds) sEl.innerText = seconds;

    // 更新日期
    const dateEl = document.getElementById('date');
    if (dateEl) {
        const dateStr = `${month}月${day}日 (${weekDay})`;
        if (dateEl.innerText !== dateStr) dateEl.innerText = dateStr;
    }
}

// 記得確保這一行有在函數外面，讓時鐘啟動
setInterval(updateClock, 1000);
updateClock(); // 頁面載入時先執行一次
// --- Reze OS 核心語錄庫 ---
const rezeData = [
    // === 普通模式 (Normal) ===
    { ja: "田舎のネズミが好き...", ru: "Я люблю деревенских мышей...", mode: "normal", time: "any" },
    { ja: "君、学校は楽しい？", ru: "Тебе нравится школа?", mode: "normal", time: "day" },
    { ja: "コーヒー、淹れようか。", ru: "Сделать тебе кофе?", mode: "normal", time: "morning" },
    { ja: "このカフェ、教えたくなかったな。", ru: "Не хотела показывать это кафе.", mode: "normal", time: "any" },
    { ja: "私と...逃げない？", ru: "Не хочешь сбежать со мной?", mode: "normal", time: "any" },
    { ja: "魔法...見る？", ru: "Хочешь увидеть магию?", mode: "normal", time: "night" },
    { ja: "まだ起きてるの？", ru: "Всё ещё не спишь?", mode: "normal", time: "night" },
    { ja: "任務がない日は退屈だね。", ru: "Скучно без заданий.", mode: "normal", time: "day" },
    { ja: "君の匂い、覚えたよ。", ru: "Я запомнила твой запах.", mode: "normal", time: "any" },
    { ja: "ジェーンはどこ...", ru: "Где Джейн...", mode: "normal", time: "any" },

    // === 戰鬥模式 (Combat) ===
    { ja: "Boom!", ru: "Бум!", mode: "combat", time: "any" },
    { ja: "君の心臓をもらう。", ru: "Я заберу твое сердце.", mode: "combat", time: "any" },
    { ja: "全員、殺すね。", ru: "Я убью их всех.", mode: "combat", time: "any" },
    { ja: "Safety pin: RELEASED", ru: "Чека: СНЯТА", mode: "combat", time: "any" },
    { ja: "ターゲット：排除開始。", ru: "Цель: Начало устранения.", mode: "combat", time: "any" },
    { ja: "逃がさないよ。", ru: "Не уйдешь.", mode: "combat", time: "any" },
    { ja: "花火、綺麗だったね。", ru: "Фейерверк был красивым.", mode: "combat", time: "any" },
    { ja: "デンジ君...", ru: "Денджи...", mode: "combat", time: "any" },
    { ja: "死ぬまで殺し合おう？", ru: "Давай убивать друг друга до смерти?", mode: "combat", time: "night" },
    { ja: "ボンッ！", ru: "Взрыв!", mode: "combat", time: "any" }
];

// 點擊語錄時的反應
const touchReactions = [
    "触らないで。", // 別碰
    "くすぐったいよ。", // 好癢
    "爆発するよ？", // 會爆炸喔？
    "......"
];
let isTyping = false; // 防止重複觸發

// 主函數：更新狀態文字
function updateRezeStatus() {
    if (isTyping) return; // 如果正在打字，不要打斷

    const el = document.getElementById('reze-status-text');
    if (!el) return;

    // 1. 根據時間和模式篩選語錄
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 22 || currentHour <= 5;
    const isMorning = currentHour >= 6 && currentHour <= 10;
    
    // 篩選符合當下情境的語錄
    const availableQuotes = rezeData.filter(q => {
        // 先對模式 (Normal/Combat)
        const modeMatch = combatMode ? (q.mode === "combat") : (q.mode === "normal");
        if (!modeMatch) return false;

        // 再對時間 (Time)
        if (q.time === "any") return true;
        if (q.time === "night" && isNight) return true;
        if (q.time === "morning" && isMorning) return true;
        if (q.time === "day" && !isNight && !isMorning) return true;
        return false;
    });

    // 隨機選一句
    const data = availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
    if (!data) return;

    // 執行「間諜解碼」特效
    playSpyDecodeEffect(el, data.ru, data.ja);
}

// 特效核心：先打俄語 -> 停頓 -> 變日語
function playSpyDecodeEffect(element, russianText, japaneseText) {
    isTyping = true;
    element.innerHTML = "";
    element.classList.add('typing-cursor');
    element.style.color = combatMode ? "var(--danger)" : "var(--primary)"; // 俄語時的顏色

    let i = 0;
    // 階段一：打出俄語
    function typeRussian() {
        if (i < russianText.length) {
            element.innerText += russianText.charAt(i);
            i++;
            setTimeout(typeRussian, 50); // 打字速度
        } else {
            // 俄語打完，停留 0.8 秒
            setTimeout(() => {
                // 階段二：解碼成日語
                element.style.color = combatMode ? "var(--danger)" : "#fff"; // 變回白色/紅色
                typeJapanese(japaneseText); 
            }, 800);
        }
    }

    // 階段三：日語覆蓋
    function typeJapanese(text) {
        element.innerText = text; // 直接顯示日語 (或者你要逐字打也可以)
        // 這裡做一個簡單的閃爍效果代表解碼完成
        element.style.opacity = 0;
        setTimeout(() => element.style.opacity = 1, 100);
        setTimeout(() => {
            isTyping = false;
            element.classList.remove('typing-cursor');
        }, 200);
    }

    typeRussian();
}

// --- 爆炸特效監聽 ---
document.addEventListener('click', (e) => {
    // 只有在戰鬥模式點擊背景才爆炸
    if (typeof combatMode !== 'undefined' && combatMode) {
        createExplosion(e.clientX, e.clientY);
    }
});

// 點擊文字的互動彩蛋
document.getElementById('reze-status-text').addEventListener('click', (e) => {
    e.stopPropagation(); // 防止觸發背景爆炸
    const el = document.getElementById('reze-status-text');
    const reaction = touchReactions[Math.floor(Math.random() * touchReactions.length)];
    el.innerText = reaction;
});

function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.classList.add('explosion-particle');
    explosion.style.left = `${x}px`;
    explosion.style.top = `${y}px`;
    document.body.appendChild(explosion);

    // 爆炸音效 (可選，如果你有音檔)
    // const audio = new Audio('explosion.mp3');
    // audio.volume = 0.2;
    // audio.play();

    setTimeout(() => explosion.remove(), 600);
}

// 啟動循環
setInterval(updateRezeStatus, 7000); // 每 7 秒換一次話

    // --- 1. 爆彈核心溫度模擬 (動態跳動) ---
// --- 1. 爆彈核心溫度模擬 (緩慢飆升與冷卻) ---
    let currentCoreTemp = 38; // 預設常溫

    setInterval(() => {
        const tempEl = document.getElementById('core-temp');
        if (!tempEl) return;
        
        const isCombat = document.body.classList.contains('combat-mode');
        const targetTemp = isCombat ? 98 : 38; // 戰鬥目標 98度，平常 38度

        // 緩慢升降溫邏輯
        if (currentCoreTemp < targetTemp) {
            currentCoreTemp += (Math.random() * 3 + 1); // 每次升 1~4 度
        } else if (currentCoreTemp > targetTemp) {
            currentCoreTemp -= (Math.random() * 2 + 1); // 每次降 1~3 度
        }

        // 加入微小跳動增加真實感
        let displayTemp = currentCoreTemp + (Math.random() * 2 - 1);
        if (displayTemp > 99) displayTemp = 99; // 最高不超過 99

        tempEl.innerText = Math.floor(displayTemp);
    }, 600); // 每 0.6 秒更新一次，看起來更順暢

    // --- 2. 即時天氣與座標系統 ---
    async function fetchWeather(lat, lon, locationName) {
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const data = await res.json();
            const temp = data.current_weather.temperature;
            
            const weatherEl = document.getElementById('weather-text');
            const coordEl = document.getElementById('coordinates');
            if (weatherEl) weatherEl.innerText = `${locationName} ${temp}°C`;
            if (coordEl) coordEl.innerText = `LAT: ${lat.toFixed(2)} / LNG: ${lon.toFixed(2)}`;
        } catch (e) {
            const weatherEl = document.getElementById('weather-text');
            const coordEl = document.getElementById('coordinates');
            if(weatherEl) weatherEl.innerText = "WEATHER OFFLINE";
            if(coordEl) coordEl.innerText = "SIGNAL LOST";
        }
    }

    // 啟動天氣偵測 (抓取使用者位置，拒絕則預設顯示東京)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => { fetchWeather(position.coords.latitude, position.coords.longitude, "LOCAL:"); },
            (error) => { fetchWeather(35.6895, 139.6917, "TOKYO:"); }
        );
    } else {
        fetchWeather(35.6895, 139.6917, "TOKYO:");
    }

    // --- 2. 即時天氣、座標與動態圖示系統 ---
async function fetchWeather(lat, lon, locationName) {
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        
        const temp = data.current_weather.temperature;
        const code = data.current_weather.weathercode; // 獲取天氣代碼
        
        // 天氣代碼轉換為 FontAwesome 圖示
        let iconClass = "fa-solid fa-cloud"; // 預設多雲
        if (code === 0) {
            iconClass = "fa-solid fa-sun"; // 晴天
        } else if (code === 1 || code === 2 || code === 3) {
            iconClass = "fa-solid fa-cloud-sun"; // 部份時間有陽光
        } else if (code === 45 || code === 48) {
            iconClass = "fa-solid fa-smog"; // 大霧
        } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
            iconClass = "fa-solid fa-cloud-showers-heavy"; // 落雨
        } else if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
            iconClass = "fa-solid fa-snowflake"; // 落雪
        } else if (code >= 95 && code <= 99) {
            iconClass = "fa-solid fa-cloud-bolt"; // 雷暴
        }

        // 更新文字與圖示
        const weatherEl = document.getElementById('weather-text');
        const coordEl = document.getElementById('coordinates');
        const iconEl = document.getElementById('weather-icon');
        
        if (weatherEl) weatherEl.innerText = `${locationName} ${temp}°C`;
        if (coordEl) coordEl.innerText = `LAT: ${lat.toFixed(2)} / LNG: ${lon.toFixed(2)}`;
        if (iconEl) iconEl.className = iconClass; // 替換為對應天氣圖示

    } catch (e) {
        // 斷線或錯誤時的顯示
        const weatherEl = document.getElementById('weather-text');
        const coordEl = document.getElementById('coordinates');
        const iconEl = document.getElementById('weather-icon');
        
        if(weatherEl) weatherEl.innerText = "WEATHER OFFLINE";
        if(coordEl) coordEl.innerText = "SIGNAL LOST";
        if(iconEl) iconEl.className = "fa-solid fa-triangle-exclamation"; // 警告圖示
    }
}

// 啟動天氣偵測 (不變)
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => { fetchWeather(position.coords.latitude, position.coords.longitude, "LOCAL:"); },
        (error) => { fetchWeather(35.6895, 139.6917, "TOKYO:"); }
    );
} else {
    fetchWeather(35.6895, 139.6917, "TOKYO:");
}