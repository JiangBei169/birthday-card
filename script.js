// 配置
const CONFIG = {
    password: '1227',
    totalImages: 45,
    slideInterval: 1000,
    autoPlayMusic: true,
    sakuraCount: 100,
    musicVolume: 0.5
};

// 全局变量
let slideIndex = 1;
let slideInterval;

// 烟花效果
class Firework {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.hue = Math.random() * 360;
        this.fadeOut = false;
        this.fadeOutDuration = 1000; // 1秒淡出时间
        this.createTime = Date.now(); // 记录创建时间
        this.lifetime = 5000; // 烟花存在5秒
        this.createParticles();
    }

    createParticles() {
        const container = ensureFireworksContainer();
        const particleCount = 80; // 减少粒子数量
        const angleStep = (Math.PI * 2) / particleCount;

        for (let i = 0; i < particleCount; i++) {
            const angle = angleStep * i + (Math.random() - 0.5) * 0.5;
            const velocity = 6 + Math.random() * 2;
            const size = 2 + Math.random() * 1.5;
            
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            
            const hue = this.hue + Math.random() * 20 - 10;
            particle.style.cssText = `
                position: absolute;
                left: ${this.x}px;
                top: ${this.y}px;
                width: ${size}px;
                height: ${size}px;
                background-color: hsl(${hue}, 100%, 70%);
                box-shadow: 0 0 ${size * 2}px hsl(${hue}, 100%, 70%);
                border-radius: 50%;
                pointer-events: none;
                mix-blend-mode: screen;
            `;
            
            this.particles.push({
                element: particle,
                x: this.x,
                y: this.y,
                velocity: velocity,
                angle: angle,
                decay: 0.015 + Math.random() * 0.01,
                gravity: 0.12
            });
            
            container.appendChild(particle);
        }
    }

    animate() {
        const currentTime = Date.now();
        
        // 检查是否需要开始淡出
        if (!this.fadeOut && currentTime - this.createTime >= this.lifetime) {
            this.fadeOut = true;
            this.fadeOutStartTime = currentTime;
        }

        if (this.fadeOut) {
            const fadeProgress = (currentTime - this.fadeOutStartTime) / this.fadeOutDuration;
            
            if (fadeProgress >= 1) {
                this.particles.forEach(particle => particle.element.remove());
                this.particles = [];
                return;
            }
            
            const opacity = 1 - fadeProgress;
            this.particles.forEach(particle => {
                particle.element.style.opacity = opacity * particle.alpha;
            });
        }

        this.particles.forEach(particle => {
            particle.velocity *= 0.97;
            particle.x += Math.cos(particle.angle) * particle.velocity;
            particle.y += Math.sin(particle.angle) * particle.velocity + particle.gravity;
            particle.alpha = Math.max(0, 1 - particle.decay * 20);
            
            particle.element.style.transform = `translate(${particle.x - this.x}px, ${particle.y - this.y}px)`;
            if (!this.fadeOut) {
                particle.element.style.opacity = particle.alpha;
            }
        });
        
        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.animate());
        }
    }
}

