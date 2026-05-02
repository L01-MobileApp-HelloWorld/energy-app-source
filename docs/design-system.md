# BanHayLuoi — Design System v1.0

> **Mục đích:** Tài liệu này định nghĩa toàn bộ hệ thống thiết kế cho app BanHayLuoi.
> Mọi quy tắc đều **bắt buộc** và phải áp dụng nhất quán trên Figma, code, và bản trình bày (Behance).

---

## Mục lục

1. [Typography — Chữ](#1-typography--chữ)
2. [Color System — Màu sắc](#2-color-system--màu-sắc)
3. [Components — Thành phần UI](#3-components--thành-phần-ui)
4. [Iconography — Icon](#4-iconography--icon)
5. [Layout & Spacing — Bố cục và khoảng cách](#5-layout--spacing--bố-cục-và-khoảng-cách)
6. [Illustration — Hình minh họa](#6-illustration--hình-minh-họa)
7. [Theme — Chế độ giao diện](#7-theme--chế-độ-giao-diện)
8. [Behance Presentation — Bản trình bày](#8-behance-presentation--bản-trình-bày)
9. [Validation Checklist — Danh sách kiểm tra](#9-validation-checklist--danh-sách-kiểm-tra)

---

## 1. Typography — Chữ

### Font sử dụng

| Font | Vai trò | Dùng khi nào |
|------|---------|-------------|
| **Plus Jakarta Sans** | Font chính (UI) | Mọi đoạn văn bản thông thường |
| **DM Mono** | Font phụ (số liệu) | Điểm số, timestamp, giá trị dạng số |

### Bảng Text Styles

| Tên style | Cỡ chữ | Weight | Line Height | Dùng ở đâu |
|-----------|--------|--------|-------------|------------|
| Display   | 28px   | 800    | 1.2         | Tiêu đề app, màn hình mở đầu |
| H1        | 22px   | 700    | 1.3         | Tiêu đề màn hình chính |
| H2        | 18px   | 700    | 1.35        | Tiêu đề section trong màn hình |
| H3        | 15px   | 600    | 1.4         | Tiêu đề card, nhóm nội dung nhỏ |
| Body      | 13px   | 400    | 1.55        | Văn bản chính, câu hỏi khảo sát |
| Body Small| 11px   | 400    | 1.5         | Mô tả phụ, subtitle |
| Caption   | 10px   | 600    | 1.4         | Text trong badge, nhãn nhỏ |
| CTA       | 14px   | 700    | 1.2         | Text trên nút bấm (button) |

> **Lưu ý Caption:** Dùng `letter-spacing: +0.08em` và viết hoa toàn bộ (UPPERCASE).

### Quy tắc Typography

- Chỉ dùng đúng 2 font ở trên — không thêm font mới
- Cỡ chữ tối thiểu là **10px** — nhỏ hơn sẽ khó đọc trên mobile
- Không dùng weight **300** (quá mỏng, khó đọc trên nền tối)
- Luôn dùng Text Styles đã định nghĩa, không override thủ công

---

## 2. Color System — Màu sắc

> **Nguyên tắc cốt lõi:** Không bao giờ hardcode màu trực tiếp. Chỉ dùng token (CSS variable) — giúp Dark/Light mode hoạt động tự động.

### Background — Nền

Có 4 lớp nền tối, tạo chiều sâu cho giao diện:

| Token | Hex | Dùng cho |
|-------|-----|---------|
| `--color-bg-base` | `#0E0E16` | Nền toàn màn hình (lớp sâu nhất) |
| `--color-bg-surface-1` | `#111118` | Nền card, panel |
| `--color-bg-surface-2` | `#13131E` | Nền card nổi trên surface-1 |
| `--color-bg-surface-3` | `#1A1A2E` | Nền modal, dropdown |
| `--color-border-default` | `#252535` | Viền ngăn cách, divider |
| `--color-bg-light` | `#F5F5FA` | Nền Light mode |

### Brand / Accent — Màu thương hiệu

| Token | Hex | Dùng cho |
|-------|-----|---------|
| `--color-accent-purple` | `#6C47FF` | Màu chính: nút CTA, active state, highlight |
| `--color-accent-purple-dark` | `#4A2ECC` | Trạng thái pressed/hover của accent-purple |
| `--color-accent-purple-light` | `#9C76FF` | Icon active, text link, accent nhẹ |
| `--color-accent-teal` | `#3ECFCF` | Màu phụ: điểm nhấn thứ hai |
| `--color-accent-purple-surface` | `#1A1A40` | Nền nhẹ cho khu vực highlight bằng purple |

### State Colors — Màu trạng thái

Mỗi kết quả khảo sát có màu riêng để người dùng nhận biết nhanh:

| Token | Hex | Trạng thái | Ý nghĩa |
|-------|-----|-----------|---------|
| `--state-exhausted` | `#EF5350` | Kiệt sức | Mệt thật sự, cần nghỉ ngơi |
| `--state-tired` | `#FFA726` | Mệt mỏi | Mệt nhưng vẫn còn sức |
| `--state-lazy-deadline` | `#FFD600` | Lười có deadline | Chưa muốn làm vì áp lực |
| `--state-ready` | `#06D6A0` | Sẵn sàng | Năng lượng tốt, có thể bắt đầu |
| `--state-focused` | `#29B6F6` | Tập trung | Đang trong trạng thái flow |
| `--state-unmotivated` | `#9C76FF` | Thiếu động lực | Không có lý do để bắt đầu |

### Text Colors — Màu chữ

Có 5 mức độ nổi bật cho chữ:

| Token | Hex | Dùng cho |
|-------|-----|---------|
| `--color-text-primary` | `#F0F0FF` | Tiêu đề, nội dung chính |
| `--color-text-secondary` | `#D0D0E8` | Mô tả, nội dung phụ |
| `--color-text-muted` | `#888899` | Placeholder, hint text |
| `--color-text-disabled` | `#555570` | Trạng thái disabled |
| `--color-text-ghost` | `#444460` | Chữ rất mờ, ít quan trọng nhất |

---

## 3. Components — Thành phần UI

### Danh sách components bắt buộc

| Component | Mô tả |
|-----------|-------|
| **Button** | Nút bấm chính (CTA) và phụ |
| **Option Card** | Card để chọn một đáp án trong khảo sát |
| **State Badge** | Nhãn hiển thị trạng thái (Exhausted, Lazy, v.v.) |
| **Progress Bar** | Thanh tiến trình khảo sát |
| **Bottom Navigation** | Thanh điều hướng dưới màn hình |
| **Score Card** | Card hiển thị điểm số / kết quả |
| **Bar Chart Row** | Hàng biểu đồ thanh cho trang lịch sử |
| **Toggle Switch** | Nút bật/tắt cho Settings |
| **List Item** | Dòng trong danh sách |
| **Settings Row** | Hàng trong trang Settings |
| **Notification Card** | Card hiển thị thông báo |
| **Group Badge** | Nhãn nhóm / phân loại |

### Quy tắc Components

- Dùng **Auto Layout** cho tất cả — không đặt tọa độ thủ công
- Không duplicate thủ công: dùng **Instance** (Figma) hoặc **component** (code)
- Tất cả components phải có **Variants** với naming convention rõ ràng
  - Ví dụ: `Button/Primary/Default`, `Button/Primary/Pressed`, `Button/Secondary/Default`
- Mọi component phải có khả năng **tái sử dụng** ở nhiều màn hình

---

## 4. Iconography — Icon

### Thư viện icon

- Chỉ dùng **Phosphor Icons** — không mix với icon set khác
- Style: **Regular** với stroke 1.5px

### Màu mặc định của icon

| Trạng thái | Màu | Token |
|-----------|-----|-------|
| Inactive (tab bar, chưa chọn) | `#555570` | `--color-text-disabled` |
| Active (tab bar, đang chọn) | `#6C47FF` | `--color-accent-purple` |
| Trên nền tối | `#F0F0FF` | `--color-text-primary` |

### Quy tắc Icon

- Không dùng emoji thay icon
- Không mix nhiều icon library trong cùng một màn hình
- Kích thước icon phải nằm trong bội số của 4px (16px, 20px, 24px, 32px)

---

## 5. Layout & Spacing — Bố cục và khoảng cách

### Kích thước frame chuẩn

- **390 × 844px** — tương đương iPhone 14 (chuẩn thiết kế mobile hiện tại)

### Grid

- Hệ thống **8pt grid** — tất cả vị trí và kích thước phải là bội số của 8

### Spacing Scale — Thang khoảng cách

```
4px   — khoảng cách rất nhỏ (icon padding, gap nội dòng)
8px   — khoảng cách nhỏ (gap giữa icon và label)
12px  — khoảng cách vừa nhỏ (padding bên trong component nhỏ)
16px  — khoảng cách cơ bản (padding màn hình, gap card)
20px  — khoảng cách vừa
24px  — khoảng cách lớn (section gap)
32px  — khoảng cách rất lớn (giữa các block lớn)
```

### Quy tắc Spacing

- Chỉ dùng các giá trị trong thang trên
- Không dùng giá trị tùy tiện (ví dụ: 7px, 15px, 22px)
- Lý do: 8pt grid đảm bảo UI nhìn gọn gàng và nhất quán trên mọi màn hình

---

## 6. Illustration — Hình minh họa

### Phong cách

- **Flat 2D** — không đổ bóng, không gradient 3D
- **Bold stroke** — viền rõ ràng, dày

### Quy tắc Illustration

- Tất cả hình minh họa phải cùng phong cách với nhau
- Phải hiển thị tốt trên **nền tối** (dark theme)
- Không dùng ảnh chụp hoặc icon thay cho illustration

---

## 7. Theme — Chế độ giao diện

- Dùng **Figma Variables** để quản lý Dark / Light mode
- Không tạo 2 bản frame riêng cho Dark và Light — chỉ 1 frame, 2 mode
- Mọi màu sắc phải đi qua variable, không hardcode hex vào layer

---

## 8. Behance Presentation — Bản trình bày

Cấu trúc file Behance theo thứ tự sau:

| # | Section | Nội dung |
|---|---------|---------|
| 1 | **Cover** | Ảnh đại diện dự án |
| 2 | **Problem & Solution** | Vấn đề người dùng + giải pháp thiết kế |
| 3 | **Design System** | Typography, màu sắc, components |
| 4 | **User Flow** | Sơ đồ luồng người dùng qua các màn hình |
| 5 | **Screens** | Toàn bộ màn hình của app |
| 6 | **Detail zoom** | Phóng to chi tiết UI đáng chú ý |
| 7 | **Dark / Light comparison** | So sánh 2 mode cạnh nhau |

---

## 9. Validation Checklist — Danh sách kiểm tra

Trước khi nộp / present, kiểm tra toàn bộ danh sách này:

### Typography
- [ ] Đã dùng đúng font Plus Jakarta Sans và DM Mono
- [ ] Không có font size nào nhỏ hơn 10px
- [ ] Không dùng weight 300
- [ ] Tất cả chữ dùng Text Styles, không override thủ công

### Màu sắc
- [ ] Không có màu hardcode — tất cả đều dùng variable/token
- [ ] Dark mode và Light mode hoạt động đúng
- [ ] State colors áp dụng đúng với từng kết quả khảo sát

### Components
- [ ] Không có component nào bị duplicate thủ công
- [ ] Tất cả components có Variants đúng naming convention
- [ ] Auto Layout được áp dụng cho toàn bộ

### Icons
- [ ] Chỉ dùng Phosphor Icons (Regular, 1.5px stroke)
- [ ] Màu icon đúng theo từng trạng thái

### Layout & Spacing
- [ ] Tất cả spacing là bội số của 4px
- [ ] Không có giá trị spacing tùy tiện

### Illustration
- [ ] Tất cả hình cùng phong cách Flat 2D, bold stroke
- [ ] Hiển thị tốt trên nền tối

---

## Nguyên tắc cốt lõi

> **Consistency > Creativity**
>
> Thiết kế tốt không phải là thiết kế "độc đáo" — mà là thiết kế **nhất quán**.
> Người dùng học cách dùng app qua các pattern lặp đi lặp lại.
> Một ngoại lệ nhỏ về màu hay font cũng phá vỡ sự tin tưởng đó.
