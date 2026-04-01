// Calculator State
const PI = Math.acos(-1);
const E = Math.exp(1);

let calculator = {
    memory: 0,
    ans: 0,
    history: [],
    display: '',
};

// DOM Elements
const displayInput = document.getElementById('display');
const resultDisplay = document.getElementById('result');
const historyList = document.getElementById('historyList');
const memoryDisplay = document.getElementById('memoryDisplay');
const historyPanel = document.getElementById('historyPanel');

// Load from localStorage on startup
function loadState() {
    const saved = localStorage.getItem('calculator-state');
    if (saved) {
        const state = JSON.parse(saved);
        calculator.memory = state.memory || 0;
        calculator.ans = state.ans || 0;
        calculator.history = state.history || [];
        updateMemoryDisplay();
        updateHistoryDisplay();
    }
}

// Save to localStorage
function saveState() {
    localStorage.setItem('calculator-state', JSON.stringify(calculator));
}

// Update displays
function updateDisplay() {
    displayInput.value = calculator.display;
}

function updateMemoryDisplay() {
    memoryDisplay.textContent = formatNumber(calculator.memory);
    saveState();
}

function updateHistoryDisplay() {
    historyList.innerHTML = '';
    calculator.history.slice().reverse().forEach((entry, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `<span>${index + 1}.</span> ${escapeHtml(entry)}`;
        div.onclick = () => {
            // Extract just the expression part
            const parts = entry.split(' = ');
            if (parts[0]) {
                calculator.display = parts[0];
                updateDisplay();
            }
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

// Append character or function
function appendChar(char) {
    if (char === 'pi') {
        calculator.display += 'pi';
    } else if (char === 'e') {
        calculator.display += 'e';
    } else if (char === 'ans') {
        calculator.display += 'ans';
    } else {
        calculator.display += char;
    }
    updateDisplay();
}

function appendFunction(func) {
    calculator.display += func + '(';
    updateDisplay();
}

// Clear and backspace
function clearDisplay() {
    calculator.display = '';
    updateDisplay();
    resultDisplay.textContent = '0';
}

function backspace() {
    calculator.display = calculator.display.slice(0, -1);
    updateDisplay();
}

// Memory operations
function storeMemory() {
    if (resultDisplay.textContent !== '0') {
        calculator.memory = calculator.ans;
        updateMemoryDisplay();
        showNotification('Stored memory');
    }
}

function recallMemory() {
    calculator.display += calculator.memory.toString();
    updateDisplay();
}

function clearMemory() {
    calculator.memory = 0;
    updateMemoryDisplay();
    showNotification('Memory cleared');
}

// History
function clearHistory() {
    calculator.history = [];
    updateHistoryDisplay();
    showNotification('History cleared');
}

function toggleHistory() {
    historyPanel.classList.toggle('hidden');
}

// Parser - Port of C++ calculator logic
class Parser {
    constructor(expr) {
        this.expr = expr;
        this.pos = 0;
    }

    skipWS() {
        while (this.pos < this.expr.length && /\s/.test(this.expr[this.pos])) {
            this.pos++;
        }
    }

    peek() {
        this.skipWS();
        return this.pos < this.expr.length ? this.expr[this.pos] : '\0';
    }

    consume() {
        this.skipWS();
        return this.pos < this.expr.length ? this.expr[this.pos++] : '\0';
    }

    match(c) {
        if (this.peek() === c) {
            this.pos++;
            return true;
        }
        return false;
    }

    parseExpr() {
        let result = this.parseTerm();
        while (true) {
            if (this.match('+')) {
                result += this.parseTerm();
            } else if (this.match('-')) {
                result -= this.parseTerm();
            } else {
                break;
            }
        }
        return result;
    }

    parseTerm() {
        let result = this.parseFactor();
        while (true) {
            if (this.match('*')) {
                result *= this.parseFactor();
            } else if (this.match('/')) {
                const d = this.parseFactor();
                if (d === 0) throw new Error('Division by zero');
                result /= d;
            } else if (this.match('%')) {
                const d = this.parseFactor();
                if (d === 0) throw new Error('Modulo by zero');
                result %= d;
            } else {
                break;
            }
        }
        return result;
    }

    parseFactor() {
        let base = this.parseBase();
        if (this.match('^')) {
            let exp = this.parseFactor();
            return Math.pow(base, exp);
        }
        return base;
    }

    parseBase() {
        if (this.peek() === '-') {
            this.consume();
            return -this.parsePrimary();
        }
        if (this.peek() === '+') {
            this.consume();
            return this.parsePrimary();
        }
        return this.parsePrimary();
    }

    parsePrimary() {
        this.skipWS();
        if (this.peek() === '(') {
            this.consume();
            const val = this.parseExpr();
            if (!this.match(')')) throw new Error("Missing closing ')'");
            return val;
        }
        if (/\d/.test(this.peek()) || this.peek() === '.') {
            return this.parseNumber();
        }
        if (/[a-zA-Z_]/.test(this.peek())) {
            return this.parseIdent();
        }
        throw new Error(`Unexpected character: '${this.peek()}'`);
    }

    parseNumber() {
        const start = this.pos;
        while (this.pos < this.expr.length && (/\d/.test(this.expr[this.pos]) || this.expr[this.pos] === '.')) {
            this.pos++;
        }
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
        while (this.pos < this.expr.length && /[a-zA-Z0-9_]/.test(this.expr[this.pos])) {
            this.pos++;
        }
        const name = this.expr.substring(start, this.pos).toLowerCase();

        if (name === 'pi' || name === 'π') return PI;
        if (name === 'e') return E;
        if (name === 'ans') return calculator.ans;

        this.skipWS();
        if (this.peek() !== '(') {
            throw new Error(`Unknown identifier: ${name}`);
        }
        this.consume();
        const a = this.parseExpr();

        // Two-argument functions
        if (name === 'pow') {
            if (!this.match(',')) throw new Error('pow needs two arguments');
            const b = this.parseExpr();
            if (!this.match(')')) throw new Error("Missing ')'");
            return Math.pow(a, b);
        }

        if (name === 'hypot') {
            if (!this.match(',')) throw new Error('hypot needs two arguments');
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

        // One-argument functions
        if (!this.match(')')) throw new Error("Missing ')'");

        switch (name) {
            case 'sin': return Math.sin(a);
            case 'cos': return Math.cos(a);
            case 'tan': return Math.tan(a);
            case 'asin':
                if (a < -1 || a > 1) throw new Error('asin domain error');
                return Math.asin(a);
            case 'acos':
                if (a < -1 || a > 1) throw new Error('acos domain error');
                return Math.acos(a);
            case 'atan': return Math.atan(a);
            case 'sinh': return Math.sinh(a);
            case 'cosh': return Math.cosh(a);
            case 'tanh': return Math.tanh(a);
            case 'sqrt':
                if (a < 0) throw new Error('sqrt of negative');
                return Math.sqrt(a);
            case 'cbrt': return Math.cbrt(a);
            case 'log':
                if (a <= 0) throw new Error('log of non-positive');
                return Math.log(a);
            case 'log2':
                if (a <= 0) throw new Error('log2 of non-positive');
                return Math.log2(a);
            case 'log10':
                if (a <= 0) throw new Error('log10 of non-positive');
                return Math.log10(a);
            case 'exp': return Math.exp(a);
            case 'abs': return Math.abs(a);
            case 'ceil': return Math.ceil(a);
            case 'floor': return Math.floor(a);
            case 'round': return Math.round(a);
            case 'deg': return a * 180.0 / PI;
            case 'rad': return a * PI / 180.0;
            case 'fact':
                if (a < 0 || a !== Math.floor(a)) {
                    throw new Error('Factorial only for non-negative integers');
                }
                let r = 1;
                for (let i = 2; i <= a; i++) r *= i;
                return r;
            default:
                throw new Error(`Unknown function: ${name}`);
        }
    }

    parse() {
        const result = this.parseExpr();
        this.skipWS();
        if (this.pos !== this.expr.length) {
            throw new Error(`Unexpected token near: ${this.expr.substring(this.pos)}`);
        }
        return result;
    }
}

// Calculate
function calculate() {
    if (!calculator.display) {
        return;
    }

    try {
        const processed = calculator.display.replace(/mem/g, calculator.memory.toString());
        const parser = new Parser(processed);
        const result = parser.parse();

        calculator.ans = result;
        resultDisplay.textContent = formatNumber(result);

        const entry = `${calculator.display} = ${formatNumber(result)}`;
        calculator.history.push(entry);
        if (calculator.history.length > 50) {
            calculator.history.shift();
        }
        updateHistoryDisplay();
        saveState();
    } catch (error) {
        resultDisplay.textContent = `Error: ${error.message}`;
        showNotification(`Error: ${error.message}`, 'error');
    }
}

// Format number output
function formatNumber(v) {
    if (!isFinite(v)) {
        return v > 0 ? 'Infinity' : '-Infinity';
    }
    if (isNaN(v)) {
        return 'NaN';
    }
    if (v === Math.floor(v) && Math.abs(v) < 1e15) {
        return Math.floor(v).toString();
    }
    return v.toPrecision(10).replace(/\.?0+$/, '');
}

// Notification
function showNotification(msg, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'error' ? '#f44336' : '#4caf50'};
        color: white;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = msg;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

// Add keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        calculate();
    } else if (e.key === 'Escape') {
        clearDisplay();
    } else if (e.key === 'Backspace') {
        backspace();
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/' || e.key === '%' || e.key === '^') {
        e.preventDefault();
        appendChar(e.key);
    } else if (/\d|\.|\(|\)|,/.test(e.key)) {
        e.preventDefault();
        appendChar(e.key);
    }
});

// Initialize
loadState();
updateDisplay();
