# -*- coding: utf-8 -*-
"""
Script to generate BaoCao_Assignment2_BrewLite.tex matching the 51-page PDF exactly.
"""

tex_content = r'''\documentclass[11pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[vietnamese]{babel}
\usepackage[T5]{fontenc}
\usepackage[a4paper, top=2.2cm, bottom=2.2cm, left=2.0cm, right=1.8cm, headheight=34pt]{geometry}
\usepackage{amsmath,amssymb}
\usepackage{graphicx}
\usepackage{booktabs}
\usepackage{tabularx}
\usepackage{longtable}
\usepackage{multirow}
\usepackage{array}
\usepackage{enumitem}
\usepackage[table,xcdraw]{xcolor}
\usepackage{tcolorbox}
\usepackage{fancyhdr}
\usepackage{listings}
\usepackage{caption}
\usepackage{float}
\usepackage{lastpage}
\usepackage{pdflscape}
\usepackage{url}
\usepackage{seqsplit}
\usepackage{hyperref}

\definecolor{brandblue}{RGB}{24, 76, 120}
\definecolor{darkslate}{RGB}{30, 41, 59}
\definecolor{codebg}{RGB}{255, 255, 255}
\definecolor{tableheader}{RGB}{235, 243, 250}
\definecolor{brewPrimary}{RGB}{74, 44, 42}
\definecolor{brewSecondary}{RGB}{181, 136, 99}

\hypersetup{
    colorlinks=true,
    linkcolor=brandblue,
    urlcolor=brandblue,
    citecolor=brandblue
}

\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{\fontsize{9}{11}\selectfont \textbf{TRƯỜNG ĐẠI HỌC SÀI GÒN}\\Khoa Công Nghệ Thông Tin}
\fancyhead[R]{\fontsize{9}{11}\selectfont \textbf{Báo cáo Assignment 2: BrewLite}\\Môn học: Công Nghệ Phần Mềm}
\fancyfoot[L]{\fontsize{9}{11}\selectfont \textit{BrewLite -- Hệ thống Đặt đồ uống \& Thanh toán Trực tuyến}}
\fancyfoot[R]{\fontsize{9}{11}\selectfont \textbf{Trang \thepage\ / \pageref{LastPage}}}
\renewcommand{\headrulewidth}{0.6pt}
\renewcommand{\footrulewidth}{0.6pt}

\newcolumntype{Y}{>{\raggedright\arraybackslash}X}
\setlength{\parindent}{0pt}
\setlength{\parskip}{4pt}

\begin{document}

% ==================== TRANG BÌA (P1) ====================
\begin{titlepage}
    \centering
    \vspace*{0.2cm}
    {\fontsize{13}{16}\selectfont \textbf{TRƯỜNG ĐẠI HỌC SÀI GÒN}\par}
    {\fontsize{13}{16}\selectfont \textbf{KHOA CÔNG NGHỆ THÔNG TIN}\par}
    \vspace{0.3cm}
    \rule{0.65\textwidth}{1.2pt}\par
    \vspace{0.8cm}
    \includegraphics[width=3.2cm,keepaspectratio]{report_images/isf_logo.png}\par
    \vspace{0.8cm}
    {\fontsize{16}{20}\selectfont \textbf{BÁO CÁO BÀI TẬP LỚN (ASSIGNMENT 2)}\par}
    {\fontsize{14}{18}\selectfont \textbf{MÔN HỌC: CÔNG NGHỆ PHẦN MỀM}\par}
    \vspace{0.6cm}
    {\fontsize{20}{26}\selectfont \textbf{\textcolor{brandblue}{BrewLite: Hệ Thống Đặt Đồ Uống \& Thanh Toán Trực Tuyến Tích Hợp Đa Cổng}}\par}
    \vspace{0.4cm}
    {\fontsize{12}{15}\selectfont \textit{Quy trình phát triển phần mềm Agile/Scrum, kiến trúc Microservices/Monorepo, CI/CD Pipeline và Triển khai Cloud}\par}
    \vspace{1.2cm}

    \begin{tcolorbox}[colback=tableheader!40,colframe=brandblue,width=0.92\textwidth,arc=3mm]
        \centering
        \textbf{THÔNG TIN HỌC PHẦN \& GIẢNG VIÊN HƯỚNG DẪN}\par
        \vspace{0.2cm}
        \begin{tabular}{ll}
            \textbf{Giảng viên hướng dẫn:} & ThS. Huỳnh Tuấn Anh \\
            \textbf{Mã lớp học phần:} & 841402 -- Công nghệ phần mềm \\
            \textbf{Năm học / Học kỳ:} & Học kỳ I -- Năm học 2026--2027 \\
        \end{tabular}
    \end{tcolorbox}
    \vspace{0.6cm}

    \begin{tcolorbox}[colback=white,colframe=darkslate,width=0.92\textwidth,arc=3mm]
        \centering
        \textbf{THÔNG TIN NHÓM SINH VIÊN THỰC HIỆN (NHÓM 1)}\par
        \vspace{0.2cm}
        \begin{tabularx}{\textwidth}{p{3.8cm} c Y}
            \textbf{Họ và tên} & \textbf{MSSV} & \textbf{Vai trò \& Trách nhiệm chính} \\ \hline
            Đặng Kim Phúc & 3124410387 & Nhóm trưởng, Fullstack, CI/CD, DevOps \\
            Nguyễn Vũ Linh & 3124410271 & Backend Developer, Thiết kế Database, Unit Test \\
            Phạm Gia Phú & 3124410381 & Frontend Developer, UI/UX, Zustand, PWA \\
            Lê Quốc Việt & 3124410405 & Tester, Viết Tài liệu SRS, RTM \& Kịch bản E2E \\
        \end{tabularx}
    \end{tcolorbox}

    \vfill
    {\fontsize{11}{13}\selectfont \textbf{TP. HỒ CHÍ MINH, THÁNG 11/2026}\par}
\end{titlepage}

\clearpage
% ==================== MỤC LỤC (P2, P3) ====================
\tableofcontents
\clearpage

% ==================== TRANG 4 (P4) ====================
\section{TASK 1: KHAI THÁC VÀ ĐẶC TẢ YÊU CẦU}

\subsection{Task 1.1 -- Bối cảnh, Stakeholder và Phạm vi Hệ thống}

Tài liệu tham chiếu bắt buộc: \texttt{docs/requirements/system-context.md}.

\subsubsection{Bối cảnh dự án và Lý do ra đời}
Thị trường chuỗi cà phê và đồ uống bán lẻ tại Việt Nam đang chứng kiến sự tăng trưởng vượt bậc với tốc độ chuyển đổi số mạnh mẽ. Khách hàng ngày càng ưu tiên trải nghiệm đặt hàng tiện lợi, thanh toán không dùng tiền mặt và cá nhân hóa đồ uống theo sở thích riêng. Tuy nhiên, các phần mềm quản lý quán cà phê truyền thống dạng On-Premise thường bộc lộ những hạn chế cốt tử:
\begin{itemize}[leftmargin=*]
    \item \textbf{Tắc nghẽn tại quầy giờ cao điểm:} Thời gian xếp hàng order, chọn món và thanh toán thủ công kéo dài từ 3--5 phút mỗi lượt, gây áp lực nặng nề lên nhân viên thu ngân và làm suy giảm mức độ hài lòng của khách hàng.
    \item \textbf{Sai lệch và trễ hạn chế biến:} Thông tin tùy biến món (size, mức đường, đá, topping kèm) truyền đạt qua lời nói hoặc giấy in nhiệt dễ rách, thất lạc dẫn đến việc Barista pha chế sai yêu cầu của khách hàng.
    \item \textbf{Thiếu hụt đồng bộ thời gian thực:} Tình trạng hết nguyên liệu không được cảnh báo sớm, dẫn đến việc nhận đơn rồi phải hủy món thủ công; doanh thu và dữ liệu khách hàng không được số hóa tập trung.
\end{itemize}

Hệ thống \textbf{BrewLite} được nghiên cứu và phát triển nhằm giải quyết triệt để các bài toán trên. BrewLite là nền tảng quản lý đặt đồ uống và thanh toán trực tuyến hiện đại, hoạt động mượt mà trên trình duyệt web và thiết bị di động (Mobile-First / PWA), kết nối trực tiếp và đồng bộ theo thời gian thực giữa Khách hàng, Nhân viên quầy bar (Barista) và Quản lý cửa hàng.
\clearpage

% ==================== TRANG 5 (P5) ====================
\subsubsection{Bảng phân tích các bên liên quan (Stakeholder Matrix)}

\begin{table}[H]
\centering
\small
\renewcommand{\arraystretch}{0.92}
\begin{tabularx}{\linewidth}{|p{3.2cm}|p{2.6cm}|p{3.8cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Nhóm bên liên quan} & \textbf{Đại diện tiêu biểu} & \textbf{Kỳ vọng \& Mục tiêu chính} & \textbf{Mức độ ảnh hưởng \& Giải pháp kỹ thuật} \\ \hline
\textbf{Khách hàng cá nhân} \newline (End Users) & Học sinh, sinh viên, nhân viên văn phòng & Trải nghiệm đặt món nhanh, tự do cá nhân hóa ly nước, hỗ trợ mã QR PayOS/MoMo, tích điểm. & \textbf{Cao (Trực tiếp):} Giao diện tối ưu di động Next.js 14, trạng thái giỏ hàng Zustand, PWA mượt mà. \\ \hline
\textbf{Nhân viên pha chế} \newline (Baristas) & Nhân viên vận hành tại quầy bar & Nhận đơn tức thì, hiển thị rõ ràng từng tùy chọn pha chế, phân loại đơn theo trạng thái chuẩn xác. & \textbf{Cao (Vận hành):} Barista Dashboard (KDS) cập nhật trạng thái đơn hàng FSM không cần tải lại trang. \\ \hline
\textbf{Quản lý cửa hàng} \newline (Store Manager / Admin) & Chủ quán, quản lý vận hành ca & Kiểm soát chặt chẽ doanh thu, bật/tắt món linh hoạt, quản lý tồn kho nguyên liệu và tài khoản. & \textbf{Cao (Quản trị):} Trang quản trị \texttt{/admin} 6 tab, bảo vệ phân quyền \texttt{@AdminOnly}, báo cáo thời gian thực. \\ \hline
\textbf{Đội ngũ Kỹ sư} \newline (Developers \& DevOps) & Thành viên nhóm dự án BrewLite & Mã nguồn module hóa sạch, dễ bảo trì, CI/CD kiểm thử tự động, triển khai 1 câu lệnh Docker. & \textbf{Trung bình (Nội bộ):} Kiến trúc Monorepo Nx, NestJS, Prisma ORM, GitHub Actions CI/CD và Docker. \\ \hline
\textbf{Nhà cung cấp dịch vụ} \newline (Service Providers) & PayOS, MoMo Sandbox, Render Cloud, Supabase & Tuân thủ chuẩn kết nối API/Webhook, bảo mật chữ ký giao dịch HMAC-SHA256, uptime cao. & \textbf{Trung bình (Kỹ thuật):} Triển khai HTTPS, kiểm tra chữ ký Webhook, cơ chế Idempotency Key chống trùng tiền. \\ \hline
\textbf{Giảng viên hướng dẫn} & ThS. Huỳnh Tuấn Anh & Dự án bám sát quy trình Agile, tài liệu hóa chuẩn IEEE/OMG, kiểm thử đạt chuẩn nghiệm thu. & \textbf{Cao (Đánh giá):} Đảm bảo ma trận RTM 100\%, tài liệu hóa UML 2.0, bằng chứng CI/CD đầy đủ. \\ \hline
\end{tabularx}
\caption{Bảng phân tích 6 bên liên quan (Stakeholder Matrix)}
\label{tab:stakeholder}
\end{table}

\subsubsection{Phạm vi dự án (Project Scope)}
\textbf{A. Phạm vi trong hệ thống (In-Scope):}
\begin{itemize}[leftmargin=*]
    \item Quản lý thực đơn đồ uống theo danh mục, định lượng size (S, M, L) và 3 loại topping đi kèm.
    \item Đặt hàng trực tuyến, tùy biến thành phần, quản lý giỏ hàng lưu bền vững trên thiết bị.
    \item Đăng ký, đăng nhập tài khoản khách hàng, quản trị viên và barista với xác thực phân quyền JWT.
    \item Tích hợp cổng thanh toán trực tuyến VietQR (PayOS) và ví điện tử MoMo Sandbox, cơ chế xử lý Webhook.
    \item Cơ chế khóa lạc quan (Optimistic Locking) và Idempotency Key chống race-condition và thanh toán lặp.
    \item Màn hình điều phối quầy bar (KDS) cập nhật trạng thái đơn hàng theo FSM.
    \item Trang quản trị Admin Dashboard 6 tab phân quyền chặt chẽ (\texttt{@AdminOnly}).
    \item Tích lũy điểm thưởng thành viên tự động và áp dụng chiết khấu theo thứ hạng (Đồng, Bạc, Vàng, Kim Cương) kèm mã Voucher.
\end{itemize}
\clearpage

% ==================== TRANG 6 (P6) ====================
\textbf{B. Phạm vi ngoài hệ thống (Out-of-Scope):}
\begin{itemize}[leftmargin=*]
    \item Không sử dụng luồng gọi tài xế giao hàng chặng cuối (3rd-party Delivery như Grab/ShopeeFood), hệ thống chỉ tập trung luồng khách nhận tại quầy (Pick-up tại quán).
    \item Không hỗ trợ thanh toán quẹt thẻ vật lý POS chuyên dụng tại quầy (chỉ hỗ trợ mã QR và chuyển khoản trực tuyến).
    \item Không tích hợp hệ thống kế toán doanh nghiệp lớn (SAP/ERP), chỉ hỗ trợ xuất báo cáo doanh thu cơ bản.
\end{itemize}

\subsubsection{Bảng đánh giá rủi ro ban đầu và giải pháp giảm thiểu (Risk Assessment)}

\begin{table}[H]
\centering
\small
\renewcommand{\arraystretch}{0.92}
\begin{tabularx}{\linewidth}{|p{3.0cm}|c|c|p{4.2cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Rủi ro xác định} & \textbf{Xác suất} & \textbf{Mức độ} & \textbf{Hậu quả tiềm ẩn} & \textbf{Biện pháp giảm thiểu rủi ro} \\ \hline
\textbf{Race condition khi đặt món cùng lúc} & Trung bình & Cao & Hai khách hàng cùng mua ly cuối, gây âm kho nguyên liệu hoặc thiếu hụt tồn thực tế. & Sử dụng Optimistic Locking trên Database Transaction; kiểm tra \texttt{stock >= quantity} trước khi trừ. \\ \hline
\textbf{Khách thanh toán 2 lần do mạng lag} & Cao & Cao & Khách hàng bị trừ tiền trùng lặp cho cùng một đơn hàng, phát sinh khiếu nại. & Triển khai cơ chế Idempotency Key bằng chuỗi UUID duy nhất trên mỗi phiên thanh toán; hoàn kho tự động nếu quá 5 phút. \\ \hline
\textbf{Webhook từ cổng thanh toán bị thất lạc} & Trung bình & Nghiêm trọng & Khách đã bị trừ tiền trên App ngân hàng nhưng đơn trên web vẫn ở trạng thái chờ thanh toán. & Kết hợp 2 cơ chế: Backend lắng nghe Webhook tự động + Client chủ động gọi API Verify định kỳ mỗi 3s. \\ \hline
\textbf{Lộ lọt dữ liệu hoặc token JWT} & Thấp & Nghiêm trọng & Kẻ xấu mạo danh tài khoản quản trị để sửa giá món, hủy đơn hoặc xem trộm doanh thu. & Băm mật khẩu bằng \texttt{bcrypt} (Salt rounds 10), ký token JWT bảo vệ qua Secret Key, áp dụng Guard chặt chẽ. \\ \hline
\textbf{Chậm tiến độ Sprint do lệch yêu cầu} & Trung bình & Trung bình & Tính năng hoàn thành không khớp tiêu chuẩn DoD, gây vỡ kế hoạch giao nộp. & Họp Daily Standup ngắn, quản lý Backlog minh bạch trên Jira/GitHub Projects, rà soát ma trận RTM mỗi Sprint. \\ \hline
\textbf{Lỗi môi trường khi bàn giao sản phẩm} & Cao & Cao & Ứng dụng chạy tốt ở máy Developer nhưng không thể chạy trên máy chấm điểm của Giảng viên. & Đóng gói toàn bộ hệ thống bằng Docker Compose chuẩn hóa; thiết lập CI/CD tự động kiểm thử mỗi Pull Request. \\ \hline
\end{tabularx}
\caption{Bảng đánh giá rủi ro ban đầu và giải pháp giảm thiểu}
\label{tab:risk}
\end{table}
\clearpage

% ==================== TRANG 7 (P7) ====================
\subsection{Task 1.2 -- Yêu cầu Chức năng và Phi Chức năng (SRS Rút Gọn)}

Tài liệu tham chiếu bắt buộc: \texttt{docs/requirements/srs.md}.

\subsubsection{Danh sách Yêu cầu Chức năng (Functional Requirements -- FR)}
Mọi yêu cầu chức năng được nhóm phân loại theo mô hình ưu tiên MoSCoW (Must have, Should have, Could have, Won’t have) kèm tiêu chí chấp nhận có thể kiểm chứng:

\begin{table}[H]
\centering
\small
\renewcommand{\arraystretch}{0.88}
\begin{tabularx}{\linewidth}{|c|p{2.6cm}|c|p{4.2cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Mã FR} & \textbf{Tên chức năng} & \textbf{Ưu tiên} & \textbf{Mô tả nghiệp vụ} & \textbf{Tiêu chí chấp nhận (Acceptance Criteria)} \\ \hline
\textbf{FR-01} & Xem thực đơn đồ uống & Must & Khách hàng duyệt danh mục, hình ảnh, giá gốc và tình trạng còn/hết hàng của đồ uống. & Trả về JSON đúng cấu trúc; hiển thị Loading Skeleton khi tải; hiển thị nhãn Hết hàng khi stock = 0; thông báo khi danh mục trống. \\ \hline
\textbf{FR-02} & Tùy biến Size \& Topping & Must & Khách hàng chọn size (S/M/L) và các topping thêm cho từng ly. & Chọn 1 size bắt buộc; chọn 0 hoặc nhiều topping; cập nhật tổng tiền tạm tính ngay tại giao diện \texttt{/product/[id]}. \\ \hline
\textbf{FR-03} & Quản lý giỏ hàng & Must & Thêm món, điều chỉnh số lượng, xóa món khỏi giỏ hàng. & Cập nhật số lượng và tổng tiền chính xác; lưu trạng thái vào \texttt{localStorage} không mất khi tải lại trang; giữ chỗ món tối đa 5 phút. \\ \hline
\textbf{FR-04} & Đăng ký \& Đăng nhập & Must & Tạo tài khoản, đăng nhập hệ thống, cấp phát token JWT. & Mật khẩu băm bcrypt; token JWT chứa userId, role, membershipTier; trả mã lỗi 401 khi sai thông tin. \\ \hline
\textbf{FR-05} & Tạo đơn hàng \& Trừ kho & Must & Khởi tạo đơn hàng từ giỏ hàng, trừ kho nguyên liệu tự động. & Thực thi trong Prisma Transaction; kiểm tra khóa Optimistic Locking; trả về 409 Conflict nếu hết hàng; sinh idempotencyKey duy nhất. \\ \hline
\textbf{FR-06} & Thanh toán đa phương thức & Must & Hỗ trợ thanh toán VietQR (PayOS), Ví MoMo Sandbox và Mock Payment. & Tích hợp PayOS SDK sinh mã VietQR chuẩn; MoMo Webhook cập nhật đơn sang PAID; xử lý chữ ký HMAC-SHA256 bảo mật. \\ \hline
\textbf{FR-07} & Xem lịch sử đơn hàng & Must & Khách hàng tra cứu lịch sử mua hàng, mã đơn, trạng thái và điểm tích lũy. & Chỉ hiển thị đơn thuộc tài khoản hiện tại; định dạng ngày giờ VN; hiển thị chi tiết từng món kèm topping. \\ \hline
\textbf{FR-08} & Tiếp nhận \& Pha chế (KDS) & Must & Barista xem hàng đợi đơn, tiếp nhận chế biến và báo hoàn tất đồ uống. & Giao diện KDS cập nhật real-time; nút chuyển trạng thái FSM tuần tự; chỉ tài khoản có role barista được thao tác. \\ \hline
\textbf{FR-09} & Quản trị hệ thống (/admin) & Must & Quản lý sản phẩm, danh mục, bật/tắt món và giám sát đơn hàng toàn hệ thống. & Bảo vệ qua Guard @AdminOnly; gồm 6 tab trực quan; hỗ trợ bật/tắt hiển thị món ngay lập tức. \\ \hline
\textbf{FR-10} & Dọn dẹp đơn quá hạn & Must & Tự động hủy đơn PENDING thanh toán sau 5 phút và hoàn trả tồn kho. & Cron job chạy ngầm định kỳ; cập nhật đơn sang CANCELLED; hoàn trả nguyên vật liệu chính xác 100\%. \\ \hline
\textbf{FR-11} & Chiết khấu hạng thành viên & Should & Giảm giá tự động theo cấp bậc tích lũy và áp dụng mã Voucher. & Đồng: 0\%, Bạc ($\ge$20đ): giảm 5\%, Vàng ($\ge$50đ): giảm 10\%, Kim Cương ($\ge$100đ): giảm 15\%; voucher WELCOME10, GIAM20K, VIPGOLD. \\ \hline
\multicolumn{5}{r@{}}{{\small\itshape (Xem tiếp trang sau\dots)}} \\ \hline
\end{tabularx}
\caption{Danh sách Yêu cầu Chức năng (Functional Requirements -- FR) theo chuẩn MoSCoW}
\label{tab:fr}
\end{table}
\clearpage

% ==================== TRANG 8 (P8) ====================
\textbf{Bảng 3 -- Tiếp theo từ trang trước}
\begin{table}[H]
\centering
\small
\renewcommand{\arraystretch}{0.88}
\begin{tabularx}{\linewidth}{|c|p{2.6cm}|c|p{4.2cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Mã FR} & \textbf{Tên chức năng} & \textbf{Ưu tiên} & \textbf{Mô tả nghiệp vụ} & \textbf{Tiêu chí chấp nhận (Acceptance Criteria)} \\ \hline
\textbf{FR-12} & Hero Banner \& Tìm kiếm & Must & Hiển thị thông điệp thương hiệu, cam kết dịch vụ và ô tìm kiếm món ăn nhanh. & Render đẹp mắt trên trang chủ; tìm kiếm đồ uống theo từ khóa tên hoặc mô tả; lọc nhanh theo danh mục. \\ \hline
\textbf{FR-13} & Giới hạn tần suất & Should & Chống brute-force đăng nhập và spam tạo đơn / thanh toán liên tục. & Giới hạn 10 requests / 60 giây đối với checkout; trả về HTTP 429 Too Many Requests khi vượt ngưỡng; cấu hình ThrottlerGuard. \\ \hline
\end{tabularx}
\end{table}

\subsubsection{Danh sách Yêu cầu Phi Chức năng (Non-Functional Requirements -- NFR)}

\begin{table}[H]
\centering
\small
\renewcommand{\arraystretch}{0.90}
\begin{tabularx}{\linewidth}{|c|p{3.0cm}|p{4.8cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Mã NFR} & \textbf{Nhóm thuộc tính} & \textbf{Tiêu chuẩn kỹ thuật định lượng} & \textbf{Phương pháp kiểm chứng \& Đo lường} \\ \hline
\textbf{NFR-01} & Hiệu năng (Performance) & Thời gian phản hồi API (Latency) $\le$ 500ms cho 95\% requests; tải trang PWA ban đầu $<$ 2.0s trên mạng 3G/4G. & Đo kiểm tự động bằng script kiểm thử tải PowerShell; ghi nhận qua Google Lighthouse (điểm Performance $\ge$ 90). \\ \hline
\textbf{NFR-02} & Tính toàn vẹn (Integrity) & Giao dịch thanh toán và trừ kho tuân thủ chuẩn ACID; không âm kho, không ghi đè dữ liệu đồng thời. & Prisma Transaction với Optimistic Locking; kiểm thử kịch bản Race Condition với 2 request đồng thời. \\ \hline
\textbf{NFR-03} & Bảo mật (Security) & Mật khẩu người dùng băm an toàn qua bcrypt (Salt=10); mã hóa token JWT; chống injection và brute-force. & Đạt kiểm tra OWASP Top 10; chặn request spam qua NestJS ThrottlerGuard (HTTP 429); mã hóa HTTPS toàn bộ. \\ \hline
\textbf{NFR-04} & Khả dụng (Usability) & Giao diện chuẩn Mobile-First (Responsive 375px -- 1920px); thao tác hoàn tất đặt món trong vòng 4 chạm. & Thử nghiệm người dùng thực tế; hỗ trợ lưu giỏ hàng offline trên thiết bị qua Zustand/localStorage. \\ \hline
\textbf{NFR-05} & Khả năng triển khai & Đóng gói toàn bộ hệ thống bằng Docker Container đa nền tảng; khởi chạy hoàn chỉnh chỉ với 1 câu lệnh duy nhất. & Kiểm tra tính tương thích trên Windows/Linux/macOS qua lệnh \texttt{docker compose up --build}; deploy Render tự động. \\ \hline
\textbf{NFR-06} & Khả năng bảo trì & Mã nguồn tuân thủ Clean Architecture, phân tầng rõ rệt, kiểm soát lỗi chặt chẽ bằng ESLint và TypeScript. & Độ bao phủ kiểm thử Unit Test đạt 100\% cho logic nghiệp vụ (11 test suites / 118 test cases pass); CI kiểm tra tự động. \\ \hline
\end{tabularx}
\caption{Danh sách Yêu cầu Phi Chức năng (Non-Functional Requirements -- NFR)}
\label{tab:nfr}
\end{table}

\vspace{0.2cm}
Hệ thống phân định rõ ranh giới nghiệp vụ giữa 4 Actor chính: Khách hàng (Customer), Nhân viên pha chế (Barista), Quản lý cửa hàng (Store Manager / Admin) và Cổng thanh toán (Payment Service).
\clearpage

% ==================== TRANG 9 (P9) ====================
\begin{figure}[H]
    \centering
    \includegraphics[width=0.88\linewidth]{report_images/usecase-general.png}
    \caption{Sơ đồ Use-Case tổng quát hệ thống BrewLite (\texttt{docs/diagrams/usecase-general.puml / .svg})}
    \label{fig:uc_general}
\end{figure}

\begin{table}[H]
\centering
\small
\renewcommand{\arraystretch}{0.90}
\begin{tabularx}{\linewidth}{|p{3.2cm}|p{2.6cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Actor} & \textbf{Loại tác nhân} & \textbf{Danh sách các Use-Case tương tác chính} \\ \hline
\textbf{Khách hàng} \newline (Customer) & Con người (Chính) & Xem thực đơn, Tùy chỉnh size/topping, Quản lý giỏ hàng, Đăng ký/Đăng nhập, Tạo đơn hàng, Thanh toán trực tuyến, Xem lịch sử đơn hàng \& tích điểm. \\ \hline
\textbf{Nhân viên pha chế} \newline (Barista) & Con người (Phụ) & Đăng nhập hệ thống quầy, Xem hàng đợi pha chế thời gian thực, Tiếp nhận đơn (\texttt{PREPARING}), Báo pha chế xong (\texttt{READY}), Bàn giao đồ uống (\texttt{COMPLETED}). \\ \hline
\textbf{Quản lý cửa hàng} \newline (Store Manager / Admin) & Con người (Phụ / Admin) & Đăng nhập trang quản trị \texttt{/admin}, Bật/tắt món \& topping, CRUD sản phẩm/danh mục, Xem danh sách đơn hàng và quản lý người dùng. \\ \hline
\textbf{Cổng thanh toán} \newline (PayOS / MoMo \& Mock) & Hệ thống (Bên ngoài) & Sinh mã VietQR/MoMo, Xác thực giao dịch qua Webhook/IPN và hỗ trợ kiểm thử tự động với \texttt{idempotencyKey}. \\ \hline
\end{tabularx}
\caption{Bảng phân tích Actor và ánh xạ tương tác Use-Case}
\label{tab:actors}
\end{table}

\vspace{0.2cm}
\subsection{Task 1.3 -- Đặc Tả Chi Tiết Use-Case Trọng Tâm: Đặt và Thanh Toán Đơn Hàng}

Tài liệu tham chiếu bắt buộc: \texttt{docs/requirements/usecase-checkout.md}.

Theo khuyến nghị từ đề bài mục 3.3, nhóm lựa chọn use-case có giá trị nghiệp vụ cốt lõi nhất: \textbf{Đặt và thanh toán đơn hàng (UC-01)}.
\clearpage

% ==================== TRANG 10 (P10) ====================
\subsubsection{Sơ đồ Use-Case Phân Rã Chi Tiết}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.82\linewidth]{report_images/usecase-checkout.png}
    \caption{Sơ đồ Use-Case Đặt và thanh toán đơn hàng (\texttt{docs/diagrams/usecase-checkout.puml / .svg})}
    \label{fig:uc_checkout}
\end{figure}

\subsubsection{Bảng đặc tả chi tiết Use-Case Trọng tâm (UC-01)}

\begin{table}[H]
\centering
\small
\renewcommand{\arraystretch}{0.88}
\begin{tabularx}{\linewidth}{|p{3.2cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Thuộc tính} & \textbf{Chi tiết đặc tả nghiệp vụ} \\ \hline
\textbf{Tên Use-Case} & \textbf{UC-01: Đặt và thanh toán đơn hàng trực tuyến} \\ \hline
\textbf{Mã định danh} & UC-01 (Bao gồm UC-02, UC-03, UC-04, UC-05, UC-06, UC-07, UC-08) \\ \hline
\textbf{Tác nhân (Actors)} & Tác nhân chính: Khách hàng (Customer); Tác nhân phụ: Cổng thanh toán (PayOS / MoMo Sandbox \& Mock Test). \\ \hline
\textbf{Mô tả tóm tắt} & Khách hàng duyệt menu, tùy biến size/topping, thêm vào giỏ hàng, xác thực tài khoản, áp dụng mã giảm giá / hạng thành viên, tiến hành thanh toán trực tuyến qua mã QR VietQR hoặc ví MoMo, hệ thống trừ tồn kho nguyên vật liệu và chuyển đơn sang màn hình quầy bar. \\ \hline
\textbf{Tiền điều kiện} & 1. Đồ uống và topping được chọn đang ở trạng thái kinh doanh (\texttt{isAvailable = true}). \newline 2. Nguyên vật liệu trong kho đủ đáp ứng định mức định lượng theo công thức. \\ \hline
\textbf{Hậu điều kiện} & 1. Đơn hàng được tạo thành công với trạng thái \texttt{PAID} và lưu vết trong Cơ sở dữ liệu. \newline 2. Kho nguyên liệu được trừ chính xác; giỏ hàng của khách được làm trống. \newline 3. Khách hàng nhận được điểm tích lũy thành viên tương ứng (1 điểm / 10.000 VNĐ). \newline 4. Màn hình Barista KDS hiển thị đơn hàng mới trong hàng đợi chế biến. \\ \hline
\end{tabularx}
\caption{Bảng đặc tả Use-Case trọng tâm UC-01}
\label{tab:uc01}
\end{table}

\textbf{Luồng sự kiện chính (Basic Flow):}
\begin{enumerate}[leftmargin=*]
    \item Khách hàng mở trang Giỏ hàng (\texttt{/cart}), kiểm tra danh sách món, kích cỡ (S/M/L), topping, có thể nhập mã voucher và xem mức chiết khấu thành viên (0\%, 5\%, 10\% hoặc 15\%) theo \texttt{loyaltyPoints}.
\end{enumerate}
\clearpage

% ==================== TRANG 11 (P11) ====================
\begin{enumerate}[leftmargin=*,resume]
    \item Khách hàng nhấn nút “Thanh toán” trên \texttt{/cart}. Nếu chưa đăng nhập, hệ thống chuyển hướng sang \texttt{/login} và bảo lưu nguyên vẹn giỏ hàng qua \texttt{localStorage}. Sau khi đăng nhập thành công, hệ thống chuyển hướng sang \texttt{/checkout}.
    \item Tại trang \texttt{/checkout}, khách hàng lựa chọn 1 trong 3 phương thức thanh toán:
    \begin{itemize}[leftmargin=*]
        \item \textbf{VietQR (PayOS):} Backend gọi PayOS SDK sinh link thanh toán và mã QR chuẩn NAPAS 247.
        \item \textbf{Ví MoMo Sandbox:} Backend tạo yêu cầu thanh toán MoMo, sinh mã QR MoMo và app scheme deep-link.
        \item \textbf{Mock Payment (Thử nghiệm):} Chỉ kích hoạt khi \texttt{ALLOW\_MOCK\_PAYMENT=true} trên môi trường phát triển / kiểm thử hoặc cho đơn hàng 0đ (do dùng điểm/voucher giảm 100\%).
    \end{itemize}
    Khách hàng gửi yêu cầu kèm mã \texttt{idempotencyKey} (UUID v4 sinh sẵn tại Client).
    \item Backend tiếp nhận qua \texttt{ThrottlerGuard} (giới hạn 10 req/phút), mở Database Transaction:
    \begin{itemize}[leftmargin=*]
        \item Kiểm tra khóa Optimistic Locking trên trường \texttt{version} của sản phẩm.
        \item Kiểm tra số dư tồn kho từng nguyên liệu cấu thành (\texttt{stock >= requiredQty}). Nếu thiếu, ném lỗi \texttt{409 Conflict}.
        \item Trừ tạm thời tồn kho nguyên liệu (\texttt{stock = stock - requiredQty}).
        \item Khởi tạo bản ghi \texttt{Order} với trạng thái \texttt{PENDING} và hạn giữ chỗ trong 5 phút (\texttt{expiresAt = now + 5m}).
        \item Khởi tạo bản ghi \texttt{Payment} với trạng thái \texttt{PENDING} và lưu trữ \texttt{idempotencyKey}.
    \end{itemize}
    \item Khách hàng thực hiện quét mã QR bằng ứng dụng ngân hàng hoặc ví MoMo.
    \item Cổng thanh toán xử lý trừ tiền và gửi Webhook/IPN đến endpoint \texttt{POST /api/payments/webhook}:
    \begin{itemize}[leftmargin=*]
        \item Backend xác thực chữ ký số HMAC-SHA256 để chống giả mạo dữ liệu.
        \item Sử dụng truy vấn nguyên tử \texttt{updateMany} kiểm tra trạng thái: chỉ cập nhật đơn nếu trạng thái đang là \texttt{PENDING}.
        \item Cập nhật trạng thái đơn hàng sang \texttt{PAID}, thanh toán sang \texttt{SUCCESS}.
        \item Tự động tính toán và cộng điểm thưởng \texttt{loyaltyPoints} theo tỷ lệ 1 điểm / 10.000 VNĐ.
    \end{itemize}
    \item Đồng thời tại giao diện Web, Client gọi định kỳ API Verify (\texttt{GET /api/payments/:orderId/verify}) mỗi 3 giây. Ngay khi phát hiện đơn đã \texttt{PAID}, giao diện tự động xóa sạch giỏ hàng và chuyển hướng sang trang Hoàn tất đơn (\texttt{/order-success/[id]}).
    \item Đơn hàng lập tức xuất hiện trên màn hình Barista Dashboard (\texttt{/barista}) để bắt đầu pha chế.
\end{enumerate}

\textbf{Các luồng ngoại lệ (Exceptions Flow):}
\begin{itemize}[leftmargin=*]
    \item \textbf{E1 -- Hết nguyên liệu hoặc lỗi Race Condition (409 Conflict):} Khi hai khách hàng cùng đặt ly cuối cùng, Transaction của khách hàng thứ hai phát hiện tồn kho không đủ hoặc \texttt{version} bị thay đổi. Hệ thống lập tức rollback toàn bộ thao tác, trả về mã lỗi \texttt{409 Conflict} kèm thông báo: \textit{"Một số nguyên liệu trong món đã hết, vui lòng chọn món khác"}.
    \item \textbf{E2 -- Người dùng chưa đăng nhập khi nhấn thanh toán (401 Unauthorized):} Hệ thống lưu toàn bộ giỏ hàng vào \texttt{localStorage}, chuyển hướng sang \texttt{/login?redirect=/checkout}. Sau khi đăng nhập thành công, khách hàng được điều hướng trở lại đúng trang Checkout mà không phải chọn lại món từ đầu.
    \item \textbf{E3 -- Thanh toán thất bại, hết hạn 5 phút hoặc người dùng hủy đơn:} Nếu khách hàng nhấn nút "Hủy đơn" trên \texttt{/checkout} hoặc quá thời gian giữ chỗ 5 phút mà chưa thanh toán, Backend tự động kích hoạt logic Rollback: cập nhật trạng thái đơn sang \texttt{CANCELLED}, thanh toán sang \texttt{FAILED}, hoàn trả 100\% số lượng nguyên liệu đã trừ tạm về kho, giữ nguyên giỏ hàng để khách có thể thử lại.
    \item \textbf{E4 -- Khách hàng nhấn thanh toán nhiều lần hoặc gửi lại request (Idempotency Hit):} Nếu Client gửi lại request \texttt{POST /api/payments} cùng \texttt{idempotencyKey}, Backend kiểm tra khóa duy
\end{itemize}
\clearpage

% ==================== TRANG 12 (P12) ====================
\begin{itemize}[leftmargin=*]
    \item[] nhất trong bảng \texttt{Payment}, phát hiện key đã tồn tại và lập tức trả về kết quả thanh toán trước đó kèm cờ \texttt{idempotent: true}, hoàn toàn không trừ tiền hoặc trừ kho lần thứ hai.
    \item \textbf{E5 -- Quá tần suất gọi API (429 Too Many Requests):} Nếu một IP gửi vượt quá 10 request checkout trong vòng 1 phút, \texttt{ThrottlerGuard} sẽ chặn ngay tại tầng Guard và trả về mã HTTP \texttt{429}, ngăn chặn các kịch bản spam đặt hàng phá hoại.
    \item \textbf{E6 -- Chữ ký Webhook không hợp lệ (400 Bad Request):} Khi Webhook gửi đến nhưng chữ ký HMAC không khớp với cấu hình \texttt{PAYOS\_CHECKSUM\_KEY} hoặc \texttt{MOMO\_SECRET\_KEY}, hệ thống lập tức từ chối và ghi log cảnh báo bảo mật.
    \item \textbf{E7 -- Xung đột đồng thời giữa Webhook và Client Verify:} Trường hợp Webhook và lệnh Verify từ Client cùng ghi nhận thanh toán một lúc, Backend áp dụng điều kiện nguyên tử \texttt{updateMany} kiểm tra trạng thái để tránh ghi trùng khi Webhook và Verify gọi đồng thời.
\end{itemize}
\clearpage

% ==================== TRANG 13 (P13) ====================
\section{TASK 2: MÔ HÌNH HÓA HỆ THỐNG}

\subsection{Task 2.1 -- Sơ Đồ Hoạt Động (Activity Diagram)}

Tài liệu tham chiếu bắt buộc: \texttt{docs/diagrams/activity/activity-diagram.md} và sơ đồ nguồn \texttt{docs/diagrams/activity/activity-order-flow.puml}.

Sơ đồ hoạt động mô hình hóa luồng nghiệp vụ end-to-end từ lúc khách hàng duyệt món trên thực đơn cho đến khi hoàn tất đơn hàng và nhận đồ uống tại quầy. Để đảm bảo tính trực quan, kích thước ô lớn và độ rõ nét tối đa khi đọc, sơ đồ được tách làm 4 phân đoạn logic liền mạch:
\begin{itemize}[leftmargin=*]
    \item \textbf{Phần A (Hình \ref{fig:act_part_a}):} Chu trình phía Khách hàng -- Duyệt menu, Tùy biến món \& Quản lý giỏ hàng cục bộ (\texttt{localStorage}).
    \item \textbf{Phần B (Hình \ref{fig:act_part_b}):} Chu trình Xác thực \& Đặt hàng -- Kiểm tra token JWT, Khởi tạo đơn hàng Transaction và Khóa tồn kho Optimistic Locking.
    \item \textbf{Phần C (Hình \ref{fig:act_part_c}):} Chu trình Thanh toán trực tuyến -- Điều phối cổng thanh toán (VietQR PayOS / MoMo / Mock), xử lý Webhook, kiểm tra Idempotency Key và cơ chế Rollback hoàn kho khi hết hạn 5 phút.
    \item \textbf{Phần D (Hình \ref{fig:act_part_d}):} Xử lý nhánh thanh toán thành công (tích điểm thưởng) và quy trình điều phối pha chế trên Barista KDS đến khi hoàn tất đơn.
\end{itemize}
\clearpage

% ==================== TRANG 14 (P14) ====================
\begin{figure}[p]
    \centering
    \includegraphics[width=0.95\linewidth,height=0.88\textheight,keepaspectratio]{report_images/activity-part-a.png}
    \caption{Sơ đồ Hoạt động -- Phần A: Duyệt menu, Tùy biến món \& Giỏ hàng (trích từ \texttt{docs/diagrams/activity/activity-order-flow.puml})}
    \label{fig:act_part_a}
\end{figure}
\clearpage

% ==================== TRANG 15 (P15) ====================
\begin{figure}[p]
    \centering
    \includegraphics[width=0.95\linewidth,height=0.88\textheight,keepaspectratio]{report_images/activity-part-b.png}
    \caption{Sơ đồ Hoạt động -- Phần B: Xác thực JWT \& Tạo đơn hàng Transaction (trích từ \texttt{docs/diagrams/activity/activity-order-flow.puml})}
    \label{fig:act_part_b}
\end{figure}
\clearpage

% ==================== TRANG 16 (P16) ====================
\begin{figure}[p]
    \centering
    \includegraphics[width=0.95\linewidth,height=0.88\textheight,keepaspectratio]{report_images/activity-part-c.png}
    \caption{Sơ đồ Hoạt động -- Phần C: Thanh toán, Idempotency \& Xử lý Webhook (trích từ \texttt{docs/diagrams/activity/activity-order-flow.puml})}
    \label{fig:act_part_c}
\end{figure}
\clearpage

% ==================== TRANG 17 (P17) ====================
\subsubsection{Đặc tả 5 phân làn trách nhiệm (Swimlanes)}
\begin{enumerate}[leftmargin=*]
    \item \textbf{Khách hàng (Customer):} Tác nhân khởi phát các hành vi duyệt menu, chọn size (S/M/L), chọn toppings, thêm vào giỏ, nhập thông tin đăng nhập (nếu chưa có phiên làm việc), chọn phương thức thanh toán và quét mã QR / xác nhận ví.
    \item \textbf{Giao diện Web (Next.js UI):} Render giao diện người dùng, duy trì trạng thái giỏ hàng toàn cục qua Zustand store, lưu trữ dữ liệu bền vững trên \texttt{localStorage}, sinh mã ngẫu nhiên UUID cho \texttt{idempotencyKey}, và hiển thị phản hồi trạng thái tương ứng.
    \item \textbf{Máy chủ Ứng dụng (NestJS API):} Tiếp nhận các yêu cầu HTTP RESTful, kiểm tra tính hợp lệ của DTO qua \texttt{ValidationPipe}, xác thực mã Bearer JWT qua \texttt{JwtAuthGuard}, tính toán chiết khấu hạng thành viên và điều phối giao dịch nghiệp vụ.
    \item \textbf{Cơ sở dữ liệu (PostgreSQL Database):} Thực thi các truy vấn trong một Transaction tuần tự đạt chuẩn ACID, kiểm tra khóa lạc quan (\texttt{Optimistic Locking}) trên trường \texttt{version} của sản phẩm, khấu trừ số lượng tồn kho nguyên vật liệu (\texttt{Ingredient.stock}) và lưu vết lịch sử giao dịch.
    \item \textbf{Cổng thanh toán (Payment Service):} Kiểm tra và đối soát tính duy nhất của \texttt{idempotencyKey}, thực hiện kết nối cổng PayOS/MoMo, gửi Webhook có ký số HMAC-SHA256 và phản hồi kết quả giao dịch.
\end{enumerate}

\subsubsection{Các điểm rẽ nhánh (Decision / Merge Nodes) \& Xử lý kịch bản ngoại lệ}
\begin{itemize}[leftmargin=*]
    \item \textbf{Nhánh kiểm tra đăng nhập:} Khi khách hàng nhấn thanh toán, nếu hệ thống phát hiện chưa có Bearer Token JWT, luồng xử lý rẽ sang nhánh yêu cầu đăng nhập. Giỏ hàng được lưu tạm vào bộ nhớ trình duyệt để không làm gián đoạn trải nghiệm của người dùng.
    \item \textbf{Nhánh kiểm tra tồn kho nguyên liệu:} Khi tạo đơn, Backend tính toán định mức tiêu hao nguyên vật liệu theo kích cỡ ly. Nếu phát hiện nguyên liệu bị thiếu hụt, hệ thống rẽ sang nhánh thất bại, rollback transaction và thông báo lỗi rõ ràng cho người dùng.
    \item \textbf{Nhánh xử lý thanh toán \& Hoàn trả kho (Rollback):}
    \begin{itemize}[leftmargin=*,noitemsep]
        \item \textit{Thanh toán thành công:} Đơn hàng chuyển sang \texttt{PAID}, hệ thống kích hoạt tự động cộng điểm thưởng \texttt{loyaltyPoints} theo tỷ lệ 1 điểm / 10.000 VNĐ, xóa sạch giỏ hàng và chuyển sang trang hoàn tất.
        \item \textit{Thanh toán thất bại / Quá hạn 5 phút:} Đơn hàng chuyển sang \texttt{CANCELLED}, thanh toán chuyển sang \texttt{FAILED}, hệ thống tự động hoàn trả số lượng nguyên liệu đã trừ tạm thời, giữ nguyên các món trong giỏ hàng để khách có thể thử lại hoặc hủy để hoàn trả tồn kho.
    \end{itemize}
\end{itemize}
\clearpage

% ==================== TRANG 18 (P18) ====================
\begin{figure}[p]
    \centering
    \includegraphics[width=0.95\linewidth,height=0.88\textheight,keepaspectratio]{report_images/activity-part-d.png}
    \caption{Sơ đồ Hoạt động -- Phần D: Thanh toán thành công, Barista KDS \& Hoàn tất đơn (trích từ \texttt{docs/diagrams/activity/activity-order-flow.puml})}
    \label{fig:act_part_d}
\end{figure}
\clearpage

% ==================== TRANG 19 (P19) ====================
\subsection{Task 2.2 -- Sơ Đồ Tuần Tự (Sequence Diagram)}

Tài liệu tham chiếu bắt buộc: \texttt{docs/requirements/sequence-checkout.md} và sơ đồ nguồn \texttt{docs/diagrams/sequence-checkout.puml}.

Sơ đồ tuần tự mô tả chi tiết quy trình giao tiếp thời gian thực cho use-case trọng tâm "Đặt và thanh toán đơn hàng" với đủ 5 Lifelines theo đúng chuẩn OMG UML 2.0 (được tách thành 2 phần để giữ chữ rõ nét khi in ấn):
$$\text{Customer} \longrightarrow \text{Next.js UI} \longrightarrow \text{NestJS API} \longrightarrow \text{Database} \longrightarrow \text{Payment Service}$$

\subsubsection{Phân tích các giai đoạn tương tác tuần tự}
\begin{enumerate}[leftmargin=*]
    \item \textbf{Giai đoạn 1 -- Khởi tạo đơn hàng \& Transaction (Phần 1):} Khách hàng gửi yêu cầu tạo đơn từ giao diện giỏ hàng. Next.js đính kèm token JWT trong Header gửi đến NestJS API. NestJS kiểm tra xác thực qua \texttt{JwtAuthGuard}, mở Database Transaction, kiểm tra tồn kho nguyên vật liệu và khóa lạc quan (\texttt{Optimistic Locking}). Nếu hợp lệ, hệ thống tạo bản ghi đơn hàng trạng thái \texttt{PENDING}, giữ chỗ nguyên vật liệu trong 5 phút và trả về kết quả.
    \item \textbf{Giai đoạn 2 -- Lựa chọn phương thức thanh toán \& Khởi tạo mã (Phần 1 $\rightarrow$ Phần 2):} Khách hàng chọn thanh toán VietQR (PayOS) hoặc ví MoMo Sandbox. Client sinh mã \texttt{idempotencyKey} (UUID v4) gửi kèm yêu cầu thanh toán. Backend gọi PayOS SDK hoặc MoMo API tạo giao dịch, nhận về liên kết thanh toán và render mã QR lên màn hình.
    \item \textbf{Giai đoạn 3 -- Quét mã \& Xác thực thanh toán thời gian thực (Phần 2):} Khách hàng sử dụng ứng dụng ngân hàng hoặc MoMo quét mã QR và xác nhận chuyển tiền. Sau khi trừ tiền thành công, cổng thanh toán gửi Webhook có kèm chữ ký bảo mật HMAC-SHA256 về endpoint của hệ thống.
    \item \textbf{Giai đoạn 4 -- Xử lý Webhook \& Chống trùng lặp (Phần 2):} Backend kiểm tra chữ ký số HMAC, kiểm tra \texttt{idempotencyKey} trong cơ sở dữ liệu. Thực hiện truy vấn nguyên tử \texttt{updateMany} để cập nhật trạng thái đơn hàng sang \texttt{PAID} và bản ghi thanh toán sang \texttt{SUCCESS}. Hệ thống tự động kích hoạt logic cộng điểm thưởng thành viên và thông báo hoàn tất.
    \item \textbf{Giai đoạn 5 -- Điều phối quầy pha chế Barista (Phần 2):} Màn hình quầy Barista KDS tự động cập nhật đơn mới vào hàng đợi chế biến. Nhân viên quầy tiếp nhận và cập nhật tuần tự các trạng thái FSM: \texttt{PAID} $\rightarrow$ \texttt{PREPARING} $\rightarrow$ \texttt{READY} $\rightarrow$ \texttt{COMPLETED}.
\end{enumerate}

\subsubsection{Cơ chế Idempotency Key và Xử lý ngoại lệ trong Sequence}
Hệ thống sử dụng cơ chế kiểm tra Idempotency hai lớp:
\begin{itemize}[leftmargin=*]
    \item \textbf{Tại tầng API:} Khách hàng gửi mã UUID duy nhất qua header \texttt{X-Idempotency-Key}. NestJS kiểm tra bản ghi trong bảng \texttt{Payment}. Nếu phát hiện key đã tồn tại, hệ thống lập tức trả về kết quả cũ mà không thực hiện trừ kho hay gọi cổng thanh toán lần thứ hai.
    \item \textbf{Tại tầng Webhook:} Webhook từ PayOS hoặc MoMo được xử lý bằng câu lệnh \texttt{updateMany} kèm điều kiện trạng thái \texttt{PENDING}. Nhờ đó, ngay cả khi nhà cung cấp gửi lại Webhook nhiều lần do lỗi mạng, dữ liệu chỉ được xử lý đúng một lần duy nhất.
    \item \textbf{Xử lý hết hạn (Timeout 5 phút):} Nếu sau 5 phút giao dịch chưa hoàn tất, đơn hàng được chuyển sang \texttt{CANCELLED}, hệ thống hoàn trả lại số nguyên liệu đã giữ chỗ, khách hàng có thể thử lại (\texttt{/retry}) hoặc hủy để hoàn kho.
\end{itemize}
\clearpage

% ==================== TRANG 20 (P20) ====================
\begin{figure}[p]
    \centering
    \includegraphics[width=0.95\linewidth,height=0.88\textheight,keepaspectratio]{report_images/sequence-part-1.png}
    \caption{Sơ đồ Tuần tự -- Phần 1: Kiểm tra JWT \& Tạo đơn hàng Transaction (\texttt{docs/diagrams/sequence-checkout.puml / .svg})}
    \label{fig:seq_part1}
\end{figure}
\clearpage

% ==================== TRANG 21 (P21) ====================
\begin{figure}[p]
    \centering
    \includegraphics[width=0.95\linewidth,height=0.88\textheight,keepaspectratio]{report_images/sequence-part-2.png}
    \caption{Sơ đồ Tuần tự -- Phần 2: Thanh toán, Idempotency \& Hoàn tất đơn (\texttt{docs/diagrams/sequence-checkout.puml / .svg})}
    \label{fig:seq_part2}
\end{figure}
\clearpage

% ==================== TRANG 22 (P22) ====================
\subsection{Task 2.3 -- Sơ Đồ Lớp Miền Nghiệp Vụ (Domain Class Diagram)}

Tài liệu tham chiếu bắt buộc: \texttt{docs/diagrams/class-diagram.md} và tệp cấu hình ORM \texttt{apps/api/prisma/schema.prisma}.

Sơ đồ lớp miền nghiệp vụ phản ánh đầy đủ mô hình dữ liệu quan hệ của hệ thống BrewLite, bao gồm 12 bảng thực thể và 8 kiểu dữ liệu liệt kê (Enums), đảm bảo tính toàn vẹn tham chiếu và chuẩn hóa 3NF:

\begin{figure}[H]
    \centering
    \includegraphics[width=0.92\linewidth,height=0.55\textheight,keepaspectratio]{report_images/class-diagram.png}
    \caption{Sơ đồ Lớp miền nghiệp vụ BrewLite (\texttt{docs/diagrams/class-diagram.puml / .svg})}
    \label{fig:class_diagram}
\end{figure}

\subsubsection{Đặc tả chi tiết 12 Lớp nghiệp vụ trong Hệ thống}
\begin{enumerate}[leftmargin=*]
    \item \textbf{User:} Quản lý thông tin tài khoản người dùng, bao gồm khách hàng, nhân viên pha chế và quản trị viên hệ thống.
    \begin{itemize}[leftmargin=*,noitemsep]
        \item Thuộc tính: \texttt{id: BigInt [PK]}, \texttt{fullName: String?}, \texttt{email: String [UK]}, \texttt{phone: String?}, \texttt{passwordHash: String}, \texttt{loyaltyPoints: Int = 0}, \texttt{role: user\_role}, \texttt{membershipTier: MEMBERSHIP\_TIER = BRONZE}, \texttt{isActive: Boolean = true}, \texttt{createdAt}, \texttt{updatedAt}.
        \item Mối quan hệ: 1-1 với \texttt{CustomerProfile}, 1-n với \texttt{Address}, 1-n với \texttt{Order}.
    \end{itemize}
    \item \textbf{CustomerProfile:} Lưu trữ thông tin bổ trợ cá nhân hóa của khách hàng.
    \begin{itemize}[leftmargin=*,noitemsep]
        \item Thuộc tính: \texttt{id: BigInt [PK]}, \texttt{userId: BigInt [FK, UK]}, \texttt{avatarUrl: String?}, \texttt{defaultAddress: String?}, \texttt{createdAt}, \texttt{updatedAt}.
        \item Mối quan hệ: n-1 với \texttt{User} (Ràng buộc \texttt{onDelete: Cascade}).
    \end{itemize}
\end{enumerate}
\clearpage

% ==================== TRANG 23 (P23) ====================
\begin{enumerate}[leftmargin=*,resume]
    \item \textbf{Address:} Danh bạ địa chỉ nhận hàng của khách hàng.
    \begin{itemize}[leftmargin=*,noitemsep]
        \item Thuộc tính: \texttt{id: BigInt [PK]}, \texttt{userId: BigInt [FK]}, \texttt{recipientName: String}, \texttt{phone: String}, \texttt{street: String}, \texttt{city: String}, \texttt{isDefault: Boolean = false}, \texttt{createdAt}, \texttt{updatedAt}.
        \item Mối quan hệ: n-1 với \texttt{User} (\texttt{onDelete: Cascade}).
    \end{itemize}
    \item \textbf{Category:} Danh mục phân loại đồ uống (Cà phê, Trà sữa, Trà trái cây, v.v.).
    \begin{itemize}[leftmargin=*,noitemsep]
        \item Thuộc tính: \texttt{id: BigInt [PK]}, \texttt{name: String [UK]}, \texttt{slug: String [UK]}, \texttt{description: String?}, \texttt{isActive: Boolean = true}, \texttt{createdAt}, \texttt{updatedAt}.
        \item Mối quan hệ: 1-n với \texttt{Product} (\texttt{onDelete: NoAction}).
    \end{itemize}
    \item \textbf{Product:} Thực thể đồ uống trung tâm của thực đơn quán.
    \begin{itemize}[leftmargin=*,noitemsep]
        \item Thuộc tính: \texttt{id: BigInt [PK]}, \texttt{categoryId: BigInt [FK]}, \texttt{name: String}, \texttt{slug: String [UK]}, \texttt{description: String?}, \texttt{basePrice: Decimal(10,2)}, \texttt{imageUrl: String?}, \texttt{isAvailable: Boolean = true}, \texttt{version: Int = 0 (Optimistic Lock)}, \texttt{createdAt}, \texttt{updatedAt}.
        \item Mối quan hệ: n-1 với \texttt{Category}, 1-n với \texttt{ProductSize}, 1-n với \texttt{ProductIngredient}, 1-n với \texttt{OrderItem}.
    \end{itemize}
    \item \textbf{ProductSize:} Các kích cỡ ly của từng món (S, M, L) và phụ thu giá.
    \begin{itemize}[leftmargin=*,noitemsep]
        \item Thuộc tính: \texttt{id: BigInt [PK]}, \texttt{productId: BigInt [FK]}, \texttt{size: size\_code}, \texttt{extraPrice: Decimal(10,2)}, \texttt{isAvailable: Boolean = true}, \texttt{createdAt}, \texttt{updatedAt}.
        \item Mối quan hệ: n-1 với \texttt{Product} (\texttt{onDelete: Cascade}), 1-n với \texttt{OrderItem}.
    \end{itemize}
    \item \textbf{Topping:} Danh mục các loại topping thêm cho đồ uống.
    \begin{itemize}[leftmargin=*,noitemsep]
        \item Thuộc tính: \texttt{id: BigInt [PK]}, \texttt{name: String [UK]}, \texttt{price: Decimal(10,2)}, \texttt{isAvailable: Boolean = true}, \texttt{createdAt}, \texttt{updatedAt}.
        \item Mối quan hệ: 1-n với \texttt{OrderItemTopping} (\texttt{onDelete: NoAction}).
    \end{itemize}
    \item \textbf{Ingredient:} Nguyên vật liệu trong kho để pha chế (Cà phê hạt, Sữa đặc, Trà, v.v.).
    \begin{itemize}[leftmargin=*,noitemsep]
        \item Thuộc tính: \texttt{id: BigInt [PK]}, \texttt{name: String [UK]}, \texttt{stock: Decimal(10,2)}, \texttt{unit: String}, \texttt{minStock: Decimal(10,2) = 10.0}, \texttt{createdAt}, \texttt{updatedAt}.
        \item Mối quan hệ: 1-n với \texttt{ProductIngredient}, 1-n với \texttt{Inventory}.
    \end{itemize}
    \item \textbf{ProductIngredient:} Công thức định lượng nguyên liệu cho từng món đồ uống.
    \begin{itemize}[leftmargin=*,noitemsep]
        \item Thuộc tính: \texttt{id: BigInt [PK]}, \texttt{productId: BigInt [FK]}, \texttt{ingredientId: BigInt [FK]}, \texttt{quantityRequired: Decimal(10,2)}, \texttt{createdAt}.
        \item Mối quan hệ: n-1 với \texttt{Product} (\texttt{onDelete: Cascade}), n-1 với \texttt{Ingredient} (\texttt{onDelete: Cascade}).
    \end{itemize}
    \item \textbf{Inventory:} Lịch sử nhập xuất và điều chỉnh kho nguyên vật liệu.
    \begin{itemize}[leftmargin=*,noitemsep]
        \item Thuộc tính: \texttt{id: BigInt [PK]}, \texttt{ingredientId: BigInt [FK]}, \texttt{changeAmount: Decimal(10,2)}, \texttt{reason: String}, \texttt{createdAt}.
        \item Mối quan hệ: n-1 với \texttt{Ingredient} (\texttt{onDelete: Cascade}).
    \end{itemize}
\end{enumerate}
\clearpage

% ==================== TRANG 24 (P24) ====================
\begin{enumerate}[leftmargin=*,resume]
    \item \textbf{Order:} Quản lý thông tin đơn hàng và vòng đời trạng thái FSM.
    \begin{itemize}[leftmargin=*,noitemsep]
        \item Thuộc tính: \texttt{id: BigInt [PK]}, \texttt{userId: BigInt [FK]}, \texttt{orderCode: String [UK]}, \texttt{totalAmount: Decimal(10,2)}, \texttt{discountAmount: Decimal(10,2) = 0.0}, \texttt{finalAmount: Decimal(10,2)}, \texttt{status: order\_status = PENDING}, \texttt{expiresAt: DateTime?}, \texttt{note: String?}, \texttt{createdAt}, \texttt{updatedAt}.
        \item Mối quan hệ: n-1 với \texttt{User} (\texttt{onDelete: NoAction}), 1-n với \texttt{OrderItem}, 1-n với \texttt{Payment}.
    \end{itemize}
    \item \textbf{OrderItem:} Chi tiết từng món đồ uống có trong đơn hàng.
    \begin{itemize}[leftmargin=*,noitemsep]
        \item Thuộc tính: \texttt{id: BigInt [PK]}, \texttt{orderId: BigInt [FK]}, \texttt{productId: BigInt [FK]}, \texttt{sizeId: BigInt [FK]}, \texttt{quantity: Int}, \texttt{unitPrice: Decimal(10,2)}, \texttt{subtotal: Decimal(10,2)}, \texttt{createdAt}.
        \item Mối quan hệ: n-1 với \texttt{Order} (\texttt{onDelete: Cascade}), n-1 với \texttt{Product}, n-1 với \texttt{ProductSize}.
    \end{itemize}
    \item \textbf{OrderItemTopping:} Topping đi kèm cho từng món trong đơn.
    \begin{itemize}[leftmargin=*,noitemsep]
        \item Thuộc tính: \texttt{id: BigInt [PK]}, \texttt{orderItemId: BigInt [FK]}, \texttt{toppingId: BigInt [FK]}, \texttt{price: Decimal(10,2)}, \texttt{quantity: Int = 1}.
        \item Mối quan hệ: n-1 với \texttt{OrderItem} (\texttt{onDelete: Cascade}), n-1 với \texttt{Topping} (\texttt{onDelete: NoAction}).
    \end{itemize}
    \item \textbf{Payment:} Giao dịch thanh toán trực tuyến gắn liền với đơn hàng.
    \begin{itemize}[leftmargin=*,noitemsep]
        \item Thuộc tính: \texttt{id: BigInt [PK]}, \texttt{orderId: BigInt [FK]}, \texttt{idempotencyKey: String [UK]}, \texttt{method: payment\_method}, \texttt{amount: Decimal(10,2)}, \texttt{status: payment\_status = SUCCESS}, \texttt{transactionId: String?}, \texttt{payosOrderCode: BigInt? [UK]}, \texttt{createdAt}, \texttt{updatedAt}.
        \item Mối quan hệ: n-1 với \texttt{Order} (\texttt{onDelete: Cascade}).
    \end{itemize}
    \item \textbf{Promotion:} Chương trình khuyến mãi và mã voucher ưu đãi.
    \begin{itemize}[leftmargin=*,noitemsep]
        \item Thuộc tính: \texttt{id: BigInt [PK]}, \texttt{code: String [UK]}, \texttt{description: String?}, \texttt{discountType: discount\_type}, \texttt{discountValue: Decimal(10,2)}, \texttt{minOrderAmount: Decimal(10,2) = 0.0}, \texttt{maxDiscountAmount: Decimal(10,2)?}, \texttt{startDate: DateTime}, \texttt{endDate: DateTime}, \texttt{isActive: Boolean = true}, \texttt{createdAt}.
    \end{itemize}
\end{enumerate}

\subsubsection{Danh mục 8 Kiểu Dữ liệu Liệt kê (Enums)}
\begin{enumerate}[leftmargin=*]
    \item \texttt{user\_role}: \texttt{CUSTOMER}, \texttt{BARISTA}, \texttt{ADMIN}.
    \item \texttt{MEMBERSHIP\_TIER}: \texttt{BRONZE}, \texttt{SILVER}, \texttt{GOLD}, \texttt{DIAMOND}.
    \item \texttt{size\_code}: \texttt{S}, \texttt{M}, \texttt{L}.
    \item \texttt{order\_status}: \texttt{PENDING}, \texttt{PAID}, \texttt{PREPARING}, \texttt{READY}, \texttt{COMPLETED}, \texttt{CANCELLED}.
    \item \texttt{payment\_method}: \texttt{VIETQR}, \texttt{MOMO}, \texttt{MOCK}.
    \item \texttt{payment\_status}: \texttt{SUCCESS}, \texttt{FAILED}.
    \item \texttt{discount\_type}: \texttt{PERCENTAGE}, \texttt{FIXED\_AMOUNT}.
    \item \texttt{inventory\_reason}: \texttt{IMPORT}, \texttt{ORDER\_USAGE}, \texttt{SPOILAGE}, \texttt{ADJUSTMENT}.
\end{enumerate}

Mô hình trên đảm bảo 100\% tính toàn vẹn tham chiếu, ràng buộc khóa ngoại chặt chẽ (\texttt{Cascade} khi xóa tài khoản, \texttt{NoAction} bảo vệ lịch sử đơn hàng), quản lý danh mục, topping, đơn hàng và người dùng.
\clearpage

% ==================== TRANG 25 (P25) ====================
\section{TASK 3: THIẾT KẾ KIẾN TRÚC}

\subsection{Task 3.1 -- Phương Pháp và Quyết Định Kiến Trúc (ADRs)}

Tài liệu tham chiếu bắt buộc: \texttt{docs/architecture/c4-model.md} và các bản ghi \texttt{docs/architecture/adr/*.md}.

\subsubsection{Mô hình Kiến trúc C4 (C4-Model Level 1 \& Level 2)}
Nhóm áp dụng mô hình C4 (Context, Container) để trực quan hóa kiến trúc phần mềm theo các mức trừu tượng khác nhau:
\begin{itemize}[leftmargin=*]
    \item \textbf{C4 Context (Level 1):} Hệ thống BrewLite đứng ở vị trí trung tâm, phục vụ 3 nhóm người dùng (Khách hàng, Barista, Admin) và tương tác với 2 hệ thống thanh toán bên ngoài (Cổng thanh toán PayOS và Ví MoMo).
    \item \textbf{C4 Container (Level 2):} Hệ thống được phân rã thành 3 containers độc lập trong kiến trúc Monorepo:
    \begin{itemize}[leftmargin=*,noitemsep]
        \item \textit{Single Page Application / PWA (Next.js 14):} Chạy trên trình duyệt client, render UI bằng React Server Components kết hợp Client Components, quản lý state bằng Zustand và gọi RESTful API qua Axios.
        \item \textit{Backend Application (NestJS):} Máy chủ API cung cấp các endpoints nghiệp vụ, quản lý luồng điều phối FSM, xác thực JWT Guard và kết nối ORM.
        \item \textit{Relational Database (PostgreSQL):} Hệ quản trị cơ sở dữ liệu quan hệ, lưu trữ bảng biểu, thực thi ACID Transactions và quản lý index toàn vẹn.
    \end{itemize}
\end{itemize}

\subsubsection{Danh mục 6 Quyết định Kiến trúc Trọng yếu (ADR)}
Các quyết định kỹ thuật then chốt được nhóm ghi chép đầy đủ theo chuẩn Architecture Decision Record (ADR):
\clearpage

% ==================== TRANG 26 (P26) ====================
\begin{table}[H]
\centering
\small
\renewcommand{\arraystretch}{0.92}
\begin{tabularx}{\linewidth}{|c|p{3.0cm}|p{3.2cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Mã ADR} & \textbf{Tiêu đề quyết định} & \textbf{Lựa chọn công nghệ} & \textbf{Lý do \& Đánh giá đánh đổi (Trade-offs)} \\ \hline
\textbf{ADR-01} & Cấu trúc mã nguồn dự án & \textbf{Monorepo (Nx / Turborepo)} thay vì Multi-repo & Chia sẻ Type DTO giữa FE và BE; đồng bộ phiên bản; CI/CD tập trung nhưng đòi hỏi cấu hình tooling ban đầu kỹ lưỡng. \\ \hline
\textbf{ADR-02} & Công nghệ giao diện người dùng (Frontend) & \textbf{Next.js 14 (App Router) + Zustand + TailwindCSS} & Tối ưu SEO, hỗ trợ PWA offline, Zustand nhẹ hơn Redux, TailwindCSS tăng tốc độ dựng UI nhất quán trên di động. \\ \hline
\textbf{ADR-03} & Nền tảng máy chủ ứng dụng (Backend) & \textbf{NestJS (TypeScript) + Express Adapter} & Kiến trúc Module hóa rõ ràng (Controller-Service-Repository), Dependency Injection mạnh mẽ, hỗ trợ sẵn ValidationPipe và JWT Guard. \\ \hline
\textbf{ADR-04} & Cơ sở dữ liệu và Tầng truy cập dữ liệu & \textbf{PostgreSQL 16 + Prisma ORM} & Ràng buộc toàn vẹn quan hệ ACID mạnh mẽ, Prisma sinh type TypeScript tự động từ schema, chống SQL Injection tuyệt đối. \\ \hline
\textbf{ADR-05} & Cơ chế kiểm soát tương tranh tồn kho & \textbf{Optimistic Locking} (trường \texttt{version} Int) & Thích hợp với hệ thống đọc nhiều ghi ít; không gây nghẽn kết nối Database như Pessimistic Lock; trả về 409 khi conflict. \\ \hline
\textbf{ADR-06} & Đóng gói và Môi trường thực thi & \textbf{Docker Compose (Multi-stage Build)} & Đồng nhất 100\% môi trường Development và Production; giảm kích thước Image bằng Alpine Linux; triển khai nhanh chóng 1 lệnh. \\ \hline
\end{tabularx}
\caption{Danh mục 6 Quyết định Kiến trúc (Architecture Decision Records -- ADR)}
\label{tab:adr}
\end{table}
\clearpage

% ==================== TRANG 27 (P27) ====================
\subsection{Task 3.2 -- Sơ Đồ Triển Khai (Deployment Diagram)}

Tài liệu tham chiếu bắt buộc: \texttt{docs/diagrams/deployment-diagram.md} và sơ đồ nguồn \texttt{docs/diagrams/deployment-diagram.puml}.

\subsubsection{Đặc tả Mô hình Triển khai Đa Tầng (Multi-Tier Cloud Architecture)}
Hệ thống BrewLite được thiết kế để triển khai đồng nhất trên cả môi trường Local Development (qua Docker Compose) và Production Cloud (qua Nền tảng PaaS Render kết hợp Supabase PostgreSQL):

\begin{table}[H]
\centering
\small
\renewcommand{\arraystretch}{0.90}
\begin{tabularx}{\linewidth}{|p{3.2cm}|p{2.2cm}|c|p{2.6cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Điểm đầu cuối / Tầng} & \textbf{Giao thức mạng} & \textbf{Cổng mạng} & \textbf{Công nghệ thực thi} & \textbf{Ghi chú bảo mật \& Vận hành} \\ \hline
\textbf{Client Browser / Mobile PWA} & HTTPS (TLS 1.3) & 443 & Trình duyệt Chrome / Safari / Edge & Hỗ trợ Service Worker lưu cache tĩnh PWA; giao tiếp mã hóa SSL toàn diện. \\ \hline
\textbf{Render Reverse Proxy / Cloudflare} & HTTPS / WSS & 443 $\rightarrow$ 3000 & Nginx Edge Router & Tự động cấp chứng chỉ SSL Let's Encrypt; cân bằng tải và phòng chống tấn công DDoS. \\ \hline
\textbf{Frontend Container (Web App)} & HTTP nội bộ & 3000 & Node.js 24 Alpine (Next.js Standalone) & Render UI, quản lý routing phía client; cấu hình biến môi trường \texttt{NEXT\_PUBLIC\_API\_URL}. \\ \hline
\textbf{Backend Container (API Server)} & HTTP RESTful & 3001 & Node.js 24 Alpine (NestJS Framework) & Cung cấp toàn bộ REST API; kiểm soát CORS chặt chẽ; phân quyền \texttt{JwtAuthGuard}. \\ \hline
\textbf{Database Container / Cloud DB} & PostgreSQL Protocol & 5432 (local: 5433) & PostgreSQL 16 (Render / Supabase) & Lưu trữ dữ liệu quan hệ bền vững; kiểm tra quyền truy cập qua \texttt{DATABASE\_URL}. \\ \hline
\textbf{Payment Gateway (Bên ngoài)} & HTTPS Webhook & 443 & PayOS SDK / MoMo Open API & Xác thực giao dịch trực tuyến; gửi Webhook có chữ ký số bảo mật HMAC-SHA256. \\ \hline
\end{tabularx}
\caption{Bảng đặc tả giao thức mạng và cổng kết nối hệ thống}
\label{tab:ports}
\end{table}
\clearpage

% ==================== TRANG 28 (P28) ====================
\begin{figure}[p]
    \centering
    \includegraphics[width=0.95\linewidth,height=0.88\textheight,keepaspectratio]{report_images/deployment-diagram.png}
    \caption{Sơ đồ Triển khai môi trường Production BrewLite (\texttt{docs/diagrams/deployment-diagram.puml / .svg})}
    \label{fig:deployment}
\end{figure}
\clearpage

% ==================== TRANG 29 (P29) ====================
\subsubsection{Chiến lược Giám sát, Bảo mật và Quản lý Biến môi trường}
\begin{itemize}[leftmargin=*]
    \item \textbf{Cơ chế Giám sát Sức khỏe (Health Check):} Backend cung cấp endpoint \texttt{GET /health} phục vụ cơ chế tự kiểm tra của Render và Docker Daemon. Khi hệ thống khởi chạy, Render sẽ ping định kỳ tới endpoint này. Nếu trả về \texttt{\{"status":"ok"\}}, container mới được đưa vào danh sách phục vụ lưu lượng truy cập thực tế.
    \item \textbf{Render Persistent Disk Storage:} Gắn ổ đĩa cứng bền vững tại thư mục \texttt{/var/lib/postgresql/data}, đảm bảo toàn bộ cơ sở dữ liệu không bị mất khi container khởi động lại hoặc khi deploy phiên bản mới.
    \item \textbf{Phân tách Môi trường \& Quản lý Secrets:} Toàn bộ thông tin nhạy cảm (JWT Secret, Database Password, Payment API Keys) được lưu trữ tại mục Environment Secrets trên Dashboard Render, hoàn toàn không commit vào mã nguồn Git theo chuẩn Twelve-Factor App.
    \item \textbf{Cấu hình CORS \& Throttling:} Chỉ chấp nhận các kết nối xuất phát từ đúng domain của Frontend (\texttt{CORS\_ORIGIN}); áp dụng \texttt{ThrottlerGuard} chặn brute-force và DDoS mức ứng dụng.
\end{itemize}

Quá trình cấu hình này đảm bảo hệ thống có độ sẵn sàng cao, chịu lỗi tốt và dễ dàng rollback khi phát sinh sự cố triển khai.
\clearpage

% ==================== TRANG 30 (P30) ====================
\section{TASK 4: TRIỂN KHAI SPRINT 1}

\subsection{Task 4.1 -- Thiết Lập Repository và Quy Trình Làm Việc Nhóm}

Tài liệu tham chiếu bắt buộc: \texttt{README.md}, \texttt{.github/workflows/ci.yml} và cấu hình nhánh trên GitHub.

\subsubsection{Cấu trúc Git Branching Strategy}
Nhóm áp dụng mô hình Git Feature-Branching kết hợp quy chuẩn GitFlow rút gọn, phù hợp với chu kỳ phát triển Agile/Scrum 2 tuần/Sprint:
\begin{itemize}[leftmargin=*]
    \item \textbf{Nhánh \texttt{main}:} Nhánh bảo vệ nghiêm ngặt (Protected Branch), đại diện cho mã nguồn phiên bản Production sẵn sàng triển khai. Mọi commit trực tiếp vào nhánh này đều bị cấm. Mã nguồn chỉ được đưa vào thông qua Pull Request đã qua kiểm duyệt.
    \item \textbf{Nhánh \texttt{develop}:} Nhánh tích hợp mã nguồn chính của nhóm trong suốt Sprint. Mọi tính năng sau khi kiểm thử cục bộ thành công sẽ được tạo PR hướng vào \texttt{develop}.
    \item \textbf{Các nhánh tính năng (\texttt{feature/*}), sửa lỗi (\texttt{fix/*}), kiểm thử (\texttt{test/*}):} Nhánh ngắn hạn do từng thành viên tạo ra từ \texttt{develop} để thực hiện một User Story hoặc Task cụ thể (Ví dụ: \texttt{feat/cart-page}, \texttt{feat/payos-vietqr}, \texttt{test/ci-failure-demo}).
\end{itemize}

\subsubsection{Quy tắc Bảo vệ Nhánh Chính (Branch Protection Rules)}
Để đảm bảo chất lượng mã nguồn tối đa trước khi đưa vào hệ thống, nhóm kích hoạt các quy tắc bảo vệ trên GitHub:
\begin{enumerate}[leftmargin=*]
    \item \textbf{Yêu cầu xét duyệt Pull Request (Require Pull Request Reviews):} Bắt buộc phải có ít nhất 1 thành viên khác trong nhóm review và Approve trước khi có thể merge.
    \item \textbf{Bắt buộc vượt qua chặng kiểm tra CI (Require status checks to pass before merging):} Toàn bộ các bước Lint, Format, Unit Test và Build trong GitHub Actions CI Pipeline bắt buộc phải trả về trạng thái xanh (Pass 100\%).
    \item \textbf{Yêu cầu nhánh cập nhật mới nhất (Require branches to be up to date before merging):} Nhánh con phải merge hoặc rebase mã nguồn mới nhất từ nhánh đích để tránh xung đột tiềm ẩn.
    \item \textbf{Khóa nút ghi đè (Include administrators):} Quy tắc áp dụng đồng đều cho toàn bộ thành viên, kể cả Admin của repository.
\end{enumerate}
\clearpage

% ==================== TRANG 31 (P31) ====================
\subsubsection{Quy ước Commit (Conventional Commits) \& Pull Request Template}
Nhóm tuân thủ nghiêm ngặt chuẩn Conventional Commits (\texttt{<type>(<scope>): <description>}) để phục vụ việc tự động sinh Release Notes và truy vết lịch sử commit:
\begin{itemize}[leftmargin=*]
    \item \textbf{\texttt{feat}:} Phát triển tính năng mới (Ví dụ: \texttt{feat(payment): integrate payos vietqr checkout}).
    \item \textbf{\texttt{fix}:} Sửa lỗi phần mềm (Ví dụ: \texttt{fix(cart): prevent negative quantity on item decrement}).
    \item \textbf{\texttt{test}:} Bổ sung hoặc cập nhật bài kiểm thử (Ví dụ: \texttt{test(order): add idempotency unit tests}).
    \item \textbf{\texttt{docs}:} Cập nhật tài liệu kỹ thuật (Ví dụ: \texttt{docs(uml): export high-resolution sequence diagrams}).
    \item \textbf{\texttt{refactor}:} Tái cấu trúc mã nguồn nhưng không đổi hành vi nghiệp vụ (Ví dụ: \texttt{refactor(auth): simplify jwt guard validation}).
    \item \textbf{\texttt{chore}:} Cấu hình CI/CD, đóng gói Docker hoặc cập nhật thư viện phụ thuộc (Ví dụ: \texttt{chore(ci): add e2e testing step to workflow}).
\end{itemize}
Mọi Pull Request đều phải điền đầy đủ mẫu PR Template: Mô tả thay đổi, Mã User Story/Issue liên kết, Minh chứng kiểm thử cục bộ và Checklist tự kiểm tra trước khi yêu cầu review.
\clearpage

% ==================== TRANG 32 (P32) ====================
\subsubsection{Bảng Product Backlog cho Sprint 1 và Sprint 2}

\begin{table}[H]
\centering
\small
\renewcommand{\arraystretch}{0.90}
\begin{tabularx}{\linewidth}{|c|p{2.8cm}|c|c|p{3.8cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Mã US} & \textbf{Tên User Story} & \textbf{Sprint} & \textbf{Điểm SP} & \textbf{Người thực hiện chính} & \textbf{Trạng thái nghiệm thu} \\ \hline
\textbf{US-01} & Xem danh mục thực đơn & Sprint 1 & 3 & Phạm Gia Phú (FE) & Hoàn thành 100\% (DoD Pass) \\ \hline
\textbf{US-02} & Xem chi tiết đồ uống & Sprint 1 & 3 & Phạm Gia Phú (FE) & Hoàn thành 100\% (DoD Pass) \\ \hline
\textbf{US-03} & Tùy biến Size \& Topping & Sprint 1 & 5 & Nguyễn Vũ Linh (BE) & Hoàn thành 100\% (DoD Pass) \\ \hline
\textbf{US-04} & Quản lý giỏ hàng cục bộ & Sprint 1 & 5 & Phạm Gia Phú (FE) & Hoàn thành 100\% (DoD Pass) \\ \hline
\textbf{US-05} & Đăng ký \& Đăng nhập JWT & Sprint 2 & 5 & Nguyễn Vũ Linh (BE) & Hoàn thành 100\% (DoD Pass) \\ \hline
\textbf{US-06} & Đặt hàng \& Trừ tồn kho & Sprint 2 & 8 & Nguyễn Vũ Linh (BE) & Hoàn thành 100\% (DoD Pass) \\ \hline
\textbf{US-07} & Thanh toán VietQR / MoMo & Sprint 2 & 8 & Đặng Kim Phúc (DevOps) & Hoàn thành 100\% (DoD Pass) \\ \hline
\textbf{US-08} & Barista KDS điều phối đơn & Sprint 2 & 5 & Phạm Gia Phú (FE) & Hoàn thành 100\% (DoD Pass) \\ \hline
\textbf{US-09} & Quản trị Admin Dashboard & Sprint 2 & 8 & Đặng Kim Phúc (DevOps) & Hoàn thành 100\% (DoD Pass) \\ \hline
\textbf{US-10} & Dọn dẹp đơn quá hạn 5p & Sprint 2 & 3 & Nguyễn Vũ Linh (BE) & Hoàn thành 100\% (DoD Pass) \\ \hline
\textbf{US-11} & Tích điểm \& Hạng thành viên & Sprint 2 & 3 & Lê Quốc Việt (Tester) & Hoàn thành 100\% (DoD Pass) \\ \hline
\textbf{US-12} & Hero Banner \& Cam kết & Sprint 2 & 2 & Phạm Gia Phú (FE) & Hoàn thành 100\% (DoD Pass) \\ \hline
\textbf{US-13} & Chống lặp \& Giới hạn tần suất & Sprint 2 & 5 & Đặng Kim Phúc (DevOps) & Hoàn thành 100\% (DoD Pass) \\ \hline
\end{tabularx}
\caption{Bảng Product Backlog dự án BrewLite}
\label{tab:backlog}
\end{table}
\clearpage

% ==================== TRANG 33 (P33) ====================
\subsubsection{Tiêu chuẩn Định nghĩa Hoàn thành (Definition of Done -- DoD)}
Một User Story chỉ được chuyển sang trạng thái \textbf{Done} khi thỏa mãn đầy đủ các điều kiện:
\begin{itemize}[leftmargin=*]
    \item Mã nguồn được viết theo chuẩn Clean Code, không có biến thừa hoặc lỗi linter cảnh báo.
    \item Có bài kiểm thử Unit Test tương ứng với độ bao phủ kiểm tra luồng chính và luồng ngoại lệ.
    \item Toàn bộ các bài kiểm thử cục bộ đều vượt qua (100\% Tests Passed).
    \item Đã tạo Pull Request, có ít nhất 1 lượt review chấp thuận và vượt qua Pipeline CI tự động.
    \item Tính năng đã được kiểm thử giao diện thực tế (Manual Acceptance Test) trên trình duyệt di động.
\end{itemize}

\subsection{Task 4.2 -- Quản Lý Tài Liệu và Kiểm Soát Phiên Bản}
Toàn bộ tài liệu yêu cầu (SRS, Use-case, Stakeholders), kiến trúc (C4, ADR, Deployment) và hướng dẫn vận hành đều được tài liệu hóa dưới dạng tệp Markdown (\texttt{.md}) lưu trữ trực tiếp trong thư mục \texttt{docs/} của Git Repository. Nhờ đó, mọi sự thay đổi trong thiết kế kiến trúc hoặc đặc tả yêu cầu đều được kiểm soát phiên bản (Version Control), gắn liền với từng commit và mã Pull Request cụ thể.

\subsection{Task 4.3 -- Xây Dựng MVP Sprint 1 (Menu Browsing)}
Trong Sprint 1, nhóm tập trung xây dựng gói tính năng nền tảng cho phép khách hàng duyệt thực đơn đồ uống:
\begin{itemize}[leftmargin=*]
    \item \textbf{Backend (\texttt{apps/api}):} Thiết lập NestJS Module \texttt{ProductsModule} và \texttt{CategoriesModule}, cấu hình kết nối Prisma ORM, xây dựng các endpoints \texttt{GET /api/categories} và \texttt{GET /api/products}. Viết bộ kiểm thử đơn vị tự động kiểm tra việc nạp dữ liệu và xử lý bộ lọc sản phẩm.
    \item \textbf{Frontend (\texttt{apps/web}):} Khởi tạo Next.js 14 App Router, xây dựng giao diện Trang chủ (\texttt{/}), danh mục phân loại đồ uống bằng thanh trượt ngang, lưới danh sách món ăn kèm hình ảnh và giá gốc. Xây dựng trang Chi tiết món (\texttt{/product/[id]}) cho phép chọn size và topping với tính toán giá tiền tức thì qua React State.
\end{itemize}
Mã nguồn hoàn thành đúng hạn và vượt qua bài kiểm thử Task 10 cục bộ với Jest, kiểm tra thành công kịch bản truy vấn danh sách món ăn và tùy biến kích cỡ ly.
\clearpage

% ==================== TRANG 34 (P34) ====================
\subsection{Task 4.4 -- Tích Hợp Liên Tục (Continuous Integration -- CI)}

Tài liệu tham chiếu bắt buộc: \texttt{docs/delivery/ci-evidence.md} và tệp workflow \texttt{.github/workflows/ci.yml}.

Theo yêu cầu mục 6.4, nhóm thiết lập pipeline CI chạy tự động trên GitHub Actions runner \texttt{ubuntu-latest} mỗi khi mở Pull Request hoặc push code vào nhánh \texttt{main}/\texttt{develop}. Pipeline thực thi nghiêm ngặt chuỗi kiểm soát chất lượng (mở rộng thêm bước Migrate, Seed và Integration/E2E test ở Sprint 2):
$$\text{Install} \longrightarrow \text{Lint} \longrightarrow \text{Migrate \& Seed} \longrightarrow \text{Unit Test \& E2E} \longrightarrow \text{Build}$$

\subsubsection{Minh chứng 1: Pull Request chạy Pipeline CI Thành Công (CI Pass)}
\begin{itemize}[leftmargin=*]
    \item \textbf{Pull Request \#22 (CI Pass):} \url{https://github.com/Phucdang-gif/Assignment2/pull/22} (Nhánh \texttt{ci/task-4.4-ci-and-deployment} merge vào \texttt{main}).
    \item \textbf{Workflow Run \#42985903031:} Cả hai Jobs Backend CI (NestJS) và Frontend CI (Next.js) đều vượt qua toàn bộ 4 chặng kiểm tra thành công.
\end{itemize}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.92\linewidth,height=0.60\textheight,keepaspectratio]{report_images/ci-success.png}
    \caption{Minh chứng trạng thái CI Pass trên Pull Request \#22 (\texttt{docs/delivery/screenshots/ci-success.png})}
    \label{fig:ci_pass}
\end{figure}
\clearpage

% ==================== TRANG 35 (P35) ====================
\begin{figure}[H]
    \centering
    \includegraphics[width=0.92\linewidth,height=0.48\textheight,keepaspectratio]{report_images/ci-success-run.png}
    \caption{Minh chứng Workflow Run thành công toàn diện trên GitHub Actions (\texttt{docs/delivery/screenshots/ci-success-run.png})}
    \label{fig:ci_run}
\end{figure}

\subsubsection{Minh chứng 2: Pull Request có lỗi bị Pipeline CI Phát Hiện \& Chặn Merge (CI Fail)}
\begin{itemize}[leftmargin=*]
    \item \textbf{Pull Request \#21 (CI Fail):} \url{https://github.com/Phucdang-gif/Assignment2/pull/21} (Nhánh \texttt{test/ci-failure-demo} hướng vào \texttt{main}).
    \item \textbf{Kịch bản gây lỗi có chủ đích:} Nhóm cố ý chỉnh sửa file \texttt{products.service.spec.ts} với kỳ vọng sai \texttt{expect(result).toHaveLength(999)}.
    \item \textbf{Kết quả:} Pipeline phát hiện lỗi ngay tại bước Run Unit Tests, lập tức hủy bỏ bước Build NestJS application và đánh dấu trạng thái đỏ \textit{"Some checks were not successful"}. Quy tắc Branch Protection trên GitHub đã khóa nút Merge Pull Request, ngăn chặn hoàn toàn mã nguồn lỗi lọt vào nhánh chính.
\end{itemize}
\clearpage

% ==================== TRANG 36 (P36) ====================
\begin{figure}[p]
    \centering
    \includegraphics[width=0.92\linewidth,height=0.85\textheight,keepaspectratio]{report_images/ci-failed.png}
    \caption{Minh chứng PR \#21 bị CI phát hiện lỗi và khóa merge (\texttt{docs/delivery/screenshots/ci-failed.png})}
    \label{fig:ci_failed}
\end{figure}
\clearpage

% ==================== TRANG 37 (P37) ====================
\begin{figure}[p]
    \centering
    \includegraphics[width=0.92\linewidth,height=0.85\textheight,keepaspectratio]{report_images/ci-failed-job.png}
    \caption{Chi tiết bước Unit Test thất bại và chặn bước Build trên GitHub Actions (\texttt{docs/delivery/screenshots/ci-failed-job.png})}
    \label{fig:ci_failed_job}
\end{figure}
\clearpage

% ==================== TRANG 38 (P38) ====================
\section{TASK 5: TRIỂN KHAI SPRINT 2, CI/CD VÀ DELIVERY}

\subsection{Task 5.1 -- Hoàn Thiện MVP Sprint 2 (End-to-End Features)}

\textbf{Sprint Goal:} Hoàn thiện toàn bộ luồng nghiệp vụ khép kín từ xác thực JWT, giỏ hàng bền vững, trừ kho Optimistic Locking, thanh toán trực tuyến VietQR/MoMo, điều phối quầy bar KDS, trang quản trị Admin và dọn dẹp đơn quá hạn.

\subsubsection{Chi tiết các tính năng và User Stories hoàn thành trong Sprint 2}
\begin{enumerate}[leftmargin=*]
    \item \textbf{Xác thực và Phân quyền JWT (US-05):} Đăng ký, đăng nhập tài khoản khách hàng, nhân viên pha chế và quản trị viên; băm mật khẩu bằng \texttt{bcrypt}; cấp phát token JWT bảo vệ qua \texttt{JwtAuthGuard} và Decorator phân quyền \texttt{@Roles('barista')}, \texttt{@AdminOnly}.
    \item \textbf{Quản lý giỏ hàng toàn cục (US-04):} Sử dụng Zustand store lưu trữ bền vững tại \texttt{localStorage}; giữ chỗ món tối đa 5 phút; tính toán tổng tiền tạm tính tự động theo kích cỡ ly và số lượng topping kèm.
    \item \textbf{Khởi tạo đơn hàng \& Trừ kho Optimistic Locking (US-06):} Khởi tạo đơn hàng trong một Prisma Database Transaction; kiểm tra số lượng tồn kho theo định mức nguyên vật liệu; kiểm tra trường \texttt{version} của sản phẩm để chống xung đột tương tranh.
    \item \textbf{Tích hợp Thanh toán VietQR \& Ví MoMo (US-07):} Tích hợp cổng PayOS SDK sinh mã VietQR NAPAS 247 và ví MoMo Sandbox; xử lý Webhook bất đồng bộ với chữ ký HMAC-SHA256 bảo mật.
    \item \textbf{Màn hình điều phối quầy bar Barista KDS (US-08):} Màn hình \texttt{/barista} hiển thị danh sách đơn hàng theo trạng thái FSM (\texttt{PAID} $\rightarrow$ \texttt{PREPARING} $\rightarrow$ \texttt{READY} $\rightarrow$ \texttt{COMPLETED}); chỉ tài khoản có role barista được cập nhật pha chế.
    \item \textbf{Cơ chế Dọn dẹp đơn hàng quá hạn (US-10):} Sử dụng NestJS Schedule Cron Job chạy ngầm định kỳ mỗi phút quét các đơn hàng ở trạng thái \texttt{PENDING} quá 5 phút chưa thanh toán, tự động hủy đơn (\texttt{CANCELLED}) và hoàn trả tồn kho nguyên liệu.
    \item \textbf{Hệ thống Điểm thưởng \& Hạng thành viên (US-11):} Tự động tích lũy điểm thưởng theo tỷ lệ 1 điểm / 10.000 VNĐ cho mỗi đơn hàng thanh toán thành công; phân hạng thành viên (Đồng, Bạc, Vàng, Kim Cương) và tự động chiết khấu tương ứng; áp dụng các mã voucher khuyến mãi (\texttt{WELCOME10}, \texttt{GIAM20K}, \texttt{VIPGOLD}).
    \item \textbf{Hero Banner \& Cam kết Dịch vụ (US-12):} Giao diện trang chủ chuyên nghiệp với banner giới thiệu thương hiệu BrewLite, cam kết chất lượng đồ uống và tích hợp ô tìm kiếm món ăn nhanh.
    \item \textbf{Phân hệ Quản trị Admin Dashboard (\texttt{/admin}):} Dành riêng cho tài khoản admin (\texttt{@AdminOnly}), gồm 6 tab: Tổng quan, Sản phẩm, Danh mục, Topping, Đơn hàng và Người dùng; Admin có quyền xem và quản lý toàn bộ hệ thống.
\end{enumerate}
\clearpage

% ==================== TRANG 39 (P39) ====================
\subsubsection{Bộ ảnh chụp màn hình Giao diện Thực tế của Hệ thống}

\begin{figure}[H]
    \centering
    \begin{minipage}{0.48\linewidth}
        \centering
        \includegraphics[height=3.6cm,keepaspectratio]{report_images/ui-login.png}
        \caption{Giao diện Đăng nhập BrewLite}
        \label{fig:ui_login}
    \end{minipage}
    \hfill
    \begin{minipage}{0.48\linewidth}
        \centering
        \includegraphics[height=3.6cm,keepaspectratio]{report_images/ui-register.png}
        \caption{Giao diện Đăng ký tài khoản}
        \label{fig:ui_register}
    \end{minipage}
    \vspace{0.2cm}

    \includegraphics[width=0.98\linewidth,height=3.6cm,keepaspectratio]{report_images/ui-hero.jpeg}
    \caption{Giao diện Trang chủ: Hero Banner \& Cam kết dịch vụ}
    \label{fig:ui_hero}
    \vspace{0.2cm}

    \includegraphics[width=0.98\linewidth,height=3.6cm,keepaspectratio]{report_images/ui-menu.jpeg}
    \caption{Giao diện Thực đơn Menu đồ uống theo danh mục}
    \label{fig:ui_menu}
\end{figure}
\clearpage

% ==================== TRANG 40 (P40) ====================
\begin{figure}[p]
    \centering
    \begin{minipage}{0.48\linewidth}
        \centering
        \includegraphics[width=\linewidth,height=4.6cm,keepaspectratio]{report_images/ui-product-detail.jpeg}
        \caption{Giao diện Chi tiết món \& Tùy biến Size/Topping}
        \label{fig:ui_product}
    \end{minipage}
    \hfill
    \begin{minipage}{0.48\linewidth}
        \centering
        \includegraphics[width=\linewidth,height=4.6cm,keepaspectratio]{report_images/ui-cart.png}
        \caption{Giao diện Giỏ hàng \& Tóm tắt đơn hàng}
        \label{fig:ui_cart}
    \end{minipage}
    \vspace{0.3cm}

    \begin{minipage}{0.48\linewidth}
        \centering
        \includegraphics[width=\linewidth,height=4.6cm,keepaspectratio]{report_images/ui-checkout-methods.png}
        \caption{Giao diện Xác nhận phương thức Thanh toán}
        \label{fig:ui_methods}
    \end{minipage}
    \hfill
    \begin{minipage}{0.48\linewidth}
        \centering
        \includegraphics[width=\linewidth,height=4.6cm,keepaspectratio]{report_images/ui-checkout-qr.png}
        \caption{Giao diện Quét mã thanh toán VietQR (PayOS)}
        \label{fig:ui_qr}
    \end{minipage}
    \vspace{0.3cm}

    \begin{minipage}{0.48\linewidth}
        \centering
        \includegraphics[width=\linewidth,height=4.6cm,keepaspectratio]{report_images/ui-order-history.png}
        \caption{Giao diện Lịch sử đơn hàng người dùng}
        \label{fig:ui_history}
    \end{minipage}
    \hfill
    \begin{minipage}{0.48\linewidth}
        \centering
        \includegraphics[width=\linewidth,height=4.6cm,keepaspectratio]{report_images/ui-order-success.jpeg}
        \caption{Màn hình Xác nhận Đặt hàng thành công}
        \label{fig:ui_success}
    \end{minipage}
\end{figure}
\clearpage

% ==================== TRANG 41 (P41) ====================
\begin{figure}[p]
    \centering
    \includegraphics[width=0.98\linewidth,height=0.85\textheight,keepaspectratio]{report_images/ui-barista-kds.jpeg}
    \caption{Giao diện Điều phối pha chế Barista Dashboard (KDS)}
    \label{fig:ui_kds}
\end{figure}
\clearpage

% ==================== TRANG 42 (P42) ====================
\subsection{Task 5.2 -- Tích Hợp và Kiểm Thử Hệ Thống (Integration \& Testing)}

\subsubsection{Kết quả Kiểm thử Đơn vị Toàn diện (Unit Testing)}
Toàn bộ logic nghiệp vụ phức tạp của hệ thống được kiểm thử tự động với Jest tại \texttt{apps/api/src/orders/orders.service.spec.ts}, \texttt{payments.service.spec.ts}, \texttt{products.service.spec.ts}, \texttt{categories.service.spec.ts}, \texttt{auth.service.spec.ts} và \texttt{apps/web/frontend.unit.test.mjs}. Kết quả đạt \textbf{11 test suites / 118 unit tests passed 100\%}, kiểm tra trọn vẹn các kịch bản:
\begin{itemize}[leftmargin=*]
    \item \textbf{Cơ chế chống thanh toán trùng lặp (Idempotency Key):} Kiểm tra khi gửi cùng một mã UUID, hệ thống trả về bản ghi thanh toán trước đó kèm cờ \texttt{idempotent: true}, hoàn toàn không trừ kho hay tạo giao dịch mới.
    \item \textbf{Xung đột phiên bản (Optimistic Locking):} Mô phỏng hai giao dịch ghi đồng thời vào một sản phẩm có cùng trường \texttt{version}; giao dịch thứ hai bị từ chối với mã lỗi \texttt{409 Conflict}.
    \item \textbf{Kiểm soát tồn kho nguyên liệu (Stock Deficiency):} Kiểm tra trường hợp nguyên liệu trong kho không đủ đáp ứng số lượng theo công thức, hệ thống rollback transaction và báo lỗi chi tiết.
    \item \textbf{Phân loại hạng thành viên \& Tính chiết khấu:} Xác thực công thức giảm giá theo điểm tích lũy (Đồng: 0\%, Bạc: 5\%, Vàng: 10\%, Kim Cương: 15\%); Tích điểm chuẩn 1 điểm / 10.000 VNĐ.
\end{itemize}
\clearpage

% ==================== TRANG 43 (P43) ====================
\begin{figure}[H]
    \centering
    \includegraphics[width=0.92\linewidth,height=0.55\textheight,keepaspectratio]{report_images/test-task10.png}
    \caption{Kết quả chạy bộ kiểm thử tự động Task 10 (17 passed tests)}
    \label{fig:test_task10}
\end{figure}

\subsubsection{Kiểm thử Hiệu năng \& Chống ghi trùng Idempotency}
Nhóm tiến hành kiểm thử hiệu năng hệ thống trên môi trường local (\texttt{ALLOW\_MOCK\_PAYMENT=true}) bằng kịch bản PowerShell tự động đo lường thời gian phản hồi:
\begin{itemize}[leftmargin=*]
    \item \textbf{Latency trung bình API Checkout:} Đo lường qua 20 requests liên tiếp đạt thời gian phản hồi trung bình 28.5ms (nhanh hơn rất nhiều so với ngưỡng cam kết NFR-01 là 500ms).
    \item \textbf{Xác thực cơ chế Idempotency:} Gửi 2 request thanh toán liên tiếp với cùng một mã \texttt{idempotencyKey}; request thứ nhất hoàn tất sau 35ms (trừ kho và tạo giao dịch), request thứ hai hoàn tất sau 12ms và trả về kết quả cũ kèm cờ \texttt{idempotent: true}, chứng minh cơ chế chống trừ trùng tiền hoạt động hoàn hảo.
\end{itemize}
\clearpage

% ==================== TRANG 44 (P44) ====================
\begin{figure}[H]
    \centering
    \includegraphics[width=0.92\linewidth,height=0.52\textheight,keepaspectratio]{report_images/test-performance-idempotency.jpeg}
    \caption{Kết quả kiểm thử hiệu năng API và cơ chế chống trùng lặp Idempotency}
    \label{fig:test_perf}
\end{figure}

\subsubsection{Đóng gói Docker \& Triển khai Local 1-Click}
Hệ thống được đóng gói hoàn chỉnh bằng Docker đa nền tảng (Multi-stage build) sử dụng base image siêu nhẹ \texttt{node:24-alpine}:
\begin{itemize}[leftmargin=*]
    \item \textbf{Tối ưu kích thước Image:} Dockerfile của Frontend và Backend sử dụng cơ chế Multi-stage build tách biệt giai đoạn build dependencies và runtime, giúp giảm kích thước container xuống dưới 180MB.
    \item \textbf{Khởi chạy đồng bộ qua Docker Compose:} Tệp \texttt{docker-compose.yml} ở thư mục gốc cho phép khởi chạy toàn bộ 3 containers (\texttt{web:3000}, \texttt{api:3001}, \texttt{db:5433->5432}) và nạp dữ liệu mẫu tự động chỉ với 1 câu lệnh duy nhất:
\end{itemize}
\clearpage

% ==================== TRANG 45 (P45) ====================
\begin{lstlisting}[language=bash,backgroundcolor=\color{tableheader!50},basicstyle=\small\ttfamily,frame=single]
docker compose up --build
\end{lstlisting}

\subsubsection{Endpoint Kiểm tra Sức khỏe Hệ thống (Health Check)}
Backend cung cấp endpoint chuẩn \texttt{GET /health} phục vụ việc giám sát tình trạng hoạt động tự động của Docker và Cloud PaaS:
\begin{itemize}[leftmargin=*]
    \item Khi hệ thống hoạt động bình thường, endpoint trả về mã HTTP \texttt{200 OK} cùng thông tin JSON: \texttt{\{"status":"ok","timestamp":"...","uptime":1234.5\}}.
    \item Nếu kết nối cơ sở dữ liệu bị gián đoạn, endpoint trả về mã HTTP \texttt{503 Service Unavailable}, giúp hạ tầng Render hoặc Docker Daemon tự động khởi động lại container bị lỗi.
\end{itemize}

\subsection{Task 5.3 -- Triển Khai Liên Tục (Continuous Delivery / Deployment -- CD)}

Tài liệu tham chiếu bắt buộc: \texttt{.github/workflows/deploy.yml} và cấu hình Render Webhook.

\subsubsection{Pipeline CD và Cơ chế Tự động Deploy lên Cloud Render}
Nhóm thiết lập pipeline triển khai tự động (Continuous Deployment) kích hoạt mỗi khi có commit hoặc Pull Request được merge vào nhánh \texttt{main}:
\begin{enumerate}[leftmargin=*]
    \item \textbf{Chặng 1 -- Kiểm tra Chất lượng (Quality Gate):} Chạy tự động toàn bộ pipeline CI (Lint, Format, Unit Tests). Nếu có bất kỳ bài test nào thất bại, quy trình deploy lập tức bị dừng lại.
    \item \textbf{Chặng 2 -- Đồng bộ Cơ sở Dữ liệu:} Tự động chạy lệnh \texttt{prisma migrate deploy} để áp dụng các thay đổi cấu trúc bảng mới nhất vào database Production trên Supabase.
    \item \textbf{Chặng 3 -- Kích hoạt Deploy qua Render API:} Sử dụng GitHub Action gửi yêu cầu kích hoạt Deploy Hook an toàn thông qua biến bí mật \texttt{RENDER\_API\_KEY} và \texttt{RENDER\_SERVICE\_ID}.
    \item \textbf{Chặng 4 -- Xác nhận Triển khai (Post-Deployment Verification):} Pipeline chờ máy chủ Render build xong (grace period 45s) và thực hiện kiểm tra tự động (retry 6 lần $\times$ 15s) tới endpoint \texttt{GET /health} và kiểm tra dữ liệu thực tế qua \texttt{GET /api/products} trên môi trường Production.
\end{enumerate}

\subsection{Task 5.4 -- Triển Khai Production và Bàn Giao Sản Phẩm}

\subsubsection{Cơ chế Đồng bộ Dữ liệu và Seed Data}
Hệ thống cung cấp kịch bản nạp dữ liệu mẫu ban đầu tự động \texttt{brewlite\_seed\_data.sql} (hoặc qua lệnh \texttt{npm run seed} của Prisma), nạp sẵn:
\begin{itemize}[leftmargin=*]
    \item 3 danh mục đồ uống chính (Cà phê, Trà sữa, Trà trái cây) cùng 10 sản phẩm đồ uống đa dạng.
    \item 3 loại kích cỡ ly (S, M, L) và 3 loại topping phổ biến (Trân châu đen, Kem Cheese Macchiato, Hạt sen tươi).
    \item 13 loại nguyên vật liệu trong kho với số lượng tồn kho định mức an toàn.
\end{itemize}
\clearpage

% ==================== TRANG 46 (P46) ====================
\subsubsection{Cơ chế Rollback khi triển khai thất bại}
\begin{enumerate}[leftmargin=*]
    \item \textbf{Tầng 1 (Render Instant Rollback):} Nếu bản build mới gặp sự cố hoặc Health Check thất bại sau khi deploy, quản trị viên sử dụng tính năng Rollback của Render để quay trở lại bản build thành công liền trước chỉ với 1 cú click trong vòng 30 giây.
    \item \textbf{Tầng 2 (Git Revert / Tag Rollback):} Nếu lỗi xuất phát từ logic mã nguồn, nhóm kích hoạt quy trình revert commit trên Git: tạo PR revert merge vào \texttt{main}, kích hoạt CD pipeline tự động build và deploy lại bản ổn định.
    \item \textbf{Tầng 3 (Database Migration Rollback):} Mọi migration của Prisma đều được viết kèm kịch bản hoàn tác (Down migration), cho phép khôi phục cấu trúc bảng mà không làm mất mát dữ liệu hiện có.
\end{enumerate}

\begin{table}[H]
\centering
\small
\renewcommand{\arraystretch}{0.92}
\begin{tabularx}{\linewidth}{|p{3.2cm}|p{3.8cm}|p{2.6cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Tài khoản (Email)} & \textbf{Mật khẩu mặc định} & \textbf{Vai trò (Role)} & \textbf{Mục đích kiểm thử \& Quyền hạn} \\ \hline
\texttt{admin@brewlite.com} & \texttt{admin123} & \texttt{admin} & Kiểm thử phân hệ quản trị \texttt{/admin} (6 tab), bật/tắt món, xem toàn bộ đơn hàng và quản lý tài khoản. \\ \hline
\texttt{barista@brewlite.com} & \texttt{barista123} & \texttt{barista} & Kiểm thử màn hình điều phối quầy bar \texttt{/barista} (KDS), tiếp nhận đơn và cập nhật trạng thái pha chế FSM. \\ \hline
\texttt{customer@brewlite.com} & \texttt{customer123} & \texttt{customer} (Hạng Bạc) & Kiểm thử luồng đặt hàng, giỏ hàng, thanh toán VietQR/MoMo, có sẵn 63 điểm tích lũy và hưởng chiết khấu 5\%. \\ \hline
\end{tabularx}
\caption{Danh sách tài khoản kiểm thử được nạp sẵn trong \texttt{brewlite\_seed\_data.sql}}
\label{tab:accounts}
\end{table}

Hệ thống tài khoản mẫu trên giúp Giảng viên và người chấm điểm có thể đăng nhập và trải nghiệm ngay lập tức toàn bộ các phân quyền nghiệp vụ mà không cần tốn thời gian đăng ký mới (tính năng đăng ký tài khoản mới tại \texttt{/register} vẫn hoạt động bình thường nếu muốn tạo thêm người dùng).
\clearpage

% ==================== TRANG 47 (P47) ====================
\subsubsection{Phiên bản Phát hành \& Hướng dẫn Vận hành}
\begin{itemize}[leftmargin=*]
    \item \textbf{Release Tag v1.0.1:} \url{https://github.com/Phucdang-gif/Assignment2/releases/tag/v1.0.1} đính kèm đầy đủ mã nguồn đóng gói, tệp \texttt{RELEASE\_NOTES.md} chi tiết và video demo minh chứng vận hành.
    \item \textbf{Tài liệu Hướng dẫn Triển khai \& Rollback:} Hướng dẫn chi tiết các bước cài đặt từ đầu, thiết lập biến môi trường và quy trình rollback lưu tại \texttt{docs/delivery/deployment-guide.md}.
\end{itemize}

\subsection{Task 5.5 -- Đánh Giá Sprint 2 và Bài Học Kinh Nghiệm}

\subsubsection{Đánh giá kết quả hoàn thành Sprint 2 (Sprint Review)}
Nhóm đã hoàn thành 100\% các mục tiêu đã cam kết trong Sprint Backlog:
\begin{itemize}[leftmargin=*]
    \item Toàn bộ 13 User Stories đều đạt tiêu chuẩn hoàn thành Definition of Done (DoD).
    \item Luồng đặt hàng và thanh toán hoạt động trơn tru với cả 3 phương thức (VietQR, MoMo, Mock).
    \item Hệ thống chống race-condition bằng Optimistic Locking và chống thanh toán trùng lặp bằng Idempotency Key đã được kiểm chứng bằng kịch bản kiểm thử tự động.
    \item Bộ kiểm thử đơn vị đạt 11 test suites / 118 unit tests passed (100\%).
    \item Triển khai thành công ứng dụng lên môi trường Production Cloud Render và đóng gói Docker 1-click.
\end{itemize}

\subsubsection{Bài học kinh nghiệm (Sprint Retrospective)}
\begin{itemize}[leftmargin=*]
    \item \textbf{Điểm làm tốt (What went well):}
    \begin{itemize}[leftmargin=*,noitemsep]
        \item Sự phối hợp chặt chẽ giữa các thành viên thông qua Daily Standup và quy trình Git PR review nghiêm túc giúp phát hiện sớm các lỗi xung đột mã nguồn.
        \item Việc thiết lập CI/CD pipeline tự động ngay từ Sprint 1 giúp tiết kiệm rất nhiều thời gian kiểm thử hồi quy và ngăn chặn mã nguồn lỗi lọt vào nhánh chính.
        \item Việc tài liệu hóa chi tiết từ Task 1 (SRS) và Task 2 (UML Diagrams) giúp quá trình lập trình ở Task 4 và Task 5 diễn ra nhanh chóng, đúng hướng và không bị lệch yêu cầu.
    \end{itemize}
    \item \textbf{Điểm cần cải tiến (What could be improved):}
    \begin{itemize}[leftmargin=*,noitemsep]
        \item Cần cấu hình thêm công cụ giám sát tập trung (như Sentry hoặc Datadog) để theo dõi lỗi phía Client và hiệu năng hệ thống theo thời gian thực tốt hơn.
        \item Trong tương lai có thể bổ sung WebSocket thay cho cơ chế Polling để màn hình Barista KDS nhận đơn tức thì hơn nữa.
    \end{itemize}
\end{itemize}
\clearpage

% ==================== TRANG 48 (P48) ====================
\section{MA TRẬN TRUY VẾT YÊU CẦU (TRACEABILITY MATRIX)}

Tài liệu tham chiếu bắt buộc: \texttt{docs/requirements/traceability-matrix.md}.

Ma trận truy vết yêu cầu (Requirements Traceability Matrix -- RTM) là công cụ kiểm soát chất lượng cốt lõi, bảo đảm mối liên kết xuyên suốt hai chiều (Bi-directional Traceability) từ các yêu cầu nghiệp vụ ban đầu (Business Requirements), yêu cầu chức năng (FR) và phi chức năng (NFR) cho đến khi được hiện thực hóa qua sơ đồ thiết kế, quyết định kiến trúc, mã nguồn API và các bài kiểm thử tự động tương ứng:
\clearpage

% ==================== TRANG 49 (P49) ====================
\subsection{Bảng Truy Vết Yêu Cầu Chức Năng (Functional Requirements -- FR)}

\begin{table}[H]
\centering
\footnotesize
\renewcommand{\arraystretch}{0.88}
\begin{tabularx}{\linewidth}{|c|p{2.6cm}|p{2.4cm}|p{3.4cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Mã FR} & \textbf{User Story / Use Case} & \textbf{Sơ đồ Thiết kế / ADR} & \textbf{Mã nguồn / Endpoint API} & \textbf{Kiểm thử Tự động (Test Cases)} \\ \hline
\textbf{FR-01} & US-01: Xem menu \newline UC-02: Duyệt menu & Class-01 (Product), C4-Container & \texttt{apps/api/.../products.controller.ts} \newline \texttt{GET /api/products} & \texttt{products.service.spec.ts} \newline \texttt{frontend.unit.test.mjs} \\ \hline
\textbf{FR-02} & US-02, US-03: Tùy biến \newline UC-03: Tùy biến ly & Activity-01, Sequence-01, ADR-02 & \texttt{apps/web/app/product/[id]/page.tsx} \newline \texttt{GET /api/products/:id} & \texttt{products.service.spec.ts} \newline \texttt{app.e2e-spec.ts} \\ \hline
\textbf{FR-03} & US-04: Giỏ hàng \newline UC-04: Quản lý giỏ & Activity-01, ADR-02 (Zustand) & \texttt{apps/web/store/useCartStore.ts} \newline \texttt{localStorage} persistence & \texttt{frontend.unit.test.mjs} \\ \hline
\textbf{FR-04} & US-05: Đăng ký/nhập \newline UC-05: Xác thực & Class-01 (User), ADR-03 (JWT) & \texttt{apps/api/.../auth.controller.ts} \newline \texttt{POST /api/auth/login} & \texttt{auth.service.spec.ts} \newline \texttt{app.e2e-spec.ts} \\ \hline
\textbf{FR-05} & US-06: Tạo đơn \newline UC-06: Đặt hàng & Sequence-01, ADR-04, ADR-05 & \texttt{apps/api/.../orders.service.ts} \newline \texttt{POST /api/orders} & \texttt{orders.service.spec.ts} \newline \texttt{orders-payments.e2e-spec.ts} \\ \hline
\textbf{FR-06} & US-07: Thanh toán \newline UC-07: Thanh toán & Activity-01, Sequence-02, ADR-06 & \texttt{apps/api/.../payments.service.ts} \newline \texttt{POST /api/payments} & \texttt{payments.service.spec.ts} \newline \texttt{orders-payments.e2e-spec.ts} \\ \hline
\textbf{FR-07} & US-06: Lịch sử đơn \newline UC-08: Xem lịch sử & Class-01 (Order), C4-Container & \texttt{apps/api/.../orders.controller.ts} \newline \texttt{GET /api/orders/my-orders} & \texttt{orders.service.spec.ts} \newline \texttt{app.e2e-spec.ts} \\ \hline
\textbf{FR-08} & US-08: Quầy bar \newline UC-09: Barista KDS & Activity-01, Class-01 (order\_status) & \texttt{apps/web/app/barista/page.tsx} \newline \texttt{PATCH /orders/barista/:id/status} & \texttt{orders.service.spec.ts} \newline \texttt{app.e2e-spec.ts} \\ \hline
\textbf{FR-09} & US-09: Bật/tắt món \newline UC-10: Quản trị món & Class-01, ADR-03 (@AdminOnly) & \texttt{apps/api/.../products.service.ts} \newline \texttt{PATCH /api/products/:id/toggle} & \texttt{products.service.spec.ts} \\ \hline
\textbf{FR-10} & US-10: Hủy quá hạn \newline UC-06: Hủy đơn & Activity-01 (Rollback), ADR-04 & \texttt{OrdersService.create()} \newline \texttt{/api/orders/:id/cancel} & \texttt{orders.service.spec.ts} \newline \texttt{app.e2e-spec.ts} \\ \hline
\textbf{FR-11} & US-11: Tích điểm \newline UC-06: Áp khuyến mãi & Class-01 (Promotion), C4-Container & \texttt{apps/api/.../orders.service.ts} \newline \texttt{loyaltyPoints} calculation & \texttt{orders.service.spec.ts} \\ \hline
\textbf{FR-12} & US-12: Hero Banner \newline UC-02: Khám phá món & C4-Container, Next.js App Router & \texttt{apps/web/app/page.tsx} \newline \texttt{GET /api/categories} & \texttt{products.service.spec.ts} \\ \hline
\textbf{FR-13} & US-13: Chặn spam \newline UC-07: Thanh toán & Class-01 (payment), ADR-03 & DTO validation chặn payload; \texttt{ThrottlerGuard} chặn spam & \texttt{payments.service.spec.ts} \newline \texttt{orders-payments.e2e-spec.ts} \\ \hline
\end{tabularx}
\caption{Ma trận truy vết yêu cầu chức năng (RTM -- Functional Requirements)}
\label{tab:rtm_fr}
\end{table}
\clearpage

% ==================== TRANG 50 (P50) ====================
\subsection{Bảng Truy Vết Yêu Cầu Phi Chức Năng (Non-Functional Requirements -- NFR)}

\begin{table}[H]
\centering
\small
\renewcommand{\arraystretch}{0.92}
\begin{tabularx}{\linewidth}{|c|p{3.0cm}|p{3.2cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Mã NFR} & \textbf{Tiêu chuẩn Phi chức năng} & \textbf{Giải pháp Thiết kế \& Kiến trúc} & \textbf{Bằng chứng Kiểm thử \& Đo lường} \\ \hline
\textbf{NFR-01} & Hiệu năng API $\le$ 500ms; Tải trang PWA $<$ 2.0s & ADR-02 (Next.js PWA, Zustand), C4-Container & Đo kiểm tải đạt 28.5ms trung bình; Google Lighthouse Performance 92/100. \\ \hline
\textbf{NFR-02} & Tính toàn vẹn ACID, không âm kho nguyên liệu & ADR-04 (Prisma Transaction), ADR-05 (Optimistic Lock) & Kiểm thử Race Condition với 2 request đồng thời; 100\% test cases trừ kho pass. \\ \hline
\textbf{NFR-03} & Mật khẩu băm an toàn, mã hóa JWT, chặn spam & ADR-03 (NestJS Guard, bcrypt Salt=10, ThrottlerGuard) & \texttt{auth.service.spec.ts} pass; kiểm thử brute-force chặn thành công HTTP 429. \\ \hline
\textbf{NFR-04} & Giao diện chuẩn Mobile-First (Responsive 375px+) & ADR-02 (TailwindCSS Responsive), Zustand Offline & Kiểm thử thực tế trên thiết bị di động (Chrome DevTools Mobile Mode); đặt món dưới 4 chạm. \\ \hline
\textbf{NFR-05} & Triển khai 1 câu lệnh bằng Docker đa nền tảng & ADR-06 (Docker Multi-stage Build, Docker Compose) & Kiểm tra khởi chạy \texttt{docker compose up --build} trên Windows/Linux thành công. \\ \hline
\textbf{NFR-06} & Khả năng bảo trì, Clean Code, TypeScript Strict & C4-Component (Module rõ ràng), ESLint, Jest Unit Test & 11 test suites / 118 unit tests passed (100\% pass); GitHub Actions CI pass 100\%. \\ \hline
\end{tabularx}
\caption{Ma trận truy vết yêu cầu phi chức năng (RTM -- Non-Functional Requirements)}
\label{tab:rtm_nfr}
\end{table}

\subsubsection{Đường dẫn Hệ thống Triển khai Thực tế trên Cloud Render}
Toàn bộ hệ thống BrewLite đã được triển khai hoàn chỉnh trên môi trường Cloud Render và cơ sở dữ liệu Supabase PostgreSQL:
\begin{itemize}[leftmargin=*]
    \item \textbf{Backend API Service:} \url{https://assignment2-ugde.onrender.com}
    \item \textbf{Health Check Endpoint:} \url{https://assignment2-ugde.onrender.com/health}
    \item \textbf{GitHub Repository chính thức:} \url{https://github.com/Phucdang-gif/Assignment2}
    \item \textbf{Release Tag v1.0.1:} \url{https://github.com/Phucdang-gif/Assignment2/releases/tag/v1.0.1}
\end{itemize}
\clearpage

% ==================== TRANG 51 (P51) ====================
\subsection{Checklist Bàn Giao và Nghiệm Thu Dự Án (Mục 9.1 Đề Bài)}

\begin{itemize}[leftmargin=*]
    \item[$\checkmark$] \textbf{Mã nguồn Đầy đủ \& Sẵn sàng Khởi chạy:} Toàn bộ mã nguồn Frontend (Next.js) và Backend (NestJS) được đóng gói trong Git Monorepo, biên dịch thành công 100\% không có lỗi cú pháp.
    \item[$\checkmark$] \textbf{Hồ sơ Thiết kế Kiến trúc \& Yêu cầu Hệ thống:} Đầy đủ tài liệu SRS (Task 1), sơ đồ UML 2.0 (Use Case, Activity, Sequence, Class Diagram tại Task 2), kiến trúc C4 và 6 bản ghi ADR (Task 3).
    \item[$\checkmark$] \textbf{Bằng chứng Quy trình Agile/Scrum \& CI/CD Pipeline:} Minh chứng quy trình Git Feature-Branching, Conventional Commits, Product Backlog, Definition of Done, 2 Pull Requests minh chứng CI Pass (\#22) và CI Fail (\#21) trên GitHub Actions.
    \item[$\checkmark$] \textbf{Kết quả Kiểm thử Phần mềm Đạt Chuẩn:} Bộ kiểm thử tự động đạt 11 test suites / 118 unit tests passed (100\%), kịch bản kiểm thử hiệu năng API đạt 28.5ms, cơ chế chống trừ trùng tiền Idempotency Key hoạt động chính xác.
    \item[$\checkmark$] \textbf{Môi trường Triển khai Production Thực tế:} Hệ thống đã deploy thành công trên nền tảng Cloud Render và Supabase, có sẵn endpoint Health Check và dữ liệu mẫu nạp sẵn.
    \item[$\checkmark$] \textbf{Ma trận Truy vết Toàn diện (RTM):} Đầy đủ bảng RTM ánh xạ hai chiều cho 13 yêu cầu chức năng (FR-01 $\rightarrow$ FR-13) và 6 yêu cầu phi chức năng (NFR-01 $\rightarrow$ NFR-06).
    \item[$\checkmark$] \textbf{Release Notes, README \& Hướng dẫn Rollback:} Hướng dẫn chi tiết các bước cài đặt từ đầu, khởi chạy Docker 1 câu lệnh và quy trình hoàn tác khi triển khai gặp sự cố.
    \item[$\checkmark$] \textbf{Sprint Review \& Sprint Retrospective:} Đánh giá hoàn thành 100\% mục tiêu Sprint và đúc rút bài học kinh nghiệm phát triển phần mềm Agile/Scrum.
\end{itemize}

\end{document}
'''

with open('BaoCao_Assignment2_BrewLite.tex', 'w', encoding='utf-8') as f:
    f.write(tex_content)

print('BaoCao_Assignment2_BrewLite.tex generated successfully.')
