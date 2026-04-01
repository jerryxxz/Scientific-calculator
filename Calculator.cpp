#include<bits/stdc++.h>
using namespace std;
const double PI = acos(-1.0);
const double E  = exp(1.0);
struct 
Calculator {
    double memory = 0.0;
    double ans    = 0.0;
    vector<string> history;
    string expr;
    size_t pos = 0;
    void skipWS() {
        while (pos<expr.size() && isspace((unsigned char)expr[pos])) ++pos;
    }

    char peek() {
        skipWS();
        return (pos < expr.size()) ? expr[pos] : '\0';
    }

    char consume() {
        skipWS();
        return (pos < expr.size()) ? expr[pos++] : '\0';
    }

    bool match(char c) {
        if (peek() == c) { ++pos; return true; }
        return false;
    }
    double parseExpr() {
        double result = parseTerm();
        while (true) {
            if      (match('+')) result += parseTerm();
            else if (match('-')) result -= parseTerm();
            else break;
        }
        return result;
    }

    double parseTerm() {
        double result = parseFactor();
        while (true) {
            if (match('*')) {
                result *= parseFactor();
            } else if (match('/')) {
                double d = parseFactor();
                if (d == 0.0) throw std::runtime_error("Division by zero");
                result /= d;
            } else if (match('%')) {
                double d = parseFactor();
                if (d == 0.0) throw std::runtime_error("Modulo by zero");
                result = fmod(result, d);
            } else break;
        }
        return result;
    }
    double parseFactor() {
        double base = parseBase();
        if (match('^')) {
            double exp = parseFactor();
            return pow(base, exp);
        }
        return base;
    }
    double parseBase() {
        if (peek() == '-') { consume(); return -parsePrimary(); }
        if (peek() == '+') { consume(); return  parsePrimary(); }
        return parsePrimary();
    }
    double parsePrimary() {
        skipWS();
        if (peek() == '(') {
            consume();
            double val = parseExpr();
            if (!match(')')) throw std::runtime_error("Missing closing ')'");
            return val;
        }
        if (isdigit((unsigned char)peek()) || peek() == '.') {
            return parseNumber();
        }
        if (isalpha((unsigned char)peek()) || peek() == '_') {
            return parseIdent();
        }

        throw runtime_error(
            string("Unexpected character: '") + peek() + "'");
    }

    double parseNumber() {
        size_t start = pos;
        while (pos<expr.size() && (isdigit((unsigned char)expr[pos]) || expr[pos] == '.')) ++pos;
        if (pos < expr.size() && (expr[pos] == 'e' || expr[pos] == 'E')) {
            ++pos;
            if (pos < expr.size() && (expr[pos] == '+' || expr[pos] == '-')) ++pos;
            while (pos < expr.size() && isdigit((unsigned char)expr[pos])) ++pos;
        }
        string tok = expr.substr(start, pos - start);
        try { return stod(tok); }
        catch (...) { throw runtime_error("Invalid number: " + tok); }
    }

    double parseIdent() {
        size_t start = pos;
        while (pos < expr.size() &&
               (isalnum((unsigned char)expr[pos]) || expr[pos] == '_')) ++pos;
        string name = expr.substr(start, pos - start);
        if (name == "pi" || name == "PI")  return PI;
        if (name == "e"  || name == "E")   return E;
        if (name == "ans")                 return ans;
        skipWS();
        if (peek() != '(')
            throw runtime_error("Unknown identifier: " + name);
        consume(); // '('
        double a = parseExpr();
        if (name == "pow") {
            if (!match(',')) throw runtime_error("pow needs two arguments");
            double b = parseExpr();
            if (!match(')')) throw runtime_error("Missing ')'");
            return pow(a, b);
        }
        if (name == "hypot") {
            if (!match(',')) throw runtime_error("hypot needs two arguments");
            double b = parseExpr();
            if (!match(')')) throw runtime_error("Missing ')'");
            return hypot(a, b);
        }
        if (name == "log" && peek() == ',') {
            consume(); 
            double base = parseExpr();
            if (!match(')')) throw runtime_error("Missing ')'");
            if (base <= 0 || base == 1)
                throw runtime_error("Invalid logarithm base");
            return log(a) / log(base);
        }

        if (!match(')')) throw runtime_error("Missing ')'");
        if (name == "sin")   return sin(a);
        if (name == "cos")   return cos(a);
        if (name == "tan")   return tan(a);
        if (name == "asin")  { if (a<-1||a>1) throw runtime_error("asin domain error"); return asin(a); }
        if (name == "acos")  { if (a<-1||a>1) throw runtime_error("acos domain error"); return acos(a); }
        if (name == "atan")  return atan(a);
        if (name == "sinh")  return sinh(a);
        if (name == "cosh")  return cosh(a);
        if (name == "tanh")  return tanh(a);
        if (name == "sqrt")  { if (a<0) throw runtime_error("sqrt of negative"); return sqrt(a); }
        if (name == "cbrt")  return cbrt(a);
        if (name == "log"  ) { if (a<=0) throw runtime_error("log of non-positive"); return log(a); }
        if (name == "log2" ) { if (a<=0) throw runtime_error("log2 of non-positive"); return log2(a); }
        if (name == "log10") { if (a<=0) throw runtime_error("log10 of non-positive"); return log10(a); }
        if (name == "exp"  ) return exp(a);
        if (name == "abs"  ) return fabs(a);
        if (name == "ceil" ) return ceil(a);
        if (name == "floor") return floor(a);
        if (name == "round") return round(a);
        if (name == "deg"  ) return a * 180.0 / PI;
        if (name == "rad"  ) return a * PI / 180.0;
        if (name == "fact" ) {
            if (a < 0 || a != floor(a))
                throw runtime_error("Factorial only for non-negative integers");
            long long n = (long long)a, r = 1;
            for (long long i = 2; i <= n; ++i) r *= i;
            return (double)r;
        }

        throw runtime_error("Unknown function: " + name);
    }


    double evaluate(const std::string& input) {
        expr = input;
        pos  = 0;
        double result = parseExpr();
        skipWS();
        if (pos != expr.size())
            throw runtime_error("Unexpected token near: " + expr.substr(pos));
        ans = result;
        return result;
    }
};
string format(double v) {
    if (isnan(v))  return "NaN";
    if (isinf(v))  return v > 0 ? "Infinity" : "-Infinity";
    if (v == floor(v) && fabs(v) < 1e15)
        return to_string((long long)v);
    ostringstream ss;
    ss << setprecision(10) << v;
    return ss.str();
}
void printHelp() {
    cout << R"(
               Advanced C++ Calculator                    
  Operators : + - * / % ^  (^ = power, right-assoc)       
  Constants : pi, e, ans                                
                                                          
 Functions (one-arg):                                    
    sin(x)  cos(x)  tan(x)   asin(x)  acos(x)  atan(x)        
    sinh(x) cosh(x) tanh(x)  sqrt(x)  cbrt(x)  exp(x)     
    log(x)  log2(x) log10(x) abs(x)   ceil(x)  floor(x)   
    round(x) deg(x) rad(x)   fact(x)                      
                                                          
  Functions (two-arg):                                   
    pow(x,y)   hypot(x,y)   log(x, base)                  
                                                          
  Commands:                                               
    store      save last result to memory                
    recall     retrieve memory value                     
    mclear     clear memory                              
    history    show calculation history                  
    clear      clear history                             
    help       show this help                            
    exit/quit  exit the calculator                       
)";
}

