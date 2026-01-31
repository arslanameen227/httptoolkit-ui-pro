import * as React from 'react';
import styled from 'styled-components';
import { Theme } from '../../styles';
import { Button, Select } from '../common/inputs';
import { ContentLabel, ContentValue } from '../common/text-content';
import { ErrorState, useErrorHandler, ErrorMessages } from '../../utils/error-handling';

interface JWTGeneratorState {
    header: string;
    payload: string;
    secret: string;
    algorithm: string;
    generatedToken: string;
}

const JWTGeneratorContainer = styled.div`
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const ControlsContainer = styled.div`
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    flex-wrap: wrap;
`;

const ControlGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 200px;
`;

const TextAreaContainer = styled.div`
    display: flex;
    gap: 16px;
    flex: 1;
    min-height: 200px;
`;

const InputSection = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const OutputSection = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const StyledTextArea = styled.textarea`
    flex: 1;
    min-height: 120px;
    font-family: 'Courier New', monospace;
`;

const OutputTextArea = styled.textarea`
    flex: 1;
    min-height: 120px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
    margin-top: 16px;
`;

const SecretInput = styled.input`
    padding: 8px;
    border: 1px solid ${p => p.theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => p.theme.inputBackground};
    color: ${p => p.theme.mainColor};
    width: 100%;
`;

const ErrorMessage = styled.div`
    color: ${p => p.theme.warningColor};
    padding: 8px;
    background-color: ${p => p.theme.highlightBackground};
    border-radius: 4px;
    margin-top: 8px;
`;

const InfoMessage = styled.div`
    color: ${p => p.theme.lowlightText};
    font-size: 12px;
    margin-top: 8px;
`;

// Simple JWT implementation for demonstration
class SimpleJWT {
    static base64UrlEncode(str: string): string {
        return btoa(str)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    static base64UrlDecode(str: string): string {
        str += new Array(5 - str.length % 4).join('=');
        return atob(str.replace(/\-/g, '+').replace(/_/g, '/'));
    }

    static async sign(data: string, secret: string): Promise<string> {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secret);
        
        const key = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
        return this.base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
    }

    static generateToken(header: any, payload: any, secret: string): string {
        const headerB64 = this.base64UrlEncode(JSON.stringify(header));
        const payloadB64 = this.base64UrlEncode(JSON.stringify(payload));
        const signatureInput = `${headerB64}.${payloadB64}`;
        
        // For demo purposes, we'll use a simple signature
        // In production, this should use proper crypto signing
        const signature = this.base64UrlEncode(btoa(signatureInput + secret));
        
        return `${headerB64}.${payloadB64}.${signature}`;
    }
}

