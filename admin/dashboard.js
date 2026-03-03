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
