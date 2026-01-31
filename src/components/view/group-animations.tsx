import * as React from 'react';
import { styled, keyframes } from '../../styles';

// Animation keyframes
const expandCollapseAnimation = keyframes`
    from {
        opacity: 0;
        transform: scaleY(0.8);
        transform-origin: top;
    }
    to {
        opacity: 1;
        transform: scaleY(1);
        transform-origin: top;
    }
`;

const slideInAnimation = keyframes`
    from {
        opacity: 0;
        transform: translateX(-20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
`;

const fadeInAnimation = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

const pulseAnimation = keyframes`
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
`;

const shimmerAnimation = keyframes`
    0% {
        background-position: -200% 0;
    }
    100% {
        background-position: 200% 0;
    }
`;

// Animated group container
export const AnimatedGroupContainer = styled.div<{ 
    isExpanded: boolean; 
    isAnimating: boolean;
    delay?: number;
}>`
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: ${p => p.isAnimating ? fadeInAnimation : 'none'} 0.3s ease-out;
    animation-delay: ${p => p.delay || 0}ms;
    animation-fill-mode: both;

    ${p => p.isExpanded && `
        max-height: 1000px;
        opacity: 1;
    `}

    ${p => !p.isExpanded && `
        max-height: 0;
        opacity: 0;
    `}
`;

// Animated group header
export const AnimatedGroupHeader = styled.div<{ 
    isExpanded: boolean;
    isHovered: boolean;
    isSelected: boolean;
}>`
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background-color: ${p => (p as any).theme.mainLowlightBackground};
    border-bottom: 1px solid ${p => (p as any).theme.containerBorder};
    cursor: pointer;
    user-select: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &:hover {
        background-color: ${p => (p as any).theme.containerBackground};
        transform: translateX(2px);
    }

    ${p => p.isSelected && `
        background-color: ${(p as any).theme.highlightBackground};
        border-left: 3px solid ${(p as any).theme.popColor};
    `}

    ${p => p.isExpanded && `
        border-bottom-color: ${(p as any).theme.popColor};
    `}

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
        );
        transition: left 0.5s ease;
    }

    ${p => p.isHovered && `
        &::before {
            left: 100%;
        }
    `}
`;

// Animated expand/collapse icon
export const AnimatedExpandIcon = styled.div<{ 
    isExpanded: boolean;
    isAnimating: boolean;
}>`
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: rotate(${p => p.isExpanded ? '90deg' : '0deg'});
    
    ${p => p.isAnimating && `
        animation: ${pulseAnimation} 0.3s ease-out;
    `}

    &::before {
        content: '▶';
        font-size: 12px;
        color: ${p => (p as any).theme.mainColor};
        transition: color 0.2s;
    }

    &:hover::before {
        color: ${p => (p as any).theme.popColor};
    }
`;

// Animated group stats
export const AnimatedGroupStats = styled.div<{ 
    isAnimating: boolean;
    delay?: number;
}>`
    display: flex;
    align-items: center;
    gap: 8px;
    animation: ${p => p.isAnimating ? slideInAnimation : 'none'} 0.4s ease-out;
    animation-delay: ${p => p.delay || 0}ms;
    animation-fill-mode: both;
`;

// Animated stat badge
export const AnimatedStatBadge = styled.div<{ 
    variant: 'success' | 'error' | 'neutral' | 'primary';
    isAnimating: boolean;
}>`
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;

    ${p => {
        switch (p.variant) {
            case 'success':
                return `
                    background-color: rgba(34, 197, 94, 0.1);
                    color: #22c55e;
                    border: 1px solid rgba(34, 197, 94, 0.2);
                `;
            case 'error':
                return `
                    background-color: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                `;
            case 'primary':
                return `
                    background-color: rgba(59, 130, 246, 0.1);
                    color: #3b82f6;
                    border: 1px solid rgba(59, 130, 246, 0.2);
                `;
            default:
                return `
                    background-color: rgba(107, 114, 128, 0.1);
                    color: #6b7280;
                    border: 1px solid rgba(107, 114, 128, 0.2);
                `;
        }
    }}

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    ${p => p.isAnimating && `
        animation: ${pulseAnimation} 0.4s ease-out;
    `}

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
        );
        animation: ${shimmerAnimation} 2s infinite;
    }
`;

