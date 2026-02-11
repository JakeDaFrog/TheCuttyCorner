(() => {
  const canvas = document.getElementById("moon-canvas");
  const phaseNameEl = document.getElementById("moon-phase-name");
  const illuminationEl = document.getElementById("moon-illumination");
  const ageEl = document.getElementById("moon-age");
  const nextFullMoonEl = document.getElementById("next-full-moon");

  if (!canvas || !phaseNameEl || !illuminationEl || !ageEl || !nextFullMoonEl) {
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const synodicMonth = 29.53058867;
  const knownNewMoonUtc = Date.UTC(2000, 0, 6, 18, 14, 0);
  const now = Date.now();
  const ageDays = (((now - knownNewMoonUtc) / 86400000) % synodicMonth + synodicMonth) % synodicMonth;
  const phase = ageDays / synodicMonth;
  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2;

  const getPhaseName = (phaseValue) => {
    if (phaseValue < 0.03 || phaseValue >= 0.97) return "New Moon";
    if (phaseValue < 0.22) return "Waxing Crescent";
    if (phaseValue < 0.28) return "First Quarter";
    if (phaseValue < 0.47) return "Waxing Gibbous";
    if (phaseValue < 0.53) return "Full Moon";
    if (phaseValue < 0.72) return "Waning Gibbous";
    if (phaseValue < 0.78) return "Last Quarter";
    return "Waning Crescent";
  };

  const getNextFullMoonDate = (fromDate) => {
    // Reference full moon: January 21, 2000 at 04:40 UTC.
    const refFullMoonUtc = Date.UTC(2000, 0, 21, 4, 40, 0);
    const synodicMonthMs = synodicMonth * 86400000;
    const elapsed = fromDate.getTime() - refFullMoonUtc;
    const cycles = Math.ceil(elapsed / synodicMonthMs);
    const nextFullMoonMs = refFullMoonUtc + cycles * synodicMonthMs;
    return new Date(nextFullMoonMs);
  };

  const formatDateTime24 = (dateObj, timeZone) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone
    }).format(dateObj);
  };

  const createMoonTexture = (size) => {
    const textureCanvas = document.createElement("canvas");
    textureCanvas.width = size;
    textureCanvas.height = size;
    const tctx = textureCanvas.getContext("2d");

    if (!tctx) {
      return null;
    }

    const c = size / 2;
    const r = Math.floor(size * 0.43);
    tctx.clearRect(0, 0, size, size);
    tctx.save();
    tctx.beginPath();
    tctx.arc(c, c, r, 0, Math.PI * 2);
    tctx.clip();

    const base = tctx.createRadialGradient(c - r * 0.35, c - r * 0.35, r * 0.2, c, c, r);
    base.addColorStop(0, "#f2f2f2");
    base.addColorStop(0.55, "#c8c8c8");
    base.addColorStop(1, "#8f8f8f");
    tctx.fillStyle = base;
    tctx.fillRect(0, 0, size, size);

    // Add deterministic crater-like patches for a basic moon texture.
    const craters = [
      [0.28, 0.30, 0.16, 0.25], [0.62, 0.25, 0.18, 0.22], [0.72, 0.52, 0.22, 0.28],
      [0.34, 0.60, 0.20, 0.24], [0.50, 0.46, 0.14, 0.18], [0.18, 0.54, 0.15, 0.22],
      [0.56, 0.72, 0.19, 0.20], [0.76, 0.72, 0.13, 0.25], [0.40, 0.18, 0.10, 0.20]
    ];
    for (const [px, py, pr, alpha] of craters) {
      const x = c + (px - 0.5) * (r * 2);
      const y = c + (py - 0.5) * (r * 2);
      const rr = pr * r;
      const g = tctx.createRadialGradient(x - rr * 0.35, y - rr * 0.35, rr * 0.15, x, y, rr);
      g.addColorStop(0, `rgba(250,250,250,${(alpha * 0.35).toFixed(2)})`);
      g.addColorStop(1, `rgba(30,30,30,${alpha.toFixed(2)})`);
      tctx.fillStyle = g;
      tctx.beginPath();
      tctx.arc(x, y, rr, 0, Math.PI * 2);
      tctx.fill();
    }

    tctx.restore();
    return textureCanvas;
  };

  const drawMoon = (phaseValue, textureCanvas) => {
    const cx = 28;
    const cy = 28;
    const r = 24;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw moon texture clipped to a circle.
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    if (textureCanvas) {
      ctx.drawImage(textureCanvas, cx - r, cy - r, r * 2, r * 2);
    }

    // Apply physically-based phase shading so crescents are convex and correctly sided.
    const theta = 2 * Math.PI * phaseValue; // new:0, first quarter:0.25, full:0.5
    const sx = Math.sin(theta);
    const sz = -Math.cos(theta);

    for (let y = -r; y <= r; y += 1) {
      for (let x = -r; x <= r; x += 1) {
        const nx = x / r;
        const ny = y / r;
        const rr = nx * nx + ny * ny;

        if (rr > 1) {
          continue;
        }

        const nz = Math.sqrt(1 - rr);
        const lit = nx * sx + nz * sz;

        // Stronger contrast so phase overlay remains obvious at small size.
        const darkness = lit > 0 ? 0.04 : Math.min(0.90, 0.38 + (-lit) * 0.72);
        ctx.fillStyle = `rgba(0, 0, 0, ${darkness.toFixed(3)})`;
        ctx.fillRect(cx + x, cy + y, 1, 1);
      }
    }

    ctx.restore();

    // Rim for contrast.
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#a5a5a5";
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  phaseNameEl.textContent = getPhaseName(phase);
  illuminationEl.textContent = Math.round(illumination * 100).toString();
  ageEl.textContent = ageDays.toFixed(1);
  nextFullMoonEl.textContent = formatDateTime24(
    getNextFullMoonDate(new Date()),
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  drawMoon(phase, createMoonTexture(56));
})();
