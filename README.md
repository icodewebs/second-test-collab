# Factorial Master — Precision Factorial & Combinatorics Calculator

A modern, responsive, high-performance web application designed for calculating arbitrary-precision factorials, permutations, and combinations with zero rounding or overflow errors.

![Factorial Master](https://img.shields.io/badge/Precision-Arbitrary%20BigInt-6366f1?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-100%25%20Working-10b981?style=for-the-badge)

---

## 🌟 Key Features

- **Arbitrary-Precision Engine**: Powered by JavaScript `BigInt`, calculating 100% exact integer factorials ($0!$ up to $10,000!+$) without floating-point degradation or `Infinity` overflow.
- **Instant Mathematical Analytics**:
  - **Exact Value**: Full multi-thousand-digit precision with toggleable comma grouping.
  - **Scientific Notation**: Formatted $a \times 10^b$ representation for large values.
  - **Total Digits**: Real-time count of total digits in the result.
  - **Trailing Zeros**: Exact count of ending zeros computed instantaneously via **Legendre's Formula** ($\sum \lfloor n/5^k \rfloor$).
  - **Compute Time**: Millisecond-level benchmarking of the multiplication engine.
- **Interactive Tools & Utilities**:
  - **Quick Presets**: One-click computation chips ($0!$, $1!$, $5!$, $10!$, $20!$, $50!$, $100!$, $500!$, $1000!$).
  - **Step-by-Step Mathematical Expansion**: Shows exact breakdown ($n \times (n-1) \times \dots$) and empty product explanations for $0! = 1$.
  - **Copy & Export**: One-click clipboard copy with feedback and `.txt` file download for massive values.
  - **Calculation History**: Automatically records recent calculations with reload shortcuts.
- **Combinatorics Suite**:
  - Permutations: $P(n, r) = \frac{n!}{(n-r)!}$
  - Combinations: $C(n, r) = \frac{n!}{r!(n-r)!}$
- **UI & Experience**:
  - Dark / Light mode toggle with persistent state.
  - Clean glassmorphism styling with responsive layout.
  - Input validation for negative numbers, non-integers, and out-of-range values.
  - Keyboard navigation (stepper controls, `Enter` to calculate, `Esc` to reset).
  - Educational mathematical guide with interactive accordions.

---

## 🚀 How to Run

Simply open either `factask.html` or `index.html` in any modern web browser:

```bash
# Option 1: Open directly in your browser
xdg-open factask.html
# or
google-chrome factask.html

# Option 2: Serve via a lightweight local server
python3 -m http.server 8000
# Then visit http://localhost:8000
```

---

## 📁 File Structure

- `factask.html` — Main application HTML file.
- `index.html` — Root index entry point.
- `style.css` — Modern responsive styles, animations, and theme variables.
- `main.js` — High-performance computation engine and UI controller.
- `README.md` — Project documentation.
