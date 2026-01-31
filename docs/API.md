# HTTP Toolkit UI Pro - API Documentation

## 📚 Overview

HTTP Toolkit UI Pro provides a comprehensive API for interacting with HTTP traffic, managing requests/responses, and integrating with external tools. This document outlines the available APIs, their usage, and integration examples.

## 🔗 Server APIs

### REST API Endpoints

#### Base URL
```
Development: http://127.0.0.1:45457
Production: https://api.httptoolkit.tech
```

#### Authentication
```typescript
// API token authentication
const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
};
```

### Core Endpoints

#### GET /api/status
Get server status and configuration.

```typescript
interface StatusResponse {
    status: 'running' | 'stopped';
    version: string;
    uptime: number;
    proxyPort: number;
    adminPort: number;
}
```

**Example:**
```typescript
const status = await fetch('/api/status', { headers });
const data = await status.json();
console.log(`Server ${data.status} on port ${data.proxyPort}`);
```

#### GET /api/requests
Retrieve intercepted HTTP requests.

```typescript
interface RequestsResponse {
    requests: RequestData[];
    total: number;
    page: number;
    pageSize: number;
}

interface RequestData {
    id: string;
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: string;
    timestamp: number;
    status?: number;
    response?: ResponseData;
}
```

**Example:**
```typescript
const response = await fetch('/api/requests?page=1&pageSize=50', { headers });
const { requests } = await response.json();
```

#### POST /api/requests
Send a new HTTP request.

```typescript
interface SendRequestData {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: string;
    followRedirects?: boolean;
}

interface SendRequestResponse {
    id: string;
    status: number;
    headers: Record<string, string>;
    body: string;
    timing: RequestTiming;
}
```

**Example:**
```typescript
const request: SendRequestData = {
    method: 'POST',
    url: 'https://api.example.com/data',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ key: 'value' })
};

const response = await fetch('/api/requests', {
    method: 'POST',
    headers,
    body: JSON.stringify(request)
});
```

#### GET /api/requests/:id
Get detailed information about a specific request.

```typescript
interface RequestDetail extends RequestData {
    response: ResponseData;
    timing: RequestTiming;
    metadata: RequestMetadata;
}

interface ResponseData {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    size: number;
}

interface RequestTiming {
    startTime: number;
    endTime: number;
    duration: number;
    dnsLookup: number;
    tcpConnect: number;
    tlsHandshake: number;
    firstByte: number;
    download: number;
}
```

#### DELETE /api/requests/:id
Delete a specific request from history.

**Example:**
```typescript
await fetch(`/api/requests/${requestId}`, {
    method: 'DELETE',
    headers
});
```

### WebSocket API

#### Connection
```typescript
const ws = new WebSocket('ws://127.0.0.1:45456/ws');

ws.onopen = () => {
    console.log('WebSocket connected');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleWebSocketMessage(data);
};
```

#### Message Types

##### Request Intercepted
```typescript
interface RequestInterceptedMessage {
    type: 'request-intercepted';
    data: RequestData;
}
```

##### Response Received
```typescript
interface ResponseReceivedMessage {
    type: 'response-received';
    data: {
        requestId: string;
        response: ResponseData;
    }
}
```

##### WebSocket Message
```typescript
interface WebSocketMessage {
    type: 'websocket-message';
    data: {
        connectionId: string;
        message: string;
        direction: 'incoming' | 'outgoing';
        timestamp: number;
    }
}
```

## 🧩 Component APIs

### Tool Component Interface

```typescript
interface ToolDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
}

interface ToolProps {
    tool: ToolDefinition;
}
```

### Tool Registration

```typescript
// Register a new tool
export const MyTool: React.FC<ToolProps> = ({ tool }) => {
    // Tool implementation
};

// Add to tools-page.tsx
const TOOL_COMPONENTS: Record<string, React.ComponentType<ToolProps>> = {
    'my-tool': MyTool,
    // ... other tools
};

// Add to tools categories
const TOOLS_CATEGORIES = {
    utilities: {
        name: 'Utilities',
        tools: [
            {
                id: 'my-tool',
                name: 'My Tool',
                description: 'Description of my tool',
                icon: '🔧',
                category: 'utilities'
            }
        ]
    }
};
```

### Store APIs

#### Request Store

```typescript
class RequestStore {
    // Observable state
    requests: Map<string, Request>;
    currentRequest: Request | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    addRequest(request: Request): void;
    updateRequest(id: string, updates: Partial<Request>): void;
    deleteRequest(id: string): void;
    setCurrentRequest(request: Request | null): void;

    // Computed
    get activeRequests(): Request[];
    get requestCount(): number;
    get filteredRequests(): Request[];
}

// Usage
import { requestStore } from '../model/proxy-store';

// Subscribe to changes
reaction(() => requestStore.requests, (requests) => {
    console.log(`Requests updated: ${requests.size} total`);
});

// Get computed values
const activeRequests = requestStore.activeRequests;
```

