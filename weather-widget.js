(() => {
  const locationEl = document.getElementById("weather-location");
  const tempEl = document.getElementById("weather-temp");
  const highLowEl = document.getElementById("weather-high-low");
  const windEl = document.getElementById("weather-wind");
  const conditionsEl = document.getElementById("weather-conditions");

  if (!locationEl || !tempEl || !highLowEl || !windEl || !conditionsEl) {
    return;
  }

  const STORAGE_KEY = "cutty_sun_widget_location";
  const LOCATION_OPTIONS = [
    { id: "bellingham", label: "Bellingham, WA", latitude: 48.7519, longitude: -122.4787 },
    { id: "berkeley", label: "Berkeley, CA", latitude: 37.8715, longitude: -122.2730 },
    { id: "big-sur", label: "Big Sur, CA", latitude: 36.2704, longitude: -121.8081 },
    { id: "bishop", label: "Bishop, CA", latitude: 37.3614, longitude: -118.3997 },
    { id: "slo", label: "San Luis Obispo, CA", latitude: 35.2828, longitude: -120.6596 },
    { id: "santa-barbara", label: "Santa Barbara, CA", latitude: 34.4208, longitude: -119.6982 },
    { id: "whitefish", label: "Whitefish, MT", latitude: 48.4111, longitude: -114.3376 },
    { id: "wolfeboro", label: "Wolfeboro, NH", latitude: 43.5845, longitude: -71.2151 }
  ];

  const weatherCodeMap = {
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Freezing drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Freezing rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy showers",
    85: "Snow showers",
    86: "Snow showers",
    95: "Thunderstorm",
    96: "T-storm + hail",
    99: "T-storm + hail"
  };

  const setUnavailable = () => {
    tempEl.textContent = "--";
    highLowEl.textContent = "-- / --";
    windEl.textContent = "--";
    conditionsEl.textContent = "Unavailable";
  };

  const fmtF = (val) => `${Math.round(val)}F`;
  const fmtMph = (val) => `${Math.round(val)} mph`;

  const createWeatherDropdown = () => {
    const select = document.createElement("select");
    select.id = "weather-location-select";
    select.className = "weather-location-select";
    select.setAttribute("aria-label", "Select weather location");

    LOCATION_OPTIONS.forEach((loc) => {
      const option = document.createElement("option");
      option.value = loc.id;
      option.textContent = loc.label;
      select.appendChild(option);
    });

    locationEl.insertAdjacentElement("afterend", select);
    return select;
  };

  const fetchWeather = async (latitude, longitude) => {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,weather_code,wind_speed_10m` +
      `&daily=temperature_2m_max,temperature_2m_min` +
      `&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Weather request failed");
    }
    const data = await res.json();
    if (!data.current || !data.daily || !data.daily.temperature_2m_max || !data.daily.temperature_2m_min) {
      throw new Error("Weather data unavailable");
    }
    return data;
  };

  const loadForLocation = async (locationId) => {
    const selected = LOCATION_OPTIONS.find((loc) => loc.id === locationId) || LOCATION_OPTIONS[0];
    if (!selected) {
      setUnavailable();
      return;
    }

    locationEl.textContent = selected.label;

    try {
      const data = await fetchWeather(selected.latitude, selected.longitude);
      const nowTemp = data.current.temperature_2m;
      const wind = data.current.wind_speed_10m;
      const code = data.current.weather_code;
      const high = data.daily.temperature_2m_max[0];
      const low = data.daily.temperature_2m_min[0];

      tempEl.textContent = fmtF(nowTemp);
      highLowEl.textContent = `${fmtF(high)} / ${fmtF(low)}`;
      windEl.textContent = fmtMph(wind);
      conditionsEl.textContent = weatherCodeMap[code] || "Unknown";
    } catch (_err) {
      setUnavailable();
    }
  };

  const init = async () => {
    const weatherSelect = createWeatherDropdown();
    const saved = localStorage.getItem(STORAGE_KEY);
    const validSaved = LOCATION_OPTIONS.some((loc) => loc.id === saved) ? saved : LOCATION_OPTIONS[0].id;
    weatherSelect.value = validSaved;
    await loadForLocation(validSaved);

    const select = document.getElementById("sun-location-select");
    if (select) {
      select.addEventListener("change", (event) => {
        const nextId = event.target.value;
        weatherSelect.value = nextId;
        loadForLocation(nextId);
      });
    }

    weatherSelect.addEventListener("change", (event) => {
      const nextId = event.target.value;
      localStorage.setItem(STORAGE_KEY, nextId);
      const sunSelect = document.getElementById("sun-location-select");
      if (sunSelect) {
        sunSelect.value = nextId;
        sunSelect.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        loadForLocation(nextId);
      }
    });

    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY) {
        const nextId = LOCATION_OPTIONS.some((loc) => loc.id === event.newValue) ? event.newValue : LOCATION_OPTIONS[0].id;
        weatherSelect.value = nextId;
        loadForLocation(nextId);
      }
    });

    setInterval(() => {
      const latest = localStorage.getItem(STORAGE_KEY);
      loadForLocation(latest);
    }, 30 * 60 * 1000);
  };

  init();
})();
