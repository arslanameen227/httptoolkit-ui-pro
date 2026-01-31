import * as React from 'react';
import { useEffect, useRef, useCallback } from 'react';

// Accessibility utilities for grouping functionality
export class GroupingAccessibility {
    // ARIA label generators
    static generateGroupHeaderLabel(group: any): string {
        const { label, stats, expanded, subGroups } = group;
        const subGroupCount = subGroups?.length || 0;
        
        let label = `Group ${label} with ${stats.totalRequests} requests`;
        
        if (stats.successCount > 0) {
            label += `, ${stats.successCount} successful`;
        }
        
        if (stats.errorCount > 0) {
            label += `, ${stats.errorCount} errors`;
        }
        
        if (subGroupCount > 0) {
            label += `, ${subGroupCount} subgroups`;
        }
        
        label += `, ${expanded ? 'expanded' : 'collapsed'}`;
        
        return label;
    }

    static generateGroupingModeLabel(mode: string): string {
        const modeDescriptions: Record<string, string> = {
            'chronological': 'Chronological order - showing events in time sequence',
            'domain': 'Grouped by domain - organizing requests by hostname',
            'domain-method': 'Grouped by domain then method - organizing by hostname and HTTP method',
            'domain-status': 'Grouped by domain then status - organizing by hostname and response status',
            'method': 'Grouped by HTTP method - organizing by GET, POST, PUT, etc.',
            'status': 'Grouped by status code - organizing by 2xx, 3xx, 4xx, 5xx responses',
            'source': 'Grouped by source application - organizing by the originating application'
        };
        
        return modeDescriptions[mode] || mode;
    }

    static generateFilterLabel(filter: any): string {
        const { type, value, operator, enabled } = filter;
        
        if (!enabled) return `Disabled ${type} filter for ${value}`;
        
        const operatorDescriptions: Record<string, string> = {
            'equals': 'equal to',
            'contains': 'containing',
            'startsWith': 'starting with',
            'endsWith': 'ending with',
            'greaterThan': 'greater than',
            'lessThan': 'less than'
        };
        
        return `${type} filter ${operatorDescriptions[operator] || 'matching'} ${value}`;
    }

    // Screen reader announcements
    static announceGroupingChange(oldMode: string, newMode: string): void {
        const announcement = `Grouping mode changed from ${oldMode} to ${newMode}. ${this.generateGroupingModeLabel(newMode)}`;
        this.announceToScreenReader(announcement);
    }

    static announceGroupExpansion(groupKey: string, isExpanded: boolean): void {
        const action = isExpanded ? 'expanded' : 'collapsed';
        this.announceToScreenReader(`Group ${groupKey} ${action}`);
    }

    static announceFilterChange(filterCount: number, activeCount: number): void {
        this.announceToScreenReader(`${activeCount} of ${filterCount} filters are now active`);
    }

    static announceSelectionChange(selectedCount: number, totalGroups: number): void {
        this.announceToScreenReader(`${selectedCount} of ${totalGroups} groups selected`);
    }