// Loading skeleton for groups
export const GroupSkeleton = styled.div<{ delay?: number }>`
    padding: 12px 16px;
    background: linear-gradient(
        90deg,
        ${(p as any).theme.containerBackground} 25%,
        ${(p as any).theme.mainLowlightBackground} 50%,
        ${(p as any).theme.containerBackground} 75%
    );
    background-size: 200% 100%;
    animation: ${shimmerAnimation} 1.5s infinite;
    border-radius: 4px;
    margin-bottom: 1px;
    animation-delay: ${p => p.delay || 0}ms;
`;

// Animated filter controls
export const AnimatedFilterContainer = styled.div<{ isVisible: boolean }>`
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: top;
    
    ${p => p.isVisible ? `
        opacity: 1;
        transform: scaleY(1);
        max-height: 500px;
    ` : `
        opacity: 0;
        transform: scaleY(0.8);
        max-height: 0;
        overflow: hidden;
    `}
`;

// Animated bulk operations bar
export const AnimatedBulkBar = styled.div<{ isVisible: boolean }>`
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: top;
    
    ${p => p.isVisible ? `
        opacity: 1;
        transform: translateY(0);
        max-height: 60px;
    ` : `
        opacity: 0;
        transform: translateY(-20px);
        max-height: 0;
        overflow: hidden;
    `}
`;

// Hook for managing animations
export const useGroupAnimations = () => {
    const [animatingGroups, setAnimatingGroups] = React.useState<Set<string>>(new Set());
    const [hoveredGroups, setHoveredGroups] = React.useState<Set<string>>(new Set());

    const startGroupAnimation = React.useCallback((groupKey: string) => {
        setAnimatingGroups(prev => new Set(prev).add(groupKey));
        
        // Clear animation state after animation completes
        setTimeout(() => {
            setAnimatingGroups(prev => {
                const newSet = new Set(prev);
                newSet.delete(groupKey);
                return newSet;
            });
        }, 400);
    }, []);

    const setGroupHovered = React.useCallback((groupKey: string, isHovered: boolean) => {
        setHoveredGroups(prev => {
            const newSet = new Set(prev);
            if (isHovered) {
                newSet.add(groupKey);
            } else {
                newSet.delete(groupKey);
            }
            return newSet;
        });
    }, []);

    const isGroupAnimating = React.useCallback((groupKey: string) => {
        return animatingGroups.has(groupKey);
    }, [animatingGroups]);

    const isGroupHovered = React.useCallback((groupKey: string) => {
        return hoveredGroups.has(groupKey);
    }, [hoveredGroups]);

    return {
        startGroupAnimation,
        setGroupHovered,
        isGroupAnimating,
        isGroupHovered
    };
};

// Transition effect for grouping mode changes
export const GroupingTransition = styled.div<{ 
    isTransitioning: boolean;
    direction: 'enter' | 'exit';
}>`
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    
    ${p => p.isTransitioning && p.direction === 'enter' && `
        animation: ${slideInAnimation} 0.4s ease-out;
    `}
    
    ${p => p.isTransitioning && p.direction === 'exit' && `
        opacity: 0;
        transform: translateX(-20px);
    `}
`;

// Animated progress indicator for loading groups
export const GroupLoadingProgress = styled.div<{ progress: number }>`
    height: 2px;
    background-color: ${(p as any).theme.containerBackground};
    position: relative;
    overflow: hidden;
    margin-top: 1px;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: ${p => p.progress}%;
        background-color: ${(p as any).theme.popColor};
        transition: width 0.3s ease;
    }
`;

// Staggered animation for multiple groups
export const useStaggeredAnimation = (itemCount: number, delay: number = 50) => {
    const [visibleItems, setVisibleItems] = React.useState<Set<number>>(new Set());

    React.useEffect(() => {
        const timers: NodeJS.Timeout[] = [];

        for (let i = 0; i < itemCount; i++) {
            const timer = setTimeout(() => {
                setVisibleItems(prev => new Set(prev).add(i));
            }, i * delay);
            timers.push(timer);
        }

        return () => {
            timers.forEach(clearTimeout);
        };
    }, [itemCount, delay]);

    const isItemVisible = React.useCallback((index: number) => {
        return visibleItems.has(index);
    }, [visibleItems]);

    return { isItemVisible };
};
