export class CachedMap<K, V> extends Map<K, V> {
  private id: string
  private debounceTimer: ReturnType<typeof setTimeout> | null = null

  constructor(id: string) {
    super()
    this.id = id

    const cachedData = localStorage.getItem(this.id)
    if (cachedData) {
      try {
        const data = JSON.parse(cachedData)
        for (const [key, value] of Object.entries(data)) {
          super.set(key as K, value as V)
        }
      } catch (e) {
        console.error(`Failed to parse cached data for ${this.id}`, e)
        localStorage.removeItem(this.id)
      }
    }
  }

  override set(key: K, value: V): this {
    super.set(key, value)
    this.persistCache()
    return this
  }

  override clear(): void {
    super.clear()
    this.persistCache()
  }

  private persistCache(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = setTimeout(() => {
      localStorage.setItem(
        this.id,
        JSON.stringify(Object.fromEntries(this.entries()))
      )
      this.debounceTimer = null
    }, 500) // 简单防抖
  }
}
