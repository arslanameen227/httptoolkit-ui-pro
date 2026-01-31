import * as React from 'react';
import { observer } from 'mobx-react';
import { styled } from '../../styles';

// JSON Validator Tool Component
const JSONValidatorContainer = styled.div`
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

const ValidationContent = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 16px;
`;

const InputSection = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
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

const ValidationResult = styled.div<{ isValid: boolean }>`
    padding: 16px;
    border-radius: 4px;
    border: 1px solid ${p => (p as any).isValid ? '#22c55e' : '#ef4444'};
    background-color: ${p => (p as any).isValid ? '#f0fdf4' : '#fef2f2'};
`;

const ValidationHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
`;

const ValidationIcon = styled.span<{ isValid: boolean }>`
    font-size: 20px;
    color: ${p => (p as any).isValid ? '#22c55e' : '#ef4444'};
`;

const ValidationTitle = styled.h4<{ isValid: boolean }>`
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: ${p => (p as any).isValid ? '#16a34a' : '#dc2626'};
`;

const ValidationDetails = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const ValidationItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid ${p => (p as any).theme.containerBorder};
`;

const ValidationLabel = styled.span`
    font-size: 13px;
    color: ${p => (p as any).theme.mainColor};
    font-weight: 500;
`;

const ValidationValue = styled.span`
    font-size: 13px;
    color: ${p => (p as any).theme.lowlightText};
    font-family: ${p => (p as any).theme.monoFontFamily};
`;

const ErrorMessage = styled.div`
    padding: 12px;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 4px;
    color: #dc2626;
    font-size: 13px;
    font-family: ${p => (p as any).theme.monoFontFamily};
    margin-top: 8px;
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin-top: 12px;
`;

const StatCard = styled.div`
    padding: 12px;
    background-color: ${p => (p as any).theme.containerBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
`;

const StatLabel = styled.div`
    font-size: 11px;
    color: ${p => (p as any).theme.lowlightText};
    margin-bottom: 4px;
`;

