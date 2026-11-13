/**
 * Factorial Calculator & Combinatorics Engine
 * 100% Precision using JavaScript BigInt
 * Zero precision errors & rock-solid validation
 */

(() => {
  'use strict';

  // --- State ---
  let currentResult = {
    n: null,
    bigIntValue: null,
    stringValue: '',
    formattedString: '',
    scientificString: '',
    digits: 0,
    trailingZeros: 0,
    computeTimeMs: 0
  };

  const STORAGE_KEY_HISTORY = 'factorial_calc_history_v1';
  const STORAGE_KEY_THEME = 'factorial_calc_theme';
  const MAX_INPUT_LIMIT = 10000;

  // --- DOM Elements ---
  const numberInput = document.getElementById('number-input');
  const calcForm = document.getElementById('factorial-form');
  const clearInputBtn = document.getElementById('clear-input-btn');
  const stepDownBtn = document.getElementById('step-down-btn');
  const stepUpBtn = document.getElementById('step-up-btn');
  const validationAlert = document.getElementById('validation-alert');
  const validationText = document.getElementById('validation-text');
  const resetBtn = document.getElementById('reset-btn');

  // Result Elements
  const resultCard = document.getElementById('result-card');
  const resultTitle = document.getElementById('result-title');
  const statDigits = document.getElementById('stat-digits');
  const statZeros = document.getElementById('stat-zeros');
  const statScientific = document.getElementById('stat-scientific');
  const statTime = document.getElementById('stat-time');
  const valueDisplay = document.getElementById('value-display');
  const copyBtn = document.getElementById('copy-btn');
  const downloadBtn = document.getElementById('download-btn');
  const toggleFormatBtn = document.getElementById('toggle-format-btn');
  const expansionContent = document.getElementById('expansion-content');

  // History Elements
  const historyList = document.getElementById('history-list');
  const clearHistoryBtn = document.getElementById('clear-history-btn');

  // Theme Elements
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');

  // Combinatorics Elements
  const tabFactorial = document.getElementById('tab-factorial');
  const tabCombinatorics = document.getElementById('tab-combinatorics');
  const viewFactorial = document.getElementById('view-factorial');
  const viewCombinatorics = document.getElementById('view-combinatorics');
  const combNInput = document.getElementById('comb-n');
  const combRInput = document.getElementById('comb-r');
  const combPermResult = document.getElementById('comb-perm-result');
  const combCombResult = document.getElementById('comb-comb-result');
  const combError = document.getElementById('comb-error');

  // Presets
  const presetChips = document.querySelectorAll('.chip-btn[data-value]');

  // Formatting state
  let isFormattedWithCommas = true;

  // --- Math Functions ---

  /**
   * Arbitrary-precision factorial calculation using BigInt.
   * Runs in O(n) multiplication operations.
   */
  function calculateFactorial(n) {
    if (n === 0 || n === 1) {
      return 1n;
    }
    let result = 1n;
    const bigN = BigInt(n);
    for (let i = 2n; i <= bigN; i++) {
      result *= i;
    }
    return result;
  }

  /**
   * Legendre's formula to compute exact number of trailing zeros in n!
   * Count = floor(n/5) + floor(n/25) + floor(n/125) + ...
   */
  function calculateTrailingZeros(n) {
    if (n < 5) return 0;
    let count = 0;
    let divisor = 5;
    while (Math.floor(n / divisor) >= 1) {
      count += Math.floor(n / divisor);
      divisor *= 5;
    }
    return count;
  }

  /**
   * Formats BigInt into standard scientific notation (e.g. 9.332622 × 10^157)
   */
  function formatScientific(bigIntValue, rawString) {
    const s = rawString || bigIntValue.toString();
    if (s.length <= 4) return s;
    const exp = s.length - 1;
    const precision = 6;
    const digits = s.slice(0, precision + 2);
    const num = Number(digits.slice(0, 1) + '.' + digits.slice(1));
    return `${num.toFixed(precision)} × 10^${exp}`;
  }

  /**
   * Inserts commas as thousands separators for readability
   */
  function formatWithCommas(str) {
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Generates step-by-step expansion text
   */
  function generateExpansion(n) {
    if (n === 0) {
      return '0! = 1\n(By mathematical definition of an empty product: multiplying zero numbers yields the multiplicative identity 1. Also consistent with the Gamma function: Γ(1) = 0! = 1).';
    }
    if (n === 1) {
      return '1! = 1';
    }
    if (n <= 10) {
      const terms = [];
      for (let i = n; i >= 1; i--) {
        terms.push(i);
      }
      return `${n}! = ${terms.join(' × ')} = ${currentResult.formattedString}`;
    }
    return `${n}! = ${n} × ${n - 1} × ${n - 2} × ... × 3 × 2 × 1`;
  }

  // --- Combinatorics Math ---

  function calculatePermutations(n, r) {
    if (r < 0 || r > n) return 0n;
    if (r === 0) return 1n;
    let res = 1n;
    const start = BigInt(n - r + 1);
    const end = BigInt(n);
    for (let i = start; i <= end; i++) {
      res *= i;
    }
    return res;
  }

  function calculateCombinations(n, r) {
    if (r < 0 || r > n) return 0n;
    if (r === 0 || r === n) return 1n;
    if (r > n - r) r = n - r; // Symmetry optimization C(n, r) = C(n, n-r)
    let num = 1n;
    let den = 1n;
    for (let i = 1n; i <= BigInt(r); i++) {
      num *= BigInt(n) - i + 1n;
      den *= i;
    }
    return num / den;
  }

  // --- Validation & UI Helpers ---

  function showError(msg) {
    if (validationAlert && validationText) {
      validationText.textContent = msg;
      validationAlert.classList.add('visible');
    }
  }

  function clearError() {
    if (validationAlert) {
      validationAlert.classList.remove('visible');
    }
  }

  function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // --- Core Action: Perform Calculation ---

  function performCalculation(inputValue) {
    clearError();

    const rawStr = String(inputValue).trim();
    if (rawStr === '') {
      showError('Please enter a non-negative integer.');
      numberInput.focus();
      return;
    }

    // Check if valid integer
    if (!/^-?\d+$/.test(rawStr)) {
      if (/^-?\d+\.\d+$/.test(rawStr)) {
        showError('Factorial requires a whole number (integers only). Decimals are not permitted.');
      } else {
        showError('Invalid input. Please enter a valid whole number.');
      }
      return;
    }

    const n = Number(rawStr);

    if (n < 0) {
      showError('Factorial is not defined for negative integers (n < 0). Please enter 0 or a positive whole number.');
      return;
    }

    if (n > MAX_INPUT_LIMIT) {
      showError(`Input exceeds the safety limit of ${MAX_INPUT_LIMIT.toLocaleString()} to protect browser performance.`);
      return;
    }

    // Perform calculation with performance measurement
    const startTime = performance.now();
    const bigIntValue = calculateFactorial(n);
    const endTime = performance.now();
    const elapsed = Math.max(0.01, endTime - startTime);

    const stringValue = bigIntValue.toString();
    const formattedString = formatWithCommas(stringValue);
    const scientificString = formatScientific(bigIntValue, stringValue);
    const trailingZeros = calculateTrailingZeros(n);
    const digits = stringValue.length;

    // Save state
    currentResult = {
      n,
      bigIntValue,
      stringValue,
      formattedString,
      scientificString,
      digits,
      trailingZeros,
      computeTimeMs: elapsed
    };

    // Update UI elements
    updateResultUI();

    // Save to History
    saveToHistory(n, scientificString, digits);

    // Scroll result card into view smoothly
    resultCard.classList.add('visible');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function updateResultUI() {
    if (!resultCard) return;

    resultTitle.innerHTML = `<span class="highlight">${currentResult.n}!</span> = ${currentResult.n <= 20 ? currentResult.formattedString : currentResult.scientificString}`;
    statDigits.textContent = currentResult.digits.toLocaleString();
    statZeros.textContent = currentResult.trailingZeros.toLocaleString();
    statScientific.textContent = currentResult.scientificString;
    statTime.textContent = currentResult.computeTimeMs < 1
      ? `${currentResult.computeTimeMs.toFixed(2)} ms`
      : `${currentResult.computeTimeMs.toFixed(1)} ms`;

    // Display formatted or raw text in value container
    renderDisplayValue();

    // Expansion explanation
    if (expansionContent) {
      expansionContent.textContent = generateExpansion(currentResult.n);
    }
  }

  function renderDisplayValue() {
    if (!valueDisplay) return;
    if (isFormattedWithCommas) {
      valueDisplay.textContent = currentResult.formattedString;
      if (toggleFormatBtn) {
        toggleFormatBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="4 7 4 4 20 4 20 7"></polyline>
            <line x1="9" y1="20" x2="15" y2="20"></line>
            <line x1="12" y1="4" x2="12" y2="20"></line>
          </svg>
          Raw Digits
        `;
      }
    } else {
      valueDisplay.textContent = currentResult.stringValue;
      if (toggleFormatBtn) {
        toggleFormatBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="4" y1="9" x2="20" y2="9"></line>
            <line x1="4" y1="15" x2="20" y2="15"></line>
            <line x1="10" y1="3" x2="8" y2="21"></line>
            <line x1="16" y1="3" x2="14" y2="21"></line>
          </svg>
          Group Digits (Commas)
        `;
      }
    }
  }

  // --- Reset Application ---

  function resetApp() {
    clearError();
    numberInput.value = '';
    clearInputBtn.classList.remove('visible');
    resultCard.classList.remove('visible');
    currentResult = {
      n: null,
      bigIntValue: null,
      stringValue: '',
      formattedString: '',
      scientificString: '',
      digits: 0,
      trailingZeros: 0,
      computeTimeMs: 0
    };
    numberInput.focus();
  }

  // --- Copy & Download Handlers ---

  async function copyResult() {
    if (!currentResult.stringValue) return;

    const textToCopy = isFormattedWithCommas
      ? currentResult.formattedString
      : currentResult.stringValue;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for non-HTTPS or unsupported browsers
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      copyBtn.classList.add('copied');
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Copied!
      `;

      showToast(`Copied ${currentResult.n}! to clipboard!`);

      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.innerHTML = originalText;
      }, 2000);
    } catch (err) {
      showToast('Could not copy to clipboard', 'danger');
    }
  }

  function downloadResultTxt() {
    if (!currentResult.stringValue) return;

    const content = [
      `==================================================`,
      ` Factorial Calculation: ${currentResult.n}!`,
      `==================================================`,
      `Input (n):           ${currentResult.n}`,
      `Total Digits:        ${currentResult.digits.toLocaleString()}`,
      `Trailing Zeros:      ${currentResult.trailingZeros.toLocaleString()}`,
      `Scientific Notation: ${currentResult.scientificString}`,
      `Computation Time:    ${currentResult.computeTimeMs.toFixed(2)} ms`,
      `Generated At:        ${new Date().toISOString()}`,
      `==================================================`,
      ``,
      `EXACT VALUE:`,
      currentResult.stringValue,
      ``,
      `FORMATTED VALUE (WITH COMMAS):`,
      currentResult.formattedString,
      ``
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `factorial-${currentResult.n}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Downloaded factorial-${currentResult.n}.txt`);
  }

  // --- History Storage & Display ---

  function loadHistory() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function saveToHistory(n, scientific, digits) {
    try {
      let history = loadHistory();
      // Remove duplicate if already present
      history = history.filter(item => item.n !== n);
      // Prepend recent
      history.unshift({
        n,
        scientific,
        digits,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      // Keep max 10
      if (history.length > 10) history = history.slice(0, 10);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
      renderHistoryList();
    } catch (e) {
      console.warn('LocalStorage unavailable for history');
    }
  }

  function renderHistoryList() {
    if (!historyList) return;
    const history = loadHistory();

    if (history.length === 0) {
      historyList.innerHTML = `<div class="empty-history">No recent calculations yet. Try calculating 5!, 10!, or 100!</div>`;
      if (clearHistoryBtn) clearHistoryBtn.style.display = 'none';
      return;
    }

    if (clearHistoryBtn) clearHistoryBtn.style.display = 'inline-flex';

    historyList.innerHTML = history.map(item => `
      <div class="history-item" data-value="${item.n}">
        <div class="history-item-left">
          <span class="history-badge">${item.n}!</span>
          <span class="history-value">${escapeHtml(item.scientific)} (${item.digits.toLocaleString()} digits)</span>
        </div>
        <span class="history-time">${escapeHtml(item.timestamp)}</span>
      </div>
    `).join('');

    // Attach click listeners
    historyList.querySelectorAll('.history-item').forEach(el => {
      el.addEventListener('click', () => {
        const val = el.getAttribute('data-value');
        if (val !== null) {
          numberInput.value = val;
          clearInputBtn.classList.add('visible');
          performCalculation(val);
        }
      });
    });
  }

  function clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
      renderHistoryList();
      showToast('Calculation history cleared.');
    } catch (e) {}
  }

  // --- Combinatorics Calculator Logic ---

  function updateCombinatorics() {
    if (!combNInput || !combRInput || !combPermResult || !combCombResult) return;

    const nVal = combNInput.value.trim();
    const rVal = combRInput.value.trim();

    if (nVal === '' || rVal === '') {
      combPermResult.textContent = '—';
      combCombResult.textContent = '—';
      if (combError) combError.style.display = 'none';
      return;
    }

    const n = Number(nVal);
    const r = Number(rVal);

    if (isNaN(n) || isNaN(r) || !Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0) {
      if (combError) {
        combError.textContent = 'Both n and r must be non-negative whole integers.';
        combError.style.display = 'block';
      }
      combPermResult.textContent = '—';
      combCombResult.textContent = '—';
      return;
    }

    if (r > n) {
      if (combError) {
        combError.textContent = 'r cannot be greater than n (r ≤ n).';
        combError.style.display = 'block';
      }
      combPermResult.textContent = '0';
      combCombResult.textContent = '0';
      return;
    }

    if (n > 2000) {
      if (combError) {
        combError.textContent = 'For combinatorics, n is capped at 2,000.';
        combError.style.display = 'block';
      }
      return;
    }

    if (combError) combError.style.display = 'none';

    try {
      const perm = calculatePermutations(n, r);
      const comb = calculateCombinations(n, r);

      const permStr = perm.toString();
      const combStr = comb.toString();

      combPermResult.textContent = permStr.length > 20
        ? formatScientific(perm, permStr)
        : formatWithCommas(permStr);

      combCombResult.textContent = combStr.length > 20
        ? formatScientific(comb, combStr)
        : formatWithCommas(combStr);
    } catch (e) {
      if (combError) {
        combError.textContent = 'Calculation error. Values might be too large.';
        combError.style.display = 'block';
      }
    }
  }

  // --- Theme Management ---

  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'dark'); // default dark for modern tech look
    applyTheme(initialTheme);
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
    }
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }

  function toggleTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    applyTheme(isLight ? 'dark' : 'light');
  }

  // --- Accordion Setup ---

  function initAccordions() {
    const accordionTriggers = document.querySelectorAll('.accordion-trigger');
    accordionTriggers.forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.accordion-item');
        if (item) {
          item.classList.toggle('active');
        }
      });
    });
  }

  // --- Tab Switching ---

  function initTabs() {
    if (!tabFactorial || !tabCombinatorics) return;

    tabFactorial.addEventListener('click', () => {
      tabFactorial.classList.add('active');
      tabCombinatorics.classList.remove('active');
      viewFactorial.style.display = 'block';
      viewCombinatorics.style.display = 'none';
    });

    tabCombinatorics.addEventListener('click', () => {
      tabCombinatorics.classList.add('active');
      tabFactorial.classList.remove('active');
      viewFactorial.style.display = 'none';
      viewCombinatorics.style.display = 'block';
      updateCombinatorics();
    });
  }

  // --- Event Listeners Setup ---

  function initEventListeners() {
    // Form submit
    calcForm.addEventListener('submit', (e) => {
      e.preventDefault();
      performCalculation(numberInput.value);
    });

    // Reset button
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      resetApp();
    });

    // Input changes
    numberInput.addEventListener('input', () => {
      clearError();
      if (numberInput.value.length > 0) {
        clearInputBtn.classList.add('visible');
      } else {
        clearInputBtn.classList.remove('visible');
      }
    });

    // Clear input button
    clearInputBtn.addEventListener('click', () => {
      numberInput.value = '';
      clearInputBtn.classList.remove('visible');
      clearError();
      numberInput.focus();
    });

    // Stepper buttons
    stepUpBtn.addEventListener('click', () => {
      const current = parseInt(numberInput.value, 10);
      const next = isNaN(current) ? 0 : Math.min(MAX_INPUT_LIMIT, current + 1);
      numberInput.value = next;
      clearInputBtn.classList.add('visible');
      clearError();
    });

    stepDownBtn.addEventListener('click', () => {
      const current = parseInt(numberInput.value, 10);
      const next = isNaN(current) ? 0 : Math.max(0, current - 1);
      numberInput.value = next;
      clearInputBtn.classList.add('visible');
      clearError();
    });

    // Preset buttons
    presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.getAttribute('data-value');
        if (val !== null) {
          numberInput.value = val;
          clearInputBtn.classList.add('visible');
          performCalculation(val);
        }
      });
    });

    // Copy & Download
    if (copyBtn) copyBtn.addEventListener('click', copyResult);
    if (downloadBtn) downloadBtn.addEventListener('click', downloadResultTxt);

    // Toggle Formatted / Raw Digits
    if (toggleFormatBtn) {
      toggleFormatBtn.addEventListener('click', () => {
        isFormattedWithCommas = !isFormattedWithCommas;
        renderDisplayValue();
      });
    }

    // History Clear
    if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', clearHistory);

    // Theme toggle
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);

    // Combinatorics inputs
    if (combNInput) combNInput.addEventListener('input', updateCombinatorics);
    if (combRInput) combRInput.addEventListener('input', updateCombinatorics);

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Escape clears input
      if (e.key === 'Escape') {
        resetApp();
      }
    });
  }

  // --- Initialize App on Load ---

  function initApp() {
    initTheme();
    initAccordions();
    initTabs();
    initEventListeners();
    renderHistoryList();

    // Calculate initial preview default (e.g. 5! for instant delight)
    if (numberInput) {
      numberInput.value = '5';
      clearInputBtn.classList.add('visible');
      performCalculation(5);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
