// --- Dữ liệu Trò chơi ---
let gameState = {
    tempo: 50,          // Nhịp độ stream (0-100)
    feedbackRating: 0,  // Chỉ số Phản hồi (ảnh hưởng đến hành động)
    timer: 60,          // Thời gian chơi
    isRunning: false,
    intervalId: null,
    cooldownInteraction: 3000, // 3 giây cooldown nhận phản hồi
    lastInteractionTime: 0
};

// --- DOM Elements ---
const tempoDisplay = document.getElementById('tempo-display');
const feedbackRatingDisplay = document.getElementById('feedback-rating');
const timerDisplay = document.getElementById('timer-display');
const tempoBar = document.getElementById('tempo-bar');
const gameMessage = document.getElementById('game-message');
const feedbackLog = document.getElementById('feedback-log');
const audienceBtn = document.getElementById('audience-interaction-btn');
const stabilizeBtn = document.getElementById('stabilize-btn');
const amplifyBtn = document.getElementById('amplify-btn');
const startBtn = document.getElementById('start-btn');

// --- Cấu hình Phản hồi Khán giả ---
const FEEDBACKS = [
    { text: "Khán giả A: Cảm ơn Donate! +Tempo.", tempoChange: 8, ratingChange: 5, type: 'positive' },
    { text: "Khán giả B: Nội dung quá hay! +Tempo.", tempoChange: 5, ratingChange: 3, type: 'positive' },
    { text: "Khán giả C: Stream hơi chậm. -Tempo.", tempoChange: -7, ratingChange: -3, type: 'negative' },
    { text: "Khán giả D: Lag quá/Spam! -Tempo.", tempoChange: -10, ratingChange: -7, type: 'negative' },
    { text: "Khán giả E: Bình luận trung lập.", tempoChange: 0, ratingChange: 1, type: 'info' }
];

// --- Vòng lặp chính và Khởi tạo ---

function updateUI() {
    // Cập nhật Nhịp độ và Bar
    gameState.tempo = Math.max(0, Math.min(100, gameState.tempo));
    tempoDisplay.textContent = gameState.tempo;
    tempoBar.style.width = `${gameState.tempo}%`;

    // Cập nhật Rating
    feedbackRatingDisplay.textContent = gameState.feedbackRating;

    // Cập nhật màu thanh Tempo
    if (gameState.tempo < 40 || gameState.tempo > 60) {
        tempoDisplay.style.color = '#ff6b6b'; // Đỏ: Nguy hiểm
    } else {
        tempoDisplay.style.color = '#48cfad'; // Xanh lá: An toàn
    }

    // Kích hoạt nút Streamer
    const canUseAction = gameState.feedbackRating > 0;
    stabilizeBtn.disabled = !canUseAction;
    amplifyBtn.disabled = !canUseAction;
}

function gameLoop() {
    gameState.timer--;
    timerDisplay.textContent = gameState.timer;

    // Tự động mất Rating khi không có tương tác
    gameState.feedbackRating = Math.max(0, gameState.feedbackRating - 1);

    updateUI();

    if (gameState.timer <= 0) {
        clearInterval(gameState.intervalId);
        endGame();
    }
}

window.startGame = function() {
    if (gameState.isRunning) return;

    // Reset trạng thái
    gameState.tempo = 50;
    gameState.feedbackRating = 0;
    gameState.timer = 60;
    gameState.isRunning = true;
    feedbackLog.innerHTML = '';
    startBtn.style.display = 'none';
    audienceBtn.disabled = false;

    showMessage("Đang chơi...", 'info');

    // Kích hoạt vòng lặp chính (mỗi giây)
    gameState.intervalId = setInterval(gameLoop, 1000);
}

function endGame() {
    gameState.isRunning = false;
    audienceBtn.disabled = true;
    stabilizeBtn.disabled = true;
    amplifyBtn.disabled = true;
    startBtn.style.display = 'block';
    startBtn.textContent = "CHƠI LẠI";

    if (gameState.tempo >= 40 && gameState.tempo <= 60) {
        showMessage("CHIẾN THẮNG! Bạn đã giữ được sự cân bằng.", 'positive');
    } else {
        showMessage("THUA CUỘC! Nhịp độ stream bị mất kiểm soát.", 'negative');
    }
}


// --- Xử lý Tương tác Khán giả (Mô phỏng) ---

window.receiveAudienceFeedback = function() {
    if (!gameState.isRunning) return;
    const now = Date.now();
    if (now < gameState.lastInteractionTime + gameState.cooldownInteraction) {
        showMessage("Vẫn đang chờ phản hồi từ khán giả...", 'info');
        return;
    }

    gameState.lastInteractionTime = now;
    
    // Chọn ngẫu nhiên một phản hồi
    const feedback = FEEDBACKS[Math.floor(Math.random() * FEEDBACKS.length)];
    
    // Áp dụng hiệu ứng
    gameState.tempo += feedback.tempoChange;
    gameState.feedbackRating += feedback.ratingChange;
    
    // Ghi log
    logFeedback(feedback.text, feedback.type);

    // Bắt đầu cooldown
    startInteractionCooldown();

    updateUI();
}

function startInteractionCooldown() {
    let remaining = gameState.cooldownInteraction / 1000;
    audienceBtn.disabled = true;
    audienceBtn.textContent = `NHẬN PHẢN HỒI (${remaining}s)`;
    
    const timer = setInterval(() => {
        remaining--;
        if (remaining > 0) {
            audienceBtn.textContent = `NHẬN PHẢN HỒI (${remaining}s)`;
        } else {
            clearInterval(timer);
            audienceBtn.disabled = false;
            audienceBtn.textContent = "NHẬN PHẢN HỒI KHÁN GIẢ";
        }
    }, 1000);
}

// --- Xử lý Hành động của Streamer ---

window.handleAction = function(actionType) {
    if (!gameState.isRunning || gameState.feedbackRating <= 0) {
        showMessage("Không có đủ Phản hồi để hành động!", 'negative');
        return;
    }

    switch (actionType) {
        case 'stabilize':
            gameState.tempo = 50; // Đưa về trung tâm
            gameState.feedbackRating -= 5;
            showMessage("Ổn định Nhịp độ thành công! Nhịp độ về 50.", 'positive');
            break;
        case 'amplify':
            // Tăng Nhịp độ mạnh hơn, Rủi ro cao hơn
            gameState.tempo += 15;
            gameState.feedbackRating += 10;
            showMessage("Khuếch đại Làn sóng! Nhịp độ tăng 15 và nhận thêm 10 Phản hồi.", 'positive');
            break;
    }
    updateUI();
}

// --- Hàm Tiện ích ---

function showMessage(msg, className = 'info') {
    gameMessage.textContent = msg;
    gameMessage.className = className;
}

function logFeedback(text, type) {
    const logItem = document.createElement('p');
    logItem.textContent = text;
    logItem.className = type;
    feedbackLog.prepend(logItem);

    while (feedbackLog.children.length > 3) {
        feedbackLog.removeChild(feedbackLog.lastChild);
    }
}

// Khởi tạo ban đầu
updateUI();