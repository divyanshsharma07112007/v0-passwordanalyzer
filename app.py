from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import math
import re
import getpass

app = Flask(__name__)
CORS(app)

def analyze_password(password):
    
    MIN_RECOMMENDED_LENGTH = 12


# -------------------------------
# 1. CALCULATE SHANNON ENTROPY
# -------------------------------
def calculate_entropy(password):
    if not password:
        return 0

    freq = {}
    for ch in password:
        freq[ch] = freq.get(ch, 0) + 1

    entropy = 0
    length = len(password)

    for count in freq.values():
        p = count / length
        entropy -= p * math.log2(p)

    return entropy * length  # total bits



# -------------------------------
# 2. LOAD LEAKED PASSWORD FILE
# -------------------------------
def load_leaked_passwords(filename="leaked_passwords.txt"):
    try:
        with open(filename, "r", encoding="utf-8") as f:
            return set(p.strip() for p in f.readlines())
    except FileNotFoundError:
        return set()



# -------------------------------
# 3. DETECTION RULES
# -------------------------------
def has_sequence(password):
    for i in range(len(password) - 2):
        a, b, c = password[i], password[i + 1], password[i + 2]
        if ord(b) == ord(a) + 1 and ord(c) == ord(b) + 1:
            return True
        if ord(b) == ord(a) - 1 and ord(c) == ord(b) - 1:
            return True
    return False


def has_repeated_chars(password):
    return bool(re.search(r"(.)\1\1\1", password))  # 4 repeated chars


def has_common_patterns(password):
    common = ["password", "qwerty", "admin", "welcome", "abc123", "iloveyou"]
    p = password.lower()
    return any(c in p for c in common)



# -------------------------------
# 4. PASSWORD SCORING
# -------------------------------
def score_password(password, leaked_db):
    length = len(password)

    lower = any(c.islower() for c in password)
    upper = any(c.isupper() for c in password)
    digit = any(c.isdigit() for c in password)
    symbol = any(not c.isalnum() for c in password)

    classes = lower + upper + digit + symbol

    entropy = calculate_entropy(password)

    score = 0

    # Base from entropy (capped)
    score += min(int(entropy), 50)

    # Bonus: character variety
    score += classes * 10

    # Bonus: good length
    if length >= MIN_RECOMMENDED_LENGTH:
        score += 10
            # Penalties
    if has_repeated_chars(password):
        score -= 15
    if has_sequence(password):
        score -= 15
    if has_common_patterns(password):
        score -= 15
    if password in leaked_db:
        score -= 40

    return max(0, min(score, 100))



def strength_label(score):
    if score >= 85:
        return "Excellent"
    if score >= 65:
        return "Strong"
    if score >= 45:
        return "Moderate"
    if score >= 25:
        return "Weak"
    return "Very Weak"



# -------------------------------
# 5. MAIN PROGRAM
# -------------------------------
def main():
    leaked_db = load_leaked_passwords()

    print("=== Password Strength Analyzer ===")

    # -- Visibility toggle --
    choice = input("Show password while typing? (y/N): ").strip().lower()
    if choice == "y":
        # Visible input (use only for testing or when you are sure it's safe)
        password = input("Enter password (visible): ")
    else:
        # Hidden (secure) input
        try:
            password = getpass.getpass("Enter password: ")
        except Exception:
            # In some environments (e.g. certain IDE terminals) getpass may fail
            # Fall back to visible input with a warning
            print("(Warning: secure input unavailable; input will be visible)")
            password = input("Enter password (visible): ")

    score = score_password(password, leaked_db)
    entropy = calculate_entropy(password)

    print("\n=== REPORT ===")
    print(f"Strength Score: {score}/100")
    print(f"Strength Level: {strength_label(score)}")
    print(f"Entropy (bits): {entropy:.2f}")
    print(f"Length: {len(password)}")

    if password in leaked_db:
        print("\n⚠ WARNING: This password is found in leaked-password lists!")

    print("\nSuggestions:")

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
