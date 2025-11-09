// --- CƠ SỞ DỮ LIỆU & TRẠNG THÁI ---
const Ranks = [
    { name: "Người Tập Sự", threshold: -999 }, // Bắt đầu
    { name: "Hiệp Sĩ", threshold: 1 },
    { name: "Nam Tước", threshold: 3 },
    { name: "Bá Tước", threshold: 5 },
    { name: "Hầu Tước", threshold: 7 },
    { name: "Công Tước", threshold: 9 }, // Hạng cuối
];

let gameState = {
    currentRankIndex: 0,
    dialectic: 0, // Điểm Biện Chứng (Đổi mới)
    tradition: 0, // Điểm Truyền Thống (Ổn định)
};

let currentSlide = 0;
let isDecisionMade = false;

// --- CÁC PHẦN TỬ DOM ---
const slides = document.querySelectorAll('[id^="slide-"]');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const statusDialectic = document.getElementById('dialectic-score');
const statusTradition = document.getElementById('tradition-score');
const currentRankText = document.getElementById('current-rank');
const finalDialectic = document.getElementById('final-dialectic');
const finalTradition = document.getElementById('final-tradition');
const finalResultText = document.getElementById('final-result-text');
const slideContainer = document.getElementById('slide-container');

// --- HÀM XỬ LÝ CHÍNH ---

/**
 * Cập nhật điểm số và cấp bậc trên giao diện.
 */
function updateDisplay() {
    statusDialectic.textContent = gameState.dialectic;
    statusTradition.textContent = gameState.tradition;
    currentRankText.textContent = `Hạng: ${Ranks[gameState.currentRankIndex].name}`;

    // Cập nhật nút điều hướng
    prevBtn.disabled = currentSlide <= 0;
    // -2 vì slide cuối là kết quả
    nextBtn.disabled = currentSlide >= slides.length - 2 || !isDecisionMade; 
}

/**
 * Điều chỉnh chiều cao của slide container.
 * @param {HTMLElement} targetSlide - Slide mới được kích hoạt.
 */
function adjustContainerHeight(targetSlide) {
    // Đảm bảo slide mới được hiển thị đúng để lấy scrollHeight
    targetSlide.style.visibility = 'hidden';
    targetSlide.style.position = 'absolute';
    targetSlide.style.opacity = '0';
    targetSlide.classList.add('active'); 
    
    // Đặt chiều cao container khớp với slide mới
    slideContainer.style.height = `${targetSlide.scrollHeight}px`;

    // Sau khi thiết lập chiều cao, mới hiện slide
    setTimeout(() => {
        targetSlide.style.visibility = 'visible';
        targetSlide.style.position = 'relative';
        targetSlide.style.opacity = '1';
    }, 50);
}

/**
 * Chuyển đến slide mới và điều chỉnh thanh điều hướng.
 * @param {number} index - Chỉ số của slide mới.
 */
function showSlide(index) {
    // Kiểm tra chỉ số hợp lệ
    if (index < 0 || index >= slides.length - 1) return; // -1 vì slide 999 là ẩn

    // Ẩn tất cả các slide
    slides.forEach(slide => slide.classList.remove('active'));

    // Hiển thị slide mới
    const targetSlide = document.getElementById(`slide-${index}`);
    if (targetSlide) {
        adjustContainerHeight(targetSlide);

        currentSlide = index;
    }

    // Reset trạng thái quyết định cho slide mới (trừ slide giới thiệu và slide kết quả)
    isDecisionMade = currentSlide === 0 || currentSlide === slides.length - 2;

    // Xử lý logic đặc biệt cho slide kết quả
    if (currentSlide === slides.length - 2) {
        calculateFinalResult();
    }

    // Cập nhật hiển thị nút
    updateDisplay();

    // Nếu slide là giới thiệu/kết quả, cho phép chuyển tiếp ngay lập tức
    if (currentSlide === 0) {
         nextBtn.disabled = false;
    }
}

/**
 * Xử lý khi người chơi đưa ra quyết định.
 * @param {number} round - Vòng chơi (1, 2, 3, 4).
 * @param {number} choice - Lựa chọn (1 hoặc 2).
 */
