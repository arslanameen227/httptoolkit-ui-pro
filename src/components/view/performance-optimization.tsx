import * as React from 'react';
import { useEffect, useRef, useCallback, useMemo } from 'react';

// Performance monitoring and optimization utilities
export class GroupingPerformanceMonitor {
    private static instance: GroupingPerformanceMonitor;
    private metrics: Map<string, PerformanceMetric> = new Map();
    private observers: PerformanceObserver[] = [];
    private isEnabled = true;

    static getInstance(): GroupingPerformanceMonitor {
        if (!GroupingPerformanceMonitor.instance) {
            GroupingPerformanceMonitor.instance = new GroupingPerformanceMonitor();
        }
        return GroupingPerformanceMonitor.instance;
    }

    constructor() {
        this.setupPerformanceObservers();
    }

    private setupPerformanceObservers(): void {
        if (typeof PerformanceObserver !== 'undefined') {
            // Monitor long tasks
            try {
                const longTaskObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        this.recordMetric('long-task', {
                            duration: entry.duration,
                            startTime: entry.startTime,
                            name: entry.name
                        });
                    });
                });
                longTaskObserver.observe({ entryTypes: ['longtask'] });
                this.observers.push(longTaskObserver);
            } catch (e) {
                console.warn('Long task observer not supported');
            }

            // Measure paint performance
            try {
                const paintObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        this.recordMetric('paint', {
                            duration: entry.duration,
                            name: entry.name,
                            startTime: entry.startTime
                        });
                    });
                });
                paintObserver.observe({ entryTypes: ['paint'] });
                this.observers.push(paintObserver);
            } catch (e) {
                console.warn('Paint observer not supported');
            }
        }
    }

    recordMetric(name: string, data: PerformanceMetricData): void {
        if (!this.isEnabled) return;

        const metric: PerformanceMetric = {
            name,
            data,
            timestamp: Date.now(),
            id: `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        this.metrics.set(metric.id, metric);

        // Keep only recent metrics (last 1000)
        if (this.metrics.size > 1000) {
            const oldestId = Array.from(this.metrics.keys())[0];
            this.metrics.delete(oldestId);
        }

        // Check for performance warnings
        this.checkPerformanceWarnings(metric);
    }

    private checkPerformanceWarnings(metric: PerformanceMetric): void {
        const { name, data } = metric;

        switch (name) {
            case 'group-calculation':
                if (data.duration > 100) {
                    console.warn(`Slow group calculation: ${data.duration}ms`);
                }
                break;
            case 'render-group':
                if (data.duration > 16) {
                    console.warn(`Slow group render: ${data.duration}ms (should be <16ms for 60fps)`);
                }
                break;
            case 'filter-application':
                if (data.duration > 50) {
                    console.warn(`Slow filter application: ${data.duration}ms`);
                }
                break;
            case 'long-task':
                if (data.duration > 50) {
                    console.warn(`Long task detected: ${data.duration}ms`);
                }
                break;
        }
    }

    getMetrics(name?: string): PerformanceMetric[] {
        if (name) {
            return Array.from(this.metrics.values()).filter(m => m.name === name);
        }
        return Array.from(this.metrics.values());
    }

    getAverageMetric(name: string): number {
        const metrics = this.getMetrics(name);
        if (metrics.length === 0) return 0;
        
        const total = metrics.reduce((sum, m) => sum + (m.data.duration || 0), 0);
        return total / metrics.length;
    }

    getPerformanceReport(): PerformanceReport {
        const metrics = this.getMetrics();
        const report: PerformanceReport = {
            totalMetrics: metrics.length,
            averageGroupCalculation: this.getAverageMetric('group-calculation'),
            averageRenderTime: this.getAverageMetric('render-group'),
            averageFilterTime: this.getAverageMetric('filter-application'),
            longTaskCount: this.getMetrics('long-task').length,
            paintMetrics: this.getMetrics('paint'),
            recommendations: this.generateRecommendations(),
            score: this.calculatePerformanceScore()
        };

        return report;
    }

    private generateRecommendations(): string[] {
        const recommendations: string[] = [];
        
        if (this.getAverageMetric('group-calculation') > 50) {
            recommendations.push('Consider implementing virtual scrolling for large datasets');
        }
        
        if (this.getAverageMetric('render-group') > 16) {
            recommendations.push('Optimize group rendering to maintain 60fps');
        }
        
        if (this.getAverageMetric('filter-application') > 30) {
            recommendations.push('Optimize filter logic or implement debouncing');
        }
        
        if (this.getMetrics('long-task').length > 10) {
            recommendations.push('Break up long tasks to improve responsiveness');
        }
        
        return recommendations;
    }

    private calculatePerformanceScore(): number {
        let score = 100;
        
        // Deduct points for slow operations
        if (this.getAverageMetric('group-calculation') > 50) score -= 10;
        if (this.getAverageMetric('render-group') > 16) score -= 15;
        if (this.getAverageMetric('filter-application') > 30) score -= 10;
        
        // Deduct points for long tasks
        const longTaskCount = this.getMetrics('long-task').length;
        score -= Math.min(25, longTaskCount * 2);
        
        return Math.max(0, score);
    }

    enable(): void {
        this.isEnabled = true;
    }

    disable(): void {
        this.isEnabled = false;
    }

    clear(): void {
        this.metrics.clear();
    }

    destroy(): void {
        this.observers.forEach(observer => observer.disconnect());
        this.clear();
    }
}

// Performance optimization utilities
export class GroupingPerformanceOptimizer {
    // Memoization cache with TTL
    private static cache = new Map<string, CacheEntry>();
    private static readonly DEFAULT_TTL = 5000; // 5 seconds

    static memoize<T extends (...args: any[]) => any>(
        fn: T,
        keyGenerator?: (...args: Parameters<T>) => string,
        ttl: number = this.DEFAULT_TTL
    ): T {
        return ((...args: Parameters<T>) => {
            const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
            const cached = this.cache.get(key);
            
            if (cached && Date.now() - cached.timestamp < ttl) {
                return cached.value;
            }

            const result = fn(...args);
            this.cache.set(key, {
                value: result,
                timestamp: Date.now()
            });

            // Clean up expired entries
            this.cleanupCache();
            
            return result;
        }) as T;
    }

    private static cleanupCache(): void {
        const now = Date.now();
        this.cache.forEach((entry, key) => {
            if (now - entry.timestamp > this.DEFAULT_TTL) {
                this.cache.delete(key);
            }
        });
    }

    // Debounced function for frequent operations
    static debounce<T extends (...args: any[]) => any>(
        fn: T,
        delay: number
    ): T {
        let timeoutId: NodeJS.Timeout;
        
        return ((...args: Parameters<T>) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), delay);
        }) as T;
    }

    // Throttled function for rate limiting
    static throttle<T extends (...args: any[]) => any>(
        fn: T,
        delay: number
    ): T {
        let lastCall = 0;
        
        return ((...args: Parameters<T>) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return fn(...args);
            }
        }) as T;
    }

    // Batch processing for large datasets
    static batchProcess<T, R>(
        items: T[],
        processor: (batch: T[]) => R[],
        batchSize: number = 100,
        onProgress?: (progress: number) => void
    ): R[] {
        const results: R[] = [];
        const totalBatches = Math.ceil(items.length / batchSize);
        
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchResults = processor(batch);
            results.push(...batchResults);
            
            if (onProgress) {
                const progress = Math.round(((i + batchSize) / items.length) * 100);
                onProgress(progress);
            }
        }
        
        return results;
    }

    // Virtual scrolling optimization
    static calculateVisibleItems<T>(
        items: T[],
        scrollTop: number,
        containerHeight: number,
        itemHeight: number,
        overscan: number = 5
    ): { visibleItems: T[]; startIndex: number; endIndex: number } {
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2);
        
        return {
            visibleItems: items.slice(startIndex, endIndex + 1),
            startIndex,
            endIndex
        };
    }

    // Lazy loading for expensive operations
    static lazyLoad<T>(
        loader: () => Promise<T>,
        cacheKey?: string
    ): Promise<T> {
        if (cacheKey) {
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.DEFAULT_TTL) {
                return Promise.resolve(cached.value);
            }
        }

        return loader().then(result => {
            if (cacheKey) {
                this.cache.set(cacheKey, {
                    value: result,
                    timestamp: Date.now()
                });
            }
            return result;
        });
    }

    // Request animation frame optimization
    static requestAnimationFrame(callback: () => void): void {
        if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(callback);
        } else {
            setTimeout(callback, 16); // Fallback for ~60fps
        }
    }

    // Memory usage monitoring
    static getMemoryUsage(): MemoryUsage {
        if (typeof performance !== 'undefined' && (performance as any).memory) {
            const memory = (performance as any).memory;
            return {
                usedJSHeapSize: memory.usedJSHeapSize,
                totalJSHeapSize: memory.totalJSHeapSize,
                jsHeapSizeLimit: memory.jsHeapSizeLimit
            };
        }
        
        return {
            usedJSHeapSize: 0,
            totalJSHeapSize: 0,
            jsHeapSizeLimit: 0
        };
    }

    static checkMemoryPressure(): 'low' | 'medium' | 'high' {
        const usage = this.getMemoryUsage();
        const usageRatio = usage.usedJSHeapSize / usage.jsHeapSizeLimit;
        
        if (usageRatio > 0.9) return 'high';
        if (usageRatio > 0.7) return 'medium';
        return 'low';
    }

    // Clear cache when memory pressure is high
    static handleMemoryPressure(): void {
        const pressure = this.checkMemoryPressure();
        
        if (pressure === 'high') {
            // Clear cache to free memory
            this.cache.clear();
            
            // Force garbage collection if available (only in development)
            if (typeof (globalThis as any).gc === 'function') {
                (globalThis as any).gc();
            }
        }
    }
}

// Performance monitoring hook
export const usePerformanceMonitoring = (componentName: string) => {
    const monitor = React.useMemo(() => GroupingPerformanceMonitor.getInstance(), []);
    const startTimeRef = useRef<number>();

    const startTiming = useCallback((operation: string) => {
        startTimeRef.current = performance.now();
    }, []);

    const endTiming = useCallback((operation: string) => {
        if (startTimeRef.current) {
            const duration = performance.now() - startTimeRef.current;
            monitor.recordMetric(`${componentName}-${operation}`, {
                duration,
                operation,
                timestamp: Date.now()
            });
            startTimeRef.current = undefined;
        }
    }, [monitor, componentName]);

    const measureFunction = useCallback(<T extends (...args: any[]) => any>(
        fn: T,
        operationName: string
    ): T => {
        return GroupingPerformanceOptimizer.memoize(
            fn,
            (...args: Parameters<T>) => `${componentName}-${operationName}-${JSON.stringify(args)}`
        );
    }, [componentName]);

    const getPerformanceReport = useCallback(() => {
        return monitor.getPerformanceReport();
    }, [monitor]);

    return {
        startTiming,
        endTiming,
        measureFunction,
        getPerformanceReport
    };
};

// Performance optimization hook
export const usePerformanceOptimization = () => {
    const [memoryPressure, setMemoryPressure] = React.useState<'low' | 'medium' | 'high'>('low');

    React.useEffect(() => {
        const checkMemory = () => {
            const pressure = GroupingPerformanceOptimizer.checkMemoryPressure();
            setMemoryPressure(pressure);
            
            if (pressure === 'high') {
                GroupingPerformanceOptimizer.handleMemoryPressure();
            }
        };

        const interval = setInterval(checkMemory, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const memoize = React.useCallback(<T extends (...args: any[]) => any>(
        fn: T,
        deps?: React.DependencyList
    ) => {
        return React.useCallback(
            GroupingPerformanceOptimizer.memoize(fn),
            deps || []
        );
    }, []);

    const debounce = React.useCallback(<T extends (...args: any[]) => any>(
        fn: T,
        delay: number,
        deps?: React.DependencyList
    ) => {
        return React.useCallback(
            GroupingPerformanceOptimizer.debounce(fn, delay),
            deps || []
        );
    }, []);

    const throttle = React.useCallback(<T extends (...args: any[]) => any>(
        fn: T,
        delay: number,
        deps?: React.DependencyList
    ) => {
        return React.useCallback(
            GroupingPerformanceOptimizer.throttle(fn, delay),
            deps || []
        );
    }, []);

    return {
        memoryPressure,
        memoize,
        debounce,
        throttle
    };
};

// Type definitions
interface PerformanceMetric {
    id: string;
    name: string;
    data: PerformanceMetricData;
    timestamp: number;
}

interface PerformanceMetricData {
    duration: number;
    [key: string]: any;
}

interface CacheEntry {
    value: any;
    timestamp: number;
}

interface PerformanceReport {
    totalMetrics: number;
    averageGroupCalculation: number;
    averageRenderTime: number;
    averageFilterTime: number;
    longTaskCount: number;
    paintMetrics: PerformanceMetric[];
    recommendations: string[];
    score: number;
}

interface MemoryUsage {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
}
