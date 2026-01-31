import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { getServerApiUrl } from '../config/server-config';
import { ApiError } from '../services/server-api-types';

interface ServerConnectionStatusProps {
    className?: string;
}

export const ServerConnectionStatus = observer((props: ServerConnectionStatusProps) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [lastError, setLastError] = useState<string | null>(null);

    const checkServerConnection = async () => {
        setIsChecking(true);
        setLastError(null);
        
        try {
            const response = await fetch(`${getServerApiUrl()}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                setIsConnected(true);
                setLastError(null);
            } else {
                setIsConnected(false);
                setLastError(`Server returned ${response.status}`);
            }
        } catch (error) {
            setIsConnected(false);
            setLastError(error instanceof Error ? error.message : 'Connection failed');
        } finally {
            setIsChecking(false);
        }
    };

    useEffect(() => {
        // Check connection immediately
        checkServerConnection();
        
        // Set up periodic connection checks
        const interval = setInterval(checkServerConnection, 5000); // Check every 5 seconds
        
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = () => {
        if (isChecking) return '#ffc107'; // Yellow
        if (isConnected) return '#28a745'; // Green
        return '#dc3545'; // Red
    };

    const getStatusText = () => {
        if (isChecking) return 'Checking...';
        if (isConnected) return 'Connected';
        return 'Disconnected';
    };

    const getStatusIcon = () => {
        if (isChecking) return '⏳';
        if (isConnected) return '🟢';
        return '🔴';
    };

    return (
        <div className={`server-connection-status ${props.className || ''}`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: getStatusColor() + '20',
            border: `1px solid ${getStatusColor()}`,
            fontSize: '12px',
            fontFamily: 'monospace'
        }}>
            <span style={{ fontSize: '10px' }}>{getStatusIcon()}</span>
            <span style={{ color: getStatusColor() }}>{getStatusText()}</span>
            {lastError && (
                <span style={{ 
                    fontSize: '10px', 
                    color: '#666',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }} title={lastError}>
                    ({lastError})
                </span>
            )}
            <button
                onClick={checkServerConnection}
                disabled={isChecking}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: isChecking ? 'not-allowed' : 'pointer',
                    fontSize: '10px',
                    padding: '2px 4px',
                    borderRadius: '2px'
                }}
                title="Refresh connection"
            >
                🔄
            </button>
        </div>
    );
});
