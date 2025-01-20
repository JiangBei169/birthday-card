// 配置
const CONFIG = {
    password: '1234',  // 设置访问密码
    authDuration: 24 * 60 * 60 * 1000,  // 登录有效期：24小时
    totalImages: 45,  // 图片总数
    slideInterval: 3000,  // 轮播间隔：3秒
    preloadImages: true,  // 是否预加载图片
    effects: {
        sakura: true,    // 樱花效果
        fireworks: true, // 烟花效果
        particles: true  // 粒子效果
    },
    messages: {
        typing1: "愿你的生日充满欢乐和惊喜！",
        typing2: "愿所有美好都与你相伴！"
    }
};

// 全局变量
let slideIndex = 1;
let slideInterval;
let imagesLoaded = 0;

// 密码验证功能
function checkAccess() {
    const password = document.getElementById('password-input').value;
    const errorElement = document.getElementById('password-error');

    if (password === CONFIG.password) {
        // 密码正确
        document.getElementById('password-layer').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        
        // 初始化内容
        initializeContent();
        
        // 开始播放音乐
        const music = document.getElementById('bgMusic');
        music.play().catch(err => console.log('Auto-play prevented'));
        
        // 保存登录状态
        localStorage.setItem('birthday_auth', Date.now().toString());
        localStorage.setItem('birthday_auth_hash', btoa(CONFIG.password));
    } else {
        // 密码错误
        errorElement.textContent = '密码错误，请重试';
        errorElement.style.display = 'block';
        document.getElementById('password-input').value = '';
        
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 3000);
    }
}

// script.js 继续

// 初始化所有内容
function initializeContent() {
    // 显示加载overlay
    document.getElementById('loadingOverlay').style.display = 'flex';
    
    // 初始化特效
    if (CONFIG.effects.particles) {
        initParticles();
    }
    if (CONFIG.effects.sakura) {
        initSakura();
    }
    if (CONFIG.effects.fireworks) {
        new Firework();
    }
    
    // 初始化轮播图
    initializeSlideshow();
    
    // 添加打字机效果
    const messageElement1 = document.querySelector('.typing-text');
    const messageElement2 = document.querySelector('.typing-text-2');
    typeMessage(messageElement1, CONFIG.messages.typing1);
    setTimeout(() => {
        typeMessage(messageElement2, CONFIG.messages.typing2);
    }, 4000);
}

// 图片预加载和轮播初始化
function initializeSlideshow() {
    const container = document.getElementById('slides-container');
    const progressBar = document.getElementById('loadingProgress');
    
    for (let i = 1; i <= CONFIG.totalImages; i++) {
        const slide = document.createElement('div');
        slide.className = 'slides fade';
        
        const img = new Image();
        img.onload = () => {
            imagesLoaded++;
            progressBar.style.width = `${(imagesLoaded/CONFIG.totalImages)*100}%`;
            
            if (imagesLoaded === CONFIG.totalImages) {
                document.getElementById('loadingOverlay').style.display = 'none';
                startAutoSlide();
            }
        };
        
        // 使用加密的图片URL
        if (CONFIG.imageEncryption && CONFIG.imageEncryption.enabled) {
            img.src = ImageCrypto.getImageUrl(i);
        } else {
            img.src = `./images/${i}.jpg`;
        }
        
        img.alt = `生日照片${i}`;
        slide.appendChild(img);
        container.appendChild(slide);
    }
    
    showSlides(slideIndex);
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 密码输入框回车事件
    document.getElementById('password-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAccess();
        }
    });
    
    // 轮播图事件
    const slideshowContainer = document.querySelector('.slideshow-container');
    slideshowContainer.addEventListener('mouseenter', stopAutoSlide);
    slideshowContainer.addEventListener('mouseleave', startAutoSlide);
    
    // 检查登录状态
    checkPreviousLogin();
});
