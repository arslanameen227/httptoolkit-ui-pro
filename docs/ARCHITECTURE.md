# HTTP Toolkit UI Pro - Architecture Overview

## 🏗️ System Architecture

HTTP Toolkit UI Pro is built as a modern, scalable single-page application with a focus on performance, maintainability, and extensibility. This document outlines the overall architecture, design patterns, and key components.

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        HTTP Toolkit UI                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Browser    │  │   Desktop   │  │   Mobile    │         │
│  │   Client     │  │   App       │  │   App       │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    Web Application Layer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    React    │  │   MobX      │  │ Styled Comp │         │
│  │ Components  │  │   Stores    │  │   Themes     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    Communication Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  REST API   │  │ WebSocket   │  │   GraphQL    │         │
│  │   Client    │  │   Client    │  │   Client    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    HTTP Toolkit Server                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Proxy     │  │   Mock      │  │   Storage   │         │
│  │   Server    │  │   Server    │  │   Service   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 🧩 Component Architecture

### Component Hierarchy

```
App
├── StyleProvider (Theme Context)
├── ErrorBoundary
├── Router
│   ├── ToolsPage
│   │   ├── ToolsSidebar
│   │   └── ToolContent
│   │       ├── JSONBeautifier
│   │       ├── URLDecoder
│   │       └── [Other Tools]
│   ├── InterceptPage
│   │   ├── InterceptControls
│   │   ├── RequestList
│   │   └── RequestDetails
│   ├── SendPage
│   │   ├── RequestBuilder
│   │   ├── ResponseViewer
│   │   └── HistoryPanel
│   └── SettingsPage
│       ├── ThemeSelector
│       ├── AccountSettings
│       └── ProxySettings
└── GlobalComponents
    ├── Modal
    ├── Notification
    └── LoadingSpinner
```

### Component Patterns

#### 1. Container/Presentation Pattern

```typescript
// Container Component (Logic & Data)
export const RequestContainer: React.FC = () => {
    const requestStore = useStore(requestStore);
    const currentRequest = useObservable(requestStore.currentRequest);
    const isLoading = useObservable(requestStore.isLoading);

    const handleSend = useCallback(async (data: RequestData) => {
        await requestStore.sendRequest(data);
    }, []);

    return (
        <RequestPresentation
            request={currentRequest}
            isLoading={isLoading}
            onSend={handleSend}
        />
    );
};

// Presentation Component (UI Only)
interface RequestPresentationProps {
    request: Request | null;
    isLoading: boolean;
    onSend: (data: RequestData) => void;
}

export const RequestPresentation: React.FC<RequestPresentationProps> = ({
    request,
    isLoading,
    onSend
}) => {
    return (
        <div className="request-view">
            {/* Pure UI implementation */}
        </div>
    );
};
```

#### 2. Higher-Order Component Pattern

```typescript
export const withErrorBoundary = <P extends object>(
    Component: React.ComponentType<P>
) => {
    return (props: P) => (
        <ErrorBoundary>
            <Component {...props} />
        </ErrorBoundary>
    );
};

export const withLoadingState = <P extends object>(
    Component: React.ComponentType<P & { isLoading: boolean }>
) => {
    return ({ isLoading, ...props }: P & { isLoading: boolean }) => (
        <>
            {isLoading && <LoadingSpinner />}
            <Component {...props as P} />
        </>
    );
};

export const withTheme = <P extends object>(
    Component: React.ComponentType<P>
) => {
    return (props: P) => (
        <ThemeProvider theme={currentTheme}>
            <Component {...props} />
        </ThemeProvider>
    );
};
```

#### 3. Render Props Pattern

```typescript
interface DataProviderProps<T> {
    data: T;
    children: (data: T) => React.ReactNode;
}

export const DataProvider = <T>({ data, children }: DataProviderProps<T>) => {
    return <>{children(data)}</>;
};

// Usage
<DataProvider data={requestData}>
    {({ url, method, headers }) => (
        <RequestDisplay url={url} method={method} headers={headers} />
    )}
</DataProvider>
```

## 📊 State Management Architecture

### MobX Store Structure

