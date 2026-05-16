/**
 * SilaiMart Scalable Analytics Service
 * Handles event queuing, batching, and persistence.
 */

const BATCH_SIZE = 10;
const BATCH_INTERVAL = 30000; // 30 seconds
const STORAGE_KEY = 'silaimart_analytics_queue';

class AnalyticsService {
  constructor() {
    this.queue = this._loadQueue();
    this.timer = null;
    this._setupAutoFlush();
  }

  _loadQueue() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  _persistQueue() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.error('[Analytics] Persistence failed:', e);
    }
  }

  track(eventName, eventData = {}) {
    const event = {
      eventId: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      event: eventName,
      properties: {
        ...eventData,
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screen: `${window.innerWidth}x${window.innerHeight}`
      }
    };

    console.log(`[Analytics Queue] ${eventName}:`, eventData);
    this.queue.push(event);
    this._persistQueue();

    if (this.queue.length >= BATCH_SIZE) {
      this.flush();
    }
  }

  async flush() {
    if (this.queue.length === 0 || !navigator.onLine) return;

    const batch = [...this.queue];
    this.queue = [];
    this._persistQueue();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/analytics/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch })
      });

      if (!response.ok) throw new Error('Batch delivery failed');
      console.log(`[Analytics] Successfully flushed ${batch.length} events`);
    } catch (error) {
      console.warn('[Analytics] Flush failed, preserving queue:', error);
      // Re-queue failed events (avoiding duplicates if they were somehow added while waiting)
      const existingIds = new Set(this.queue.map(e => e.eventId));
      const filteredBatch = batch.filter(e => !existingIds.has(e.eventId));
      this.queue = [...filteredBatch, ...this.queue].slice(0, 100); 
      this._persistQueue();
    }
  }

  _setupAutoFlush() {
    this.timer = setInterval(() => this.flush(), BATCH_INTERVAL);
    
    // Flush on page leave
    window.addEventListener('beforeunload', () => this.flush());
    
    // Auto-sync when coming back online
    window.addEventListener('online', () => this.flush());
  }
}

export const analytics = new AnalyticsService();
