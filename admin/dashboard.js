// Element references
let lastGeneratedSlug = null;
const WORD_LIMIT = 250;
const dateEl = document.getElementById('update-date');
const titleEl = document.getElementById('update-title');
const mileEl = document.getElementById('update-mile');
const locationEl = document.getElementById('update-location');
const tagsEl = document.getElementById('update-tags');
const bodyEl = document.getElementById('update-body');

const indexSection = document.getElementById('index-section');
const indexOutput = document.getElementById('index-output');
const copyIndexBtn = document.getElementById('copy-index-btn');

const wordCountEl = document.getElementById('word-count');
const slugOutput = document.getElementById('slug-output');
const generateBtn = document.getElementById('generate-btn');

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

// ---- Utilities ----

function countWords(text) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function generateSlug(date, title) {
  if (!date || !title) return '';

  const cleanTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return `${date}-${cleanTitle}`;
}

// ---- Validation ----

function validateForm() {
  const date = dateEl.value;
  const title = titleEl.value.trim();
  const mile = parseFloat(mileEl.value);
  const body = bodyEl.value.trim();
  const wordCount = countWords(body);

  const valid =
    date &&
    title &&
    !isNaN(mile) &&
    mile >= 0 &&
    body &&
    wordCount <= WORD_LIMIT;;

  generateBtn.disabled = !valid;
}

// ---- Live UI Updates ----

function updateUI() {
  const slug = generateSlug(dateEl.value, titleEl.value);
  slugOutput.textContent = slug || '—';

  const words = countWords(bodyEl.value);
  wordCountEl.textContent = `${words} / ${WORD_LIMIT} words`;

  if (words > 250) {
    wordCountEl.style.color = 'red';
  } else {
    wordCountEl.style.color = '';
  }

  validateForm();
}

// Attach listeners
[
  dateEl,
  titleEl,
  mileEl,
  locationEl,
  tagsEl,
  bodyEl
].forEach(el => el.addEventListener('input', updateUI));

// Initialize once
updateUI();

console.log("Dashboard form logic loaded.");

// ---- Markdown Generation ----

function buildMarkdown() {
  const date = dateEl.value;
  const title = titleEl.value.trim();
  const mile = parseFloat(mileEl.value);
  const location = locationEl.value.trim();
  const tagsInput = tagsEl.value.trim();
  const body = bodyEl.value.trim();

  const slug = generateSlug(date, title);

  const tagsArray = tagsInput
    ? tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const tagsYaml = `[${tagsArray.map(t => `"${t}"`).join(', ')}]`;

  const locationYaml = `location: "${location || ''}"`;

  return `---
schemaVersion: 1
date: ${date}
mile: ${mile}
title: "${title}"
slug: "${slug}"
${locationYaml}
tags: ${tagsYaml}
---

${body}
`;
}

function buildMarkdownFromData({ date, title, mile, location = "", tags = [], body }) {

  const slug = generateSlug(date, title);

  const tagsYaml = `[${tags.map(t => `"${t}"`).join(', ')}]`;

  const locationYaml = `location: "${location}"`;

  return `---
schemaVersion: 1
date: ${date}
mile: ${mile}
title: "${title}"
slug: "${slug}"
${locationYaml}
tags: ${tagsYaml}
---

${body}
`;
}

function buildIndexEntryFromData({ date, title, mile }) {

  const slug = generateSlug(date, title);

  return `{
  "slug": "${slug}",
  "date": "${date}",
  "mile": ${mile},
  "title": "${title}",
  "file": "${slug}.md"
},`;
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

function buildIndexEntry() {
  const date = dateEl.value;
  const title = titleEl.value.trim();
  const mile = parseFloat(mileEl.value);
  const slug = generateSlug(date, title);

  return `{
  "slug": "${slug}",
  "date": "${date}",
  "mile": ${mile},
  "title": "${title}",
  "file": "${slug}.md"
},`;
}

function handleGenerateClick() {
  const markdown = buildMarkdown();
  const slug = generateSlug(dateEl.value, titleEl.value);
  if (slug === lastGeneratedSlug) {
    const proceed = confirm(
      "This slug was just generated. Are you sure you want to regenerate it?"
    );
    if (!proceed) return;
  }
  const filename = `${slug}.md`;

  // Download markdown file
  downloadFile(filename, markdown);

  // Generate index entry
  const indexEntry = buildIndexEntry();
  indexOutput.value = indexEntry;

  // Reveal section
  indexSection.hidden = false;

  lastGeneratedSlug = slug;
}

function resetForm() {
  document.getElementById('update-form').reset();
  slugOutput.textContent = '—';
  wordCountEl.textContent = `0 / ${WORD_LIMIT} words`;
  generateBtn.disabled = true;
}

copyIndexBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(indexOutput.value);

    copyIndexBtn.textContent = "Copied!";
    setTimeout(() => {
      copyIndexBtn.textContent = "Copy Index Entry";
    }, 1500);

    // Now reset everything
    resetForm();
    indexSection.hidden = true;
    lastGeneratedSlug = null;

  } catch (err) {
    alert("Clipboard copy failed. You can copy manually.");
  }
});

// Attach to button
generateBtn.addEventListener('click', handleGenerateClick);

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

// ---- Batch Import ----

const batchInput = document.getElementById("batchInput");
const parseBatchBtn = document.getElementById("parseBatchBtn");
const batchPreview = document.getElementById("batchPreview");
const publishBatchBtn = document.getElementById("publishBatchBtn");

let batchEntries = [];

function parseBatch(text) {

  const chunks = text.split("=== UPDATE ===");

  return chunks
    .map(c => c.trim())
    .filter(Boolean)
    .map(parseEntry)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

}

function parseEntry(entry) {

  const lines = entry.split("\n");

  let title = "";
  let date = "";
  let mile = "";
  let bodyStart = 0;

  lines.forEach((line, i) => {

    if (line.startsWith("Title:"))
      title = line.replace("Title:", "").trim();

    if (line.startsWith("Date:"))
      date = line.replace("Date:", "").trim();

    if (line.startsWith("Mile:")) {
      const m = parseFloat(line.replace("Mile:", "").trim());
      mile = isNaN(m) ? null : Math.round(m * 10) / 10;
    }

    if (line.trim() === "---")
      bodyStart = i + 1;

  });

  const body = lines.slice(bodyStart).join("\n").trim();

  if (!date || date === "auto")
    date = new Date().toISOString().slice(0,10);

  return { title, date, mile, body };

}

function renderBatchPreview(entries) {

  batchPreview.innerHTML = "";

  entries.forEach(e => {

    const card = document.createElement("div");

    const mileDisplay =
      e.mile !== null && e.mile !== undefined
        ? Number(e.mile).toFixed(1)
        : "?";

    card.className = "batch-card";

    card.innerHTML = `
      <strong>${e.title || "Untitled Update"}</strong><br>
      Mile ${mileDisplay}<br>
      <em>${e.date}</em><br><br>
      ${e.body.slice(0,200)}
      <hr>
    `;

    batchPreview.appendChild(card);

  });

}

  // Parse Button
parseBatchBtn.addEventListener("click", () => {

  const text = batchInput.value;

  batchEntries = parseBatch(text);

  renderBatchPreview(batchEntries);

  publishBatchBtn.hidden = batchEntries.length === 0;

});

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

