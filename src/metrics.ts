// Firebase Analytics for metrics tracking
import { FirebaseAnalytics } from './errors';

export function initMetrics() {
    console.log('Firebase Analytics metrics initialized');
}

export function trackEvent(event: {
    category: string,
    action: string,
    value?: string
}) {
    if (event.category && event.action) {
        FirebaseAnalytics.logEvent(`${event.category}_${event.action}`, {
            category: event.category,
            action: event.action,
            value: event.value
        });
    }
}