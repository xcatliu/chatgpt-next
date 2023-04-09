export function setCache(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getCache<T = any>(key: string): T | undefined {
  return JSON.parse(localStorage.getItem(key) ?? 'null') ?? undefined;
}

export function removeCache(key: string) {
  localStorage.removeItem(key);
}
