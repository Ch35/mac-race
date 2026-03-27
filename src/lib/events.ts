// Simple event emitter for broadcasting data changes to SSE clients
type EventCallback = () => void;

class DataEventEmitter {
  private listeners: Set<EventCallback> = new Set();

  subscribe(callback: EventCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  emit(): void {
    this.listeners.forEach((callback) => callback());
  }
}

// Global singleton - survives across requests in development
// In production, consider using Redis pub/sub for multi-instance support
declare global {
  // eslint-disable-next-line no-var
  var dataEvents: DataEventEmitter | undefined;
}

export const dataEvents = globalThis.dataEvents ?? new DataEventEmitter();

if (process.env.NODE_ENV !== 'production') {
  globalThis.dataEvents = dataEvents;
}
