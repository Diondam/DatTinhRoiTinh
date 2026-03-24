# Implementation Status

## Last Updated
2026-03-24

## Current Focus
- Khôi phục phần logic trực quan của phép trừ bị mất sau các lần tinh chỉnh giao diện.

## Recent Changes
- Chèn lớp nền động mới trong index.html gồm canvas 3D và vùng sparkles ký hiệu toán.
- Thêm thư viện three.js CDN để dựng hiệu ứng nền 3D nhẹ.
- Đổi bảng màu toàn bộ styles.css sang tông nóng (cam/đỏ/vàng), giảm cảm giác trắng nhạt.
- Giữ nguyên board-section tông xanh để đúng yêu cầu “màu bảng vẫn màu xanh”.
- Bổ sung texture noise, hạt sáng, chuyển động ký hiệu toán học và chế độ giảm chuyển động cho accessibility.
- Thêm logic init cho math sparkles và scene 3D trong app.js, không can thiệp luồng tính toán hiện tại.
- Tạo cơ chế equal-height cho chế độ play: section trái và bảng dùng cùng chiều cao panel trên desktop.
- Thêm chống tràn nội dung cho panel trái bằng vùng cuộn nội bộ slides-wrap để không bị tòi phần tử.
- Tinh chỉnh bảng màu từ nóng đậm sang colorful đa sắc (hồng/xanh/vàng), vẫn giữ board-section xanh.
- Vẽ lại mascot SVG theo tỷ lệ cú rõ hơn (tai, đĩa mặt, mắt, thân, cánh và móng đậu cành) trong index.html.
- Làm mới board skin: viền gradient colorful, mặt bảng xanh sâu hơn, thêm glow dịu và lớp highlight hợp theme.
- Tăng độ hòa hợp giữa mascot và bảng bằng cập nhật bubble, shadow, và tone màu chung.
- Dùng git diff để truy vết logic trừ đã mất giữa commit cũ và hiện tại trong app.js.
- Khôi phục hàng gợi ý borrow-flow trong buildBorrowFlowCandyFrame (hiển thị trừ số dưới và trừ số nhớ) để luồng dạy phép trừ có mượn đầy đủ trở lại.

## Next Steps
- Nếu cần, có thể thêm animation cánh/mắt nhẹ cho mascot khi qua bước để tăng cảm giác sống động.
- Rà soát lại contrast chữ trên bảng ở màn hình sáng mạnh để đảm bảo readability.

## Technical Context
- Nền 3D dùng THREE.WebGLRenderer alpha + wireframe objects + points particle nhẹ.
- Ký hiệu toán bay dùng DOM spans với biến CSS (delay/duration/size) để giảm chi phí render.
- Có media query prefers-reduced-motion để tắt animation không cần thiết.

## Challenges & Errors Encountered
- Không phát sinh lỗi cú pháp sau chỉnh sửa index.html, styles.css, app.js.
- Cân bằng giữa hiệu ứng lung linh và hiệu năng: đã dùng cấu hình three.js nhẹ, giới hạn pixel ratio và số point vừa phải.
- Khi ép equal-height cần xử lý overflow, nếu không input và nút ở panel trái có thể bị đẩy tràn; đã khắc phục bằng flex + overflow auto trong play-mode.
- Không có lỗi cú pháp sau khi thay SVG và cập nhật CSS board/mascot; cần chủ yếu cân bằng giữa màu nổi bật và độ dễ đọc.
- Vấn đề không nằm ở công thức tính mà ở phần minh họa flow phép trừ: một hàng gợi ý trong khung candy đã bị bỏ, khiến cảm giác "mất logic" khi học trừ có mượn. Đã khôi phục từ lịch sử git.
