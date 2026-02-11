(() => {
  const locationEl = document.getElementById("sun-location");
  const sunriseEl = document.getElementById("sunrise-time");
  const sunsetEl = document.getElementById("sunset-time");
  const graphEl = document.getElementById("daylight-wave");

  if (!locationEl || !sunriseEl || !sunsetEl || !graphEl) {
    return;
  }

  const setError = () => {
    locationEl.textContent = "Location unavailable";
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

  const loadSunWidget = async () => {
    try {
      const geoRes = await fetch("https://ipwho.is/");
      const geo = await geoRes.json();

      if (!geo.success || !geo.latitude || !geo.longitude) {
        setError();
        return;
      }

      const city = geo.city || "Approximate location";
      const region = geo.region || "";
      locationEl.textContent = region ? `${city}, ${region}` : city;
      drawDaylightWave(Number(geo.latitude));

      const sunRes = await fetch(
        `https://api.sunrise-sunset.org/json?lat=${geo.latitude}&lng=${geo.longitude}&formatted=0`
      );
      const sunData = await sunRes.json();

      if (!sunData.results || !sunData.results.sunrise || !sunData.results.sunset) {
        setError();
        return;
      }

      const tz = geo.timezone && geo.timezone.id ? geo.timezone.id : Intl.DateTimeFormat().resolvedOptions().timeZone;
      sunriseEl.textContent = formatTime(sunData.results.sunrise, tz);
      sunsetEl.textContent = formatTime(sunData.results.sunset, tz);
    } catch (_err) {
      setError();
    }
  };

  loadSunWidget();
})();
