import * as React from 'react';
import { observer } from 'mobx-react';
import { styled } from '../../styles';

export interface ToolDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
}

interface URLEncodingResult {
    type: 'url' | 'query' | 'path' | 'fragment';
    input: string;
    encoded: string;
    decoded?: string;
    timestamp: number;
}

interface URLEncoderDecoderState {
    input: string;
    results: URLEncodingResult[];
    error: string;
    success: string;
    encodingType: 'full' | 'query' | 'path' | 'fragment' | 'custom';
    customComponent: string;
    batchMode: boolean;
    batchInput: string;
}

const URLEncoderDecoderContainer = styled.div`
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
`;

const ToolHeader = styled.div`
    margin-bottom: 24px;
`;

const ToolTitle = styled.h2`
    margin: 0 0 8px 0;
    color: ${p => (p as any).theme.mainColor};
    font-size: 24px;
    font-weight: 600;
`;

const ToolDescription = styled.p`
    margin: 0 0 16px 0;
    color: ${p => (p as any).theme.lowlightText};
    font-size: 14px;
    line-height: 1.5;
`;

const ToolContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
`;

const SectionTitle = styled.h3`
    margin: 0;
    color: ${p => (p as any).theme.mainColor};
    font-size: 16px;
    font-weight: 500;
`;

const EncodingTypeSelector = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
`;

const TypeButton = styled.button<{ active?: boolean }>`
    padding: 6px 12px;
    border: 1px solid ${p => p.active ? (p as any).theme.popColor : (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => p.active ? (p as any).theme.popColor : (p as any).theme.mainBackground};
    color: ${p => p.active ? 'white' : (p as any).theme.mainColor};
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        opacity: 0.8;
    }
`;

const InputSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const InputLabel = styled.label`
    font-weight: 500;
    color: ${p => (p as any).theme.mainColor};
    font-size: 14px;
`;

const InputTextArea = styled.textarea`
    width: 100%;
    min-height: 120px;
    padding: 12px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-family: ${p => p.theme.monoFontFamily};
    font-size: 13px;
    resize: vertical;

    &:focus {
        outline: none;
        border-color: ${p => (p as any).theme.popColor};
    }
`;

const CustomComponentSection = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const CustomComponentInput = styled.input`
    flex: 1;
    padding: 8px 12px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: 13px;

    &:focus {
        outline: none;
        border-color: ${p => (p as any).theme.popColor};
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 8px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
    padding: 8px 16px;
    border: 1px solid ${p => (p as any).variant === 'primary' ? (p as any).theme.popColor : (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).variant === 'primary' ? (p as any).theme.popColor : (p as any).theme.mainBackground};
    color: ${p => (p as any).variant === 'primary' ? 'white' : (p as any).theme.mainColor};
    font-size: 13px;
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

const BatchModeToggle = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: ${p => (p as any).theme.mainColor};
`;

const Checkbox = styled.input`
    cursor: pointer;
`;

const ResultsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const ResultCard = styled.div`
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 6px;
    background-color: ${p => (p as any).theme.mainBackground};
    overflow: hidden;
`;

const ResultHeader = styled.div`
    padding: 12px 16px;
    background-color: ${p => (p as any).theme.containerBackground};
    border-bottom: 1px solid ${p => (p as any).theme.containerBorder};
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const ResultType = styled.span`
    font-weight: 500;
    color: ${p => (p as any).theme.mainColor};
    font-size: 13px;
`;

const ResultActions = styled.div`
    display: flex;
    gap: 8px;
`;

const CopyButton = styled.button`
    padding: 4px 8px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 3px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: 11px;
    cursor: pointer;

    &:hover {
        background-color: ${p => (p as any).theme.containerBackground};
    }
`;

const ResultContent = styled.div`
    padding: 16px;
`;

const ResultRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;

    &:last-child {
        margin-bottom: 0;
    }
`;

