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
    const progress = (loaded / total) * 100;
    const progressBar = document.getElementById('loadingProgress');
    const loadingText = document.getElementById('loadingText');
    const loadingDetail = document.getElementById('loadingDetail');
    const loadingStatus = document.getElementById('loadingStatus');
    
    // 更新进度条
    progressBar.style.width = `${progress}%`;
    
    // 更新加载文本
    loadingText.textContent = `正在加载美好回忆... ${Math.round(progress)}%`;
    
    // 更新详细信息
    loadingDetail.textContent = `正在加载第 ${loaded} 张，共 ${total} 张`;
    
    // 更新状态信息
    if (status) {
        loadingStatus.textContent = status;
    }
    
    // 计算加载速度和剩余时间
    if (loadingStartTime === 0) {
        loadingStartTime = Date.now();
    } else {
        const elapsed = (Date.now() - loadingStartTime) / 1000;
        const speed = loaded / elapsed;
        const remaining = (total - loaded) / speed;
        if (remaining > 0) {
            loadingStatus.textContent = 
                `预计还需 ${Math.round(remaining)} 秒完成加载`;
        }
    }
}

// 图片加载错误处理
function handleLoadError(img, index, retries = CONFIG.retryTimes) {
    if (retries > 0) {
        const status = `图片 ${index} 加载失败，${retries} 次重试机会`;
        updateLoadingStatus(imagesLoaded, CONFIG.totalImages, status);
        
        setTimeout(() => {
            img.src = img.src; // 重试加载
        }, CONFIG.retryDelay);
        
        img.onerror = () => handleLoadError(img, index, retries - 1);
    } else {
        console.log(`Failed to load image ${index} after all retries`);
        imagesLoaded++;
        updateLoadingStatus(imagesLoaded, CONFIG.totalImages, 
            `图片 ${index} 加载失败，已跳过`);
        
        // 使用占位图
        img.src = 'placeholder.jpg';
        checkLoadingComplete();
    }
}

// 检查加载完成状态
function checkLoadingComplete() {
    if (imagesLoaded === CONFIG.totalImages) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 500);
        startAutoSlide();
    }
}

// 批量加载图片
function initializeSlideshow() {
    const container = document.getElementById('slides-container');
    let currentBatch = 0;
    loadingStartTime = Date.now();

    function loadImageBatch() {
        const start = currentBatch * CONFIG.batchSize + 1;
        const end = Math.min(start + CONFIG.batchSize - 1, CONFIG.totalImages);
        
        updateLoadingStatus(imagesLoaded, CONFIG.totalImages, 
            `正在加载第 ${start} - ${end} 批图片`);
        
        for (let i = start; i <= end; i++) {
            const slide = document.createElement('div');
            slide.className = 'slides fade';
            
            const img = new Image();
            
            img.onload = () => {
                imagesLoaded++;
                updateLoadingStatus(imagesLoaded, CONFIG.totalImages);
                
                if (imagesLoaded === CONFIG.totalImages) {
                    checkLoadingComplete();
                } else if (imagesLoaded % CONFIG.batchSize === 0) {
                    // 加载下一批
                    currentBatch++;
                    setTimeout(loadImageBatch, 100);
                }
            };
            
            img.onerror = () => handleLoadError(img, i);
            
            img.src = `./images/${i}.jpg`;
            slide.appendChild(img);
            container.appendChild(slide);
        }
    }

    // 设置加载超时
    setTimeout(() => {
        if (imagesLoaded < CONFIG.totalImages) {
            const remaining = CONFIG.totalImages - imagesLoaded;
            updateLoadingStatus(imagesLoaded, CONFIG.totalImages,
                `加载超时，${remaining} 张图片未能加载完成，将显示已加载内容`);
            
            setTimeout(() => {
                checkLoadingComplete();
            }, 2000);
        }
    }, CONFIG.loadingTimeout);

    // 开始加载第一批
    loadImageBatch();
    showSlides(slideIndex);
}

// ... 其他原有代码保持不变 ...

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
