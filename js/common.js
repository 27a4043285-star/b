/* =================================================================
   FILE: js/components.js
   MÔ TẢ: File chứa HTML Header, Menu, Footer dùng chung cho toàn web
   ================================================================= */

/**
 * HÀM TẠO HEADER VÀ MENU
 * @param {string} rootPath - Đường dẫn về gốc (Ví dụ: '.', '..', '../..')
 * @param {string} activePage - Tên trang hiện tại để tô màu menu (Ví dụ: 'trang-chu', 'tin-tuc'...)
 */
function loadHeader(rootPath, activePage) {
    const headerHTML = `
    <div class="header-wrapper">
        <header class="top-header">
            <div class="container header-flex">
                <div class="logo-area">
                    <div class="logo-img">
                        <img src="${rootPath}/assets/images/common/icon.jpg" alt="Logo HVNH" class="logo-circle">
                    </div>
                    <div class="school-name">
                        <h1>Banking Academy of Vietnam</h1>
                        <p>Shining mind, open heart</p>
                    </div>
                </div>

                <div class="header-right">
                    <div class="hotline-area">
                        <i class="fas fa-phone-alt"></i> (+84) 24 35 726 384
                    </div>
                    <div class="search-box">
                        <input type="text" placeholder="Tìm kiếm thông tin...">
                        <button><i class="fas fa-search"></i></button>
                    </div>
                </div>
            </div>
        </header>
    </div>

    <div class="navbar-wrapper">
        <nav class="main-navbar">
            <div class="nav-container">
                <a href="${rootPath}/trang-chu.html" class="${activePage === 'trang-chu' ? 'active' : ''}">
                    <i class="fas fa-home"></i>&nbsp; TRANG CHỦ
                </a>
                <a href="${rootPath}/pages/gioi-thieu.html" class="${activePage === 'gioi-thieu' ? 'active' : ''}">GIỚI THIỆU</a>
                <a href="${rootPath}/pages/ban-do/ban-do.html" class="${activePage === 'ban-do' ? 'active' : ''}">BẢN ĐỒ SỐ</a> 
                <a href="${rootPath}/pages/tin-tuc.html" class="${activePage === 'tin-tuc' ? 'active' : ''}">TIN TỨC</a>
                <a href="${rootPath}/pages/huong-dan.html" class="${activePage === 'huong-dan' ? 'active' : ''}">HƯỚNG DẪN</a>
                <a href="${rootPath}/pages/lien-he.html" class="${activePage === 'lien-he' ? 'active' : ''}">LIÊN HỆ</a>
            </div>
        </nav>
    </div>
    `;

    // Chèn vào đầu thẻ body
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
}

/**
 * HÀM TẠO FOOTER
 * @param {string} rootPath - Đường dẫn về gốc
 */
function loadFooter(rootPath) {
    const SCHOOL_WEBSITE = "https://www.hvnh.edu.vn/"; // đổi nếu bạn muốn link khác
    const FACEBOOK_URL = "https://www.facebook.com/hocviennganhang1961";
    const YOUTUBE_URL = "https://www.youtube.com/@bav.1961";

    const footerHTML = `
    <div class="footer-wrapper">
        <footer class="container footer-flex">
            <div class="footer-left">
                <h3>BANKING ACADEMY OF VIETNAM</h3>
                <ul class="footer-info">
                    <li><span>+</span> Address: 12 Chua Boc Street, Kim Lien Ward, Hanoi</li>
                    <li><span>+</span> Tel: (+84) 24 35 726 384</li>
                    <li><span>+</span> Fax: (+84) 24 35 726 634</li>
                    <li><span>+</span> Email: truyenthong@hvnh.edu.vn</li>
                </ul>
            </div>

            <div class="footer-right">
                <h3>Connect With Us</h3>
                <div class="social-icons">
                    <a href="${FACEBOOK_URL}" target="_blank" rel="noopener noreferrer" title="Facebook">
                        <i class="fab fa-facebook-f"></i>
                    </a>
                    <a href="${SCHOOL_WEBSITE}" target="_blank" rel="noopener noreferrer" title="Zalo">
                        <span class="zalo-text">Zalo</span>
                    </a>
                    <a href="${YOUTUBE_URL}" target="_blank" rel="noopener noreferrer" title="Youtube">
                        <i class="fab fa-youtube"></i>
                    </a>
                    <a href="${SCHOOL_WEBSITE}" target="_blank" rel="noopener noreferrer" title="Website">
                        <i class="fas fa-globe"></i>
                    </a>
                </div>
            </div>
        </footer>

        <button class="scroll-top-btn" onclick="window.scrollTo({top: 0, behavior: 'smooth'});" title="Lên đầu trang">
            <i class="fas fa-chevron-up"></i>
        </button>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', footerHTML);
}