function makeDecision(round, choice) {
    let d_change = 0; // Thay đổi điểm Biện Chứng
    let t_change = 0; // Thay đổi điểm Truyền Thống
    let resultText = '';
    
    // Tắt tất cả các nút quyết định của vòng này
    document.getElementById(`decide-${round}-1`).disabled = true;
    document.getElementById(`decide-${round}-2`).disabled = true;

    switch (round) {
        case 1: // Cải cách Đất đai
            if (choice === 1) { d_change = 2; t_change = -1; resultText = "Bạn đã phân chia lại đất đai, được lòng dân nghèo nhưng gây bất mãn trong giới quý tộc. Tiểu quốc của bạn hướng tới sự đổi mới." }
            else { d_change = -1; t_change = 2; resultText = "Bạn giữ luật lệ cũ, duy trì sự ổn định nhưng bỏ lỡ cơ hội đổi mới. Giới quý tộc ủng hộ sự vững chắc này." }
            break;
        case 2: // Đầu tư Khoa học
            if (choice === 1) { d_change = 3; t_change = -1; resultText = "Học viện được thành lập. Dù ngân khố bị hao hụt, nhưng hạt giống tri thức đã được gieo, thúc đẩy tư duy biện chứng." }
            else { d_change = -2; t_change = 2; resultText = "Ngân sách được bảo toàn, nhưng các phát kiến mới bị chậm lại. Truyền thống học thuật cũ vẫn được ưu tiên." }
            break;
        case 3: // Xử lý Khủng hoảng
            if (choice === 1) { d_change = 2; t_change = -2; resultText = "Cách ly khoa học giúp dịch bệnh được kiểm soát nhanh hơn, nhưng niềm tin vào tôn giáo truyền thống bị lung lay." }
            else { d_change = -1; t_change = 2; resultText = "Các nghi lễ mang lại sự an ủi tinh thần, giúp giữ vững trật tự, nhưng bệnh dịch kéo dài hơn dự kiến." }
            break;
        case 4: // Chiến lược Liên minh
            if (choice === 1) { d_change = 3; t_change = -3; resultText = "Hiệp ước mới mang lại công nghệ tiên tiến và cơ hội thương mại. Bạn chấp nhận sự mạo hiểm để hướng tới tương lai." }
            else { d_change = -2; t_change = 3; resultText = "Bạn giữ vững liên minh truyền thống và bản sắc văn hóa. Sự ổn định được đảm bảo, nhưng tiểu quốc có nguy cơ tụt hậu." }
            break;
    }

    // Cập nhật điểm và hiển thị kết quả
    gameState.dialectic += d_change;
    gameState.tradition += t_change;
    document.getElementById(`result-${round}`).innerHTML = `<span class="text-blue-700 font-bold">Kết quả:</span> ${resultText}`;
    
    // Kiểm tra thăng cấp
    checkPromotion(round);

    isDecisionMade = true;
    updateDisplay();
}

/**
 * Kiểm tra và hiển thị kết quả thăng cấp sau mỗi 2 vòng.
 * @param {number} round - Vòng chơi hiện tại.
 */
function checkPromotion(round) {
    if (round === 2 || round === 4) {
        const promotionDiv = document.getElementById(`rank-promotion-${round / 2}`);
        
        // Lấy điểm tổng hợp (cân bằng)
        const totalScore = gameState.dialectic + gameState.tradition;
        
        let newRankIndex = gameState.currentRankIndex;
        let promotionStatus = false;

        // Tìm cấp bậc mới cao nhất có thể đạt được
        for (let i = Ranks.length - 1; i > gameState.currentRankIndex; i--) {
            if (totalScore >= Ranks[i].threshold) {
                newRankIndex = i;
                promotionStatus = true;
                break;
            }
        }

        promotionDiv.classList.remove('hidden', 'rank-success', 'rank-failure');
        let message = '';
        
        if (promotionStatus) {
            const oldRank = Ranks[gameState.currentRankIndex].name;
            const newRank = Ranks[newRankIndex].name;
            gameState.currentRankIndex = newRankIndex;

            promotionDiv.classList.add('rank-success', 'animate-pulse');
            message = `CHÚC MỪNG! Bạn được THĂNG CẤP từ **${oldRank}** lên **${newRank}**! (Tổng điểm: ${totalScore})`;

        } else {
            const nextThreshold = Ranks[gameState.currentRankIndex + 1]?.threshold || 'N/A';
            promotionDiv.classList.add('rank-failure');
            message = `Bạn chưa đủ điều kiện để thăng cấp. Tiếp tục nỗ lực! (Cần ${nextThreshold} điểm)`;
        }
        promotionDiv.innerHTML = message;
        
        // Điều chỉnh chiều cao container sau khi hiển thị hộp thăng cấp
        const currentSlideElement = document.getElementById(`slide-${currentSlide}`);
        if (currentSlideElement) {
            adjustContainerHeight(currentSlideElement);
        }
    }
}


/**
 * Tính toán và hiển thị kết quả cuối cùng.
 */