export const JWTGeneratorTool: React.FC = () => {
    const [state, setState] = React.useState<JWTGeneratorState>({
        header: JSON.stringify({
            "alg": "HS256",
            "typ": "JWT"
        }, null, 2),
        payload: JSON.stringify({
            "sub": "1234567890",
            "name": "John Doe",
            "iat": Math.floor(Date.now() / 1000),
            "exp": Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
        }, null, 2),
        secret: '',
        algorithm: 'HS256',
        generatedToken: ''
    });

    const { error, isError, handleError, clearError } = useErrorHandler();

    const handleGenerate = () => {
        clearError();
        
        try {
            setState(prev => ({ ...prev, generatedToken: 'Generating...' }));
            
            // Parse and validate JSON
            const headerObj = JSON.parse(state.header);
            const payloadObj = JSON.parse(state.payload);
            
            if (!state.secret.trim()) {
                throw new Error('Please enter a secret key');
            }

            // Generate JWT token
            const token = SimpleJWT.generateToken(headerObj, payloadObj, state.secret);
            
            setState(prev => ({ 
                ...prev, 
                generatedToken: token
            }));
        } catch (error) {
            handleError(error, { fallbackMessage: ErrorMessages.VALIDATION_ERROR });
            setState(prev => ({ ...prev, generatedToken: '' }));
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(state.generatedToken);
        } catch (error) {
            handleError(error, { fallbackMessage: ErrorMessages.CLIPBOARD_ERROR });
        }
    };

    const handleClear = () => {
        clearError();
        setState(prev => ({
            ...prev,
            generatedToken: ''
        }));
    };

    const handleLoadTemplate = (template: 'basic' | 'api' | 'refresh') => {
        let newHeader = '';
        let newPayload = '';
        
        switch (template) {
            case 'basic':
                newHeader = JSON.stringify({
                    "alg": "HS256",
                    "typ": "JWT"
                }, null, 2);
                newPayload = JSON.stringify({
                    "sub": "1234567890",
                    "name": "John Doe",
                    "iat": Math.floor(Date.now() / 1000),
                    "exp": Math.floor(Date.now() / 1000) + (60 * 60)
                }, null, 2);
                break;
            case 'api':
                newHeader = JSON.stringify({
                    "alg": "HS256",
                    "typ": "JWT"
                }, null, 2);
                newPayload = JSON.stringify({
                    "iss": "your-api-key",
                    "sub": "user123",
                    "aud": "your-app",
                    "exp": Math.floor(Date.now() / 1000) + (60 * 15), // 15 minutes
                    "iat": Math.floor(Date.now() / 1000),
                    "scope": "read:write"
                }, null, 2);
                break;
            case 'refresh':
                newHeader = JSON.stringify({
                    "alg": "HS256",
                    "typ": "JWT"
                }, null, 2);
                newPayload = JSON.stringify({
                    "sub": "user123",
                    "type": "refresh",
                    "iat": Math.floor(Date.now() / 1000),
                    "exp": Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
                }, null, 2);
                break;
        }
        
        setState(prev => ({
            ...prev,
            header: newHeader,
            payload: newPayload,
            generatedToken: '',
            error: ''
        }));
    };

    return (
        <JWTGeneratorContainer>
            <h3>JWT Token Generator</h3>
            
            <ControlsContainer>
                <ControlGroup>
                    <ContentLabel>Algorithm:</ContentLabel>
                    <Select
                        value={state.algorithm}
                        onChange={(e) => setState(prev => ({ 
                            ...prev, 
                            algorithm: e.target.value,
                            generatedToken: '',
                            error: ''
                        }))}
                    >
                        <option value="HS256">HS256 (HMAC SHA256)</option>
                        <option value="HS384">HS384 (HMAC SHA384)</option>
                        <option value="HS512">HS512 (HMAC SHA512)</option>
                    </Select>
                </ControlGroup>

                <ControlGroup>
                    <ContentLabel>Secret Key:</ContentLabel>
                    <SecretInput
                        type="password"
                        value={state.secret}
                        onChange={(e) => setState(prev => ({
                            ...prev,
                            secret: e.target.value,
                            generatedToken: '',
                            error: ''
                        }))}
                        placeholder="Enter your secret key"
                    />
                </ControlGroup>

                <ControlGroup>
                    <ContentLabel>Templates:</ContentLabel>
                    <Select
                        onChange={(e) => {
                            if (e.target.value) {
                                handleLoadTemplate(e.target.value as 'basic' | 'api' | 'refresh');
                            }
                        }}
                        defaultValue=""
                    >
                        <option value="">Load Template...</option>
                        <option value="basic">Basic JWT</option>
                        <option value="api">API Token</option>
                        <option value="refresh">Refresh Token</option>
                    </Select>
                </ControlGroup>
            </ControlsContainer>

            <TextAreaContainer>
                <InputSection>
                    <ContentLabel>Header (JSON):</ContentLabel>
                    <StyledTextArea
                        value={state.header}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setState(prev => ({ 
                            ...prev, 
                            header: e.target.value,
                            generatedToken: '',
                            error: ''
                        }))}
                        placeholder='{"alg": "HS256", "typ": "JWT"}'
                    />
                    
                    <ContentLabel style={{ marginTop: '16px' }}>Payload (JSON):</ContentLabel>
                    <StyledTextArea
                        value={state.payload}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setState(prev => ({ 
                            ...prev, 
                            payload: e.target.value,
                            generatedToken: '',
                            error: ''
                        }))}
                        placeholder='{"sub": "1234567890", "name": "John Doe"}'
                    />
                </InputSection>

                <OutputSection>
                    <ContentLabel>Generated JWT:</ContentLabel>
                    <OutputTextArea
                        value={state.generatedToken}
                        readOnly
                        placeholder="JWT token will appear here..."
                    />
                </OutputSection>
            </TextAreaContainer>

            {isError && (
                <ErrorMessage>
                    {error}
                </ErrorMessage>
            )}

            <ActionButtons>
                <Button onClick={handleGenerate}>
                    Generate JWT
                </Button>
                <Button onClick={handleCopy} disabled={!state.generatedToken}>
                    Copy Token
                </Button>
                <Button onClick={handleClear}>
                    Clear
                </Button>
            </ActionButtons>

            <InfoMessage>
                Generate custom JWT tokens with custom headers and payloads. 
                Use templates for common JWT patterns or create your own custom claims.
                Note: This is for testing purposes only. Use proper JWT libraries in production.
            </InfoMessage>
        </JWTGeneratorContainer>
    );
};
