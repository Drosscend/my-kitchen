/**
 * Names a device the way its owner recognises it, "Chrome sur Windows",
 * from the user agent of the browser that subscribed. Order matters:
 * Edge and Samsung Internet also claim to be Chrome, Chrome to be Safari.
 */
export function deviceLabel(userAgent: string) {
  const browser =
    [
      ['Edg/', 'Edge'],
      ['SamsungBrowser/', 'Samsung Internet'],
      ['Firefox/', 'Firefox'],
      ['FxiOS/', 'Firefox'],
      ['CriOS/', 'Chrome'],
      ['Chrome/', 'Chrome'],
      ['Safari/', 'Safari'],
    ].find(([token]) => userAgent.includes(token))?.[1] ?? 'Navigateur'
  const system = [
    ['iPhone', 'iPhone'],
    ['iPad', 'iPad'],
    ['Android', 'Android'],
    ['Windows', 'Windows'],
    ['Mac OS X', 'macOS'],
    ['Linux', 'Linux'],
  ].find(([token]) => userAgent.includes(token))?.[1]

  return system ? `${browser} sur ${system}` : browser
}