#### Settings Store

```typescript
class SettingsStore {
    // Observable state
    theme: 'light' | 'dark';
    language: string;
    autoSave: boolean;
    proxySettings: ProxyConfig;

    // Actions
    updateTheme(theme: 'light' | 'dark'): void;
    updateLanguage(language: string): void;
    updateAutoSave(autoSave: boolean): void;
    updateProxySettings(settings: ProxyConfig): void;

    // Persistence
    save(): void;
    load(): void;
}

// Usage
import { settingsStore } from '../model/settings-store';

// Update settings
settingsStore.updateTheme('dark');

// Subscribe to changes
when(
    () => settingsStore.theme,
    (theme) => {
        document.body.setAttribute('data-theme', theme);
    }
);
```

## 🎨 Theme API

### Theme Interface

```typescript
interface Theme {
    // Colors
    mainColor: string;
    mainBackground: string;
    popColor: string;
    containerBackground: string;
    containerBorder: string;
    lowlightText: string;
    successColor: string;
    warningColor: string;
    errorColor: string;

    // Typography
    fontFamily: string;
    monoFontFamily: string;
    fontSize: string;
    fontWeight: {
        normal: number;
        medium: number;
        bold: number;
    };

    // Spacing
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };

    // Breakpoints
    breakpoints: {
        mobile: string;
        tablet: string;
        desktop: string;
    };

    // Shadows
    shadows: {
        small: string;
        medium: string;
        large: string;
    };

    // Border radius
    borderRadius: {
        small: string;
        medium: string;
        large: string;
    };
}
```

### Custom Theme Creation

```typescript
import { Theme } from '../styles/themes';

export const customTheme: Theme = {
    mainColor: '#1a1a1a',
    mainBackground: '#ffffff',
    popColor: '#007acc',
    containerBackground: '#f8f9fa',
    containerBorder: '#e1e4e8',
    lowlightText: '#666666',
    successColor: '#28a745',
    warningColor: '#ffc107',
    errorColor: '#dc3545',
    fontFamily: '"Custom Font", sans-serif',
    monoFontFamily: '"Custom Mono", monospace',
    fontSize: '14px',
    fontWeight: {
        normal: 400,
        medium: 500,
        bold: 600
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
    },
    breakpoints: {
        mobile: '768px',
        tablet: '1024px',
        desktop: '1200px'
    },
    shadows: {
        small: '0 1px 3px rgba(0, 0, 0, 0.1)',
        medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
        large: '0 10px 25px rgba(0, 0, 0, 0.1)'
    },
    borderRadius: {
        small: '4px',
        medium: '8px',
        large: '12px'
    }
};
```

### Theme Application

```typescript
import { ThemeProvider } from 'styled-components';
import { customTheme } from './themes/custom-theme';

const App: React.FC = () => {
    return (
        <ThemeProvider theme={customTheme}>
            <AppContent />
        </ThemeProvider>
    );
};
```

## 🔌 Plugin API

### Plugin Interface

```typescript
interface Plugin {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    enabled: boolean;

    // Lifecycle hooks
    onActivate?(): void;
    onDeactivate?(): void;
    onRequest?(request: Request): Request | void;
    onResponse?(response: Response): Response | void;
}

interface PluginManager {
    register(plugin: Plugin): void;
    unregister(pluginId: string): void;
    enable(pluginId: string): void;
    disable(pluginId: string): void;
    list(): Plugin[];
}
```

### Plugin Example

```typescript
export const requestLoggerPlugin: Plugin = {
    id: 'request-logger',
    name: 'Request Logger',
    version: '1.0.0',
    description: 'Logs all HTTP requests to console',
    author: 'HTTP Toolkit',
    enabled: true,

    onRequest: (request) => {
        console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
        return request; // Return modified request or undefined to keep original
    },

    onResponse: (response) => {
        console.log(`Response: ${response.status} ${response.statusText}`);
        return response;
    }
};

// Register plugin
import { pluginManager } from '../services/plugin-manager';
pluginManager.register(requestLoggerPlugin);
```

## 📊 Analytics API

### Event Tracking

```typescript
interface AnalyticsEvent {
    type: string;
    category: string;
    action: string;
    label?: string;
    value?: number;
    timestamp: number;
    metadata?: Record<string, any>;
}

interface AnalyticsService {
    track(event: AnalyticsEvent): void;
    identify(userId: string, traits?: Record<string, any>): void;
    page(name: string, properties?: Record<string, any>): void;
    reset(): void;
}
```

### Usage Examples

```typescript
import { analytics } from '../services/analytics';

// Track feature usage
analytics.track({
    type: 'feature',
    category: 'tools',
    action: 'json-beautifier-used',
    label: 'format-button-clicked'
});

// Track user actions
analytics.track({
    type: 'user',
    category: 'interaction',
    action: 'request-sent',
    value: 1
});

// Identify user
analytics.identify('user-123', {
    plan: 'pro',
    version: '2.0.0'
});

// Track page views
analytics.page('tools-page', {
    tool: 'json-beautifier'
});
```

