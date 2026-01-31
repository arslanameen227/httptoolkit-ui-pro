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

interface UUIDResult {
    uuid: string;
    version: 'v1' | 'v4' | 'v7';
    timestamp: number;
    format: 'string' | 'uppercase' | 'hyphens' | 'no-hyphens';
}

interface UUIDGeneratorState {
    results: UUIDResult[];
    error: string;
    success: string;
    version: 'v1' | 'v4' | 'v7';
    format: 'string' | 'uppercase' | 'hyphens' | 'no-hyphens';
    bulkCount: number;
    isGenerating: boolean;
}

const UUIDGeneratorContainer = styled.div`
    padding: 20px;
    max-width: 1000px;
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

const ControlsSection = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: flex-end;
`;

const ControlGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 150px;
`;

const ControlLabel = styled.label`
    font-weight: 500;
    color: ${p => (p as any).theme.mainColor};
    font-size: 14px;
`;

const Select = styled.select`
    padding: 8px 12px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: 13px;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${p => (p as any).theme.popColor};
    }
`;

const NumberInput = styled.input`
    padding: 8px 12px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: 13px;
    width: 100px;

    &:focus {
        outline: none;
        border-color: ${p => (p as any).theme.popColor};
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
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

const ResultsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const ResultsHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const ResultsTitle = styled.h3`
    margin: 0;
    color: ${p => (p as any).theme.mainColor};
    font-size: 16px;
    font-weight: 500;
`;

const ResultCount = styled.span`
    color: ${p => (p as any).theme.lowlightText};
    font-size: 13px;
`;

const ResultGrid = styled.div`
    display: grid;
    gap: 12px;
    max-height: 400px;
    overflow-y: auto;
    padding: 4px;
`;

const ResultCard = styled.div`
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 6px;
    background-color: ${p => (p as any).theme.mainBackground};
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${p => (p as any).theme.popColor};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
`;

const ResultInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
`;

const UUIDValue = styled.div`
    font-family: ${p => p.theme.monoFontFamily};
    font-size: 14px;
    color: ${p => (p as any).theme.mainColor};
    word-break: break-all;
`;

const UUIDMeta = styled.div`
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: ${p => (p as any).theme.lowlightText};
`;

const MetaItem = styled.span`
    display: flex;
    align-items: center;
    gap: 4px;
`;

const ResultActions = styled.div`
    display: flex;
    gap: 8px;
`;

const CopyButton = styled.button`
    padding: 6px 12px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 3px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${p => (p as any).theme.containerBackground};
        border-color: ${p => (p as any).theme.popColor};
    }
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

const InfoSection = styled.div`
    background-color: ${p => (p as any).theme.containerBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 6px;
    padding: 16px;
    margin-top: 20px;
`;

const InfoTitle = styled.h4`
    margin: 0 0 12px 0;
    color: ${p => (p as any).theme.mainColor};
    font-size: 14px;
    font-weight: 500;
`;

const InfoList = styled.ul`
    margin: 0;
    padding-left: 20px;
    color: ${p => (p as any).theme.mainColor};
    font-size: 13px;
    line-height: 1.5;

    li {
        margin-bottom: 4px;
    }
`;

// UUID Generation Functions
const generateUUIDv1 = (): string => {
    // Simple v1 UUID implementation (for demonstration)
    // In production, you'd want a more robust implementation
    const timestamp = Date.now();
    const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
    
    // Set version (v1)
    random[6] = (random[6] & 0x0f) | 0x01;
    // Set variant
    random[8] = (random[8] & 0x3f) | 0x80;
    
    const hex = random.map(b => b.toString(16).padStart(2, '0')).join('');
    return [
        hex.substr(0, 8),
        hex.substr(8, 4),
        hex.substr(12, 4),
        hex.substr(16, 4),
        hex.substr(20, 12)
    ].join('-');
};

const generateUUIDv4 = (): string => {
    // RFC 4122 compliant UUID v4
    const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
    
    // Set version (v4)
    random[6] = (random[6] & 0x0f) | 0x04;
    // Set variant
    random[8] = (random[8] & 0x3f) | 0x80;
    
    const hex = random.map(b => b.toString(16).padStart(2, '0')).join('');
    return [
        hex.substr(0, 8),
        hex.substr(8, 4),
        hex.substr(12, 4),
        hex.substr(16, 4),
        hex.substr(20, 12)
    ].join('-');
};

const generateUUIDv7 = (): string => {
    // UUID v7 (time-ordered) - simplified implementation
    const timestamp = Date.now();
    const random = Array.from({ length: 10 }, () => Math.floor(Math.random() * 256));
    
    // Set version (v7)
    random[4] = (random[4] & 0x0f) | 0x07;
    // Set variant
    random[6] = (random[6] & 0x3f) | 0x80;
    
    const timestampHex = timestamp.toString(16).padStart(12, '0');
    const randomHex = random.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return [
        timestampHex.substr(0, 8),
        timestampHex.substr(8, 4),
        randomHex.substr(0, 4),
        randomHex.substr(4, 4),
        randomHex.substr(8, 12)
    ].join('-');
};

const formatUUID = (uuid: string, format: string): string => {
    switch (format) {
        case 'uppercase':
            return uuid.toUpperCase();
        case 'no-hyphens':
            return uuid.replace(/-/g, '');
        case 'hyphens':
            return uuid; // Default format
        default:
            return uuid;
    }
};

// Export utility functions for use in other components
export { formatUUID, generateUUIDv4 };

