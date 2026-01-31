import * as React from 'react';
import { observer } from 'mobx-react';
import { styled } from '../../styles';

import { GroupingMode, EventGroup } from '../../model/view/grouping-store';

interface AdvancedFilterControlsProps {
    groupingMode: GroupingMode;
    availableGroups: EventGroup[];
    activeFilters: GroupFilter[];
    onAddFilter: (filter: GroupFilter) => void;
    onRemoveFilter: (filterId: string) => void;
    onUpdateFilter: (filterId: string, updates: Partial<GroupFilter>) => void;
    onClearAllFilters: () => void;
    disabled?: boolean;
}

export interface GroupFilter {
    id: string;
    type: 'group' | 'status' | 'method' | 'domain' | 'custom';
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
    value: string;
    label: string;
    enabled: boolean;
}

const AdvancedFilterContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background-color: ${p => (p as any).theme.mainLowlightBackground};
    border-bottom: 1px solid ${p => (p as any).theme.containerBorder};
`;

const FilterHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
`;

const FilterTitle = styled.h3`
    margin: 0;
    font-size: ${p => (p as any).theme.textSize};
    color: ${p => (p as any).theme.mainColor};
    font-weight: 600;
`;

const FilterActions = styled.div`
    display: flex;
    gap: 8px;
`;

const ActionButton = styled.button`
    padding: 4px 8px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: ${p => (p as any).theme.textSize};
    cursor: pointer;

    &:hover {
        background-color: ${p => (p as any).theme.containerBackground};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const FilterList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 200px;
    overflow-y: auto;
`;

const FilterItem = styled.div<{ enabled: boolean }>`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).enabled ? (p as any).theme.mainBackground : (p as any).theme.containerBackground};
    opacity: ${p => (p as any).enabled ? 1 : 0.6};
`;

const FilterCheckbox = styled.input`
    margin: 0;
`;

const FilterLabel = styled.span`
    flex: 1;
    font-size: ${p => (p as any).theme.textSize};
    color: ${p => (p as any).theme.mainColor};
`;

const FilterValue = styled.span`
    font-family: ${p => (p as any).theme.monoFontFamily};
    font-size: ${p => (p as any).theme.textSize};
    color: ${p => (p as any).theme.lowlightText};
    background-color: ${p => (p as any).theme.containerBackground};
    padding: 2px 4px;
    border-radius: 2px;
`;

const RemoveFilterButton = styled.button`
    padding: 2px 6px;
    border: 1px solid #ef4444;
    border-radius: 2px;
    background-color: #ef4444;
    color: white;
    font-size: 10px;
    cursor: pointer;

    &:hover {
        background-color: #dc2626;
    }
`;

const AddFilterContainer = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
`;

const FilterSelect = styled.select`
    padding: 4px 8px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: ${p => (p as any).theme.textSize};
`;

const FilterInput = styled.input`
    padding: 4px 8px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: ${p => (p as any).theme.textSize};
    flex: 1;