function calculateFinalResult() {
    finalDialectic.textContent = gameState.dialectic;
    finalTradition.textContent = gameState.tradition;
    
    const rank = Ranks[gameState.currentRankIndex].name;
    const diff = Math.abs(gameState.dialectic - gameState.tradition);

    // Xóa các lớp màu cũ
    finalResultText.classList.remove('text-blue-700', 'text-yellow-700', 'text-teal-700', 'text-red-700', 'font-extrabold', 'bg-red-50', 'bg-blue-50', 'bg-yellow-50', 'bg-green-50');
    finalResultText.classList.add('p-3');

    let resultHtml = '';
    let resultClass = '';
    
    if (rank === "Công Tước" && diff <= 3) {
        // Thắng lợi: Cấp bậc cao nhất và cân bằng
        resultClass = 'text-green-700 font-extrabold bg-green-50 border-lime-600';
        resultHtml = `<h4 class="text-2xl font-bold">ĐẠI THẮNG: CÂN BẰNG BIỆN CHỨNG</h4><p>Bạn đạt đến Hạng **Công Tước** và duy trì được sự cân bằng hoàn hảo giữa đổi mới và ổn định. Tiểu quốc của bạn trở thành hình mẫu của một xã hội phát triển bền vững. Tinh thần Biện Chứng (Tổng hợp) đã chiến thắng!</p>`;
    } else if (gameState.dialectic > gameState.tradition + 5) {
        // Thiên về Biện Chứng quá mức
        resultClass = 'text-blue-700 font-extrabold bg-blue-50 border-blue-600';
        resultHtml = `<h4 class="text-2xl font-bold">LÃNH ĐẠO ĐỘT PHÁ</h4><p>Bạn là một lãnh đạo cấp tiến (Hạng **${rank}**), ưu tiên triệt để các biện pháp Biện Chứng. Tiểu quốc của bạn phát triển nhanh chóng nhưng đối mặt với nhiều bất ổn xã hội và sự phản đối của các thế lực truyền thống.</p>`;
    } else if (gameState.tradition > gameState.dialectic + 5) {
        // Thiên về Truyền Thống quá mức
        resultClass = 'text-yellow-700 font-extrabold bg-yellow-50 border-amber-600';
        resultHtml = `<h4 class="text-2xl font-bold">LÃNH ĐẠO BẢO THỦ</h4><p>Bạn là một lãnh đạo bảo thủ (Hạng **${rank}**), ưu tiên sự ổn định và Truyền Thống. Tiểu quốc của bạn an toàn, nhưng đang tụt hậu về công nghệ và tư tưởng, có nguy cơ bị các quốc gia khác vượt qua.</p>`;
    } else if (gameState.currentRankIndex > 2) {
        // Cân bằng tốt
        resultClass = 'text-teal-700 font-extrabold bg-teal-50 border-teal-600';
        resultHtml = `<h4 class="text-2xl font-bold">THÀNH CÔNG HÀI HÒA</h4><p>Bạn đạt đến Hạng **${rank}** với điểm số tương đối cân bằng. Sự hài hòa trong tư tưởng Biện Chứng và Truyền Thống giúp tiểu quốc của bạn phát triển vững chắc và tránh được những xung đột lớn.</p>`;
    } else {
        // Kết quả thấp
        resultClass = 'text-red-700 font-extrabold bg-red-50 border-red-600';
        resultHtml = `<h4 class="text-2xl font-bold">THẤT BẠI TRONG CÂN BẰNG</h4><p>Bạn đạt Hạng **${rank}** thấp. Sự thiếu quyết đoán hoặc sai lầm trong việc cân bằng đã khiến bạn không thể vượt qua các Công Tước khác.</p>`;
    }
    
    finalResultText.classList.add(...resultClass.split(' '));
    finalResultText.innerHTML = resultHtml;
}


/**
 * Khởi động lại game.
 */
function resetGame() {
    gameState = {
        currentRankIndex: 0,
        dialectic: 0,
        tradition: 0,
    };
    isDecisionMade = false;
    
    // Xóa hiệu ứng thăng cấp cũ nếu có
    document.querySelectorAll('[id^="rank-promotion-"]').forEach(div => {
        div.classList.remove('animate-pulse', 'rank-success', 'rank-failure');
        div.classList.add('hidden');
        div.innerHTML = '';
    });
    // Xóa nội dung kết quả cũ
    document.querySelectorAll('[id^="result-"]').forEach(p => p.innerHTML = '');
    finalResultText.classList.remove('text-blue-700', 'text-yellow-700', 'text-teal-700', 'text-red-700', 'font-extrabold', 'bg-red-50', 'bg-blue-50', 'bg-yellow-50', 'bg-green-50');
    finalResultText.innerHTML = '<!-- Kết quả cuối cùng sẽ hiển thị ở đây -->';

    // Bật lại các nút quyết định
    document.querySelectorAll('[id^="decide-"]').forEach(btn => btn.disabled = false);

    updateDisplay();
    showSlide(0); // Bắt đầu lại từ slide giới thiệu
}


// --- EVENT LISTENERS & INITIALIZATION ---
nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));

// Khởi tạo slide đầu tiên khi trang tải xong
window.onload = function() {
    showSlide(0);
}