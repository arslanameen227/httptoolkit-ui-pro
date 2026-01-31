import * as React from 'react';
import { observer } from 'mobx-react';
import { styled } from '../../styles';

// Timestamp Converter Tool Component
const TimestampToolContainer = styled.div`
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

const InputSection = styled.div`
    display: flex;
    flex-direction: column;
`;

const Input = styled.input`
    padding: 12px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-family: ${p => (p as any).theme.monoFontFamily};
    font-size: 14px;

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

const TimestampCard = styled.div`
    padding: 16px;
    background-color: ${p => (p as any).theme.containerBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    display: flex;
    flex-direction: column;
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
`;

const CardTitle = styled.h4`
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: ${p => (p as any).theme.mainColor};
`;

const CardContent = styled.div`
    background-color: ${p => (p as any).theme.mainBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    padding: 12px;
    font-family: ${p => (p as any).theme.monoFontFamily};
    font-size: 13px;
    color: ${p => (p as any).theme.mainColor};
    word-break: break-all;
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

    ${CardContent}:hover & {
        opacity: 1;
    }

    &:hover {
        background-color: ${p => (p as any).theme.popColor};
        color: white;
    }
`;

const ErrorMessage = styled.div`
    padding: 12px;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 4px;
    color: #dc2626;
    font-size: 13px;
    margin-bottom: 16px;
`;

const SuccessMessage = styled.div`
    padding: 12px;
    background-color: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 4px;
    color: #16a34a;
    font-size: 13px;
    margin-bottom: 16px;
`;

const CurrentTimeSection = styled.div`
    padding: 16px;
    background-color: ${p => (p as any).theme.containerBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    margin-bottom: 16px;
`;

const CurrentTimeTitle = styled.h4`
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: ${p => (p as any).theme.mainColor};
`;

const CurrentTimeGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
`;

const CurrentTimeItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    background-color: ${p => (p as any).theme.mainBackground};
    border-radius: 4px;
`;

const CurrentTimeLabel = styled.span`
    font-size: 12px;
    color: ${p => (p as any).theme.lowlightText};
`;

const CurrentTimeValue = styled.span`
    font-size: 12px;
    font-weight: 600;
    color: ${p => (p as any).theme.mainColor};
    font-family: ${p => (p as any).theme.monoFontFamily};
`;

interface TimestampConversion {
    format: string;
    value: string;
    label: string;
}

interface TimestampToolState {
    input: string;
    conversions: TimestampConversion[];
    error: string | null;
    success: string | null;
    currentTime: Date;
}