## 🔧 Configuration API

### Configuration Interface

```typescript
interface AppConfig {
    // Server settings
    apiUrl: string;
    adminUrl: string;
    wsUrl: string;

    // Feature flags
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
    enableBetaFeatures: boolean;

    // UI settings
    defaultTheme: 'light' | 'dark';
    defaultLanguage: string;
    autoSave: boolean;

    // Performance settings
    maxRequests: number;
    requestRetention: number; // hours
    enablePerformanceMonitoring: boolean;

    // Security settings
    enforceHttps: boolean;
    cspEnabled: boolean;
    sanitizeInputs: boolean;
}

interface ConfigService {
    get(): AppConfig;
    update(config: Partial<AppConfig>): void;
    reset(): void;
    validate(config: AppConfig): boolean;
}
```

### Configuration Usage

```typescript
import { config } from '../services/config';

// Get current configuration
const currentConfig = config.get();

// Update configuration
config.update({
    enableAnalytics: true,
    defaultTheme: 'dark',
    maxRequests: 1000
});

// Validate configuration
const isValid = config.validate(currentConfig);
if (!isValid) {
    console.error('Invalid configuration');
}
```

## 🧪 Testing API

### Test Utilities

```typescript
interface TestUtils {
    // Component testing
    mountWithTheme(component: React.ReactElement): any;
    createMockStore<T>(initialState: T): T;
    waitFor(condition: () => boolean, timeout?: number): Promise<void>;

    // API testing
    mockApiResponse(endpoint: string, response: any): void;
    clearMockResponses(): void;

    // Performance testing
    measureRender<T>(name: string, fn: () => T): T;
    measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T>;
}
```

### Test Examples

```typescript
import { TestUtils } from '../test/utils';

// Component testing
const wrapper = TestUtils.mountWithTheme(<MyComponent />);
expect(wrapper.find('h1')).to.have.text('My Component');

// Store testing
const mockStore = TestUtils.createMockStore({
    requests: [],
    isLoading: false
});

// Performance testing
const result = TestUtils.measureRender('component-render', () => {
    return renderComponent();
});

// Async testing
await TestUtils.waitFor(() => {
    return wrapper.state('isLoading') === false;
}, 5000);
```

## 📱 Mobile API

### Mobile Integration

```typescript
interface MobileAPI {
    // Certificate management
    installCertificate(): Promise<boolean>;
    isCertificateInstalled(): Promise<boolean>;
    removeCertificate(): Promise<boolean>;

    // Network configuration
    configureProxy(host: string, port: number): Promise<boolean>;
    isProxyConfigured(): Promise<boolean>;
    removeProxy(): Promise<boolean>;

    // App integration
    getInstalledApps(): Promise<MobileApp[]>;
    startApp(packageName: string): Promise<boolean>;
    stopApp(packageName: string): Promise<boolean>;
}

interface MobileApp {
    packageName: string;
    name: string;
    version: string;
    icon?: string;
    interceptable: boolean;
}
```

### Mobile Usage

```typescript
import { mobileAPI } from '../services/mobile-api';

// Install certificate
const installed = await mobileAPI.installCertificate();
if (installed) {
    console.log('Certificate installed successfully');
}

// Configure proxy
await mobileAPI.configureProxy('127.0.0.1', 8080);

// Get installed apps
const apps = await mobileAPI.getInstalledApps();
const interceptableApps = apps.filter(app => app.interceptable);
```

## 🔍 Search API

### Search Interface

```typescript
interface SearchService {
    // Request search
    searchRequests(query: SearchQuery): Promise<SearchResult[]>;
    searchInRequest(requestId: string, query: string): Promise<SearchMatch[]>;

    // Global search
    searchAll(query: string): Promise<GlobalSearchResult>;
    saveSearch(query: SearchQuery, name: string): Promise<void>;
    getSavedSearches(): Promise<SavedSearch[]>;
}

interface SearchQuery {
    text?: string;
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: string;
    status?: number;
    dateRange?: {
        start: Date;
        end: Date;
    };
}

interface SearchResult {
    requestId: string;
    matches: SearchMatch[];
    score: number;
}

interface SearchMatch {
    field: 'url' | 'headers' | 'body';
    value: string;
    indices: [number, number][];
}
```

### Search Examples

```typescript
import { searchService } from '../services/search';

// Search requests
const results = await searchService.searchRequests({
    text: 'api',
    method: 'GET',
    status: 200
});

// Search within specific request
const matches = await searchService.searchInRequest(
    'request-123',
    'error'
);

// Save search query
await searchService.saveSearch(
    { text: 'api', method: 'GET' },
    'API GET Requests'
);
```

---

This API documentation provides comprehensive information for integrating with HTTP Toolkit UI. For more specific examples or advanced usage, please refer to the source code or contact the development team.
