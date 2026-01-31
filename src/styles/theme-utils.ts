import { Theme } from '../styles';

/**
 * Standardized theme access utilities
 * Provides consistent type-safe access to theme properties
 */

// Type-safe theme access functions
export const getThemeColor = (theme: Theme) => theme.mainColor;
export const getThemeBackground = (theme: Theme) => theme.mainBackground;
export const getThemePopColor = (theme: Theme) => theme.popColor;
export const getThemeContainerBorder = (theme: Theme) => theme.containerBorder;
export const getThemeLowlightText = (theme: Theme) => theme.mainLowlightColor;
export const getThemeHighlightBackground = (theme: Theme) => theme.highlightBackground;
export const getThemeWarningColor = (theme: Theme) => theme.warningColor;

// Standardized theme prop type for styled components
export type ThemeProps = { theme: Theme };

// Helper function for creating themed styled components
export const themed = <P extends object = {}>(
    styles: TemplateStringsArray,
    ...interpolations: Array<(props: P & ThemeProps) => any>
) => {
    return styles;
};

// Common theme combinations
export const themeColors = {
    primary: (theme: Theme) => theme.popColor,
    text: (theme: Theme) => theme.mainColor,
    background: (theme: Theme) => theme.mainBackground,
    lowlight: (theme: Theme) => theme.mainLowlightColor,
    warning: (theme: Theme) => theme.warningColor,
    border: (theme: Theme) => theme.containerBorder,
    highlight: (theme: Theme) => theme.highlightBackground
};

// Standard CSS values with theme
export const withTheme = {
    textColor: (theme: Theme) => `color: ${theme.mainColor};`,
    backgroundColor: (theme: Theme) => `background-color: ${theme.mainBackground};`,
    borderColor: (theme: Theme) => `border-color: ${theme.containerBorder};`,
    primaryColor: (theme: Theme) => `color: ${theme.popColor};`,
    primaryBackground: (theme: Theme) => `background-color: ${theme.popColor};`,
};
