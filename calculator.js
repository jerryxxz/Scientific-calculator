const PI = Math.acos(-1);
const E  = Math.exp(1);
let calculator = {
    memory:  0,
    ans:     0,
    history: [],
    display: '',
};
const displayInput   = document.getElementById('display');
const resultDisplay  = document.getElementById('result');
const historyList    = document.getElementById('historyList');
const memoryDisplay  = document.getElementById('memoryDisplay');
const historyPanel   = document.getElementById('historyPanel');
const memIndicator   = document.getElementById('memIndicator');
const toastContainer = document.getElementById('toastContainer');
function loadState() {
    try {
        const saved = localStorage.getItem('calculus-state');
        if (saved) {
            const state = JSON.parse(saved);
            calculator.memory  = state.memory  || 0;
            calculator.ans     = state.ans     || 0;
            calculator.history = state.history || [];
            updateMemoryDisplay();
            updateHistoryDisplay();
        }
    } catch(e) { /* ignore */ }
}

function saveState() {
    try { localStorage.setItem('calculus-state', JSON.stringify(calculator)); }
    catch(e) { /* ignore */ }
}
function updateDisplay() {
    displayInput.value = calculator.display;
}

function updateMemoryDisplay() {
    memoryDisplay.textContent = formatNumber(calculator.memory);
    if (calculator.memory !== 0) {
        memIndicator.classList.add('active');
    } else {
        memIndicator.classList.remove('active');
    }
    saveState();
}

