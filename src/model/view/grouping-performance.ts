import * as _ from 'lodash';
import { computed, observable } from 'mobx';

import { HttpExchangeView } from '../../types';
import { EventGroup, GroupStats } from './grouping-store';

// Performance optimization utilities for grouping operations
export class GroupingPerformanceUtils {
    private static groupCache = new Map<string, EventGroup[]>();
    private static statsCache = new Map<string, GroupStats>();
    private static maxCacheSize = 100;

    // Memoized grouping function with caching
    static memoizedGroupBy<T, K extends keyof T>(
        items: T[],
        keyFn: (item: T) => string,
        cacheKey: string
    ): _.Dictionary<T[]> {
        const fullCacheKey = `${cacheKey}:${items.length}`;
        
        if (this.groupCache.has(fullCacheKey)) {
            return _.groupBy(items, keyFn);
        }

        // Clear cache if it gets too large
        if (this.groupCache.size >= this.maxCacheSize) {
            const firstKey = this.groupCache.keys().next().value;
            this.groupCache.delete(firstKey);
        }

        const result = _.groupBy(items, keyFn);
        return result;
    }

    // Optimized stats calculation with caching
    static calculateStatsOptimized(events: HttpExchangeView[], cacheKey: string): GroupStats {
        if (this.statsCache.has(cacheKey)) {
            return this.statsCache.get(cacheKey)!;
        }

        const completedEvents = events.filter(e => e.isSuccessfulExchange());
        
        // Use more efficient counting
        const successCount = completedEvents.reduce((count, e) => 
            count + (e.response.statusCode >= 200 && e.response.statusCode < 400 ? 1 : 0), 0
        );

        const errorCount = completedEvents.reduce((count, e) => 
            count + (e.response.statusCode >= 400 ? 1 : 0), 0
        );

        // Optimize response time calculation
        const responseTimes = completedEvents
            .filter(e => e.timingEvents)
            .map(e => e.timingEvents!.responseBodyReceivedTimestamp - e.timingEvents!.requestSentTimestamp)
            .filter(t => t > 0);

        const averageResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
            : 0;

        // Use countBy for distribution (more efficient than manual counting)
        const methodDistribution = _.countBy(events, e => e.request.method);
        const statusDistribution = _.countBy(completedEvents, e => e.response.statusCode.toString());

        const stats: GroupStats = {
            totalRequests: events.length,
            successCount,
            errorCount,
            averageResponseTime,
            methodDistribution,
            statusDistribution
        };

        // Cache the result
        if (this.statsCache.size >= this.maxCacheSize) {
            const firstKey = this.statsCache.keys().next().value;
            this.statsCache.delete(firstKey);
        }
        this.statsCache.set(cacheKey, stats);

        return stats;
    }

    // Batch process events for better performance
    static batchProcessEvents<T, R>(
        items: T[],
        processor: (batch: T[]) => R[],
        batchSize: number = 100
    ): R[] {
        const results: R[] = [];
        
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchResults = processor(batch);
            results.push(...batchResults);
        }
        
        return results;
    }

    // Clear caches when needed
    static clearCaches() {
        this.groupCache.clear();
        this.statsCache.clear();
    }
}

// Virtual scrolling optimization for large lists
export interface VirtualizedGroupListProps {
    groups: EventGroup[];
    itemHeight: number;
    containerHeight: number;
    overscan?: number;
}

export class VirtualizedGroupListCalculator {
    static calculateVisibleRange(
        scrollTop: number,
        containerHeight: number,
        itemHeight: number,
        totalItems: number,
        overscan: number = 5
    ): { startIndex: number; endIndex: number } {
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
        const visibleItemCount = Math.ceil(containerHeight / itemHeight);
        const endIndex = Math.min(totalItems - 1, startIndex + visibleItemCount + overscan * 2);
        
        return { startIndex, endIndex };
    }

    static calculateTotalHeight(groups: EventGroup[], itemHeight: number): number {
        return groups.reduce((total, group) => {
            let groupHeight = itemHeight; // Header height
            if (group.expanded) {
                groupHeight += group.events.length * itemHeight;
                if (group.subGroups) {
                    groupHeight += this.calculateTotalHeight(group.subGroups, itemHeight);
                }
            }
            return total + groupHeight;
        }, 0);
    }

    static flattenGroups(groups: EventGroup[]): EventGroup[] {
        const result: EventGroup[] = [];
        
        const flatten = (groups: EventGroup[], level: number = 0) => {
            groups.forEach(group => {
                result.push({ ...group, level });
                if (group.expanded && group.subGroups) {
                    flatten(group.subGroups, level + 1);
                }
            });
        };
        
        flatten(groups);
        return result;
    }
}

// Lazy loading for large datasets
export class LazyGroupLoader {
    private loadedGroups = new Set<string>();
    private loadingPromises = new Map<string, Promise<EventGroup[]>>();

    async loadGroupOnDemand(
        groupKey: string,
        loader: () => Promise<EventGroup[]>
    ): Promise<EventGroup[]> {
        // Return cached result if available
        if (this.loadedGroups.has(groupKey)) {
            return this.loadingPromises.get(groupKey) || Promise.resolve([]);
        }

        // Return existing promise if loading
        if (this.loadingPromises.has(groupKey)) {
            return this.loadingPromises.get(groupKey)!;
        }

        // Start loading
        const promise = loader();
        this.loadingPromises.set(groupKey, promise);

        try {
            const result = await promise;
            this.loadedGroups.add(groupKey);
            return result;
        } finally {
            this.loadingPromises.delete(groupKey);
        }
    }

    preloadGroups(groupKeys: string[], loader: (key: string) => Promise<EventGroup[]>) {
        // Preload groups in background with priority
        const priorityKeys = groupKeys.slice(0, 10); // Limit concurrent preloads
        
        priorityKeys.forEach(key => {
            if (!this.loadedGroups.has(key) && !this.loadingPromises.has(key)) {
                this.loadGroupOnDemand(key, () => loader(key));
            }
        });
    }

    clearCache() {
        this.loadedGroups.clear();
        this.loadingPromises.clear();
    }
}

// Debounced grouping for real-time updates
export class DebouncedGrouping {
    private timeoutId: NodeJS.Timeout | null = null;
    private pendingUpdate = false;

    constructor(
        private delay: number = 300,
        private onGroupUpdate: (groups: EventGroup[]) => void
    ) {}

    scheduleUpdate(groups: EventGroup[]) {
        this.pendingUpdate = true;
        
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        this.timeoutId = setTimeout(() => {
            if (this.pendingUpdate) {
                this.onGroupUpdate(groups);
                this.pendingUpdate = false;
            }
        }, this.delay);
    }

    cancelPendingUpdate() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        this.pendingUpdate = false;
    }

    destroy() {
        this.cancelPendingUpdate();
    }
}

// Memory-efficient group storage
export class EfficientGroupStorage {
    private groups = new Map<string, WeakRef<EventGroup>>();
    private registry = new FinalizationRegistry((key: string) => {
        this.groups.delete(key);
    });

    storeGroup(group: EventGroup): void {
        const weakRef = new WeakRef(group);
        this.groups.set(group.key, weakRef);
        this.registry.register(group, group.key);
    }

    getGroup(key: string): EventGroup | undefined {
        const weakRef = this.groups.get(key);
        return weakRef?.deref();
    }

    hasGroup(key: string): boolean {
        return this.getGroup(key) !== undefined;
    }

    clear(): void {
        this.groups.clear();
    }
}
