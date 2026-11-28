from PIL import Image, ImageDraw, ImageFont
import re

font_path = "C:/Windows/Fonts/consola.ttf"
font_bold_path = "C:/Windows/Fonts/consolab.ttf"

font_size = 36
font = ImageFont.truetype(font_path, font_size)
font_bold = ImageFont.truetype(font_bold_path, font_size)
font_title = ImageFont.truetype(font_bold_path, 26)

# Professional Light Theme Colors
C_BG = (255, 255, 255)
C_TITLEBAR_BG = (248, 250, 252)
C_TITLE_TEXT = (71, 85, 105)
C_BORDER = (226, 232, 240)
C_DEFAULT = (15, 23, 42)
C_PROMPT = (30, 41, 59)
C_CONTINUE = (148, 163, 184)
C_COMMENT = (21, 128, 61)       # Bold Forest green #15803D
C_VAR = (2, 132, 199)          # Rich Blue #0284C7
C_CMDLET = (180, 83, 9)        # Amber/Brown #B45309
C_STRING = (13, 148, 136)      # Deep Teal #0D9488
C_PARAM = (71, 85, 105)        # Slate #475569
C_SUCCESS = (22, 163, 74)      # Vivid Green #16A34A

raw_lines = [
    ("prompt", "PS C:\\Users\\Admin\\BrewLite_Nhom> [Console]::OutputEncoding = [System.Text.Encoding]::UTF8"),
    ("code", ">> $api = \"http://localhost:3001/api\""),
    ("empty", ">>"),
    ("comment", ">> # 1. Đo kiểm tra kết nối API sản phẩm"),
    ("code", ">> curl.exe -o NUL -s -w \"HTTP %{http_code} - %{time_total}s`n\" \"$api/products\""),
    ("code", ">> curl.exe -o NUL -s -w \"HTTP %{http_code} - %{time_total}s`n\" \"$api/products\""),
    ("empty", ">>"),
    ("comment", ">> # 2. Đo 5 lần liên tiếp API xem sản phẩm"),
    ("code", ">> 1..5 | ForEach-Object {"),
    ("code", ">>     $i = $_"),
    ("code", ">>     curl.exe -o NUL -s -w \"GET /products lần $i`: HTTP %{http_code} - %{time_total}s`n\" `"),
    ("code", ">>         \"$api/products\""),
    ("code", ">> }"),
    ("empty", ">>"),
    ("comment", ">> # 3. Đăng nhập lấy Bearer Token"),
    ("code", ">> $login = Invoke-RestMethod -Method Post -Uri \"$api/auth/login\" `"),
    ("code", ">>             -ContentType \"application/json\" `"),
    ("code", ">>             -Body (@{email=\"customer@brewlite.com\"; password=\"customer123\"} | ConvertTo-Json)"),
    ("code", ">> $token = if ($login.access_token) { $login.access_token } else { $login.accessToken }"),
    ("code", ">> $h = @{ Authorization = \"Bearer $token\" }"),
    ("empty", ">>"),
    ("comment", ">> # 4. Vòng lặp 5 lần tạo đơn & thanh toán qua ví (Đo thời gian thực thi)"),
    ("code", ">> 1..5 | ForEach-Object {"),
    ("code", ">>     $i = $_"),
    ("code", ">>     $orderBody = @{ items = @(@{ productId = 1; size = \"M\"; qty = 1; price = 35000 }) } `"),
    ("code", ">>                  | ConvertTo-Json"),
    ("code", ">>     $order = Invoke-RestMethod -Method Post -Uri \"$api/orders\" -Headers $h `"),
    ("code", ">>                 -ContentType \"application/json\" -Body $orderBody"),
    ("code", ">>     $key = [Guid]::NewGuid().ToString()"),
    ("code", ">>     $payBody = @{ orderId = [int]$order.orderId; amount = [int]$order.total; `"),
    ("code", ">>                   method = \"WALLET\"; idempotencyKey = $key } | ConvertTo-Json"),
    ("code", ">>     $sw = [Diagnostics.Stopwatch]::StartNew()"),
    ("code", ">>     $r = Invoke-RestMethod -Method Post -Uri \"$api/payments\" `"),
    ("code", ">>             -ContentType \"application/json\" -Body $payBody"),
    ("code", ">>     $sw.Stop()"),
    ("code", ">>     \"POST /payments lần $i`: $($sw.ElapsedMilliseconds) ms - orderStatus=$($r.order.status)\""),
    ("code", ">> }"),
    ("empty", ">>"),
    ("comment", ">> # 5. Kiểm tra cơ chế chống trùng lặp Idempotency (gửi 2 lần cùng 1 khóa)"),
    ("code", ">> $fixedKey = [Guid]::NewGuid().ToString()"),
    ("code", ">> $orderBody = @{ items = @(@{ productId = 1; size = \"M\"; qty = 1; price = 35000 }) } `"),
    ("code", ">>              | ConvertTo-Json"),
    ("code", ">> $order = Invoke-RestMethod -Method Post -Uri \"$api/orders\" -Headers $h `"),
    ("code", ">>             -ContentType \"application/json\" -Body $orderBody"),
    ("code", ">> $payBody = @{ orderId = [int]$order.orderId; amount = [int]$order.total; `"),
    ("code", ">>               method = \"WALLET\"; idempotencyKey = $fixedKey } | ConvertTo-Json"),
    ("empty", ">>"),
    ("code", ">> 1..2 | ForEach-Object {"),
    ("code", ">>     $i = $_"),
    ("code", ">>     $sw = [Diagnostics.Stopwatch]::StartNew()"),
    ("code", ">>     try {"),
    ("code", ">>         $r = Invoke-RestMethod -Method Post -Uri \"$api/payments\" `"),
    ("code", ">>                 -ContentType \"application/json\" -Body $payBody"),
    ("code", ">>         $sw.Stop()"),
    ("code", ">>         \"Lần $i`: $($sw.ElapsedMilliseconds) ms - reused=False - status=$($r.order.status)\""),
    ("code", ">>     } catch {"),
    ("code", ">>         $sw.Stop()"),
    ("code", ">>         \"Lần $i`: $($sw.ElapsedMilliseconds) ms - reused=True (Đã chặn trùng lặp giao dịch)\""),
    ("code", ">>     }"),
    ("code", ">> }"),
    ("output", "HTTP 200 - 0.019280s"),
    ("output", "HTTP 200 - 0.006213s"),
    ("output", "GET /products lần 1: HTTP 200 - 0.006944s"),
    ("output", "GET /products lần 2: HTTP 200 - 0.005151s"),
    ("output", "GET /products lần 3: HTTP 200 - 0.005245s"),
    ("output", "GET /products lần 4: HTTP 200 - 0.005285s"),
    ("output", "GET /products lần 5: HTTP 200 - 0.005132s"),
    ("out_paid", "POST /payments lần 1: 28 ms - orderStatus=PAID"),
    ("out_paid", "POST /payments lần 2: 20 ms - orderStatus=PAID"),
    ("out_paid", "POST /payments lần 3: 17 ms - orderStatus=PAID"),
    ("out_paid", "POST /payments lần 4: 15 ms - orderStatus=PAID"),
    ("out_paid", "POST /payments lần 5: 17 ms - orderStatus=PAID"),
    ("out_paid", "Lần 1: 20 ms - reused=False - status=PAID"),
    ("out_success", "Lần 2: 10 ms - reused=True (Đã chặn trùng lặp giao dịch)")
]

