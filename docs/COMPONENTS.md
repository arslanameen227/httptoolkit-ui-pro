# HTTP Toolkit UI Pro - Components Library

## 📚 Overview

HTTP Toolkit UI Pro includes a comprehensive component library that provides reusable UI elements for building consistent and maintainable interfaces. This document outlines all available components, their props, and usage examples.

## 🎨 Base Components

### Button

A versatile button component with multiple variants and states.

```typescript
interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    children: React.ReactNode;
    onClick?: () => void;
}
```

**Example:**
```typescript
<Button variant="primary" onClick={handleSubmit}>
    Submit
</Button>

<Button variant="secondary" size="small" icon={<Icon />}>
    Cancel
</Button>

<Button variant="danger" loading={isLoading}>
    Delete
</Button>
```

### Input

A flexible input component with validation and styling support.

```typescript
interface InputProps {
    type?: 'text' | 'email' | 'password' | 'url' | 'number';
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    disabled?: boolean;
    error?: string;
    label?: string;
    required?: boolean;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
}
```

**Example:**
```typescript
<Input
    type="email"
    label="Email Address"
    placeholder="Enter your email"
    value={email}
    onChange={setEmail}
    error={emailError}
    required
/>
```

### TextArea

A multi-line text input component.

```typescript
interface TextAreaProps {
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    disabled?: boolean;
    error?: string;
    label?: string;
    rows?: number;
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
    onChange?: (value: string) => void;
}
```

**Example:**
```typescript
<TextArea
    label="Description"
    placeholder="Enter a description..."
    value={description}
    onChange={setDescription}
    rows={4}
    resize="vertical"
/>
```

### Select

A dropdown select component.

```typescript
interface SelectProps<T = string> {
    options: Array<{
        value: T;
        label: string;
        disabled?: boolean;
    }>;
    value?: T;
    defaultValue?: T;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    label?: string;
    searchable?: boolean;
    onChange?: (value: T) => void;
}
```

**Example:**
```typescript
<Select
    label="Country"
    options={[
        { value: 'us', label: 'United States' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'ca', label: 'Canada' }
    ]}
    value={country}
    onChange={setCountry}
    placeholder="Select a country"
/>
```

### Checkbox

A checkbox component for boolean selections.

```typescript
interface CheckboxProps {
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    label?: string;
    indeterminate?: boolean;
    onChange?: (checked: boolean) => void;
}
```

**Example:**
```typescript
<Checkbox
    label="Remember me"
    checked={rememberMe}
    onChange={setRememberMe}
/>
```

### Radio

A radio button component for single selections.

```typescript
interface RadioProps {
    name: string;
    value: string;
    checked?: boolean;
    disabled?: boolean;
    label?: string;
    onChange?: (value: string) => void;
}
```

**Example:**
```typescript
<Radio
    name="theme"
    value="light"
    checked={theme === 'light'}
    onChange={setTheme}
    label="Light Theme"
/>
<Radio
    name="theme"
    value="dark"
    checked={theme === 'dark'}
    onChange={setTheme}
    label="Dark Theme"
/>
```

## 📦 Layout Components

### Container

A flexible container component with responsive spacing.

```typescript
interface ContainerProps {
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    center?: boolean;
    children: React.ReactNode;
}
```

**Example:**
```typescript
<Container maxWidth="lg" padding="md" center>
    <h1>Page Title</h1>
    <p>Page content</p>
</Container>
```

### Grid

A CSS Grid layout component.

```typescript
interface GridProps {
    columns?: number | string;
    gap?: 'sm' | 'md' | 'lg';
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'stretch';
    children: React.ReactNode;
}
```

**Example:**
```typescript
<Grid columns={3} gap="md">
    <Card>Card 1</Card>
    <Card>Card 2</Card>
    <Card>Card 3</Card>
</Grid>
```

### Flex

A Flexbox layout component.

```typescript
interface FlexProps {
    direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
    justify?: 'start' | 'center' | 'end' | 'stretch' | 'space-between' | 'space-around';
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    gap?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}
```

**Example:**
```typescript
<Flex direction="row" justify="space-between" align="center" gap="md">
    <div>Left content</div>
    <div>Right content</div>
</Flex>
```

### Stack

