/**
 * FILE: js/controllers/ban-do/tim-duong/tim-duong.js
 * Cập nhật: Tự động tour, dừng ở điểm Red 5 giây
 */
let Turn_Rules = [];
let mapData = {};
let currentPath = [];
let currentSegmentIdx = 0;
let savedSpeed = 1.0;
const videoCache = {};

const videoEl = document.getElementById('guideVideo');
const videoSection = document.getElementById('videoSection');
const videoError = document.getElementById('videoError');
const instructionBox = document.getElementById('instructionText');

// Các nút mới
const btnStart = document.getElementById('btnStart');
const btnContinue = document.getElementById('btnContinue');

// Biến quản lý timer
let autoContinueTimer = null;
let countdownInterval = null;

// --- CÁC HÀM ÂM THANH & HIỂN THỊ CHỮ (Giữ nguyên) ---
function playTurnAudio(turnText) {
    let file = "";
    if (turnText === "Rẽ trái") file = "../../assets/media/pages/ban-do/tim-duong/re-trai.mp3";
    else if (turnText === "Rẽ phải") file = "../../assets/media/pages/ban-do/tim-duong/re-phai.mp3";
    else if (turnText === "Đi thẳng") file = "../../assets/media/pages/ban-do/tim-duong/di-thang.mp3";

    if (!file) return null;
    const audio = new Audio(file);
    audio.play().catch(() => { });
    return audio;
}

function playArrivalAudio(placeName) {
    const fileName = `../../assets/media/pages/ban-do/tim-duong/đã đến ${placeName}.mp3`;
    const audio = new Audio(fileName);
    audio.play().catch(() => { });
    return audio;
}

function setInstruction(text) {
    if (instructionBox) {
        instructionBox.innerText = text;
        instructionBox.style.display = 'block';
    }
}

function getNextTurnInstruction(idx) {
    if (idx + 2 >= currentPath.length) return "Đến nơi";
    const prev = String(currentPath[idx]).trim();
    const curr = String(currentPath[idx + 1]).trim();
    const next = String(currentPath[idx + 2]).trim();

    const rule = Turn_Rules.find(r =>
        String(r.from).trim() === prev &&
        String(r.via).trim() === curr &&
        String(r.to).trim() === next
    );
    return rule ? rule.turn : "Đi thẳng";
}

// --- HÀM CHỈNH TỐC ĐỘ ---
window.setSpeed = (rate) => {
    savedSpeed = rate;
    if (videoEl) {
        videoEl.playbackRate = rate;
        document.querySelectorAll('.speed-controls button').forEach(btn => {
            btn.classList.remove('active-speed');
            if (parseFloat(btn.innerText) === rate) btn.classList.add('active-speed');
        });
    }
};

