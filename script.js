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
        this.createParticles();
    }

    createParticles() {
        const colors = [
            '#ff69b4', '#ff1493', '#ffb6c1', '#ffc0cb', 
            '#ff0000', '#ffd700', '#ff4500', '#00ff00'
        ];
        for (let i = 0; i < 100; i++) {
            const angle = (Math.PI * 2 * i) / 100;
            const velocity = 5 + Math.random() * 5;
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            particle.style.left = this.x + 'px';
            particle.style.top = this.y + 'px';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            this.particles.push({
                element: particle,
                velocity: velocity,
                angle: angle,
                x: this.x,
                y: this.y,
                alpha: 1,
                gravity: 0.02
            });
            
            document.getElementById('fireworks-container').appendChild(particle);
        }
    }

    animate() {
        this.particles.forEach(particle => {
            particle.velocity *= 0.99;
            particle.x += Math.cos(particle.angle) * particle.velocity;
            particle.y += Math.sin(particle.angle) * particle.velocity + particle.gravity;
            particle.alpha -= 0.003;
            
            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
            particle.element.style.opacity = particle.alpha;
        });
        
        this.particles = this.particles.filter(particle => particle.alpha > 0);
        
        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.particles.forEach(particle => {
                if (particle.element.parentNode) {
                    particle.element.parentNode.removeChild(particle.element);
                }
            });
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
    }

    createSakuras(count = CONFIG.sakuraCount) {
        for (let i = 0; i < count; i++) {
            const sakura = new Sakura();
            this.sakuras.push(sakura);
            sakura.animate();
        }
    }

    createFirework(x, y) {
        if (this.isPasswordScreen) {
            const firework = new Firework(x, y);
            this.fireworks.push(firework);
            firework.animate();
        }
    }

    clearFireworks() {
        document.getElementById('fireworks-container').innerHTML = '';
        this.fireworks = [];
    }

    startFireworks() {
        if (this.isPasswordScreen) {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * (window.innerHeight * 0.6);
            this.createFirework(x, y);
            setTimeout(() => this.startFireworks(), 800);
        }
    }

    async startEndingSequence() {
        document.querySelector('.slideshow-container').style.display = 'none';
        
        const giftBox = document.createElement('div');
        giftBox.className = 'gift-box';
        giftBox.innerHTML = '🎁';
        document.body.appendChild(giftBox);
        giftBox.style.display = 'block';
        
        giftBox.onclick = async () => {
            giftBox.style.display = 'none';
            this.startGrandFinale();
            
            await new Promise(resolve => setTimeout(resolve, 10000));
            this.showCake();
        };
    }

    startGrandFinale() {
        console.log('开始烟花表演');
        
        // 清除所有现有效果
        animationManager.clearEffects();
        
        // 创建烟花的函数
        function createFireworks() {
            for (let i = 0; i < 5; i++) {
                const x = Math.random() * window.innerWidth;
                const y = window.innerHeight * (0.3 + Math.random() * 0.4);
                const firework = new Firework(x, y);
                firework.animate();
            }
        }
        
        // 立即创建第一组烟花
        createFireworks();
        
        // 持续创建烟花
        const fireworksInterval = setInterval(createFireworks, 300);
        
        // 10秒后显示蛋糕
        setTimeout(() => {
            clearInterval(fireworksInterval);
            // 清除所有烟花效果
            document.getElementById('fireworks-container').innerHTML = '';
            showBirthdayCake();
        }, 10000);
    }

    showCake() {
        console.log('显示蛋糕');
        const cake = document.createElement('div');
        cake.className = 'cake';
        cake.innerHTML = `
            <div class="cake-emoji">🎂</div>
            <div class="candle">️</div>
            <div class="birthday-text">生日快乐！</div>
        `;
        document.body.appendChild(cake);

        requestAnimationFrame(() => {
            cake.style.display = 'block';
            cake.style.opacity = '0';
            requestAnimationFrame(() => {
                cake.style.transition = 'opacity 1s ease';
                cake.style.opacity = '1';
                setTimeout(() => {
                    const text = cake.querySelector('.birthday-text');
                    if (text) {
                        text.classList.add('show');
                    }
                }, 500);
            });
        });
    }

    clearEffects() {
        document.getElementById('sakura-container').innerHTML = '';
        document.getElementById('fireworks-container').innerHTML = '';
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
    slideIndex = 1;
    
    // 预加载音乐
    const music = document.getElementById('bgMusic');
    music.load();
    
    // 加载所有图片
    for (let i = 1; i <= CONFIG.totalImages; i++) {
        const slide = document.createElement('div');
        slide.className = 'slides';
        
        const img = document.createElement('img');
        img.src = `images/${i}.jpg`;
        img.onload = () => {
            console.log(`图片 ${i} 加载完成`);
            if (i === 1) {
                setTimeout(() => {
                    slide.classList.add('active');
                }, 100);
            }
        };
        
        slide.appendChild(img);
        container.appendChild(slide);
    }
    
    showSlides(1);
    startAutoSlide();
}

function showSlides(n) {
    const slides = document.getElementsByClassName("slides");
    if (!slides.length) return;
    
    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;
    
    // 获取当前活动的幻灯片
    const currentSlide = document.querySelector('.slides.active');
    
    // 如果有当前幻灯片，添加淡出效果
    if (currentSlide) {
        currentSlide.classList.add('fade-out');
        currentSlide.classList.remove('active');
    }
    
    // 显示新的幻灯片
    const newSlide = slides[slideIndex-1];
    
    // 使用 setTimeout 确保转场动画顺滑
    setTimeout(() => {
        // 移除所有幻灯片的过渡类
        Array.from(slides).forEach(slide => {
            slide.classList.remove('active', 'fade-out');
        });
        
        // 激活新的幻灯片
        newSlide.classList.add('active');
    }, 50);
    
    console.log(`显示第 ${slideIndex} 张图片`);
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
            // 清除所有效果后再显示礼物盒
            animationManager.clearEffects();
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
    // 淡出幻灯片
    const slideshow = document.querySelector('.slideshow-container');
    slideshow.style.transition = 'opacity 1s ease';
    slideshow.style.opacity = '0';
    
    setTimeout(() => {
        slideshow.style.display = 'none';
        
        // 显示礼物盒
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
            // 开始烟花表演
            startGrandFinale();
        }, 1000);
    };
}

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
