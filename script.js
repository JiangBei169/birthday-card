/* 在现有样式后添加以下内容 */
// 轮播图功能
let slideIndex = 1;
showSlides(slideIndex);

function changeSlide(n) {
    showSlides(slideIndex += n);
}

function showSlides(n) {
    let slides = document.getElementsByClassName("slides");
    
    if (n > slides.length) {
        slideIndex = 1;
    }
    if (n < 1) {
        slideIndex = slides.length;
    }
    
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    
    slides[slideIndex-1].style.display = "block";
}

// 自动播放
setInterval(() => {
    changeSlide(1);
}, 3000); // 每3秒切换一次

// 原有的 Firework 类代码保持不变...
.slideshow-container {
    max-width: 800px;
    position: relative;
    margin: 20px auto;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
}

.slides {
    display: none;
}

.slides img {
    width: 100%;
    height: 300px;
    object-fit: cover;
    border-radius: 10px;
}

/* 前后按钮样式 */
.prev, .next {
    cursor: pointer;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    padding: 16px;
    color: white;
    font-weight: bold;
    font-size: 18px;
    transition: 0.6s ease;
    border-radius: 0 3px 3px 0;
    user-select: none;
    background-color: rgba(0,0,0,0.3);
}

.next {
    right: 0;
    border-radius: 3px 0 0 3px;
}

.prev:hover, .next:hover {
    background-color: rgba(0,0,0,0.8);
}

/* 淡入淡出动画 */
.fade {
    animation-name: fade;
    animation-duration: 1.5s;
}

@keyframes fade {
    from {opacity: .4} 
    to {opacity: 1}
}
