// 配置
const CONFIG = {
    password: '1227',
    totalImages: 45,
    slideInterval: 5000,
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
        this.createParticles();
    }

    createParticles() {
        const container = ensureFireworksContainer();
        const particleCount = 150;
        const angleStep = (Math.PI * 2) / particleCount;
        const velocityBase = 8;

        for (let i = 0; i < particleCount; i++) {
            const angle = angleStep * i;
            const velocity = velocityBase + (Math.random() - 0.5) * 3;
            const size = 2 + Math.random() * 2;
            
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            
            const hue = this.hue + Math.random() * 30 - 15;
            particle.style.cssText = `
                position: absolute;
                left: ${this.x}px;
                top: ${this.y}px;
                width: ${size}px;
                height: ${size}px;
                background-color: hsl(${hue}, 100%, 60%);
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
                spread: Math.random() * 0.2 - 0.1,
                alpha: 1,
                decay: 0.01 + Math.random() * 0.01,
                gravity: 0.1,
                hue: hue
            });
            
            container.appendChild(particle);
        }
    }

    animate() {
        if (this.particles.length === 0) return;

        this.particles.forEach(particle => {
            particle.angle += particle.spread;
            particle.velocity *= 0.98;
            
            particle.x += Math.cos(particle.angle) * particle.velocity;
            particle.y += Math.sin(particle.angle) * particle.velocity + particle.gravity;
            
            particle.alpha -= particle.decay;
            
            particle.element.style.transform = `translate(${particle.x - this.x}px, ${particle.y - this.y}px)`;
            particle.element.style.opacity = particle.alpha;
        });
        
        this.particles = this.particles.filter(particle => {
            if (particle.alpha <= 0) {
                particle.element.remove();
                return false;
            }
            return true;
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
    
    // 确保有烟花容器
    ensureFireworksContainer();
    
    // 清除现有效果
    animationManager.clearEffects();
    
    let startTime = Date.now();
    const duration = 10000; // 10秒
    
    function createFireworks() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        
        // 创建多个烟花
        for (let i = 0; i < 3; i++) {
            const x = Math.random() * window.innerWidth;
            const y = window.innerHeight * (0.2 + Math.random() * 0.3);
            const firework = new Firework(x, y);
            firework.animate(); // 确保调用 animate
        }
        
        // 如果未到10秒，继续创建烟花
        if (elapsed < duration) {
            requestAnimationFrame(() => setTimeout(createFireworks, 300));
        } else {
            // 10秒后显示蛋糕
            showBirthdayCake();
        }
    }
    
    // 开始创建烟花
    createFireworks();
}

// 修改蛋糕显示函数，调整文字大小
function showBirthdayCake() {
    console.log('显示蛋糕');
    
    // 先清除所有烟花
    document.getElementById('fireworks-container').innerHTML = '';
    
    const cake = document.createElement('div');
    cake.className = 'cake';
    cake.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 1000;
    `;
    
    cake.innerHTML = `
        <div class="cake-emoji" style="font-size: 120px; margin-bottom: 20px;">🎂</div>
        <div class="birthday-text" style="
            font-family: 'Dancing Script', cursive;
            font-size: 3em;  /* 调整文字大小 */
            color: #fff;
            text-shadow: 0 0 20px #ff69b4;
            white-space: nowrap;  /* 确保文字在一行 */
        ">生日快乐！</div>
    `;
    
    document.body.appendChild(cake);
    
    requestAnimationFrame(() => {
        cake.classList.add('show');
        const text = cake.querySelector('.birthday-text');
        setTimeout(() => {
            text.classList.add('show');
        }, 500);
    });
}

// 添加相关的 CSS
const style = document.createElement('style');
style.textContent = `
    .cake {
        opacity: 0;
        transition: opacity 1s ease;
    }
    
    .cake.show {
        opacity: 1;
    }
    
    .birthday-text {
        opacity: 0;
        transform: translateY(30px);
        transition: all 1s ease;
    }
    
    .birthday-text.show {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

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
