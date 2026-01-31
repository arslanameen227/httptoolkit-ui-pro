import * as React from 'react';
import { observer } from 'mobx-react';
import { styled } from '../../styles';

// Base64 Encoder/Decoder Tool Component
const Base64ToolContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 20px;
`;

const ToolHeader = styled.div`
    margin-bottom: 20px;
`;

const ToolTitle = styled.h2`
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 600;
    color: ${p => (p as any).theme.mainColor};
`;

const ToolDescription = styled.p`
    margin: 0;
    font-size: 14px;
    color: ${p => (p as any).theme.lowlightText};
`;

const ToolContent = styled.div`
    display: flex;
    flex: 1;
    gap: 20px;
    min-height: 0;
`;

const InputSection = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
`;

const OutputSection = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
`;

const SectionTitle = styled.h3`
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: ${p => (p as any).theme.mainColor};
`;

const TextArea = styled.textarea`
    flex: 1;
    padding: 12px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-family: ${p => (p as any).theme.monoFontFamily};
    font-size: 13px;
    resize: none;
    line-height: 1.4;

    &:focus {
        outline: 2px solid ${p => (p as any).theme.popColor};
        outline-offset: -2px;
    }

    &::placeholder {
        color: ${p => (p as any).theme.lowlightText};
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 8px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
    padding: 6px 12px;
    border: 1px solid ${p => (p as any).variant === 'primary' ? (p as any).theme.popColor : (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).variant === 'primary' ? (p as any).theme.popColor : (p as any).theme.mainBackground};
    color: ${p => (p as any).variant === 'primary' ? 'white' : (p as any).theme.mainColor};
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        opacity: 0.8;
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`;

const OptionsContainer = styled.div`
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    padding: 12px;
    background-color: ${p => (p as any).theme.containerBackground};
    border-radius: 4px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
`;

const OptionGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const OptionLabel = styled.label`
    font-size: 13px;
    color: ${p => (p as any).theme.mainColor};
`;

const Select = styled.select`
    padding: 4px 8px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: 12px;
`;

const ErrorMessage = styled.div`
    padding: 8px 12px;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 4px;
    color: #dc2626;
    font-size: 12px;
    margin-bottom: 12px;
`;

const SuccessMessage = styled.div`
    padding: 8px 12px;
    background-color: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 4px;
    color: #16a34a;
    font-size: 12px;
    margin-bottom: 12px;
`;

const StatsContainer = styled.div`
    display: flex;
    gap: 16px;
    margin-top: 12px;
    padding: 8px;
    background-color: ${p => (p as any).theme.containerBackground};
    border-radius: 4px;
    font-size: 12px;
`;

const StatItem = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
`;

const StatLabel = styled.span`
    color: ${p => (p as any).theme.lowlightText};
`;

const StatValue = styled.span`
    font-weight: 600;
    color: ${p => (p as any).theme.mainColor};
`;

interface Base64ToolState {
    input: string;
    output: string;
    mode: 'encode' | 'decode';
    error: string | null;
    success: string | null;
    charset: 'utf-8' | 'ascii' | 'latin1';
    urlSafe: boolean;
}

export const Base64Tool: React.FC = () => {
    const [state, setState] = React.useState<Base64ToolState>({
        input: '',
        output: '',
        mode: 'encode',
        error: null,
        success: null,
        charset: 'utf-8',
        urlSafe: false
    });

    const encode = React.useCallback(() => {
        if (!state.input) {
            setState(prev => ({
                ...prev,
                output: '',
                error: null,
                success: null
            }));
            return;
        }

        try {
            let encoded: string;
            
            if (state.urlSafe) {
                encoded = btoa(state.input)
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=/g, '');
            } else {
                encoded = btoa(state.input);
            }
            
            setState(prev => ({
                ...prev,
                output: encoded,
                error: null,
                success: 'Successfully encoded to Base64!'
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                output: '',
                error: `Encoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: null
            }));
        }
    }, [state.input, state.urlSafe]);

    const decode = React.useCallback(() => {
        if (!state.input) {
            setState(prev => ({
                ...prev,
                output: '',
                error: null,
                success: null
            }));
            return;
        }

        try {
            let decoded: string;
            
            if (state.urlSafe) {
                // Add padding if needed
                const paddedInput = state.input + '='.repeat((4 - state.input.length % 4) % 4);
                decoded = atob(paddedInput.replace(/-/g, '+').replace(/_/g, '/'));
            } else {
                decoded = atob(state.input);
            }
            
            setState(prev => ({
                ...prev,
                output: decoded,
                error: null,
                success: 'Successfully decoded from Base64!'
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                output: '',
                error: `Decoding failed: ${error instanceof Error ? error.message : 'Invalid Base64 input'}`,
                success: null
            }));
        }
    }, [state.input, state.urlSafe]);

    const copyToClipboard = React.useCallback(async () => {
        if (!state.output) return;

        try {
            await navigator.clipboard.writeText(state.output);
            setState(prev => ({
                ...prev,
                success: 'Copied to clipboard!',
                error: null
            }));
            
            setTimeout(() => {
                setState(prev => ({ ...prev, success: null }));
            }, 2000);
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: 'Failed to copy to clipboard',
                success: null
            }));
        }
    }, [state.output]);

    const clearAll = React.useCallback(() => {
        setState(prev => ({
            ...prev,
            input: '',
            output: '',
            error: null,
            success: null
        }));
    }, []);

    const loadSample = React.useCallback(() => {
        if (state.mode === 'encode') {
            setState(prev => ({
                ...prev,
                input: 'Hello, World! This is a test string for Base64 encoding.',
                output: '',
                error: null,
                success: 'Sample text loaded!'
            }));
        } else {
            setState(prev => ({
                ...prev,
                input: state.urlSafe ? 'SGVsbG8sIFdvcmxkIQ' : 'SGVsbG8sIFdvcmxkIQ==',
                output: '',
                error: null,
                success: 'Sample Base64 loaded!'
            }));
        }
    }, [state.mode, state.urlSafe]);

    const swapInputOutput = React.useCallback(() => {
        setState(prev => ({
            ...prev,
            input: prev.output,
            output: prev.input,
            mode: prev.mode === 'encode' ? 'decode' : 'encode',
            error: null,
            success: `Switched to ${prev.mode === 'encode' ? 'decode' : 'encode'} mode`
        }));
    }, []);

    // Auto-process on input change
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (state.input) {
                if (state.mode === 'encode') {
                    encode();
                } else {
                    decode();
                }
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [state.input, state.mode, encode, decode]);

    const getInputStats = () => {
        if (!state.input) return null;
        
        return {
            length: state.input.length,
            lines: state.input.split('\n').length,
            bytes: new Blob([state.input]).size
        };
    };

    const getOutputStats = () => {
        if (!state.output) return null;
        
        return {
            length: state.output.length,
            lines: state.output.split('\n').length,
            bytes: new Blob([state.output]).size
        };
    };

    return (
        <Base64ToolContainer>
            <ToolHeader>
                <ToolTitle>Base64 Encoder/Decoder</ToolTitle>
                <ToolDescription>
                    Encode and decode Base64 data with URL-safe option and character set support
                </ToolDescription>
            </ToolHeader>

            <OptionsContainer>
                <OptionGroup>
                    <OptionLabel>Mode:</OptionLabel>
                    <Select
                        value={state.mode}
                        onChange={(e) => setState(prev => ({
                            ...prev,
                            mode: e.target.value as 'encode' | 'decode',
                            output: '',
                            error: null,
                            success: null
                        }))}
                    >
                        <option value="encode">Encode</option>
                        <option value="decode">Decode</option>
                    </Select>
                </OptionGroup>

                <OptionGroup>
                    <OptionLabel>
                        <input
                            type="checkbox"
                            checked={state.urlSafe}
                            onChange={(e) => setState(prev => ({
                                ...prev,
                                urlSafe: e.target.checked,
                                output: '',
                                error: null,
                                success: null
                            }))}
                        />
                        URL Safe
                    </OptionLabel>
                </OptionGroup>

                <OptionGroup>
                    <OptionLabel>Charset:</OptionLabel>
                    <Select
                        value={state.charset}
                        onChange={(e) => setState(prev => ({
                            ...prev,
                            charset: e.target.value as 'utf-8' | 'ascii' | 'latin1'
                        }))}
                    >
                        <option value="utf-8">UTF-8</option>
                        <option value="ascii">ASCII</option>
                        <option value="latin1">Latin-1</option>
                    </Select>
                </OptionGroup>
            </OptionsContainer>

            {state.error && <ErrorMessage>{state.error}</ErrorMessage>}
            {state.success && <SuccessMessage>{state.success}</SuccessMessage>}

            <ToolContent>
                <InputSection>
                    <SectionHeader>
                        <SectionTitle>
                            {state.mode === 'encode' ? 'Input Text' : 'Input Base64'}
                        </SectionTitle>
                        <ButtonGroup>
                            <Button onClick={loadSample} variant="secondary">
                                Load Sample
                            </Button>
                            <Button onClick={clearAll} variant="secondary">
                                Clear
                            </Button>
                            {state.output && (
                                <Button onClick={swapInputOutput} variant="secondary">
                                    Swap ↔
                                </Button>
                            )}
                        </ButtonGroup>
                    </SectionHeader>
                    <TextArea
                        value={state.input}
                        onChange={(e) => setState(prev => ({
                            ...prev,
                            input: e.target.value,
                            error: null,
                            success: null
                        }))}
                        placeholder={state.mode === 'encode' 
                            ? "Enter text to encode to Base64..." 
                            : "Enter Base64 string to decode..."
                        }
                        spellCheck={false}
                    />
                    {getInputStats() && (
                        <StatsContainer>
                            <StatItem>
                                <StatLabel>Length:</StatLabel>
                                <StatValue>{getInputStats()?.length}</StatValue>
                            </StatItem>
                            <StatItem>
                                <StatLabel>Lines:</StatLabel>
                                <StatValue>{getInputStats()?.lines}</StatValue>
                            </StatItem>
                            <StatItem>
                                <StatLabel>Bytes:</StatLabel>
                                <StatValue>{getInputStats()?.bytes}</StatValue>
                            </StatItem>
                        </StatsContainer>
                    )}
                </InputSection>

                <OutputSection>
                    <SectionHeader>
                        <SectionTitle>
                            {state.mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
                        </SectionTitle>
                        <ButtonGroup>
                            <Button 
                                onClick={state.mode === 'encode' ? encode : decode} 
                                variant="primary"
                            >
                                {state.mode === 'encode' ? 'Encode' : 'Decode'}
                            </Button>
                            <Button onClick={copyToClipboard} variant="secondary" disabled={!state.output}>
                                Copy
                            </Button>
                        </ButtonGroup>
                    </SectionHeader>
                    <TextArea
                        value={state.output}
                        readOnly
                        placeholder={state.mode === 'encode' 
                            ? "Base64 encoded output will appear here..." 
                            : "Decoded text will appear here..."
                        }
                        spellCheck={false}
                    />
                    {getOutputStats() && (
                        <StatsContainer>
                            <StatItem>
                                <StatLabel>Length:</StatLabel>
                                <StatValue>{getOutputStats()?.length}</StatValue>
                            </StatItem>
                            <StatItem>
                                <StatLabel>Lines:</StatLabel>
                                <StatValue>{getOutputStats()?.lines}</StatValue>
                            </StatItem>
                            <StatItem>
                                <StatLabel>Bytes:</StatLabel>
                                <StatValue>{getOutputStats()?.bytes}</StatValue>
                            </StatItem>
                        </StatsContainer>
                    )}
                </OutputSection>
            </ToolContent>
        </Base64ToolContainer>
    );
};
