import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { action, computed } from 'mobx';

import { styled } from '../../styles';
import { WithInjected } from '../../types';

import { UiStore } from '../../model/ui/ui-store';
import { ProxyStore } from '../../model/proxy-store';
import { EventsStore } from '../../model/events/events-store';
import { RulesStore } from '../../model/rules/rules-store';
import { AccountStore } from '../../model/account/account-store';
import { SendStore } from '../../model/send/send-store';

import { GroupingStore, GroupingMode } from '../../model/view/grouping-store';

import { ViewEventListFooter } from './view-event-list-footer';
import { ViewEventContextMenuBuilder } from './view-context-menu-builder';
import { GroupedEventList } from './grouped-event-list';
import { ViewEventList } from './view-event-list';

interface GroupedViewPageProps {
    className?: string;
    eventsStore: EventsStore;
    proxyStore: ProxyStore;
    uiStore: UiStore;
    accountStore: AccountStore;
    rulesStore: RulesStore;
    sendStore: SendStore;
    navigate: (path: string) => void;
    eventId?: string;
}

@inject('eventsStore')
@inject('proxyStore')
@inject('uiStore')
@inject('accountStore')
@inject('rulesStore')
@inject('sendStore')
@observer
class GroupedViewPage extends React.Component<GroupedViewPageProps> {
    private groupingStore = new GroupingStore();
    private contextMenuBuilder = new ViewEventContextMenuBuilder(
        this.props.accountStore,
        this.props.uiStore,
        this.onPin,
        this.onDelete,
        this.onBuildRuleFromExchange,
        this.onPrepareToResendRequest
    );

    @computed
    get selectedEvent() {
        const targetEventId = this.props.eventId || this.props.uiStore.selectedEventId;
        return _.find(this.props.eventsStore.events, { id: targetEventId });
    }

    @computed
    get filteredEventState() {
        const { events } = this.props.eventsStore;
        const { activeFilterSet } = this.props.uiStore;

        const filteredEvents = activeFilterSet.length === 0
            ? events
            : events.filter((event) => {
                if (event.isHttp() && event.wasTransformed) {
                    return activeFilterSet.every((f) => 
                        f.matches(event.downstream) || f.matches(event.upstream!)
                    );
                } else {
                    return activeFilterSet.every((f) => f.matches(event));
                }
            });

        return {
            filteredEvents,
            filteredEventCount: [filteredEvents.length, events.length]
        };
    }

    @computed
    get isGroupedView() {
        return this.groupingStore.groupingMode !== 'chronological';
    }

    render() {
        const { filteredEvents, filteredEventCount } = this.filteredEventState;
        const { isPaused } = this.props.eventsStore;

        return (
            <div className={this.props.className}>
                <ViewEventListFooter
                    allEvents={this.props.eventsStore.events}
                    filteredEvents={filteredEvents}
                    filteredCount={filteredEventCount}
                    onClear={this.onClear}
                    onFiltersConsidered={this.onSearchFiltersConsidered}
                    onScrollToEnd={this.onScrollToEnd}
                    onGroupingModeChange={this.onGroupingModeChange}
                    groupingMode={this.groupingStore.groupingMode}
                    searchInputRef={this.searchInputRef}
                />

                {this.isGroupedView ? (
                    <GroupedEventList
                        groups={this.groupingStore.groupedEvents}
                        selectedEventId={this.selectedEvent?.id}
                        onToggleGroupExpansion={this.onToggleGroupExpansion}
                        onGroupClick={this.onGroupClick}
                        onEventSelected={this.onSelected}
                        contextMenuBuilder={this.contextMenuBuilder}
                    />
                ) : (
                    <ViewEventList
                        events={this.props.eventsStore.events}
                        filteredEvents={filteredEvents}
                        selectedEvent={this.selectedEvent}
                        isPaused={isPaused}
                        contextMenuBuilder={this.contextMenuBuilder}
                        uiStore={this.props.uiStore}
                        moveSelection={this.moveSelection}
                        onSelected={this.onSelected}
                    />
                )}
            </div>
        );
    }

    private searchInputRef = React.createRef<HTMLInputElement>();

    @action.bound
    onGroupingModeChange(mode: GroupingMode) {
        this.groupingStore.setGroupingMode(mode);
    }

    @action.bound
    onToggleGroupExpansion(groupKey: string) {
        this.groupingStore.toggleGroupExpansion(groupKey);
    }

    @action.bound
    onGroupClick(groupKey: string) {
        // Filter by domain when group is clicked
        const domain = groupKey.replace('domain:', '');
        const currentFilters = this.props.uiStore.activeFilterSet;
        
        // Add or update hostname filter
        const hostnameFilter = currentFilters.find(f => f.toString().includes('hostname'));
        
        if (hostnameFilter) {
            // Update existing filter
            this.props.uiStore.setActiveFilterSet([
                ...currentFilters.filter(f => f !== hostnameFilter),
                // Create new hostname filter - would need proper filter creation
            ]);
        } else {
            // Add new hostname filter
            this.props.uiStore.setActiveFilterSet([
                ...currentFilters,
                // Create new hostname filter - would need proper filter creation
            ]);
        }
    }

    @action.bound
    onSearchFiltersConsidered(filters: any) {
        // Handle filter consideration
    }

    @action.bound
    onSelected(event: any) {
        this.props.uiStore.setSelectedEventId(event?.id);
        this.props.navigate(event ? `/view/${event.id}` : '/view');
    }

    @action.bound
    onClear() {
        this.props.eventsStore.clearInterceptedData(false);
    }

    @action.bound
    onScrollToEnd() {
        // Scroll to end implementation
    }

    @action.bound
    moveSelection(distance: number) {
        // Move selection implementation
    }

    @action.bound
    onPin(event: any) {
        event.pinned = !event.pinned;
    }

    @action.bound
    onDelete(event: any) {
        this.props.eventsStore.deleteEvent(event);
    }

    @action.bound
    onBuildRuleFromExchange(exchange: any) {
        // Build rule from exchange implementation
    }

    @action.bound
    onPrepareToResendRequest(exchange: any) {
        // Prepare to resend request implementation
    }
}

const StyledGroupedViewPage = styled(
    GroupedViewPage as unknown as WithInjected<
        typeof GroupedViewPage,
        | 'eventsStore'
        | 'proxyStore'
        | 'uiStore'
        | 'accountStore'
        | 'rulesStore'
        | 'sendStore'
        | 'navigate'
    >
)`
    height: 100vh;
    position: relative;
    display: flex;
    flex-direction: column;
`;

export { StyledGroupedViewPage as GroupedViewPage };
