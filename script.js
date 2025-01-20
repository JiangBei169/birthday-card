// 配置
const CONFIG = {
    password: '1227', // 设置你的密码
    totalImages: 45,  // 总图片数
    slideInterval: 3000, // 自动播放间隔（毫秒）
    autoPlayMusic: true  // 是否自动播放音乐
};

// 全局变量
let slideIndex = 1;
let slideInterval;

// 检查访问权限
function checkAccess() {
    const input = document.getElementById('password-input').value;
    if (input === CONFIG.password) {
        document.getElementById('password-layer').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        
        // 清除所有烟花
        document.getElementById('fireworks-container').innerHTML = '';
        
        initializeSlideshow();
        if (CONFIG.autoPlayMusic) {
            playMusic();
        }
    } else {
        const error = document.getElementById('password-error');
        if (error) {
            error.textContent = '密码错误，请重试';
        }
    }
}

// 初始化幻灯片
function initializeSlideshow() {
    const container = document.getElementById('slides-container');
    
    // 创建幻灯片
    for (let i = 1; i <= CONFIG.totalImages; i++) {
        const slide = document.createElement('div');
        slide.className = 'slides';
        
        const img = document.createElement('img');
        img.src = `images/${i}.jpg`;
        
        slide.appendChild(img);
        container.appendChild(slide);
    }
    
    // 显示第一张图片并开始自动播放
    showSlides(1);
    startAutoSlide();
}

// 显示指定的幻灯片
function showSlides(n) {
    const slides = document.getElementsByClassName("slides");
    
    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;
    
    for (let slide of slides) {
        slide.style.display = "none";
    }
    
    slides[slideIndex-1].style.display = "block";
}

// 切换图片
function changeSlide(n) {
    showSlides(slideIndex += n);
}

// 自动播放
function startAutoSlide() {
    stopAutoSlide();
    slideInterval = setInterval(() => {
        changeSlide(1);
    }, CONFIG.slideInterval);
}

// 停止自动播放
function stopAutoSlide() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 密码输入框回车事件
    document.getElementById('password-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAccess();
        }
    });
    
    // 幻灯片容器的鼠标事件
    const slideshowContainer = document.querySelector('.slideshow-container');
    if (slideshowContainer) {
        slideshowContainer.addEventListener('mouseenter', stopAutoSlide);
        slideshowContainer.addEventListener('mouseleave', startAutoSlide);
    }
    
    // 添加音乐控制按钮事件
    const musicToggle = document.getElementById('musicToggle');
    if (musicToggle) {
        musicToggle.addEventListener('click', playMusic);
    }
    
    // 处理音乐自动播放策略
    const music = document.getElementById('bgMusic');
    music.volume = 0.5; // 设置音量为50%
    
    // 监听音乐播放状态
    music.addEventListener('play', () => {
        musicToggle.classList.remove('paused');
    });
    
    music.addEventListener('pause', () => {
        musicToggle.classList.add('paused');
    });
    
    // 启动烟花效果
    startFireworks();
    
    // 启动樱花效果
    startSakura();
});

// 音乐控制
function playMusic() {
    const music = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    
    if (music.paused) {
        music.play().then(() => {
            musicToggle.classList.remove('paused');
        }).catch(error => {
            console.log('自动播放失败:', error);
        });
    } else {
        music.pause();
        musicToggle.classList.add('paused');
    }
}

// 全屏控制
function toggleFullscreen() {
    const container = document.querySelector('.slideshow-container');
    if (!document.fullscreenElement) {
        container.requestFullscreen();
        container.classList.add('fullscreen');
    } else {
        document.exitFullscreen();
        container.classList.remove('fullscreen');
    }
}

// 特效初始化
function initParticles() {
    particlesJS('particles-js', {
        particles: {
            number: { value: 80 },
            color: { value: '#ff1177' },
            shape: { type: 'circle' },
            opacity: {
                value: 0.5,
                random: true
            },
            size: {
                value: 3,
                random: true
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: true,
                out_mode: 'out'
            }
        }
    });
}

function initSakura() {
    new Sakura('.sakura-container', {
        colors: [
            {
                gradientColorStart: 'rgba(255, 183, 197, 0.9)',
                gradientColorEnd: 'rgba(255, 197, 208, 0.9)',
                gradientColorDegree: 120,
            }
        ],
        delay: 200,
        maxSize: 14,
        minSize: 10,
        quantity: 20
    });
}

// 烟花效果类
class Firework {
    constructor() {
        this.canvas = document.getElementById('fireworks');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.createFireworkInterval = setInterval(() => this.createRandomFirework(), 1500);
        this.animate();
    }

    // ... (烟花效果的其他方法保持不变)
}

// 打字机效果
function typeMessage(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// 图片预加载管理器
class ImagePreloader {
    constructor(totalImages) {
        this.totalImages = totalImages;
        this.loadedImages = 0;
        this.imageCache = new Map();
    }

    preloadImage(index) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = `./images/${index}.jpg`;
            
            img.onload = () => {
                this.loadedImages++;
                this.imageCache.set(index, img);
                updateLoadingStatus(this.loadedImages, this.totalImages);
                resolve(img);
            };
            
            img.onerror = () => handleLoadError(img, index)
                .then(resolve)
                .catch(reject);
            
            img.src = url;
        });
    }

    async preloadBatch(startIndex, batchSize) {
        const promises = [];
        for (let i = startIndex; i < startIndex + batchSize; i++) {
            if (i <= this.totalImages) {
                promises.push(this.preloadImage(i));
            }
        }
        return Promise.all(promises);
    }

    getImage(index) {
        return this.imageCache.get(index);
    }
}