```
Stores
├── RequestStore
│   ├── Observable State
│   │   ├── requests: Map<string, Request>
│   │   ├── currentRequest: Request | null
│   │   ├── filters: FilterState
│   │   └── isLoading: boolean
│   ├── Computed Values
│   │   ├── activeRequests: Request[]
│   │   ├── filteredRequests: Request[]
│   │   └── requestCount: number
│   └── Actions
│       ├── addRequest()
│       ├── updateRequest()
│       ├── deleteRequest()
│       └── setCurrentRequest()
├── SettingsStore
│   ├── Observable State
│   │   ├── theme: Theme
│   │   ├── language: string
│   │   ├── proxySettings: ProxyConfig
│   │   └── userPreferences: UserPrefs
│   ├── Actions
│   │   ├── updateTheme()
│   │   ├── updateLanguage()
│   │   └── updateProxySettings()
│   └── Persistence
│       ├── save()
│       └── load()
├── AccountStore
│   ├── Observable State
│   │   ├── user: User | null
│   │   ├── isAuthenticated: boolean
│   │   ├── subscription: Subscription | null
│   │   └── isLoading: boolean
│   └── Actions
│       ├── login()
│       ├── logout()
│       └── updateSubscription()
└── ToolStore
    ├── Observable State
    │   ├── activeTool: string
    │   ├── toolHistory: ToolHistory[]
    │   └── toolSettings: ToolSettings
    └── Actions
        ├── setActiveTool()
        ├── addToHistory()
        └── updateSettings()
```

### Store Communication

```typescript
// Cross-store communication using reactions
class RequestStore {
    // ... other store code

    constructor() {
        makeAutoObservable(this);
        
        // React to settings changes
        reaction(
            () => settingsStore.maxRequests,
            (maxRequests) => {
                this.trimOldRequests(maxRequests);
            }
        );
        
        // React to account changes
        reaction(
            () => accountStore.isAuthenticated,
            (isAuthenticated) => {
                if (!isAuthenticated) {
                    this.clearSensitiveData();
                }
            }
        );
    }
}
```

## 🎨 Styling Architecture

### Theme System

```
Theme System
├── Base Theme Interface
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   ├── Breakpoints
│   └── Shadows
├── Theme Variants
│   ├── Light Theme
│   ├── Dark Theme
│   └── High Contrast Theme
├── Theme Provider
│   ├── Context Management
│   ├── Theme Switching
│   └── Persistence
└── Styled Components
    ├── Base Components
    ├── Themed Components
    └── Responsive Components
```

### Styled Component Architecture

```typescript
// Base styled component with theme support
const BaseButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
    padding: ${(p as any).theme.spacing.sm} ${(p as any).theme.spacing.md};
    border: 1px solid ${(p as any).theme.containerBorder};
    border-radius: ${(p as any).theme.borderRadius.medium};
    background-color: ${(p as any).theme.mainBackground};
    color: ${(p as any).theme.mainColor};
    font-family: ${(p as any).theme.fontFamily};
    font-size: ${(p as any).theme.fontSize};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${(p as any).theme.containerBackground};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    ${(p as any).variant === 'primary' && `
        background-color: ${(p as any).theme.popColor};
        color: white;
        border-color: ${(p as any).theme.popColor};

        &:hover {
            opacity: 0.8;
        }
    `}

    @media (max-width: ${(p as any).theme.breakpoints.mobile}) {
        padding: ${(p as any).theme.spacing.xs} ${(p as any).theme.spacing.sm};
        font-size: 12px;
    }
`;
```

## 🔌 Plugin Architecture

### Plugin System

```
Plugin System
├── Plugin Interface
│   ├── Lifecycle Hooks
│   ├── Event Handlers
│   └── Configuration
├── Plugin Manager
│   ├── Registration
│   ├── Activation/Deactivation
│   └── Dependency Resolution
├── Plugin Types
│   ├── Request Interceptors
│   ├── Response Modifiers
│   ├── UI Extensions
│   └── Analytics Plugins
└── Plugin Registry
    ├── Discovery
    ├── Validation
    └── Loading
```

### Plugin Implementation

```typescript
interface Plugin {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    dependencies?: string[];
    
    // Lifecycle hooks
    onActivate?(): Promise<void>;
    onDeactivate?(): Promise<void>;
    
    // Event handlers
    onRequest?(request: Request): Promise<Request | null>;
    onResponse?(response: Response): Promise<Response | null>;
    onWebSocketMessage?(message: WebSocketMessage): Promise<WebSocketMessage | null>;
    
