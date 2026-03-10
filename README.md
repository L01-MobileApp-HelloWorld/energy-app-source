# HelloWorld Mobile App

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