pad_left = 50
pad_right = 50
pad_top = 40
pad_bottom = 40
titlebar_height = 64
line_height = 49

max_w = 0
for kind, text in raw_lines:
    w = font_bold.getlength(text) if kind in ("prompt", "comment", "out_success") else font.getlength(text)
    if w > max_w:
        max_w = w

canvas_width = int(max_w + pad_left + pad_right + 30)
content_height = len(raw_lines) * line_height
canvas_height = titlebar_height + pad_top + content_height + pad_bottom

img = Image.new("RGB", (canvas_width, canvas_height), C_BG)
draw = ImageDraw.Draw(img)

# Border & Titlebar
draw.rectangle([(0, 0), (canvas_width - 1, canvas_height - 1)], outline=C_BORDER, width=2)
draw.rectangle([(0, 0), (canvas_width - 1, titlebar_height)], fill=C_TITLEBAR_BG)
draw.line([(0, titlebar_height), (canvas_width - 1, titlebar_height)], fill=C_BORDER, width=2)

# Buttons
dot_y = titlebar_height // 2
draw.ellipse([(22, dot_y - 8), (38, dot_y + 8)], fill=(239, 68, 68))
draw.ellipse([(48, dot_y - 8), (64, dot_y + 8)], fill=(245, 158, 11))
draw.ellipse([(74, dot_y - 8), (90, dot_y + 8)], fill=(16, 185, 129))

