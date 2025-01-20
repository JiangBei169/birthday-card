// 配置
const CONFIG = {
    password: '1234',
    authDuration: 24 * 60 * 60 * 1000,
    totalImages: 45,
    slideInterval: 5000, // 滚动间隔改为5秒
    preloadImages: true
};

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

// 优化的轮播图功能
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

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 预加载图片
    if (CONFIG.preloadImages) {
        preloadImages();
    }
    
    // 密码输入框事件
    document.getElementById('password-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAccess();
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

// 保留原有的密码验证和烟花效果代码...