const ResultLabel = styled.div`
    font-weight: 500;
    color: ${p => (p as any).theme.mainColor};
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const ResultValue = styled.div`
    padding: 8px 12px;
    background-color: ${p => (p as any).theme.containerBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    color: ${p => (p as any).theme.mainColor};
    font-family: ${p => p.theme.monoFontFamily};
    font-size: 12px;
    word-break: break-all;
    white-space: pre-wrap;
`;

const ErrorMessage = styled.div`
    padding: 12px;
    background-color: #fee;
    border: 1px solid #fcc;
    border-radius: 4px;
    color: #c33;
    font-size: 13px;
`;

const SuccessMessage = styled.div`
    padding: 12px;
    background-color: #efe;
    border: 1px solid #cfc;
    border-radius: 4px;
    color: #3c3;
    font-size: 13px;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 40px;
    color: #999;
    font-style: italic;
`;

export const URLEncoderDecoderTool: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
    const [state, setState] = React.useState<URLEncoderDecoderState>({
        input: '',
        results: [],
        error: '',
        success: '',
        encodingType: 'full',
        customComponent: '',
        batchMode: false,
        batchInput: ''
    });

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setState(prev => ({ ...prev, success: 'Copied to clipboard!', error: '' }));
            setTimeout(() => setState(prev => ({ ...prev, success: '' })), 3000);
        } catch (err) {
            setState(prev => ({ ...prev, error: 'Failed to copy to clipboard', success: '' }));
        }
    };

    const encodeURL = (input: string, type: string): string => {
        try {
            switch (type) {
                case 'full':
                    return encodeURIComponent(input);
                case 'query':
                    return encodeURIComponent(input).replace(/%20/g, '+');
                case 'path':
                    return encodeURI(input);
                case 'fragment':
                    return encodeURIComponent(input).replace(/['()]/g, escape);
                case 'custom':
                    // Custom component encoding
                    return input.split('/').map(part => 
                        part ? encodeURIComponent(part) : part
                    ).join('/');
                default:
                    return encodeURIComponent(input);
            }
        } catch (error) {
            throw new Error(`Encoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const decodeURL = (input: string, type: string): string => {
        try {
            switch (type) {
                case 'full':
                case 'custom':
                    return decodeURIComponent(input);
                case 'query':
                    return decodeURIComponent(input.replace(/\+/g, '%20'));
                case 'path':
                    return decodeURI(input);
                case 'fragment':
                    return decodeURIComponent(input);
                default:
                    return decodeURIComponent(input);
            }
        } catch (error) {
            throw new Error(`Decoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const processURL = () => {
        try {
            setState(prev => ({ ...prev, error: '', success: '' }));

            const inputs = state.batchMode ? 
                state.batchInput.split('\n').filter(line => line.trim()) : 
                [state.input];

            if (inputs.length === 0) {
                setState(prev => ({ ...prev, error: 'Please enter at least one URL to process' }));
                return;
            }

            const newResults: URLEncodingResult[] = [];

            inputs.forEach(input => {
                const trimmedInput = input.trim();
                if (!trimmedInput) return;

                const encoded = encodeURL(trimmedInput, state.encodingType);
                const decoded = decodeURL(encoded, state.encodingType);

                newResults.push({
                    type: state.encodingType as URLEncodingResult['type'],
                    input: trimmedInput,
                    encoded,
                    decoded,
                    timestamp: Date.now()
                });
            });

            setState(prev => ({
                ...prev,
                results: [...prev.results, ...newResults],
                success: `Successfully processed ${newResults.length} URL(s)`
            }));

        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'An unknown error occurred',
                success: ''
            }));
        }
    };

    const clearResults = () => {
        setState(prev => ({
            ...prev,
            results: [],
            error: '',
            success: ''
        }));
    };

    const clearAll = () => {
        setState({
            input: '',
            results: [],
            error: '',
            success: '',
            encodingType: 'full',
            customComponent: '',
            batchMode: false,
            batchInput: ''
        });
    };

    return (
        <URLEncoderDecoderContainer>
            <ToolHeader>
                <ToolTitle>{tool.name}</ToolTitle>
                <ToolDescription>{tool.description}</ToolDescription>
            </ToolHeader>

            <ToolContent>
                {/* Encoding Type Selection */}
                <SectionHeader>
                    <SectionTitle>Encoding Type</SectionTitle>
                </SectionHeader>
                <EncodingTypeSelector>
                    <TypeButton 
                        active={state.encodingType === 'full'}
                        onClick={() => setState(prev => ({ ...prev, encodingType: 'full' }))}
                    >
                        Full URL
                    </TypeButton>
                    <TypeButton 
                        active={state.encodingType === 'query'}
                        onClick={() => setState(prev => ({ ...prev, encodingType: 'query' }))}
                    >
                        Query String
                    </TypeButton>
                    <TypeButton 
                        active={state.encodingType === 'path'}
                        onClick={() => setState(prev => ({ ...prev, encodingType: 'path' }))}
                    >
                        Path Only
                    </TypeButton>
                    <TypeButton 
                        active={state.encodingType === 'fragment'}
                        onClick={() => setState(prev => ({ ...prev, encodingType: 'fragment' }))}
                    >
                        Fragment
                    </TypeButton>
                    <TypeButton 
                        active={state.encodingType === 'custom'}
                        onClick={() => setState(prev => ({ ...prev, encodingType: 'custom' }))}
                    >
                        Custom
                    </TypeButton>
                </EncodingTypeSelector>

                {/* Input Section */}
                <InputSection>
                    <InputLabel>
                        {state.batchMode ? 'Batch Input (one URL per line)' : 'URL Input'}
                    </InputLabel>
                    {state.batchMode ? (
                        <InputTextArea
                            value={state.batchInput}
                            onChange={(e) => setState(prev => ({ ...prev, batchInput: e.target.value }))}
                            placeholder="Enter multiple URLs, one per line..."
                        />
                    ) : (
                        <InputTextArea
                            value={state.input}
                            onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
                            placeholder="Enter URL to encode/decode..."
                        />
                    )}
                </InputSection>

                {/* Batch Mode Toggle */}
                <BatchModeToggle>
                    <Checkbox
                        type="checkbox"
                        checked={state.batchMode}
                        onChange={(e) => setState(prev => ({ ...prev, batchMode: e.target.checked }))}
                    />
                    Batch Processing Mode
                </BatchModeToggle>

                {/* Action Buttons */}
                <ButtonGroup>
                    <Button 
                        variant="primary" 
                        onClick={processURL}
                        disabled={!state.input && !state.batchInput}
                    >
                        {state.batchMode ? 'Process All URLs' : 'Encode/Decode URL'}
                    </Button>
                    <Button onClick={clearResults}>
                        Clear Results
                    </Button>
                    <Button onClick={clearAll}>
                        Clear All
                    </Button>
                </ButtonGroup>

                {/* Messages */}
                {state.error && <ErrorMessage>{state.error}</ErrorMessage>}
                {state.success && <SuccessMessage>{state.success}</SuccessMessage>}

                {/* Results */}
                <ResultsSection>
                    <SectionHeader>
                        <SectionTitle>Results ({state.results.length})</SectionTitle>
                    </SectionHeader>
                    {state.results.length === 0 ? (
                        <EmptyState>
                            No results yet. Enter a URL and click "Encode/Decode URL" to see results.
                        </EmptyState>
                    ) : (
                        state.results.map((result, index) => (
                            <ResultCard key={`${result.timestamp}-${index}`}>
                                <ResultHeader>
                                    <ResultType>
                                        {result.type.charAt(0).toUpperCase() + result.type.slice(1)} Encoding
                                    </ResultType>
                                    <ResultActions>
                                        <CopyButton onClick={() => copyToClipboard(result.encoded)}>
                                            Copy Encoded
                                        </CopyButton>
                                        <CopyButton onClick={() => copyToClipboard(result.decoded || result.input)}>
                                            Copy Decoded
                                        </CopyButton>
                                    </ResultActions>
                                </ResultHeader>
                                <ResultContent>
                                    <ResultRow>
                                        <ResultLabel>Original</ResultLabel>
                                        <ResultValue>{result.input}</ResultValue>
                                    </ResultRow>
                                    <ResultRow>
                                        <ResultLabel>Encoded</ResultLabel>
                                        <ResultValue>{result.encoded}</ResultValue>
                                    </ResultRow>
                                    {result.decoded && result.decoded !== result.input && (
                                        <ResultRow>
                                            <ResultLabel>Decoded</ResultLabel>
                                            <ResultValue>{result.decoded}</ResultValue>
                                        </ResultRow>
                                    )}
                                </ResultContent>
                            </ResultCard>
                        ))
                    )}
                </ResultsSection>
            </ToolContent>
        </URLEncoderDecoderContainer>
    );
};
