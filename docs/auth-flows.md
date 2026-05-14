# Mobile Auth Integration Guide

Tài liệu này mô tả chính xác auth flow của backend hiện tại để app React Native tích hợp đúng.

## Base URL

Local:

```text
http://localhost:3000/api
```

Ví dụ auth endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/profile`

URL đầy đủ local:

```text
http://localhost:3000/api/auth/...
```

## Auth Model

Backend dùng 2 token:

- `token`: access token JWT, gửi trong header `Authorization`
- `refreshToken`: token dùng để xin access token mới

Access token có hạn sống theo `JWT_EXPIRES_IN` của backend, mặc định là `30d`.

Refresh token được backend lưu bản băm trong database và bị thu hồi khi:

- user logout
- refresh token bị thay mới bởi endpoint refresh

Điều này có nghĩa là refresh token hiện tại là loại xoay vòng:

- mỗi lần gọi `POST /auth/refresh` thành công
- backend trả về `token` mới và `refreshToken` mới
- app phải ghi đè refresh token cũ bằng refresh token mới

Nếu app tiếp tục dùng refresh token cũ, backend sẽ trả `401`.

## Register

Endpoint:

```http
POST /auth/register
Content-Type: application/json
```

Body:

```json
{
  "username": "huynguyen",
  "email": "huynguyen@hcmut.edu.vn",
  "password": "Password1",
  "displayName": "Huy Nguyen"
}
```

Response thành công:

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "6642...",
      "username": "huynguyen",
      "email": "huynguyen@hcmut.edu.vn",
      "displayName": "Huy Nguyen"
    },
    "token": "access-token",
    "refreshToken": "refresh-token"
  }
}
```

Lưu ý:

- `username`: 3-30 ký tự
- `email`: đúng định dạng email
- `password`: backend hiện yêu cầu tối thiểu 6 ký tự ở model
- `displayName`: optional

## Login

Endpoint:

```http
POST /auth/login
Content-Type: application/json
```

Body:

```json
{
  "email": "huynguyen@hcmut.edu.vn",
  "password": "Password1"
}
```

Response thành công:

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "6642...",
      "username": "huynguyen",
      "email": "huynguyen@hcmut.edu.vn",
      "displayName": "Huy Nguyen"
    },
    "token": "access-token",
    "refreshToken": "refresh-token"
  }
}
```

Sau login thành công:

- lưu `token`
- lưu `refreshToken`
- lưu `user` nếu app cần state local

## Gọi API có auth

Mọi request protected phải gửi:

```http
Authorization: Bearer <token>
```

Ví dụ:

```http
GET /auth/profile
Authorization: Bearer <token>
```

## Refresh Token

Endpoint:

```http
POST /auth/refresh
Content-Type: application/json
```

Body:

```json
{
  "refreshToken": "current-refresh-token"
}
```

Response thành công:

```json
{
  "success": true,
  "data": {
    "token": "new-access-token",
    "refreshToken": "new-refresh-token"
  }
}
```

Quy tắc rất quan trọng:

- luôn thay `token` cũ bằng `token` mới
- luôn thay `refreshToken` cũ bằng `refreshToken` mới
- không tái sử dụng refresh token cũ sau khi refresh thành công

Nếu refresh token không hợp lệ hoặc đã hết hạn, backend trả:

```json
{
  "success": false,
  "message": "Refresh token không hợp lệ hoặc đã hết hạn"
}
```

HTTP status:

```text
401
```

## Logout

Endpoint:

```http
POST /auth/logout
Content-Type: application/json
```

Body:

```json
{
  "refreshToken": "current-refresh-token"
}
```

Response thành công:

```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

Sau logout:

- backend thu hồi refresh token hiện tại
- app phải xóa `token`
- app phải xóa `refreshToken`
- app phải xóa auth state local

## Client Flow Recommended For React Native

Đây là flow nên dùng.

### App start

Khi app mở:

1. đọc `token` và `refreshToken` từ secure storage
2. nếu không có token hoặc refresh token:
   chuyển user về màn hình login
3. nếu có token:
   cho phép app hoạt động bình thường
4. không cần gọi refresh ngay mỗi lần mở app

Khuyến nghị:

- đơn giản nhất là chỉ refresh khi gặp `401`
- không refresh vô điều kiện mỗi lần app mở

### Normal request flow

1. gửi request với access token
2. nếu response khác `401`, xử lý bình thường
3. nếu response là `401`, thử refresh token
4. nếu refresh thành công, retry request cũ đúng 1 lần
5. nếu refresh thất bại, xóa session và đưa user về login

### Refresh-on-401 flow

Pseudo-code:

```ts
async function authorizedRequest(makeRequest: (token: string) => Promise<Response>) {
  const accessToken = await getAccessToken();
  const firstResponse = await makeRequest(accessToken);

  if (firstResponse.status !== 401) {
    return firstResponse;
  }

  const currentRefreshToken = await getRefreshToken();
  if (!currentRefreshToken) {
    await clearSession();
    throw new Error('Missing refresh token');
  }

  const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refreshToken: currentRefreshToken,
    }),
  });

  if (!refreshResponse.ok) {
    await clearSession();
    throw new Error('Session expired');
  }

  const refreshData = await refreshResponse.json();

  await saveAccessToken(refreshData.data.token);
  await saveRefreshToken(refreshData.data.refreshToken);

  return makeRequest(refreshData.data.token);
}
```

### Logout flow

1. đọc `refreshToken` hiện tại
2. gọi `POST /auth/logout`
3. dù request logout fail hay success, vẫn xóa token local nếu mục tiêu là sign out khỏi app

Pseudo-code:

```ts
async function logout() {
  const refreshToken = await getRefreshToken();

  if (refreshToken) {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      // ignore network errors here
    }
  }

  await clearSession();
}
```

## Storage Recommendation For React Native

Không nên lưu token trong AsyncStorage nếu app có yêu cầu bảo mật nghiêm túc.

Khuyến nghị:

- iOS/Android secure storage
- ví dụ `react-native-keychain` hoặc `expo-secure-store`

Nên lưu:

- `accessToken`
- `refreshToken`
- `user` nếu cần hydrate UI nhanh

## Error Handling Rules For AI Or Client Code

AI hoặc code client cần tuân thủ các rule này:

- luôn gọi protected APIs với `Authorization: Bearer <token>`
- không gọi `/auth/refresh` trước mọi request
- chỉ refresh khi access token fail `401`, hoặc khi app chủ động biết token đã hết hạn
- sau refresh thành công phải cập nhật cả `token` lẫn `refreshToken`
- nếu refresh fail `401`, coi như session hết hạn và chuyển user về login
- logout phải gửi `refreshToken`
- logout xong phải xóa session local

## Minimal Type Shape

```ts
type AuthUser = {
  _id: string;
  username: string;
  email: string;
  displayName?: string;
};

type AuthSuccessResponse = {
  success: true;
  data: {
    user?: AuthUser;
    token: string;
    refreshToken: string;
  };
};
```

## One Important Backend Note

Backend hiện tại không có session server-side theo kiểu cookie.

Nghĩa là:

- app mobile phải tự lưu token
- app mobile phải tự gắn header Authorization
- app mobile phải tự điều phối refresh flow

