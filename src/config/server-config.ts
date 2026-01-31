// Server configuration for Tauri integration
export interface ServerConfig {
    apiUrl: string;
    adminUrl: string;
    wsUrl: string;
}

// Get server configuration from environment variables or defaults
export function getServerConfig(): ServerConfig {
    const apiUrl = process.env.REACT_APP_SERVER_API_URL || 
                  'http://127.0.0.1:45457';
    
    const adminUrl = process.env.REACT_APP_SERVER_ADMIN_URL || 
                    'http://127.0.0.1:45456';
    
    const wsUrl = process.env.REACT_APP_SERVER_WS_URL || 
                 'ws://127.0.0.1:45456';

    return {
        apiUrl,
        adminUrl,
        wsUrl
    };
}

// Get server URL for API requests
export function getServerApiUrl(): string {
    return getServerConfig().apiUrl;
}

// Get server URL for admin requests
export function getServerAdminUrl(): string {
    return getServerConfig().adminUrl;
}

// Get WebSocket URL for server
export function getServerWsUrl(): string {
    return getServerConfig().wsUrl;
}
