(() => {
  const locationEl = document.getElementById("sun-location");
  const sunriseEl = document.getElementById("sunrise-time");
  const sunsetEl = document.getElementById("sunset-time");
  const graphEl = document.getElementById("daylight-wave");
  const widgetInner = document.querySelector(".sun-widget-inner");

  if (!locationEl || !sunriseEl || !sunsetEl || !graphEl || !widgetInner) {
    return;
  }

  const STORAGE_KEY = "cutty_sun_widget_location";

  // Edit this list to your preferred locations.
  const LOCATION_OPTIONS = [
    { id: "bellingham", label: "Bellingham, WA", latitude: 48.7519, longitude: -122.4787, timeZone: "America/Los_Angeles" },
    { id: "berkeley", label: "Berkeley, CA", latitude: 37.8715, longitude: -122.2730, timeZone: "America/Los_Angeles" },
    { id: "big-sur", label: "Big Sur, CA", latitude: 36.2704, longitude: -121.8081, timeZone: "America/Los_Angeles" },
    { id: "bishop", label: "Bishop, CA", latitude: 37.3614, longitude: -118.3997, timeZone: "America/Los_Angeles" },
    { id: "slo", label: "San Luis Obispo, CA", latitude: 35.2828, longitude: -120.6596, timeZone: "America/Los_Angeles" },
    { id: "santa-barbara", label: "Santa Barbara, CA", latitude: 34.4208, longitude: -119.6982, timeZone: "America/Los_Angeles" },
    { id: "whitefish", label: "Whitefish, MT", latitude: 48.4111, longitude: -114.3376, timeZone: "America/Denver" },
    { id: "wolfeboro", label: "Wolfeboro, NH", latitude: 43.5845, longitude: -71.2151, timeZone: "America/New_York" }
  ];

  const setError = (label = "Location unavailable") => {
    locationEl.textContent = label;
    sunriseEl.textContent = "--:--";
    sunsetEl.textContent = "--:--";
  };

  const formatTime = (isoString, timeZone) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone
    }).format(date);
  };

  const dayLengthHours = (latitudeDeg, dayOfYear) => {
    const phi = (latitudeDeg * Math.PI) / 180;
    const decl = (-23.44 * Math.PI / 180) * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10));
    const x = -Math.tan(phi) * Math.tan(decl);
    if (x <= -1) return 24;
    if (x >= 1) return 0;
    return (24 / Math.PI) * Math.acos(x);
  };

  const drawDaylightWave = (latitudeDeg) => {
    const ctx = graphEl.getContext("2d");
    if (!ctx) return;

    const w = graphEl.width;
    const h = graphEl.height;
    const pad = 6;
    const baselineTop = 10;
    const baselineBottom = h - 12;
    const usableH = baselineBottom - baselineTop;

    const points = [];
    let minH = Infinity;
    let maxH = -Infinity;
    for (let d = 1; d <= 365; d += 1) {
      const val = dayLengthHours(latitudeDeg, d);
      points.push(val);
      minH = Math.min(minH, val);
      maxH = Math.max(maxH, val);
    }

    const range = Math.max(0.1, maxH - minH);
    const toY = (hours) => baselineBottom - ((hours - minH) / range) * usableH;
    const toX = (day) => pad + ((day - 1) / 364) * (w - pad * 2);

    ctx.clearRect(0, 0, w, h);

    // Wave only, no axes.
    ctx.beginPath();
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = "#cfcfcf";
    ctx.moveTo(toX(1), toY(points[0]));
    for (let d = 2; d <= 365; d += 1) {
      ctx.lineTo(toX(d), toY(points[d - 1]));
    }
    ctx.stroke();

    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now - start) / 86400000);
    const todayHours = dayLengthHours(latitudeDeg, dayOfYear);
    const dotX = toX(dayOfYear);
    const dotY = toY(todayHours);

    // Dot for where we are now.
    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.arc(dotX, dotY, 2.6, 0, Math.PI * 2);
    ctx.fill();

    // Label near dot.
    ctx.fillStyle = "#b5b5b5";
    ctx.font = "10px Arial, Helvetica, sans-serif";
    const label = `Daylight Time ${todayHours.toFixed(1)}h`;
    const tx = Math.min(w - 4 - ctx.measureText(label).width, dotX + 5);
    const ty = dotY > 16 ? dotY - 5 : dotY + 12;
    ctx.fillText(label, Math.max(4, tx), ty);
  };

  const createLocationDropdown = () => {
    const select = document.createElement("select");
    select.id = "sun-location-select";
    select.className = "sun-location-select";
    select.setAttribute("aria-label", "Select sunrise and sunset location");

    LOCATION_OPTIONS.forEach((loc) => {
      const option = document.createElement("option");
      option.value = loc.id;
      option.textContent = loc.label;
      select.appendChild(option);
    });

    const graphWrap = widgetInner.querySelector(".sun-graph-wrap");
    if (graphWrap) {
      widgetInner.insertBefore(select, graphWrap);
    } else {
      widgetInner.appendChild(select);
    }
    return select;
  };

  const fetchSunTimes = async (latitude, longitude) => {
    const sunRes = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`
    );
    const sunData = await sunRes.json();
    if (!sunData.results || !sunData.results.sunrise || !sunData.results.sunset) {
      throw new Error("Sun data unavailable");
    }
    return sunData.results;
  };

  const loadForLocation = async (locationId) => {
    try {
      const selected = LOCATION_OPTIONS.find((loc) => loc.id === locationId);
      if (!selected || typeof selected.latitude !== "number" || typeof selected.longitude !== "number") {
        throw new Error("Invalid selected location");
      }
      const chosen = {
        label: selected.label,
        latitude: selected.latitude,
        longitude: selected.longitude,
        timeZone: selected.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      locationEl.textContent = chosen.label;
      drawDaylightWave(chosen.latitude);

      const sunResults = await fetchSunTimes(chosen.latitude, chosen.longitude);
      sunriseEl.textContent = formatTime(sunResults.sunrise, chosen.timeZone);
      sunsetEl.textContent = formatTime(sunResults.sunset, chosen.timeZone);
    } catch (_err) {
      setError("Sun data unavailable");
    }
  };

  const init = async () => {
    const locationSelect = createLocationDropdown();
    const stored = localStorage.getItem(STORAGE_KEY);
    const validStored = LOCATION_OPTIONS.some((loc) => loc.id === stored) ? stored : LOCATION_OPTIONS[0].id;
    locationSelect.value = validStored;

    locationSelect.addEventListener("change", async (event) => {
      const nextId = event.target.value;
      localStorage.setItem(STORAGE_KEY, nextId);
      await loadForLocation(nextId);
    });

    await loadForLocation(validStored);
  };

  init();
})();