    private static announceToScreenReader(message: string): void {
        // Create a live region for screen reader announcements
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        
        document.body.appendChild(announcement);
        announcement.textContent = message;
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Focus management
    static manageFocus(container: HTMLElement, direction: 'forward' | 'backward' = 'forward'): HTMLElement | null {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;
        
        const focusableArray = Array.from(focusableElements);
        
        if (focusableArray.length === 0) return null;
        
        const currentIndex = focusableArray.indexOf(document.activeElement as HTMLElement);
        
        if (direction === 'forward') {
            const nextIndex = currentIndex < focusableArray.length - 1 ? currentIndex + 1 : 0;
            return focusableArray[nextIndex];
        } else {
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableArray.length - 1;
            return focusableArray[prevIndex];
        }
    }

    // Keyboard navigation patterns
    static setupKeyboardNavigation(container: HTMLElement): void {
        container.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'Tab':
                    // Let default tab behavior work, but ensure focus trapping
                    break;
                case 'Enter':
                case ' ':
                    // Handle activation of focused elements
                    const target = event.target as HTMLElement;
                    if (target.getAttribute('role') === 'button' || target.tagName === 'BUTTON') {
                        target.click();
                        event.preventDefault();
                    }
                    break;
                case 'Escape':
                    // Return focus to parent or close modal
                    this.escapeFocusHandler(container);
                    event.preventDefault();
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                    // Custom arrow key navigation for groups
                    if (!event.ctrlKey && !event.metaKey) {
                        this.navigateGroups(container, event.key === 'ArrowDown');
                        event.preventDefault();
                    }
                    break;
                case 'Home':
                case 'End':
                    // Navigate to first/last group
                    this.navigateGroupEdges(container, event.key === 'Home');
                    event.preventDefault();
                    break;
            }
        });
    }

    private static escapeFocusHandler(container: HTMLElement): void {
        // Find the closest focusable parent or return to main content
        let currentElement = container;
        while (currentElement && currentElement !== document.body) {
            currentElement = currentElement.parentElement;
            if (currentElement && currentElement !== document.body) {
                const focusableParent = currentElement.querySelector('[tabindex="0"]') as HTMLElement;
                if (focusableParent) {
                    focusableParent.focus();
                    return;
                }
            }
        }
        
        // Fallback to main content area
        const mainContent = document.querySelector('main, [role="main"]') as HTMLElement;
        if (mainContent) {
            mainContent.focus();
        }
    }

    private static navigateGroups(container: HTMLElement, forward: boolean): void {
        const groups = container.querySelectorAll('[role="button"][aria-expanded]') as NodeListOf<HTMLElement>;
        const groupArray = Array.from(groups);
        
        if (groupArray.length === 0) return;
        
        const currentFocus = document.activeElement as HTMLElement;
        const currentIndex = groupArray.indexOf(currentFocus);
        
        let nextIndex: number;
        if (forward) {
            nextIndex = currentIndex < groupArray.length - 1 ? currentIndex + 1 : 0;
        } else {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : groupArray.length - 1;
        }
        
        groupArray[nextIndex].focus();
    }

    private static navigateGroupEdges(container: HTMLElement, toStart: boolean): void {
        const groups = container.querySelectorAll('[role="button"][aria-expanded]') as NodeListOf<HTMLElement>;
        const groupArray = Array.from(groups);
        
        if (groupArray.length === 0) return;
        
        const targetGroup = toStart ? groupArray[0] : groupArray[groupArray.length - 1];
        targetGroup.focus();
    }

    // High contrast mode support
    static setupHighContrastSupport(): void {
        // Check for high contrast mode
        const mediaQuery = window.matchMedia('(prefers-contrast: high)');
        
        const updateForHighContrast = (e: MediaQueryListEvent) => {
            if (e.matches) {
                document.body.classList.add('high-contrast');
                // Add high contrast specific styles
                this.addHighContrastStyles();
            } else {
                document.body.classList.remove('high-contrast');
                this.removeHighContrastStyles();
            }
        };

        mediaQuery.addListener(updateForHighContrast);
        updateForHighContrast(mediaQuery as any);
    }

    private static addHighContrastStyles(): void {
        const style = document.createElement('style');
        style.textContent = `
            .high-contrast .group-header {
                border: 2px solid ButtonText;
                background: ButtonFace;
                color: ButtonText;
            }
            
            .high-contrast .group-header:hover {
                background: Highlight;
                color: HighlightText;
            }
            
            .high-contrast .stat-badge {
                border: 1px solid ButtonText;
                background: ButtonFace;
                color: ButtonText;
            }
            
            .high-contrast .expand-icon {
                border: 1px solid ButtonText;
            }
        `;
        document.head.appendChild(style);
    }

    private static removeHighContrastStyles(): void {
        const styles = document.head.querySelectorAll('style[data-high-contrast]');
        styles.forEach(style => style.remove());
    }

    // Reduced motion support
    static setupReducedMotionSupport(): void {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const updateForReducedMotion = (e: MediaQueryListEvent) => {
            if (e.matches) {
                document.body.classList.add('reduced-motion');
            } else {
                document.body.classList.remove('reduced-motion');
            }
        };

        mediaQuery.addListener(updateForReducedMotion);
        updateForReducedMotion(mediaQuery as any);
    }
}

// Hook for accessibility features
export const useGroupingAccessibility = (containerRef: React.RefObject<HTMLElement>) => {
    const setupAccessibility = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        // Setup keyboard navigation
        GroupingAccessibility.setupKeyboardNavigation(container);
        
        // Setup high contrast support
        GroupingAccessibility.setupHighContrastSupport();
        
        // Setup reduced motion support
        GroupingAccessibility.setupReducedMotionSupport();
        
        // Add proper ARIA attributes
        setupAriaAttributes(container);
    }, [containerRef]);

    useEffect(() => {
        setupAccessibility();
        
        return () => {
            // Cleanup if needed
        };
    }, [setupAccessibility]);

    const announceChange = useCallback((type: string, ...args: any[]) => {
        switch (type) {
            case 'grouping-mode':
                GroupingAccessibility.announceGroupingChange(args[0], args[1]);
                break;
            case 'group-expansion':
                GroupingAccessibility.announceGroupExpansion(args[0], args[1]);
                break;
            case 'filter-change':
                GroupingAccessibility.announceFilterChange(args[0], args[1]);
                break;
            case 'selection-change':
                GroupingAccessibility.announceSelectionChange(args[0], args[1]);
                break;
        }
    }, []);

    return { announceChange };
};

