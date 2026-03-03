// Element references
const WORD_LIMIT = 250;
const dateEl = document.getElementById('update-date');
const titleEl = document.getElementById('update-title');
const mileEl = document.getElementById('update-mile');
const locationEl = document.getElementById('update-location');
const tagsEl = document.getElementById('update-tags');
const bodyEl = document.getElementById('update-body');

const wordCountEl = document.getElementById('word-count');
const slugOutput = document.getElementById('slug-output');
const generateBtn = document.getElementById('generate-btn');

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

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

function handleGenerateClick() {
  const markdown = buildMarkdown();
  const slug = generateSlug(dateEl.value, titleEl.value);
  const filename = `${slug}.md`;

  downloadFile(filename, markdown);
}

// Attach to button
generateBtn.addEventListener('click', handleGenerateClick);
