export interface SSEEvent {
  event: string
  data: any
}

export class SSEClient {
  private url: string
  private formData?: FormData
  private eventSource?: EventSource
  private handlers: Map<string, (data: any) => void> = new Map()
  private onErrorHandler?: (error: Error) => void

  constructor(url: string, formData?: FormData) {
    this.url = url
    this.formData = formData
  }

  onEvent(event: string, handler: (data: any) => void): void {
    this.handlers.set(event, handler)
  }

  setOnError(handler: (error: Error) => void): void {
    this.onErrorHandler = handler
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // For POST with SSE, we use fetch with ReadableStream
      fetch(this.url, {
        method: 'POST',
        body: this.formData,
        headers: this.formData ? {} : { 'Accept': 'text/event-stream' },
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
          if (!response.body) {
            throw new Error('No response body')
          }

          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''
          let heartbeatTimer: ReturnType<typeof setTimeout>

          const resetHeartbeat = () => {
            clearTimeout(heartbeatTimer)
            heartbeatTimer = setTimeout(() => {
              this.handlers.get('heartbeat')?.( { time: Date.now() })
            }, 5000)
          }

          const processStream = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() || ''

                let eventName = ''
                for (const line of lines) {
                  if (line.startsWith('event: ')) {
                    eventName = line.slice(7).trim()
                  } else if (line.startsWith('data: ')) {
                    const dataStr = line.slice(6).trim()
                    if (dataStr && eventName) {
                      try {
                        const data = JSON.parse(dataStr)
                        const handler = this.handlers.get(eventName)
                        handler?.(data)
                        resetHeartbeat()
                      } catch (e) {
                        // Not valid JSON, skip
                      }
                    }
                  }
                }
              }
              resolve()
            } catch (error) {
              if (this.onErrorHandler) {
                this.onErrorHandler(error as Error)
              }
              reject(error)
            }
          }

          processStream()
        })
        .catch(error => {
          if (this.onErrorHandler) {
            this.onErrorHandler(error)
          }
          reject(error)
        })
    })
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close()
    }
  }
}
