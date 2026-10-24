
import { scamPatterns } from '../data/scams.js'

export function analyzeScamMessage(message) {
  const normalizedMessage = message.trim().toLowerCase()

  if (!normalizedMessage) {
    return {
      risk: 'unknown',
      matches: [],
      summary: 'Enter a message to check for warning signs.',
      advice: 'Never share your PIN, OTP, or password.',
    }
  }

  const matches = scamPatterns.filter((pattern) =>
    pattern.keywords.some((keyword) =>
      normalizedMessage.includes(keyword.toLowerCase())
    )
  )

  const hasHighRisk = matches.some((pattern) => pattern.risk === 'high')

  return {
    risk: hasHighRisk ? 'high' : matches.length ? 'medium' : 'low',
    matches,
    summary: hasHighRisk
      ? 'This message contains high-risk warning signs.'
      : matches.length
        ? 'This message contains warning signs worth checking.'
        : 'No known warning patterns were detected. This does not guarantee the message is safe.',
    advice: matches.length
      ? matches.map((pattern) => pattern.advice).join(' ')
      : 'Verify unexpected requests through an official channel. Never share your PIN or OTP.',
  }
}
