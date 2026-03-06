// Logic Slide Trang Chủ

let currentIndex = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;
const sliderWrapper = document.getElementById('sliderWrapper');
let autoSlideInterval;

function updateSlider() {
    // Dịch chuyển wrapper
    const offset = -currentIndex * 100;
    sliderWrapper.style.transform = `translateX(${offset}%)`;
}

function moveSlide(n) {
    currentIndex += n;

    if (currentIndex >= totalSlides) {
        currentIndex = 0;
    } else if (currentIndex < 0) {
        currentIndex = totalSlides - 1;
    }

    updateSlider();
    resetAutoSlide(); // Reset thời gian chờ khi user bấm nút
}

function startAutoSlide() {
    // Tự động chuyển sau 4 giây
    autoSlideInterval = setInterval(() => {
        moveSlide(1);
    }, 4000);
}

function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

// Khởi chạy
document.addEventListener('DOMContentLoaded', () => {
    updateSlider();
    startAutoSlide();
});