// 樱花效果
class Sakura {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'sakura';
        this.reset();
        document.getElementById('sakura-container').appendChild(this.element);
    }

    reset() {
        const size = 15 + Math.random() * 20;
        this.element.style.width = size + 'px';
        this.element.style.height = size + 'px';
        this.x = Math.random() * window.innerWidth;
        this.y = -30;
        this.rotation = Math.random() * 360;
        this.speed = 2 + Math.random() * 3;
        this.rotationSpeed = (Math.random() - 0.5) * 6;
        this.oscillationSpeed = 2.5 + Math.random();
        this.oscillationDistance = 150 + Math.random() * 100;
        this.element.style.opacity = 0.7 + Math.random() * 0.3;
    }

    animate() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
        this.x += Math.sin(this.y * 0.01) * this.oscillationDistance * 0.05;
        
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
        
        if (this.y > window.innerHeight) {
            this.reset();
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// 创建并管理动画效果
class AnimationManager {
    constructor() {
        this.sakuras = [];
        this.isPasswordScreen = true;
        this.fireworks = [];
        this.isShowingPhotos = false;
    }

    createFirework(x, y) {
        if (this.isPasswordScreen || (!this.isShowingPhotos && !this.isPasswordScreen)) {
            const firework = new Firework(x, y);
            this.fireworks.push(firework);
            firework.animate();
        }
    }

    createSakuras(count = CONFIG.sakuraCount) {
        if (this.isShowingPhotos) {
            for (let i = 0; i < count; i++) {
                const sakura = new Sakura();
                this.sakuras.push(sakura);
                sakura.animate();
            }
        }
    }

    clearEffects() {
        document.getElementById('sakura-container').innerHTML = '';
        document.getElementById('fireworks-container').innerHTML = '';
        this.sakuras = [];
        this.fireworks = [];
    }
}

// 初始化动画管理器
const animationManager = new AnimationManager();

// 检查访问权限
function checkAccess() {
    console.log('检查密码...');
    const input = document.getElementById('password-input').value;
    if (input === CONFIG.password) {
        console.log('密码正确，开始加载图片...');
        document.getElementById('password-layer').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        animationManager.isPasswordScreen = false;
        animationManager.isShowingPhotos = true;
        animationManager.createSakuras();
        
        // 初始化幻灯片并开始自动播放
        initializeSlideshow();
        
        if (CONFIG.autoPlayMusic) {
            playMusic();
        }
    } else {
        console.log('密码错误');
        const error = document.getElementById('password-error');
        if (error) {
            error.textContent = '密码错误，请重试';
            const input = document.getElementById('password-input');
            const rect = input.getBoundingClientRect();
            animationManager.createFirework(rect.left + rect.width / 2, rect.top);
        }
    }
}

// 幻灯片相关函数
function initializeSlideshow() {
    console.log('初始化幻灯片...');
    const container = document.getElementById('slides-container');
    container.innerHTML = '';
    let loadedImages = 0;
    let failedImages = 0;
    
    // 预加载所有图片
    function preloadImage(index) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = `images/${index}.jpg`;
            
            img.onload = () => {
                console.log(`图片 ${index} 加载成功`);
                resolve(img);
            };
            
            img.onerror = () => {
                console.error(`图片 ${index} 加载失败`);
                reject();
            };
        });
    }
    
    // 创建幻灯片
    function createSlide(index, img) {
        const slide = document.createElement('div');
        slide.className = 'slides';
        slide.appendChild(img);
        container.appendChild(slide);
        
        if (index === 1) {
            slide.classList.add('active');
        }
    }
    
    // 加载所有图片
    const imagePromises = [];
    for (let i = 1; i <= CONFIG.totalImages; i++) {
        imagePromises.push(
            preloadImage(i)
                .then(img => {
                    loadedImages++;
                    createSlide(i, img);
                })
                .catch(() => {
                    failedImages++;
                })
        );
    }
    
    // 等待所有图片加载完成
    Promise.all(imagePromises).then(() => {
        console.log(`所有图片加载完成。成功: ${loadedImages}, 失败: ${failedImages}`);
        if (loadedImages > 0) {
            showSlides(1);
            startAutoSlide();
        } else {
            console.error('没有图片加载成功');
        }
    });
}

function showSlides(n) {
    const slides = document.getElementsByClassName("slides");
    if (!slides.length) {
        console.error('没有找到幻灯片元素');
        return;
    }
    
    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;
    
    // 获取当前活动的幻灯片
    const currentSlide = document.querySelector('.slides.active');
    if (currentSlide) {
        currentSlide.classList.add('fade-out');
        currentSlide.classList.remove('active');
    }
    
    // 显示新的幻灯片
    const newSlide = slides[slideIndex-1];
    setTimeout(() => {
        Array.from(slides).forEach(slide => {
            slide.classList.remove('active', 'fade-out');
        });
        newSlide.classList.add('active');
    }, 50);
    
    console.log(`显示第 ${slideIndex}/${slides.length} 张图片`);
}

