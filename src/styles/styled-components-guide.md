# Styled Components Organization Guide

## 📋 Naming Conventions

### Component Containers
- Use PascalCase with descriptive names
- End with `Container` for main component wrappers
- Examples: `XMLConverterContainer`, `UUIDGeneratorContainer`

### Layout Components
- Use PascalCase with descriptive layout names
- End with `Container`, `Section`, or `Group`
- Examples: `ControlsContainer`, `InputSection`, `ButtonGroup`

### UI Elements
- Use PascalCase with element type suffix
- Examples: `StyledButton`, `StyledInput`, `StyledTextArea`

### Messages & Feedback
- Use descriptive names with `Message` suffix
- Examples: `ErrorMessage`, `SuccessMessage`, `InfoMessage`

## 🎨 Theme Access Patterns

### Always Use ThemeProps
```typescript
import { ThemeProps } from '../styles/theme-utils';

const StyledComponent = styled.div<ThemeProps>`
    color: ${p => p.theme.mainColor};
    background: ${p => p.theme.mainBackground};
`;
```

### Never Use `as any`
```typescript
// ❌ BAD
const BadComponent = styled.div`
    color: ${p => (p as any).theme.mainColor};
`;

// ✅ GOOD
const GoodComponent = styled.div<ThemeProps>`
    color: ${p => p.theme.mainColor};
`;
```

## 📁 File Organization

### Order of Styled Components
1. **Main Container** - Root component wrapper
2. **Layout Components** - Sections, groups, containers
3. **UI Elements** - Buttons, inputs, text areas
4. **Messages** - Error, success, info messages
5. **Utility Components** - Helper styled components

### Example Structure
```typescript
// 1. Main Container
const ToolContainer = styled.div<ThemeProps>`
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
`;

// 2. Layout Components
const HeaderSection = styled.div`
    margin-bottom: 20px;
`;

const ControlsSection = styled.div`
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
`;

const ContentSection = styled.div`
    flex: 1;
    display: flex;
    gap: 16px;
`;

// 3. UI Elements
const StyledInput = styled.input<ThemeProps>`
    padding: 8px;
    border: 1px solid ${p => p.theme.containerBorder};
    background: ${p => p.theme.mainBackground};
    color: ${p => p.theme.mainColor};
`;

const StyledButton = styled.button<ThemeProps>`
    padding: 8px 16px;
    background: ${p => p.theme.popColor};
    color: ${p => p.theme.mainBackground};
    border: none;
    border-radius: 4px;
`;

// 4. Messages
const ErrorMessage = styled.div<ThemeProps>`
    color: ${p => p.theme.warningColor};
    background: ${p => p.theme.highlightBackground};
    padding: 8px;
    border-radius: 4px;
`;

// 5. Utility Components
const FlexCenter = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;
```

## 🎯 Common Patterns

### Container Pattern
```typescript
const [ToolName]Container = styled.div<ThemeProps>`
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: ${p => p.theme.mainBackground};
    color: ${p => p.theme.mainColor};
`;
```

### Section Pattern
```typescript
const [Purpose]Section = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 16px;
`;
```

### Control Group Pattern
```typescript
const ControlGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 200px;
`;
```

### Button Pattern
```typescript
const StyledButton = styled.button<ThemeProps & { variant?: 'primary' | 'secondary' }>`
    padding: 8px 16px;
    border: 1px solid ${p => p.variant === 'primary' ? p.theme.popColor : p.theme.containerBorder};
    background: ${p => p.variant === 'primary' ? p.theme.popColor : p.theme.mainBackground};
    color: ${p => p.variant === 'primary' ? p.theme.mainBackground : p.theme.mainColor};
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
        opacity: 0.8;
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;
```

### Input Pattern
```typescript
const StyledInput = styled.input<ThemeProps>`
    padding: 8px 12px;
    border: 1px solid ${p => p.theme.containerBorder};
    background: ${p => p.theme.mainBackground};
    color: ${p => p.theme.mainColor};
    border-radius: 4px;
    font-family: inherit;
    
    &:focus {
        outline: none;
        border-color: ${p => p.theme.popColor};
    }
    
    &::placeholder {
        color: ${p => p.theme.lowlightText};
    }
`;
```

### Text Area Pattern
```typescript
const StyledTextArea = styled.textarea<ThemeProps>`
    flex: 1;
    min-height: 200px;
    padding: 8px 12px;
    border: 1px solid ${p => p.theme.containerBorder};
    background: ${p => p.theme.mainBackground};
    color: ${p => p.theme.mainColor};
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    resize: vertical;
    
    &:focus {
        outline: none;
        border-color: ${p => p.theme.popColor};
    }
`;
```

### Message Pattern
```typescript
const ErrorMessage = styled.div<ThemeProps>`
    color: ${p => p.theme.warningColor};
    background: ${p => p.theme.highlightBackground};
    padding: 8px 12px;
    border-radius: 4px;
    margin-top: 8px;
    font-size: 14px;
`;

const SuccessMessage = styled.div<ThemeProps>`
    color: ${p => p.theme.successColor || '#22c55e'};
    background: ${p => p.theme.successBackground || '#f0fdf4'};
    padding: 8px 12px;
    border-radius: 4px;
    margin-top: 8px;
    font-size: 14px;
`;
```

## 🔧 Performance Tips

### Use `css` Helper for Complex Styles
```typescript
import { css } from 'styled-components';

const buttonStyles = css<ThemeProps>`
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
`;

const PrimaryButton = styled.button<ThemeProps>`
    ${buttonStyles}
    background: ${p => p.theme.popColor};
    color: ${p => p.theme.mainBackground};
`;
```

### Avoid Inline Functions in Render
```typescript
// ❌ BAD - Creates new function on every render
const BadComponent = styled.div`
    color: ${() => props.theme.mainColor};
`;

// ✅ GOOD - Uses interpolation function
const GoodComponent = styled.div<ThemeProps>`
    color: ${p => p.theme.mainColor};
`;
```

## 📝 Documentation Standards

### Comment Complex Components
```typescript
/**
 * Main container for the XML converter tool
 * Provides flex layout with proper spacing and theme colors
 */
const XMLConverterContainer = styled.div<ThemeProps>`
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: ${p => p.theme.mainBackground};
    color: ${p => p.theme.mainColor};
`;
```

### Group Related Components
```typescript
// ===== LAYOUT COMPONENTS =====
const HeaderSection = styled.div`...`;
const ControlsSection = styled.div`...`;
const ContentSection = styled.div`...`;

// ===== UI ELEMENTS =====
const StyledInput = styled.input`...`;
const StyledButton = styled.button`...`;
const StyledTextArea = styled.textarea`...`;

// ===== MESSAGES =====
const ErrorMessage = styled.div`...`;
const SuccessMessage = styled.div`...`;
```

## 🚀 Migration Checklist

### For Existing Components
- [ ] Replace `as any` with `ThemeProps`
- [ ] Organize styled components in logical order
- [ ] Use consistent naming conventions
- [ ] Add proper TypeScript types
- [ ] Document complex components
- [ ] Group related components with comments

### For New Components
- [ ] Follow naming conventions from start
- [ ] Use `ThemeProps` for all theme access
- [ ] Organize components logically
- [ ] Add documentation
- [ ] Use common patterns where applicable
