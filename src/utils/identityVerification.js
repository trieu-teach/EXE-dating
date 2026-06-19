/**
 * Detect the best available location for a user, used in default profile
 * fields. Front-end only — we never persist anything until the user
 * explicitly taps "Lưu".
 */
import { getCurrentPosition } from './imageFile.js'

export async function detectLocation() {
  try {
    const pos = await getCurrentPosition()
    return { ...pos, source: 'gps' }
  } catch (err) {
    return { source: 'manual', error: err.message }
  }
}
