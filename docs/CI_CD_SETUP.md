# Hướng Dẫn Cài Đặt CI/CD — Boot Energy

Hướng dẫn đầy đủ để cấu hình pipeline GitHub Actions + EAS Build được định nghĩa tại
`.github/workflows/eas-build.yml`.

---

## 1. Yêu Cầu Hệ Thống

| Công cụ | Phiên bản | Kiểm tra |
|---------|-----------|----------|
| Node.js | ≥ 20 | `node -v` |
| npm | ≥ 10 | `npm -v` |
| EAS CLI | ≥ 16 | `npx eas --version` |
| Tài khoản Expo | — | [expo.dev](https://expo.dev) |

---

## 2. Lấy EXPO_TOKEN (Bắt Buộc)

`EXPO_TOKEN` dùng để xác thực EAS CLI bên trong GitHub Actions.

```
1. Truy cập https://expo.dev/accounts/[your-username]/settings/access-tokens
2. Nhấn "Create Token"
3. Đặt tên: "github-actions-boot-energy"
4. Sao chép giá trị token (chỉ hiển thị một lần)
```

### Thêm vào GitHub Secrets

```
Repo → Settings → Secrets and variables → Actions → New repository secret

Name  : EXPO_TOKEN
Value : (dán token vừa sao chép)
```

> **Bảo mật**: Tuyệt đối không commit token vào repo. Token sẽ hết hiệu lực
> nếu bạn thu hồi nó trên expo.dev.

---

## 3. Liên Kết Dự Án với EAS (Chỉ Làm Một Lần)

Dự án đã có sẵn EAS project ID trong `app.json`, không cần làm thêm gì.

```bash
# Đăng nhập ở máy local (nếu chưa)
npx eas login

# Liên kết dự án (tạo/cập nhật app.json → extra.eas.projectId)
npx eas init
```

File `app.json` của bạn đã có:
```json
"extra": {
  "eas": { "projectId": "c19d7d8a-8606-45a2-b71d-2b824dfc5ae5" }
}
```
✅ Không cần làm gì thêm ở bước này.

---

## 4. Bật GitHub Actions

GitHub Actions mặc định đã được bật trên tất cả repo công khai.

Với **repo riêng tư (private)**:
```
Repo → Settings → Actions → General
→ Chọn "Allow all actions and reusable workflows"  ✅
→ Save
```

Kiểm tra workflow đã hiển thị chưa:
```
Repo → Actions → (sẽ thấy "🚀 EAS Build & Deploy")
```

---

## 5. Cấu Hình Credentials Android

EAS quản lý keystore Android cho bạn. Lần đầu build, chạy lệnh này ở máy local:

```bash
# Tạo và upload keystore lên EAS secure storage
npx eas credentials --platform android
```

Sau khi chạy một lần ở local, tất cả các lần build CI về sau sẽ tự động dùng keystore đó.

> **Quan trọng**: Keystore được lưu mã hóa trên server của Expo.
> Nên tải bản backup về qua `eas credentials` → "Download keystore".
> Giữ bản backup ở nơi an toàn — bắt buộc cần khi ký lại app sau này.

---

## 6. (Tùy Chọn) Bật Build iOS

Build iOS yêu cầu tài khoản Apple Developer (99 USD/năm).

### Bước 1 — Cấu hình credentials ở local
```bash
npx eas credentials --platform ios
# Làm theo hướng dẫn để tạo/upload certificates và provisioning profiles
```

### Bước 2 — Bật job iOS trong GitHub Actions
```
Repo → Settings → Variables → New repository variable

Name  : ENABLE_IOS_BUILD
Value : true
```

Job `eas-build-ios` sẽ tự động kích hoạt khi biến này được đặt thành `true`.

---

## 7. (Tùy Chọn) Bật Thông Báo Discord / Slack

### Discord
```
1. Trong Discord: Channel Settings → Integrations → Webhooks → New Webhook
2. Sao chép webhook URL
3. GitHub: Secrets → New secret
   Name : DISCORD_WEBHOOK_URL
   Value: https://discord.com/api/webhooks/...
4. Trong eas-build.yml, bỏ comment phần "Send Discord notification"
```

### Slack
```
1. https://api.slack.com/apps → Create App → Incoming Webhooks
2. Bật Incoming Webhooks → Add New Webhook to Workspace
3. Sao chép webhook URL
4. GitHub: Secrets → New secret
   Name : SLACK_WEBHOOK_URL
   Value: https://hooks.slack.com/services/...
5. Trong eas-build.yml, bỏ comment phần "Send Slack notification"
```

---

## 8. (Tùy Chọn) Tự Động Submit lên Play Store

Sau khi build hoạt động ổn định, bạn có thể tự động hóa bước upload lên Play Store.

### Bước 1 — Tạo Google Play API service account
```
Google Play Console → Setup → API access
→ Liên kết với Google Cloud project
→ Create service account → Cấp quyền "Release manager"
→ Tải file JSON key về máy
```

### Bước 2 — Lưu key vào EAS secret
```bash
# TUYỆT ĐỐI KHÔNG commit file JSON này lên git
npx eas secret:create \
  --scope project \
  --name GOOGLE_SERVICE_ACCOUNT_KEY_JSON \
  --type file \
  --value ./path/to/key.json
```

### Bước 3 — Bỏ comment trong eas.json
```json
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "path/to/key.json",
      "track": "internal"
    }
  }
}
```

### Bước 4 — Thêm bước submit vào workflow (sau bước build)
```yaml
- name: 🏪 Submit lên Play Store
  run: eas submit --platform android --profile production --non-interactive --latest
```

---

## 9. Bảng Tham Chiếu Build Profiles

| Profile | Output Android | Phân phối | Mục đích |
|---------|---------------|-----------|----------|
| `development` | APK (debug) | Nội bộ | Dev local với hot reload |
| `preview` | APK (release) | Nội bộ | Review PR, kiểm thử QA |
| `production` | AAB | Play Store | Phát hành chính thức |

---

## 10. Tóm Tắt Điều Kiện Kích Hoạt Pipeline

| Sự kiện | Các job chạy |
|---------|-------------|
| PR → main | validate (test + lint) + Android preview build |
| Push → main | validate + OTA update + Android production build |
| `workflow_dispatch` | validate + profile/platform do người dùng chọn |

---

## 11. Cấu Trúc Thư Mục Sau Khi Cài Đặt

```
.
├── .github/
│   └── workflows/
│       ├── test.yml           # CI với Sonar (có sẵn)
│       └── eas-build.yml      # Pipeline EAS Build (mới thêm)
├── app/                       # Màn hình Expo Router
├── components/                # UI components
├── constants/                 # Design tokens
├── docs/
│   ├── design-system.md       # Đặc tả design system
│   └── CI_CD_SETUP.md         # File này
├── app.json                   # Cấu hình Expo (đã có EAS project ID)
├── eas.json                   # Các build profiles của EAS
└── package.json               # npm scripts
```

---

## 12. Kiểm Tra Pipeline Hoạt Động

Sau khi push commit hoặc mở PR:

1. **GitHub → Actions** — xem "🚀 EAS Build & Deploy" đang chạy
2. **expo.dev → Your Project → Builds** — xem các EAS build đã được xếp hàng
3. **expo.dev → Your Project → Updates** — xem OTA updates (sau khi merge vào main)

Để kích hoạt build thủ công từ GitHub UI:
```
Actions → 🚀 EAS Build & Deploy → Run workflow
→ Chọn profile (preview/production) và platform
→ Run workflow
```

---

## 13. Xử Lý Lỗi Thường Gặp

### `EXPO_TOKEN` không hợp lệ
```bash
# Tạo lại token trên expo.dev và cập nhật GitHub secret
npx eas whoami   # kiểm tra ở local
```

### `npm ci` báo lỗi peer dependency
Flag `--legacy-peer-deps` đã được cài sẵn trong workflow.
Nếu vẫn gặp lỗi mới, kiểm tra xem có dependency nào mới được thêm mà chưa cập nhật
`package-lock.json` không:
```bash
npm install --legacy-peer-deps
git add package-lock.json && git commit -m "chore: update lockfile"
```

### EAS build thất bại (không phải lỗi workflow)
Workflow dùng `--no-wait` nên CI job vẫn pass dù EAS build sau đó fail trên server Expo.
Kiểm tra tại:
- **expo.dev → Builds** để xem log lỗi chi tiết
- Chạy thử ở local: `npx eas build --platform android --profile preview`

### Test bị treo / timeout
Jest được chạy với `--forceExit`. Nếu test vẫn bị treo ở local:
```bash
npm test -- --detectOpenHandles
```

### `eas update` thất bại
Đảm bảo `expo-updates` đã được cài và `app.json` có trường `updates.url`.
Dự án của bạn đã có cả hai. ✅
