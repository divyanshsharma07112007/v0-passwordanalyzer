'use client'

import { useState } from 'react'

export default function PasswordAnalyzerPage() {
  const [password, setPassword] = useState('')
  const [analysis, setAnalysis] = useState(null)

  const analyzePassword = (pwd: string) => {
    const results = {
      length: pwd.length,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumbers: /\d/.test(pwd),
      hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      consecutiveChars: /(.)\1{2,}/.test(pwd),
      sequentialChars: /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789|890)/i.test(pwd),
    }

    let score = 0
    if (results.length >= 8) score += 1
    if (results.length >= 12) score += 1
    if (results.hasUppercase) score += 1
    if (results.hasLowercase) score += 1
    if (results.hasNumbers) score += 1
    if (results.hasSpecialChars) score += 2
    if (results.length >= 16) score += 1
    if (!results.consecutiveChars) score += 1
    if (!results.sequentialChars) score += 1

    const strength = score <= 2 ? 'Weak' : score <= 4 ? 'Moderate' : score <= 6 ? 'Strong' : 'Excellent'
    const color = score <= 2 ? 'red' : score <= 4 ? 'orange' : score <= 6 ? 'blue' : 'green'

    const suggestions = []
    if (results.length < 12) suggestions.push('Use at least 12 characters')
    if (!results.hasUppercase) suggestions.push('Add uppercase letters')
    if (!results.hasLowercase) suggestions.push('Add lowercase letters')
    if (!results.hasNumbers) suggestions.push('Add numbers')
    if (!results.hasSpecialChars) suggestions.push('Add special characters (!@#$%^&*)')
    if (results.consecutiveChars) suggestions.push('Avoid repeating characters')
    if (results.sequentialChars) suggestions.push('Avoid sequential characters (abc, 123)')

    return { score, strength, color, suggestions, details: results }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value
    setPassword(pwd)
    if (pwd) {
      setAnalysis(analyzePassword(pwd))
    } else {
      setAnalysis(null)
    }
  }

  const getStrengthColor = (color: string) => {
    const colors: Record<string, string> = {
      red: '#ef4444',
      orange: '#f97316',
      blue: '#3b82f6',
      green: '#22c55e',
    }
    return colors[color] || '#6b7280'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Password Analyzer</h1>
          <p className="text-slate-400">Check your password strength instantly</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Input Section */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-3">
              Enter Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Type your password..."
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6">
              {/* Strength Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-300">Strength</span>
                  <span
                    className="text-sm font-bold px-3 py-1 rounded-full"
                    style={{
                      color: getStrengthColor(analysis.color),
                      backgroundColor: `${getStrengthColor(analysis.color)}20`,
                      border: `1px solid ${getStrengthColor(analysis.color)}40`,
                    }}
                  >
                    {analysis.strength}
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${Math.min((analysis.score / 9) * 100, 100)}%`,
                      backgroundColor: getStrengthColor(analysis.color),
                    }}
                  />
                </div>
              </div>

              {/* Score */}
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{analysis.score}/9</div>
                <p className="text-sm text-slate-400">Security Score</p>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase">Security Checks</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Length ≥ 12', status: analysis.details.length >= 12 },
                    { label: 'Uppercase', status: analysis.details.hasUppercase },
                    { label: 'Lowercase', status: analysis.details.hasLowercase },
                    { label: 'Numbers', status: analysis.details.hasNumbers },
                    { label: 'Special Chars', status: analysis.details.hasSpecialChars },
                    { label: 'No Patterns', status: !analysis.details.consecutiveChars && !analysis.details.sequentialChars },
                  ].map((check, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center text-xs font-bold text-white"
                        style={{
                          backgroundColor: check.status ? '#22c55e' : '#6b7280',
                        }}
                      >
                        {check.status ? '✓' : '✗'}
                      </div>
                      <span className="text-xs text-slate-400">{check.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              {analysis.suggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Suggestions</p>
                  <div className="space-y-2">
                    {analysis.suggestions.map((suggestion, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-yellow-500 font-bold mt-0.5">→</span>
                        <span className="text-sm text-slate-300">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!analysis && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🔐</div>
              <p className="text-slate-400 text-sm">Enter a password to analyze its strength</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Your password is analyzed locally. Nothing is sent to any server.
        </p>
      </div>
    </div>
  )
}
