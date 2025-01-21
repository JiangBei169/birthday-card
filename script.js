// 配置
const CONFIG = {
    password: '1234',
    totalImages: 45,
    slideInterval: 5000,
    autoPlayMusic: true
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
        const colors = ['#ff69b4', '#ff1493', '#ffb6c1', '#ffc0cb'];
        for (let i = 0; i < 50; i++) {
            const angle = (Math.PI * 2 * i) / 50;
            const velocity = 2 + Math.random() * 2;
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
                alpha: 1
            });
            
            document.getElementById('fireworks-container').appendChild(particle);
        }
    }

    animate() {
        this.particles.forEach(particle => {
            particle.x += Math.cos(particle.angle) * particle.velocity;
            particle.y += Math.sin(particle.angle) * particle.velocity + 0.1;
            particle.alpha -= 0.01;
            
            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
            particle.element.style.opacity = particle.alpha;
            
            if (particle.alpha <= 0) {
                particle.element.remove();
            }
        });
        
        this.particles = this.particles.filter(particle => particle.alpha > 0);
        
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
        const size = 10 + Math.random() * 15;
        this.element.style.width = size + 'px';
        this.element.style.height = size + 'px';
        this.x = Math.random() * window.innerWidth;
        this.y = -30;
        this.rotation = Math.random() * 360;
        this.speed = 1 + Math.random() * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 2;
        this.oscillationSpeed = 1.5 + Math.random();
        this.oscillationDistance = 50 + Math.random() * 50;
        this.element.style.opacity = 0.6 + Math.random() * 0.4;
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
    }

    createSakuras(count = 20) {
        for (let i = 0; i < count; i++) {
            const sakura = new Sakura();
            this.sakuras.push(sakura);
            sakura.animate();
        }
    }

    createFirework(x, y) {
        const firework = new Firework(x, y);
        firework.animate();
    }

    startFireworks() {
        if (this.isPasswordScreen) {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * (window.innerHeight * 0.6);
            this.createFirework(x, y);
            setTimeout(() => this.startFireworks(), 1000);
        }
    }
}

// 初始化动画管理器
const animationManager = new AnimationManager();

// 检查访问权限
function checkAccess() {
    const input = document.getElementById('password-input').value;
    if (input === CONFIG.password) {
        document.getElementById('password-layer').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        animationManager.isPasswordScreen = false;
        animationManager.createSakuras();
        initializeSlideshow();
        if (CONFIG.autoPlayMusic) {
            playMusic();
        }
    } else {
        const error = document.getElementById('password-error');
        if (error) {
            error.textContent = '密码错误，请重试';
            // 创建错误提示时的烟花效果
            const input = document.getElementById('password-input');
            const rect = input.getBoundingClientRect();
            animationManager.createFirework(rect.left + rect.width / 2, rect.top);
        }
    }
}

// 幻灯片相关函数
function initializeSlideshow() {
    const container = document.getElementById('slides-container');
    container.innerHTML = '';
    
    for (let i = 1; i <= CONFIG.totalImages; i++) {
        const slide = document.createElement('div');
        slide.className = 'slides';
        
        const img = document.createElement('img');
        img.src = `images/${i}.jpg`;
        img.onload = () => slide.classList.add('loaded');
        
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
    
    Array.from(slides).forEach(slide => slide.classList.remove('active'));
    slides[slideIndex-1].classList.add('active');
}

function changeSlide(n) {
    showSlides(slideIndex += n);
}

function startAutoSlide() {
    stopAutoSlide();
    slideInterval = setInterval(() => changeSlide(1), CONFIG.slideInterval);
}

function stopAutoSlide() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
}

// 音乐控制
function playMusic() {
    const music = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    
    if (music.paused) {
        music.play().then(() => {
            musicToggle.classList.add('playing');
        }).catch(error => {
            console.log('自动播放失败:', error);
        });
    } else {
        music.pause();
        musicToggle.classList.remove('playing');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 密码输入框事件
    document.getElementById('password-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAccess();
        }
    });
    
    // 幻灯片控制事件
    const slideshowContainer = document.querySelector('.slideshow-container');
    if (slideshowContainer) {
        slideshowContainer.addEventListener('mouseenter', stopAutoSlide);
        slideshowContainer.addEventListener('mouseleave', startAutoSlide);
    }
    
    // 音乐控制事件
    document.getElementById('musicToggle').addEventListener('click', playMusic);
    
    // 开始动画
    animationManager.startFireworks();
});
