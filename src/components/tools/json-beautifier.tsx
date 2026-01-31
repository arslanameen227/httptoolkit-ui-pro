import * as React from 'react';
import { observer } from 'mobx-react';
import { styled } from '../../styles';

// JSON Beautifier Tool Component
const JSONBeautifierContainer = styled.div`
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

const OptionInput = styled.input`
    padding: 4px 8px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: 12px;
    width: 60px;
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

interface JSONBeautifierState {
    input: string;
    output: string;
    error: string | null;
    success: string | null;
    indentSize: number;
    indentChar: 'space' | 'tab';
    sortKeys: boolean;
    isValid: boolean;
}

export const JSONBeautifierTool: React.FC = () => {
    const [state, setState] = React.useState<JSONBeautifierState>({
        input: '',
        output: '',
        error: null,
        success: null,
        indentSize: 2,
        indentChar: 'space',
        sortKeys: false,
        isValid: true
    });

    const validateAndBeautify = React.useCallback(() => {
        if (!state.input.trim()) {
            setState(prev => ({
                ...prev,
                output: '',
                error: null,
                success: null,
                isValid: true
            }));
            return;
        }

        try {
            const parsed = JSON.parse(state.input);
            
            // Sort keys if requested
            let sortedObj = parsed;
            if (state.sortKeys && typeof parsed === 'object' && parsed !== null) {
                sortedObj = sortObjectKeys(parsed);
            }

            // Beautify JSON
            const indent = state.indentChar === 'space' ? ' '.repeat(state.indentSize) : '\t';
            const beautified = JSON.stringify(sortedObj, null, indent);
            
            setState(prev => ({
                ...prev,
                output: beautified,
                error: null,
                success: 'JSON successfully beautified!',
                isValid: true
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                output: '',
                error: `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: null,
                isValid: false
            }));
        }
    }, [state.input, state.indentSize, state.indentChar, state.sortKeys]);

    const minify = React.useCallback(() => {
        if (!state.input.trim()) {
            setState(prev => ({
                ...prev,
                output: '',
                error: null,
                success: null,
                isValid: true
            }));
            return;
        }

        try {
            const parsed = JSON.parse(state.input);
            const minified = JSON.stringify(parsed);
            
            setState(prev => ({
                ...prev,
                output: minified,
                error: null,
                success: 'JSON successfully minified!',
                isValid: true
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                output: '',
                error: `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: null,
                isValid: false
            }));
        }
    }, [state.input]);

    const copyToClipboard = React.useCallback(async () => {
        if (!state.output) return;

        try {
            await navigator.clipboard.writeText(state.output);
            setState(prev => ({
                ...prev,
                success: 'Copied to clipboard!',
                error: null
            }));
            
            // Clear success message after 2 seconds
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
        setState({
            input: '',
            output: '',
            error: null,
            success: null,
            indentSize: 2,
            indentChar: 'space',
            sortKeys: false,
            isValid: true
        });
    }, []);

    const loadSample = React.useCallback(() => {
        const sampleJSON = {
            "name": "John Doe",
            "age": 30,
            "city": "New York",
            "skills": ["JavaScript", "React", "Node.js"],
            "address": {
                "street": "123 Main St",
                "zipCode": "10001"
            },
            "active": true
        };
        
        setState(prev => ({
            ...prev,
            input: JSON.stringify(sampleJSON),
            output: '',
            error: null,
            success: 'Sample JSON loaded!'
        }));
    }, []);

    // Auto-beautify on input change
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (state.input) {
                validateAndBeautify();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [state.input, validateAndBeautify]);

    return (
        <JSONBeautifierContainer>
            <ToolHeader>
                <ToolTitle>JSON Beautifier</ToolTitle>
                <ToolDescription>
                    Format, validate, and minify JSON data with customizable indentation and key sorting
                </ToolDescription>
            </ToolHeader>

            <OptionsContainer>
                <OptionGroup>
                    <OptionLabel>Indent Size:</OptionLabel>
                    <OptionInput
                        type="number"
                        min="1"
                        max="8"
                        value={state.indentSize}
                        onChange={(e) => setState(prev => ({
                            ...prev,
                            indentSize: Math.max(1, Math.min(8, parseInt(e.target.value) || 2))
                        }))}
                        disabled={state.indentChar === 'tab'}
                    />
                </OptionGroup>

                <OptionGroup>
                    <OptionLabel>Indent Type:</OptionLabel>
                    <Select
                        value={state.indentChar}
                        onChange={(e) => setState(prev => ({
                            ...prev,
                            indentChar: e.target.value as 'space' | 'tab'
                        }))}
                    >
                        <option value="space">Spaces</option>
                        <option value="tab">Tabs</option>
                    </Select>
                </OptionGroup>

                <OptionGroup>
                    <OptionLabel>
                        <input
                            type="checkbox"
                            checked={state.sortKeys}
                            onChange={(e) => setState(prev => ({
                                ...prev,
                                sortKeys: e.target.checked
                            }))}
                        />
                        Sort Keys
                    </OptionLabel>
                </OptionGroup>
            </OptionsContainer>

            {state.error && <ErrorMessage>{state.error}</ErrorMessage>}
            {state.success && <SuccessMessage>{state.success}</SuccessMessage>}

            <ToolContent>
                <InputSection>
                    <SectionHeader>
                        <SectionTitle>Input JSON</SectionTitle>
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
                            error: null,
                            success: null
                        }))}
                        placeholder="Paste or type your JSON here..."
                        spellCheck={false}
                    />
                </InputSection>

                <OutputSection>
                    <SectionHeader>
                        <SectionTitle>Formatted Output</SectionTitle>
                        <ButtonGroup>
                            <Button onClick={validateAndBeautify} variant="primary">
                                Beautify
                            </Button>
                            <Button onClick={minify} variant="secondary">
                                Minify
                            </Button>
                            <Button onClick={copyToClipboard} variant="secondary" disabled={!state.output}>
                                Copy
                            </Button>
                        </ButtonGroup>
                    </SectionHeader>
                    <TextArea
                        value={state.output}
                        readOnly
                        placeholder="Formatted JSON will appear here..."
                        spellCheck={false}
                    />
                </OutputSection>
            </ToolContent>
        </JSONBeautifierContainer>
    );
};

// Helper function to sort object keys recursively
function sortObjectKeys(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(sortObjectKeys);
    }
    
    if (obj !== null && typeof obj === 'object') {
        const sortedKeys = Object.keys(obj).sort();
        const sortedObj: any = {};
        
        for (const key of sortedKeys) {
            sortedObj[key] = sortObjectKeys(obj[key]);
        }
        
        return sortedObj;
    }
    
    return obj;
}