// Helper function to setup ARIA attributes
function setupAriaAttributes(container: HTMLElement): void {
    // Setup proper ARIA roles and labels
    const groupHeaders = container.querySelectorAll('[data-group-header]');
    groupHeaders.forEach((header, index) => {
        header.setAttribute('role', 'button');
        header.setAttribute('aria-expanded', 'false');
        header.setAttribute('aria-controls', `group-content-${index}`);
        header.setAttribute('tabindex', '0');
    });

    // Setup group content areas
    const groupContents = container.querySelectorAll('[data-group-content]');
    groupContents.forEach((content, index) => {
        content.setAttribute('role', 'region');
        content.setAttribute('aria-labelledby', `group-header-${index}`);
        content.setAttribute('aria-hidden', 'true');
    });

    // Setup filter controls
    const filterControls = container.querySelectorAll('[data-filter]');
    filterControls.forEach((filter) => {
        filter.setAttribute('role', 'option');
        filter.setAttribute('aria-selected', 'false');
    });

    // Setup bulk operations
    const bulkOps = container.querySelectorAll('[data-bulk-operation]');
    bulkOps.forEach((op) => {
        op.setAttribute('role', 'button');
        op.setAttribute('aria-label', op.getAttribute('title') || '');
    });
}

// Accessibility testing utilities
export class AccessibilityTester {
    static runAccessibilityAudit(container: HTMLElement): AccessibilityReport {
        const report: AccessibilityReport = {
            passed: [],
            warnings: [],
            errors: [],
            score: 0
        };

        // Check for proper ARIA attributes
        this.checkAriaAttributes(container, report);
        
        // Check keyboard navigation
        this.checkKeyboardNavigation(container, report);
        
        // Check color contrast
        this.checkColorContrast(container, report);
        
        // Check focus management
        this.checkFocusManagement(container, report);
        
        // Calculate score
        report.score = this.calculateAccessibilityScore(report);

        return report;
    }

    private static checkAriaAttributes(container: HTMLElement, report: AccessibilityReport): void {
        const headers = container.querySelectorAll('[data-group-header]');
        
        headers.forEach((header, index) => {
            if (!header.getAttribute('role')) {
                report.warnings.push(`Group header ${index} missing role attribute`);
            }
            
            if (!header.getAttribute('aria-expanded')) {
                report.errors.push(`Group header ${index} missing aria-expanded attribute`);
            }
            
            if (!header.getAttribute('aria-controls')) {
                report.warnings.push(`Group header ${index} missing aria-controls attribute`);
            }
            
            if (header.getAttribute('tabindex') === null) {
                report.warnings.push(`Group header ${index} missing tabindex attribute`);
            }
        });

        if (report.warnings.length === 0) {
            report.passed.push('All group headers have proper ARIA attributes');
        }
    }

    private static checkKeyboardNavigation(container: HTMLElement, report: AccessibilityReport): void {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) {
            report.errors.push('No focusable elements found in grouping container');
            return;
        }

        // Check for proper tab order
        let previousTabIndex = -1;
        focusableElements.forEach((element, index) => {
            const tabIndex = parseInt(element.getAttribute('tabindex') || '0');
            
            if (tabIndex < 0) {
                report.warnings.push(`Element ${index} has negative tabindex`);
            }
            
            if (tabIndex < previousTabIndex) {
                report.warnings.push(`Element ${index} has tabindex out of order`);
            }
            
            previousTabIndex = tabIndex;
        });

        if (report.warnings.length === 0) {
            report.passed.push('Keyboard navigation is properly structured');
        }
    }

    private static checkColorContrast(container: HTMLElement, report: AccessibilityReport): void {
        // This would require a color contrast calculation library
        // For now, just check for high contrast mode support
        const hasHighContrastStyles = document.querySelector('style[data-high-contrast]');
        
        if (!hasHighContrastStyles) {
            report.warnings.push('No high contrast mode styles detected');
        } else {
            report.passed.push('High contrast mode styles are present');
        }
    }

    private static checkFocusManagement(container: HTMLElement, report: AccessibilityReport): void {
        // Check for focus indicators
        const style = window.getComputedStyle(container);
        const focusStyles = ['outline', 'box-shadow', 'border'];
        
        const hasFocusIndicator = focusStyles.some(prop => {
            const value = style.getPropertyValue(prop);
            return value && value !== 'none' && value !== '0px';
        });

        if (!hasFocusIndicator) {
            report.warnings.push('No visible focus indicators found');
        } else {
            report.passed.push('Focus indicators are present');
        }
    }

    private static calculateAccessibilityScore(report: AccessibilityReport): number {
        const totalChecks = report.passed.length + report.warnings.length + report.errors.length;
        const passedChecks = report.passed.length;
        
        if (totalChecks === 0) return 100;
        
        // Weight errors more heavily
        const weightedScore = (passedChecks * 100) / (totalChecks + (report.errors.length * 2));
        
        return Math.min(100, Math.round(weightedScore));
    }
}

interface AccessibilityReport {
    passed: string[];
    warnings: string[];
    errors: string[];
    score: number;
}
