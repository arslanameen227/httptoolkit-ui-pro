import * as React from 'react';
import { observer } from 'mobx-react';
import { styled } from '../../styles';

import { EventGroup } from '../../model/view/grouping-store';

interface BulkOperationsProps {
    selectedGroups: Set<string>;
    availableGroups: EventGroup[];
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onDeleteSelected: () => void;
    onPinSelected: () => void;
    onUnpinSelected: () => void;
    onExportSelected: () => void;
    onMarkAsReadSelected: () => void;
    onMarkAsUnreadSelected: () => void;
    disabled?: boolean;
}

const BulkOperationsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background-color: ${p => (p as any).theme.mainLowlightBackground};
    border-bottom: 1px solid ${p => (p as any).theme.containerBorder};
    font-size: ${p => (p as any).theme.textSize};
`;

const SelectionInfo = styled.span`
    color: ${p => (p as any).theme.mainColor};
    font-weight: 500;
    margin-right: 12px;
`;

const BulkButton = styled.button<{ variant?: 'primary' | 'danger' | 'secondary' }>`
    padding: 4px 8px;
    border: 1px solid ${p => {
        switch ((p as any).variant) {
            case 'primary': return (p as any).theme.popColor;
            case 'danger': return '#ef4444';
            default: return (p as any).theme.containerBorder;
        }
    }};
    border-radius: 4px;
    background-color: ${p => {
        switch ((p as any).variant) {
            case 'primary': return (p as any).theme.popColor;
            case 'danger': return '#ef4444';
            default: return (p as any).theme.mainBackground;
        }
    }};
    color: ${p => {
        switch ((p as any).variant) {
            case 'primary': 
            case 'danger': return 'white';
            default: return (p as any).theme.mainColor;
        }
    }};
    font-size: ${p => (p as any).theme.textSize};
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        opacity: 0.8;
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`;

const Separator = styled.div`
    width: 1px;
    height: 20px;
    background-color: ${p => (p as any).theme.containerBorder};
    margin: 0 8px;
