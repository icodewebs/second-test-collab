/**
 * Factorial Calculator Engine (BigInt Arbitrary Precision)
 * 100% Precision, Zero Rounding Errors
 */

let currentRawValue = "120";

const memoryStore = {};
function safeStorageGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return memoryStore[key] || null; }
}
function safeStorageSet(key, val) {
  try { localStorage.setItem(key, val); } catch (e) { memoryStore[key] = val; }
}

function computeFactorial(n) {
  if (n === 0 || n === 1) return 1n;
  let res = 1n;
  const bigN = BigInt(n);
  for (let i = 2n; i <= bigN; i++) {
    res *= i;
  }
  return res;
}

function computeTrailingZeros(n) {
  if (n < 5) return 0;
  let count = 0;
  let d = 5;
  while (Math.floor(n / d) >= 1) {
    count += Math.floor(n / d);
    d *= 5;
  }
  return count;
}

function computeScientific(str) {
  if (str.length <= 4) return str;
  const exp = str.length - 1;
  const slice = str.slice(0, 6);
  const num = Number(slice.slice(0, 1) + "." + slice.slice(1));
  return num.toFixed(3) + " × 10^" + exp;
}

function formatCommas(str) {
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function showErrorMessage(msg) {
  const alertEl = document.getElementById('error-alert');
  const textEl = document.getElementById('error-message');
  if (alertEl && textEl) {
    textEl.textContent = msg;
    alertEl.classList.add('visible');
  }
}

function clearErrorMessage() {
  const alertEl = document.getElementById('error-alert');
  if (alertEl) {
    alertEl.classList.remove('visible');
  }
}

function calculateFactorial(event) {
  if (event && event.preventDefault) {
    event.preventDefault();
  }
  clearErrorMessage();

  const input = document.getElementById('number');
  if (!input) return;

  const rawVal = String(input.value).trim();
  if (rawVal === '') {
    showErrorMessage('Please enter a whole number.');
    return;
  }

  const n = Number(rawVal);

  if (isNaN(n) || !Number.isInteger(n)) {
    showErrorMessage('Factorial is only defined for whole integers. Please remove any decimals.');
    return;
  }

  if (n < 0) {
    showErrorMessage('Factorial is not defined for negative numbers (n < 0). Please enter 0 or a positive whole number.');
    return;
  }

  if (n > 5000) {
    showErrorMessage('For optimal browser speed, calculations are capped at 5,000.');
    return;
  }

  try {
    const bigIntResult = computeFactorial(n);
    const strResult = bigIntResult.toString();
    const formattedResult = formatCommas(strResult);
    const trailingZeros = computeTrailingZeros(n);
    const digits = strResult.length;
    const scientific = computeScientific(strResult);

    currentRawValue = formattedResult;

    const resultMain = document.getElementById('result-main-text');
    if (resultMain) {
      if (n <= 15) {
        resultMain.innerHTML = `<span class="accent">${n}!</span> = ${formattedResult}`;
      } else {
        resultMain.innerHTML = `<span class="accent">${n}!</span> ≈ ${scientific}`;
      }
    }

    const digitsEl = document.getElementById('metric-digits');
    if (digitsEl) digitsEl.textContent = digits.toLocaleString();

    const zerosEl = document.getElementById('metric-zeros');
    if (zerosEl) zerosEl.textContent = trailingZeros.toLocaleString();

    const sciEl = document.getElementById('metric-sci');
    if (sciEl) sciEl.textContent = scientific;

    const expEl = document.getElementById('expansion-box');
    if (expEl) {
      if (n === 0) {
        expEl.innerHTML = `<b>Definition:</b> 0! = 1 (by empty product rule: an empty product of numbers is 1).`;
      } else if (n === 1) {
        expEl.innerHTML = `<b>Formula:</b> 1! = 1`;
      } else if (n <= 8) {
        const terms = [];
        for (let i = n; i >= 1; i--) terms.push(i);
        expEl.innerHTML = `<b>Formula:</b> ${n}! = ${terms.join(' × ')} = ${formattedResult}`;
      } else {
        expEl.innerHTML = `<b>Formula:</b> ${n}! = ${n} × ${n - 1} × ${n - 2} × ... × 3 × 2 × 1`;
      }
    }

    const resultTextEl = document.getElementById('result-text');
    if (resultTextEl) {
      resultTextEl.textContent = formattedResult;
    }

    const legacyEl = document.getElementById('result');
    if (legacyEl) {
      legacyEl.innerHTML = `<b>Factorial of ${n} is:</b> ${formattedResult}`;
    }
  } catch (err) {
    showErrorMessage('Calculation error: ' + (err.message || 'unknown error'));
  }
}

window.calcFact = calculateFactorial;
window.calculateFactorial = calculateFactorial;

function applyPreset(val) {
  const input = document.getElementById('number');
  if (input) {
    input.value = val;
    clearErrorMessage();
    calculateFactorial();
  }
}
window.applyPreset = applyPreset;

function stepNumber(delta) {
  const input = document.getElementById('number');
  if (!input) return;
  let cur = parseInt(input.value, 10);
  if (isNaN(cur)) cur = 0;
  const next = Math.max(0, cur + delta);
  input.value = next;
  clearErrorMessage();
  calculateFactorial();
}
window.stepNumber = stepNumber;

function resetCalculator(event) {
  if (event && event.preventDefault) event.preventDefault();
  clearErrorMessage();
  const input = document.getElementById('number');
  if (input) {
    input.value = '1';
    calculateFactorial();
    input.focus();
  }
  const legacyEl = document.getElementById('result');
  if (legacyEl) legacyEl.innerHTML = '';
}
window.resetline = resetCalculator;
window.resetCalculator = resetCalculator;

function copyExactValue() {
  const text = currentRawValue || '';
  if (!text) return;
  const copyBtn = document.getElementById('copy-btn');

  function onCopied() {
    if (!copyBtn) return;
    copyBtn.classList.add('copied');
    copyBtn.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>Copied!</span>
    `;
    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>Copy</span>
      `;
    }, 1800);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onCopied).catch(() => {
      fallbackCopy(text, onCopied);
    });
  } else {
    fallbackCopy(text, onCopied);
  }
}
window.copyExactValue = copyExactValue;

function fallbackCopy(text, cb) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    if (cb) cb();
  } catch (e) {}
  document.body.removeChild(ta);
}

function toggleAppTheme() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const newTheme = isLight ? 'dark' : 'light';
  applyTheme(newTheme);
}
window.toggleAppTheme = toggleAppTheme;

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    }
  } else {
    document.documentElement.removeAttribute('data-theme');
    const icon = document.getElementById('theme-icon');
    if (icon) {
      icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    }
  }
  safeStorageSet('calc_theme', theme);
}

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = safeStorageGet('calc_theme');
  if (savedTheme) applyTheme(savedTheme);
  calculateFactorial();
});

if (document.readyState === 'interactive' || document.readyState === 'complete') {
  const savedTheme = safeStorageGet('calc_theme');
  if (savedTheme) applyTheme(savedTheme);
  calculateFactorial();
}
