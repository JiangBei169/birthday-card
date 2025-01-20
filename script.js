// 配置
const CONFIG = {
    password: '1227',  // 设置你的密码
    authDuration: 1 * 60 * 60 * 1000,  // 登录有效期：24小时
    totalImages: 45,  // 图片总数
    slideInterval: 5000,  // 轮播间隔：5秒
    preloadImages: true  // 是否预加载图片
};

// 密码验证功能
function checkAccess() {
    const password = document.getElementById('password-input').value;
    const errorElement = document.getElementById('password-error');

    if (password === CONFIG.password) {
        // 密码正确
        document.getElementById('password-layer').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        
        // 初始化内容
        initializeSlideshow();
        new Firework();
        
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
        
        // 3秒后隐藏错误信息
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 3000);
    }
}

// 检查之前的登录状态
function checkPreviousLogin() {
    const lastAuth = localStorage.getItem('birthday_auth');
    const authHash = localStorage.getItem('birthday_auth_hash');
    
    if (lastAuth && authHash) {
        const now = Date.now();
        const authTime = parseInt(lastAuth);
        
        if (now - authTime < CONFIG.authDuration && 
            authHash === btoa(CONFIG.password)) {
            // 之前的登录仍然有效
            document.getElementById('password-layer').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
            initializeSlideshow();
            new Firework();
            return;
        }
    }
    
    // 清除过期或无效的认证
    localStorage.removeItem('birthday_auth');
    localStorage.removeItem('birthday_auth_hash');
    document.getElementById('password-layer').style.display = 'flex';
}

// 图片预加载
function preloadImages() {
    const container = document.createElement('div');
    container.className = 'preload-container';
    
    for (let i = 1; i <= CONFIG.totalImages; i++) {
        const img = new Image();
        img.src = `./images/${i}.jpg`;
        container.appendChild(img);
    }
    
    document.body.appendChild(container);
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

// 轮播图功能
let slideIndex = 1;
let slideInterval;
let imagesLoaded = 0;

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
                progressBar.style.display = 'none';
                startAutoSlide();
            }
        };
        
        img.src = `./images/${i}.jpg`;
        img.alt = `生日照片${i}`;
        
        slide.appendChild(img);
        container.appendChild(slide);
    }
    
    showSlides(slideIndex);
}

function changeSlide(n) {
    showSlides(slideIndex += n);
}

function showSlides(n) {
    const slides = document.getElementsByClassName("slides");
    
    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;
    
    // 移除所有活动类
    Array.from(slides).forEach(slide => {
        slide.style.display = "none";
        slide.classList.remove('active');
    });
    
    // 添加新的活动类
    slides[slideIndex-1].style.display = "block";
    slides[slideIndex-1].classList.add('active');
    
    document.querySelector('.slide-number').textContent = 
        `${slideIndex} / ${CONFIG.totalImages}`;
}

function startAutoSlide() {
    stopAutoSlide();
    slideInterval = setInterval(() => {
        // 只有当所有图片都加载完成时才自动滚动
        if (imagesLoaded === CONFIG.totalImages) {
            changeSlide(1);
        }
    }, CONFIG.slideInterval);
}

function stopAutoSlide() {
    if (slideInterval) clearInterval(slideInterval);
}

// 全屏功能
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

// 烟花效果类
class Firework {
    constructor() {
        this.canvas = document.getElementById('fireworks');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.createFireworkInterval = setInterval(() => this.createRandomFirework(), 800);
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createRandomFirework() {
        const x = Math.random() * this.canvas.width;
        const y = this.canvas.height + 10;
        const targetY = Math.random() * (this.canvas.height * 0.5);
        this.createFirework(x, y, x, targetY);
    }

    createFirework(x, y, targetX, targetY) {
        const particles = [];
        const angle = Math.atan2(targetY - y, targetX - x);
        const speed = 8;
        const velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };

        particles.push({
            x, y,
            targetX, targetY,
            velocity,
            type: 'launcher',
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            life: 1
        });

        this.particles.push(...particles);
    }

    explode(x, y) {
        const particles = [];
        const particleCount = 150;
        const angleIncrement = (Math.PI * 2) / particleCount;

        for (let i = 0; i < particleCount; i++) {
            const angle = angleIncrement * i;
            const speed = 3 + Math.random() * 3;
            particles.push({
                x, y,
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                },
                type: 'explosion',
                color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                life: 1,
                size: 3
            });
        }

        this.particles.push(...particles);
    }

    animate() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((particle, index) => {
            if (particle.type === 'launcher') {
                particle.x += particle.velocity.x;
                particle.y += particle.velocity.y;
                particle.velocity.y += 0.1;

                if (Math.abs(particle.x - particle.targetX) < 5 && 
                    Math.abs(particle.y - particle.targetY) < 5) {
                    this.explode(particle.x, particle.y);
                    this.particles.splice(index, 1);
                }
            } else {
                particle.x += particle.velocity.x;
                particle.y += particle.velocity.y;
                particle.velocity.y += 0.1;
                particle.life -= 0.02;

                if (particle.life <= 0) {
                    this.particles.splice(index, 1);
                    return;
                }

                this.ctx.fillStyle = particle.color;
                this.ctx.globalAlpha = particle.life;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 预加载图片
    if (CONFIG.preloadImages) {
        preloadImages();
    }
    
    // 密码输入框事件
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
    
    // 自动播放音乐
    const music = document.getElementById('bgMusic');
    music.volume = 0.5; // 设置音量为50%
});
