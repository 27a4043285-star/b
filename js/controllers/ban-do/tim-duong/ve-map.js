/**
 * FILE: js/controllers/ban-do/tim-duong/ve-map.js
 */
let ctx, canvas;

function initCanvas(canvasId) {
    canvas = document.getElementById(canvasId);
    ctx = canvas.getContext('2d');
    
    function resize() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();
}

/**
 * HÀM VẼ TRẠNG THÁI BẢN ĐỒ
 * @param {Array} fullPath - Danh sách toàn bộ các điểm (VD: [2, F4, F5, 3])
 * @param {string} uId - ID điểm đầu của đoạn ĐANG chạy
 * @param {string} vId - ID điểm cuối của đoạn ĐANG chạy
 * @param {Object} nodes - Dữ liệu tọa độ các điểm
 * @param {number} progress - Tiến độ của đoạn hiện tại (0.0 -> 1.0)
 */
function drawMapState(fullPath, uId, vId, nodes, progress) {
    // 1. Xóa sạch canvas cũ
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!fullPath || fullPath.length < 2) return;

    // 2. VẼ ĐƯỜNG MÀU ĐỎ (Vẽ nối tất cả các điểm trong lộ trình)
    ctx.beginPath();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#e74c3c'; // Màu đỏ
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    fullPath.forEach((id, i) => {
        const px = (nodes[id].x / 100) * canvas.width;
        const py = (nodes[id].y / 100) * canvas.height;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // 3. TÍNH VỊ TRÍ CON TRỎ (Chỉ nội suy giữa uId và vId)
    if (nodes[uId] && nodes[vId]) {
        const p1 = nodes[uId];
        const p2 = nodes[vId];

        const p1x = (p1.x / 100) * canvas.width;
        const p1y = (p1.y / 100) * canvas.height;
        
        const p2x = (p2.x / 100) * canvas.width;
        const p2y = (p2.y / 100) * canvas.height;

        // Công thức nội suy tọa độ: Start + (Distance * %)
        const curX = p1x + (p2x - p1x) * progress;
        const curY = p1y + (p2y - p1y) * progress;

        // 4. VẼ CON TRỎ (Dấu chấm cam)
        ctx.beginPath();
        ctx.arc(curX, curY, 8, 0, 2 * Math.PI); // Bán kính 8px
        ctx.fillStyle = '#f39c12'; // Màu cam
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff'; // Viền trắng
        ctx.stroke();
    }
}

// Hàm hỗ trợ vẽ đường tĩnh ban đầu (khi chưa chạy video)
function drawStaticPath(path, nodes) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (path.length < 2) return;
    
    // Gọi hàm chính với progress = 0 ở đoạn đầu tiên
    drawMapState(path, path[0], path[1], nodes, 0);
}