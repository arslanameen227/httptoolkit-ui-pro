import * as React from 'react';
import styled from 'styled-components';
import { Theme } from '../../styles';
import { Button, Select } from '../common/inputs';
import { ContentLabel, ContentValue } from '../common/text-content';

interface AESEncryptorState {
    inputText: string;
    outputText: string;
    password: string;
    operation: 'encrypt' | 'decrypt';
    keySize: 128 | 192 | 256;
    mode: 'CBC' | 'GCM' | 'ECB';
    error: string;
}

const AESEncryptorContainer = styled.div`
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
    min-width: 150px;
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
    min-height: 150px;
    font-family: 'Courier New', monospace;
`;

const StyledInput = styled.input`
    padding: 8px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.inputBackground};
    color: ${p => (p as any).theme.mainColor};
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
    margin-top: 16px;
`;

const ErrorMessage = styled.div`
    color: ${(p: any) => p.theme.warningColor};
    padding: 8px;
    background-color: ${(p: any) => p.theme.highlightBackground};
    border-radius: 4px;
    margin-top: 8px;
`;

const InfoMessage = styled.div`
    color: ${(p: any) => p.theme.lowlightText};
    font-size: 12px;
    margin-top: 8px;
`;

// Simple AES encryption/decryption using Web Crypto API
class AESCrypto {
    static async encrypt(text: string, password: string, keySize: number, mode: string): Promise<string> {
        try {
            const encoder = new TextEncoder();
            const passwordData = encoder.encode(password);
            
            // Generate key from password
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                passwordData,
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );

            const salt = crypto.getRandomValues(new Uint8Array(16));
            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: keySize },
                false,
                ['encrypt']
            );

            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encoder.encode(text)
            );

            // Combine salt, iv, and encrypted data
            const combined = new Uint8Array(salt.length + iv.length + new Uint8Array(encrypted).length);
            combined.set(salt);
            combined.set(iv, salt.length);
            combined.set(new Uint8Array(encrypted), salt.length + iv.length);

            return btoa(String.fromCharCode(...combined));
        } catch (error) {
            throw new Error('Encryption failed: ' + (error as Error).message);
        }
    }

    static async decrypt(encryptedText: string, password: string, keySize: number, mode: string): Promise<string> {
        try {
            const combined = new Uint8Array(
                atob(encryptedText).split('').map(char => char.charCodeAt(0))
            );

            const salt = combined.slice(0, 16);
            const iv = combined.slice(16, 28);
            const encrypted = combined.slice(28);

            const encoder = new TextEncoder();
            const passwordData = encoder.encode(password);
            
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                passwordData,
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );

            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: keySize },
                false,
                ['decrypt']
            );

            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encrypted
            );

            return new TextDecoder().decode(decrypted);
        } catch (error) {
            throw new Error('Decryption failed: ' + (error as Error).message);
        }
    }
}

export const AESEncryptorTool: React.FC = () => {
    const [state, setState] = React.useState<AESEncryptorState>({
        inputText: '',
        outputText: '',
        password: '',
        operation: 'encrypt',
        keySize: 256,
        mode: 'GCM',
        error: ''
    });

    const handleProcess = async () => {
        if (!state.inputText.trim()) {
            setState(prev => ({ ...prev, error: 'Please enter text to process', outputText: '' }));
            return;
        }

        if (!state.password.trim()) {
            setState(prev => ({ ...prev, error: 'Please enter a password', outputText: '' }));
            return;
        }

        try {
            setState(prev => ({ ...prev, error: '', outputText: 'Processing...' }));
            
            let result: string;
            if (state.operation === 'encrypt') {
                result = await AESCrypto.encrypt(state.inputText, state.password, state.keySize, state.mode);
            } else {
                result = await AESCrypto.decrypt(state.inputText, state.password, state.keySize, state.mode);
            }
            
            setState(prev => ({ ...prev, outputText: result, error: '' }));
        } catch (error) {
            setState(prev => ({ 
                ...prev, 
                error: (error as Error).message, 
                outputText: '' 
            }));
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(state.outputText);
            // Could add a toast notification here
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    const handleClear = () => {
        setState(prev => ({
            ...prev,
            inputText: '',
            outputText: '',
            error: ''
        }));
    };

    return (
        <AESEncryptorContainer>
            <h3>AES Encryptor/Decryptor</h3>
            
            <ControlsContainer>
                <ControlGroup>
                    <ContentLabel>Operation:</ContentLabel>
                    <Select
                        value={state.operation}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setState(prev => ({ 
                            ...prev, 
                            operation: e.target.value as 'encrypt' | 'decrypt',
                            outputText: '',
                            error: ''
                        }))}
                    >
                        <option value="encrypt">Encrypt</option>
                        <option value="decrypt">Decrypt</option>
                    </Select>
                </ControlGroup>

                <ControlGroup>
                    <ContentLabel>Key Size:</ContentLabel>
                    <Select
                        value={state.keySize.toString()}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setState(prev => ({ 
                            ...prev, 
                            keySize: parseInt(e.target.value) as 128 | 192 | 256,
                            outputText: '',
                            error: ''
                        }))}
                    >
                        <option value="128">128 bits</option>
                        <option value="192">192 bits</option>
                        <option value="256">256 bits</option>
                    </Select>
                </ControlGroup>

                <ControlGroup>
                    <ContentLabel>Password:</ContentLabel>
                    <StyledInput
                        type="password"
                        value={state.password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setState(prev => ({ 
                            ...prev, 
                            password: e.target.value,
                            outputText: '',
                            error: ''
                        }))}
                        placeholder="Enter encryption password"
                    />
                </ControlGroup>
            </ControlsContainer>

            <TextAreaContainer>
                <InputSection>
                    <ContentLabel>Input Text:</ContentLabel>
                    <StyledTextArea
                        value={state.inputText}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setState(prev => ({ 
                            ...prev, 
                            inputText: e.target.value,
                            outputText: '',
                            error: ''
                        }))}
                        placeholder="Enter text to encrypt or decrypt..."
                    />
                </InputSection>

                <OutputSection>
                    <ContentLabel>Output:</ContentLabel>
                    <StyledTextArea
                        value={state.outputText}
                        readOnly
                        placeholder="Result will appear here..."
                    />
                </OutputSection>
            </TextAreaContainer>

            {state.error && (
                <ErrorMessage>
                    {state.error}
                </ErrorMessage>
            )}

            <ActionButtons>
                <Button onClick={handleProcess}>
                    {state.operation === 'encrypt' ? 'Encrypt' : 'Decrypt'}
                </Button>
                <Button onClick={handleCopy} disabled={!state.outputText}>
                    Copy Output
                </Button>
                <Button onClick={handleClear}>
                    Clear
                </Button>
            </ActionButtons>

            <InfoMessage>
                Uses AES-GCM encryption with PBKDF2 key derivation. Your password is used to generate the encryption key.
                Encrypted data includes salt and IV for secure decryption.
            </InfoMessage>
        </AESEncryptorContainer>
    );
};