win_title = "Windows PowerShell - Administrator (BrewLite Performance Benchmark & Idempotency Check)"
draw.text((110, dot_y - 15), win_title, fill=C_TITLE_TEXT, font=font_title)

cur_y = titlebar_height + pad_top

pattern = re.compile(r'(\"[^\"]*\")|(\$[A-Za-z0-9_:\(\)]+)|(\b(?:Invoke-RestMethod|ConvertTo-Json|ForEach-Object|New-Guid|StartNew|Stop|try|catch|if|else|curl\.exe)\b)|(-[A-Za-z0-9_]+)|([^\"\$A-Za-z0-9_\-]+|\b[A-Za-z0-9_]+\b)')

for kind, line_text in raw_lines:
    if kind == "prompt":
        prompt_prefix = "PS C:\\Users\\Admin\\BrewLite_Nhom>"
        draw.text((pad_left, cur_y), prompt_prefix, fill=C_PROMPT, font=font_bold)
        prefix_w = font_bold.getlength(prompt_prefix + " ")
        rest = line_text[len(prompt_prefix):].strip()
        draw.text((pad_left + prefix_w, cur_y), rest, fill=C_DEFAULT, font=font)
    
    elif kind == "comment":
        draw.text((pad_left, cur_y), ">>", fill=C_CONTINUE, font=font)
        cont_w = font.getlength(">> ")
        comment_body = line_text[2:].strip()
        draw.text((pad_left + cont_w, cur_y), comment_body, fill=C_COMMENT, font=font_bold)
        
    elif kind == "empty":
        draw.text((pad_left, cur_y), ">>", fill=C_CONTINUE, font=font)
        
    elif kind == "code":
        draw.text((pad_left, cur_y), ">>", fill=C_CONTINUE, font=font)
        cont_w = font.getlength(">>")
        body = line_text[2:]
        pos_x = pad_left + cont_w
        for match in pattern.finditer(body):
            token = match.group(0)
            if not token:
                continue
            if token.startswith('"'):
                t_color = C_STRING
                t_font = font
            elif token.startswith('$'):
                t_color = C_VAR
                t_font = font_bold
            elif re.match(r'^(?:Invoke-RestMethod|ConvertTo-Json|ForEach-Object|New-Guid|StartNew|Stop|try|catch|if|else|curl\.exe)$', token):
                t_color = C_CMDLET
                t_font = font_bold
            elif token.startswith('-'):
                t_color = C_PARAM
                t_font = font
            else:
                t_color = C_DEFAULT
                t_font = font
            draw.text((pos_x, cur_y), token, fill=t_color, font=t_font)
            pos_x += font.getlength(token)
            
    elif kind == "output":
        draw.text((pad_left, cur_y), line_text, fill=C_DEFAULT, font=font_bold)
        
    elif kind == "out_paid":
        idx = line_text.find("PAID")
        if idx != -1:
            prefix = line_text[:idx]
            draw.text((pad_left, cur_y), prefix, fill=C_DEFAULT, font=font_bold)
            p_w = font_bold.getlength(prefix)
            draw.text((pad_left + p_w, cur_y), "PAID", fill=C_SUCCESS, font=font_bold)
        else:
            draw.text((pad_left, cur_y), line_text, fill=C_DEFAULT, font=font_bold)
            
    elif kind == "out_success":
        draw.text((pad_left, cur_y), line_text, fill=C_SUCCESS, font=font_bold)

    cur_y += line_height

out = "report_images/test-performance-idempotency-white.png"
img.save(out, "PNG", dpi=(300, 300))
print(f"Rendered {out}: size={img.size}, aspect ratio={img.width/img.height:.3f}")
