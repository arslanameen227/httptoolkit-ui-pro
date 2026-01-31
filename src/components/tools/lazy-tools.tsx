/**
 * Lazy loading utilities for tool components
 * Improves initial bundle size and loading performance
 */

import * as React from 'react';
import { lazy, Suspense } from 'react';

// Loading component for lazy loaded tools
const ToolLoadingFallback: React.FC = () => (
    <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
    }}>
        <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }} />
        <div style={{ color: '#666', fontSize: '14px' }}>
            Loading tool...
        </div>
        <style>{`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

// Lazy loaded tool components
export const LazyJSONBeautifierTool = lazy(() => import('./json-beautifier').then(module => ({ 
    default: module.JSONBeautifierTool 
})));

export const LazyJSONValidatorTool = lazy(() => import('./json-validator').then(module => ({ 
    default: module.JSONValidatorTool 
})));

export const LazyBase64Tool = lazy(() => import('./base64-tool').then(module => ({ 
    default: module.Base64Tool 
})));

export const LazyHashTool = lazy(() => import('./hash-tool').then(module => ({ 
    default: module.HashTool 
})));

export const LazyJWTTool = lazy(() => import('./jwt-tool').then(module => ({ 
    default: module.JWTTool 
})));

export const LazyTimestampTool = lazy(() => import('./timestamp-tool').then(module => ({ 
    default: module.TimestampTool 
})));

export const LazyURLEncoderDecoderTool = lazy(() => import('./url-encoder-decoder').then(module => ({ 
    default: module.URLEncoderDecoderTool 
})));

export const LazyMarkdownPreviewTool = lazy(() => import('./markdown-preview').then(module => ({ 
    default: module.MarkdownPreviewTool 
})));

export const LazyUUIDGeneratorTool = lazy(() => import('./uuid-generator').then(module => ({ 
    default: module.UUIDGeneratorTool 
})));

export const LazyColorConverterTool = lazy(() => import('./color-converter').then(module => ({ 
    default: module.ColorConverterTool 
})));

export const LazyQRCodeGeneratorTool = lazy(() => import('./qr-code-generator').then(module => ({ 
    default: module.QRCodeGeneratorTool 
})));

export const LazyAESEncryptorTool = lazy(() => import('./aes-encryptor').then(module => ({ 
    default: module.AESEncryptorTool 
})));

export const LazyJWTGeneratorTool = lazy(() => import('./jwt-generator').then(module => ({ 
    default: module.JWTGeneratorTool 
})));

export const LazyDurationCalculatorTool = lazy(() => import('./duration-calculator').then(module => ({ 
    default: module.DurationCalculatorTool 
})));

export const LazyXMLConverterTool = lazy(() => import('./xml-converter').then(module => ({ 
    default: module.XMLConverterTool 
})));

export const LazyCSVConverterTool = lazy(() => import('./csv-converter').then(module => ({ 
    default: module.CSVConverterTool 
})));

export const LazyHexConverterTool = lazy(() => import('./hex-converter').then(module => ({ 
    default: module.HexConverterTool 
})));

// Lazy tool wrapper component
interface LazyToolWrapperProps {
    toolId: string;
    tool: any; // ToolDefinition
}

export const LazyToolWrapper: React.FC<LazyToolWrapperProps> = ({ toolId, tool }) => {
    const getLazyComponent = React.useCallback(() => {
        switch (toolId) {
            case 'json-beautifier':
                return LazyJSONBeautifierTool;
            case 'json-validator':
                return LazyJSONValidatorTool;
            case 'base64-encoder':
                return LazyBase64Tool;
            case 'hash-generator':
                return LazyHashTool;
            case 'jwt-decoder':
                return LazyJWTTool;
            case 'timestamp-converter':
                return LazyTimestampTool;
            case 'url-encoder-decoder':
                return LazyURLEncoderDecoderTool;
            case 'markdown-preview':
                return LazyMarkdownPreviewTool;
            case 'uuid-generator':
                return LazyUUIDGeneratorTool;
            case 'color-converter':
                return LazyColorConverterTool;
            case 'qr-code-generator':
                return LazyQRCodeGeneratorTool;
            case 'aes-encryptor':
                return LazyAESEncryptorTool;
            case 'jwt-generator':
                return LazyJWTGeneratorTool;
            case 'duration-calculator':
                return LazyDurationCalculatorTool;
            case 'xml-converter':
                return LazyXMLConverterTool;
            case 'csv-converter':
                return LazyCSVConverterTool;
            case 'hex-converter':
                return LazyHexConverterTool;
            default:
                return null;
        }
    }, [toolId]);

    const LazyComponent = getLazyComponent();

    if (!LazyComponent) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                Tool not found: {toolId}
            </div>
        );
    }

    return (
        <Suspense fallback={<ToolLoadingFallback />}>
            <LazyComponent tool={tool} />
        </Suspense>
    );
};

// Preload utility for critical tools
export const preloadTool = (toolId: string) => {
    switch (toolId) {
        case 'json-beautifier':
            import('./json-beautifier');
            break;
        case 'json-validator':
            import('./json-validator');
            break;
        case 'base64-encoder':
            import('./base64-tool');
            break;
        // Add more as needed for critical paths
    }
};

// Batch preload for commonly used tools
export const preloadCommonTools = () => {
    preloadTool('json-beautifier');
    preloadTool('json-validator');
    preloadTool('base64-encoder');
};
