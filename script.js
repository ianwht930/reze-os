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
const DEFAULT_SONG = "https://open.spotify.com/embed/track/3khEEPRyBeOUabbmOPJzQE?si=4d62323f4625441d";

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