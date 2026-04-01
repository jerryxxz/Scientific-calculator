# Advanced Web Calculator

A modern, feature-rich calculator web application built with vanilla HTML, CSS, and JavaScript. Fully compatible with GitHub Pages for easy deployment.

## Features

✨ **Advanced Calculation Engine**
- Full expression parsing and evaluation
- Support for operators: `+`, `-`, `*`, `/`, `%`, `^` (exponentiation)
- Proper operator precedence and associativity
- Parentheses support

🧮 **Comprehensive Functions**
- **Trigonometric**: sin, cos, tan, asin, acos, atan, sinh, cosh, tanh
- **Logarithmic**: log, log₂, log₁₀, e^x
- **Other**: sqrt, ∛, |x|, ceil, floor, round, factorial
- **Constants**: π, e, ans (last result)

💾 **Memory Management**
- Store calculations to memory
- Recall stored values
- Clear memory
- Use `mem` keyword in expressions

📝 **Calculation History**
- Complete history of all calculations
- Click any history entry to reload it
- Persistent storage (survives page refresh)
- Clear history option

🎨 **Beautiful UI/UX**
- Modern, responsive design
- Dark gradient background
- Smooth animations and transitions
- Mobile-friendly layout
- Keyboard support

## How to Use

### Locally
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start calculating!

### Deploy to GitHub Pages

1. **Create a new repository** on GitHub (e.g., `web-calculator`)

2. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/web-calculator.git
   cd web-calculator
   ```

3. **Copy the files**:
   - `index.html`
   - `calculator.js`
   - `style.css`
   - `README.md`
   
   Into your repository folder.

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "Initial commit: Add web calculator"
   git push origin main
   ```

5. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "main" branch as the source
   - Save

6. **Access your calculator**:
   - Your app will be live at: `https://YOUR-USERNAME.github.io/web-calculator/`

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Calculate result |
| `Escape` | Clear display |
| `Backspace` | Delete last character |
| `Numbers & Operators` | Direct input |

## Examples

```
sin(pi/2)           → 1
log(100, 10)        → 2
sqrt(16) + 5^2      → 29
fact(5)             → 120
deg(pi)             → 180
abs(-5.5)           → 5.5
```

## Features Explained

### Memory System
- **Store**: Saves the current result to memory
- **Recall**: Inserts the stored memory value into your expression
- **MClear**: Clears the memory

### History
- All calculations are automatically saved
- Click any history entry to reload that expression
- History persists even after closing the page

### Expression with `mem`
You can use `mem` in expressions to refer to the stored memory value:
```
mem + 50
mem * 2
```

## Browser Support

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## File Structure

```
web-calculator/
├── index.html       # Main HTML structure
├── style.css        # Styling and layout
├── calculator.js    # Calculator logic and interactivity
└── README.md        # This file
```

## Technical Details

- **Parser Type**: Recursive descent parser (ported from C++)
- **Storage**: Browser localStorage for persistence
- **No Dependencies**: Pure vanilla JavaScript
- **Responsive**: CSS Grid and Flexbox for modern layouts

## Troubleshooting

**Calculator shows "Error"**
- Check your expression syntax
- Ensure all parentheses are closed
- Avoid division by zero
- Check domain errors (e.g., sqrt of negative, log of non-positive)

**History not saving**
- Check if localStorage is enabled in your browser
- Private/Incognito mode may not save data

**Functions not working**
- Function names are case-insensitive
- Two-argument functions need comma: `pow(2,3)`

## Future Enhancements

- [ ] Dark/Light theme toggle
- [ ] Custom variables
- [ ] More advanced functions (statistical, etc.)
- [ ] Graph plotting
- [ ] Scientific notation display
- [ ] Calculation steps breakdown

## License

Free to use and modify for personal or commercial projects.

---

**Created**: 2026

Made with 💜 for math enthusiasts and developers!
