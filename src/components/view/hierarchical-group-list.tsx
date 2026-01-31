import * as React from 'react';
import { observer } from 'mobx-react';
import { styled } from '../../styles';

import { EventGroup } from '../../model/view/grouping-store';

interface HierarchicalGroupListProps {
    groups: EventGroup[];
    selectedEventId?: string;
    onToggleGroupExpansion: (groupKey: string) => void;
    onGroupClick: (groupKey: string) => void;
    onEventSelected: (event: any) => void;
    contextMenuBuilder: any;
    level?: number;
}

const HierarchicalContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`;

const GroupLevelContainer = styled.div<{ level: number }>`
    margin-left: ${p => (p as any).level * 20}px;
    border-left: ${p => (p as any).level > 0 ? '2px solid ' + (p as any).theme.containerBorder : 'none'};
    padding-left: ${p => (p as any).level > 0 ? '10px' : '0'};
`;

const GroupContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 1px;
`;

const SubGroupsContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const renderGroup = (
    group: EventGroup,
    props: Omit<HierarchicalGroupListProps, 'groups' | 'level'>,
    level: number = 0
) => {
    const handleGroupHeaderClick = () => {
        props.onToggleGroupExpansion(group.key);
    };

    const handleGroupLabelClick = () => {
        props.onGroupClick(group.key);
    };

    return (
        <GroupContainer key={group.key}>
            <GroupLevelContainer level={level}>
                {/* GroupHeader would be imported and used here */}
                <div style={{ 
                    padding: '8px 10px',
                    backgroundColor: (props as any).theme?.mainLowlightBackground || '#f5f5f5',
                    borderBottom: '1px solid #ddd',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
                    onClick={handleGroupHeaderClick}
                    role="button"
                    aria-expanded={group.expanded}
                >
                    <span style={{ 
                        transition: 'transform 0.2s',
                        transform: group.expanded ? 'rotate(90deg)' : '0deg',
                        fontSize: '12px'
                    }}>
                        ▶
                    </span>
                    <span style={{ fontWeight: 600, flex: 1 }}>
                        {group.label}
                    </span>
                    <span style={{ 
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '11px',
                        backgroundColor: 'rgba(107, 114, 128, 0.1)',
                        color: '#6b7280'
                    }}>
                        {group.stats.totalRequests}
                    </span>
                </div>
                
                {group.expanded && group.events.length > 0 && (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {group.events.map((event, index) => {
                            const isSelected = props.selectedEventId === event.id;
                            
                            return (
                                <div
                                    key={event.id}
                                    style={{
                                        padding: '4px 10px',
                                        backgroundColor: isSelected ? '#e3f2fd' : 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        borderBottom: '1px solid #f0f0f0'
                                    }}
                                    onClick={() => props.onEventSelected(event)}
                                    role="button"
                                    aria-selected={isSelected}
                                >
                                    {/* Event content would be rendered here */}
                                    {event.request.method} {event.request.parsedUrl.pathname}
                                </div>
                            );
                        })}
                    </div>
                )}
            </GroupLevelContainer>

            {group.expanded && group.subGroups && (
                <SubGroupsContainer>
                    {group.subGroups.map(subGroup => 
                        renderGroup(subGroup, props, level + 1)
                    )}
                </SubGroupsContainer>
            )}
        </GroupContainer>
    );
};

export const HierarchicalGroupList = observer((props: HierarchicalGroupListProps) => {
    const { groups, ...otherProps } = props;

    if (groups.length === 0) {
        return (
            <HierarchicalContainer>
                <div style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    color: '#999' 
                }}>
                    No grouped events to display
                </div>
            </HierarchicalContainer>
        );
    }

    return (
        <HierarchicalContainer>
            {groups.map(group => renderGroup(group, otherProps))}
        </HierarchicalContainer>
    );
});