A stack layout component for vertical spacing.

```typescript
interface StackProps {
    spacing?: 'sm' | 'md' | 'lg';
    align?: 'start' | 'center' | 'end' | 'stretch';
    children: React.ReactNode;
}
```

**Example:**
```typescript
<Stack spacing="md" align="start">
    <h1>Title</h1>
    <p>Paragraph</p>
    <Button>Action</Button>
</Stack>
```

## 📄 Data Display Components

### Card

A card component for grouping related content.

```typescript
interface CardProps {
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
    padding?: 'sm' | 'md' | 'lg';
    border?: boolean;
    shadow?: 'none' | 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}
```

**Example:**
```typescript
<Card title="Request Details" actions={<Button>Edit</Button>}>
    <p>Request URL: https://api.example.com</p>
    <p>Method: GET</p>
    <p>Status: 200</p>
</Card>
```

### Table

A table component for displaying tabular data.

```typescript
interface TableProps<T> {
    data: T[];
    columns: Array<{
        key: keyof T;
        title: string;
        render?: (value: any, record: T) => React.ReactNode;
        sortable?: boolean;
        width?: string;
    }>;
    loading?: boolean;
    pagination?: {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number, pageSize: number) => void;
    };
    onRowClick?: (record: T) => void;
}
```

**Example:**
```typescript
<Table
    data={requests}
    columns={[
        { key: 'method', title: 'Method', sortable: true },
        { key: 'url', title: 'URL', render: (url) => <a href={url}>{url}</a> },
        { key: 'status', title: 'Status' },
        { key: 'timestamp', title: 'Time', render: (time) => new Date(time).toLocaleString() }
    ]}
    pagination={{
        current: page,
        pageSize: 20,
        total: total,
        onChange: setPage
    }}
/>
```

### List

A list component for displaying items.

```typescript
interface ListProps<T> {
    data: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    loading?: boolean;
    empty?: React.ReactNode;
    bordered?: boolean;
}
```

**Example:**
```typescript
<List
    data={requests}
    renderItem={(request) => (
        <ListItem>
            <ListItemText primary={request.url} secondary={request.method} />
        </ListItem>
    )}
    empty={<div>No requests found</div>}
/>
```

### Badge

A badge component for displaying status or counts.

```typescript
interface BadgeProps {
    count?: number;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md' | 'lg';
    dot?: boolean;
    children?: React.ReactNode;
}
```

**Example:**
```typescript
<Badge count={5} color="error">
    <Button>Notifications</Button>
</Badge>

<Badge color="success" dot>
    <span>Online</span>
</Badge>
```

### Progress

A progress bar component.

```typescript
interface ProgressProps {
    value: number;
    max?: number;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    striped?: boolean;
}
```

**Example:**
```typescript
<Progress value={75} showLabel />
<Progress value={50} color="warning" striped />
```

## 🔔 Feedback Components

### Modal

A modal dialog component.

```typescript
interface ModalProps {
    open: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closable?: boolean;
    maskClosable?: boolean;
    onClose: () => void;
    children: React.ReactNode;
    footer?: React.ReactNode;
}
```

**Example:**
```typescript
<Modal
    open={isModalOpen}
    title="Confirm Delete"
    onClose={() => setIsModalOpen(false)}
    footer={
        <>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </>
    }
>
    <p>Are you sure you want to delete this item?</p>
</Modal>
```

### Tooltip

A tooltip component for displaying additional information.

```typescript
interface TooltipProps {
    content: React.ReactNode;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    trigger?: 'hover' | 'click' | 'focus';
    children: React.ReactNode;
}
```

**Example:**
```typescript
<Tooltip content="Click to copy" placement="top">
    <Button>Copy</Button>
</Tooltip>
```

### Alert

An alert component for displaying messages.

```typescript
interface AlertProps {
    type?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    closable?: boolean;
    onClose?: () => void;
    children: React.ReactNode;
}
```

**Example:**
```typescript
<Alert type="success" title="Success!">
    Your changes have been saved.
</Alert>

<Alert type="error" closable onClose={handleClose}>
    An error occurred while processing your request.
</Alert>
```

### Loading

A loading indicator component.