// --- KHỞI TẠO ---
window.onload = async () => {
    mapData = await fetchMapData();
    window.mapData = mapData;
    window.currentPath = [];
    if (!mapData) return alert("Lỗi tải dữ liệu!");

    Turn_Rules = mapData.rules || [];
    initCanvas('mapCanvas');

    // KHI VIDEO BẮT ĐẦU CHẠY
    videoEl.onloadeddata = () => {
        videoEl.playbackRate = savedSpeed;
        videoEl.play().catch(() => { });
        setInstruction("Đi thẳng");
        playTurnAudio("Đi thẳng");
    };

    // HÀM: Chuyển sang đoạn đường tiếp theo
    const goToNextSegment = () => {
        // Xóa các bộ đếm giờ nếu có
        clearInterval(countdownInterval);
        clearTimeout(autoContinueTimer);

        btnContinue.disabled = true;
        btnContinue.innerHTML = `<i class="fas fa-step-forward"></i> TIẾP TỤC`;

        currentSegmentIdx++;
        playSegment(currentSegmentIdx);
    };

    // NÚT TIẾP TỤC ĐƯỢC ẤN
    btnContinue.onclick = () => {
        if (!btnContinue.disabled) {
            goToNextSegment();
        }
    };

    // KHI VIDEO KẾT THÚC ĐOẠN ĐƯỜNG
    videoEl.onended = () => {
        if (videoCache[currentSegmentIdx]) {
            URL.revokeObjectURL(videoCache[currentSegmentIdx]);
            delete videoCache[currentSegmentIdx];
        }

        const isLastNode = currentSegmentIdx >= currentPath.length - 2;
        const reachedNodeId = currentPath[currentSegmentIdx + 1];

        // 1. Nếu là điểm cuối cùng của toàn bộ tour
        if (isLastNode) {
            const destName = mapData.nodes[reachedNodeId]?.name || reachedNodeId;
            setInstruction(`Kết thúc tour tại ${destName}`);
            playArrivalAudio(destName);
            btnContinue.style.display = 'none'; // Ẩn nút tiếp tục
            btnStart.innerHTML = `<i class="fas fa-redo"></i> ĐI LẠI TỪ ĐẦU`;
            btnStart.style.display = 'inline-block';
            return;
        }

        // 2. Lấy thông tin điểm vừa đến
        // 2. Lấy thông tin điểm vừa đến
        const nodeData = mapData.nodes[reachedNodeId];
        const excludedNodes = ['1.2', '12.1', '14.2', 'f20', 'f7', '8.2'];
        const nIdStr = String(reachedNodeId).toLowerCase();
        const nType = (nodeData.type || '').toLowerCase();

        // CHỈ coi là điểm dừng nếu type='red' VÀ không nằm trong danh sách loại trừ
        const isRedNode = (nType === 'red') && !excludedNodes.includes(nIdStr);
        if (isRedNode) {
            // ---> ĐẾN ĐIỂM CHÍNH (DỪNG LẠI 5 GIÂY) <---
            setInstruction(`Đã đến ${nodeData.name}`);
            playArrivalAudio(nodeData.name);

            // Bật nút tiếp tục
            btnContinue.disabled = false;
            let timeLeft = 5;
            btnContinue.innerHTML = `<i class="fas fa-step-forward"></i> TIẾP TỤC (${timeLeft}s)`;

            // Đếm ngược trên nút
            countdownInterval = setInterval(() => {
                timeLeft--;
                if (timeLeft > 0) {
                    btnContinue.innerHTML = `<i class="fas fa-step-forward"></i> TIẾP TỤC (${timeLeft}s)`;
                }
            }, 1000);

            // Tự động chuyển tiếp sau 5 giây
            autoContinueTimer = setTimeout(() => {
                goToNextSegment();
            }, 5000);

        } else {
            // ---> ĐẾN ĐIỂM CHUYỂN HƯỚNG BÌNH THƯỜNG (KHÔNG DỪNG) <---
            const turnText = getNextTurnInstruction(currentSegmentIdx);
            setInstruction(turnText);
            const audio = playTurnAudio(turnText);

            if (audio) {
                audio.onended = () => goToNextSegment();
            } else {
                setTimeout(goToNextSegment, 500);
            }
        }
    };

    // Cập nhật vị trí trên mini-map
    videoEl.ontimeupdate = () => {
        if (videoEl.duration) {
            const percent = videoEl.currentTime / videoEl.duration;
            const u = currentPath[currentSegmentIdx];
            const v = currentPath[currentSegmentIdx + 1];
            drawMapState(currentPath, u, v, mapData.nodes, percent);
        }
    };

    videoEl.onerror = () => {
        videoError.style.display = 'block';
        videoError.innerText = `Đang chuyển tiếp...`;
        setTimeout(() => { videoEl.onended(); }, 500);
    };

    // KHI ẤN NÚT BẮT ĐẦU TOUR
    btnStart.onclick = () => {
        // Bắt đầu từ cổng trong (ID: "1.1"), endId truyền là null để đi hết map
        currentPath = findShortestPath("1.1", null, mapData.nodes, mapData.connections);

        if (currentPath.length === 0) {
            alert("Không có dữ liệu đường đi!");
            return;
        }

        // Đổi giao diện
        btnStart.style.display = 'none'; // Ẩn nút bắt đầu đi
        btnContinue.style.display = 'inline-block'; // Hiện nút tiếp tục
        btnContinue.disabled = true; // Khóa lại cho đến khi tới điểm red
        btnContinue.innerHTML = `<i class="fas fa-step-forward"></i> TIẾP TỤC`;

        videoSection.style.display = 'block';
        videoEl.style.display = 'block';
        videoError.style.display = 'none';

        for (let k in videoCache) { URL.revokeObjectURL(videoCache[k]); delete videoCache[k]; }

        currentSegmentIdx = 0;
        playSegment(0);
    };
};

// --- HÀM TẢI VIDEO --- (Giữ nguyên)
async function playSegment(index) {
    if (index >= currentPath.length - 1) return;
    const u = currentPath[index];
    const v = currentPath[index + 1];
    const rawUrl = `../../assets/media/pages/ban-do/tim-duong/${u}_${v}.mp4`;

    videoError.style.display = 'none';
    drawMapState(currentPath, u, v, mapData.nodes, 0);

    if (videoCache[index]) videoEl.src = videoCache[index];
    else videoEl.src = rawUrl;

    preloadNextBlob(index + 1);
}

async function preloadNextBlob(nextIndex) {
    if (nextIndex >= currentPath.length - 1) return;
    if (videoCache[nextIndex]) return;
    const u = currentPath[nextIndex];
    const v = currentPath[nextIndex + 1];
    const url = `../../assets/media/pages/ban-do/tim-duong/${u}_${v}.mp4`;
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        videoCache[nextIndex] = URL.createObjectURL(blob);
    } catch (err) { }
}