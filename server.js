require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// CWA API 設定
const CWA_API_BASE_URL = "https://opendata.cwa.gov.tw/api";
const CWA_API_KEY = process.env.CWA_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 城市名稱對應（英 → 中），用於查詢 CWA 所需的中文地名
const cityMapping = {
  "taipei": "臺北市",
  "new-taipei": "新北市",
  "taoyuan": "桃園市",
  "taichung": "臺中市",
  "tainan": "臺南市",
  "kaohsiung": "高雄市",
  "keelung": "基隆市",
  "hsinchu-city": "新竹市",
  "hsinchu-county": "新竹縣",
  "miaoli": "苗栗縣",
  "changhua": "彰化縣",
  "nantou": "南投縣",
  "yunlin": "雲林縣",
  "chiayi-city": "嘉義市",
  "chiayi-county": "嘉義縣",
  "pingtung": "屏東縣",
  "yilan": "宜蘭縣",
  "hualien": "花蓮縣",
  "taitung": "臺東縣",
  "penghu": "澎湖縣",
  "kinmen": "金門縣",
  "lienchiang": "連江縣",
};
/**
 * 取得各城市 36 小時天氣預報
 * 透過 query 參數 ?city= 對應 cityMapping 英文鍵，轉成中文查詢 CWA
 */
// 抽取：取得天氣資料（回傳物件，不直接回應）
const fetchWeatherData = async (locationName) => {
  const response = await axios.get(
    `${CWA_API_BASE_URL}/v1/rest/datastore/F-C0032-001`,
    {
      params: {
        Authorization: CWA_API_KEY,
        locationName: locationName,
      },
    }
  );

  const allLocations = response.data.records.location || [];
  const locationData = allLocations.find((loc) => loc.locationName === locationName);
  if (!locationData) {
    const err = new Error(`無法取得${locationName}天氣資料`);
    err.status = 404;
    throw err;
  }

  const weatherData = {
    city: locationData.locationName,
    updateTime: response.data.records.datasetDescription,
    forecasts: [],
  };

  const weatherElements = locationData.weatherElement;
  const timeCount = weatherElements[0].time.length;

  for (let i = 0; i < timeCount; i++) {
    const forecast = {
      startTime: weatherElements[0].time[i].startTime,
      endTime: weatherElements[0].time[i].endTime,
      weather: "",
      rain: "",
      minTemp: "",
      maxTemp: "",
      comfort: "",
      windSpeed: "",
    };

    weatherElements.forEach((element) => {
      const value = element.time[i].parameter;
      switch (element.elementName) {
        case "Wx":
          forecast.weather = value.parameterName;
          break;
        case "PoP":
          forecast.rain = value.parameterName + "%";
          break;
        case "MinT":
          forecast.minTemp = value.parameterName + "°C";
          break;
        case "MaxT":
          forecast.maxTemp = value.parameterName + "°C";
          break;
        case "CI":
          forecast.comfort = value.parameterName;
          break;
        case "WS":
          forecast.windSpeed = value.parameterName;
          break;
      }
    });

    weatherData.forecasts.push(forecast);
  }

  return weatherData;
};

// 取得日出日落資料（僅回傳 SunRiseTime 與 SunSetTime）
const fetchSunRiseSet = async (locationName) => {
  const response = await axios.get(
    `${CWA_API_BASE_URL}/v1/rest/datastore/A-B0062-001`,
    {
      params: {
        Authorization: CWA_API_KEY,
        CountyName: locationName,
      },
    }
  );

  const locations = response.data?.records?.locations?.location || [];
  const match = locations.find((loc) => loc.CountyName === locationName);
  const firstTime = match?.time?.[0];
  if (!firstTime) {
    const err = new Error(`無法取得${locationName}日出日落資料`);
    err.status = 404;
    throw err;
  }
  return {
    date: firstTime.Date,
    sunRiseTime: firstTime.SunRiseTime,
    sunSetTime: firstTime.SunSetTime,
  };
};

// 單純回傳天氣資料的端點
const getWeather = async (req, res) => {
  const { city } = req.query;
  const locationName = cityMapping[city] || city;
  try {
    if (!CWA_API_KEY) {
      return res.status(500).json({
        error: "伺服器設定錯誤",
        message: "請在 .env 檔案中設定 CWA_API_KEY",
      });
    }
    const weatherData = await fetchWeatherData(locationName);
    res.json({ success: true, data: weatherData });
  } catch (error) {
    const status = error.status || (error.response?.status) || 500;
    const message = error.message || (error.response?.data?.message) || "無法取得天氣資料";
    res.status(status).json({ error: status === 500 ? "伺服器錯誤" : "查無資料", message });
  }
};

// 合併：同時回傳天氣 + 日出日落資料
const getWeatherWithSun = async (req, res) => {
  const { city } = req.query;
  const locationName = cityMapping[city] || city;
  try {
    if (!CWA_API_KEY) {
      return res.status(500).json({
        error: "伺服器設定錯誤",
        message: "請在 .env 檔案中設定 CWA_API_KEY",
      });
    }
    const [weatherData, sunTimes] = await Promise.all([
      fetchWeatherData(locationName),
      fetchSunRiseSet(locationName),
    ]);
    res.json({ success: true, data: weatherData, sunTimes });
  } catch (error) {
    const status = error.status || (error.response?.status) || 500;
    const message = error.message || (error.response?.data?.message) || "無法取得資料";
    res.status(status).json({ error: status === 500 ? "伺服器錯誤" : "查無資料", message });
  }
};


// Routes
app.get("/", (req, res) => {
  res.json({
    message: "歡迎使用 CWA 天氣預報 API",
    endpoints: {
      weatherAndSunTimes: "/api/weather?city=you_choose_city",
      health: "/api/health",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 取得天氣 + 日出日落（支援 city 查詢參數，例如: ?city=chiayi-city）
app.get("/api/weather", (req, res) => {
  if (!req.query.city) {
    // 預設城市可設為 taipei 或其他
    req.query.city = "taipei";
  }
  getWeatherWithSun(req, res);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "伺服器錯誤",
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "找不到此路徑",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 伺服器運行已運作`);
  console.log(`📍 環境: ${process.env.NODE_ENV || "development"}`);
});