```typescript
interface LoadingProps {
    size?: 'sm' | 'md' | 'lg';
    type?: 'spinner' | 'dots' | 'bars';
    text?: string;
    overlay?: boolean;
}
```

**Example:**
```typescript
<Loading size="md" text="Loading..." />
<Loading overlay type="spinner" />
```

### Empty

An empty state component.

```typescript
interface EmptyProps {
    image?: React.ReactNode;
    title?: string;
    description?: string;
    actions?: React.ReactNode;
}
```

**Example:**
```typescript
<Empty
    title="No data found"
    description="Try adjusting your search criteria"
    actions={<Button>Clear Filters</Button>}
/>
```

## 🧭 Navigation Components

### Tabs

A tabs component for organizing content.

```typescript
interface TabsProps {
    activeKey: string;
    onChange: (key: string) => void;
    tabs: Array<{
        key: string;
        title: React.ReactNode;
        disabled?: boolean;
        content: React.ReactNode;
    }>;
    type?: 'line' | 'card' | 'pills';
}
```

**Example:**
```typescript
<Tabs
    activeKey={activeTab}
    onChange={setActiveTab}
    tabs={[
        { key: 'requests', title: 'Requests', content: <RequestsList /> },
        { key: 'responses', title: 'Responses', content: <ResponsesList /> },
        { key: 'settings', title: 'Settings', content: <SettingsPanel /> }
    ]}
/>
```

### Menu

A menu component for navigation.

```typescript
interface MenuProps {
    items: Array<{
        key: string;
        label: React.ReactNode;
        icon?: React.ReactNode;
        disabled?: boolean;
        children?: MenuItem[];
    }>;
    selectedKeys?: string[];
    onSelect?: (key: string) => void;
    mode?: 'vertical' | 'horizontal';
}
```

**Example:**
```typescript
<Menu
    items={[
        { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
        { key: 'requests', label: 'Requests', icon: <RequestIcon /> },
        { key: 'settings', label: 'Settings', icon: <SettingsIcon /> }
    ]}
    selectedKeys={[selectedKey]}
    onSelect={setSelectedKey}
    mode="vertical"
/>
```

### Breadcrumb

A breadcrumb navigation component.

```typescript
interface BreadcrumbProps {
    items: Array<{
        title: React.ReactNode;
        href?: string;
    }>;
    separator?: React.ReactNode;
}
```

**Example:**
```typescript
<Breadcrumb
    items={[
        { title: 'Home', href: '/' },
        { title: 'Tools', href: '/tools' },
        { title: 'JSON Beautifier' }
    ]}
/>
```

## 🎯 Tool Components

### ToolContainer

A container component specifically for tool pages.

```typescript
interface ToolContainerProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}
```

**Example:**
```typescript
<ToolContainer title="JSON Beautifier" description="Format and prettify JSON data">
    <ToolContent>
        {/* Tool implementation */}
    </ToolContent>
</ToolContainer>
```

### ToolSection

A section component within tools.

```typescript
interface ToolSectionProps {
    title?: string;
    children: React.ReactNode;
}
```

**Example:**
```typescript
<ToolSection title="Input">
    <TextArea placeholder="Enter JSON..." />
</ToolSection>
<ToolSection title="Output">
    <CodeDisplay code={formattedJson} />
</ToolSection>
```

## 🎨 Theming

All components support theming through the ThemeProvider. Components automatically adapt to the current theme (light/dark) and use the defined color palette, typography, and spacing.

### Theme Customization

```typescript
const customTheme = {
    ...baseTheme,
    colors: {
        primary: '#007acc',
        secondary: '#6c757d',
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545'
    },
    spacing: {
        sm: '8px',
        md: '16px',
        lg: '24px'
    }
};

<ThemeProvider theme={customTheme}>
    <App />
</ThemeProvider>
```

## 📱 Responsive Design

All components are responsive and work across different screen sizes. They automatically adapt their layout and styling based on the current breakpoint.

### Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🧪 Testing

Components are designed to be easily testable. They accept props for all configuration and don't rely on global state.

### Testing Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

test('Button calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
});
```

---

This component library provides a comprehensive set of reusable UI components for building consistent and maintainable interfaces in HTTP Toolkit UI. For more detailed information about specific components, please refer to their individual documentation or source code.