int main() {
    Calculator calc;
    string line;

    printHelp();
    cout << "\nType an expression and press Enter.\n\n";

    while (true) {
        cout << "calc> ";
        if (!getline(cin,line)) break;
        auto ltrim=line.find_first_not_of("\t\r\n");
        if (ltrim==string::npos) continue;
        line=line.substr(ltrim);
        auto rtrim=line.find_last_not_of("\t\r\n");
        if (rtrim != string::npos)line=line.substr(0,rtrim+1);
        if (line.empty()) continue;
        string low=line;
        transform(low.begin(),low.end(),low.begin(),::tolower);
        if(low=="exit"||low=="quit"){
            cout << "Goodbye!\n";
            break; 
        }
        if (low=="help") {printHelp(); continue;}
        if (low == "store") {
            calc.memory = calc.ans;
            cout << "  Stored " << format(calc.memory) << " in memory.\n";
            continue;
        }
        if (low == "recall") {
            cout << "  Memory = " << format(calc.memory) << "\n";
            continue;
        }
        if (low == "mclear") {
            calc.memory = 0;
            cout << "  Memory cleared.\n";
            continue;
        }
        if (low == "history") {
            if (calc.history.empty()) {
                cout << "  (no history yet)\n";
            } else {
                for (size_t i = 0; i < calc.history.size(); ++i)
                    cout << "  [" << (i+1) << "] " << calc.history[i] << "\n";
            }
            continue;
        }
        if (low == "clear") {
            calc.history.clear();
            cout << "  History cleared.\n";
            continue;
        }
        std::string processed = line;
        size_t mpos;
        while ((mpos = processed.find("mem")) != string::npos)
            processed.replace(mpos, 3, std::to_string(calc.memory));
        try {
            double result = calc.evaluate(processed);
            string entry = line + " = " + format(result);
            calc.history.push_back(entry);
            cout << "  = " << format(result) << "\n";
        } catch (const std::exception& ex) {
            std::cout << "  Error: " << ex.what() << "\n";
        }
    }

    return 0;
}