from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import re
import string

app = Flask(__name__)
CORS(app)

def analyze_password(password):
    """Analyze password strength and return detailed report."""
    score = 0
    details = []
    suggestions = []
    
    # Length check
    if len(password) >= 8:
        score += 1
    else:
        suggestions.append("Use at least 8 characters")
    
    if len(password) >= 12:
        score += 1
    
    # Uppercase check
    if re.search(r'[A-Z]', password):
        score += 1
    else:
        suggestions.append("Add uppercase letters")
    
    # Lowercase check
    if re.search(r'[a-z]', password):
        score += 1
    else:
        suggestions.append("Add lowercase letters")
    
    # Digit check
    if re.search(r'\d', password):
        score += 1
    else:
        suggestions.append("Add numbers")
    
    # Special character check
    if re.search(r'[!@#$%^&*()_+\-=\[\]{};:\'",.<>?/\\|`~]', password):
        score += 1
    else:
        suggestions.append("Add special characters (!@#$%^&*)")
    
    # No common patterns
    if not re.search(r'(.)\1{2,}', password):
        score += 1
    else:
        suggestions.append("Avoid repeating characters")
    
    # Sequential characters check
    if not re.search(r'(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)', password.lower()):
        score += 1
    else:
        suggestions.append("Avoid sequential characters")
    
    # Determine strength
    strengths = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong", "Excellent", "Excellent", "Excellent"]
    strength = strengths[min(score, 8)]
    
    # Determine color
    colors = ["#ef4444", "#f97316", "#eab308", "#3b82f6", "#06b6d4", "#10b981", "#22c55e"]
    color = colors[min(score // 1, 6)]
    
    return {
        "score": min(score, 9),
        "strength": strength,
        "color": color,
        "suggestions": suggestions,
        "length": len(password),
        "has_uppercase": bool(re.search(r'[A-Z]', password)),
        "has_lowercase": bool(re.search(r'[a-z]', password)),
        "has_digits": bool(re.search(r'\d', password)),
        "has_special": bool(re.search(r'[!@#$%^&*()_+\-=\[\]{};:\'",.<>?/\\|`~]', password)),
        "no_repeating": not bool(re.search(r'(.)\1{2,}', password)),
        "no_sequential": not bool(re.search(r'(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)', password.lower()))
    }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    password = data.get('password', '')
    
    if not password:
        return jsonify({"error": "Password is required"}), 400
    
    result = analyze_password(password)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
