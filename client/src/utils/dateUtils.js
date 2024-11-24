import { formatDistanceToNow, parseISO } from 'date-fns'

export function formatTimeAgo(isoString) {
  return formatDistanceToNow(parseISO(isoString), { addSuffix: true })
}

export function formatUTCTimestamp(isoString) {
  return isoString // Already in ISO format YYYY-MM-DDTHH:mm:ssZ
}

export function getCurrentISOString() {
  return new Date().toISOString()
}

export function getRelativeISOString(daysAgo) {
  const date = new Date()
  date.setUTCHours(0, 0, 0, 0) // Set to start of day in UTC
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().slice(0, 19) + 'Z' // Format as YYYY-MM-DDTHH:mm:ssZ
}

export function createTimestamp(dateStr, timeStr = '00:00') {
  // Creates timestamp like 2024-03-16T10:30:00Z
  const [year, month, day] = dateStr.split('-')
  const [hours, minutes] = timeStr.split(':')
  const date = new Date(Date.UTC(year, month - 1, day, hours, minutes))
  return date.toISOString()
}