const StatValue = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: ${p => (p as any).theme.mainColor};
`;

interface JSONValidationResult {
    isValid: boolean;
    error?: string;
    errorPosition?: number;
    errorLine?: number;
    errorColumn?: number;
    stats?: {
        totalCharacters: number;
        totalLines: number;
        objectCount: number;
        arrayCount: number;
        stringCount: number;
        numberCount: number;
        booleanCount: number;
        nullCount: number;
        maxDepth: number;
    };
}

interface JSONValidatorState {
    input: string;
    validationResult: JSONValidationResult | null;
    isValidating: boolean;
}

export const JSONValidatorTool: React.FC = () => {
    const [state, setState] = React.useState<JSONValidatorState>({
        input: '',
        validationResult: null,
        isValidating: false
    });

    const validateJSON = React.useCallback(() => {
        if (!state.input.trim()) {
            setState(prev => ({
                ...prev,
                validationResult: null,
                isValidating: false
            }));
            return;
        }

        setState(prev => ({ ...prev, isValidating: true }));

        // Use setTimeout to allow UI to update
        setTimeout(() => {
            try {
                const parsed = JSON.parse(state.input);
                const stats = analyzeJSON(parsed);
                
                setState(prev => ({
                    ...prev,
                    validationResult: {
                        isValid: true,
                        stats
                    },
                    isValidating: false
                }));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                const position = extractErrorPosition(errorMessage);
                
                setState(prev => ({
                    ...prev,
                    validationResult: {
                        isValid: false,
                        error: errorMessage,
                        errorPosition: position.position,
                        errorLine: position.line,
                        errorColumn: position.column
                    },
                    isValidating: false
                }));
            }
        }, 100);
    }, [state.input]);

    const clearAll = React.useCallback(() => {
        setState({
            input: '',
            validationResult: null,
            isValidating: false
        });
    }, []);

    const loadSample = React.useCallback(() => {
        const validJSON = {
            "name": "John Doe",
            "age": 30,
            "active": true,
            "skills": ["JavaScript", "React", "Node.js"],
            "address": {
                "street": "123 Main St",
                "city": "New York",
                "zipCode": "10001"
            },
            "preferences": null
        };
        
        setState(prev => ({
            ...prev,
            input: JSON.stringify(validJSON, null, 2),
            validationResult: null
        }));
    }, []);

    const loadInvalidSample = React.useCallback(() => {
        const invalidJSON = `{
    "name": "John Doe",
    "age": 30,
    "active": true,
    "skills": ["JavaScript", "React", "Node.js"],
    "address": {
        "street": "123 Main St",
        "city": "New York",
        "zipCode": "10001"
    },
    "preferences": null,
    "invalid": "missing comma"
}`;
        
        setState(prev => ({
            ...prev,
            input: invalidJSON,
            validationResult: null
        }));
    }, []);

    // Auto-validate on input change
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (state.input) {
                validateJSON();
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [state.input, validateJSON]);

    return (
        <JSONValidatorContainer>
            <ToolHeader>
                <ToolTitle>JSON Validator</ToolTitle>
                <ToolDescription>
                    Validate JSON syntax and get detailed statistics about your JSON data structure
                </ToolDescription>
            </ToolHeader>

            <ValidationContent>
                <InputSection>
                    <SectionHeader>
                        <SectionTitle>JSON Input</SectionTitle>
                        <ButtonGroup>
                            <Button onClick={loadSample} variant="secondary">
                                Valid Sample
                            </Button>
                            <Button onClick={loadInvalidSample} variant="secondary">
                                Invalid Sample
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
                            validationResult: null
                        }))}
                        placeholder="Paste or type your JSON here to validate..."
                        spellCheck={false}
                    />
                </InputSection>

                {state.validationResult && (
                    <ValidationResult isValid={state.validationResult.isValid}>
                        <ValidationHeader>
                            <ValidationIcon isValid={state.validationResult.isValid}>
                                {state.validationResult.isValid ? '✅' : '❌'}
                            </ValidationIcon>
                            <ValidationTitle isValid={state.validationResult.isValid}>
                                {state.validationResult.isValid ? 'Valid JSON' : 'Invalid JSON'}
                            </ValidationTitle>
                        </ValidationHeader>

                        {state.validationResult.isValid ? (
                            <ValidationDetails>
                                <ValidationItem>
                                    <ValidationLabel>Total Characters:</ValidationLabel>
                                    <ValidationValue>{state.validationResult.stats?.totalCharacters}</ValidationValue>
                                </ValidationItem>
                                <ValidationItem>
                                    <ValidationLabel>Total Lines:</ValidationLabel>
                                    <ValidationValue>{state.validationResult.stats?.totalLines}</ValidationValue>
                                </ValidationItem>
                                
                                <StatsGrid>
                                    <StatCard>
                                        <StatLabel>Objects</StatLabel>
                                        <StatValue>{state.validationResult.stats?.objectCount}</StatValue>
                                    </StatCard>
                                    <StatCard>
                                        <StatLabel>Arrays</StatLabel>
                                        <StatValue>{state.validationResult.stats?.arrayCount}</StatValue>
                                    </StatCard>
                                    <StatCard>
                                        <StatLabel>Strings</StatLabel>
                                        <StatValue>{state.validationResult.stats?.stringCount}</StatValue>
                                    </StatCard>
                                    <StatCard>
                                        <StatLabel>Numbers</StatLabel>
                                        <StatValue>{state.validationResult.stats?.numberCount}</StatValue>
                                    </StatCard>
                                    <StatCard>
                                        <StatLabel>Booleans</StatLabel>
                                        <StatValue>{state.validationResult.stats?.booleanCount}</StatValue>
                                    </StatCard>
                                    <StatCard>
                                        <StatLabel>Null Values</StatLabel>
                                        <StatValue>{state.validationResult.stats?.nullCount}</StatValue>
                                    </StatCard>
                                </StatsGrid>

                                <ValidationItem>
                                    <ValidationLabel>Max Depth:</ValidationLabel>
                                    <ValidationValue>{state.validationResult.stats?.maxDepth}</ValidationValue>
                                </ValidationItem>
                            </ValidationDetails>
                        ) : (
                            <ValidationDetails>
                                <ValidationItem>
                                    <ValidationLabel>Error:</ValidationLabel>
                                    <ValidationValue>{state.validationResult.error}</ValidationValue>
                                </ValidationItem>
                                {state.validationResult.errorLine !== undefined && (
                                    <ValidationItem>
                                        <ValidationLabel>Line:</ValidationLabel>
                                        <ValidationValue>{state.validationResult.errorLine}</ValidationValue>
                                    </ValidationItem>
                                )}
                                {state.validationResult.errorColumn !== undefined && (
                                    <ValidationItem>
                                        <ValidationLabel>Column:</ValidationLabel>
                                        <ValidationValue>{state.validationResult.errorColumn}</ValidationValue>
                                    </ValidationItem>
                                )}
                                <ErrorMessage>
                                    {state.validationResult.error}
                                </ErrorMessage>
                            </ValidationDetails>
                        )}
                    </ValidationResult>
                )}
            </ValidationContent>
        </JSONValidatorContainer>
    );
};

// Helper function to analyze JSON structure
function analyzeJSON(obj: any, depth: number = 0): NonNullable<JSONValidationResult['stats']> {
    const stats = {
        totalCharacters: 0,
        totalLines: 0,
        objectCount: 0,
        arrayCount: 0,
        stringCount: 0,
        numberCount: 0,
        booleanCount: 0,
        nullCount: 0,
        maxDepth: depth
    };

    function traverse(value: any, currentDepth: number) {
        stats.maxDepth = Math.max(stats.maxDepth, currentDepth);

        if (value === null) {
            stats.nullCount++;
        } else if (Array.isArray(value)) {
            stats.arrayCount++;
            value.forEach(item => traverse(item, currentDepth + 1));
        } else if (typeof value === 'object') {
            stats.objectCount++;
            Object.values(value).forEach(item => traverse(item, currentDepth + 1));
        } else if (typeof value === 'string') {
            stats.stringCount++;
        } else if (typeof value === 'number') {
            stats.numberCount++;
        } else if (typeof value === 'boolean') {
            stats.booleanCount++;
        }
    }

    traverse(obj, 0);
    return stats;
}

// Helper function to extract error position from JSON parse error message
function extractErrorPosition(errorMessage: string): { position: number; line: number; column: number } {
    // Try to extract position from common error message formats
    const positionMatch = errorMessage.match(/position (\d+)/);
    const lineMatch = errorMessage.match(/line (\d+)/);
    const columnMatch = errorMessage.match(/column (\d+)/);

    const position = positionMatch ? parseInt(positionMatch[1]) : 0;
    const line = lineMatch ? parseInt(lineMatch[1]) : 1;
    const column = columnMatch ? parseInt(columnMatch[1]) : 1;

    return { position, line, column };
}
