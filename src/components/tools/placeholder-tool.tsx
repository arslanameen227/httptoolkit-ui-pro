import * as React from 'react';

// Placeholder components for tools not yet implemented
interface ToolDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'json' | 'crypto' | 'jwt' | 'timestamp' | 'conversion';
    component: React.ComponentType<any>;
}

export const PlaceholderTool: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
    return (
        <div style={{ 
            padding: '20px', 
            textAlign: 'center',
            color: '#999'
        }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                {tool.icon}
            </div>
            <h2 style={{ margin: '0 0 8px 0' }}>{tool.name}</h2>
            <p style={{ margin: '0 0 16px 0' }}>{tool.description}</p>
            <div style={{ 
                padding: '16px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '14px',
                textAlign: 'left'
            }}>
                <strong>Tool ID:</strong> {tool.id}<br />
                <strong>Category:</strong> {tool.category}<br />
                <strong>Status:</strong> Coming soon...
            </div>
        </div>
    );
};