export const TimestampTool: React.FC = () => {
    const [state, setState] = React.useState<TimestampToolState>({
        input: '',
        conversions: [],
        error: null,
        success: null,
        currentTime: new Date()
    });

    // Update current time every second
    React.useEffect(() => {
        const interval = setInterval(() => {
            setState(prev => ({
                ...prev,
                currentTime: new Date()
            }));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const convertTimestamp = React.useCallback(() => {
        if (!state.input.trim()) {
            setState(prev => ({
                ...prev,
                conversions: [],
                error: null,
                success: null
            }));
            return;
        }

        try {
            const conversions: TimestampConversion[] = [];
            const input = state.input.trim();

            // Try to parse as Unix timestamp (seconds)
            let timestamp: number;
            if (/^\d+$/.test(input)) {
                timestamp = parseInt(input);
                
                // Check if it's in milliseconds (13 digits) or seconds (10 digits)
                if (input.length === 13) {
                    // Milliseconds
                    timestamp = timestamp / 1000;
                } else if (input.length === 10) {
                    // Seconds - already correct
                } else {
                    // Could be either, try both
                    const dateFromSeconds = new Date(timestamp * 1000);
                    const dateFromMillis = new Date(timestamp);
                    
                    if (dateFromSeconds.getFullYear() > 1970 && dateFromSeconds.getFullYear() < 2100) {
                        timestamp = timestamp;
                    } else if (dateFromMillis.getFullYear() > 1970 && dateFromMillis.getFullYear() < 2100) {
                        timestamp = timestamp / 1000;
                    }
                }
            } else {
                // Try to parse as date string
                timestamp = new Date(input).getTime() / 1000;
                
                if (isNaN(timestamp)) {
                    throw new Error('Could not parse input as timestamp or date');
                }
            }

            const date = new Date(timestamp * 1000);

            // Generate conversions
            conversions.push({
                format: 'Unix Timestamp (seconds)',
                value: Math.floor(timestamp).toString(),
                label: 'Unix Timestamp'
            });

            conversions.push({
                format: 'Unix Timestamp (milliseconds)',
                value: (timestamp * 1000).toString(),
                label: 'Unix Timestamp (ms)'
            });

            conversions.push({
                format: 'ISO 8601',
                value: date.toISOString(),
                label: 'ISO 8601'
            });

            conversions.push({
                format: 'Local Date String',
                value: date.toLocaleString(),
                label: 'Local Time'
            });

            conversions.push({
                format: 'UTC Date String',
                value: date.toUTCString(),
                label: 'UTC Time'
            });

            conversions.push({
                format: 'RFC 2822',
                value: date.toDateString(),
                label: 'RFC 2822'
            });

            // Additional formats
            conversions.push({
                format: 'YYYY-MM-DD HH:mm:ss',
                value: date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ''),
                label: 'Custom Format'
            });

            conversions.push({
                format: 'Date Only',
                value: date.toLocaleDateString(),
                label: 'Date Only'
            });

            conversions.push({
                format: 'Time Only',
                value: date.toLocaleTimeString(),
                label: 'Time Only'
            });

            conversions.push({
                format: 'Day of Week',
                value: date.toLocaleDateString(undefined, { weekday: 'long' }),
                label: 'Day of Week'
            });

            setState(prev => ({
                ...prev,
                conversions,
                error: null,
                success: 'Timestamp converted successfully!'
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                conversions: [],
                error: `Failed to convert timestamp: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: null
            }));
        }
    }, [state.input]);

    const copyToClipboard = React.useCallback(async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setState(prev => ({
                ...prev,
                success: 'Copied to clipboard!'
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
    }, []);

    const clearAll = React.useCallback(() => {
        setState(prev => ({
            ...prev,
            input: '',
            conversions: [],
            error: null,
            success: null
        }));
    }, []);

    const setCurrentTime = React.useCallback(() => {
        const now = Date.now();
        setState(prev => ({
            ...prev,
            input: Math.floor(now / 1000).toString(),
            success: 'Set to current timestamp!'
        }));
    }, []);

    const setCurrentTimeMillis = React.useCallback(() => {
        const now = Date.now();
        setState(prev => ({
            ...prev,
            input: now.toString(),
            success: 'Set to current timestamp (milliseconds)!'
        }));
    }, []);

    // Auto-convert on input change
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (state.input) {
                convertTimestamp();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [state.input, convertTimestamp]);

    const getCurrentTimeFormats = () => {
        const now = state.currentTime;
        const timestamp = Math.floor(now.getTime() / 1000);
        const timestampMillis = now.getTime();

        return [
            {
                label: 'Unix (seconds)',
                value: timestamp.toString()
            },
            {
                label: 'Unix (milliseconds)',
                value: timestampMillis.toString()
            },
            {
                label: 'ISO 8601',
                value: now.toISOString()
            },
            {
                label: 'Local Time',
                value: now.toLocaleString()
            }
        ];
    };

    return (
        <TimestampToolContainer>
            <ToolHeader>
                <ToolTitle>Timestamp Converter</ToolTitle>
                <ToolDescription>
                    Convert between different timestamp formats: Unix, ISO 8601, RFC 2822, and more
                </ToolDescription>
            </ToolHeader>

            <CurrentTimeSection>
                <CurrentTimeTitle>Current Time</CurrentTimeTitle>
                <CurrentTimeGrid>
                    {getCurrentTimeFormats().map(format => (
                        <CurrentTimeItem key={format.label}>
                            <CurrentTimeLabel>{format.label}:</CurrentTimeLabel>
                            <CurrentTimeValue>{format.value}</CurrentTimeValue>
                        </CurrentTimeItem>
                    ))}
                </CurrentTimeGrid>
            </CurrentTimeSection>

            {state.error && <ErrorMessage>{state.error}</ErrorMessage>}
            {state.success && <SuccessMessage>{state.success}</SuccessMessage>}

            <ToolContent>
                <InputSection>
                    <SectionHeader>
                        <SectionTitle>Timestamp Input</SectionTitle>
                        <ButtonGroup>
                            <Button onClick={setCurrentTime} variant="secondary">
                                Set Current (s)
                            </Button>
                            <Button onClick={setCurrentTimeMillis} variant="secondary">
                                Set Current (ms)
                            </Button>
                            <Button onClick={clearAll} variant="secondary">
                                Clear
                            </Button>
                        </ButtonGroup>
                    </SectionHeader>
                    <Input
                        type="text"
                        value={state.input}
                        onChange={(e) => setState(prev => ({
                            ...prev,
                            input: e.target.value,
                            error: null,
                            success: null
                        }))}
                        placeholder="Enter Unix timestamp, ISO date, or any date string..."
                    />
                </InputSection>

                <ResultsSection>
                    <SectionHeader>
                        <SectionTitle>Converted Formats</SectionTitle>
                        <Button onClick={convertTimestamp} variant="primary" disabled={!state.input}>
                            Convert
                        </Button>
                    </SectionHeader>
                    
                    <ResultsGrid>
                        {state.conversions.map((conversion, index) => (
                            <TimestampCard key={`${conversion.format}-${index}`}>
                                <CardHeader>
                                    <CardTitle>{conversion.label}</CardTitle>
                                    <CopyButton onClick={() => copyToClipboard(conversion.value)}>
                                        Copy
                                    </CopyButton>
                                </CardHeader>
                                <CardContent onClick={() => copyToClipboard(conversion.value)}>
                                    {conversion.value}
                                </CardContent>
                            </TimestampCard>
                        ))}
                        
                        {state.conversions.length === 0 && (
                            <div style={{
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                padding: '40px',
                                color: '#999'
                            }}>
                                Enter a timestamp to see conversions
                            </div>
                        )}
                    </ResultsGrid>
                </ResultsSection>
            </ToolContent>
        </TimestampToolContainer>
    );
};
