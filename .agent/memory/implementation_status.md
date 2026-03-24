# Implementation Status

## Last Updated
2026-03-24

## Current Focus
- Khôi phục độ ổn định giọng đọc (TTS) để phát được trên nhiều trình duyệt/máy hơn.

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
- Bỏ cơ chế cố định chiều cao gây scroll bắt buộc ở panel trái khi play-mode; chuyển sang min-height + nở theo nội dung.
- Chỉnh slides-wrap hiển thị đầy đủ nội dung Step 4 thay vì cuộn nội bộ mặc định.
- Thêm auto density scale cho candy: nếu số lượng kẹo cao sẽ tự giảm cỡ (`md/sm/xs`) để vừa khung và giảm tràn.
- Chuẩn hóa render nhóm kẹo thành từng candy-item để wrap và scale mượt hơn.
- Bổ sung mini-note hướng dẫn cụ thể ở các bước 1, 2, 4, 5 (chọn nút, nhập số, nhìn kẹo đếm, bấm kiểm tra/tiếp theo).
- Cập nhật lời thoại speakCurrentSlide theo hướng action-driven, luôn nhắc thao tác kế tiếp.
- Chuẩn hóa prompt Step 4: luôn nối thêm câu hướng dẫn "nhìn kẹo để đếm, nhập kết quả, bấm Kiểm tra" cho mọi nhánh cộng/trừ.
- Thêm thanh trợ lý động (`coachHint`) ngay dưới thanh tiến độ để nhắc hành động theo từng bước.
- Bổ sung hàm updateCoachHintBySlide/setCoachHint trong app.js và cập nhật hint theo trạng thái thực tế (thiếu chọn phép tính, thiếu nhập số, chưa bấm kiểm tra, đúng/sai đáp án).
- Đồng bộ hint khi nhập liệu Step 2: nhập một ô sẽ nhắc ô còn lại, nhập đủ 2 ô sẽ nhắc bấm Tiếp theo.
- Gỡ bớt mini-note tĩnh trùng nội dung ở các bước 1/2/4/5 để tránh giao diện rối chữ.
- Tinh chỉnh nội dung coach hint theo nguyên tắc "làm xong mới nhắc việc kế tiếp" (không nhắc bấm Tiếp theo quá sớm).
- Rút gọn lời thoại theo bước để tránh trùng và giảm cảm giác lặp với hint trên UI.
- Giảm độ nặng visual của thanh coach-hint (border/padding/font) để giao diện thoáng hơn.
- Thêm cơ chế mở khóa giọng đọc sau tương tác đầu tiên của người dùng để vượt chặn autoplay policy.
- Thêm fallback chọn voice: ưu tiên giọng Việt, sau đó fallback theo ngôn ngữ trình duyệt, cuối cùng lấy voice đầu tiên nếu cần.
- Cập nhật speak/speakAsync để resume trước khi phát và chỉ phát khi đã unlock speech.
- Gắn unlockSpeech vào luồng bắt đầu bài/bắt đầu nhanh và listener toàn cục pointer/keyboard/touch.
- Tinh chỉnh nhắc thông minh ngay sau chọn phép tính: nhắc cụ thể theo lựa chọn (cộng/trừ) và yêu cầu bấm Tiếp theo để tiếp tục.
- Mở rộng nhắc completion-based cho các bước khác:
- Step 2: chỉ khi nhập đủ 2 số mới nhắc "đã nhập đủ, ấn Tiếp theo" (kèm chống lặp giọng).
- Step 3: sau khi animation dựng bảng xong mới nhắc "ấn Tiếp theo".
- Step 4: khi hoàn thành mỗi cột/cột cuối mới nhắc rõ hành động kế tiếp (tiếp tục hoặc xem kết quả).
- Step 5: đổi hint thành câu hành động rõ ràng để bắt đầu bài mới.
- Tăng độ ổn định phát giọng nói thêm một lớp: priming speech engine ở lần gesture đầu tiên, dùng ngôn ngữ theo voice thực tế (không ép cứng vi-VN), chỉ cancel queue khi đang speaking/pending.
- Bổ sung unlockSpeech trên toàn bộ nút thao tác chính (start/quick start/chọn phép/next/back/replay) để tránh bị chặn autoplay ở môi trường khắt khe.
- Sửa lỗi đè lời ở Step 2: khi đã nhập đủ 2 số, hệ thống giữ câu nhắc "ấn Tiếp theo" và không phát đè bởi câu ngắn "đã nhập số thứ nhất/thứ hai".
- Sửa lỗi tràn ngang ("tòi ra") ở Step 4: bỏ ép `nowrap` trong cụm subtraction candy, cho nhóm kẹo wrap lại và chặn overflow-x ở vùng slide.
- Xóa hoàn toàn mascot con cú khỏi giao diện bằng cách bỏ block owl HTML trong index.html theo yêu cầu hiện tại.
- Cập nhật Step 4: animation gạch kẹo được khóa trong lúc đọc hướng dẫn và chỉ chạy sau khi narration kết thúc (reading-lock + speakAsync).
- Bổ sung fallback thời gian đọc cho Step 4 khi TTS không khả dụng/chưa unlock: vẫn giữ khóa animation một khoảng theo độ dài câu trước khi cho gạch chạy.
- Thêm hiển thị step-flow phép trừ ngay trên bảng (dưới phần đặt tính dọc) cho case mượn có 2 bước: animate lần lượt `14 - 5`, rồi `- 1`, sau đó chốt thành `14 - 5 - 1`.
- Step-flow chỉ chạy sau khi phần đọc hướng dẫn Step 4 hoàn tất để khớp luồng học.
- Điều chỉnh timing Step-flow: với case mượn sẽ hiển thị ngay khi bắt đầu đọc hướng dẫn Step 4, không đợi đọc xong mới xuất hiện.
- Mở rộng Step-flow cho cả lần mượn đầu tiên (carry = 0): hiển thị dạng `x+10 - y` và không còn hiển thị `- 0` ở hàng gợi ý.
- Tinh chỉnh khung kẹo borrow-flow: thêm khoảng cách trực quan giữa cụm kẹo bị gạch đỏ và cụm kẹo gạch vàng (do nhớ).
- Bỏ hoàn toàn dòng số mờ gợi ý ở dưới khung borrow-flow để giao diện gọn và tập trung vào kẹo bị gạch.
- Nâng cấp hiệu ứng gạch: kẹo bị gạch sẽ tối màu ngay sau khi animation gạch của chính kẹo đó kết thúc.
- Thêm hiệu ứng rung nhẹ có so le cho các kẹo còn lại sau khi toàn bộ kẹo bị gạch đã hoàn tất.
- Điều chỉnh lại theo phản hồi: bỏ hiệu ứng tối màu, thay bằng xoay tròn 1 vòng cho từng kẹo ngay sau khi bị gạch.
- Tăng biên độ rung của các kẹo còn lại ở pha cuối để cảm giác rõ ràng và sinh động hơn.
- Sửa trùng lời ở Step 4: khi chuyển slide vào bước này không đọc `speakCurrentSlide` nữa, để chỉ còn một luồng đọc theo cột trong `prepareCalculationPhase`.
- Sửa trùng ý trong cùng câu Step 4: nếu `questionText` đã có nhắc "nhìn kẹo/đếm", phần hậu tố sẽ chỉ đọc "Nhập kết quả..., bấm Kiểm tra" để tránh lặp.

## Next Steps
- Nếu vẫn không phát tiếng trên một máy cụ thể, kiểm tra cài đặt voice tiếng Việt trong hệ điều hành và quyền âm thanh của trình duyệt.
- Nếu máy vẫn im lặng, ưu tiên kiểm tra danh sách TTS voices của hệ thống Windows (Vietnamese language pack) và thử Edge/Chrome profile khác để loại trừ extension chặn speech.

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