// 音乐播放管理器
class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('bgMusic');
        this.playlist = [
            './music/birthday.mp3',
            './music/happy.mp3',
            './music/celebration.mp3'
        ];
        this.currentTrack = 0;
        this.isPlaying = false;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.audio.addEventListener('ended', () => this.playNext());
        document.addEventListener('click', () => this.tryAutoPlay(), { once: true });
    }

    async tryAutoPlay() {
        try {
            await this.audio.play();
            this.isPlaying = true;
            document.getElementById('musicToggle').classList.add('playing');
        } catch (err) {
            console.log('Auto-play prevented');
        }
    }

    toggle() {
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play();
        }
        this.isPlaying = !this.isPlaying;
        document.getElementById('musicToggle').classList.toggle('playing');
    }

    playNext() {
        this.currentTrack = (this.currentTrack + 1) % this.playlist.length;
        this.audio.src = this.playlist[this.currentTrack];
        if (this.isPlaying) {
            this.audio.play();
        }
    }
}

// 动画效果管理器
class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.setupAnimations();
    }

    setupAnimations() {
        // 蛋糕动画
        this.animations.set('cake', {
            element: document.querySelector('.cake'),
            play: () => {
                const cake = document.querySelector('.cake');
                cake.classList.add('animate__animated', 'animate__bounce');
                setTimeout(() => {
                    cake.classList.add('blowing-candle');
                }, 2000);
            }
        });

        // 礼物动画
        this.createGiftAnimation();
        
        // 气球动画
        this.createBalloonAnimation();
        
        // 彩带动画
        this.createConfettiAnimation();
    }

    createGiftAnimation() {
        const gift = document.createElement('div');
        gift.className = 'gift animate__animated';
        gift.innerHTML = '🎁';
        gift.onclick = () => {
            gift.classList.add('animate__rubberBand');
            this.showSurprise();
        };
        document.querySelector('.container').appendChild(gift);
    }

    createBalloonAnimation() {
        const colors = ['#ff1177', '#ff4488', '#ff99cc', '#ffccee'];
        for (let i = 0; i < 5; i++) {
            const balloon = document.createElement('div');
            balloon.className = 'balloon';
            balloon.style.backgroundColor = colors[i % colors.length];
            balloon.style.left = `${Math.random() * 100}%`;
            balloon.style.animationDelay = `${Math.random() * 2}s`;
            document.querySelector('.container').appendChild(balloon);
        }
    }

    createConfettiAnimation() {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-container';
        document.body.appendChild(confetti);
        
        for (let i = 0; i < 50; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = `${Math.random() * 100}%`;
            piece.style.animationDelay = `${Math.random() * 3}s`;
            confetti.appendChild(piece);
        }
    }

    showSurprise() {
        // 显示惊喜消息或特效
        const surprise = document.createElement('div');
        surprise.className = 'surprise animate__animated animate__fadeIn';
        surprise.textContent = '🎉 生日快乐！';
        document.body.appendChild(surprise);
        
        setTimeout(() => {
            surprise.classList.add('animate__fadeOut');
            setTimeout(() => surprise.remove(), 1000);
        }, 3000);
    }

    playAll() {
        this.animations.forEach(animation => animation.play());
    }
}

// 初始化所有功能
function initializeAll() {
    const preloader = new ImagePreloader(CONFIG.totalImages);
    const musicPlayer = new MusicPlayer();
    const animationManager = new AnimationManager();
    
    // 开始预加载图片
    preloader.preloadBatch(1, CONFIG.batchSize).then(() => {
        // 图片加载完成后播放动画
        animationManager.playAll();
    });
    
    // 绑定音乐控制
    document.getElementById('musicToggle').onclick = () => musicPlayer.toggle();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializeAll);

// 创建烟花
function createFirework(x, y) {
    const firework = document.createElement('div');
    firework.className = 'firework';
    firework.style.left = x + 'px';
    firework.style.top = y + 'px';
    
    const colors = ['#ff69b4', '#ff1493', '#ff69b4', '#ffb6c1'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    firework.style.setProperty('--color', color);
    
    document.getElementById('fireworks-container').appendChild(firework);
    
    setTimeout(() => {
        firework.remove();
    }, 1000);
}

// 创建樱花花瓣
function createSakura() {
    const sakura = document.createElement('div');
    sakura.className = 'sakura';
    
    // 随机大小
    const size = Math.random() * 10 + 5;
    sakura.style.width = size + 'px';
    sakura.style.height = size + 'px';
    
    // 随机起始位置
    sakura.style.left = Math.random() * window.innerWidth + 'px';
    sakura.style.top = '-10px';
    
    // 随机动画持续时间
    const duration = Math.random() * 3 + 2;
    sakura.style.animation = `fall ${duration}s linear forwards`;
    
    document.getElementById('sakura-container').appendChild(sakura);
    
    setTimeout(() => {
        sakura.remove();
    }, duration * 1000);
}

// 在密码输入界面随机生成烟花
function startFireworks() {
    setInterval(() => {
        if (document.getElementById('password-layer').style.display !== 'none') {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            createFirework(x, y);
        }
    }, 500);
}

// 持续生成樱花
function startSakura() {
    setInterval(() => {
        if (document.getElementById('main-content').style.display !== 'none') {
            createSakura();
        }
    }, 300);
}
