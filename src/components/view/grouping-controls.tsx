import * as React from 'react';
import { observer } from 'mobx-react';
import { styled } from '../../styles';

import { GroupingMode } from '../../model/view/grouping-store';

interface GroupingControlsProps {
    groupingMode: GroupingMode;
    onGroupingModeChange: (mode: GroupingMode) => void;
    disabled?: boolean;
}

const ControlsContainer = styled.div`
    display: flex;
    align-items: center;
    margin-right: 10px;
`;

const GroupingLabel = styled.span`
    margin-right: 8px;
    font-size: ${p => (p as any).theme.textSize};
    color: ${p => (p as any).theme.mainColor};
    font-weight: 500;
`;

const GroupingSelect = styled.select`
    padding: 4px 8px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: ${p => (p as any).theme.textSize};
    cursor: pointer;

    &:focus {
        outline: 2px solid ${p => (p as any).theme.popColor};
        outline-offset: 1px;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const GroupingOption = styled.option`
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
`;

const getModeLabel = (mode: GroupingMode): string => {
    switch (mode) {
        case 'chronological': return 'Chronological';
        case 'domain': return 'Domain';
        case 'domain-method': return 'Domain + Method';
        case 'domain-status': return 'Domain + Status';
        case 'method': return 'Method';
        case 'status': return 'Status';
        case 'source': return 'Source';
        default: return mode;
    }
};

export const GroupingControls = observer((props: GroupingControlsProps) => {
    const { groupingMode, onGroupingModeChange, disabled = false } = props;

    const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onGroupingModeChange(e.target.value as GroupingMode);
    };

    const availableModes: GroupingMode[] = [
        'chronological',
        'domain',
        'domain-method',
        'domain-status',
        'method',
        'status',
        'source'
    ];

    return (
        <ControlsContainer>
            <GroupingLabel>Group by:</GroupingLabel>
            <GroupingSelect
                value={groupingMode}
                onChange={handleModeChange}
                disabled={disabled}
                aria-label="Group traffic by"
            >
                {availableModes.map(mode => (
                    <GroupingOption key={mode} value={mode}>
                        {getModeLabel(mode)}
                    </GroupingOption>
                ))}
            </GroupingSelect>
        </ControlsContainer>
    );
});
