import * as _ from 'lodash';
import { computed, observable, action } from 'mobx';

import { CollectedEvent, HttpExchangeView } from '../../types';

export type GroupingMode = 'chronological' | 'domain' | 'domain-method' | 'domain-status' | 'method' | 'status' | 'source';

export interface EventGroup {
    key: string;
    label: string;
    events: HttpExchangeView[];
    expanded: boolean;
    stats: GroupStats;
    subGroups?: EventGroup[];
    level: number;
    parentKey?: string;
}

export interface GroupStats {
    totalRequests: number;
    successCount: number;
    errorCount: number;
    averageResponseTime: number;
    methodDistribution?: { [method: string]: number };
    statusDistribution?: { [status: string]: number };
}

export interface GroupingConfig {
    mode: GroupingMode;
    secondaryMode?: GroupingMode;
    maxDepth: number;
}

export class GroupingStore {
    @observable groupingConfig: GroupingConfig = {
        mode: 'chronological',
        maxDepth: 2
    };
    @observable expandedGroups = new Set<string>();

    constructor() {}

    @action
    setGroupingMode(mode: GroupingMode) {
        this.groupingConfig.mode = mode;
        if (mode === 'chronological') {
            this.expandedGroups.clear();
        }
    }

    @action
    setGroupingConfig(config: Partial<GroupingConfig>) {
        this.groupingConfig = { ...this.groupingConfig, ...config };
        if (config.mode === 'chronological') {
            this.expandedGroups.clear();
        }
    }

    @action
    toggleGroupExpansion(groupKey: string) {
        if (this.expandedGroups.has(groupKey)) {
            this.expandedGroups.delete(groupKey);
        } else {
            this.expandedGroups.add(groupKey);
        }
    }

    @action
    expandAllGroups(groupKeys: string[]) {
        groupKeys.forEach(key => this.expandedGroups.add(key));
    }

    @action
    collapseAllGroups() {
        this.expandedGroups.clear();
    }

    @computed
    get groupedEvents(): EventGroup[] {
        if (this.groupingConfig.mode === 'chronological') {
            return [];
        }

        return this.createGroupedEvents();
    }

    @computed
    get availableGroupingModes(): GroupingMode[] {
        return ['chronological', 'domain', 'domain-method', 'domain-status', 'method', 'status', 'source'];
    }

    private createGroupedEvents(): EventGroup[] {
        const allEvents = this.getAllEvents();
        const httpEvents = allEvents.filter((event) => 
            (event as any).isHttp?.() === true
        ) as HttpExchangeView[];

        switch (this.groupingConfig.mode) {
            case 'domain':
                return this.groupByDomain(httpEvents);
            case 'domain-method':
                return this.groupByDomainThenMethod(httpEvents);
            case 'domain-status':
                return this.groupByDomainThenStatus(httpEvents);
            case 'method':
                return this.groupByMethod(httpEvents);
            case 'status':
                return this.groupByStatus(httpEvents);
            case 'source':
                return this.groupBySource(httpEvents);
            default:
                return [];
        }
    }

    private groupByDomain(events: HttpExchangeView[]): EventGroup[] {
        const grouped = _.groupBy(events, (event) => 
            event.request.parsedUrl.hostname.toLowerCase()
        );

        return _.map(grouped, (events, hostname) => {
            const stats = this.calculateGroupStats(events);
            const groupKey = `domain:${hostname}`;
            
            return {
                key: groupKey,
                label: hostname,
                events: _.sortBy(events, 'timestamp'),
                expanded: this.expandedGroups.has(groupKey),
                stats,
                level: 0
            };
        }).sort((a, b) => b.stats.totalRequests - a.stats.totalRequests);
    }

    private groupByDomainThenMethod(events: HttpExchangeView[]): EventGroup[] {
        const domainGroups = this.groupByDomain(events);
        
        return domainGroups.map(domainGroup => {
            const methodGroups = _.groupBy(domainGroup.events, event => event.request.method);
            const subGroups = _.map(methodGroups, (methodEvents, method) => {
                const stats = this.calculateGroupStats(methodEvents);
                const subGroupKey = `${domainGroup.key}:method:${method}`;
                
                return {
                    key: subGroupKey,
                    label: method,
                    events: _.sortBy(methodEvents, 'timestamp'),
                    expanded: this.expandedGroups.has(subGroupKey),
                    stats,
                    level: 1,
                    parentKey: domainGroup.key
                };
            }).sort((a, b) => b.stats.totalRequests - a.stats.totalRequests);

            return {
                ...domainGroup,
                subGroups,
                events: [] // Clear top-level events as they're now in subgroups
            };
        });
    }

