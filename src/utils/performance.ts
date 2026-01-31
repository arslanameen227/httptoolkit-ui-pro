/**
 * Performance optimization utilities
 * Provides tools for monitoring and improving application performance
 */

// Performance monitoring interface
export interface PerformanceMetrics {
    componentName: string;
    renderTime: number;
    memoryUsage?: number;
    timestamp: number;
}

// Performance monitor class
export class PerformanceMonitor {
    private static metrics: PerformanceMetrics[] = [];
    private static observers: PerformanceObserver[] = [];

    // Start timing a component render
    static startTiming(componentName: string): () => PerformanceMetrics {
        const startTime = performance.now();
        const startMemory = this.getMemoryUsage();

        return (): PerformanceMetrics => {
            const endTime = performance.now();
            const endMemory = this.getMemoryUsage();
            
            const metrics: PerformanceMetrics = {
                componentName,
                renderTime: endTime - startTime,
                memoryUsage: endMemory && startMemory ? endMemory - startMemory : undefined,
                timestamp: Date.now()
            };

            this.metrics.push(metrics);
            return metrics;
        };
    }

    // Get current memory usage (if available)
    private static getMemoryUsage(): number | null {
        if ('memory' in performance) {
            return (performance as any).memory.usedJSHeapSize;
        }
        return null;
    }

    // Get all collected metrics
    static getMetrics(): PerformanceMetrics[] {
        return [...this.metrics];
    }

    // Get metrics for a specific component
    static getComponentMetrics(componentName: string): PerformanceMetrics[] {
        return this.metrics.filter(m => m.componentName === componentName);
    }

    // Get average render time for a component
    static getAverageRenderTime(componentName: string): number {
        const componentMetrics = this.getComponentMetrics(componentName);
        if (componentMetrics.length === 0) return 0;
        
        const total = componentMetrics.reduce((sum, m) => sum + m.renderTime, 0);
        return total / componentMetrics.length;
    }

    // Clear all metrics
    static clearMetrics(): void {
        this.metrics = [];
    }

    // Log performance summary
    static logSummary(): void {
        const summary = this.metrics.reduce((acc, metric) => {
            if (!acc[metric.componentName]) {
                acc[metric.componentName] = {
                    count: 0,
                    totalTime: 0,
                    avgTime: 0,
                    maxTime: 0
                };
            }
            
            const stats = acc[metric.componentName];
            stats.count++;
            stats.totalTime += metric.renderTime;
            stats.avgTime = stats.totalTime / stats.count;
            stats.maxTime = Math.max(stats.maxTime, metric.renderTime);
            
            return acc;
        }, {} as Record<string, any>);

        console.group('Performance Summary');
        Object.entries(summary).forEach(([component, stats]: [string, any]) => {
            console.log(`${component}:`, {
                renders: stats.count,
                avgTime: `${stats.avgTime.toFixed(2)}ms`,
                maxTime: `${stats.maxTime.toFixed(2)}ms`,
                totalTime: `${stats.totalTime.toFixed(2)}ms`
            });
        });
        console.groupEnd();
    }
}

// React hook for performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
    const renderCount = React.useRef(0);
    const lastRenderTime = React.useRef<number>(0);

    React.useEffect(() => {
        renderCount.current++;
        const now = performance.now();
        if (lastRenderTime.current > 0) {
            const renderTime = now - lastRenderTime.current;
            const metrics: PerformanceMetrics = {
                componentName,
                renderTime,
                timestamp: Date.now()
            };
            PerformanceMonitor.metrics.push(metrics);
        }
        lastRenderTime.current = now;
    });

    return {
        renderCount: renderCount.current,
        getMetrics: () => PerformanceMonitor.getComponentMetrics(componentName),
        getAverageTime: () => PerformanceMonitor.getAverageRenderTime(componentName)
    };
};

// Debounce utility for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Throttle utility for performance optimization
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Memoization utility for expensive computations
export const memoize = <T extends (...args: any[]) => any>(
    func: T,
    keyGenerator?: (...args: Parameters<T>) => string
): T => {
    const cache = new Map<string, ReturnType<T>>();
    
    return ((...args: Parameters<T>) => {
        const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
        
        if (cache.has(key)) {
            return cache.get(key);
        }
        
        const result = func(...args);
        cache.set(key, result);
        return result;
    }) as T;
};

// Virtual scrolling utility for large lists
export const useVirtualScroll = (
    items: any[],
    itemHeight: number,
    containerHeight: number
) => {
    const [scrollTop, setScrollTop] = React.useState(0);
    
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
        visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
        items.length
    );
    
    const visibleItems = items.slice(visibleStart, visibleEnd);
    const offsetY = visibleStart * itemHeight;
    
    const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);
    
    return {
        visibleItems,
        offsetY,
        totalHeight: items.length * itemHeight,
        handleScroll
    };
};

// Intersection observer for lazy loading
export const useIntersectionObserver = (
    ref: React.RefObject<Element>,
    options: IntersectionObserverInit = {}
) => {
    const [isIntersecting, setIsIntersecting] = React.useState(false);
    
    React.useEffect(() => {
        const element = ref.current;
        if (!element) return;
        
        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);
        
        observer.observe(element);
        
        return () => {
            observer.disconnect();
        };
    }, [ref, options]);
    
    return isIntersecting;
};

// Performance-optimized event handler
export const useOptimizedEventHandler = <T extends Event>(
    handler: (event: T) => void,
    options: {
        debounce?: number;
        throttle?: number;
        passive?: boolean;
    } = {}
) => {
    const { debounce: debounceMs, throttle: throttleMs, passive = true } = options;
    
    return React.useCallback((event: T) => {
        let optimizedHandler = handler;
        
        if (debounceMs) {
            optimizedHandler = debounce(handler, debounceMs);
        } else if (throttleMs) {
            optimizedHandler = throttle(handler, throttleMs);
        }
        
        optimizedHandler(event);
    }, [handler, debounceMs, throttleMs]);
};

// Bundle size monitoring
export const getBundleSize = async (): Promise<{
    total: number;
    compressed: number;
    chunks: Array<{ name: string; size: number }>;
}> => {
    try {
        const response = await fetch('/stats.json');
        const stats = await response.json();
        
        return {
            total: stats.assets.reduce((sum: number, asset: any) => sum + asset.size, 0),
            compressed: stats.assets.reduce((sum: number, asset: any) => sum + (asset.gzipSize || asset.size), 0),
            chunks: stats.assets.map((asset: any) => ({
                name: asset.name,
                size: asset.size
            }))
        };
    } catch (error) {
        console.warn('Could not fetch bundle stats:', error);
        return { total: 0, compressed: 0, chunks: [] };
    }
};

// Performance tips logger
export const logPerformanceTips = () => {
    const metrics = PerformanceMonitor.getMetrics();
    const slowComponents = metrics.filter(m => m.renderTime > 100); // Components taking >100ms
    
    if (slowComponents.length > 0) {
        console.group('Performance Tips');
        console.warn('Slow components detected:', slowComponents);
        console.log('Consider:');
        console.log('- Using React.memo() for expensive components');
        console.log('- Implementing virtual scrolling for large lists');
        console.log('- Debouncing input handlers');
        console.log('- Lazy loading non-critical components');
        console.groupEnd();
    }
};
