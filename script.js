// 配置
const CONFIG = {
    password: '1234',
    authDuration: 24 * 60 * 60 * 1000,
    totalImages: 45,
    slideInterval: 3000,
    preloadImages: true,
    batchSize: 5,  // 每批加载的图片数量
    loadingTimeout: 30000,  // 加载超时时间（30秒）
    retryTimes: 3,  // 加载失败重试次数
    retryDelay: 1000  // 重试延迟时间（毫秒）
};

// 全局变量
let slideIndex = 1;
let slideInterval;
let imagesLoaded = 0;
let loadingStartTime = 0;

// 加载状态更新
function updateLoadingStatus(loaded, total, status = '') {
    const progress = Math.floor((loaded / total) * 100);
    const progressBar = document.getElementById('loadingProgress');
    const loadingText = document.getElementById('loadingText');
    const loadingDetail = document.getElementById('loadingDetail');
    const loadingStatus = document.getElementById('loadingStatus');
    
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    if (loadingText) {
        loadingText.textContent = `正在加载美好回忆... ${progress}%`;
    }
    
    if (loadingDetail) {
        loadingDetail.textContent = `正在加载第 ${loaded} 张，共 ${total} 张`;
    }
    
    if (loadingStatus) {
        loadingStatus.textContent = status || `已加载 ${progress}%`;
    }
    
    console.log(`Loading progress: ${progress}%, ${loaded}/${total} images loaded`);
}

// 图片加载错误处理
function handleLoadError(img, index, retries = CONFIG.retryTimes) {
    return new Promise((resolve, reject) => {
        if (retries > 0) {
            const status = `图片 ${index} 加载失败，${retries} 次重试机会`;
            updateLoadingStatus(imagesLoaded, CONFIG.totalImages, status);
            
            setTimeout(async () => {
                try {
                    img.src = `./images/${index}.jpg`; // 重新获取图片路径
                    await new Promise((res, rej) => {
                        img.onload = res;
                        img.onerror = () => handleLoadError(img, index, retries - 1).then(res).catch(rej);
                    });
                    resolve();
                } catch (err) {
                    reject(err);
                }
            }, CONFIG.retryDelay);
        } else {
            console.error(`Failed to load image ${index} after all retries`);
            img.src = 'placeholder.jpg';
            reject(new Error(`Image ${index} failed to load`));
        }
    });
}

// 检查加载完成状态
function checkLoadingComplete() {
    console.log('Checking loading completion...');
    if (imagesLoaded >= CONFIG.totalImages) {
        console.log('All images loaded, hiding loading overlay');
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
                showSlides(1);
                startAutoSlide();
            }, 500);
        }
    }
}

// 修改初始化函数
function initializeSlideshow() {
    const container = document.getElementById('slides-container');
    let loadedCount = 0;
    const totalImages = CONFIG.totalImages;
    
    console.log('Starting slideshow initialization...');
    console.log(`Total images to load: ${totalImages}`);
    
    async function loadImage(index) {
        try {
            const slide = document.createElement('div');
            slide.className = 'slides fade';
            
            const img = new Image();
            const url = `./images/${index}.jpg`;
            
            console.log(`🔄 Loading image ${index} from: ${url}`);
            
            return new Promise((resolve, reject) => {
                img.onload = () => {
                    loadedCount++;
                    console.log(`✅ Image ${index} loaded successfully`);
                    updateLoadingStatus(loadedCount, totalImages, `成功加载第 ${index} 张图片`);
                    slide.appendChild(img);
                    container.appendChild(slide);
                    resolve();
                };
                
                img.onerror = (e) => {
                    console.error(`❌ Image ${index} failed to load:`, e);
                    reject(new Error(`Failed to load image ${index}`));
                };
                
                img.src = url;
            });
        } catch (error) {
            console.error(`Error loading image ${index}:`, error);
            throw error;
        }
    }
    
    async function loadBatch(startIndex, endIndex) {
        console.log(`Loading batch from ${startIndex} to ${endIndex}`);
        const promises = [];
        
        for (let i = startIndex; i <= endIndex; i++) {
            promises.push(loadImage(i));
        }
        
        try {
            await Promise.all(promises);
            console.log(`✅ Batch ${startIndex}-${endIndex} completed`);
            
            // 如果还有更多图片要加载，继续下一批
            if (endIndex < totalImages) {
                const nextStart = endIndex + 1;
                const nextEnd = Math.min(nextStart + CONFIG.batchSize - 1, totalImages);
                // 使用 setTimeout 来避免阻塞
                setTimeout(() => {
                    loadBatch(nextStart, nextEnd);
                }, 100);
            } else {
                console.log('✅ All images loaded successfully');
                checkLoadingComplete();
            }
        } catch (error) {
            console.error(`❌ Error in batch ${startIndex}-${endIndex}:`, error);
            // 尝试继续加载下一批
            if (endIndex < totalImages) {
                const nextStart = endIndex + 1;
                const nextEnd = Math.min(nextStart + CONFIG.batchSize - 1, totalImages);
                setTimeout(() => {
                    loadBatch(nextStart, nextEnd);
                }, 100);
            }
        }
    }
    
    // 开始加载第一批
    const firstBatchEnd = Math.min(CONFIG.batchSize, totalImages);
    loadBatch(1, firstBatchEnd);
}

// 轮播控制
function changeSlide(n) {
    showSlides(slideIndex += n);
}

function showSlides(n) {
    const slides = document.getElementsByClassName("slides");
    
    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;
    
    Array.from(slides).forEach(slide => {
        slide.style.display = "none";
    });
    
    slides[slideIndex-1].style.display = "block";
    document.querySelector('.slide-number').textContent = 
        `${slideIndex} / ${CONFIG.totalImages}`;
}

// 自动轮播
function startAutoSlide() {
    stopAutoSlide();
    slideInterval = setInterval(() => {
        changeSlide(1);
    }, CONFIG.slideInterval);
}

function stopAutoSlide() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
}

// 音乐控制
function toggleMusic() {
    const music = document.getElementById('bgMusic');
    const btn = document.getElementById('musicToggle');
    
    if (music.paused) {
        music.play();
        btn.classList.add('playing');
    } else {
        music.pause();
        btn.classList.remove('playing');
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

function checkAccess() {
    const input = document.getElementById('password-input').value;
    const hashedInput = CryptoJS.SHA256(input).toString();
    
    if (hashedInput === CONFIG.password) {
        localStorage.setItem('auth_time', Date.now());
        document.getElementById('password-layer').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        initializeSlideshow();
    } else {
        const error = document.getElementById('password-error');
        error.textContent = '密码错误，请重试';
        error.classList.add('animate__animated', 'animate__shakeX');
    }
}
