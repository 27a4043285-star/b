/**
 * FILE: js/controllers/ban-do/tim-duong/tim-duong.js
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
const startSel = document.getElementById('start');
const endSel = document.getElementById('end');
// Lấy thẻ hiển thị chữ (ID phải khớp với HTML)
const instructionBox = document.getElementById('instructionText');

let lastTurnSoundSegment = -1;

function playTurnAudio(turnText) {

    let file = "";

    if (turnText === "Rẽ trái") {
        file = "../../assets/media/pages/ban-do/tim-duong/re-trai.mp3";
    }
    else if (turnText === "Rẽ phải") {
        file = "../../assets/media/pages/ban-do/tim-duong/re-phai.mp3";
    }
    else if (turnText === "Đi thẳng") {
        file = "../../assets/media/pages/ban-do/tim-duong/di-thang.mp3";
    }

    if (!file) return null;

    const audio = new Audio(file);
    audio.play().catch(() => { });
    return audio; // 🔥 QUAN TRỌNG
}
function playArrivalAudio(placeName) {

    const fileName = `../../assets/media/pages/ban-do/tim-duong/đã đến ${placeName}.mp3`;

    const audio = new Audio(fileName);
    audio.play().catch(() => { });
    return audio;
}
// Hàm cập nhật chữ lên màn hình
function setInstruction(text) {
    if (instructionBox) {
        instructionBox.innerText = text;
        instructionBox.style.display = 'block';
    }
}

// Hàm tìm hướng dẫn rẽ
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

window.onload = async () => {
    mapData = await fetchMapData();
    window.mapData = mapData;
window.currentPath = [];
    if (!mapData) return alert("Lỗi tải dữ liệu!");

    Turn_Rules = mapData.rules || [];

    Object.keys(mapData.nodes).forEach(id => {
        const node = mapData.nodes[id];
        const name = node.name || id;
        if (!node.type || node.type.toLowerCase() === 'red') {
            startSel.add(new Option(name, id));
            endSel.add(new Option(name, id));
        }
    });


    initCanvas('mapCanvas');

    // KHI VIDEO BẮT ĐẦU CHẠY -> Hiện "Đi thẳng"
    videoEl.onloadeddata = () => {
        videoEl.playbackRate = savedSpeed;
        videoEl.play().catch(() => { });
        setInstruction("Đi thẳng");
        playTurnAudio("Đi thẳng"); // 🔥 thêm dòng này
    };

    // KHI VIDEO KẾT THÚC -> Xử lý hướng dẫn rẽ
    videoEl.onended = () => {
        // Xóa cache video cũ
        if (videoCache[currentSegmentIdx]) {
            URL.revokeObjectURL(videoCache[currentSegmentIdx]);
            delete videoCache[currentSegmentIdx];
        }
        // Kiểm tra xem còn đường đi không
        if (currentSegmentIdx < currentPath.length - 2) {
            const turnText = getNextTurnInstruction(currentSegmentIdx);
            // Hiện hướng dẫn
            setInstruction(turnText);
            // 3. DỪNG 1 GIÂY để người dùng đọc -> Rồi mới chuyển video
            const audio = playTurnAudio(turnText);

            // Nếu có audio → đợi audio kết thúc
            if (audio) {
                audio.onended = () => {
                    currentSegmentIdx++;
                    playSegment(currentSegmentIdx);
                };
            } else {
                // fallback
                setTimeout(() => {
                    currentSegmentIdx++;
                    playSegment(currentSegmentIdx);
                }, 500);
            }// 1000ms = 1 giây

        } else {

            const destinationId = currentPath[currentPath.length - 1];
            const destinationNode = mapData.nodes[destinationId];
            const destinationName = destinationNode?.name || destinationId;
            const text = `Đã đến ${destinationName}`;
            setInstruction(text);
            const audio = playArrivalAudio(destinationName);
            if (audio) {
                audio.onended = () => {
                    console.log("Đã phát xong audio đến nơi");
                };
            }
        }
    };

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

    document.getElementById('btnFind').onclick = () => {
        const s = startSel.value;
        const e = endSel.value;

        if (s && e) {
            if (s === e) return alert("Trùng điểm!");
            currentPath = findShortestPath(s, e, mapData.nodes, mapData.connections);

            if (currentPath.length === 0) {
                alert("Không có đường đi!");
                videoSection.style.display = 'none';
                return;
            }

            videoSection.style.display = 'block';
            videoEl.style.display = 'block';
            videoError.style.display = 'none';

            // Reset
            for (let k in videoCache) { URL.revokeObjectURL(videoCache[k]); delete videoCache[k]; }

            currentSegmentIdx = 0;
            lastTurnSound = ""; // 🔥 thêm dòng này
            playSegment(0);
        }
    };
};

async function playSegment(index) {
    if (index >= currentPath.length - 1) return;

    const u = currentPath[index];
    const v = currentPath[index + 1];

    // Lưu ý: Lúc mới gọi playSegment, video chưa load xong nên chưa setInstruction("Đi thẳng") ngay
    // Việc setInstruction("Đi thẳng") sẽ do sự kiện onloadeddata đảm nhận.

    const rawUrl = `../../assets/media/pages/ban-do/tim-duong/${u}_${v}.mp4`;

    videoError.style.display = 'none';
    drawMapState(currentPath, u, v, mapData.nodes, 0);

    if (videoCache[index]) {
        videoEl.src = videoCache[index];
    } else {
        videoEl.src = rawUrl;
    }

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