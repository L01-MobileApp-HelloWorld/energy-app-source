# Energy Mobile App

[![GitHub Actions](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Test%20and%20Coverage/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=YOUR_PROJECT_KEY&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=YOUR_PROJECT_KEY)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=YOUR_PROJECT_KEY&metric=coverage)](https://sonarcloud.io/summary/new_code?id=YOUR_PROJECT_KEY)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=YOUR_PROJECT_KEY&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=YOUR_PROJECT_KEY)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=YOUR_PROJECT_KEY&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=YOUR_PROJECT_KEY)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=YOUR_PROJECT_KEY&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=YOUR_PROJECT_KEY)

Ứng dụng giúp người dùng phân biệt giữa **mệt mỏi thật sự** và **trì hoãn công việc**.

Ứng dụng nằm trong khuôn khổ BTL môn phát triển ứng dụng cho thiết bị di động của trường ĐH Bách Khoa TPHCM

## Techstack

- **React Native** + **Expo**
- **Gluestack** for building UI (https://gluestack.io/ui/docs/home/overview/quick-start)

## Requirement

- **Node >= 20**
- **Android SDK 35**
- **NPM** (không dùng yarn)

## Setup

### 1. Đảm bảo đã cài android studio và android SDK 35, chạy 1 máy ảo

[Expo Environment Setup Guide](https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=simulated)

### 2. Run command

```
npm install
```

```
npx expo start // sau đó nhấn a (open Android)
```

### 3. Cách sử dụng 1 component trong Gluestack

1. Cài đặt component thông qua CLI

- `npx gluestack-ui add heading`

2. Import và sử dụng

```
import { Heading } from '@/components/ui/heading';

function Example() {
  return <Heading>I am a Heading</Heading>;
}
```

## Testing

### Run Tests Locally

Để chạy test locally, thực hiện các lệnh sau:

```bash
# Cài đặt dependencies
npm install

# Chạy tất cả tests
npm test

# Chạy tests với coverage
npm run test:coverage

# Chạy tests ở chế độ watch
npm run test:watch

# Chạy tests cho CI/CD
npm run test:ci
```

### Test Coverage

Dự án được cấu hình để đạt coverage tối thiểu **70%** trên tất cả các metrics:
- **Lines**: ≥ 70%
- **Statements**: ≥ 70% 
- **Functions**: ≥ 70%
- **Branches**: ≥ 70%

### Test Files

#### OnboardingScreen.test.tsx
Bao gồm các test cases:
- ✅ Render correctly with initial slide
- ✅ Show correct button text on last slide
- ✅ Navigate to main app when next is pressed on last slide
- ✅ Navigate to main app when skip is pressed
- ✅ Hide skip button on last slide
- ✅ Render all slides with correct content
- ✅ Does not crash when rendered

#### HomeScreen.test.tsx
Bao gồm các test cases:
- ✅ Render correctly
- ✅ Display user greeting and current time
- ✅ Show previous result card with correct content
- ✅ Display menu items correctly
- ✅ Handle button press without crashing
- ✅ Does not crash when rendered
- ✅ Render with correct background color

### SonarCloud Integration

Dự án được tích hợp với SonarCloud để theo dõi chất lượng code:

- **Coverage**: Báo cáo coverage tự động được upload
- **Code Smells**: Phát hiện và theo dõi code có thể cải thiện
- **Security**: Phát hiện các lỗ hổng bảo mật tiềm ẩn
- **Maintainability**: Đánh giá khả năng bảo trì code

### GitHub Actions

Workflow `test.yml` tự động chạy khi:
- Push code lên branch `main`, `master`, hoặc `develop`
- Tạo Pull Request
- Chạy manual thông qua GitHub UI

**Artifacts được tạo:**
- `test-report`: Chứa file `index.html` với báo cáo coverage chi tiết
- Coverage data được upload lên SonarCloud

### Setup SonarCloud (Cho maintainer)

1. Tạo project trên [SonarCloud](https://sonarcloud.io)
2. Cập nhật `sonar-project.properties`:
   ```properties
   sonar.organization=YOUR_ORG_KEY
   sonar.projectKey=YOUR_PROJECT_KEY
   ```
3. Thêm secrets vào GitHub repository:
   - `SONAR_TOKEN`: Token từ SonarCloud
   - `SONAR_PROJECT_KEY`: Project key
   - `SONAR_ORGANIZATION`: Organization key
4. Cập nhật badges trong README với đúng project key
