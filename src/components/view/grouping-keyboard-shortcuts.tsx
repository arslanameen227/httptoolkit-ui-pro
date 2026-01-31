import * as React from 'react';
import { useEffect, useCallback } from 'react';
import { useHotkeys } from '../../util/ui';

import { GroupingMode } from '../../model/view/grouping-store';

interface GroupingKeyboardShortcutsProps {
    groupingMode: GroupingMode;
    onGroupingModeChange: (mode: GroupingMode) => void;
    onExpandAllGroups: () => void;
    onCollapseAllGroups: () => void;
    onToggleCurrentGroup: () => void;
    onMoveToNextGroup: () => void;
    onMoveToPreviousGroup: () => void;
    onFilterByCurrentGroup: () => void;
    onClearGroupFilter: () => void;
    disabled?: boolean;
}

export const GroupingKeyboardShortcuts: React.FC<GroupingKeyboardShortcutsProps> = ({
    groupingMode,
    onGroupingModeChange,
    onExpandAllGroups,
    onCollapseAllGroups,
    onToggleCurrentGroup,
    onMoveToNextGroup,
    onMoveToPreviousGroup,
    onFilterByCurrentGroup,
    onClearGroupFilter,
    disabled = false
}) => {
    // Grouping mode shortcuts
    useHotkeys('Ctrl+G, Cmd+G', (e) => {
        if (disabled) return;
        e.preventDefault();
        
        // Cycle through grouping modes
        const modes: GroupingMode[] = [
            'chronological',
            'domain', 
            'domain-method',
            'domain-status',
            'method',
            'status',
            'source'
        ];
        
        const currentIndex = modes.indexOf(groupingMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        onGroupingModeChange(modes[nextIndex]);
    }, [groupingMode, onGroupingModeChange, disabled]);

    // Quick grouping mode shortcuts
    useHotkeys('Ctrl+Shift+D, Cmd+Shift+D', (e) => {
        if (disabled) return;
        e.preventDefault();
        onGroupingModeChange('domain');
    }, [onGroupingModeChange, disabled]);

    useHotkeys('Ctrl+Shift+M, Cmd+Shift+M', (e) => {
        if (disabled) return;
        e.preventDefault();
        onGroupingModeChange('method');
    }, [onGroupingModeChange, disabled]);

    useHotkeys('Ctrl+Shift+S, Cmd+Shift+S', (e) => {
        if (disabled) return;
        e.preventDefault();
        onGroupingModeChange('status');
    }, [onGroupingModeChange, disabled]);

    // Expand/collapse shortcuts
    useHotkeys('E', (e) => {
        if (disabled) return;
        e.preventDefault();
        onToggleCurrentGroup();
    }, [onToggleCurrentGroup, disabled]);

    useHotkeys('Ctrl+E, Cmd+E', (e) => {
        if (disabled) return;
        e.preventDefault();
        onExpandAllGroups();
    }, [onExpandAllGroups, disabled]);

    useHotkeys('Ctrl+Shift+E, Cmd+Shift+E', (e) => {
        if (disabled) return;
        e.preventDefault();
        onCollapseAllGroups();
    }, [onCollapseAllGroups, disabled]);

    // Navigation shortcuts
    useHotkeys('Ctrl+Down, Cmd+Down', (e) => {
        if (disabled) return;
        e.preventDefault();
        onMoveToNextGroup();
    }, [onMoveToNextGroup, disabled]);

    useHotkeys('Ctrl+Up, Cmd+Up', (e) => {
        if (disabled) return;
        e.preventDefault();
        onMoveToPreviousGroup();
    }, [onMoveToPreviousGroup, disabled]);

    // Filtering shortcuts
    useHotkeys('Ctrl+F, Cmd+F', (e) => {
        if (disabled) return;
        e.preventDefault();
        onFilterByCurrentGroup();
    }, [onFilterByCurrentGroup, disabled]);

    useHotkeys('Escape', (e) => {
        if (disabled) return;
        onClearGroupFilter();
    }, [onClearGroupFilter, disabled]);

    // Bulk operation shortcuts
    useHotkeys('Ctrl+A, Cmd+A', (e) => {
        if (disabled) return;
        e.preventDefault();
        // Select all groups (implementation dependent)
    }, [disabled]);

    useHotkeys('Delete', (e) => {
        if (disabled) return;
        // Delete selected group (implementation dependent)
    }, [disabled]);

    // Help shortcut
    useHotkeys('Ctrl+?, Cmd+?', (e) => {
        if (disabled) return;
        e.preventDefault();
        showKeyboardShortcutsHelp();
    }, [disabled]);

    return null;
};

// Help dialog for keyboard shortcuts
const showKeyboardShortcutsHelp = () => {
    const shortcuts = [
        { key: 'Ctrl+G / Cmd+G', description: 'Cycle through grouping modes' },
        { key: 'Ctrl+Shift+D', description: 'Group by domain' },
        { key: 'Ctrl+Shift+M', description: 'Group by method' },
        { key: 'Ctrl+Shift+S', description: 'Group by status' },
        { key: 'E', description: 'Toggle current group expansion' },
        { key: 'Ctrl+E / Cmd+E', description: 'Expand all groups' },
        { key: 'Ctrl+Shift+E', description: 'Collapse all groups' },
        { key: 'Ctrl+↓ / Cmd+↓', description: 'Move to next group' },
        { key: 'Ctrl+↑ / Cmd+↑', description: 'Move to previous group' },
        { key: 'Ctrl+F / Cmd+F', description: 'Filter by current group' },
        { key: 'Escape', description: 'Clear group filter' },
        { key: 'Ctrl+A / Cmd+A', description: 'Select all groups' },
        { key: 'Ctrl+? / Cmd+?', description: 'Show keyboard shortcuts' }
    ];

    console.group('🔧 HTTP Toolkit Grouping Keyboard Shortcuts');
    shortcuts.forEach(shortcut => {
        console.log(`${shortcut.key}: ${shortcut.description}`);
    });
    console.groupEnd();

    // In a real implementation, this would show a modal dialog
    alert('Keyboard shortcuts help has been logged to console. Press Ctrl+? anytime to see shortcuts.');
};

// Hook for grouping keyboard shortcuts
export const useGroupingKeyboardShortcuts = (props: Omit<GroupingKeyboardShortcutsProps, 'children'>) => {
    return <GroupingKeyboardShortcuts {...props} />;
};

// Utility function to check if a key combination is valid
export const isValidKeyCombo = (e: KeyboardEvent, expectedCombo: string): boolean => {
    const parts = expectedCombo.toLowerCase().split('+');
    const ctrl = parts.includes('ctrl');
    const cmd = parts.includes('cmd');
    const shift = parts.includes('shift');
    const alt = parts.includes('alt');
    const key = parts[parts.length - 1];

    return (
        e.ctrlKey === ctrl &&
        e.metaKey === cmd &&
        e.shiftKey === shift &&
        e.altKey === alt &&
        e.key.toLowerCase() === key
    );
};

// Context for sharing keyboard shortcut state
export const GroupingKeyboardContext = React.createContext<{
    isEnabled: boolean;
    setEnabled: (enabled: boolean) => void;
}>({
    isEnabled: true,
    setEnabled: () => {}
});

export const GroupingKeyboardProvider: React.FC<{
    children: React.ReactNode;
    initiallyEnabled?: boolean;
}> = ({ children, initiallyEnabled = true }) => {
    const [isEnabled, setIsEnabled] = React.useState(initiallyEnabled);

    return (
        <GroupingKeyboardContext.Provider value={{ isEnabled, setEnabled: setIsEnabled }}>
            {children}
        </GroupingKeyboardContext.Provider>
    );
};

export const useGroupingKeyboard = () => {
    return React.useContext(GroupingKeyboardContext);
};
