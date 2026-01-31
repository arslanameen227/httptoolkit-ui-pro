import * as React from 'react';
import { observer } from 'mobx-react';
import { styled } from '../../styles';

import { GroupingMode, EventGroup } from '../../model/view/grouping-store';

interface GroupFilterControlsProps {
    groupingMode: GroupingMode;
    selectedGroup?: string;
    availableGroups: EventGroup[];
    onGroupFilter: (groupKey?: string) => void;
    disabled?: boolean;
}

const FilterContainer = styled.div`
    display: flex;
    align-items: center;
    margin-right: 10px;
    gap: 8px;
`;

const FilterLabel = styled.span`
    font-size: ${p => (p as any).theme.textSize};
    color: ${p => (p as any).theme.mainColor};
    font-weight: 500;
`;

const FilterSelect = styled.select`
    padding: 4px 8px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: ${p => (p as any).theme.textSize};
    cursor: pointer;
    min-width: 150px;

    &:focus {
        outline: 2px solid ${p => (p as any).theme.popColor};
        outline-offset: 1px;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const FilterOption = styled.option`
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
`;

const ClearFilterButton = styled.button`
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

export const GroupFilterControls = (props: GroupFilterControlsProps) => {
    const { 
        groupingMode, 
        selectedGroup, 
        availableGroups, 
        onGroupFilter, 
        disabled = false 
    } = props;

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onGroupFilter(value === 'all' ? undefined : value);
    };

    const handleClearFilter = () => {
        onGroupFilter(undefined);
    };

    // Only show filter controls for non-chronological modes
    if (groupingMode === 'chronological' || availableGroups.length === 0) {
        return null;
    }

    const getFilterLabel = () => {
        switch (groupingMode) {
            case 'domain':
            case 'domain-method':
            case 'domain-status':
                return 'Domain:';
            case 'method':
                return 'Method:';
            case 'status':
                return 'Status:';
            case 'source':
                return 'Source:';
            default:
                return 'Filter:';
        }
    };

    return (
        <FilterContainer>
            <FilterLabel>{getFilterLabel()}</FilterLabel>
            <FilterSelect
                value={selectedGroup || 'all'}
                onChange={handleFilterChange}
                disabled={disabled}
                aria-label={`Filter by ${groupingMode}`}
            >
                <FilterOption value="all">All Groups</FilterOption>
                {availableGroups.map(group => (
                    <FilterOption key={group.key} value={group.key}>
                        {group.label} ({group.stats.totalRequests})
                    </FilterOption>
                ))}
            </FilterSelect>
            {selectedGroup && (
                <ClearFilterButton
                    onClick={handleClearFilter}
                    disabled={disabled}
                    aria-label="Clear group filter"
                >
                    Clear
                </ClearFilterButton>
            )}
        </FilterContainer>
    );
};