    // UI extensions
    getUIComponents?(): React.ComponentType[];
    getMenuItems?(): MenuItem[];
}

class PluginManager {
    private plugins = new Map<string, Plugin>();
    private activePlugins = new Set<string>();

    async register(plugin: Plugin): Promise<void> {
        // Validate plugin
        this.validatePlugin(plugin);
        
        // Check dependencies
        await this.checkDependencies(plugin);
        
        // Register plugin
        this.plugins.set(plugin.id, plugin);
    }

    async activate(pluginId: string): Promise<void> {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) throw new Error(`Plugin ${pluginId} not found`);
        
        // Activate dependencies first
        if (plugin.dependencies) {
            for (const depId of plugin.dependencies) {
                if (!this.activePlugins.has(depId)) {
                    await this.activate(depId);
                }
            }
        }
        
        // Activate plugin
        await plugin.onActivate?.();
        this.activePlugins.add(pluginId);
    }

    async deactivate(pluginId: string): Promise<void> {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) return;
        
        // Check if other plugins depend on this one
        const dependents = this.getDependents(pluginId);
        if (dependents.length > 0) {
            throw new Error(`Cannot deactivate ${pluginId}: required by ${dependents.join(', ')}`);
        }
        
        // Deactivate plugin
        await plugin.onDeactivate?.();
        this.activePlugins.delete(pluginId);
    }
}
```

## 🚀 Performance Architecture

### Optimization Strategies

```
Performance Optimization
├── Code Splitting
│   ├── Route-based Splitting
│   ├── Component-based Splitting
│   └── Tool-based Splitting
├── Lazy Loading
│   ├── Component Lazy Loading
│   ├── Store Lazy Loading
│   └── Resource Lazy Loading
├── Memoization
│   ├── React.memo
│   ├── useMemo
│   └── MobX Computed Values
├── Bundle Optimization
│   ├── Tree Shaking
│   ├── Dead Code Elimination
│   └── Asset Optimization
└── Runtime Optimization
    ├── Virtual Scrolling
    ├── Request Debouncing
    └── Memory Management
```

### Performance Implementation

```typescript
// Code splitting with React.lazy
const ToolsPage = React.lazy(() => import('./pages/ToolsPage'));
const InterceptPage = React.lazy(() => import('./pages/InterceptPage'));

// Component memoization
const RequestListItem = React.memo<RequestListItemProps>(({ request, onSelect }) => {
    return (
        <div onClick={() => onSelect(request.id)}>
            {request.method} {request.url}
        </div>
    );
}, (prevProps, nextProps) => {
    return prevProps.request.id === nextProps.request.id;
});

// Store memoization with computed values
class RequestStore {
    get filteredRequests(): Request[] {
        return this.requests.filter(request => 
            this.matchesFilters(request, this.filters)
        );
    }

    get requestStats(): RequestStats {
        return {
            total: this.requests.size,
            successful: this.getSuccessfulCount(),
            failed: this.getFailedCount(),
            averageTime: this.getAverageResponseTime()
        };
    }
}

// Virtual scrolling for large lists
const VirtualRequestList: React.FC = ({ requests }) => {
    return (
        <FixedSizeList
            height={600}
            itemCount={requests.length}
            itemSize={60}
            itemData={requests}
        >
            {RequestListItem}
        </FixedSizeList>
    );
};
```

## 🔒 Security Architecture

### Security Layers

```
Security Architecture
├── Input Validation
│   ├── Client-side Validation
│   ├── Server-side Validation
│   └── Sanitization
├── Content Security Policy
│   ├── CSP Headers
│   ├── Script Restrictions
│   └── Resource Whitelisting
├── Authentication & Authorization
│   ├── Token Management
│   ├── Session Management
│   └── Permission Checks
├── Data Protection
│   ├── Encryption
│   ├── Secure Storage
│   └── Data Minimization
└── Monitoring & Auditing
    ├── Security Events
    ├── Error Tracking
    └── Access Logs
```

### Security Implementation

```typescript
// Input validation and sanitization
export const validateAndSanitize = (input: string, type: 'url' | 'json' | 'text'): string => {
    // Validate input format
    const validator = validators[type];
    if (!validator(input)) {
        throw new Error(`Invalid ${type} format`);
    }
    
    // Sanitize input
    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: allowedTags[type],
        ALLOWED_ATTR: allowedAttrs[type]
    });
};

