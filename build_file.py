# -*- coding: utf-8 -*-
import subprocess

tex_content = r'''\documentclass[11pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[vietnamese]{babel}
\usepackage[T5]{fontenc}
\usepackage[a4paper, top=2.5cm, bottom=2.5cm, left=2.2cm, right=2cm, headheight=34pt]{geometry}
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
\fancyhead[L]{\small\includegraphics[height=0.8cm]{report_images/isf_logo.png}\hspace{0.25cm}\begin{tabular}[b]{@{}l@{}}\textbf{\textsf{TRƯỜNG ĐẠI HỌC SÀI GÒN}}\\\small\textsf{Khoa Công Nghệ Thông Tin}\end{tabular}}
\fancyhead[R]{\small\textbf{\textsf{Báo cáo Assignment 2: BrewLite}}}
\fancyfoot[L]{\footnotesize\textcolor{gray}{\textsf{BrewLite -- Hệ thống Đặt đồ uống \& Thanh toán Trực tuyến}}}
\fancyfoot[R]{\small\textsf{Trang \thepage\ / \pageref{LastPage}}}
\renewcommand{\headrulewidth}{0.5pt}
\renewcommand{\footrulewidth}{0.4pt}

\lstset{
  backgroundcolor=\color{codebg},
  basicstyle=\footnotesize\ttfamily,
  breaklines=true,
  frame=single,
  rulecolor=\color{gray!40},
  numbers=none,
  tabsize=2,
  showstringspaces=false
}

\newcolumntype{Y}{>{\raggedright\arraybackslash}X}

\begin{document}

% ==========================================
% TRANG BÌA CHÍNH THỨC (TRANG 1)
% ==========================================
\begin{titlepage}
    \centering
    \thispagestyle{empty}
    \vspace*{0.2cm}
    
    {\Large \textbf{\textsf{TRƯỜNG ĐẠI HỌC SÀI GÒN}}\par}
    \vspace{0.15cm}
    {\Large \textbf{\textsf{KHOA CÔNG NGHỆ THÔNG TIN}}\par}
    
    \vspace{1.0cm}
    \includegraphics[width=4.0cm]{report_images/isf_logo.png}
    
    \vspace{1.0cm}
    {\LARGE \textbf{\textsf{CÔNG NGHỆ PHẦN MỀM}}\par}
    \vspace{0.3cm}
    \rule{\linewidth}{1.2pt}\\[0.35cm]
    {\Huge \bfseries \textsf{BrewLite}\par}
    \vspace{0.25cm}
    {\Large \bfseries \textsf{Hệ thống Đặt đồ uống \& Thanh toán Trực tuyến}\par}
    \vspace{0.2cm}
    {\large \textbf{\textsf{BÁO CÁO BÀI TẬP LỚN -- ASSIGNMENT 2 (REQUIREMENTS TO DEPLOYMENT)}}\par}
    \rule{\linewidth}{1.2pt}\\[1.2cm]
    
    \begin{flushleft}
    \hspace*{2cm}
    \begin{minipage}{0.85\textwidth}
        \large
        \textbf{GVHD:} ThS. Từ Lãng Phiêu\\[0.3cm]
        \textbf{Thành viên (Nhóm 6):}
        \begin{itemize}[leftmargin=*,noitemsep,label={--}]
            \item Đặng Hoàng Phúc -- 3124410280
            \item Châu Chí Hải -- 3124410076
            \item Võ Dương Thành Lê -- 3124410185
            \item Trần Quang Duy -- 3124410051
            \item Thiều Đình Trung Hiếu -- 3124410099
            \item Lê Quốc Việt -- 3124410405
        \end{itemize}
    \end{minipage}
    \end{flushleft}
    
    \vfill
    {\large \textbf{\textsf{TP. HỒ CHÍ MINH, THÁNG 11/2026}}\par}
    {\normalsize \textsf{Học kỳ I -- Năm học 2026--2027}\par}
\end{titlepage}

% ==========================================
% TRANG MỤC LỤC (TRANG 2 & 3)
% ==========================================
\newpage
\pagenumbering{roman}
\tableofcontents
\clearpage
\pagenumbering{arabic}

% ==========================================
% TASK 1: KHAI THÁC VÀ ĐẶC TẢ YÊU CẦU (TRANG 4)
% ==========================================
\section{TASK 1: KHAI THÁC VÀ ĐẶC TẢ YÊU CẦU}

\subsection{Task 1.1 -- Bối cảnh, Stakeholder và Phạm vi Hệ thống}

Tài liệu tham chiếu bắt buộc: \texttt{docs/requirements/context-and-scope.md}.

\subsubsection{Vấn đề nghiệp vụ cần giải quyết}
Trong mô hình kinh doanh quán cà phê và đồ uống truyền thống, các cửa hàng thường xuyên gặp phải những bất cập sau trong khâu vận hành và phục vụ khách hàng:
\begin{enumerate}[leftmargin=*]
    \item \textbf{Quá tải và chờ đợi lâu vào giờ cao điểm:} Khách hàng phải xếp hàng dài để chờ nhân viên ghi nhận món tại quầy, gây gián đoạn và giảm tỷ lệ hài lòng của khách.
    \item \textbf{Sai sót trong tiếp nhận và pha chế order:} Khách hàng có nhu cầu tùy biến kích cỡ (Size S/M/L) và chọn nhiều topping đi kèm. Việc truyền đạt trực tiếp bằng miệng hoặc ghi chép tay dễ dẫn đến nhầm lẫn, làm sai công thức gây lãng phí nguyên liệu.
    \item \textbf{Thiếu tính minh bạch trong theo dõi tiến độ đơn hàng:} Khách hàng không nắm được đơn của mình đang ở giai đoạn nào (chờ thanh toán, đang pha chế, hay đã xong để lấy), dẫn đến việc tụ tập chờ đợi quanh quầy bar gây lộn xộn.
    \item \textbf{Quản lý tồn kho và doanh thu phân tán:} Khó kiểm soát tồn kho tức thời (real-time stock) dẫn đến tình trạng khách đặt món nhưng thực tế nguyên liệu đã hết; thiếu cơ chế đối soát thanh toán và rủi ro đặt trùng đơn do lỗi mạng.
    \item \textbf{Thiếu cơ chế gắn kết khách hàng (Customer Loyalty):} Cửa hàng chưa có giải pháp tự động tích lũy điểm thưởng thành viên theo giá trị đơn hàng để tái thu hút khách hàng quay lại.
\end{enumerate}

\noindent\textbf{Giải pháp của BrewLite:} Hệ thống xây dựng nền tảng đặt đồ uống trực tuyến gọn nhẹ, tối ưu cho thiết bị di động (Mobile-First / PWA), kết nối trực tiếp và đồng bộ theo thời gian thực giữa Khách hàng, Nhân viên quầy bar (Barista) và Quản lý cửa hàng.

\clearpage
% ==========================================
% TRANG 5: BẢNG 1 & IN-SCOPE
% ==========================================
\subsubsection{Bảng phân tích các bên liên quan (Stakeholder Matrix)}

\begin{table}[H]
\centering
\small
\begin{tabularx}{\linewidth}{|c|p{2.2cm}|p{2.2cm}|Y|Y|c|}
\hline
\rowcolor{tableheader}
\textbf{STT} & \textbf{Stakeholder} & \textbf{Vai trò} & \textbf{Mục tiêu chính} & \textbf{Kỳ vọng đối với hệ thống} & \textbf{Ảnh hưởng} \\ \hline
1 & \textbf{Khách hàng} \newline (Customer) & Đặt món trực tuyến qua PWA/Web. & Xem thực đơn, tùy biến đồ uống, thanh toán nhanh, theo dõi đơn, tích điểm. & Giao diện tải nhanh dưới 2s, tính tiền chính xác, theo dõi trạng thái rõ ràng, bảo mật tài khoản. & Rất cao \\ \hline
2 & \textbf{Nhân viên quầy} \newline (Barista) & Tiếp nhận order và pha chế đồ uống. & Nhận danh sách đơn theo thời gian thực, xem chi tiết size/topping, báo hoàn thành. & Giao diện KDS trực quan, cập nhật tức thời tránh trùng/sót đơn, giảm tải thao tác thủ công. & Cao \\ \hline
3 & \textbf{Quản lý} \newline (Store Manager \newline / Admin) & Giám sát vận hành, kho và danh mục. & Kiểm soát tồn kho tức thời, cập nhật bật/tắt món, quản trị danh mục/topping/người dùng qua \texttt{/admin}. & Cảnh báo hết hàng kịp thời, phân quyền \texttt{@AdminOnly}, không xảy ra bán âm kho. & Cao \\ \hline
4 & \textbf{Giảng viên} \newline (Evaluator) & Nghiệm thu chất lượng đồ án. & Đánh giá quy trình Agile/Scrum qua 2 Sprint, kiểm chứng tính hoàn thiện kỹ thuật. & Tài liệu chuẩn xác, ma trận truy vết đầy đủ, hệ thống deploy production chạy ổn định có HTTPS. & Rất cao \\ \hline
5 & \textbf{Nhóm phát triển} \newline (Dev Team) & Thiết kế, lập trình và vận hành. & Kiến trúc module hóa, kiểm thử tự động toàn diện, tự động hóa CI/CD. & Monorepo phân tách rõ ràng, migration dữ liệu ổn định, môi trường local đồng nhất qua Docker. & Cao \\ \hline
6 & \textbf{Đơn vị thanh toán} \newline (PayOS / \newline MoMo \& Mock Test) & Xử lý giao dịch VietQR, MoMo \& mô phỏng test. & Thanh toán trực tuyến an toàn qua PayOS/MoMo Sandbox và kiểm thử tự động bằng \texttt{idempotencyKey}. & Phản hồi trạng thái chính xác (SUCCESS/FAILED), đối soát Webhook/IPN và an toàn khi retry. & Trung bình \\ \hline
\end{tabularx}
\caption{Bảng phân tích 6 bên liên quan (Stakeholder Matrix)}
\end{table}

\subsubsection{Phạm vi hệ thống (In-Scope và Out-of-Scope)}

\noindent\textbf{A. Phạm vi trong hệ thống (In-Scope):}
\begin{itemize}[leftmargin=*,noitemsep]
    \item \textbf{Phạm vi MVP Sprint 1:} Xem danh mục thực đơn đồ uống theo danh mục (Cà phê, Trà trái cây, Trà sữa, Đá xay \& Thức uống khác); Xem chi tiết sản phẩm; Giao diện chuẩn Mobile-first Responsive; Xử lý 3 trạng thái bắt buộc (Loading Skeleton, Empty State, Error State); Kịch bản database seed dữ liệu mẫu; Kiểm thử tự động cơ bản.
    \item \textbf{Phạm vi Sprint 2 (Hoàn thiện MVP \& Mở rộng):} Tùy biến kích cỡ ly (Size S, M, L) và chọn Topping kèm theo; Giỏ hàng quản lý bằng Zustand kết hợp \texttt{localStorage}; Đăng ký và đăng nhập bảo mật bằng mật khẩu băm bcrypt và mã JWT (kèm Rate Limiting); Tạo đơn hàng với giao dịch cơ sở dữ liệu atomic; Thanh toán không tiền mặt qua \textbf{VietQR (PayOS SDK)} và \textbf{Ví MoMo Sandbox} (cùng endpoint mô phỏng \texttt{POST /api/payments} với khóa \texttt{idempotencyKey} cho kiểm thử tự động và đơn 0đ); Theo dõi trạng thái đơn hàng thời gian thực qua máy trạng thái 7 bước; Phân hệ Barista KDS (\texttt{/barista}); Phân hệ Quản trị Admin (\texttt{/admin}) với 6 tab quản lý (\texttt{@AdminOnly}); Tích lũy điểm thưởng thành viên tự động và áp dụng chiết khấu theo thứ hạng (Đồng, Bạc, Vàng, Kim Cương) kèm mã Voucher.
\end{itemize}

\clearpage
% ==========================================
% TRANG 6: OUT-OF-SCOPE, GIẢ ĐỊNH & BẢNG 2
% ==========================================
\noindent\textbf{B. Phạm vi ngoài hệ thống (Out-of-Scope):}
\begin{itemize}[leftmargin=*,noitemsep]
    \item Không sử dụng luồng thu tiền thương mại live sản xuất có đối soát ngân hàng thật (chỉ dùng PayOS / MoMo môi trường Sandbox/Test và Mock Payment Service cho kiểm thử tự động).
    \item Không tích hợp định vị GPS hoặc đơn vị vận chuyển đường dài ngoài (GrabExpress, ShopeeFood). Khách hàng nhận món trực tiếp tại quầy quán (Pick-up at counter).
    \item Không tích hợp phần cứng máy in bill nhiệt ESC/POS hoặc ngăn kéo đựng tiền vật lý.
    \item Không phát triển phân hệ chấm công, xếp lịch ca làm việc và tính lương nhân viên.
\end{itemize}

\subsubsection{Giả định, Ràng buộc kỹ thuật \& Đánh giá rủi ro ban đầu}

\noindent\textbf{A. Giả định (Assumptions):} Khách hàng sử dụng thiết bị có trình duyệt web hiện đại hỗ trợ JavaScript/HTML5 và kết nối mạng Internet ổn định. Quy mô phục vụ một cửa hàng đơn lẻ với lưu lượng dưới 100 giao dịch đồng thời trong giờ cao điểm. Khách hàng luôn có đủ số dư tài khoản khi thanh toán thử nghiệm.

\noindent\textbf{B. Ràng buộc kỹ thuật bắt buộc:}
\begin{itemize}[leftmargin=*,noitemsep]
    \item \textbf{Frontend:} Bắt buộc sử dụng Next.js (App Router) theo định hướng Mobile-first / PWA.
    \item \textbf{Backend:} Bắt buộc sử dụng NestJS theo kiến trúc module/domain.
    \item \textbf{Database:} Bắt buộc sử dụng PostgreSQL 16 kết hợp Prisma ORM và migration có phiên bản.
    \item \textbf{Containerization:} Bắt buộc đóng gói và chạy được toàn bộ hệ thống bằng \texttt{docker-compose.yml}.
    \item \textbf{Toàn vẹn dữ liệu:} Thao tác tạo đơn hàng và trừ tồn kho nguyên liệu phải nằm trong một Database Transaction (Atomic); Chống race condition bán âm kho bằng trường \texttt{version} (Optimistic Locking).
\end{itemize}

\noindent\textbf{C. Bảng đánh giá rủi ro ban đầu (Initial Risk Assessment):}

\begin{table}[H]
\centering
\small
\begin{tabularx}{\linewidth}{|c|p{2.8cm}|c|c|Y|}
\hline
\rowcolor{tableheader}
\textbf{Mã} & \textbf{Rủi ro phát sinh} & \textbf{Xác suất} & \textbf{Tác động} & \textbf{Giải pháp kiểm soát \& Giảm thiểu} \\ \hline
R-01 & \textbf{Bán vượt tồn kho (Overselling)} khi nhiều khách cùng đặt món cuối. & Trung bình & Rất cao & Sử dụng khóa lạc quan (Optimistic Concurrency Control) với trường \texttt{version} trong bảng \texttt{Product}. Request trùng version bị hủy an toàn. \\ \hline
R-02 & \textbf{Thanh toán trùng lặp (Double Payment)} do mạng lag bấm nhiều lần. & Cao & Nghiêm trọng & Sử dụng \texttt{idempotencyKey} duy nhất cho mỗi giao dịch thanh toán. Backend kiểm tra và trả lại kết quả cũ nếu key đã xử lý. \\ \hline
R-03 & \textbf{Xung đột Schema \& Migration} giữa local và production. & Trung bình & Cao & Sử dụng Prisma Migration có kiểm soát phiên bản Git (\texttt{prisma migrate deploy}) chạy tự động trong CI/CD. \\ \hline
R-04 & \textbf{Lỗi triển khai CI/CD} và lộ lọt secret môi trường. & Trung bình & Cao & Quản lý bí mật bằng Secret Manager của Vercel/Render, kiểm thử pipeline sớm từ Sprint 1 với 4 chặng Quality Gate. \\ \hline
\end{tabularx}
\caption{Bảng đánh giá rủi ro ban đầu và giải pháp giảm thiểu}
\end{table}

\clearpage
% ==========================================
% TRANG 7: TASK 1.2 & BẢNG 3 (FR-01 ĐẾN FR-11)
% ==========================================
\subsection{Task 1.2 -- Yêu cầu Chức năng và Phi Chức năng (SRS Rút Gọn)}

Tài liệu tham chiếu bắt buộc: \texttt{docs/requirements/srs.md}.

\subsubsection{Danh sách Yêu cầu Chức năng (Functional Requirements -- FR)}
Mọi yêu cầu chức năng được nhóm phân loại theo mô hình ưu tiên MoSCoW (Must have, Should have, Could have, Won't have) kèm tiêu chí chấp nhận có thể kiểm chứng:

\begin{table}[H]
\centering
\small
\begin{tabularx}{\linewidth}{|c|p{3.2cm}|c|p{4.2cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Mã FR} & \textbf{Tên chức năng} & \textbf{Ưu tiên} & \textbf{Mô tả nghiệp vụ} & \textbf{Tiêu chí chấp nhận (Acceptance Criteria)} \\ \hline
\textbf{FR-01} & Xem thực đơn đồ uống & Must & Khách hàng duyệt danh mục, hình ảnh, giá gốc và tình trạng còn/hết hàng của đồ uống. & Trả về JSON đúng cấu trúc; hiển thị Loading Skeleton khi tải; hiển thị nhãn Hết hàng khi stock = 0; thông báo khi danh mục trống. \\ \hline
\textbf{FR-02} & Tùy biến Size \& Topping & Must & Khách hàng chọn size (S/M/L) và các topping thêm cho từng ly. & Chọn 1 size bắt buộc; chọn 0 hoặc nhiều topping; cập nhật tổng tiền tạm tính ngay tại giao diện \texttt{/product/[id]}. \\ \hline
\textbf{FR-03} & Quản lý giỏ hàng & Must & Thêm món, điều chỉnh số lượng, xóa món khỏi giỏ hàng. & Cập nhật số lượng và tổng tiền chính xác; lưu trạng thái vào \texttt{localStorage} không mất khi tải lại trang. \\ \hline
\textbf{FR-04} & Đăng ký \& Đăng nhập & Must & Tạo tài khoản, đăng nhập hệ thống, cấp phát token JWT. & Mật khẩu băm bcrypt; trả về token JWT hợp lệ; giới hạn tần suất (\texttt{ThrottlerGuard}); chặn API bảo vệ khi thiếu token. \\ \hline
\textbf{FR-05} & Tạo đơn hàng \& Giữ kho & Must & Tạo đơn hàng mới từ giỏ hàng ở trạng thái \texttt{PENDING}. & Kiểm tra tồn kho nguyên liệu trước khi tạo; thực hiện trong transaction atomic; rollback nếu thiếu hàng. \\ \hline
\textbf{FR-06} & Thanh toán không tiền mặt & Must & Thanh toán qua VietQR (PayOS), Ví MoMo và endpoint \texttt{POST /api/payments} (\texttt{idempotencyKey} cho test \& đơn 0đ). & Đổi đơn sang \texttt{PAID}; xác thực chữ ký Webhook/IPN; nếu gửi lặp cùng \texttt{idempotencyKey} trả kết quả cũ không trừ tiền 2 lần. \\ \hline
\textbf{FR-07} & Xem lịch sử \& Tích điểm & Should & Khách hàng xem lại các đơn đã đặt và điểm thưởng tích lũy. & Chỉ hiển thị đơn thuộc tài khoản đăng nhập; tích lũy 1 điểm cho mỗi 10.000 VNĐ khi thanh toán thành công. \\ \hline
\textbf{FR-08} & Tiếp nhận \& Pha chế (Barista) & Should & Barista nhận đơn và cập nhật tiến độ pha chế trên KDS. & Hiển thị đơn \texttt{PAID}; chuyển trạng thái \texttt{PREPARING} $\rightarrow$ \texttt{READY} $\rightarrow$ \texttt{COMPLETED}; polling tự động 10s. \\ \hline
\textbf{FR-09} & Quản lý bật/tắt món \& Admin & Could & Quản trị viên (admin) quản lý danh mục, sản phẩm, topping, đơn hàng và người dùng. & Trang \texttt{/admin} (\texttt{@AdminOnly}); cập nhật cờ status món và \texttt{isAvailable} của topping; khách không thể chọn món đã tắt. \\ \hline
\textbf{FR-10} & Dọn dẹp đơn quá hạn & Could & Giữ chỗ 5 phút ở UI; tự động hủy đơn PENDING quá 5--6 phút chưa thanh toán. & Hủy đơn quá hạn hoặc khi khách hủy (\texttt{/cancel}); hoàn trả số lượng tồn kho nguyên liệu đã giữ chỗ. \\ \hline
\textbf{FR-11} & Chiết khấu hạng thành viên & Should & Tự động áp dụng giảm giá theo điểm tích lũy của khách hàng. & Đồng ($<$20đ): 0\%; Bạc (20--49đ): giảm 5\%; Vàng (50--99đ): giảm 10\%; Kim Cương ($\ge$100đ): giảm 15\%. \\ \hline
\end{tabularx}
\caption{Danh sách Yêu cầu Chức năng (Functional Requirements -- FR) theo chuẩn MoSCoW}
\end{table}

\begin{flushright}
\small\textit{(Xem tiếp trang sau...)}
\end{flushright}

\clearpage
% ==========================================
% TRANG 8: BẢNG 3 TIẾP, BẢNG 4 (NFR) & 1.2.3 INTRO
% ==========================================
\noindent\textbf{Bảng 3 -- Tiếp theo từ trang trước}
\vspace{0.1cm}

\begin{table}[H]
\centering
\small
\begin{tabularx}{\linewidth}{|c|p{3.2cm}|c|p{4.2cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Mã FR} & \textbf{Tên chức năng} & \textbf{Ưu tiên} & \textbf{Mô tả nghiệp vụ} & \textbf{Tiêu chí chấp nhận (Acceptance Criteria)} \\ \hline
\textbf{FR-12} & Hiển thị Hero Banner \& Tìm kiếm & Could & Hiển thị Hero Banner thương hiệu, lọc danh mục và tìm kiếm nhanh đồ uống trên trang chủ. & Hero Banner dẫn trực tiếp xuống \texttt{\#menu}; lọc theo danh mục và tìm theo tên/danh mục từ thanh tìm kiếm. \\ \hline
\textbf{FR-13} & Giới hạn thanh toán phi tiền mặt & Must & Chỉ chấp nhận hình thức thanh toán không tiền mặt. & Hệ thống từ chối tiền mặt (CASH); DTO chỉ nhận WALLET/CARD, giao diện Checkout hỗ trợ VietQR/MoMo. \\ \hline
\end{tabularx}
\end{table}

\subsubsection{Danh sách Yêu cầu Phi Chức năng (Non-Functional Requirements -- NFR)}

\begin{table}[H]
\centering
\small
\begin{tabularx}{\linewidth}{|c|p{3.2cm}|p{4.5cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Mã NFR} & \textbf{Tên yêu cầu} & \textbf{Tiêu chí kiểm chứng kỹ thuật} & \textbf{Giải pháp hiện thực hóa} \\ \hline
\textbf{NFR-01} & \textbf{Hiệu năng (Performance)} & Thời gian phản hồi API $<$ 500ms đối với 95\% request; Tải trang PWA lần đầu $<$ 1.5s; Phục vụ ổn định 100 người dùng đồng thời. & NestJS Modular Monolith in-memory, Next.js Server Components, Tailwind CSS nhẹ, CDN Vercel Edge. \\ \hline
\textbf{NFR-02} & \textbf{Tính toàn vẹn (Data Integrity)} & Dữ liệu không bị phân mảnh; Không xảy ra bán âm tồn kho khi nhiều khách đặt cùng lúc; Giao dịch đạt chuẩn ACID. & PostgreSQL 16, Prisma ORM \texttt{\$transaction}, Khóa lạc quan \texttt{Product.version}. \\ \hline
\textbf{NFR-03} & \textbf{Bảo mật (Security)} & Mật khẩu người dùng được băm an toàn; Token xác thực hết hạn sau thời gian định sẵn; Chống brute-force và replay attack thanh toán. & Thuật toán bcrypt 10 rounds, JWT qua Passport Guard, \texttt{ThrottlerGuard} (5 req/phút), \texttt{CORS\_ORIGIN} whitelist, chữ ký Webhook/IPN và \texttt{idempotencyKey}. \\ \hline
\textbf{NFR-04} & \textbf{Khả dụng (Usability)} & Giao diện tối ưu theo chuẩn Mobile-First Responsive; Cung cấp đủ 3 trạng thái phản hồi trực quan. & Next.js Skeleton Components, Toast Alert, thiết kế thân thiện một tay trên màn hình cảm ứng di động. \\ \hline
\textbf{NFR-05} & \textbf{Khả năng triển khai (Deployability)} & Hệ thống tự động đóng gói qua CI/CD; Có thể tái tạo môi trường local bằng 1 lệnh duy nhất; Có endpoint kiểm tra sức khỏe. & Tệp \texttt{docker-compose.yml}, GitHub Actions CI/CD Pipeline, Endpoint \texttt{GET /health} đạt chuẩn. \\ \hline
\textbf{NFR-06} & \textbf{Khả năng bảo trì (Maintainability)} & Mã nguồn sạch, kiểu dữ liệu tĩnh nghiêm ngặt; Lịch sử commit theo chuẩn thống nhất; Truy vết yêu cầu 100\%. & TypeScript Strict Mode cho cả 2 phân hệ, Conventional Commits, Ma trận truy vết RTM chi tiết. \\ \hline
\end{tabularx}
\caption{Danh sách Yêu cầu Phi Chức năng (Non-Functional Requirements -- NFR)}
\end{table}

\subsubsection{Sơ đồ Use-Case Tổng Quát Toàn Hệ Thống}
Hệ thống phân định rõ ranh giới nghiệp vụ giữa 4 Actor chính: Khách hàng (Customer), Nhân viên pha chế (Barista), Quản lý cửa hàng (Store Manager / Admin) và Cổng thanh toán (Payment Service).

\clearpage
% ==========================================
% TRANG 9: HÌNH 1, BẢNG 5 & 1.3 INTRO
% ==========================================
\begin{figure}[H]
    \centering
    \includegraphics[width=0.88\linewidth]{report_images/usecase-general.png}
    \caption{Sơ đồ Use-Case tổng quát hệ thống BrewLite (\texttt{docs/diagrams/usecase-general.puml / .svg})}
\end{figure}

\begin{table}[H]
\centering
\small
\begin{tabularx}{\linewidth}{|p{3cm}|p{2.2cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Actor} & \textbf{Loại tác nhân} & \textbf{Danh sách các Use-Case tương tác chính} \\ \hline
\textbf{Khách hàng} \newline (Customer) & Con người \newline (Chính) & Xem thực đơn, Tùy chỉnh size/topping, Quản lý giỏ hàng, Đăng ký/Đăng nhập, Tạo đơn hàng, Thanh toán trực tuyến, Xem lịch sử đơn hàng \& tích điểm. \\ \hline
\textbf{Nhân viên pha chế} \newline (Barista) & Con người \newline (Phụ) & Đăng nhập hệ thống quầy, Xem hàng đợi pha chế thời gian thực, Tiếp nhận đơn (PREPARING), Báo pha chế xong (READY), Bàn giao đồ uống (COMPLETED). \\ \hline
\textbf{Quản lý cửa hàng} \newline (Store Manager) & Con người (Phụ \newline / Admin) & Đăng nhập trang quản trị \texttt{/admin}, Bật/tắt món \& topping, CRUD sản phẩm/danh mục, Xem danh sách đơn hàng và quản lý người dùng. \\ \hline
\textbf{Cổng thanh toán} \newline (PayOS / MoMo \& Mock) & Hệ thống (Bên ngoài) & Sinh mã VietQR/MoMo, Xác thực giao dịch qua Webhook/IPN và hỗ trợ kiểm thử tự động với \texttt{idempotencyKey}. \\ \hline
\end{tabularx}
\caption{Bảng phân tích Actor và ánh xạ tương tác Use-Case}
\end{table}

\subsection{Task 1.3 -- Đặc Tả Chi Tiết Use-Case Trọng Tâm: Đặt và Thanh Toán Đơn Hàng}

Tài liệu tham chiếu bắt buộc: \texttt{docs/requirements/usecase-checkout.md}.

Theo khuyến nghị từ đề bài mục 3.3, nhóm lựa chọn use-case có giá trị nghiệp vụ cốt lõi nhất: \textbf{Đặt và thanh toán đơn hàng (UC-01)}.

\clearpage
% ==========================================
% TRANG 10: HÌNH 2, BẢNG 6 & 1.3.3 STEP 1
% ==========================================
\subsubsection{Sơ đồ Use-Case Phân Rã Chi Tiết}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.82\linewidth]{report_images/usecase-checkout.png}
    \caption{Sơ đồ Use-Case Đặt và thanh toán đơn hàng (\texttt{docs/diagrams/usecase-checkout.puml / .svg})}
\end{figure}

\subsubsection{Bảng đặc tả chi tiết Use-Case Trọng tâm (UC-01)}

\begin{table}[H]
\centering
\small
\begin{tabularx}{\linewidth}{|p{3cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Thuộc tính} & \textbf{Chi tiết đặc tả nghiệp vụ} \\ \hline
\textbf{Tên Use-Case} & \textbf{UC-01: Đặt và thanh toán đơn hàng trực tuyến} \\ \hline
\textbf{Mã định danh} & UC-01 (Bao gồm UC-02, UC-03, UC-04, UC-05, UC-06, UC-07, UC-08) \\ \hline
\textbf{Tác nhân (Actors)} & Tác nhân chính: Khách hàng (Customer); Tác nhân phụ: Cổng thanh toán (PayOS / MoMo Sandbox \& Mock Test). \\ \hline
\textbf{Mô tả tóm tắt} & Khách hàng tiến hành gửi giỏ hàng đã chọn lên máy chủ để tạo đơn hàng, hệ thống khóa giữ tồn kho nguyên liệu, tính toán chiết khấu thành viên và thực hiện thanh toán không tiền mặt an toàn. \\ \hline
\textbf{Điểm kích hoạt (Trigger)} & Khách hàng nhấn nút ``Thanh toán'' tại giỏ hàng (\texttt{/cart}) để tạo đơn giữ kho và ``Thanh toán ngay'' tại trang \texttt{/checkout}. \\ \hline
\textbf{Tiền điều kiện} & 1. Khách hàng đã đăng nhập tài khoản hợp lệ (sở hữu Bearer JWT token còn hạn). \newline 2. Giỏ hàng có ít nhất một món đồ uống hợp lệ với số lượng $\ge$ 1. \\ \hline
\textbf{Hậu điều kiện \newline (Thành công)} & 1. Đơn hàng được ghi nhận vào PostgreSQL với trạng thái \texttt{PAID}. \newline 2. Tồn kho nguyên liệu bị khấu trừ chính xác. \newline 3. Giao dịch Payment được lưu vết kèm \texttt{idempotencyKey}. \newline 4. Điểm thưởng \texttt{loyaltyPoints} được cộng dồn vào tài khoản khách hàng. \newline 5. Giỏ hàng tại Client được dọn sạch và chuyển sang trang xác nhận thành công. \\ \hline
\textbf{Hậu điều kiện \newline (Thất bại)} & 1. Đơn hàng chuyển sang \texttt{PAYMENT\_FAILED} hoặc \texttt{CANCELLED}. \newline 2. Khi hủy đơn hoặc quá hạn giữ chỗ, số lượng tồn kho nguyên liệu được hoàn trả nguyên trạng (Stock Rollback). \newline 3. Giỏ hàng của khách hàng được bảo lưu/hoàn trả về \texttt{/cart} để có thể đặt và thanh toán lại an toàn. \\ \hline
\textbf{Yêu cầu liên kết} & FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-07, FR-11, NFR-01, NFR-02, NFR-03. \\ \hline
\end{tabularx}
\caption{Bảng đặc tả Use-Case trọng tâm UC-01}
\end{table}

\subsubsection{Kịch bản thực thi chi tiết (Flow of Events)}

\noindent\textbf{1. Luồng sự kiện chính (Main Flow / Happy Path):}
\begin{enumerate}[leftmargin=*]
    \item Khách hàng mở trang Giỏ hàng (\texttt{/cart}), kiểm tra danh sách món, kích cỡ (S/M/L), topping, có thể nhập mã voucher và xem mức chiết khấu thành viên (0\%, 5\%, 10\% hoặc 15\%) theo \texttt{loyaltyPoints}.
\end{enumerate}

\clearpage
% ==========================================
% TRANG 11: 1.3.3 STEP 2 ĐẾN HẾT E3
% ==========================================
\begin{enumerate}[leftmargin=*,resume]
    \item Khách hàng nhấn nút \textbf{“Thanh toán”} trên \texttt{/cart}. Nếu chưa đăng nhập, giao diện chuyển hướng sang \texttt{/login?redirect=/cart}. Nếu đã có JWT hợp lệ, Next.js gửi \texttt{POST /api/orders} kèm danh sách món và \texttt{voucherCode} (nếu có).
    \item Backend NestJS mở một Prisma \texttt{\$transaction}:
    \begin{itemize}[noitemsep]
        \item Xác thực phiên đăng nhập người dùng qua \texttt{JwtAuthGuard}.
        \item Tính lại toàn bộ đơn giá từ DB (không tin giá từ client) và tự động dọn đơn PENDING quá hạn của user ($>$5 phút) cũng như hệ thống ($>$6 phút).
        \item Kiểm tra và trừ tồn kho nguyên liệu cần thiết cho từng ly nước theo công thức (\texttt{ProductRecipeItem} $\rightarrow$ \texttt{Ingredient.stock}).
        \item Kiểm tra và tăng trường version của sản phẩm (\texttt{updateMany} -- Optimistic Concurrency Control) và tạo đơn hàng mới ở trạng thái \texttt{PENDING}.
    \end{itemize}
    \item Next.js lưu snapshot giữ chỗ 5 phút vào \texttt{cartStore} và chuyển khách hàng sang trang Thanh toán (\texttt{/checkout}).
    \item Khách hàng chọn phương thức thanh toán (\textbf{VietQR Pro} qua PayOS hoặc \textbf{Ví MoMo}) và nhấn \textbf{“Thanh toán ngay”}:
    \begin{itemize}[noitemsep]
        \item Với VIETQR / MOMO: Client gọi \texttt{POST /api/payments/create-payos-link} hoặc \texttt{POST /api/payments/momo-payment}; khi khách quét mã thanh toán, Backend xác thực chữ ký Webhook/IPN (hoặc \texttt{POST /api/payments/payos-verify}) rồi thực thi \texttt{markOrderAsPaid()}.
        \item Với đơn hàng 0đ (hoặc kịch bản kiểm thử tự động \texttt{NODE\_ENV=test}): Client sinh UUID v4 làm \texttt{idempotencyKey} và gọi \texttt{POST /api/payments}.
    \end{itemize}
    \item Trong transaction nguyên tử, Backend ghi nhận bản ghi Payment, cập nhật trạng thái đơn sang \texttt{PAID}, cộng điểm thưởng (1 điểm / 10.000 VNĐ) vào User và LoyaltyTransaction.
    \item Giao diện Next.js xóa sạch giỏ hàng trong Zustand store và chuyển hướng khách hàng sang trang Xác nhận đơn hàng (\texttt{/orders/:id}).
\end{enumerate}

\noindent\textbf{2. Các luồng sự kiện thay thế (Alternative Flows):}
\begin{itemize}[leftmargin=*]
    \item \textbf{A1 -- Áp dụng mã Voucher khuyến mãi bổ sung:} Tại bước 1 trên \texttt{/cart}, khách hàng nhập mã ưu đãi (ví dụ: WELCOME10, GIAM20K, VIPGOLD). Backend kiểm tra tính hợp lệ qua \texttt{GET /api/orders/voucher/:code} và bảng Promotion (còn hạn, đạt giá trị đơn tối thiểu), áp dụng giảm giá trên tổng tiền khi tạo đơn.
    \item \textbf{A2 -- Khách hàng thay đổi phương thức thanh toán hoặc quay lại giỏ hàng:} Tại bước 5 trên \texttt{/checkout}, khách hàng có thể chuyển đổi giữa VietQR Pro và Ví MoMo, hoặc bấm quay lại giỏ hàng (\texttt{PATCH /api/orders/:id/cancel}) để hoàn trả tồn kho giữ chỗ và đưa món về giỏ hàng.
\end{itemize}

\noindent\textbf{3. Các luồng sự kiện ngoại lệ (Exception Flows):}
\begin{itemize}[leftmargin=*]
    \item \textbf{E1 -- Hết nguyên liệu tồn kho hoặc xung đột phiên bản (Race Condition):} Tại bước 3, nếu nguyên liệu pha chế không đủ (HTTP 400 Bad Request) hoặc phiên bản \texttt{Product.version} bị lệch do khách hàng khác vừa đặt trước (HTTP 409 Conflict sau tối đa 3 lần retry), Backend lập tức hủy bỏ transaction (ROLLBACK) và không lưu đơn dở dang.
    \item \textbf{E2 -- Hết hạn phiên đăng nhập (JWT Expired):} Tại bước 2, nếu token JWT hết hạn, Backend từ chối với mã HTTP 401 Unauthorized. Giao diện giữ giỏ hàng trong localStorage và chuyển hướng khách sang trang Đăng nhập (\texttt{/login}).
    \item \textbf{E3 -- Thanh toán thất bại, hết hạn 5 phút hoặc người dùng hủy giao dịch:} Nếu hết thời gian giữ chỗ 5 phút trên \texttt{/checkout} hoặc khách hủy trên PayOS/checkout, Frontend gọi \texttt{PATCH /api/orders/:id/cancel} (đưa đơn về \texttt{CANCELLED} và hoàn trả tồn kho \texttt{Ingredient.stock}) đồng thời khôi phục các món về giỏ hàng. Nếu đơn được đánh dấu \texttt{PAYMENT\_FAILED}, khách có thể thử lại (\texttt{PATCH /api/orders/:id/retry}) hoặc hủy để hoàn kho.
    \item \textbf{E4 -- Khách hàng nhấn thanh toán nhiều lần hoặc gửi lại request (Idempotency Hit):} Nếu Client gửi lại request \texttt{POST /api/payments} cùng \texttt{idempotencyKey}, Backend kiểm tra khóa duy
\end{itemize}

\clearpage
% ==========================================
% TRANG 12: E4 TIẾP THEO
% ==========================================
\noindent nhất trong bảng Payment, phát hiện key đã tồn tại và lập tức trả về kết quả giao dịch trước đó (\texttt{idempotent: true}) mà không trừ tiền hay cộng điểm lần 2. Tương tự, \texttt{markOrderAsPaid()} sử dụng điều kiện nguyên tử \texttt{updateMany} kiểm tra trạng thái để tránh ghi trùng khi Webhook và Verify gọi đồng thời.

\clearpage
% ==========================================
% TRANG 13: TASK 2 INTRO
% ==========================================
\section{TASK 2: MÔ HÌNH HÓA HỆ THỐNG}

\subsection{Task 2.1 -- Sơ Đồ Hoạt Động (Activity Diagram)}

Tài liệu tham chiếu bắt buộc: \texttt{docs/diagrams/activity/activity-diagram.md} và sơ đồ nguồn \texttt{docs/diagrams/activity/activity-order-flow.puml}.

Sơ đồ hoạt động mô hình hóa luồng nghiệp vụ end-to-end từ lúc khách hàng duyệt món trên thực đơn cho đến khi hoàn tất đơn hàng và nhận đồ uống tại quầy. Để đảm bảo kích thước lớn, rõ nét và dễ đọc khi in ấn, sơ đồ được tách làm bốn phân đoạn logic liền mạch:
\begin{itemize}[leftmargin=*]
    \item \textbf{Phần A (Hình 3):} Duyệt menu, kiểm tra tình trạng món, tùy biến Size/Topping và cập nhật giỏ hàng cục bộ.
    \item \textbf{Phần B (Hình 4):} Kiểm tra phiên đăng nhập JWT và khởi tạo đơn hàng trong Database Transaction (kèm Optimistic Locking).
    \item \textbf{Phần C (Hình 5):} Chọn phương thức thanh toán, kiểm tra Idempotency Key và xử lý nhánh thanh toán thất bại / hủy đơn hoàn kho.
    \item \textbf{Phần D (Hình 6):} Xử lý nhánh thanh toán thành công (tích điểm thưởng) và quy trình điều phối pha chế trên Barista KDS đến khi hoàn tất đơn.
\end{itemize}

\clearpage
% ==========================================
% TRANG 14: HÌNH 3 (PHẦN A)
% ==========================================
\begin{figure}[p]
    \centering
    \includegraphics[width=0.98\linewidth,height=0.90\textheight,keepaspectratio]{report_images/activity-part-a.png}
    \caption{Sơ đồ Hoạt động -- Phần A: Duyệt menu, Tùy biến món \& Giỏ hàng (trích từ \texttt{docs/diagrams/activity/activity-order-flow.puml})}
\end{figure}

\clearpage
% ==========================================
% TRANG 15: HÌNH 4 (PHẦN B)
% ==========================================
\begin{figure}[p]
    \centering
    \includegraphics[width=0.98\linewidth,height=0.90\textheight,keepaspectratio]{report_images/activity-part-b.png}
    \caption{Sơ đồ Hoạt động -- Phần B: Xác thực JWT \& Tạo đơn hàng Transaction (trích từ \texttt{docs/diagrams/activity/activity-order-flow.puml})}
\end{figure}

\clearpage
% ==========================================
% TRANG 16: HÌNH 5 (PHẦN C)
% ==========================================
\begin{figure}[p]
    \centering
    \includegraphics[width=0.98\linewidth,height=0.90\textheight,keepaspectratio]{report_images/activity-part-c.png}
    \caption{Sơ đồ Hoạt động -- Phần C: Thanh toán, Idempotency \& Xử lý lỗi/hủy đơn (trích từ \texttt{docs/diagrams/activity/activity-order-flow.puml})}
\end{figure}

\clearpage
% ==========================================
% TRANG 17: 2.1.1 & 2.1.2
% ==========================================
\subsubsection{Đặc tả 5 phân làn trách nhiệm (Swimlanes)}
\begin{enumerate}[leftmargin=*]
    \item \textbf{Khách hàng (Customer):} Tác nhân khởi phát các hành vi duyệt menu, chọn size (S/M/L), chọn toppings, thêm vào giỏ, nhập thông tin đăng nhập (nếu chưa có phiên làm việc), chọn phương thức thanh toán và quét mã QR / xác nhận ví.
    \item \textbf{Giao diện Web (Next.js UI):} Render giao diện người dùng, duy trì trạng thái giỏ hàng toàn cục qua Zustand store, lưu trữ dữ liệu bền vững trên \texttt{localStorage}, sinh mã ngẫu nhiên UUID cho \texttt{idempotencyKey}, và hiển thị phản hồi trạng thái tương ứng.
    \item \textbf{Máy chủ Ứng dụng (NestJS API):} Tiếp nhận các yêu cầu HTTP RESTful, kiểm tra tính hợp lệ của DTO qua \texttt{ValidationPipe}, xác thực mã Bearer JWT qua \texttt{JwtAuthGuard}, tính toán chiết khấu hạng thành viên và điều phối giao dịch nghiệp vụ.
    \item \textbf{Cơ sở dữ liệu (PostgreSQL Database):} Thực thi các truy vấn trong một Transaction tuần tự đạt chuẩn ACID, kiểm tra khóa lạc quan (Optimistic Locking) trên trường \texttt{version} của sản phẩm, khấu trừ số lượng tồn kho nguyên vật liệu (\texttt{Ingredient.stock}) và lưu vết lịch sử giao dịch.
    \item \textbf{Cổng thanh toán mô phỏng (Payment Service):} Kiểm tra và đối soát tính duy nhất của \texttt{idempotencyKey}, thực hiện khấu trừ số dư mô phỏng của ví điện tử hoặc thẻ ngân hàng và phản hồi kết quả giao dịch.
\end{enumerate}

\subsubsection{Các điểm rẽ nhánh (Decision / Merge Nodes) \& Xử lý kịch bản ngoại lệ}
\begin{itemize}[leftmargin=*]
    \item \textbf{Nhánh kiểm tra đăng nhập:} Khi khách hàng nhấn thanh toán, nếu hệ thống phát hiện chưa có Bearer Token JWT, luồng xử lý rẽ sang nhánh yêu cầu đăng nhập. Giỏ hàng được lưu tạm vào bộ nhớ trình duyệt để không làm gián đoạn trải nghiệm của người dùng.
    \item \textbf{Nhánh kiểm tra tồn kho nguyên liệu:} Khi tạo đơn, Backend tính toán định mức tiêu hao nguyên vật liệu theo kích cỡ ly. Nếu phát hiện nguyên liệu bị thiếu hụt, hệ thống rẽ sang nhánh thất bại, rollback transaction và thông báo lỗi rõ ràng cho người dùng.
    \item \textbf{Nhánh xử lý thanh toán \& Hoàn trả kho (Rollback):}
    \begin{itemize}[noitemsep]
        \item \textit{Thanh toán thành công:} Đơn hàng chuyển sang \texttt{PAID}, hệ thống kích hoạt tự động cộng điểm thưởng \texttt{loyaltyPoints} theo tỷ lệ 1 điểm / 10.000 VNĐ, xóa sạch giỏ hàng và chuyển sang trang hoàn tất.
        \item \textit{Thanh toán thất bại / Hủy đơn:} Khi khách hủy đơn hoặc hết hạn giữ chỗ 5--6 phút, đơn chuyển sang \texttt{CANCELLED} và hoàn trả nguyên liệu; nếu đơn được đánh dấu \texttt{PAYMENT\_FAILED}, khách có thể thử lại hoặc hủy để hoàn trả tồn kho.
    \end{itemize}
\end{itemize}

\clearpage
% ==========================================
% TRANG 18: HÌNH 6 (PHẦN D)
% ==========================================
\begin{figure}[p]
    \centering
    \includegraphics[width=0.98\linewidth,height=0.90\textheight,keepaspectratio]{report_images/activity-part-d.png}
    \caption{Sơ đồ Hoạt động -- Phần D: Thanh toán thành công, Barista KDS \& Hoàn tất đơn (trích từ \texttt{docs/diagrams/activity/activity-order-flow.puml})}
\end{figure}

\clearpage
% ==========================================
% TRANG 19: 2.2 SEQUENCE DIAGRAM INTRO & ANALYSIS
% ==========================================
\subsection{Task 2.2 -- Sơ Đồ Tuần Tự (Sequence Diagram)}

Tài liệu tham chiếu bắt buộc: \texttt{docs/requirements/sequence-checkout.md} và sơ đồ nguồn \texttt{docs/diagrams/sequence-checkout.puml}.

Sơ đồ tuần tự mô tả chi tiết quy trình giao tiếp thời gian thực cho use-case trọng tâm ``Đặt và thanh toán đơn hàng'' với đủ 5 Lifelines theo đúng chuẩn OMG UML 2.0 (được tách thành 2 phần để giữ chữ rõ nét khi in ấn):
\begin{center}
\textbf{Customer $\longrightarrow$ Next.js UI $\longrightarrow$ NestJS API $\longrightarrow$ Database $\longrightarrow$ Payment Service}
\end{center}

\subsubsection{Phân tích các giai đoạn tương tác tuần tự}
\begin{enumerate}[leftmargin=*]
    \item \textbf{Giai đoạn 1 -- Khởi tạo phiên \& Xác thực JWT:}
    \begin{itemize}[noitemsep]
        \item Client gửi HTTP Request: \texttt{POST /api/orders} kèm header \texttt{Authorization: Bearer <JWT>} và payload chứa danh sách món trong giỏ hàng.
        \item \texttt{JwtAuthGuard} tại Backend giải mã chữ ký token bằng \texttt{JWT\_SECRET}. Nếu token không hợp lệ hoặc hết hạn, trả về ngay HTTP 401 Unauthorized.
    \end{itemize}
    \item \textbf{Giai đoạn 2 -- Mở Database Transaction \& Khóa tồn kho nguyên liệu:}
    \begin{itemize}[noitemsep]
        \item Backend mở khối giao dịch \texttt{prisma.\$transaction(async (tx) => \{...\})}.
        \item Truy vấn danh mục định mức nguyên liệu (\texttt{ProductRecipeItem}) của từng sản phẩm theo kích cỡ được chọn.
        \item Khấu trừ nguyên liệu bằng \texttt{tx.ingredient.updateMany} với điều kiện \texttt{stock >= needed} (bảng Product không lưu cột stock tĩnh).
        \item Kiểm tra và tăng trường version của sản phẩm bằng \texttt{tx.product.updateMany(\{ where: \{ id, version \} \})} để chống hiện tượng Race Condition (Optimistic Locking, tối đa 3 lần retry).
        \item Khởi tạo bản ghi \texttt{Order} ở trạng thái ban đầu là \texttt{PENDING} kèm danh sách chi tiết các dòng món \texttt{OrderItem} và toppings đính kèm.
        \item Phản hồi mã HTTP 201 Created kèm thông tin đơn hàng vừa khởi tạo về cho Next.js UI.
    \end{itemize}
    \item \textbf{Giai đoạn 3 -- Xử lý giao dịch thanh toán \& Cơ chế Idempotency Key:}
    \begin{itemize}[noitemsep]
        \item Trên UI Checkout (\texttt{/checkout}), Client gọi \texttt{POST /api/payments/create-payos-link} (VietQR) hoặc \texttt{POST /api/payments/momo-payment} (MoMo). Riêng với đơn 0đ hoặc kịch bản kiểm thử tự động, Client gửi \texttt{POST /api/payments} kèm \texttt{orderId}, số tiền, phương thức (\texttt{WALLET / CARD}) và chuỗi định danh duy nhất \texttt{idempotencyKey} (UUID v4).
        \item Backend kiểm tra sự tồn tại của \texttt{idempotencyKey} trong bảng Payment:
        \begin{itemize}
            \item \textit{Nhánh xử lý lặp (Idempotent Hit):} Nếu key đã được xử lý trước đó, hệ thống lập tức hoàn trả dữ liệu phản hồi đã lưu (\texttt{idempotent: true}), không thực hiện trừ tiền lại hay thay đổi trạng thái đơn hàng.
            \item \textit{Nhánh xử lý mới (New Request):} Backend xác nhận qua cổng thanh toán (PayOS/MoMo Webhook/IPN hoặc mock trong môi trường test).
        \end{itemize}
    \end{itemize}
    \item \textbf{Giai đoạn 4 -- Phân nhánh kết quả thanh toán (Nhánh Alt):}
    \begin{itemize}[noitemsep]
        \item \textbf{[Thanh toán Thành công]:} Khi thanh toán được xác nhận, Backend mở transaction cập nhật trạng thái đơn hàng sang \texttt{PAID} (bảo vệ chống trùng bằng \texttt{updateMany} kiểm tra PENDING/PAYMENT\_FAILED), tạo bản ghi giao dịch trong bảng Payment, cộng điểm thưởng và ghi nhận vào bảng LoyaltyTransaction. Giao diện Client dọn sạch giỏ hàng và chuyển sang trang \texttt{/orders/:id}.
        \item \textbf{[Hủy đơn / Hết hạn hoặc Thanh toán Thất bại]:} Khi khách hủy hoặc hết hạn 5 phút (\texttt{PATCH /api/orders/:id/cancel}), Backend chuyển đơn sang \texttt{CANCELLED} và hoàn trả số lượng \texttt{Ingredient.stock} đã trừ; nếu đánh dấu \texttt{PAYMENT\_FAILED}, đơn chờ khách thử lại (\texttt{/retry}) hoặc hủy để hoàn kho.
    \end{itemize}
\end{enumerate}

\clearpage
% ==========================================
% TRANG 20: HÌNH 7 (SEQUENCE PHẦN 1)
% ==========================================
\begin{figure}[p]
    \centering
    \includegraphics[width=0.98\linewidth,height=0.90\textheight,keepaspectratio]{report_images/sequence-part-1.png}
    \caption{Sơ đồ Tuần tự -- Phần 1: Kiểm tra JWT \& Tạo đơn hàng Transaction (\texttt{docs/diagrams/sequence-checkout.puml / .svg})}
\end{figure}

\clearpage
% ==========================================
% TRANG 21: HÌNH 8 (SEQUENCE PHẦN 2)
% ==========================================
\begin{figure}[p]
    \centering
    \includegraphics[width=0.98\linewidth,height=0.90\textheight,keepaspectratio]{report_images/sequence-part-2.png}
    \caption{Sơ đồ Tuần tự -- Phần 2: Thanh toán, Idempotency \& Hoàn tất/Lỗi (\texttt{docs/diagrams/sequence-checkout.puml / .svg})}
\end{figure}

\clearpage
% ==========================================
% TRANG 22: HÌNH 9 & 2.3.1 ENTITY 1
% ==========================================
\subsection{Task 2.3 -- Sơ Đồ Lớp Miền Nghiệp Vụ (Domain Class Diagram)}

Tài liệu tham chiếu bắt buộc: \texttt{docs/diagrams/class-diagram.md} và tệp nguồn \texttt{docs/diagrams/class-diagram.puml}.

Sơ đồ lớp miền nghiệp vụ phản ánh đầy đủ mô hình dữ liệu lõi của hệ thống BrewLite, bao gồm các thực thể miền, kiểu dữ liệu, quan hệ kết tập/kết hợp, multiplicity và các phương thức nghiệp vụ tương ứng:

\begin{figure}[H]
    \centering
    \includegraphics[width=0.98\linewidth]{report_images/class-diagram.png}
    \caption{Sơ đồ Lớp miền nghiệp vụ BrewLite (\texttt{docs/diagrams/class-diagram.puml / .svg})}
\end{figure}

\subsubsection{Đặc tả 12 Lớp Miền Nghiệp Vụ Cốt Lõi (Domain Entities)}
\begin{enumerate}[leftmargin=*]
    \item \textbf{User:} Quản lý thông tin tài khoản người dùng trong hệ thống.
    \begin{itemize}[noitemsep]
        \item \textit{Thuộc tính:} \texttt{id: BigInt [PK]}, \texttt{fullName: String?}, \texttt{email: String [UK]}, \texttt{phone: String?}
    \end{itemize}
\end{enumerate}

\clearpage
% ==========================================
% TRANG 23: ENTITIES 1 (TIẾP) ĐẾN 10
% ==========================================
\noindent\texttt{[UK]}, \texttt{passwordHash: String}, \texttt{loyaltyPoints: Int = 0}, \texttt{role: user\_role = customer}, \texttt{createdAt: DateTime}, \texttt{updatedAt: DateTime}.
\begin{itemize}[leftmargin=*,noitemsep]
    \item \textit{Phương thức / Dịch vụ (UsersService, AuthService):} xác thực mật khẩu bcrypt, \texttt{addLoyaltyPoints()}, quy đổi hạng thành viên.
\end{itemize}

\begin{enumerate}[leftmargin=*,resume]
    \item \textbf{Category:} Nhóm phân loại thực đơn đồ uống.
    \begin{itemize}[noitemsep]
        \item \textit{Thuộc tính:} \texttt{id: Int [PK]}, \texttt{name: String [UK]}, \texttt{createdAt: DateTime}, \texttt{updatedAt: DateTime}.
    \end{itemize}
    \item \textbf{Product:} Món đồ uống được bày bán trên thực đơn (tồn kho thành phẩm tính động từ công thức nguyên liệu).
    \begin{itemize}[noitemsep]
        \item \textit{Thuộc tính:} \texttt{id: BigInt [PK]}, \texttt{categoryId: Int? [FK]}, \texttt{name: String}, \texttt{price: Decimal(12,2)}, \texttt{imageUrl: String?}, \texttt{description: String?}, \texttt{version: Int = 0}, \texttt{status: ProductStatus = active}, \texttt{createdAt: DateTime}, \texttt{updatedAt: DateTime}.
        \item \textit{Phương thức / Dịch vụ (ProductsService):} \texttt{calculateStock(recipes, targetSize)}, \texttt{deductIngredients()}.
    \end{itemize}
    \item \textbf{Ingredient:} Kho lưu trữ nguyên vật liệu pha chế thực tế (hạt cà phê, sữa tươi, siro, ly giấy...).
    \begin{itemize}[noitemsep]
        \item \textit{Thuộc tính:} \texttt{id: Int [PK]}, \texttt{name: String}, \texttt{unit: String}, \texttt{stock: Int = 0}, \texttt{createdAt: DateTime}, \texttt{updatedAt: DateTime}.
        \item \textit{Nghiệp vụ:} kiểm tra và trừ/hoàn stock nguyên tử bên trong \texttt{prisma.\$transaction}.
    \end{itemize}
    \item \textbf{ProductRecipeItem:} Công thức pha chế / định mức tiêu hao nguyên liệu cho từng kích cỡ ly.
    \begin{itemize}[noitemsep]
        \item \textit{Thuộc tính:} \texttt{id: Int [PK]}, \texttt{productId: BigInt [FK]}, \texttt{size: product\_size}, \texttt{ingredientId: Int [FK]}, \texttt{amount: Int}, \texttt{unit: String}, \texttt{createdAt: DateTime}, \texttt{updatedAt: DateTime}.
    \end{itemize}
    \item \textbf{Topping:} Danh mục các món thêm vào ly đồ uống.
    \begin{itemize}[noitemsep]
        \item \textit{Thuộc tính:} \texttt{id: Int [PK]}, \texttt{name: String [UK]}, \texttt{price: Int}, \texttt{isAvailable: Boolean = true}, \texttt{createdAt: DateTime}.
    \end{itemize}
    \item \textbf{Order:} Đơn đặt hàng của khách hàng theo máy trạng thái FSM 7 bước.
    \begin{itemize}[noitemsep]
        \item \textit{Thuộc tính:} \texttt{id: BigInt [PK]}, \texttt{userId: BigInt [FK]}, \texttt{promotionId: BigInt? [FK]}, \texttt{status: order\_status = PENDING}, \texttt{subtotal: Decimal(12,2)}, \texttt{discountAmount: Decimal(12,2)}, \texttt{total: Decimal(12,2)}, \texttt{createdAt: DateTime}, \texttt{updatedAt: DateTime}.
        \item \textit{Phương thức / Dịch vụ (OrdersService):} \texttt{assertTransition()}, \texttt{validateVoucher()}, \texttt{cancelOrder()}.
    \end{itemize}
    \item \textbf{OrderItem:} Chi tiết từng ly đồ uống được gọi trong đơn hàng.
    \begin{itemize}[noitemsep]
        \item \textit{Thuộc tính:} \texttt{id: BigInt [PK]}, \texttt{orderId: BigInt [FK]}, \texttt{productId: BigInt [FK]}, \texttt{size: product\_size}, \texttt{qty: Int}, \texttt{unitPrice: Decimal(12,2)}, \texttt{lineTotal: Decimal(12,2)}.
    \end{itemize}
    \item \textbf{OrderItemTopping:} Bảng liên kết trung gian lưu vết toppings đính kèm ly nước.
    \begin{itemize}[noitemsep]
        \item \textit{Thuộc tính:} \texttt{orderItemId: BigInt [PK, FK]}, \texttt{toppingId: Int [PK, FK]}, \texttt{priceAtTime: Int}.
    \end{itemize}
    \item \textbf{Payment:} Giao dịch thanh toán không tiền mặt.
    \begin{itemize}[noitemsep]
        \item \textit{Thuộc tính:} \texttt{id: BigInt [PK]}, \texttt{orderId: BigInt [FK]}, \texttt{idempotencyKey: String [UK]}, \texttt{amount: Decimal(12,2)}, \texttt{method: payment\_method}, \texttt{status: payment\_status = SUCCESS}, \texttt{transactionRef: String?}, \texttt{createdAt: DateTime}.
    \end{itemize}
    \item \textbf{Promotion:} Chương trình khuyến mãi và mã voucher ưu đãi.
\end{enumerate}

\clearpage
% ==========================================
% TRANG 24: ENTITY 11-12, ENUMS, ĐỐI SOÁT & C4 LEVEL 1 (PART)
% ==========================================
\begin{itemize}[leftmargin=*]
    \item \textit{Thuộc tính:} \texttt{id: BigInt [PK]}, \texttt{code: String [UK]}, \texttt{description: String?}, \texttt{discountType: discount\_type}, \texttt{discountValue: Decimal(12,2)}, \texttt{minOrderValue: Decimal(12,2)}, \texttt{startDate: DateTime}, \texttt{endDate: DateTime}, \texttt{isActive: Boolean}, \texttt{createdAt: DateTime}, \texttt{updatedAt: DateTime}.
\end{itemize}

\begin{enumerate}[leftmargin=*,resume]
    \item \textbf{LoyaltyTransaction:} Nhật ký biến động điểm tích lũy của khách hàng thân thiết.
    \begin{itemize}[noitemsep]
        \item \textit{Thuộc tính:} \texttt{id: BigInt [PK]}, \texttt{userId: BigInt [FK]}, \texttt{orderId: BigInt? [FK]}, \texttt{points: Int}, \texttt{type: loyalty\_type}, \texttt{balanceAfter: Int}, \texttt{reason: String?}, \texttt{createdAt: DateTime}.
    \end{itemize}
\end{enumerate}

\subsubsection{Các kiểu Liệt kê Trạng thái (Domain Enumerations)}
\begin{itemize}[leftmargin=*,noitemsep]
    \item \texttt{order\_status:} PENDING, PAID, PREPARING, READY, COMPLETED, PAYMENT\_FAILED, CANCELLED.
    \item \texttt{payment\_status:} SUCCESS, FAILED.
    \item \texttt{payment\_method:} WALLET (Ví điện tử MoMo/VietQR), CARD (Thẻ ngân hàng mô phỏng).
    \item \texttt{user\_role:} customer, barista, admin.
    \item \texttt{product\_size:} S, M, L.
    \item \texttt{ProductStatus:} active, inactive.
    \item \texttt{discount\_type:} PERCENTAGE, FIXED\_AMOUNT, MEMBERSHIP\_TIER.
    \item \texttt{loyalty\_type:} EARN, REDEEM, ADJUST.
    \item \textbf{Ghi chú đơn vị nguyên liệu:} Cột \texttt{unit} của \texttt{Ingredient} và \texttt{ProductRecipeItem} dùng kiểu \texttt{String (VarChar(20))}, dữ liệu mẫu dùng \texttt{g}, \texttt{ml}, \texttt{cai}.
\end{itemize}

\subsubsection{Đối soát Tiêu chí Nghiệm thu của Task 2}
\begin{itemize}[leftmargin=*]
    \item \textbf{Tính nhất quán với Prisma Schema:} Sơ đồ lớp đồng bộ 100\% cả 12 bảng, 8 kiểu Enum, kiểu dữ liệu \texttt{BigInt} và các trường dữ liệu so với tệp \texttt{apps/api/prisma/schema.prisma}. Các bảng con gắn chặt vòng đời (OrderItem, OrderItemTopping, ProductRecipeItem, LoyaltyTransaction theo User) dùng \texttt{ON DELETE CASCADE}; các liên kết lịch sử giao dịch (Order.User, OrderItem.Product, Payment.Order, OrderItemTopping.Topping) dùng \texttt{NoAction} để tránh xóa mất dữ liệu đối soát.
    \item \textbf{Tính nhất quán với SRS và Sequence Diagram:} Đầy đủ các thực thể phục vụ cho chuỗi tương tác đặt hàng, khóa giữ kho nguyên liệu và kiểm soát giao dịch thanh toán idempotent.
\end{itemize}

\section{TASK 3: THIẾT KẾ KIẾN TRÚC}

\subsection{Task 3.1 -- Phương Pháp và Quyết Định Kiến Trúc (ADRs)}

Tài liệu tham chiếu bắt buộc: \texttt{docs/architecture/system-architecture.md} và thư mục \texttt{docs/architecture/adr/}.

\subsubsection{Mô hình C4 (The C4 Model for Software Architecture)}
Kiến trúc hệ thống BrewLite được phân rã theo chuẩn \textbf{C4 Model} nhằm thể hiện rõ ràng các tầng trừu tượng từ bức tranh tổng thể đến cấu trúc module chi tiết bên trong mã nguồn:

\noindent\textbf{1. C4 Level 1 -- System Context (Ngữ cảnh hệ thống):}
\begin{itemize}[leftmargin=*,noitemsep]
    \item \textbf{Khách hàng (Customer):} Tương tác trực tiếp với BrewLite qua trình duyệt điện thoại để xem menu, đặt đồ uống và thanh toán.
    \item \textbf{Nhân viên quầy (Barista):} Tương tác với BrewLite qua màn hình quầy bar (KDS) để nhận đơn và báo trạng thái pha chế.
    \item \textbf{Quản trị viên (Admin):} Tương tác qua trang quản trị (\texttt{/admin}) để quản lý sản phẩm, danh mục, topping, đơn hàng và người dùng.
\end{itemize}

\clearpage
% ==========================================
% TRANG 25: C4 LEVEL 1 (TIẾP), LEVEL 2, LEVEL 3 & TRADE-OFFS
% ==========================================
\begin{itemize}[leftmargin=*,noitemsep]
    \item \textbf{Hệ thống BrewLite:} Cung cấp toàn bộ dịch vụ cốt lõi quản lý menu, đơn hàng và tài khoản.
    \item \textbf{Payment Service (PayOS / MoMo \& Mock Test):} Hệ thống thanh toán VietQR/MoMo Sandbox và cổng mô phỏng cho kiểm thử tự động với cơ chế Idempotency Key.
\end{itemize}

\noindent\textbf{2. C4 Level 2 -- Container (Các khối chứa độc lập):}
\begin{itemize}[leftmargin=*,noitemsep]
    \item \textbf{Web Application (Frontend PWA):} Ứng dụng Next.js 16 (React 19, Tailwind CSS 4, Zustand) phục vụ giao diện người dùng tối ưu trên thiết bị di động, chạy tại cổng 3000.
    \item \textbf{API Application (Backend Service):} Ứng dụng NestJS 12 (TypeScript) cung cấp toàn bộ RESTful API, đóng gói trong Docker Container chạy tại cổng 3001.
    \item \textbf{Database (Cơ sở dữ liệu quan hệ):} PostgreSQL 16 đóng gói trong Docker Container chạy tại cổng 5432, gắn ổ đĩa lưu trữ bền vững (Persistent Storage).
\end{itemize}

\noindent\textbf{3. C4 Level 3 -- Component (Phân rã Backend NestJS):} Ứng dụng Backend được tổ chức theo kiến trúc \textbf{Modular Monolith} với các Module nghiệp vụ khép kín:
\begin{itemize}[leftmargin=*,noitemsep]
    \item \textbf{AuthModule:} Phụ trách xác thực người dùng, băm mật khẩu bcrypt, cấp phát/kiểm tra JWT qua \texttt{JwtAuthGuard}, phân quyền \texttt{RolesGuard} (\texttt{@StaffOnly}, \texttt{@AdminOnly}) và giới hạn tần suất (\texttt{ThrottlerGuard}).
    \item \textbf{CategoriesModule, ProductsModule \& ToppingsModule:} Phụ trách truy vấn thực đơn, danh mục, công thức nguyên liệu và CRUD quản trị (\texttt{@AdminOnly}).
    \item \textbf{OrdersModule:} Trọng tâm nghiệp vụ, quản lý máy trạng thái đơn hàng (FSM 7 bước), kiểm tra tồn kho nguyên liệu và thực thi khóa lạc quan.
    \item \textbf{PaymentsModule:} Quản lý thanh toán VietQR (PayOS SDK), MoMo Sandbox, xác thực Webhook/IPN và chống trùng lặp qua \texttt{idempotencyKey}.
    \item \textbf{UsersModule:} Quản lý thông tin tài khoản, tích lũy điểm thưởng, phân hạng thành viên và API quản trị người dùng (\texttt{/api/users}).
    \item \textbf{PrismaModule:} Dịch vụ dùng chung cung cấp kết nối cơ sở dữ liệu PostgreSQL an toàn kiểu (Type-safe).
\end{itemize}

\subsubsection{Phân tích lý do lựa chọn, ưu điểm, hạn chế và sự đánh đổi (Trade-offs)}
\begin{itemize}[leftmargin=*]
    \item \textbf{Lý do chọn Modular Monolith thay vì Microservices:} Hệ thống BrewLite phục vụ quy mô chuỗi cà phê vừa và nhỏ với lưu lượng hàng nghìn đơn mỗi ngày. Việc lựa chọn Modular Monolith giúp toàn bộ giao dịch đặt hàng, khóa giữ kho và thanh toán được thực thi trong một Database Transaction (ACID) duy nhất của PostgreSQL, loại bỏ hoàn toàn bài toán phân tán dữ liệu phức tạp (như Two-Phase Commit hay Saga Pattern) vốn dễ gây rủi ro sai lệch dữ liệu tài chính trong microservices.
    \item \textbf{Đánh đổi (Trade-offs):} Toàn bộ backend được triển khai trong cùng một tiến trình (Single Deployment Unit). Nếu một module gặp sự cố ngốn CPU, toàn bộ API có thể bị ảnh hưởng. Tuy nhiên, bù lại nhóm đạt được tốc độ phát triển cực nhanh, chi phí vận hành hạ tầng Cloud ở mức tối thiểu và độ tin cậy dữ liệu đạt 100\%.
\end{itemize}

\subsubsection{Danh mục 6 Quyết định Kiến trúc Quan trọng (ADR 001 -- ADR 006)}
Toàn bộ các quyết định kỹ thuật then chốt của dự án được ghi nhận chính thức thành các tài liệu Architecture Decision Record (ADR):

\clearpage
% ==========================================
% TRANG 26: BẢNG 7 (ADR 001 - 006)
% ==========================================
\begin{table}[H]
\centering
\small
\begin{tabularx}{\linewidth}{|c|p{2.8cm}|p{4.2cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Mã ADR} & \textbf{Tiêu đề quyết định} & \textbf{Quyết định kỹ thuật cốt lõi} & \textbf{Hệ quả và Lợi ích mang lại} \\ \hline
\textbf{ADR 001} & Cấu trúc mã nguồn Monorepo & Lưu trữ toàn bộ Frontend (\texttt{apps/web}), Backend (\texttt{apps/api}), Tài liệu (\texttt{docs}) trong 1 Git repo duy nhất. & Cho phép commit nguyên tử (Atomic Commit), đồng bộ hóa tài liệu và code, 1 lệnh docker compose chạy toàn bộ local. \\ \hline
\textbf{ADR 002} & Backend Modular Monolith với NestJS & Xây dựng backend dạng module khép kín dựa trên NestJS và TypeScript thay vì chia microservices. & Dễ bảo trì, tận dụng Dependency Injection, giữ trọn vẹn giao dịch ACID mà không tốn chi phí hạ tầng phân tán. \\ \hline
\textbf{ADR 003} & PostgreSQL 16 và Prisma ORM Migration & Quản lý cơ sở dữ liệu qua Prisma Schema, migration có phiên bản Git (\texttt{prisma migrate deploy}). & An toàn kiểu dữ liệu (Type-safety), hỗ trợ khóa lạc quan chống bán âm kho (\texttt{Product.version}), kiểm soát di trú schema tự động. \\ \hline
\textbf{ADR 004} & Cổng thanh toán PayOS/MoMo \& Idempotency Key & Tích hợp VietQR (PayOS), Ví MoMo Sandbox (xác thực Webhook/IPN), đồng thời khóa endpoint mock \texttt{POST /api/payments} trên Production (chỉ mở cho test tự động \& đơn 0đ) với \texttt{idempotencyKey}. & Ngăn chặn triệt để hiện tượng trừ tiền 2 lần khi retry/webhook trùng và đảm bảo an toàn tài chính trên Production. \\ \hline
\textbf{ADR 005} & Xác thực phi trạng thái bằng JWT & Sử dụng JSON Web Token (JWT) SHA-256 qua Passport Guard thay vì Session Cookie truyền thống. & Backend hoàn toàn Stateless, không tốn bộ nhớ server, tương thích tuyệt đối với ứng dụng di động Mobile/PWA. \\ \hline
\textbf{ADR 006} & Logging, Health Check \& Quản lý cấu hình & Quản lý cấu hình qua \texttt{.env.example}, cung cấp endpoint \texttt{GET /health}, ghi log cấu trúc chuẩn. & Chuẩn hóa theo tiêu chuẩn 12-Factor App, phục vụ tự động hóa kiểm tra sức khỏe và kích hoạt Rollback trong CI/CD. \\ \hline
\end{tabularx}
\caption{Danh mục 6 Quyết định Kiến trúc (Architecture Decision Records -- ADR)}
\end{table}

\clearpage
% ==========================================
% TRANG 27: 3.2 DEPLOYMENT DIAGRAM INTRO & BẢNG 8
% ==========================================
\subsection{Task 3.2 -- Sơ Đồ Triển Khai (Deployment Diagram)}

Tài liệu tham chiếu bắt buộc: \texttt{docs/deployment.md} và tệp nguồn \texttt{docs/diagrams/deployment-diagram.puml}.

Sơ đồ triển khai phản ánh kiến trúc hạ tầng Production thực tế mà nhóm đã triển khai trên Cloud, thể hiện rõ ràng \textbf{3 ranh giới môi trường (Environment Boundaries)}:

\subsubsection{Đặc tả chi tiết các tầng hạ tầng Production}
\begin{enumerate}[leftmargin=*]
    \item \textbf{Ranh giới Thiết bị Người dùng (Client Device Tier):}
    \begin{itemize}[noitemsep]
        \item Khách hàng và Barista truy cập hệ thống thông qua trình duyệt web di động hoặc PWA cài đặt trên thiết bị cá nhân (iOS, Android, Windows).
        \item Mã nguồn giao diện được tải qua giao thức bảo mật \textbf{HTTPS / TLS 1.3} (cổng 443).
    \end{itemize}
    \item \textbf{Ranh giới Nền tảng Vercel Cloud (Frontend CDN Hosting):}
    \begin{itemize}[noitemsep]
        \item Ứng dụng Next.js 16 (\texttt{apps/web}) được biên dịch và phân phối qua mạng lưới Edge Network toàn cầu của Vercel.
        \item Hỗ trợ Server-Side Rendering (SSR) và Client-Side Rendering (CSR), tự động cấp chứng chỉ bảo mật SSL/TLS.
        \item Cấu hình biến môi trường \texttt{NEXT\_PUBLIC\_API\_URL} trỏ an toàn về máy chủ Backend trên Render qua HTTPS.
    \end{itemize}
    \item \textbf{Ranh giới Nền tảng Render Cloud (Backend \& Database Runtime):}
    \begin{itemize}[noitemsep]
        \item \textbf{Render Ingress Proxy / Load Balancer:} Tiếp nhận kết nối HTTPS công khai tại cổng 443, thực hiện giải mã SSL (TLS Termination) và chuyển tiếp lưu lượng vào cổng nội bộ của container (PORT=3001 hoặc biến PORT do Render cấp).
        \item \textbf{Docker Container Backend API (\texttt{brewlite-api}):} Đóng gói dựa trên Dockerfile tối ưu đa tầng (Multi-stage build \textbf{Node 24 Alpine}), chạy ứng dụng NestJS lắng nghe trên \texttt{0.0.0.0:PORT} (mặc định 3001). Cung cấp endpoint \texttt{GET /health} để Render thực hiện liveness probe mỗi 30 giây.
        \item \textbf{Docker Container Database (\texttt{brewlite-postgres}):} Chạy phiên bản \textbf{postgres:16-alpine} tại cổng nội bộ 5432 nằm hoàn toàn trong mạng nội bộ (\textbf{Render Private Network VPC}). \textbf{Tuyệt đối không mở cổng 5432 ra ngoài Internet}, đảm bảo an toàn dữ liệu 100\%.
        \item \textbf{Render Persistent Disk Storage:} Gắn ổ đĩa cứng bền vững tại thư mục \texttt{/var/lib/postgresql/data}, đảm bảo toàn bộ dữ liệu đơn hàng và tài khoản không bị mất khi container khởi động lại.
    \end{itemize}
\end{enumerate}

\subsubsection{Giao thức mạng, Cổng kết nối và Quản lý Secret}

\begin{table}[H]
\centering
\small
\begin{tabularx}{\linewidth}{|p{3.2cm}|p{2.6cm}|c|c|Y|}
\hline
\rowcolor{tableheader}
\textbf{Điểm đầu (Source)} & \textbf{Điểm cuối (Dest)} & \textbf{Giao thức} & \textbf{Cổng} & \textbf{Mục đích \& Phạm vi kết nối} \\ \hline
Client Browser / PWA & Vercel Edge CDN & HTTPS (TLS 1.3) & 443 & Tải UI Next.js PWA, static assets (Public Internet). \\ \hline
Client Browser & Render Reverse Proxy & HTTPS (TLS 1.3) & 443 & Gọi REST API (\texttt{/api/products}, \texttt{/api/orders}, \texttt{/api/payments}) kèm JWT. \\ \hline
Render Reverse Proxy & Container \texttt{brewlite-api} & HTTP & 3001 & Chuyển tiếp request vào NestJS và ping định kỳ \texttt{GET /health}. \\ \hline
Container \texttt{brewlite-api} & Container \texttt{postgres} & TCP/IP Wire & 5432 & Truy vấn Prisma ORM trong mạng nội bộ riêng (Private VPC). \\ \hline
\end{tabularx}
\caption{Bảng đặc tả giao thức mạng và cổng kết nối hệ thống}
\end{table}

\clearpage
% ==========================================
% TRANG 28: HÌNH 10 (DEPLOYMENT DIAGRAM)
% ==========================================
\begin{figure}[p]
    \centering
    \includegraphics[width=0.98\linewidth,height=0.90\textheight,keepaspectratio]{report_images/deployment-diagram.png}
    \caption{Sơ đồ Triển khai môi trường Production BrewLite (\texttt{docs/diagrams/deployment-diagram.puml / .svg})}
\end{figure}

\clearpage
% ==========================================
% TRANG 29: QUẢN LÝ BIẾN MÔI TRƯỜNG & BÍ MẬT
% ==========================================
\noindent\textbf{Quản lý Biến môi trường \& Bí mật an toàn:}
\begin{itemize}[leftmargin=*]
    \item Tuyệt đối không lưu tệp \texttt{.env} chứa mật khẩu thật lên Git repository (\texttt{.env} được chặn qua \texttt{.gitignore}).
    \item Trên Vercel: Cấu hình biến công khai \texttt{NEXT\_PUBLIC\_API\_URL}.
    \item Trên Render: Cấu hình biến môi trường/bí mật gồm \texttt{DATABASE\_URL}, \texttt{JWT\_SECRET}, \texttt{PORT=3001}, \texttt{CORS\_ORIGIN}, \texttt{FRONTEND\_URL}, cùng các khóa cổng thanh toán \texttt{PAYOS\_*} và \texttt{MOMO\_*}.
    \item Trên GitHub Actions: Cấu hình secret \texttt{PRODUCTION\_API\_URL}, \texttt{RENDER\_DEPLOY\_HOOK} (và tùy chọn \texttt{RENDER\_API\_KEY}, \texttt{RENDER\_SERVICE\_ID}, \texttt{PRODUCTION\_WEB\_URL}) phục vụ tự động hóa kiểm thử, deploy và rollback.
\end{itemize}

\clearpage
% ==========================================
% TRANG 30: TASK 4 SPRINT 1, 4.1.1 & 4.1.2
% ==========================================
\section{TASK 4: TRIỂN KHAI SPRINT 1}

\noindent\textit{Sprint Goal: Tạo lập nền tảng kỹ thuật vững chắc, quản lý tài liệu có kiểm soát phiên bản và hiện thực một phiên bản MVP đầu tiên chạy được hoàn chỉnh cho luồng xem thực đơn đồ uống (Menu Browsing).}

\subsection{Task 4.1 -- Thiết Lập Repository và Quy Trình Làm Việc Nhóm}

Tài liệu tham chiếu bắt buộc: \texttt{docs/delivery/team-workflow.md}, \texttt{docs/delivery/conventions.md} và \texttt{README.md}.

\subsubsection{Cấu trúc Monorepo Chuẩn Hóa}
Dự án được khởi tạo và tổ chức theo mô hình Monorepo thống nhất tại kho lưu trữ Git:

\begin{lstlisting}
brewlite/
|-- apps/
|   |-- web/           # Frontend Next.js 16 (App Router, PWA, Tailwind CSS, Zustand)
|   `-- api/           # Backend NestJS 12 (Modular Monolith, Prisma ORM, PostgreSQL)
|-- docs/              # Toan bo tai lieu dac ta, kien truc, so do UML va minh chung
|   |-- requirements/  # Task 1 (Context & Scope, SRS, Use-case checkout)
|   |-- diagrams/      # Task 2 & 3 (Activity, Sequence, Class, C4, Deployment)
|   |-- architecture/adr/ # Task 3 (6 ban ghi quyet dinh kien truc ADR-001 -> ADR-006)
|   |-- delivery/      # Quy trinh nhom (team-workflow, conventions, ci-evidence...)
|   |-- demo/          # Video demo luong End-to-End (BrewLite-Live-Demo-Runbook.mp4)
|   |-- deployment.md  # Task 3.2 (Dac ta moi truong Cloud Render & Vercel)
|   `-- traceability-matrix.md # Muc 8 (Ma tran truy vet yeu cau toan he thong)
|-- tests/e2e/         # Kich ban kiem thu End-to-End (ordering-flow.e2e.test.mjs)
|-- scripts/           # Script tien ich khoi tao GitHub backlog/issues
|-- .github/workflows/ # Pipeline CI/CD tu dong (ci.yml va cd.yml)
|-- docker-compose.yml # Khoi chay toan bo he thong local chi voi 1 lenh duy nhat
|-- .env.example       # Mau cau hinh bien moi truong an toan
|-- RELEASE_NOTES.md   # Ghi chu phat hanh phien ban & huong dan Rollback
`-- README.md          # Huong dan van hanh va tai lieu huong dan he thong
\end{lstlisting}

\subsubsection{Chiến lược phân nhánh (Branching Strategy) \& Quy trình Pull Request}
\begin{itemize}[leftmargin=*]
    \item \textbf{Mô hình nhánh Git:}
    \begin{itemize}[noitemsep]
        \item \texttt{main}: Nhánh chính sản xuất (Production-ready), luôn ở trạng thái ổn định và có thể deploy ngay lập tức.
        \item \texttt{develop}: Nhánh tích hợp chung của cả nhóm trong từng đợt chạy Sprint.
        \item \texttt{feat/<ma-task>-<mo-ta>}, \texttt{fix/...}, \texttt{docs/...}, \texttt{chore/...}: Các nhánh ngắn hạn phát triển tính năng, sửa lỗi, tài liệu hoặc cấu hình (theo \texttt{docs/delivery/conventions.md}).
        \item \texttt{ci/<ten-task>}: Nhánh thiết lập và tối ưu hóa quy trình CI/CD.
    \end{itemize}
    \item \textbf{Quy trình Pull Request \& Code Review:} Tuyệt đối cấm commit hoặc push trực tiếp vào nhánh \texttt{main}. Mọi thay đổi đều phải mở Pull Request (PR) dựa trên mẫu quy định tại \texttt{.github/pull\_request\_template.md}, mô tả rõ ràng nội dung thay đổi, đính kèm mã Task/FR, và bắt buộc phải có ít nhất một thành viên khác xem xét (Peer Review) và bấm \textbf{Approve} mới được phép merge.
\end{itemize}

\clearpage
% ==========================================
% TRANG 31: 4.1.3 CONVENTIONAL COMMITS
% ==========================================
\subsubsection{Quy ước Commit (Conventional Commits)}
Mọi thông điệp commit phải tuân theo cấu trúc chuẩn: \texttt{<type>(<scope>): [<mã-task/FR>] <tiêu đề>}
\begin{itemize}[leftmargin=*,noitemsep]
    \item \texttt{feat:} Thêm tính năng mới (ví dụ: \texttt{feat(api): [FR-01] implement GET /products}).
    \item \texttt{fix:} Sửa lỗi (ví dụ: \texttt{fix(cart): [FR-03] fix price calculation when selecting toppings}).
    \item \texttt{docs:} Cập nhật tài liệu (ví dụ: \texttt{docs(srs): [TASK-4.2] add acceptance criteria}).
    \item \texttt{test:} Thêm hoặc sửa test case (ví dụ: \texttt{test(orders): [FR-05] add optimistic locking tests}).
    \item \texttt{chore:} Cấu hình CI/CD, đóng gói Docker (ví dụ: \texttt{chore(ci): [TASK-4.4] setup ci pipeline}).
\end{itemize}

\clearpage
% ==========================================
% TRANG 32: 4.1.4 BẢNG 9 (PRODUCT BACKLOG)
% ==========================================
\subsubsection{Bảng Product Backlog cho Sprint 1 và Sprint 2}

\begin{table}[H]
\centering
\small
\begin{tabularx}{\linewidth}{|c|p{4.2cm}|c|c|p{3.2cm}|c|}
\hline
\rowcolor{tableheader}
\textbf{Mã PB} & \textbf{Hạng mục User Story / Nhiệm vụ} & \textbf{Points} & \textbf{Ưu tiên} & \textbf{Thành viên} & \textbf{Sprint} \\ \hline
US-01 & Xem danh mục thực đơn đồ uống & 3 & High & Lê Quốc Việt (UI Menu) \newline Đặng Hoàng Phúc (Catalog API) & Sprint 1 \\ \hline
US-02 & Tùy biến kích cỡ Size (S/M/L) \& Toppings & 5 & High & Đặng Hoàng Phúc (Backend API) \newline Thiều Đình Trung Hiếu (Trang chi tiết /product/[id]) & Sprint 2 \\ \hline
US-03 & Quản lý giỏ hàng (Cart) với Zustand & 3 & High & Võ Dương Thành Lê (Zustand Store) \newline Thiều Đình Trung Hiếu (Cart Component) & Sprint 2 \\ \hline
US-04 & Đăng ký \& Đăng nhập xác thực bằng JWT & 5 & High & Trần Quang Duy (JWT Guard) \newline Lê Quốc Việt (UI Đăng nhập) & Sprint 2 \\ \hline
US-05 & Tạo đơn hàng \& Khóa trừ kho atomic & 8 & Critical & Đặng Hoàng Phúc (Atomic Transaction) \newline Võ Dương Thành Lê (Checkout API) & Sprint 2 \\ \hline
US-06 & Thanh toán an toàn với Idempotency Key & 8 & Critical & Võ Dương Thành Lê (Payment API) \newline Châu Chí Hải (PayOS/MoMo \& Mock Test) & Sprint 2 \\ \hline
US-07 & Xem lịch sử đơn hàng \& Tích điểm thành viên & 5 & Medium & Châu Chí Hải (History \& Loyalty API) \newline Lê Quốc Việt (UI Lịch sử đơn) & Sprint 2 \\ \hline
US-08 & Phân hệ Barista KDS điều phối pha chế & 8 & High & Châu Chí Hải (Barista State Machine) \newline Thiều Đình Trung Hiếu (KDS Web UI) & Sprint 2 \\ \hline
US-09 & Phân hệ Quản trị Admin (/admin) \& RBAC & 5 & Medium & Nhóm phát triển (CRUD Admin, @AdminOnly, 6 tab UI) & Sprint 2 \\ \hline
TECH-01 & Thiết lập Monorepo, Docker Compose, README & 5 & Critical & Châu Chí Hải \newline Đặng Hoàng Phúc & Sprint 1 \\ \hline
TECH-02 & Thiết lập Pipeline CI (Quality Gate 4 bước) & 5 & Critical & Võ Dương Thành Lê (CI Pipeline) \newline Châu Chí Hải (CI Test Gate) & Sprint 1 \\ \hline
TECH-03 & Thiết lập Pipeline CD \& Triển khai Cloud & 8 & Critical & Võ Dương Thành Lê (Task 5.3 CD) \newline Đặng Hoàng Phúc (Task 5.4 Cloud) & Sprint 2 \\ \hline
\end{tabularx}
\caption{Bảng Product Backlog dự án BrewLite}
\end{table}

\clearpage
% ==========================================
% TRANG 33: 4.1.5 DOD, 4.2 & 4.3 (4.3.1 - 4.3.3)
% ==========================================
\subsubsection{Tiêu chuẩn Định nghĩa Hoàn thành (Definition of Done -- DoD)}
Một User Story chỉ được chuyển sang cột Done trên bảng quản lý khi thỏa mãn cả 6 tiêu chuẩn sau:
\begin{enumerate}[leftmargin=*,noitemsep]
    \item \textbf{Chức năng (Functionality):} Đạt 100\% các tiêu chí Acceptance Criteria quy định trong SRS.
    \item \textbf{Kiểm thử (Testing):} Đã viết Unit Test / Integration Test bao phủ luồng chính và biên; pass 100\%.
    \item \textbf{Chất lượng (Code Quality):} Vượt qua kiểm tra linting (\texttt{npm run lint}), không có lỗi TypeScript.
    \item \textbf{CI Gate (Tự động hóa):} Pipeline CI tự động kích hoạt và trả về kết quả màu xanh (Success).
    \item \textbf{Đồng cấp kiểm duyệt (Peer Review):} Có ít nhất 1 thành viên review và Approve trên PR.
    \item \textbf{Tài liệu \& Truy vết:} Đã cập nhật tương ứng vào Ma trận truy vết \texttt{docs/traceability-matrix.md}.
\end{enumerate}

\subsection{Task 4.2 -- Quản Lý Tài Liệu và Kiểm Soát Phiên Bản}
\begin{itemize}[leftmargin=*]
    \item Toàn bộ tài liệu đặc tả của Task 1--3 được đưa trực tiếp vào thư mục \texttt{docs/} của kho mã nguồn, bao gồm các tệp nguồn (\texttt{.md}, \texttt{.puml}) và các tệp xuất bản (\texttt{.svg}, \texttt{.pdf}).
    \item \textbf{Kiểm soát phiên bản bằng Git:} Mọi thay đổi về đặc tả yêu cầu, điều chỉnh sơ đồ hay bổ sung tiêu chí đều đi qua Pull Request, có commit rõ ràng và ghi chú nguyên nhân sửa đổi, bảo đảm tính lịch sử và khả năng phục hồi.
    \item \textbf{Tính đồng bộ tuyệt đối:} Đảm bảo không có bất kỳ mâu thuẫn nào giữa tài liệu SRS (Task 1.2), sơ đồ Sequence (Task 2.2), Class Diagram (Task 2.3) và Prisma Schema tại \texttt{apps/api/prisma/schema.prisma}.
\end{itemize}

\subsection{Task 4.3 -- Xây Dựng MVP Sprint 1 (Menu Browsing)}
Phiên bản MVP đầu tiên được hoàn thành và kiểm chứng trực tiếp trên môi trường chạy thực tế:

\subsubsection{Phân hệ Backend Catalog API}
\begin{itemize}[leftmargin=*]
    \item \texttt{GET /api/products}: Trả về danh sách toàn bộ sản phẩm đang kinh doanh kèm mã định danh, tên gọi, danh mục, giá gốc, hình ảnh và trạng thái còn hàng.
    \item \texttt{GET /api/products/:id}: Tra cứu thông tin chi tiết của một món đồ uống kèm danh sách các loại toppings có thể chọn thêm.
    \item \textbf{Dữ liệu mẫu (Database Seed):} Kịch bản \texttt{apps/api/prisma/seed.js} kết hợp tệp \texttt{brewlite\_seed\_data.sql} nạp tự động 12 sản phẩm cà phê/trà, 4 danh mục, 3 loại topping, 13 nguyên liệu cùng định mức công thức (\texttt{ProductRecipeItem}) phục vụ chạy thử nghiệm.
\end{itemize}

\subsubsection{Phân hệ Frontend Next.js Menu Mobile-First \& Xử lý 3 Trạng thái}
Giao diện thiết kế chuẩn Mobile-first, hiển thị mượt mà trên di động và xử lý triệt để 3 trạng thái phản hồi bắt buộc:
\begin{enumerate}[leftmargin=*,noitemsep]
    \item \textbf{Trạng thái Đang tải (Loading Skeleton):} Hiển thị các khối khung xương xám dạng sóng chuyển động (Skeleton Component) trong khi đợi API phản hồi.
    \item \textbf{Trạng thái Danh mục trống (Empty State):} Hiển thị hình ảnh minh họa thân thiện kèm thông báo: “Hiện chưa có sản phẩm nào trong danh mục này” và nút quay về trang chủ.
    \item \textbf{Trạng thái Lỗi kết nối (Error State):} Hiển thị hộp cảnh báo màu đỏ với thông báo lỗi cụ thể và nút “Thử lại ngay” để tải lại dữ liệu mà không cần tải lại toàn trang.
\end{enumerate}

\subsubsection{Kiểm thử Sprint 1}
Tập tin kiểm thử tự động \texttt{apps/api/src/products/products.service.spec.ts} được viết bằng Jest, kiểm tra thành công kịch bản truy vấn danh mục sản phẩm (API-T01), đạt tỷ lệ Pass 100\%.

\clearpage
% ==========================================
% TRANG 34: 4.4 CI INTRO, 4.4.1 & HÌNH 11
% ==========================================
\subsection{Task 4.4 -- Tích Hợp Liên Tục (Continuous Integration -- CI)}

Tài liệu tham chiếu bắt buộc: \texttt{docs/delivery/ci-evidence.md} và tệp workflow \texttt{.github/workflows/ci.yml}.

Theo yêu cầu mục 6.4, nhóm thiết lập pipeline CI chạy tự động trên GitHub Actions runner \texttt{ubuntu-latest} mỗi khi mở Pull Request hoặc push code vào nhánh \texttt{main/develop}. Pipeline thực thi nghiêm ngặt chuỗi kiểm soát chất lượng (mở rộng thêm bước Migrate, Seed và Integration/E2E test ở Sprint 2):
\begin{center}
\textbf{Install $\longrightarrow$ Lint $\longrightarrow$ Migrate \& Seed $\longrightarrow$ Unit Test \& E2E $\longrightarrow$ Build}
\end{center}

\subsubsection{Minh chứng 1: Pull Request chạy Pipeline CI Thành Công (CI Pass)}
\begin{itemize}[leftmargin=*]
    \item \textbf{Pull Request \#22 (CI Pass):} \url{https://github.com/Phucdang-gif/Assignment2/pull/22} (Nhánh \texttt{ci/task-4.4-ci-and-deployment} merge vào \texttt{main}).
    \item \textbf{Workflow Run \#42985903031:} Cả hai Jobs Backend CI (NestJS) và Frontend CI (Next.js) đều vượt qua toàn bộ 4 chặng kiểm tra thành công.
\end{itemize}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.88\linewidth]{report_images/ci-success.png}
    \caption{Minh chứng trạng thái CI Pass trên Pull Request \#22 (\texttt{docs/delivery/screenshots/ci-success.png})}
\end{figure}

\clearpage
% ==========================================
% TRANG 35: HÌNH 12 & 4.4.2 CI FAIL
% ==========================================
\begin{figure}[H]
    \centering
    \includegraphics[width=0.88\linewidth]{report_images/ci-success-run.png}
    \caption{Minh chứng Workflow Run thành công toàn diện trên GitHub Actions (\texttt{docs/delivery/screenshots/ci-success-run.png})}
\end{figure}

\subsubsection{Minh chứng 2: Pull Request có lỗi bị Pipeline CI Phát Hiện \& Chặn Merge (CI Fail)}
\begin{itemize}[leftmargin=*]
    \item \textbf{Pull Request \#21 (CI Fail):} \url{https://github.com/Phucdang-gif/Assignment2/pull/21} (Nhánh \texttt{test/ci-failure-demo} hướng vào \texttt{main}).
    \item \textbf{Kịch bản gây lỗi có chủ đích:} Nhóm cố ý chỉnh sửa file \texttt{products.service.spec.ts} với kỳ vọng sai \texttt{expect(result).toHaveLength(999)}.
    \item \textbf{Kết quả:} Pipeline phát hiện lỗi ngay tại bước \textbf{Run Unit Tests}, lập tức hủy bỏ bước \textbf{Build NestJS application} và đánh dấu trạng thái đỏ \textbf{Some checks were not successful}. Quy tắc Branch Protection trên GitHub đã khóa nút \textbf{Merge Pull Request}, ngăn chặn hoàn toàn mã nguồn lỗi lọt vào nhánh chính.
\end{itemize}

\clearpage
% ==========================================
% TRANG 36: HÌNH 13
% ==========================================
\begin{figure}[H]
    \centering
    \includegraphics[width=0.88\linewidth]{report_images/ci-failed.png}
    \caption{Minh chứng PR \#21 bị CI phát hiện lỗi và khóa merge (\texttt{docs/delivery/screenshots/ci-failed.png})}
\end{figure}

\clearpage
% ==========================================
% TRANG 37: HÌNH 14
% ==========================================
\begin{figure}[H]
    \centering
    \includegraphics[width=0.88\linewidth]{report_images/ci-failed-job.png}
    \caption{Chi tiết bước Unit Test thất bại và chặn bước Build trên GitHub Actions (\texttt{docs/delivery/screenshots/ci-failed-job.png})}
\end{figure}

\clearpage
% ==========================================
% TRANG 38: TASK 5 SPRINT 2 INTRO & 5.1.1 9 TÍNH NĂNG
% ==========================================
\section{TASK 5: TRIỂN KHAI SPRINT 2, CI/CD VÀ DELIVERY}

\noindent\textit{Sprint Goal: Hoàn thành trọn vẹn luồng nghiệp vụ end-to-end từ đặt món đến nhận đồ uống, tự động hóa đóng gói và triển khai phiên bản sản xuất (Production) ổn định lên môi trường Cloud công khai qua HTTPS.}

\subsection{Task 5.1 -- Hoàn Thiện MVP Sprint 2 (End-to-End Features)}
Trong Sprint 2, nhóm hiện thực hóa đầy đủ toàn bộ các chức năng nghiệp vụ còn lại:

\subsubsection{Chi tiết các tính năng nghiệp vụ đã hoàn thiện}
\begin{enumerate}[leftmargin=*]
    \item \textbf{Tùy biến Chi tiết món (Size \& Topping):} Khách hàng chọn kích cỡ (S/M/L) và thêm các loại topping có trong hệ thống (Trân châu đen hoàng gia, Kem cheese (Macchiato), Thạch dừa non giòn). Giá tạm tính được tính toán tự động và cập nhật tức thời trên giao diện \texttt{/product/[id]}.
    \item \textbf{Quản lý Giỏ hàng (Cart):} Quản lý trạng thái bằng Zustand store, tích hợp \texttt{localStorage} giúp bảo toàn danh sách món khi khách hàng làm mới (F5) trình duyệt, hỗ trợ áp dụng mã voucher.
    \item \textbf{Xác thực Người dùng (Auth JWT):} Đăng ký và đăng nhập bảo mật; mật khẩu được băm 1 chiều bằng thuật toán \texttt{bcrypt} (10 rounds); cấp mã xác thực JWT chứa thông tin phân quyền (\texttt{role: customer | barista | admin}) kèm giới hạn tần suất (\texttt{ThrottlerGuard}).
    \item \textbf{Khởi tạo Đơn hàng (Order Creation):} API \texttt{POST /api/orders} thực thi trong một transaction tuần tự của PostgreSQL, khóa kiểm tra tồn kho nguyên vật liệu (\texttt{Ingredient.stock}) và phòng chống Race Condition bằng \texttt{Product.version} (Optimistic Locking).
    \item \textbf{Thanh toán Trực tuyến Không tiền mặt:} Trên giao diện Checkout hỗ trợ hai phương thức: Quét mã QR chuyển khoản (\textbf{VietQR / PayOS SDK}) và \textbf{Ví điện tử MoMo Sandbox} (xác thực chữ ký Webhook/IPN). Ngoài ra, endpoint \texttt{POST /api/payments} được bảo vệ bằng \texttt{idempotencyKey} duy nhất để loại trừ hiện tượng trừ tiền trùng lặp (áp dụng cho kiểm thử tự động và hoàn tất đơn 0đ).
    \item \textbf{Theo dõi Trạng thái \& Lịch sử đơn hàng:} Sau khi thanh toán, hệ thống hiển thị màn hình xác nhận đơn hàng thành công (\texttt{/orders/:id}), hiển thị mã đơn, tiến trình trạng thái và cho phép xem lại danh sách đơn đã đặt qua \texttt{GET /api/orders/me}.
    \item \textbf{Phân hệ Barista KDS (Kitchen Display System):} Giao diện màn hình quầy bar (\texttt{/barista}) hiển thị danh sách đơn \texttt{PAID} theo thời gian thực (FIFO), tự động làm mới bằng cơ chế polling mỗi 10 giây, cho phép Barista bấm \textbf{“Nhận đơn”} ($\rightarrow$ \texttt{PREPARING}), \textbf{“Đã pha xong”} ($\rightarrow$ \texttt{READY}), và \textbf{“Đã giao nước”} ($\rightarrow$ \texttt{COMPLETED}).
    \item \textbf{Chiết khấu \& Tích điểm Thành viên:} Tự động giảm giá theo 4 thứ hạng: Đồng ($<$20 điểm: 0\%), Bạc (20--49 điểm: 5\%), Vàng (50--99 điểm: 10\%), Kim Cương ($\ge$100 điểm: 15\%). Tự động cộng 1 điểm cho mỗi 10.000 VNĐ chi tiêu khi thanh toán thành công.
    \item \textbf{Phân hệ Quản trị Admin Dashboard (/admin):} Dành riêng cho tài khoản admin (\texttt{@AdminOnly}), gồm 6 tab: Tổng quan, Sản phẩm, Danh mục, Topping, Đơn hàng và Người dùng.
\end{enumerate}

\clearpage
% ==========================================
% TRANG 39: UI GALLERY 1 (HÌNH 15 - 18)
% ==========================================
\subsubsection{Bộ ảnh chụp màn hình Giao diện Thực tế của Hệ thống}

\begin{figure}[H]
    \centering
    \begin{minipage}{0.48\textwidth}
        \centering
        \includegraphics[width=\linewidth]{report_images/ui-login.png}
        \caption{Giao diện Đăng nhập BrewLite}
    \end{minipage}
    \hfill
    \begin{minipage}{0.48\textwidth}
        \centering
        \includegraphics[width=\linewidth]{report_images/ui-register.png}
        \caption{Giao diện Đăng ký tài khoản}
    \end{minipage}
\end{figure}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.88\linewidth]{report_images/ui-hero.jpeg}
    \caption{Giao diện Trang chủ: Hero Banner \& Cam kết dịch vụ}
\end{figure}

\begin{figure}[H]
    \centering
    \includegraphics[width=0.88\linewidth]{report_images/ui-menu.jpeg}
    \caption{Giao diện Thực đơn Menu đồ uống theo danh mục}
\end{figure}

\clearpage
% ==========================================
% TRANG 40: UI GALLERY 2 (HÌNH 19 - 24)
% ==========================================
\begin{figure}[H]
    \centering
    \begin{minipage}{0.48\textwidth}
        \centering
        \includegraphics[width=\linewidth]{report_images/ui-product-detail.jpeg}
        \caption{Giao diện Chi tiết món \& Tùy biến Size/Topping}
    \end{minipage}
    \hfill
    \begin{minipage}{0.48\textwidth}
        \centering
        \includegraphics[width=\linewidth]{report_images/ui-cart.png}
        \caption{Giao diện Giỏ hàng \& Tóm tắt đơn hàng}
    \end{minipage}
\end{figure}

\begin{figure}[H]
    \centering
    \begin{minipage}{0.48\textwidth}
        \centering
        \includegraphics[width=\linewidth]{report_images/ui-checkout-methods.png}
        \caption{Giao diện Xác nhận phương thức Thanh toán}
    \end{minipage}
    \hfill
    \begin{minipage}{0.48\textwidth}
        \centering
        \includegraphics[width=\linewidth]{report_images/ui-checkout-qr.png}
        \caption{Giao diện Quét mã thanh toán VietQR (PayOS)}
    \end{minipage}
\end{figure}

\begin{figure}[H]
    \centering
    \begin{minipage}{0.48\textwidth}
        \centering
        \includegraphics[width=\linewidth]{report_images/ui-order-history.png}
        \caption{Giao diện Lịch sử đơn hàng người dùng}
    \end{minipage}
    \hfill
    \begin{minipage}{0.48\textwidth}
        \centering
        \includegraphics[width=\linewidth]{report_images/ui-order-success.jpeg}
        \caption{Màn hình Xác nhận Đặt hàng thành công}
    \end{minipage}
\end{figure}

\clearpage
% ==========================================
% TRANG 41: HÌNH 25 (BARISTA KDS)
% ==========================================
\begin{figure}[p]
    \centering
    \includegraphics[width=0.98\linewidth,height=0.85\textheight,keepaspectratio]{report_images/ui-barista-kds.jpeg}
    \caption{Giao diện Điều phối pha chế Barista Dashboard (KDS)}
\end{figure}

\clearpage
% ==========================================
% TRANG 42: 5.2 & 5.2.1 UNIT TEST TASK 10
% ==========================================
\subsection{Task 5.2 -- Tích Hợp và Kiểm Thử Hệ Thống (Integration \& Testing)}

\subsubsection{Kiểm thử Unit Test Nghiệp vụ Nâng cao (Task 10)}
Toàn bộ logic nghiệp vụ phức tạp của hệ thống được kiểm thử tự động với Jest tại \texttt{apps/api/src/orders/orders.service.spec.ts} (30 test cases) và \texttt{apps/api/src/payments/payments.service.spec.ts} (tổng bộ unit test Backend đạt \textbf{11 suites, 118 test cases pass 100\%}):
\begin{itemize}[leftmargin=*,noitemsep]
    \item \textbf{Kiểm thử Order State Machine:} Xác minh chuỗi chuyển trạng thái hợp lệ (\texttt{PENDING} $\rightarrow$ \texttt{PAID} $\rightarrow$ \texttt{PREPARING} $\rightarrow$ \texttt{READY} $\rightarrow$ \texttt{COMPLETED}); Chặn và ném ngoại lệ khi chuyển trạng thái sai quy tắc (ví dụ: \texttt{PENDING} nhảy cóc sang \texttt{READY}, hoặc đơn đã \texttt{COMPLETED} không được quay lại).
    \item \textbf{Kiểm thử Tính Idempotent (Idempotency-Key):} Gửi yêu cầu thanh toán lần đầu $\rightarrow$ Thành công; Gửi lại lần 2 với cùng \texttt{idempotencyKey} $\rightarrow$ Trả về kết quả giao dịch cũ, không tạo record mới, không trừ tiền hai lần; Chặn lỗi khi gửi thiếu key.
    \item \textbf{Kiểm thử Khóa tồn kho \& Optimistic Concurrency Control:} Kiểm tra số lượng tồn kho nguyên liệu bị khấu trừ chính xác; Mô phỏng kịch bản 2 khách hàng đồng thời đặt món cuối cùng $\rightarrow$ Giao dịch thứ 2 bị hủy an toàn do lệch version, không gây bán âm kho.
    \item \textbf{Kiểm thử Chiết khấu Hạng Thành viên \& Điểm thưởng:} Kiểm tra tính đúng đắn mức giảm giá theo điểm tích lũy (Đồng: 0\%, Bạc: 5\%, Vàng: 10\%, Kim Cương: 15\%); Tích điểm chuẩn 1 điểm / 10.000 VNĐ.
\end{itemize}

\clearpage
% ==========================================
% TRANG 43: HÌNH 26 & 5.2.2 INTRO
% ==========================================
\begin{figure}[H]
    \centering
    \includegraphics[width=0.88\linewidth]{report_images/test-task10.png}
    \caption{Kết quả chạy bộ kiểm thử tự động Task 10 (17 passed trong ảnh chụp giai đoạn phát triển; bộ test đầy đủ hiện đạt 118 passed / 11 suites) (\texttt{docs/delivery/screenshots/test-task10.png})}
\end{figure}

\subsubsection{Kiểm thử Hiệu Năng \& Khả Năng Xử Lý Idempotency Thực Tế}
Nhóm tiến hành kiểm thử hiệu năng hệ thống trên môi trường local (\texttt{ALLOW\_MOCK\_PAYMENT=true}) bằng kịch bản PowerShell tự động đo lường thời gian phản hồi:

\clearpage
% ==========================================
% TRANG 44: HÌNH 27, PHÂN TÍCH, 5.2.3 & 5.2.4
% ==========================================
\begin{figure}[H]
    \centering
    \includegraphics[width=0.88\linewidth]{report_images/test-performance-idempotency.jpeg}
    \caption{Kết quả kiểm thử hiệu năng API và cơ chế chống trùng Idempotency (\texttt{docs/delivery/screenshots/test-performance-idempotency.jpeg})}
\end{figure}

\noindent\textit{Phân tích kết quả thực nghiệm:}
\begin{itemize}[leftmargin=*,noitemsep]
    \item Thời gian phản hồi API xem thực đơn \texttt{GET /api/products} chỉ mất trung bình \textbf{3ms đến 5ms} (đạt xuất sắc tiêu chí $<$ 500ms của \texttt{NFR-01}).
    \item Thời gian thực thi luồng tạo đơn và thanh toán \texttt{POST /api/payments} đạt trung bình \textbf{17ms đến 35ms}.
    \item Khi gửi lại cùng một đơn hàng với \texttt{idempotencyKey} lặp: Lần 1 phản hồi 20ms (\texttt{reused=false}), Lần 2 phản hồi \textbf{10ms} (\texttt{reused=true}) -- xác nhận cơ chế chống trùng giao dịch hoạt động hoàn hảo.
\end{itemize}

\subsubsection{Kiểm thử Tích Hợp \& End-to-End (E2E Test)}
Kịch bản kiểm thử E2E tự động được viết tại tệp \texttt{tests/e2e/ordering-flow.e2e.test.mjs} (8 bước từ /health, xem menu, đăng nhập \texttt{POST /api/auth/login}, áp voucher, tạo đơn, thanh toán idempotent đến Barista hoàn tất đơn), kết hợp cùng bộ Integration/E2E trên PostgreSQL thật tại \texttt{apps/api/test/app.e2e-spec.ts} (bao gồm cả bước đăng ký tài khoản \texttt{POST /api/auth/register} và hủy đơn hoàn kho) và \texttt{apps/api/test/orders-payments.e2e-spec.ts}.

\subsubsection{Khởi chạy Cục bộ Đồng bộ với Docker Compose}
Tệp \texttt{docker-compose.yml} ở thư mục gốc cho phép khởi chạy toàn bộ 3 containers (web:3000, api:3001, db:5433->5432) và nạp dữ liệu mẫu tự động chỉ với \textbf{1 câu lệnh duy nhất}:

\clearpage
% ==========================================
% TRANG 45: DOCKER COMPOSE, 5.2.5 HEALTH CHECK & 5.3 CD INTRO
% ==========================================
\begin{lstlisting}[language=bash]
docker compose up --build
\end{lstlisting}

\subsubsection{Endpoint Kiểm tra Sức khỏe Ứng dụng (Health Check)}
Đường dẫn công khai \texttt{GET /health} (hoặc \texttt{GET /api/health}) phản hồi trạng thái hoạt động của NestJS và kết nối PostgreSQL:
\begin{lstlisting}[language=json]
{
  "status": "ok",
  "service": "BrewLite API",
  "timestamp": "2026-11-15T10:00:00.000Z",
  "uptime": 123.45,
  "info": {
    "database": { "status": "up" }
  }
}
\end{lstlisting}

\subsection{Task 5.3 -- Triển Khai Liên Tục (Continuous Delivery / Deployment -- CD)}

Tài liệu tham chiếu bắt buộc: \texttt{.github/workflows/cd.yml} và \texttt{docs/deployment.md}.

Quy trình phân phối và triển khai liên tục được tự động hóa hoàn toàn trên GitHub Actions, đáp ứng đầy đủ \textbf{7 yêu cầu bắt buộc} của mục 7.3 đề bài:

\begin{tcolorbox}[colback=brandblue!5!white,colframe=brandblue,title=\textbf{Chuỗi 6 bước trong Pipeline CD (.github/workflows/cd.yml)}]
\centering\bfseries
Push main / Tag (v*.*.*) $\longrightarrow$ Quality Gate (Lint, Test, E2E, Build) $\longrightarrow$ Docker Image Build \& Push GHCR $\longrightarrow$ Trigger Deploy Render (API/Hook) $\longrightarrow$ Safe Prisma Migration $\longrightarrow$ Automated Smoke Test (/health \& /api/products)
\end{tcolorbox}

\subsubsection{Đặc tả 7 yêu cầu kỹ thuật trong Pipeline CD}
\begin{enumerate}[leftmargin=*]
    \item \textbf{Quality Gate nghiêm ngặt:} Trước khi cho phép đóng gói, pipeline tự động chạy kiểm tra linting (oxlint, eslint), khởi tạo container PostgreSQL dịch vụ, chạy Prisma migration, nạp test seed, thực thi Unit Test (\texttt{npm test}), Integration/E2E (\texttt{npm run test:e2e}), kiểm tra biến \texttt{PRODUCTION\_API\_URL} và build cả Backend lẫn Frontend. Bất kỳ bước nào thất bại, pipeline dừng ngay lập tức.
    \item \textbf{Tạo Docker Image gắn tag phiên bản:} Docker Image được gắn nhãn định danh kép: commit Git SHA (để đối soát mã nguồn), latest và Semantic Version (ví dụ: \texttt{v1.0.1}).
    \item \textbf{Đẩy Image lên Container Registry:} Đẩy Docker Image đã đóng gói lên GitHub Container Registry (GHCR) an toàn.
    \item \textbf{Triển khai vào Production bằng Secret:} Sử dụng \texttt{RENDER\_API\_KEY + RENDER\_SERVICE\_ID} (hoặc Webhook bí mật \texttt{RENDER\_DEPLOY\_HOOK}) lưu trong GitHub Secrets để kích hoạt Render kéo image mới mà không để lộ mật khẩu.
    \item \textbf{Chạy Database Migration an toàn:} Tuyệt đối không dùng lệnh \texttt{prisma db push} có nguy cơ mất dữ liệu. Hệ thống sử dụng lệnh \texttt{npx prisma migrate deploy} trong chỉ lệnh CMD của Dockerfile để bảo đảm tính toàn vẹn dữ liệu.
    \item \textbf{Smoke Test tự động sau triển khai:} Sau khi kích hoạt deploy, pipeline chờ container khởi động (grace period 45s) và thực hiện kiểm tra tự động (retry 6 lần $\times$ 15s) tới endpoint \texttt{GET /health} và kiểm tra dữ liệu thực tế qua \texttt{GET /api/products} trên môi trường Production.
\end{enumerate}

\clearpage
% ==========================================
% TRANG 46: ROLLBACK, 5.4 PRODUCTION & BẢNG 10
% ==========================================
\begin{enumerate}[leftmargin=*,resume]
    \item \textbf{Cơ chế Rollback khi triển khai thất bại:}
    \begin{itemize}[noitemsep]
        \item \textit{Tầng 1 (Render Zero-Downtime):} Render chỉ chuyển đổi lưu lượng truy cập khi container mới pass Health Check. Nếu container mới bị lỗi crash loop, Render giữ nguyên container phiên bản cũ đang chạy.
        \item \textit{Tầng 2 (REST API Rollback):} Pipeline CD tự động phát lệnh đảo ngược qua Render REST API nếu Smoke Test thất bại.
        \item \textit{Tầng 3 (SOP Rollback thủ công):} Đội ngũ kỹ sư có thể rollback nhanh trong 30 giây trực tiếp từ Render Dashboard tại mục Web Service $\rightarrow$ Deploys $\rightarrow$ Rollback to this deploy.
    \end{itemize}
\end{enumerate}

\subsection{Task 5.4 -- Triển Khai Production và Bàn Giao Sản Phẩm}

\subsubsection{Danh sách URL Production Công Khai qua HTTPS}
Hệ thống BrewLite đã được bàn giao và vận hành ổn định trên môi trường Production thực tế:
\begin{itemize}[leftmargin=*]
    \item \textbf{URL Frontend Production (Vercel CDN):} \url{https://assignment2-murex-gamma.vercel.app} (Ứng dụng Next.js 16 PWA, bảo mật SSL/TLS tự động, tối ưu hóa hiển thị di động).
    \item \textbf{URL Backend API Production (Render Docker):} \url{https://assignment2-ugde.onrender.com} (Máy chủ NestJS API đóng gói Docker Container chạy trên nền tảng Render Cloud).
    \item \textbf{URL Health Check Endpoint:} \url{https://assignment2-ugde.onrender.com/health} (Phản hồi trạng thái hoạt động của NestJS và kết nối cơ sở dữ liệu PostgreSQL).
    \item \textbf{Cơ sở dữ liệu Production:} PostgreSQL 16 chạy trong mạng nội bộ riêng (\textbf{Render Private Network VPC}), gắn ổ cứng bền vững Persistent Disk, tuyệt đối không mở cổng trực tiếp ra ngoài Internet.
\end{itemize}

\subsubsection{Tài khoản Kiểm thử có sẵn (Seeded Test Accounts)}

\begin{table}[H]
\centering
\small
\begin{tabularx}{\linewidth}{|p{3.2cm}|p{4.0cm}|p{2.6cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Vai trò (Role)} & \textbf{Email đăng nhập} & \textbf{Mật khẩu} & \textbf{Mục đích kiểm thử} \\ \hline
\textbf{Khách hàng Vàng} & \texttt{customer@brewlite.com} & \texttt{customer123} & Có sẵn 63 điểm loyalty (gồm 2 đơn mẫu trong seed) -- Hạng Vàng tự động giảm giá 10\%. \\ \hline
\textbf{Khách hàng Bạc} & \texttt{khachhang2@example.com} & \texttt{password123} & Đã có 20 điểm loyalty -- Hạng Bạc được tự động giảm giá 5\%. \\ \hline
\textbf{Nhân viên Barista} & \texttt{barista@brewlite.com} & \texttt{barista123} & Truy cập màn hình điều phối pha chế tại đường dẫn \texttt{/barista}. \\ \hline
\textbf{Quản trị viên (Admin)} & \texttt{admin@brewlite.com} & \texttt{barista123} & Truy cập trang quản trị \texttt{/admin} (quản lý sản phẩm, danh mục, topping, đơn hàng, người dùng). \\ \hline
\end{tabularx}
\caption{Bảng danh sách tài khoản kiểm thử được nạp sẵn trong \texttt{brewlite\_seed\_data.sql}}
\end{table}

\clearpage
% ==========================================
% TRANG 47: 5.4.3 RELEASE & 5.4.4 SPRINT REVIEW
% ==========================================
\subsubsection{Phiên bản Phát hành \& Hướng dẫn Vận hành}
\begin{itemize}[leftmargin=*]
    \item \textbf{Release Tag:} \texttt{v1.0.1} (Latest Production Tag; sau đó tiếp tục bổ sung phân hệ Admin và tăng cường RBAC qua các PR \#60--\#64).
    \item \textbf{Tài liệu Hướng dẫn Vận hành:} Tệp \texttt{README.md} ở thư mục gốc cung cấp đầy đủ các kịch bản khởi chạy bằng Docker Compose, chạy local thủ công, chạy kiểm thử tự động, cấu hình cổng thanh toán qua Ngrok (\texttt{apps/api/PAYMENT\_SETUP.md}) và quy trình cứu hộ sự cố.
    \item \textbf{Bảo mật Secret:} Không có bất kỳ API key, JWT Secret hay thông tin đăng nhập database nào bị rò rỉ trong kho mã nguồn Git hay log CI.
\end{itemize}

\subsubsection{Biên bản Sprint Review và Sprint Retrospective}

\noindent\textbf{1. Đánh giá kết quả Sprint Review (Đạt mục tiêu Sprint 2):}
\begin{itemize}[leftmargin=*]
    \item Đã hoàn thành 100\% các hạng mục User Story đã cam kết trong Product Backlog.
    \item Luồng đặt hàng end-to-end vận hành trơn tru: duyệt món $\rightarrow$ tùy biến $\rightarrow$ giỏ hàng $\rightarrow$ thanh toán VietQR/MoMo $\rightarrow$ Barista tiếp nhận $\rightarrow$ hoàn tất đơn.
    \item Cơ chế khóa lạc quan và Idempotency bảo vệ tính toàn vẹn dữ liệu hoàn hảo, không có lỗi bán âm hay trừ tiền trùng.
\end{itemize}

\noindent\textbf{2. Biên bản Rút kinh nghiệm Sprint Retrospective (Agile Lessons Learned):}
\begin{itemize}[leftmargin=*]
    \item \textbf{Những điểm nhóm đã làm tốt (What went well):}
    \begin{itemize}[noitemsep]
        \item Phân công công việc rõ ràng, bám sát chuyên môn của từng thành viên.
        \item Quy tắc Branch Protection và Pipeline CI 4 bước giúp loại bỏ 100\% nguy cơ đưa code lỗi vào nhánh main.
        \item Cấu trúc Monorepo giúp việc quản lý tài liệu và mã nguồn luôn đồng bộ và nhất quán.
    \end{itemize}
    \item \textbf{Những điểm cần cải thiện (What could be improved):}
    \begin{itemize}[noitemsep]
        \item Giai đoạn đầu còn gặp một số xung đột (merge conflict) do các thành viên chưa tạo thói quen pull code mới nhất về trước khi lập trình. Nhóm đã khắc phục triệt để bằng quy chuẩn làm việc nhóm \texttt{docs/delivery/team-workflow.md}.
        \item Môi trường Cloud Render gói miễn phí có độ trễ khởi động lại (cold start). Giải pháp trong tương lai là duy trì gói nâng cấp hoặc cấu hình cron job tự động ping health check giữ ấm server.
    \end{itemize}
    \item \textbf{Bài học kinh nghiệm (Key Takeaways):} Việc đầu tư thiết kế kỹ lưỡng ngay từ Task 1 (SRS) và Task 2 (UML Diagrams) giúp quá trình lập trình ở Task 4 và Task 5 diễn ra nhanh chóng, đúng hướng và không bị lệch yêu cầu.
\end{itemize}

\clearpage
% ==========================================
% TRANG 48: SECTION 6 RTM INTRO
% ==========================================
\section{MA TRẬN TRUY VẾT YÊU CẦU (TRACEABILITY MATRIX)}

Tài liệu tham chiếu bắt buộc: \texttt{docs/traceability-matrix.md}.

Theo quy định mục 8.1 của đề bài, ma trận truy vết (Requirements Traceability Matrix -- RTM) là cơ sở nghiệm thu bắt buộc, chứng minh mọi yêu cầu chức năng và phi chức năng đều được hiện thực hóa qua sơ đồ thiết kế, quyết định kiến trúc, mã nguồn API và các bài kiểm thử tự động tương ứng:

\clearpage
% ==========================================
% TRANG 49: 6.1 BẢNG 11 (RTM FR)
% ==========================================
\subsection{Bảng Truy Vết Yêu Cầu Chức Năng (Functional Requirements -- FR)}

\begin{table}[H]
\centering
\footnotesize
\begin{tabularx}{\linewidth}{|c|p{2.2cm}|p{2.3cm}|c|p{3.4cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Mã FR} & \textbf{Use-case / Story} & \textbf{Thiết kế / Sơ đồ} & \textbf{ADR áp dụng} & \textbf{Mã nguồn / API Endpoint} & \textbf{Bài kiểm thử (Test Cases)} \\ \hline
\textbf{FR-01} & US-01: Xem menu \newline UC-01: Xem menu & Activity-01, Class-01, C4-Container & ADR-001 ADR-002 & \texttt{GET /api/products} \newline \texttt{GET /api/products/:id} & \texttt{products.service.} \newline \texttt{spec.ts (API-T01)} \\ \hline
\textbf{FR-02} & US-02: Size \& Topping \newline UC-03, UC-04 & Class-01 (Topping, OrderItemTopping) & ADR-002 & \texttt{GET /api/toppings} \newline \texttt{apps/web/app/product/} \newline \texttt{[id]/pageProduct.tsx} & \texttt{toppings.service.spec.ts} \newline \texttt{products.service.spec.ts} \\ \hline
\textbf{FR-03} & US-03: Giỏ hàng \newline UC-05: Quản lý giỏ & Class-01 (OrderItem), C4-Container & ADR-001 & Frontend useCartStore \newline \texttt{apps/web/app/cart/} \newline \texttt{pageCart.tsx} & \texttt{frontend.unit.test.mjs} \newline \texttt{ordering-flow.e2e.} \newline \texttt{test.mjs} \newline \texttt{app.e2e-spec.ts} \\ \hline
\textbf{FR-04} & US-04: Đăng ký/nhập \newline UC-10, UC-11 & Class-01 (User), Sequence-Auth & ADR-005 & \texttt{POST /api/auth/login} \newline \texttt{POST /api/auth/register} \newline \texttt{/api/users (@AdminOnly)} & \texttt{auth.service.spec.ts} \newline \texttt{users.service.spec.ts} \newline \texttt{users.controller.spec.ts} \\ \hline
\textbf{FR-05} & US-05: Đặt hàng \newline UC-06: Đặt hàng mới & Sequence-01, Class-01 (Order, Product.version) & ADR-002 ADR-003 & \texttt{POST /api/orders} \newline (Prisma Transaction \& Lock) & \texttt{orders.service.spec.ts} \newline \texttt{orders.controller.spec.ts} \newline \texttt{orders-payments.e2e-spec.ts} \\ \hline
\textbf{FR-06} & US-06: Thanh toán \newline UC-07: Thanh toán ví & Sequence-01, Class-01 (Payment) & ADR-004 & \texttt{POST /api/payments/} \newline \texttt{create-payos-link,} \newline \texttt{momo-payment} \newline \texttt{POST /api/payments} & \texttt{payments.service.} \newline \texttt{spec.ts} \newline \texttt{payments.controller.} \newline \texttt{spec.ts} \\ \hline
\textbf{FR-07} & US-07: Lịch sử \& Điểm \newline UC-09: Lịch sử đơn & Class-01 (LoyaltyTx), C4-Backend & ADR-002 & \texttt{GET /api/orders/me} \newline \texttt{tx.loyaltyTransaction} & \texttt{orders.service.spec.ts} \newline \texttt{payments.service.spec.ts} \\ \hline
\textbf{FR-08} & US-08: Pha chế \newline UC-12, UC-13 & State Machine, Class-01 (order\_status) & ADR-002 & \texttt{GET /api/orders/barista/} \newline \texttt{queue} \newline \texttt{PATCH /api/orders/} \newline \texttt{barista/:id/\{prepare,} \newline \texttt{ready,complete\}} & \texttt{orders.service.spec.ts} \newline \texttt{orders.controller.spec.ts} \\ \hline
\textbf{FR-09} & US-09: Quản trị Admin \newline UC-14: Bật/tắt món & Class-01 (ProductStatus) & ADR-002 & \texttt{PATCH /api/products/:id} \newline \texttt{PATCH /api/toppings/:id} \newline \texttt{GET /api/*/admin/all,} \newline \texttt{/admin} & \texttt{products.service.spec.ts} \newline \texttt{toppings.service.spec.ts} \newline \texttt{categories.service.spec.ts} \\ \hline
\textbf{FR-10} & US-10: Hủy đơn quá hạn \newline UC-06: Hủy PENDING & Activity-01 (Rollback), Class-01 & ADR-002 ADR-003 & \texttt{OrdersService.create()} \newline \texttt{PATCH} \newline \texttt{/api/orders/:id/cancel} & \texttt{orders.service.spec.ts} \newline \texttt{app.e2e-spec.ts} \\ \hline
\textbf{FR-11} & US-11: Ưu đãi \& Voucher \newline UC-06: Áp voucher & Class-01 (Promotion), C4-Backend & ADR-002 & \texttt{OrdersService.} \newline \texttt{validateVoucher} & \texttt{orders.service.spec.ts} \newline (Tier \& voucher tests) \\ \hline
\textbf{FR-12} & US-12: Hero \& Tìm kiếm \newline UC-01: Menu & C4-Container, Class-01 (Product) & ADR-001 & \texttt{GET /api/products} \newline \texttt{apps/web/app/page.tsx} & \texttt{products.service.} \newline \texttt{spec.ts} \\ \hline
\textbf{FR-13} & US-13: Chặn tiền mặt \newline UC-07: Thanh toán & Class-01 (payment\_method) & ADR-004 & DTO validation chặn CASH, chỉ nhận WALLET/CARD & \texttt{payments.service.spec.ts} \newline \texttt{orders-payments.e2e-spec.ts} \\ \hline
\end{tabularx}
\caption{Ma trận truy vết yêu cầu chức năng (RTM -- Functional Requirements)}
\end{table}

\clearpage
% ==========================================
% TRANG 50: 6.2 BẢNG 12 (RTM NFR) & 6.3 CHECKLIST (PART)
% ==========================================
\subsection{Bảng Truy Vết Yêu Cầu Phi Chức Năng (Non-Functional Requirements -- NFR)}

\begin{table}[H]
\centering
\small
\begin{tabularx}{\linewidth}{|c|p{3.0cm}|p{4.5cm}|Y|}
\hline
\rowcolor{tableheader}
\textbf{Mã NFR} & \textbf{Mục tiêu phi chức năng} & \textbf{Tiêu chí kiểm chứng kỹ thuật} & \textbf{Giải pháp kiến trúc \& Thành phần kỹ thuật} \\ \hline
\textbf{NFR-01} & \textbf{Hiệu năng (Performance)} & Thời gian phản hồi API $<$ 500ms; Tải trang PWA $<$ 1.5s; Phục vụ ổn định 100 người dùng đồng thời. & Modular Monolith NestJS (ADR-002), Next.js App Router, Tailwind CSS nhẹ, CDN Vercel Edge. \\ \hline
\textbf{NFR-02} & \textbf{Tính toàn vẹn (Data Integrity)} & Dữ liệu không bị phân mảnh; Không xảy ra bán âm tồn kho; Giao dịch đạt chuẩn ACID. & PostgreSQL 16, Prisma \texttt{\$transaction} (ADR-003), Khóa lạc quan \texttt{Product.version}. \\ \hline
\textbf{NFR-03} & \textbf{Bảo mật \& Độ tin cậy} & Mật khẩu băm an toàn; Không bị trừ tiền lặp; Token tự động hết hạn; Chống brute-force. & Băm \texttt{bcrypt} 10 rounds, JWT qua Passport Guard (ADR-005), \texttt{ThrottlerGuard}, \texttt{CORS\_ORIGIN}, \texttt{idempotencyKey} (ADR-004). \\ \hline
\textbf{NFR-04} & \textbf{Khả dụng (Usability)} & Giao diện tối ưu Mobile-First Responsive; Đủ 3 trạng thái phản hồi. & Next.js Loading Skeleton, Toast Alert, Thiết kế giao diện thân thiện một tay (ADR-001). \\ \hline
\textbf{NFR-05} & \textbf{Khả năng triển khai} & Tự động hóa CI/CD; Khởi chạy 1 lệnh bằng Docker; Endpoint kiểm tra sức khỏe. & Tệp \texttt{docker-compose.yml}, GitHub Actions Pipeline (ci.yml, cd.yml), Endpoint \texttt{GET /health} (ADR-006). \\ \hline
\textbf{NFR-06} & \textbf{Khả năng bảo trì} & Mã nguồn sạch, kiểu dữ liệu tĩnh nghiêm ngặt; Lịch sử commit chuẩn; Truy vết 100\%. & TypeScript Strict Mode (\texttt{tsconfig.json}), oxlint \& ESLint, Conventional Commits, \texttt{docs/traceability-matrix.md}. \\ \hline
\end{tabularx}
\caption{Ma trận truy vết yêu cầu phi chức năng (RTM -- Non-Functional Requirements)}
\end{table}

\subsection{Checklist Bàn Giao và Nghiệm Thu Dự Án (Mục 9.1 Đề Bài)}

\begin{itemize}[leftmargin=*,label={\checkmark}]
    \item \textbf{Link Repository \& Quyền truy cập:} Kho mã nguồn chính thức tại: \url{https://github.com/Phucdang-gif/Assignment2}.
    \item \textbf{Tài liệu SRS, Đặc tả Use-Case \& Ma trận truy vết:} Hoàn thành đầy đủ tại thư mục \texttt{docs/requirements/} (\texttt{srs.md}, \texttt{usecase-checkout.md}) và tệp \texttt{docs/traceability-matrix.md}.
    \item \textbf{Sơ đồ Thiết kế Hệ thống:} Đầy đủ Activity Diagram, Sequence Diagram, Domain Class Diagram, C4 Architecture Model và UML Deployment Diagram.
    \item \textbf{Mã nguồn Đầy đủ (Source Code):} Phân hệ Frontend Next.js (\texttt{apps/web}), Phân hệ Backend NestJS (\texttt{apps/api}) và Prisma Migration Schema (\texttt{apps/api/prisma/}).
    \item \textbf{Kiểm thử Tự động (Testing):} Unit Tests nghiệp vụ Task 10, Integration Tests API và End-to-End Tests (\texttt{tests/e2e/}).
    \item \textbf{Pipeline CI/CD Vận hành Thực tế:} Pipeline CI (\texttt{.github/workflows/ci.yml}) với minh chứng PR \#22 Pass và PR \#21 Fail; Pipeline CD (\texttt{.github/workflows/cd.yml}) tự động đóng gói và triển khai lên Render/Vercel.
    \item \textbf{URL Production Hoạt động Ổn định qua HTTPS:}
    \begin{itemize}[leftmargin=*,noitemsep]
        \item Frontend Web App: \url{https://assignment2-murex-gamma.vercel.app}
        \item Backend API Service: \url{https://assignment2-ugde.onrender.com}
        \item Health Check Endpoint: \url{https://assignment2-ugde.onrender.com/health}
    \end{itemize}
\end{itemize}

\clearpage
% ==========================================
% TRANG 51: CHECKLIST TIẾP THEO (CUỐI)
% ==========================================
\begin{itemize}[leftmargin=*,label={\checkmark}]
    \item \textbf{Release Notes, README \& Hướng dẫn Rollback:} Hướng dẫn chi tiết tại \texttt{README.md} và tài liệu \texttt{docs/deployment.md} (quy trình chạy local, test, build và khôi phục sự cố).
    \item \textbf{Sprint Review \& Sprint Retrospective:} Đánh giá hoàn thành 100\% mục tiêu Sprint và đúc rút bài học kinh nghiệm phát triển phần mềm Agile/Scrum.
\end{itemize}

\end{document}
'''

with open('BaoCao_Assignment2_BrewLite.tex', 'w', encoding='utf-8') as f:
    f.write(tex_content.strip() + '\n')

print('BaoCao_Assignment2_BrewLite.tex written successfully.')