    private groupByDomainThenStatus(events: HttpExchangeView[]): EventGroup[] {
        const domainGroups = this.groupByDomain(events);
        
        return domainGroups.map(domainGroup => {
            const statusGroups = _.groupBy(domainGroup.events, event => {
                if (!event.isSuccessfulExchange()) return 'pending';
                const status = event.response.statusCode;
                return status >= 200 && status < 300 ? '2xx' :
                       status >= 300 && status < 400 ? '3xx' :
                       status >= 400 && status < 500 ? '4xx' : '5xx';
            });
            
            const subGroups = _.map(statusGroups, (statusEvents, status) => {
                const stats = this.calculateGroupStats(statusEvents);
                const subGroupKey = `${domainGroup.key}:status:${status}`;
                
                return {
                    key: subGroupKey,
                    label: status,
                    events: _.sortBy(statusEvents, 'timestamp'),
                    expanded: this.expandedGroups.has(subGroupKey),
                    stats,
                    level: 1,
                    parentKey: domainGroup.key
                };
            }).sort((a, b) => b.stats.totalRequests - a.stats.totalRequests);

            return {
                ...domainGroup,
                subGroups,
                events: [] // Clear top-level events as they're now in subgroups
            };
        });
    }

    private groupByMethod(events: HttpExchangeView[]): EventGroup[] {
        const grouped = _.groupBy(events, event => event.request.method);

        return _.map(grouped, (methodEvents, method) => {
            const stats = this.calculateGroupStats(methodEvents);
            const groupKey = `method:${method}`;
            
            return {
                key: groupKey,
                label: method,
                events: _.sortBy(methodEvents, 'timestamp'),
                expanded: this.expandedGroups.has(groupKey),
                stats,
                level: 0
            };
        }).sort((a, b) => b.stats.totalRequests - a.stats.totalRequests);
    }

    private groupByStatus(events: HttpExchangeView[]): EventGroup[] {
        const grouped = _.groupBy(events, event => {
            if (!event.isSuccessfulExchange()) return 'pending';
            return event.response.statusCode.toString();
        });

        return _.map(grouped, (statusEvents, status) => {
            const stats = this.calculateGroupStats(statusEvents);
            const groupKey = `status:${status}`;
            
            return {
                key: groupKey,
                label: status,
                events: _.sortBy(statusEvents, 'timestamp'),
                expanded: this.expandedGroups.has(groupKey),
                stats,
                level: 0
            };
        }).sort((a, b) => {
            // Sort pending first, then by status code
            if (a.label === 'pending') return -1;
            if (b.label === 'pending') return 1;
            return parseInt(a.label) - parseInt(b.label);
        });
    }

    private groupBySource(events: HttpExchangeView[]): EventGroup[] {
        const grouped = _.groupBy(events, event => event.request.source.summary);

        return _.map(grouped, (sourceEvents, source) => {
            const stats = this.calculateGroupStats(sourceEvents);
            const groupKey = `source:${source}`;
            
            return {
                key: groupKey,
                label: source,
                events: _.sortBy(sourceEvents, 'timestamp'),
                expanded: this.expandedGroups.has(groupKey),
                stats,
                level: 0
            };
        }).sort((a, b) => b.stats.totalRequests - a.stats.totalRequests);
    }

    private calculateGroupStats(events: HttpExchangeView[]): GroupStats {
        const completedEvents = events.filter(e => e.isSuccessfulExchange());
        
        const successCount = completedEvents.filter(e => 
            e.response.statusCode >= 200 && e.response.statusCode < 400
        ).length;

        const errorCount = completedEvents.filter(e => 
            e.response.statusCode >= 400
        ).length;

        const responseTimes = completedEvents
            .filter(e => e.timingEvents)
            .map(e => (e.timingEvents?.bodyReceivedTimestamp || 0) - (e.timingEvents?.headersSentTimestamp || 0))
            .filter(t => t > 0);

        const averageResponseTime = responseTimes.length > 0
            ? _.mean(responseTimes)
            : 0;

        const methodDistribution = _.countBy(events, e => e.request.method);
        const statusDistribution = _.countBy(completedEvents, e => e.response.statusCode.toString());

        return {
            totalRequests: events.length,
            successCount,
            errorCount,
            averageResponseTime,
            methodDistribution,
            statusDistribution
        };
    }

    // This would be injected or passed in real implementation
    private getAllEvents(): CollectedEvent[] {
        // Placeholder - in real implementation this would come from EventsStore
        return [];
    }

    @computed
    get allGroupKeys(): string[] {
        const collectKeys = (groups: EventGroup[]): string[] => {
            let keys: string[] = [];
            groups.forEach(group => {
                keys.push(group.key);
                if (group.subGroups) {
                    keys = keys.concat(collectKeys(group.subGroups));
                }
            });
            return keys;
        };
        
        return collectKeys(this.groupedEvents);
    }
}