// CSP implementation
export const cspConfig: ContentSecurityPolicy = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'connect-src': ["'self'", 'https://api.httptoolkit.tech'],
    'font-src': ["'self'", 'data:'],
    'object-src': ["'none'"],
    'media-src': ["'self'"],
    'frame-src': ["'none'"]
};

// Secure token management
class TokenManager {
    private static instance: TokenManager;
    private token: string | null = null;
    private expiry: number | null = null;

    static getInstance(): TokenManager {
        if (!TokenManager.instance) {
            TokenManager.instance = new TokenManager();
        }
        return TokenManager.instance;
    }

    async setToken(token: string, expiresIn: number): Promise<void> {
        this.token = token;
        this.expiry = Date.now() + expiresIn * 1000;
        
        // Store securely
        await secureStorage.setItem('authToken', token);
    }

    async getToken(): Promise<string | null> {
        if (!this.token || !this.expiry) {
            this.token = await secureStorage.getItem('authToken');
            this.expiry = await secureStorage.getItem('tokenExpiry');
        }

        if (!this.token || !this.expiry || Date.now() > this.expiry) {
            await this.clearToken();
            return null;
        }

        return this.token;
    }

    async clearToken(): Promise<void> {
        this.token = null;
        this.expiry = null;
        await secureStorage.removeItem('authToken');
        await secureStorage.removeItem('tokenExpiry');
    }
}
```

## 📱 Mobile Architecture

### Mobile Integration

```
Mobile Architecture
├── Certificate Management
│   ├── Installation
│   ├── Validation
│   └── Removal
├── Proxy Configuration
│   ├── System Proxy
│   ├── App Proxy
│   └── VPN Integration
├── App Integration
│   ├── App Discovery
│   ├── App Launching
│   └── Traffic Interception
└── Mobile UI
    ├── Responsive Design
    ├── Touch Interactions
    └── Mobile-specific Features
```

## 🔄 Communication Architecture

### API Communication

```
Communication Layer
├── REST API Client
│   ├── Request/Response Handling
│   ├── Error Handling
│   └── Retry Logic
├── WebSocket Client
│   ├── Connection Management
│   ├── Message Handling
│   └── Reconnection Logic
├── GraphQL Client
│   ├── Query/Mutation Handling
│   ├── Caching
│   └── Subscriptions
└── Event Bus
    ├── Local Events
    ├── Cross-component Events
    └── Plugin Events
```

### Communication Implementation

```typescript
// REST API client
class APIClient {
    private baseURL: string;
    private headers: Record<string, string>;

    constructor(baseURL: string, headers: Record<string, string> = {}) {
        this.baseURL = baseURL;
        this.headers = headers;
    }

    async request<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<APIResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: { ...this.headers, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new APIError(response.status, response.statusText);
            }

            return await response.json();
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            throw new NetworkError('Network request failed', error);
        }
    }

    async get<T>(endpoint: string, params?: Record<string, any>): Promise<APIResponse<T>> {
        const query = params ? `?${new URLSearchParams(params).toString()}` : '';
        return this.request<T>(`${endpoint}${query}`);
    }

    async post<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined
        });
    }
}

// WebSocket client
class WebSocketClient {
    private ws: WebSocket | null = null;
    private url: string;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;

    constructor(url: string) {
        this.url = url;
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => {
                this.reconnectAttempts = 0;
                resolve();
            };

            this.ws.onerror = (error) => {
                reject(error);
            };

            this.ws.onclose = () => {
                this.scheduleReconnect();
            };

            this.ws.onmessage = (event) => {
                this.handleMessage(event.data);
            };
        });
    }

    private scheduleReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
                this.reconnectAttempts++;
                this.connect();
            }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
        }
    }

    private handleMessage(data: string): void {
        try {
            const message = JSON.parse(data);
            eventBus.emit('websocket:message', message);
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
        }
    }
}
```

---

This architecture overview provides a comprehensive understanding of HTTP Toolkit UI's design patterns, component structure, and technical implementation. For more detailed information about specific components, please refer to the relevant documentation or source code.
