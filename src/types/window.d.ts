export {};

declare global {
  interface Window {
    HTTP_TOOLKIT_CONFIG?: {
      serverPort: number;
      uiPort: number;
      host: string;
      apiEndpoint: string;
      graphqlEndpoint: string;
      wsEndpoint: string;
      uiEndpoint: string;
    };
    
    updateHTKConfig?: (config: Window['HTTP_TOOLKIT_CONFIG']) => void;
    
    flutterToUI?: (command: string) => void;
    uiToFlutter?: (message: string) => void;
    
    originalFetch?: typeof fetch;
    originalWebSocket?: typeof WebSocket;
  }
}
