import * as React from 'react';
import { observer } from 'mobx-react';
import { styled } from '../../styles';

import { EventGroup } from '../../model/view/grouping-store';
import { GroupHeader } from './group-header';

// Import existing event row components
import { EventRow } from './view-event-list';

interface GroupedEventListProps {
    groups: EventGroup[];
    selectedEventId?: string;
    onToggleGroupExpansion: (groupKey: string) => void;
    onGroupClick: (groupKey: string) => void;
    onEventSelected: (event: any) => void;
    contextMenuBuilder: any; // Would be ViewEventContextMenuBuilder
}

const GroupedEventListContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
`;

const GroupContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 1px;
`;

const GroupEventsContainer = styled.div<{ expanded: boolean }>`
    display: ${p => (p as any).expanded ? 'block' : 'none'};
    overflow: hidden;
`;

export const GroupedEventList = observer((props: GroupedEventListProps) => {
    const { 
        groups, 
        selectedEventId, 
        onToggleGroupExpansion, 
        onGroupClick, 
        onEventSelected,
        contextMenuBuilder 
    } = props;

    const handleGroupHeaderClick = (group: EventGroup) => {
        onToggleGroupExpansion(group.key);
    };

    const handleGroupLabelClick = (group: EventGroup) => {
        onGroupClick(group.key);
    };

    const renderGroup = (group: EventGroup) => {
        return (
            <GroupContainer key={group.key}>
                <GroupHeader
                    group={group}
                    onToggleExpansion={() => handleGroupHeaderClick(group)}
                    onGroupClick={() => handleGroupLabelClick(group)}
                />
                <GroupEventsContainer expanded={group.expanded}>
                    {group.events.map((event, index) => {
                        const isSelected = selectedEventId === event.id;
                        
                        return (
                            <EventRow
                                key={event.id}
                                index={index}
                                style={{}} // Would be calculated by react-window
                                data={{
                                    selectedEvent: isSelected ? event : undefined,
                                    events: group.events,
                                    contextMenuBuilder
                                }}
                            />
                        );
                    })}
                </GroupEventsContainer>
            </GroupContainer>
        );
    };

    if (groups.length === 0) {
        return (
            <GroupedEventListContainer>
                <div style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    color: (props as any).theme.lowlightText 
                }}>
                    No grouped events to display
                </div>
            </GroupedEventListContainer>
        );
    }

    return (
        <GroupedEventListContainer>
            {groups.map(renderGroup)}
        </GroupedEventListContainer>
    );
});