`;

export const BulkOperationsBar = observer((props: BulkOperationsProps) => {
    const {
        selectedGroups,
        availableGroups,
        onSelectAll,
        onDeselectAll,
        onDeleteSelected,
        onPinSelected,
        onUnpinSelected,
        onExportSelected,
        onMarkAsReadSelected,
        onMarkAsUnreadSelected,
        disabled = false
    } = props;

    if (selectedGroups.size === 0) {
        return null;
    }

    const handleSelectAll = () => {
        const allGroupKeys = new Set(availableGroups.map(g => g.key));
        // This would need to be connected to the actual selection state
        onSelectAll();
    };

    const handleDeleteSelected = () => {
        const count = selectedGroups.size;
        if (confirm(`Delete ${count} selected group${count > 1 ? 's' : ''}? This will delete all events in these groups.`)) {
            onDeleteSelected();
        }
    };

    const handleExportSelected = () => {
        // Export selected groups to HAR or other format
        const groupsToExport = availableGroups.filter(g => selectedGroups.has(g.key));
        const totalEvents = groupsToExport.reduce((sum, g) => sum + g.stats.totalRequests, 0);
        
        if (totalEvents === 0) {
            alert('No events to export in selected groups.');
            return;
        }

        // In a real implementation, this would trigger a file download
        console.log('Exporting groups:', groupsToExport);
        alert(`Exporting ${totalEvents} events from ${selectedGroups.size} groups...`);
    };

    return (
        <BulkOperationsContainer>
            <SelectionInfo>
                {selectedGroups.size} group{selectedGroups.size > 1 ? 's' : ''} selected
            </SelectionInfo>

            <BulkButton onClick={handleSelectAll} disabled={disabled}>
                Select All
            </BulkButton>

            <BulkButton onClick={onDeselectAll} disabled={disabled}>
                Deselect All
            </BulkButton>

            <Separator />

            <BulkButton onClick={onPinSelected} disabled={disabled} variant="secondary">
                Pin Selected
            </BulkButton>

            <BulkButton onClick={onUnpinSelected} disabled={disabled} variant="secondary">
                Unpin Selected
            </BulkButton>

            <Separator />

            <BulkButton onClick={onMarkAsReadSelected} disabled={disabled} variant="secondary">
                Mark as Read
            </BulkButton>

            <BulkButton onClick={onMarkAsUnreadSelected} disabled={disabled} variant="secondary">
                Mark as Unread
            </BulkButton>

            <Separator />

            <BulkButton onClick={handleExportSelected} disabled={disabled} variant="primary">
                Export Selected
            </BulkButton>

            <BulkButton 
                onClick={handleDeleteSelected} 
                disabled={disabled} 
                variant="danger"
            >
                Delete Selected
            </BulkButton>
        </BulkOperationsContainer>
    );
});

// Context menu for bulk operations
interface GroupContextMenuProps {
    group: EventGroup;
    onPin: (groupKey: string) => void;
    onUnpin: (groupKey: string) => void;
    onDelete: (groupKey: string) => void;
    onExport: (groupKey: string) => void;
    onFilterBy: (groupKey: string) => void;
    onExpand: (groupKey: string) => void;
    onCollapse: (groupKey: string) => void;
    onSelect: (groupKey: string) => void;
    onDeselect: (groupKey: string) => void;
}

export const GroupContextMenu: React.FC<GroupContextMenuProps> = ({
    group,
    onPin,
    onUnpin,
    onDelete,
    onExport,
    onFilterBy,
    onExpand,
    onCollapse,
    onSelect,
    onDeselect
}) => {
    const handleDelete = () => {
        const eventCount = group.stats.totalRequests;
        if (confirm(`Delete group "${group.label}" with ${eventCount} events?`)) {
            onDelete(group.key);
        }
    };

    const handleExport = () => {
        console.log('Exporting group:', group);
        alert(`Exporting ${group.stats.totalRequests} events from "${group.label}"...`);
    };

    return (
        <div style={{
            position: 'absolute',
            backgroundColor: (props: any) => (props as any).theme?.mainBackground || 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '4px 0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '200px'
        }}>
            <div
                style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '12px'
                }}
                onClick={() => onExpand(group.key)}
            >
                Expand Group
            </div>
            
            <div
                style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '12px'
                }}
                onClick={() => onCollapse(group.key)}
            >
                Collapse Group
            </div>

            <div style={{ height: '1px', backgroundColor: '#ccc', margin: '4px 0' }} />

            <div
                style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '12px'
                }}
                onClick={() => onFilterBy(group.key)}
            >
                Filter by This Group
            </div>

            <div
                style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '12px'
                }}
                onClick={() => onSelect(group.key)}
            >
                Select Group
            </div>

            <div
                style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '12px'
                }}
                onClick={() => onDeselect(group.key)}
            >
                Deselect Group
            </div>

            <div style={{ height: '1px', backgroundColor: '#ccc', margin: '4px 0' }} />

            <div
                style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '12px'
                }}
                onClick={() => onPin(group.key)}
            >
                Pin Group
            </div>

            <div
                style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '12px'
                }}
                onClick={() => onUnpin(group.key)}
            >
                Unpin Group
            </div>

            <div
                style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '12px'
                }}
                onClick={handleExport}
            >
                Export Group
            </div>

            <div style={{ height: '1px', backgroundColor: '#ccc', margin: '4px 0' }} />

            <div
                style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#ef4444'
                }}
                onClick={handleDelete}
            >
                Delete Group
            </div>
        </div>
    );
};

// Hook for managing bulk selection
export const useBulkSelection = () => {
    const [selectedGroups, setSelectedGroups] = React.useState<Set<string>>(new Set());
    const [isBulkMode, setIsBulkMode] = React.useState(false);

    const toggleGroupSelection = React.useCallback((groupKey: string) => {
        setSelectedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupKey)) {
                newSet.delete(groupKey);
            } else {
                newSet.add(groupKey);
            }
            return newSet;
        });
    }, []);

    const selectAllGroups = React.useCallback((groupKeys: string[]) => {
        setSelectedGroups(new Set(groupKeys));
    }, []);

    const deselectAllGroups = React.useCallback(() => {
        setSelectedGroups(new Set());
    }, []);

    const clearSelection = React.useCallback(() => {
        setSelectedGroups(new Set());
        setIsBulkMode(false);
    }, []);

    return {
        selectedGroups,
        isBulkMode,
        setIsBulkMode,
        toggleGroupSelection,
        selectAllGroups,
        deselectAllGroups,
        clearSelection
    };
};