function changeSlide(n) {
    showSlides(slideIndex += n);
}

function startAutoSlide() {
    console.log('开始自动播放');
    stopAutoSlide();
    let currentSlideCount = 1;
    
    slideInterval = setInterval(() => {
        currentSlideCount++;
        if (currentSlideCount > CONFIG.totalImages) {
            stopAutoSlide();
            showEndingSequence();
            return;
        }
        changeSlide(1);
    }, CONFIG.slideInterval);
}

function stopAutoSlide() {
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
    }
}

// 音乐控制
function playMusic() {
    const music = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    
    // 设置音量
    music.volume = CONFIG.musicVolume;
    
    // 确保音乐循环播放
    music.loop = true;
    
    if (music.paused) {
        // 播放音乐
        const playPromise = music.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('音乐开始播放');
                musicToggle.classList.add('playing');
            }).catch(error => {
                console.log('自动播放失败:', error);
            });
        }
    } else {
        music.pause();
        musicToggle.classList.remove('playing');
    }
    
    // 添加错误处理
    music.addEventListener('error', (e) => {
        console.error('音乐播放错误:', e);
    });
    
    // 添加结束处理
    music.addEventListener('ended', () => {
        console.log('音乐播放结束，重新开始');
        music.currentTime = 0;
        music.play();
    });
}

// 添加结束序列函数
function showEndingSequence() {
    console.log('开始结束序列');
    // 设置状态
    animationManager.isShowingPhotos = false;
    
    // 淡出幻灯片
    const slideshow = document.querySelector('.slideshow-container');
    slideshow.style.transition = 'opacity 1s ease';
    slideshow.style.opacity = '0';
    
    // 清除所有效果
    animationManager.clearEffects();
    
    setTimeout(() => {
        slideshow.style.display = 'none';
        showGiftBox();
    }, 1000);
}

// 修改显示礼物盒函数
function showGiftBox() {
    console.log('显示礼物盒');
    const giftBox = document.createElement('div');
    giftBox.className = 'gift-box';
    giftBox.innerHTML = '🎁';
    document.body.appendChild(giftBox);
    
    // 淡入礼物盒
    requestAnimationFrame(() => {
        giftBox.style.display = 'block';
        giftBox.style.opacity = '0';
        requestAnimationFrame(() => {
            giftBox.style.transition = 'opacity 1s ease';
            giftBox.style.opacity = '1';
        });
    });

    // 点击礼物盒事件
    giftBox.onclick = () => {
        console.log('礼物盒被点击');
        // 淡出礼物盒
        giftBox.style.opacity = '0';
        setTimeout(() => {
            giftBox.remove();
            // 确保清除所有现有效果
            animationManager.clearEffects();
            // 开始烟花表演
            startGrandFinale();
        }, 1000);
    };
}