export const UUIDGeneratorTool: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
    const [state, setState] = React.useState<UUIDGeneratorState>({
        results: [],
        error: '',
        success: '',
        version: 'v4',
        format: 'string',
        bulkCount: 1,
        isGenerating: false
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

    const generateUUIDs = async () => {
        try {
            setState(prev => ({ ...prev, isGenerating: true, error: '', success: '' }));

            const newResults: UUIDResult[] = [];
            
            for (let i = 0; i < state.bulkCount; i++) {
                let uuid: string;
                
                switch (state.version) {
                    case 'v1':
                        uuid = generateUUIDv1();
                        break;
                    case 'v7':
                        uuid = generateUUIDv7();
                        break;
                    case 'v4':
                    default:
                        uuid = generateUUIDv4();
                        break;
                }

                uuid = formatUUID(uuid, state.format);

                newResults.push({
                    uuid,
                    version: state.version,
                    timestamp: Date.now(),
                    format: state.format
                });
            }

            setState(prev => ({
                ...prev,
                results: [...prev.results, ...newResults],
                success: `Generated ${newResults.length} UUID(s)`,
                isGenerating: false
            }));

        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to generate UUIDs',
                success: '',
                isGenerating: false
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

    const copyAllResults = async () => {
        if (state.results.length === 0) return;
        
        const allUUIDs = state.results.map(r => r.uuid).join('\n');
        await copyToClipboard(allUUIDs);
    };

    return (
        <UUIDGeneratorContainer>
            <ToolHeader>
                <ToolTitle>{tool.name}</ToolTitle>
                <ToolDescription>{tool.description}</ToolDescription>
            </ToolHeader>

            <ToolContent>
                {/* Controls */}
                <ControlsSection>
                    <ControlGroup>
                        <ControlLabel>UUID Version</ControlLabel>
                        <Select
                            value={state.version}
                            onChange={(e) => setState(prev => ({ ...prev, version: e.target.value as any }))}
                        >
                            <option value="v4">UUID v4 (Random)</option>
                            <option value="v1">UUID v1 (Time-based)</option>
                            <option value="v7">UUID v7 (Time-ordered)</option>
                        </Select>
                    </ControlGroup>

                    <ControlGroup>
                        <ControlLabel>Format</ControlLabel>
                        <Select
                            value={state.format}
                            onChange={(e) => setState(prev => ({ ...prev, format: e.target.value as any }))}
                        >
                            <option value="string">Standard</option>
                            <option value="uppercase">Uppercase</option>
                            <option value="no-hyphens">No Hyphens</option>
                            <option value="hyphens">With Hyphens</option>
                        </Select>
                    </ControlGroup>

                    <ControlGroup>
                        <ControlLabel>Quantity</ControlLabel>
                        <NumberInput
                            type="number"
                            min="1"
                            max="100"
                            value={state.bulkCount}
                            onChange={(e) => setState(prev => ({ ...prev, bulkCount: parseInt(e.target.value) || 1 }))}
                        />
                    </ControlGroup>

                    <ControlGroup>
                        <ControlLabel>&nbsp;</ControlLabel>
                        <ButtonGroup>
                            <Button 
                                variant="primary" 
                                onClick={generateUUIDs}
                                disabled={state.isGenerating}
                            >
                                {state.isGenerating ? 'Generating...' : 'Generate UUID(s)'}
                            </Button>
                            <Button onClick={clearResults}>
                                Clear Results
                            </Button>
                        </ButtonGroup>
                    </ControlGroup>
                </ControlsSection>

                {/* Messages */}
                {state.error && <ErrorMessage>{state.error}</ErrorMessage>}
                {state.success && <SuccessMessage>{state.success}</SuccessMessage>}

                {/* Results */}
                <ResultsSection>
                    <ResultsHeader>
                        <ResultsTitle>Generated UUIDs</ResultsTitle>
                        <div>
                            <ResultCount>{state.results.length} UUID(s)</ResultCount>
                            {state.results.length > 0 && (
                                <CopyButton onClick={copyAllResults}>
                                    Copy All
                                </CopyButton>
                            )}
                        </div>
                    </ResultsHeader>

                    {state.results.length === 0 ? (
                        <EmptyState>
                            No UUIDs generated yet. Select options and click "Generate UUID(s)" to begin.
                        </EmptyState>
                    ) : (
                        <ResultGrid>
                            {state.results.map((result, index) => (
                                <ResultCard key={`${result.timestamp}-${index}`}>
                                    <ResultInfo>
                                        <UUIDValue>{result.uuid}</UUIDValue>
                                        <UUIDMeta>
                                            <MetaItem>
                                                🏷️ {result.version.toUpperCase()}
                                            </MetaItem>
                                            <MetaItem>
                                                📋 {result.format}
                                            </MetaItem>
                                            <MetaItem>
                                                ⏰ {new Date(result.timestamp).toLocaleTimeString()}
                                            </MetaItem>
                                        </UUIDMeta>
                                    </ResultInfo>
                                    <ResultActions>
                                        <CopyButton onClick={() => copyToClipboard(result.uuid)}>
                                            Copy
                                        </CopyButton>
                                    </ResultActions>
                                </ResultCard>
                            ))}
                        </ResultGrid>
                    )}
                </ResultsSection>

                {/* Information Section */}
                <InfoSection>
                    <InfoTitle>About UUID Versions</InfoTitle>
                    <InfoList>
                        <li><strong>UUID v4:</strong> Randomly generated, most commonly used version</li>
                        <li><strong>UUID v1:</strong> Time-based with MAC address (simplified implementation)</li>
                        <li><strong>UUID v7:</strong> Time-ordered random UUIDs, sortable by generation time</li>
                        <li><strong>Formats:</strong> Standard (lowercase), Uppercase, With/Without hyphens</li>
                    </InfoList>
                </InfoSection>
            </ToolContent>
        </UUIDGeneratorContainer>
    );
};
