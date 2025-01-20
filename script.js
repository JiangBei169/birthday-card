// 密码配置
const CONFIG = {
    password: '1234', // 修改为你的密码
    authDuration: 24 * 60 * 60 * 1000, // 24小时有效期
    totalImages: 45 // 总图片数
};

// 密码验证功能
function checkAccess() {
    const password = document.getElementById('password-input').value;
    const errorElement = document.getElementById('password-error');

    if (password === CONFIG.password) {
        document.getElementById('password-layer').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        initializeSlideshow();
        new Firework();
        
        // 保存登录状态
        localStorage.setItem('birthday_auth', Date.now().toString());
        localStorage.setItem('birthday_auth_hash', btoa(password));
    } else {
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

// 轮播图功能
let slideIndex = 1;
let slideInterval;

function initializeSlideshow() {
    const container = document.getElementById('slides-container');
    
    // 动态创建图片元素
    for (let i = 1; i <= CONFIG.totalImages; i++) {
        const slide = document.createElement('div');
        slide.className = 'slides fade';
        
        const img = document.createElement('img');
        img.src = `./images/${i}.jpg`;
        img.alt = `生日照片${i}`;
        img.loading = 'lazy'; // 懒加载优化
        
        slide.appendChild(img);
        container.appendChild(slide);
    }
    
    showSlides(slideIndex);
    startAutoSlide();
}

function changeSlide(n) {
    showSlides(slideIndex += n);
}

function showSlides(n) {
    const slides = document.getElementsByClassName("slides");
    
    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;
    
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    
    slides[slideIndex-1].style.display = "block";
    document.querySelector('.slide-number').textContent = 
        `${slideIndex} / ${CONFIG.totalImages}`;
}

function startAutoSlide() {
    stopAutoSlide();
    slideInterval = setInterval(() => changeSlide(1), 3000);
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

// 事件监听器
document.addEventListener('DOMContentLoaded', () => {
    // 密码输入框回车事件
    document.getElementById('password-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAccess();
    });
    
    // 轮播图鼠标悬停暂停
    const slideshowContainer = document.querySelector('.slideshow-container');
    slideshowContainer.addEventListener('mouseenter', stopAutoSlide);
    slideshowContainer.addEventListener('mouseleave', startAutoSlide);
    
    // 检查登录状态
    checkPreviousLogin();
});

// 保留原有的 Firework 类代码...
