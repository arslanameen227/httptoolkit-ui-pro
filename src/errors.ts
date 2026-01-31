// Firebase Analytics implementation - simplified to avoid bundling issues
import { v4 as uuid } from 'uuid';

import { UI_VERSION, serverVersion, desktopVersion } from './services/service-versions';
import { ApiError } from './services/server-api-types';

let firebaseInitialized: boolean | null = null;
let analyticsInstance: any = null;

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' || 
    (typeof window !== 'undefined' && window.location.hostname === 'localhost');

// Simple Firebase Analytics interface that falls back to console
export const FirebaseAnalytics = {
    init: async (config: any) => {
        if (firebaseInitialized !== null) return;

        // In development, always use console logging to avoid Firebase network issues
        if (isDevelopment) {
            firebaseInitialized = false;
            console.log('Firebase Analytics disabled in development - using console logging');
            return;
        }

        try {
            // Try to import Firebase dynamically to avoid bundling issues
            const { initializeApp } = await import('firebase/app');
            const { getAnalytics } = await import('firebase/analytics');
            
            const app = initializeApp(config);
            analyticsInstance = getAnalytics(app);
            firebaseInitialized = true;
            console.log('Firebase Analytics initialized successfully');
        } catch (error) {
            console.warn('Firebase Analytics initialization failed:', error);
            firebaseInitialized = false;
        }
    },
    logEvent: (eventName: string, parameters?: Record<string, any>) => {
        // Always log to console in development
        if (isDevelopment || !firebaseInitialized || !analyticsInstance) {
            console.log('Analytics event:', eventName, parameters);
            return;
        }

        try {
            import('firebase/analytics').then(({ logEvent }) => {
                // Use the stored analytics instance
                logEvent(analyticsInstance, eventName, parameters);
            }).catch(() => {
                console.log('Analytics event:', eventName, parameters);
            });
        } catch (error) {
            console.log('Analytics event:', eventName, parameters);
        }
    }
};

export function initFirebaseAnalytics(config?: any) {
    if (config) {
        FirebaseAnalytics.init(config);
    } else {
        console.log('Firebase Analytics disabled - no configuration provided');
    }
}

export function logErrorsAsUser(id: string | undefined) {
    if (firebaseInitialized && id) {
        FirebaseAnalytics.logEvent('error_tracking_enabled', { user_id: id });
    }
}

export function logError(error: Error | string | unknown, metadata: { [key: string]: any } = {}) {
    console.warn('Error:', error, metadata);
    
    FirebaseAnalytics.logEvent('error', {
        error_message: typeof error === 'string' ? error : error instanceof Error ? error.message : 'Unknown error',
        error_metadata: JSON.stringify(metadata)
    });
}

export function reportError(error: Error | string, metadata?: { [key: string]: any }) {
    console.warn('Error:', error, metadata);
    
    FirebaseAnalytics.logEvent('error_reported', {
        error_message: typeof error === 'string' ? error : error.message,
        error_metadata: JSON.stringify(metadata || {})
    });
}

export function reportApiError(error: ApiError) {
    console.warn('API Error:', error);
    
    FirebaseAnalytics.logEvent('api_error', {
        error_code: error.errorCode || error.apiError?.code,
        error_message: error.message,
        operation_name: error.operationName
    });
}