function updateHistoryDisplay() {
    historyList.innerHTML = '';

    if (!calculator.history.length) {
        historyList.innerHTML = '<div class="history-empty">No calculations yet</div>';
        saveState();
        return;
    }

    calculator.history.slice().reverse().forEach((entry) => {
        const parts   = entry.split(' = ');
        const expr    = parts[0] || entry;
        const result  = parts[1] || '';

        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <span class="hist-expr">${escapeHtml(expr)}</span>
            <span class="hist-result">= ${escapeHtml(result)}</span>
        `;
        div.onclick = () => {
            calculator.display = expr;
            updateDisplay();
            displayInput.focus();
        };
        historyList.appendChild(div);
    });

    saveState();
}
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
function appendChar(char) {
    const map = { pi: 'pi', e: 'e', ans: 'ans' };
    calculator.display += map[char] ?? char;
    updateDisplay();
}
function appendFunction(func) {
    calculator.display += func + '(';
    updateDisplay();
}
function clearDisplay() {
    calculator.display = '';
    updateDisplay();
    resultDisplay.textContent = '0';
    resultDisplay.classList.remove('pop');
}
function backspace() {
    calculator.display = calculator.display.slice(0, -1);
    updateDisplay();
}
function storeMemory() {
    if (calculator.ans !== 0 || resultDisplay.textContent !== '0') {
        calculator.memory = calculator.ans;
        updateMemoryDisplay();
        showToast('Value stored to memory', 'success');
    }
}
function recallMemory() {
    calculator.display += calculator.memory.toString();
    updateDisplay();
}
function clearMemory() {
    calculator.memory = 0;
    updateMemoryDisplay();
    showToast('Memory cleared');
}
function clearHistory() {
    calculator.history = [];
    updateHistoryDisplay();
    showToast('History cleared');
}
function toggleHistory() {
    historyPanel.classList.toggle('collapsed');
}
class Parser {
    constructor(expr) { this.expr = expr; this.pos = 0; }

    skipWS() {
        while (this.pos < this.expr.length && /\s/.test(this.expr[this.pos])) this.pos++;
    }
    peek()    { this.skipWS(); return this.pos < this.expr.length ? this.expr[this.pos] : '\0'; }
    consume() { this.skipWS(); return this.pos < this.expr.length ? this.expr[this.pos++] : '\0'; }
    match(c)  { if (this.peek() === c) { this.pos++; return true; } return false; }
    parseExpr() {
        let r = this.parseTerm();
        while (true) {
            if      (this.match('+')) r += this.parseTerm();
            else if (this.match('-')) r -= this.parseTerm();
            else break;
        }
        return r;
    }
    parseTerm() {
        let r = this.parseFactor();
        while (true) {
            if (this.match('*')) { r *= this.parseFactor(); }
            else if (this.match('/')) {
                const d = this.parseFactor();
                if (d === 0) throw new Error('Division by zero');
                r /= d;
            } else if (this.match('%')) {
                const d = this.parseFactor();
                if (d === 0) throw new Error('Modulo by zero');
                r %= d;
            } else break;
        }
        return r;
    }
    parseFactor() {
        const base = this.parseBase();
        if (this.match('^')) return Math.pow(base, this.parseFactor());
        return base;
    }
    parseBase() {
        if (this.peek() === '-') { this.consume(); return -this.parsePrimary(); }
        if (this.peek() === '+') { this.consume(); return  this.parsePrimary(); }
        return this.parsePrimary();
    }
    parsePrimary() {
        this.skipWS();
        if (this.peek() === '(') {
            this.consume();
            const val = this.parseExpr();
            if (!this.match(')')) throw new Error("Missing ')'");
            return val;
        }
        if (/\d/.test(this.peek()) || this.peek() === '.') return this.parseNumber();
        if (/[a-zA-Z_]/.test(this.peek()))                 return this.parseIdent();
        throw new Error(`Unexpected character: '${this.peek()}'`);
    }
    parseNumber() {
        const start = this.pos;
        while (this.pos < this.expr.length && (/\d/.test(this.expr[this.pos]) || this.expr[this.pos] === '.')) this.pos++;
        if (this.pos < this.expr.length && /[eE]/.test(this.expr[this.pos])) {
            this.pos++;
            if (this.pos < this.expr.length && /[+-]/.test(this.expr[this.pos])) this.pos++;
            while (this.pos < this.expr.length && /\d/.test(this.expr[this.pos])) this.pos++;
        }
        const tok = this.expr.substring(start, this.pos);
        const num = parseFloat(tok);
        if (isNaN(num)) throw new Error(`Invalid number: ${tok}`);
        return num;
    }
    parseIdent() {
        const start = this.pos;
        while (this.pos < this.expr.length && /[a-zA-Z0-9_]/.test(this.expr[this.pos])) this.pos++;
        const name = this.expr.substring(start, this.pos).toLowerCase();

        if (name === 'pi' || name === 'π') return PI;
        if (name === 'e')                   return E;
        if (name === 'ans')                 return calculator.ans;

        this.skipWS();
        if (this.peek() !== '(') throw new Error(`Unknown identifier: ${name}`);
        this.consume();
        const a = this.parseExpr();
        if (name === 'pow') {
            if (!this.match(',')) throw new Error('pow(a, b) needs two arguments');
            const b = this.parseExpr();
            if (!this.match(')')) throw new Error("Missing ')'");
            return Math.pow(a, b);
        }
        if (name === 'hypot') {
            if (!this.match(',')) throw new Error('hypot(a, b) needs two arguments');
            const b = this.parseExpr();
            if (!this.match(')')) throw new Error("Missing ')'");
            return Math.hypot(a, b);
        }
        if (name === 'log' && this.peek() === ',') {
            this.consume();
            const base = this.parseExpr();
            if (!this.match(')')) throw new Error("Missing ')'");
            if (base <= 0 || base === 1) throw new Error('Invalid logarithm base');
            return Math.log(a) / Math.log(base);
        }

        if (!this.match(')')) throw new Error("Missing ')'");

        switch (name) {
            case 'sin':   return Math.sin(a);
            case 'cos':   return Math.cos(a);
            case 'tan':   return Math.tan(a);
            case 'asin':
                if (a < -1 || a > 1) throw new Error('asin domain: must be in [-1, 1]');
                return Math.asin(a);
            case 'acos':
                if (a < -1 || a > 1) throw new Error('acos domain: must be in [-1, 1]');
                return Math.acos(a);
            case 'atan':  return Math.atan(a);
            case 'sinh':  return Math.sinh(a);
            case 'cosh':  return Math.cosh(a);
            case 'tanh':  return Math.tanh(a);
            case 'sqrt':
                if (a < 0) throw new Error('sqrt: argument must be ≥ 0');
                return Math.sqrt(a);
            case 'cbrt':  return Math.cbrt(a);
            case 'log':
                if (a <= 0) throw new Error('log: argument must be > 0');
                return Math.log(a);
            case 'log2':
                if (a <= 0) throw new Error('log2: argument must be > 0');
                return Math.log2(a);
            case 'log10':
                if (a <= 0) throw new Error('log10: argument must be > 0');
                return Math.log10(a);
            case 'exp':   return Math.exp(a);
            case 'abs':   return Math.abs(a);
            case 'ceil':  return Math.ceil(a);
            case 'floor': return Math.floor(a);
            case 'round': return Math.round(a);
            case 'deg':   return a * 180.0 / PI;
            case 'rad':   return a * PI / 180.0;
            case 'fact': {
                if (a < 0 || a !== Math.floor(a)) throw new Error('Factorial: non-negative integers only');
                let r = 1;
                for (let i = 2; i <= a; i++) r *= i;
                return r;
            }
            default: throw new Error(`Unknown function: ${name}`);
        }
    }

    parse() {
        const result = this.parseExpr();
        this.skipWS();
        if (this.pos !== this.expr.length)
            throw new Error(`Unexpected token: "${this.expr.substring(this.pos)}"`);
        return result;
    }
}
function calculate() {
    if (!calculator.display.trim()) return;

    try {
        const processed = calculator.display.replace(/mem/g, calculator.memory.toString());
        const parser    = new Parser(processed);
        const result    = parser.parse();

        calculator.ans = result;
        const formatted = formatNumber(result);

        resultDisplay.textContent = formatted;
        resultDisplay.classList.remove('pop');
        void resultDisplay.offsetWidth;
        resultDisplay.classList.add('pop');

        const entry = `${calculator.display} = ${formatted}`;
        calculator.history.push(entry);
        if (calculator.history.length > 100) calculator.history.shift();
        updateHistoryDisplay();
        saveState();
    } catch (err) {
        resultDisplay.textContent = 'Error';
        showToast(err.message, 'error');
    }
}
function formatNumber(v) {
    if (!isFinite(v)) return v > 0 ? '∞' : '-∞';
    if (isNaN(v))     return 'NaN';
    if (v === Math.floor(v) && Math.abs(v) < 1e15) return Math.floor(v).toString();
    return v.toPrecision(10).replace(/\.?0+$/, '');
}
function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'error' ? '✕' : type === 'success' ? '✓' : '·';
    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(msg)}</span>`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2200);
}
function showNotification(msg, type = 'info') {
    showToast(msg, type === 'error' ? 'error' : 'success');
}
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')     { e.preventDefault(); calculate(); }
    else if (e.key === 'Escape')    { clearDisplay(); }
    else if (e.key === 'Backspace') { backspace(); }
    else if (['+','-','*','/','%','^'].includes(e.key)) { e.preventDefault(); appendChar(e.key); }
    else if (/[\d.(,)]/.test(e.key))  { e.preventDefault(); appendChar(e.key); }
});
loadState();
updateDisplay();
