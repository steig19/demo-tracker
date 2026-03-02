(async function () {
  /* =========================================================
     PHASE 1 — MAP + DATA ONLY (NO STATS)
     ========================================================= */

  // Remove hero/status card if present
  const heroEl = document.querySelector(".hero");
  if (heroEl) heroEl.remove();

  // URLs
  const trackUrl = new URL("./data/track.geojson", window.location.href).toString();
  const latestUrl = new URL("./data/latest.json", window.location.href).toString();

  // -----------------------
  // Helpers
  // -----------------------
  function fmtDate(ts) {
    try { return new Date(ts).toLocaleString(); }
    catch { return "—"; }
  }

  function computeStats(track) {
  const MI_PER_M = 0.000621371;

  // --- configuration (safe defaults for now) ---
  const MIN_DAY_MILES = 8;        // below this = Nero
  const ROLLING_DAYS = 7;

  const feats = track?.features ?? [];

  // -------------------------------
  // 1. Aggregate activities by day
  // -------------------------------
  const daysMap = new Map();
  let firstTs = null;
  let lastTs = null;

  for (const f of feats) {
    const p = f.properties || {};
    const distM = Number(p.distance_m);
    const timeS = Number(p.moving_time_s || 0);
    const start = p.start_date;

    if (!start || !Number.isFinite(distM)) continue;

    const dayKey = start.slice(0, 10); // YYYY-MM-DD
    const ts = Date.parse(dayKey);

    if (Number.isFinite(ts)) {
      if (firstTs === null || ts < firstTs) firstTs = ts;
      if (lastTs === null || ts > lastTs) lastTs = ts;
    }

    const entry = daysMap.get(dayKey) || { distM: 0, timeS: 0 };
    entry.distM += distM;
    entry.timeS += timeS;
    daysMap.set(dayKey, entry);
  }

  // -------------------------------
  // 2. Walk calendar days
  // -------------------------------
  let trailDays = 0;
  let neroDays = 0;
  let zeroDays = 0;
  let restDays = 0;

  let totalDistM = 0;
  let totalTimeS = 0;

  let longestDay = null;
  let shortestDay = null;

  const trailDayMiles = [];
  const calendarMiles = [];

  if (firstTs !== null && lastTs !== null) {
    for (let ts = firstTs; ts <= lastTs; ts += 86400000) {
      const dayKey = new Date(ts).toISOString().slice(0, 10);
      const entry = daysMap.get(dayKey);

      const distM = entry ? entry.distM : 0;
      const timeS = entry ? entry.timeS : 0;
      const miles = distM * MI_PER_M;

      if (distM === 0) {
        zeroDays++;
        restDays++;
        calendarMiles.push(0);
        continue;
      }

      if (miles < MIN_DAY_MILES) {
        neroDays++;
        calendarMiles.push(miles);
        continue;
      }

      // Trail day
      trailDays++;
      totalDistM += distM;
      totalTimeS += timeS;

      trailDayMiles.push(miles);
      calendarMiles.push(miles);

      const item = {
        miles,
        timeS,
        date: dayKey
      };

      if (!longestDay || miles > longestDay.miles) longestDay = item;
      if (!shortestDay || miles < shortestDay.miles) shortestDay = item;
    }
  }

  // -------------------------------
  // 3. Averages
  // -------------------------------
  const totalMiles = totalDistM * MI_PER_M;

  const avgMilesPerTrailDay =
    trailDays > 0 ? totalMiles / trailDays : null;

  const avgMilesPerCalendarDay =
    calendarMiles.length > 0
      ? calendarMiles.reduce((a, b) => a + b, 0) / calendarMiles.length
      : null;

  let rollingAvgMiles = null;
  if (trailDayMiles.length > 0) {
    const slice = trailDayMiles.slice(-ROLLING_DAYS);
    rollingAvgMiles = slice.reduce((a, b) => a + b, 0) / slice.length;
  }

  // -------------------------------
  // 4. Return stable object
  // -------------------------------
  return {
    totals: {
      miles: totalMiles,
      timeSeconds: totalTimeS
    },
    days: {
      trail: trailDays,
      nero: neroDays,
      zero: zeroDays,
      rest: restDays,
      calendar: calendarMiles.length
    },
    averages: {
      trailDay: avgMilesPerTrailDay,
      calendarDay: avgMilesPerCalendarDay,
      rollingTrailDay: rollingAvgMiles
    },
    extremes: {
      longestDay,
      shortestDay
    },
    timeline: {
      firstTs,
      lastTs
    }
  };
}

  function loadJson(url) {
    return fetch(url, { cache: "no-store" })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      });
  }

  function ensurePulseKeyframes() {
    if (document.getElementById("pulse-style")) return;
    const s = document.createElement("style");
    s.id = "pulse-style";
    s.textContent = `
      @keyframes pulse {
        0% { transform: scale(0.5); opacity: 0.9; }
        70% { transform: scale(1.2); opacity: 0.2; }
        100% { transform: scale(1.3); opacity: 0; }
      }
    `;
    document.head.appendChild(s);
  }

  // -----------------------
  // Map setup
  // -----------------------
  const style = {
    version: 8,
    sources: {
      sat: {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        ],
        tileSize: 256
      },
      topo: {
        type: "raster",
        tiles: [
          "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
          "https://b.tile.opentopomap.org/{z}/{x}/{y}.png",
          "https://c.tile.opentopomap.org/{z}/{x}/{y}.png"
        ],
        tileSize: 256
      }
    },
    layers: [
      { id: "sat", type: "raster", source: "sat", layout: { visibility: "visible" } },
      { id: "topo", type: "raster", source: "topo", layout: { visibility: "none" } }
    ]
  };

  const map = new maplibregl.Map({
    container: "map",
    style,
    center: [-90, 44],
    zoom: 6
  });

  map.addControl(new maplibregl.NavigationControl(), "top-right");

  // -----------------------
  // Basemap toggle
  // -----------------------
  class BasemapToggle {
    onAdd(map) {
      const btn = document.createElement("button");
      btn.textContent = "🗺️";
      btn.style.cssText = `
        width:36px;height:36px;border-radius:8px;
        border:1px solid rgba(255,255,255,.3);
        background:rgba(0,0,0,.6);color:white;
        cursor:pointer;
      `;

      btn.onclick = () => {
        const satVis = map.getLayoutProperty("sat", "visibility") !== "none";
        map.setLayoutProperty("sat", "visibility", satVis ? "none" : "visible");
        map.setLayoutProperty("topo", "visibility", satVis ? "visible" : "none");
        btn.textContent = satVis ? "🛰️" : "🗺️";
      };

      const wrap = document.createElement("div");
      wrap.className = "maplibregl-ctrl maplibregl-ctrl-group";
      wrap.appendChild(btn);
      return wrap;
    }
    onRemove() {}
  }

  map.addControl(new BasemapToggle(), "top-right");

  // -----------------------
  // Marker
  // -----------------------
  let marker;

  function createBlinkMarker() {
    ensurePulseKeyframes();
    const el = document.createElement("div");
    el.style.width = "14px";
    el.style.height = "14px";
    el.style.borderRadius = "50%";
    el.style.background = "#2bff88";
    el.style.position = "relative";
    el.style.boxShadow = "0 0 20px rgba(0,0,0,.5)";

    const ring = document.createElement("div");
    ring.style.cssText = `
      position:absolute;
      left:-10px;top:-10px;
      width:34px;height:34px;
      border-radius:50%;
      border:2px solid rgba(43,255,136,.6);
      animation:pulse 1.6s ease-out infinite;
    `;
    el.appendChild(ring);
    return el;
  }

  // -----------------------
  // Popups
  // -----------------------
  let popup;

  function popupHTML(props) {
    return `
      <strong>${props.name || "Activity"}</strong><br/>
      ${fmtDate(props.start_date)}<br/>
      ${(props.distance_m / 1609.34).toFixed(1)} mi
    `;
  }

  // -----------------------
  // Load + render
  // -----------------------
  async function refresh() {
    try {
      const [track, latest] = await Promise.all([
        loadJson(trackUrl),
        loadJson(latestUrl)
      ]);

      if (!map.getSource("track")) {
        map.addSource("track", { type: "geojson", data: track });

        const colorExpr = [
          "case",
          ["==", ["%", ["to-number", ["get", "i"]], 2], 0],
          "#46f3ff",
          "#ff4bd8"
        ];

        map.addLayer({
          id: "track-glow",
          type: "line",
          source: "track",
          paint: {
            "line-color": colorExpr,
            "line-width": 12,
            "line-opacity": 0.25,
            "line-blur": 6
          }
        });

        map.addLayer({
          id: "track-main",
          type: "line",
          source: "track",
          paint: {
            "line-color": colorExpr,
            "line-width": 5,
            "line-opacity": 0.9
          }
        });

        map.on("click", "track-main", e => {
          const f = e.features && e.features[0];
          if (!f) return;

          popup?.remove();
          popup = new maplibregl.Popup({ closeButton: true })
            .setLngLat(e.lngLat)
            .setHTML(popupHTML(f.properties || {}))
            .addTo(map);
        });
      } else {
        map.getSource("track").setData(track);
        console.log("STATS", computeStats(track));
      }

      if (latest && Number.isFinite(latest.lat) && Number.isFinite(latest.lon)) {
        const lngLat = [latest.lon, latest.lat];
        if (!marker) {
          marker = new maplibregl.Marker({ element: createBlinkMarker() })
            .setLngLat(lngLat)
            .addTo(map);
        } else {
          marker.setLngLat(lngLat);
        }
      }

    } catch (err) {
      console.error("Map refresh failed:", err);
    }
  }

  map.on("load", () => {
    refresh();
    setInterval(refresh, 60_000);
  });

})();
