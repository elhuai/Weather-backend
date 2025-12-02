# 天氣預報 API 服務

這是一個使用 Node.js + Express 開發的天氣預報 API 服務，串接中央氣象署（CWA）開放資料平台，提供各縣市（例如：臺北市、彰化縣、嘉義市等）36 小時天氣預報與日出/日落資料。

## 功能特色

- ✅ 串接 CWA 氣象資料開放平台
- ✅ 取得各縣市 36 小時天氣預報
- ✅ 提供指定縣市的日出 / 日落時間
- ✅ 環境變數管理
- ✅ RESTful API 設計
- ✅ CORS 支援

## 安裝步驟

### 1. 安裝相依套件

```bash
npm install
```

### 2. 設定環境變數

在專案根目錄建立 `.env` 檔案：

```bash
touch .env
```

編輯 `.env` 檔案，填入你的 CWA API Key：

```env
CWA_API_KEY=your_api_key_here
PORT=3000
NODE_ENV=development
```

### 3. 取得 CWA API Key

1. 前往 [氣象資料開放平臺](https://opendata.cwa.gov.tw/)
2. 註冊/登入帳號
3. 前往「會員專區」→「取得授權碼」
4. 複製 API 授權碼
5. 將授權碼填入 `.env` 檔案的 `CWA_API_KEY`

## 啟動服務

### 開發模式（自動重啟）

```bash
npm run dev
```

### 正式模式

```bash
npm start
```

伺服器會在 `http://localhost:3000` 啟動

## API 端點

### 1. 首頁

```
GET /
```

回應：

```json
{
  "message": "歡迎使用 CWA 天氣預報 API",
  "endpoints": {
    "kaohsiung": "/api/weather/kaohsiung",
    "health": "/api/health"
  }
}
```

### 2. 健康檢查

```
GET /api/health
```

回應：

```json
{
  "status": "OK",
  "timestamp": "2025-09-30T12:00:00.000Z"
}
```

### 3. 查詢指定縣市天氣（含日出/日落）

```
GET /api/weather?city={cityKey}
```

`cityKey` 使用英文字鍵（程式內 `cityMapping` 對應 CWA 中文縣市）：

- `taipei` → 臺北市
- `new-taipei` → 新北市
- `taichung` → 臺中市
- `tainan` → 臺南市
- `kaohsiung` → 高雄市
- `changhua` → 彰化縣
- `chiayi-city` → 嘉義市
- `chiayi-county` → 嘉義縣
- `yilan` → 宜蘭縣
…其餘請參見 `server.js` 中的 `cityMapping`。

範例請求：

```
GET /api/weather?city=changhua
GET /api/weather?city=chiayi-city
```

回應範例（僅回傳指定縣市，包含日出/日落）：

```json
{
  "success": true,
  "data": {
    "city": "彰化縣",
    "updateTime": "三十六小時天氣預報",
    "forecasts": [
      {
        "startTime": "2025-12-02 18:00:00",
        "endTime": "2025-12-03 06:00:00",
        "weather": "晴時多雲",
        "rain": "20%",
        "minTemp": "19°C",
        "maxTemp": "22°C",
        "comfort": "稍有寒意至舒適",
        "windSpeed": ""
      }
    ]
  },
  "sunTimes": {
    "date": "2025-12-02",
    "sunRiseTime": "06:24",
    "sunSetTime": "17:10"
  }
}
```

## 專案結構

```
CwaWeather-backend/
├── server.js              # Express 伺服器主檔案（包含路由與控制器邏輯）
├── .env                   # 環境變數（不納入版控）
├── .gitignore            # Git 忽略檔案
├── package.json          # 專案設定與相依套件
├── package-lock.json     # 套件版本鎖定檔案
└── README.md            # 說明文件
```

## 使用的套件

- **express**: Web 框架
- **axios**: HTTP 客戶端
- **dotenv**: 環境變數管理
- **cors**: 跨域資源共享
- **nodemon**: 開發時自動重啟（開發環境）

## 注意事項

1. 請確保已申請 CWA API Key 並正確設定在 `.env` 檔案中
2. API Key 有每日呼叫次數限制，請參考 CWA 平台說明
3. 不要將 `.env` 檔案上傳到 Git 版本控制（已包含在 `.gitignore` 中）
4. 所有路由與業務邏輯都在 `server.js` 檔案中，適合小型專案使用

## 錯誤處理

API 會回傳適當的 HTTP 狀態碼和錯誤訊息：

- `200`: 成功
- `404`: 找不到資料
- `500`: 伺服器錯誤

錯誤回應格式：

```json
{
  "error": "錯誤類型",
  "message": "錯誤訊息"
}
```

## 授權

MIT

---
# CWA Weather Forecast API Service

This is a weather forecast API service developed with Node.js + Express, integrating with the Central Weather Administration (CWA) Open Data Platform to provide weather forecast data for Kaohsiung City.

## Features

- ✅ Integration with CWA Open Data Platform
- ✅ Retrieve 36-hour weather forecast for Kaohsiung City
- ✅ Environment variable management
- ✅ RESTful API design
- ✅ CORS support

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root directory:

```bash
touch .env
```

Edit the `.env` file and add your CWA API Key:

```env
CWA_API_KEY=your_api_key_here
PORT=3000
NODE_ENV=development
```

### 3. Obtain CWA API Key

1. Visit [CWA Open Data Platform](https://opendata.cwa.gov.tw/)
2. Register/Login to your account
3. Go to "Member Center" → "Get Authorization Code"
4. Copy the API authorization code
5. Add the authorization code to `CWA_API_KEY` in the `.env` file

## Start the Service

### Development Mode (Auto-restart)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start at `http://localhost:3000`

## API Endpoints

### 1. Home

```
GET /
```

Response:

```json
{
  "message": "Welcome to CWA Weather Forecast API",
  "endpoints": {
    "kaohsiung": "/api/weather/kaohsiung",
    "health": "/api/health"
  }
}
```

### 2. Health Check

```
GET /api/health
```

Response:

```json
{
  "status": "OK",
  "timestamp": "2025-09-30T12:00:00.000Z"
}
```

### 3. Get Kaohsiung Weather Forecast

```
GET /api/weather/kaohsiung
```

Response Example:

```json
{
  "success": true,
  "data": {
    "city": "Kaohsiung City",
    "updateTime": "Data update time description",
    "forecasts": [
      {
        "startTime": "2025-09-30 18:00:00",
        "endTime": "2025-10-01 06:00:00",
        "weather": "Partly cloudy",
        "rain": "10%",
        "minTemp": "25°C",
        "maxTemp": "32°C",
        "comfort": "Muggy",
        "windSpeed": "South wind 3-4 level"
      }
    ]
  }
}
```

## Project Structure

```
CwaWeather-backend/
├── server.js              # Express server main file (includes routes and controller logic)
├── .env                   # Environment variables (not in version control)
├── .gitignore            # Git ignore file
├── package.json          # Project configuration and dependencies
├── package-lock.json     # Package version lock file
└── README.md            # Documentation
```

## Dependencies

- **express**: Web framework
- **axios**: HTTP client
- **dotenv**: Environment variable management
- **cors**: Cross-Origin Resource Sharing
- **nodemon**: Auto-restart during development (dev environment)

## Important Notes

1. Make sure you have applied for a CWA API Key and configured it correctly in the `.env` file
2. The API Key has a daily call limit, please refer to the CWA platform documentation
3. Do not upload the `.env` file to Git version control (already included in `.gitignore`)
4. All routes and business logic are in the `server.js` file, suitable for small projects

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `200`: Success
- `404`: Not found
- `500`: Server error

Error response format:

```json
{
  "error": "Error type",
  "message": "Error message"
}
```

## License

MIT