`;

const AddFilterButton = styled.button`
    padding: 4px 12px;
    border: 1px solid ${p => (p as any).theme.popColor};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.popColor};
    color: white;
    font-size: ${p => (p as any).theme.textSize};
    cursor: pointer;

    &:hover {
        opacity: 0.8;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

export const AdvancedFilterControls = observer((props: AdvancedFilterControlsProps) => {
    const {
        groupingMode,
        availableGroups,
        activeFilters,
        onAddFilter,
        onRemoveFilter,
        onUpdateFilter,
        onClearAllFilters,
        disabled = false
    } = props;

    const [newFilterType, setNewFilterType] = React.useState<'group' | 'status' | 'method' | 'domain'>('group');
    const [newFilterValue, setNewFilterValue] = React.useState('');

    const getAvailableFilterValues = () => {
        switch (newFilterType) {
            case 'group':
                return availableGroups.map(g => g.label);
            case 'status':
                return ['2xx', '3xx', '4xx', '5xx', 'pending'];
            case 'method':
                return ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
            case 'domain':
                return [...new Set(availableGroups.map(g => g.label))];
            default:
                return [];
        }
    };

    const handleAddFilter = () => {
        if (!newFilterValue.trim()) return;

        const filter: GroupFilter = {
            id: `filter-${Date.now()}`,
            type: newFilterType,
            operator: 'equals',
            value: newFilterValue,
            label: `${newFilterType}: ${newFilterValue}`,
            enabled: true
        };

        onAddFilter(filter);
        setNewFilterValue('');
    };

    const handleToggleFilter = (filterId: string) => {
        const filter = activeFilters.find(f => f.id === filterId);
        if (filter) {
            onUpdateFilter(filterId, { enabled: !filter.enabled });
        }
    };

    const getFilterDescription = (filter: GroupFilter) => {
        switch (filter.type) {
            case 'group':
                return `Group "${filter.value}"`;
            case 'status':
                return `Status ${filter.value}`;
            case 'method':
                return `Method ${filter.value}`;
            case 'domain':
                return `Domain ${filter.value}`;
            default:
                return filter.label;
        }
    };

    return (
        <AdvancedFilterContainer>
            <FilterHeader>
                <FilterTitle>Advanced Filters</FilterTitle>
                <FilterActions>
                    <ActionButton 
                        onClick={onClearAllFilters}
                        disabled={disabled || activeFilters.length === 0}
                    >
                        Clear All
                    </ActionButton>
                </FilterActions>
            </FilterHeader>

            <FilterList>
                {activeFilters.map(filter => (
                    <FilterItem key={filter.id} enabled={filter.enabled}>
                        <FilterCheckbox
                            type="checkbox"
                            checked={filter.enabled}
                            onChange={() => handleToggleFilter(filter.id)}
                        />
                        <FilterLabel>{getFilterDescription(filter)}</FilterLabel>
                        <FilterValue>{filter.value}</FilterValue>
                        <RemoveFilterButton
                            onClick={() => onRemoveFilter(filter.id)}
                            title="Remove filter"
                        >
                            ×
                        </RemoveFilterButton>
                    </FilterItem>
                ))}
            </FilterList>

            <AddFilterContainer>
                <FilterSelect
                    value={newFilterType}
                    onChange={(e) => setNewFilterType(e.target.value as any)}
                    disabled={disabled}
                >
                    <option value="group">Group</option>
                    <option value="status">Status</option>
                    <option value="method">Method</option>
                    <option value="domain">Domain</option>
                </FilterSelect>

                <FilterInput
                    type="text"
                    value={newFilterValue}
                    onChange={(e) => setNewFilterValue(e.target.value)}
                    placeholder={`Enter ${newFilterType} value...`}
                    disabled={disabled}
                    list={`${newFilterType}-suggestions`}
                />

                <datalist id={`${newFilterType}-suggestions`}>
                    {getAvailableFilterValues().map(value => (
                        <option key={value} value={value} />
                    ))}
                </datalist>

                <AddFilterButton
                    onClick={handleAddFilter}
                    disabled={disabled || !newFilterValue.trim()}
                >
                    Add Filter
                </AddFilterButton>
            </AddFilterContainer>
        </AdvancedFilterContainer>
    );
});

// Filter combination logic
export class FilterCombiner {
    static combineFilters(filters: GroupFilter[]): (group: EventGroup) => boolean {
        return (group: EventGroup) => {
            const enabledFilters = filters.filter(f => f.enabled);
            
            if (enabledFilters.length === 0) return true;

            return enabledFilters.every(filter => {
                switch (filter.type) {
                    case 'group':
                        return group.label.toLowerCase().includes(filter.value.toLowerCase());
                    case 'status':
                        return this.checkStatusFilter(group, filter);
                    case 'method':
                        return this.checkMethodFilter(group, filter);
                    case 'domain':
                        return this.checkDomainFilter(group, filter);
                    default:
                        return true;
                }
            });
        };
    }

    private static checkStatusFilter(group: EventGroup, filter: GroupFilter): boolean {
        const statusDistribution = group.stats.statusDistribution || {};
        const statusCount = statusDistribution[filter.value] || 0;
        
        switch (filter.operator) {
            case 'equals':
                return statusCount > 0;
            case 'greaterThan':
                return statusCount > parseInt(filter.value);
            case 'lessThan':
                return statusCount < parseInt(filter.value);
            default:
                return statusCount > 0;
        }
    }

    private static checkMethodFilter(group: EventGroup, filter: GroupFilter): boolean {
        const methodDistribution = group.stats.methodDistribution || {};
        const methodCount = methodDistribution[filter.value] || 0;
        
        switch (filter.operator) {
            case 'equals':
                return methodCount > 0;
            case 'greaterThan':
                return methodCount > parseInt(filter.value);
            case 'lessThan':
                return methodCount < parseInt(filter.value);
            default:
                return methodCount > 0;
        }
    }

    private static checkDomainFilter(group: EventGroup, filter: GroupFilter): boolean {
        return group.label.toLowerCase().includes(filter.value.toLowerCase());
    }

    static getFilterSummary(filters: GroupFilter[]): string {
        const enabledFilters = filters.filter(f => f.enabled);
        
        if (enabledFilters.length === 0) return 'No filters';
        
        const typeCounts = enabledFilters.reduce((acc, filter) => {
            acc[filter.type] = (acc[filter.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const summary = Object.entries(typeCounts)
            .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
            .join(', ');

        return `${enabledFilters.length} filter${enabledFilters.length > 1 ? 's' : ''}: ${summary}`;
    }
}

// Hook for managing advanced filters
export const useAdvancedFilters = () => {
    const [filters, setFilters] = React.useState<GroupFilter[]>([]);

    const addFilter = React.useCallback((filter: GroupFilter) => {
        setFilters(prev => [...prev, filter]);
    }, []);

    const removeFilter = React.useCallback((filterId: string) => {
        setFilters(prev => prev.filter(f => f.id !== filterId));
    }, []);

    const updateFilter = React.useCallback((filterId: string, updates: Partial<GroupFilter>) => {
        setFilters(prev => prev.map(f => 
            f.id === filterId ? { ...f, ...updates } : f
        ));
    }, []);

    const clearAllFilters = React.useCallback(() => {
        setFilters([]);
    }, []);

    const toggleFilter = React.useCallback((filterId: string) => {
        updateFilter(filterId, { enabled: !filters.find(f => f.id === filterId)?.enabled });
    }, [filters, updateFilter]);

    return {
        filters,
        addFilter,
        removeFilter,
        updateFilter,
        clearAllFilters,
        toggleFilter,
        filterCombiner: FilterCombiner.combineFilters(filters),
        filterSummary: FilterCombiner.getFilterSummary(filters)
    };
};
