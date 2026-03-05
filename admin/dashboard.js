// Element references

const configTrailIdEl = document.getElementById('config-trail-id');
const configTrailNameEl = document.getElementById('config-trail-name');
const configLengthMilesEl = document.getElementById('config-length-miles');
const configStartDateEl = document.getElementById('config-start-date');
const configEndDateEl = document.getElementById('config-end-date');

const configMinDayMilesEl = document.getElementById('config-min-day-miles');
const configRollingAvgDaysEl = document.getElementById('config-rolling-avg-days');
const configIncludeNeroEl = document.getElementById('config-include-nero');
const configIncludeZeroEl = document.getElementById('config-include-zero');

const generateConfigBtn = document.getElementById('generate-config-btn');
const loadConfigBtn = document.getElementById('load-config-btn');
const configOutput = document.getElementById('config-output');

// Trail Config
function buildTrailConfig() {

  const configObject = {
    trailId: configTrailIdEl.value.trim(),
    name: configTrailNameEl.value.trim(),
    lengthMiles: parseInt(configLengthMilesEl.value),

    startDate: configStartDateEl.value,
    endDate: configEndDateEl.value || null,

    units: "imperial",

    stats: {
      minDayMiles: parseInt(configMinDayMilesEl.value),
      rollingAvgDays: parseInt(configRollingAvgDaysEl.value),
      includeNeroInCalendarAvg: configIncludeNeroEl.checked,
      includeZeroDaysInCalendarAvg: configIncludeZeroEl.checked
    }
  };

  if (!configObject.trailId || !configObject.name || !configObject.lengthMiles) {
    alert("Please complete Trail ID, Name, and Length.");
    return null;
  }

  return JSON.stringify(configObject, null, 2);
}

function handleGenerateConfig() {

  const configJson = buildTrailConfig();
  if (!configJson) return;

  configOutput.hidden = false;
  configOutput.value = configJson;

  downloadFile("trail.json", configJson);
}

generateConfigBtn.addEventListener('click', handleGenerateConfig);

async function loadExistingConfig() {

  try {

    const response = await fetch('../data/trail.json');

    if (!response.ok) {
      alert("No existing trail.json found.");
      return;
    }

    const config = await response.json();

    configTrailIdEl.value = config.trailId || "";
    configTrailNameEl.value = config.name || "";
    configLengthMilesEl.value = config.lengthMiles || "";

    configStartDateEl.value = config.startDate || "";
    configEndDateEl.value = config.endDate || "";

    if (config.stats) {
      configMinDayMilesEl.value = config.stats.minDayMiles || "";
      configRollingAvgDaysEl.value = config.stats.rollingAvgDays || "";
      configIncludeNeroEl.checked = config.stats.includeNeroInCalendarAvg || false;
      configIncludeZeroEl.checked = config.stats.includeZeroDaysInCalendarAvg || false;
    }

  } catch (err) {
    console.error(err);
    alert("Unable to load trail.json");
  }

}

loadConfigBtn.addEventListener('click', loadExistingConfig);