// 确保有烟花容器
function ensureFireworksContainer() {
    let container = document.getElementById('fireworks-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'fireworks-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999;
        `;
        document.body.appendChild(container);
    }
    return container;
}

// 修改烟花大结局函数
function startGrandFinale() {
    console.log('开始烟花表演');
    ensureFireworksContainer();
    animationManager.clearEffects();
    
    let startTime = Date.now();
    const duration = 10000;
    
    function createFireworks() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        
        // 每次只创建1-2个烟花
        const count = Math.random() < 0.5 ? 1 : 2;
        for (let i = 0; i < count; i++) {
            const x = Math.random() * window.innerWidth;
            const y = window.innerHeight * (0.3 + Math.random() * 0.3);
            const firework = new Firework(x, y);
            firework.animate();
        }
        
        if (elapsed < duration) {
            setTimeout(createFireworks, 400 + Math.random() * 200);
        } else {
            showBirthdayCake();
        }
    }
    
    createFireworks();
}

// 修改蛋糕显示函数，添加信封动画
function showBirthdayCake() {
    console.log('显示蛋糕');
    document.getElementById('fireworks-container').innerHTML = '';
    
    const cake = document.createElement('div');
    cake.className = 'cake';
    cake.innerHTML = `
        <div class="cake-emoji">🎂</div>
        <div class="birthday-text">生日快乐！</div>
    `;
    document.body.appendChild(cake);
    
    // 确保蛋糕在屏幕中央
    requestAnimationFrame(() => {
        const cakeHeight = cake.offsetHeight;
        cake.style.top = `${(window.innerHeight - cakeHeight) / 2}px`;
        cake.classList.add('show');
        setTimeout(() => {
            cake.querySelector('.birthday-text').classList.add('show');
            // 10秒后显示信封
            setTimeout(showLetter, 10000);
        }, 500);
    });
}

// 添加信封动画
function showLetter() {
    const cake = document.querySelector('.cake');
    if (cake) {
        cake.style.opacity = '0';
        setTimeout(() => cake.remove(), 1000);
    }

    // 创建信封
    const envelope = document.createElement('div');
    envelope.className = 'envelope';
    envelope.innerHTML = `
        <div class="envelope-front">
            <div class="envelope-flap"></div>
            <div class="envelope-content">To: My Love ❤️</div>
        </div>
    `;
    document.body.appendChild(envelope);

    // 信封打开动画
    setTimeout(() => {
        envelope.classList.add('open');
        
        // 显示信纸
        setTimeout(() => {
            const letter = document.createElement('div');
            letter.className = 'letter';
            document.body.appendChild(letter);

            // 逐字显示文本
            const text = "亲爱的，生日快乐！对不起，我们和好吧.我不该总是试图去改变你，是我的不对，爱人之间应该相互改变，未来的路我们一起走，我爱你，未来的路再难走，我们也会一路扶持，这些小事未来不会成为让你失落的原因。我爱你，亲爱的，生日快乐！";
            let index = 0;

            function typeLetter() {
                if (index < text.length) {
                    letter.textContent = text.substring(0, index + 1);
                    index++;
                    setTimeout(typeLetter, 100);
                }
            }

            typeLetter();
        }, 1000);
    }, 1000);
}

// 更新样式
const newStyle = document.createElement('style');
newStyle.textContent = `
    .envelope {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        width: 300px;
        height: 200px;
        background: linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%);
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        transition: all 1s ease;
        cursor: pointer;
        overflow: hidden;
    }

    .envelope.open {
        transform: translate(-50%, -50%) scale(1);
    }

    .envelope-front {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .envelope-flap {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 50%;
        background: linear-gradient(45deg, #fad0c4 0%, #ff9a9e 99%, #ff9a9e 100%);
        transform-origin: top;
        transition: transform 1s ease;
    }

    .envelope.open .envelope-flap {
        transform: rotateX(180deg);
    }

    .envelope-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 24px;
        color: #fff;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
        font-family: 'Dancing Script', cursive;
    }

    .letter {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        max-width: 600px;
        min-height: 300px; /* 确保有足够的高度显示所有文字 */
        padding: 40px;
        background: #fff;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        font-family: 'Dancing Script', cursive;
        font-size: 28px;
        line-height: 1.8;
        color: #ff6b6b;
        opacity: 0;
        animation: fadeIn 1s ease forwards;
        white-space: pre-wrap;
        text-align: center;
        overflow-y: auto; /* 如果内容过多允许滚动 */
        max-height: 80vh; /* 最大高度为视窗高度的80% */
    }

    @keyframes fadeIn {
        to { opacity: 1; }
    }

    .cake {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        opacity: 0;
        transition: all 1s ease;
    }
`;

document.head.appendChild(newStyle);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 密码输入框事件
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
    
    // 音乐控制事件
    document.getElementById('musicToggle').addEventListener('click', playMusic);
    
    // 开始动画
    animationManager.startFireworks();
    
    // 初始化音频元素
    const music = document.getElementById('bgMusic');
    music.volume = CONFIG.musicVolume;
    music.load();
    
    // 添加音频事件监听
    music.addEventListener('play', () => {
        console.log('音乐开始播放');
    });
    
    music.addEventListener('pause', () => {
        console.log('音乐暂停');
    });
});
