import * as React from 'react';
import { observer } from 'mobx-react';
import { styled } from '../../styles';

import { EventGroup, GroupStats } from '../../model/view/grouping-store';
import { ArrowIcon } from '../../icons';

interface GroupHeaderProps {
    group: EventGroup;
    onToggleExpansion: () => void;
    onGroupClick: () => void;
}

const GroupHeaderContainer = styled.div<{ expanded: boolean }>`
    display: flex;
    align-items: center;
    padding: 8px 10px;
    background-color: ${p => (p as any).theme.mainLowlightBackground};
    border-bottom: 1px solid ${p => (p as any).theme.containerBorder};
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s;

    &:hover {
        background-color: ${p => (p as any).theme.containerBackground};
    }

    > * {
        margin-right: 8px;
    }

    > *:last-child {
        margin-right: 0;
    }
`;

const ExpandIcon = styled(ArrowIcon)<{ expanded: boolean }>`
    transition: transform 0.2s;
    transform: rotate(${p => (p as any).expanded ? '90deg' : '0deg'});
    color: ${p => (p as any).theme.mainColor};
    font-size: 12px;
`;

const GroupLabel = styled.div`
    flex: 1;
    font-weight: 600;
    color: ${p => (p as any).theme.mainColor};
    font-size: ${p => (p as any).theme.textSize};
`;

const GroupStatsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: ${p => (p as any).theme.textSize};
    color: ${p => (p as any).theme.lowlightText};
`;

const StatBadge = styled.span<{ variant?: 'success' | 'error' | 'neutral' }>`
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: 500;
    background-color: ${p => 
        (p as any).variant === 'success' ? 'rgba(34, 197, 94, 0.1)' :
        (p as any).variant === 'error' ? 'rgba(239, 68, 68, 0.1)' :
        'rgba(107, 114, 128, 0.1)'
    };
    color: ${p => 
        (p as any).variant === 'success' ? '#22c55e' :
        (p as any).variant === 'error' ? '#ef4444' :
        '#6b7280'
    };
`;

const ResponseTimeBadge = styled.span`
    font-family: ${p => (p as any).theme.monoFontFamily};
    font-size: 11px;
    color: ${p => (p as any).theme.lowlightText};
`;

export const GroupHeader = observer((props: GroupHeaderProps) => {
    const { group, onToggleExpansion, onGroupClick } = props;
    const { stats } = group;

    const handleHeaderClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleExpansion();
    };

    const handleLabelClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onGroupClick();
    };

    const getSuccessRate = () => {
        if (stats.totalRequests === 0) return 0;
        return Math.round((stats.successCount / stats.totalRequests) * 100);
    };

    const formatResponseTime = (ms: number) => {
        if (ms < 1000) return `${Math.round(ms)}ms`;
        return `${(ms / 1000).toFixed(1)}s`;
    };

    return (
        <GroupHeaderContainer 
            expanded={group.expanded}
            onClick={handleHeaderClick}
            role="button"
            aria-expanded={group.expanded}
            aria-label={`Domain ${group.label} with ${stats.totalRequests} requests`}
        >
            <ExpandIcon 
                direction="right" 
                expanded={group.expanded}
            />
            
            <GroupLabel onClick={handleLabelClick}>
                {group.label}
            </GroupLabel>

            <GroupStatsContainer>
                <StatBadge variant="neutral">
                    {stats.totalRequests} requests
                </StatBadge>

                {stats.successCount > 0 && (
                    <StatBadge variant="success">
                        {stats.successCount} success
                    </StatBadge>
                )}

                {stats.errorCount > 0 && (
                    <StatBadge variant="error">
                        {stats.errorCount} errors
                    </StatBadge>
                )}

                {stats.averageResponseTime > 0 && (
                    <ResponseTimeBadge>
                        ~{formatResponseTime(stats.averageResponseTime)}
                    </ResponseTimeBadge>
                )}

                <StatBadge variant="neutral">
                    {getSuccessRate()}% success
                </StatBadge>
            </GroupStatsContainer>
        </GroupHeaderContainer>
    );
});
