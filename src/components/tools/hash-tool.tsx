import * as React from 'react';
import { observer } from 'mobx-react';
import { styled } from '../../styles';

// Hash Generator Tool Component
const HashToolContainer = styled.div`
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
    flex-direction: column;
    flex: 1;
    gap: 20px;
    min-height: 0;
`;

const InputSection = styled.div`
    display: flex;
    flex-direction: column;
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

const ResultsSection = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

const ResultsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
    flex: 1;
`;

const HashCard = styled.div`
    padding: 16px;
    background-color: ${p => (p as any).theme.containerBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    display: flex;
    flex-direction: column;
`;

const HashHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
`;

const HashTitle = styled.h4`
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: ${p => (p as any).theme.mainColor};
`;

const HashValue = styled.div`
    padding: 8px;
    background-color: ${p => (p as any).theme.mainBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    font-family: ${p => (p as any).theme.monoFontFamily};
    font-size: 12px;
    color: ${p => (p as any).theme.mainColor};
    word-break: break-all;
    line-height: 1.4;
    cursor: pointer;
    position: relative;

    &:hover {
        background-color: ${p => (p as any).theme.highlightBackground};
    }
`;

const CopyButton = styled.button`
    padding: 4px 8px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 2px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: 10px;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;

    ${HashValue}:hover & {
        opacity: 1;
    }

    &:hover {
        background-color: ${p => (p as any).theme.popColor};
        color: white;
    }
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

interface HashResult {
    algorithm: string;
    hash: string;
    uppercase: boolean;
}

interface HashToolState {
    input: string;
    results: HashResult[];
    uppercase: boolean;
    selectedAlgorithms: Set<string>;
    success: string | null;
}

const HASH_ALGORITHMS = [
    { id: 'md5', name: 'MD5', available: false, cryptoName: 'MD5' },
    { id: 'sha1', name: 'SHA-1', available: true, cryptoName: 'SHA-1' },
    { id: 'sha256', name: 'SHA-256', available: true, cryptoName: 'SHA-256' },
    { id: 'sha384', name: 'SHA-384', available: true, cryptoName: 'SHA-384' },
    { id: 'sha512', name: 'SHA-512', available: true, cryptoName: 'SHA-512' }
];

export const HashTool: React.FC = () => {
    const [state, setState] = React.useState<HashToolState>({
        input: '',
        results: [],
        uppercase: false,
        selectedAlgorithms: new Set(['sha256', 'sha512']),
        success: null
    });

    const generateHashes = React.useCallback(async () => {
        if (!state.input) {
            setState(prev => ({
                ...prev,
                results: [],
                success: null
            }));
            return;
        }

        const results: HashResult[] = [];

        for (const algorithm of HASH_ALGORITHMS) {
            if (!state.selectedAlgorithms.has(algorithm.id) || !algorithm.available) {
                continue;
            }

            try {
                const encoder = new TextEncoder();
                const data = encoder.encode(state.input);
                const hashBuffer = await crypto.subtle.digest(algorithm.cryptoName, data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');

                results.push({
                    algorithm: algorithm.name,
                    hash: state.uppercase ? hashHex.toUpperCase() : hashHex,
                    uppercase: state.uppercase
                });
            } catch (error) {
                console.error(`Failed to generate ${algorithm.name} hash:`, error);
            }
        }

        setState(prev => ({
            ...prev,
            results,
            success: results.length > 0 ? `Generated ${results.length} hash${results.length > 1 ? 'es' : ''}` : null
        }));
    }, [state.input, state.uppercase, state.selectedAlgorithms]);

    const copyToClipboard = React.useCallback(async (hash: string) => {
        try {
            await navigator.clipboard.writeText(hash);
            setState(prev => ({
                ...prev,
                success: 'Hash copied to clipboard!'
            }));
            
            setTimeout(() => {
                setState(prev => ({ ...prev, success: null }));
            }, 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    }, []);

    const clearAll = React.useCallback(() => {
        setState(prev => ({
            ...prev,
            input: '',
            results: [],
            success: null
        }));
    }, []);

    const loadSample = React.useCallback(() => {
        setState(prev => ({
            ...prev,
            input: 'Hello, World! This is a test string for hash generation.',
            success: 'Sample text loaded!'
        }));
    }, []);

    const toggleAlgorithm = React.useCallback((algorithmId: string) => {
        setState(prev => {
            const newSelected = new Set(prev.selectedAlgorithms);
            if (newSelected.has(algorithmId)) {
                newSelected.delete(algorithmId);
            } else {
                newSelected.add(algorithmId);
            }
            return {
                ...prev,
                selectedAlgorithms: newSelected
            };
        });
    }, []);

    const selectAllAlgorithms = React.useCallback(() => {
        const availableAlgorithms = HASH_ALGORITHMS
            .filter(alg => alg.available)
            .map(alg => alg.id);
        setState(prev => ({
            ...prev,
            selectedAlgorithms: new Set(availableAlgorithms)
        }));
    }, []);

    const clearAllAlgorithms = React.useCallback(() => {
        setState(prev => ({
            ...prev,
            selectedAlgorithms: new Set()
        }));
    }, []);

    // Auto-generate hashes on input change
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (state.input && state.selectedAlgorithms.size > 0) {
                generateHashes();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [state.input, state.selectedAlgorithms, generateHashes]);

    const getInputStats = () => {
        if (!state.input) return null;
        
        return {
            length: state.input.length,
            lines: state.input.split('\n').length,
            bytes: new Blob([state.input]).size
        };
    };

    return (
        <HashToolContainer>
            <ToolHeader>
                <ToolTitle>Hash Generator</ToolTitle>
                <ToolDescription>
                    Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes for your text
                </ToolDescription>
            </ToolHeader>

            <OptionsContainer>
                <OptionGroup>
                    <OptionLabel>Algorithms:</OptionLabel>
                    {HASH_ALGORITHMS.map(algorithm => (
                        <OptionLabel key={algorithm.id}>
                            <input
                                type="checkbox"
                                checked={state.selectedAlgorithms.has(algorithm.id)}
                                onChange={() => toggleAlgorithm(algorithm.id)}
                                disabled={!algorithm.available}
                            />
                            {algorithm.name}
                            {!algorithm.available && ' (unavailable)'}
                        </OptionLabel>
                    ))}
                    <Button onClick={selectAllAlgorithms} variant="secondary">
                        Select All
                    </Button>
                    <Button onClick={clearAllAlgorithms} variant="secondary">
                        Clear All
                    </Button>
                </OptionGroup>

                <OptionGroup>
                    <OptionLabel>
                        <input
                            type="checkbox"
                            checked={state.uppercase}
                            onChange={(e) => setState(prev => ({
                                ...prev,
                                uppercase: e.target.checked
                            }))}
                        />
                        Uppercase
                    </OptionLabel>
                </OptionGroup>
            </OptionsContainer>

            {state.success && <SuccessMessage>{state.success}</SuccessMessage>}

            <ToolContent>
                <InputSection>
                    <SectionHeader>
                        <SectionTitle>Input Text</SectionTitle>
                        <ButtonGroup>
                            <Button onClick={loadSample} variant="secondary">
                                Load Sample
                            </Button>
                            <Button onClick={clearAll} variant="secondary">
                                Clear
                            </Button>
                        </ButtonGroup>
                    </SectionHeader>
                    <TextArea
                        value={state.input}
                        onChange={(e) => setState(prev => ({
                            ...prev,
                            input: e.target.value,
                            success: null
                        }))}
                        placeholder="Enter text to generate hashes..."
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

                <ResultsSection>
                    <SectionHeader>
                        <SectionTitle>Generated Hashes</SectionTitle>
                        <Button onClick={generateHashes} variant="primary" disabled={!state.input || state.selectedAlgorithms.size === 0}>
                            Generate Hashes
                        </Button>
                    </SectionHeader>
                    
                    <ResultsGrid>
                        {state.results.map((result, index) => (
                            <HashCard key={`${result.algorithm}-${index}`}>
                                <HashHeader>
                                    <HashTitle>{result.algorithm}</HashTitle>
                                    <CopyButton onClick={() => copyToClipboard(result.hash)}>
                                        Copy
                                    </CopyButton>
                                </HashHeader>
                                <HashValue onClick={() => copyToClipboard(result.hash)}>
                                    {result.hash}
                                </HashValue>
                            </HashCard>
                        ))}
                        
                        {state.results.length === 0 && (
                            <div style={{
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                padding: '40px',
                                color: '#999'
                            }}>
                                Enter text to generate hashes
                            </div>
                        )}
                    </ResultsGrid>
                </ResultsSection>
            </ToolContent>
        </HashToolContainer>
    );
};
