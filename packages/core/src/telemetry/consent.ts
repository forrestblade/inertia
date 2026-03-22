/**
 * Do Not Track / Global Privacy Control / consent gate.
 *
 * `shouldTrack()` returns `false` when any of these signals are present:
 *   1. `navigator.doNotTrack === '1'`
 *   2. `navigator.globalPrivacyControl === true`
 *   3. `window.__valence_telemetry_consent === false`
 *
 * The function is intentionally cheap (three property reads) so it can be
 * called on every flush and every event delegation write.
 */

interface NavigatorWithGPC extends Navigator {
  globalPrivacyControl?: boolean
}

interface WindowWithConsent extends Window {
  __valence_telemetry_consent?: boolean
}

export function shouldTrack (): boolean {
  const nav = navigator as NavigatorWithGPC
  if (nav.doNotTrack === '1') return false
  if (nav.globalPrivacyControl === true) return false

  const win = globalThis as unknown as WindowWithConsent
  if (win.__valence_telemetry_consent === false) return false

  return true
}
