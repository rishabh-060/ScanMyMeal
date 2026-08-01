const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'cookie',
  'cvv',
])

const sanitize = (value) => {
  if (!value || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(sanitize)

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [
      key,
      SENSITIVE_KEYS.has(key) ? '[REDACTED]' : sanitize(nestedValue),
    ]),
  )
}

const write = (level, message, metadata = {}) => {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...sanitize(metadata),
  })
  const destination = level === 'error' ? process.stderr : process.stdout
  destination.write(`${entry}\n`)
}

module.exports = {
  info: (message, metadata) => write('info', message, metadata),
  warn: (message, metadata) => write('warn', message, metadata),
  error: (message, metadata) => write('error', message, metadata),
}
