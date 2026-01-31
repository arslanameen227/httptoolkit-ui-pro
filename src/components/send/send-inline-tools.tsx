import * as React from 'react';
import { observer } from 'mobx-react';
import { styled, css } from '../../styles';
import { Icon } from '../../icons';
import { bufferToString } from '../../util/buffer';
import { RawHeaders } from '../../types';
import { EditableBody } from '../../model/http/editable-body';

// Import tool functions
import { parseColor, convertColor } from '../tools/color-converter';
import { formatUUID, generateUUIDv4 } from '../tools/uuid-generator';
import { hexToRgb, rgbToHex, rgbToHsl, rgbToHsv, rgbToCmyk } from '../tools/color-converter';

interface SendInlineToolsProps {
    headers: RawHeaders;
    body: EditableBody;
    onBodyUpdated: (body: Buffer) => void;
    onHeadersUpdated: (headers: RawHeaders) => void;
}

interface ToolState {
    activeTool: 'none' | 'json-formatter' | 'url-encoder' | 'uuid-generator' | 'color-converter';
    isExpanded: boolean;
}

const InlineToolsContainer = styled.div<{ isExpanded: boolean }>`
    background-color: ${p => (p as any).theme.containerBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 6px;
    margin: 8px 0;
    overflow: hidden;
    transition: all 0.3s ease;
    max-height: ${p => p.isExpanded ? '400px' : '40px'};
`;

const ToolsHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background-color: ${p => (p as any).theme.mainBackground};
    border-bottom: 1px solid ${p => (p as any).theme.containerBorder};
    cursor: pointer;
`;

const ToolsTitle = styled.div`
    font-weight: 500;
    color: ${p => (p as any).theme.mainColor};
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const ToolsToggle = styled.button<{ isExpanded: boolean }>`
    background: none;
    border: none;
    color: ${p => (p as any).theme.lowlightText};
    cursor: pointer;
    font-size: 12px;
    padding: 4px;
    border-radius: 3px;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${p => (p as any).theme.containerBorder};
        color: ${p => (p as any).theme.mainColor};
    }

    ${p => p.isExpanded && css`
        transform: rotate(180deg);
    `}
`;

const ToolsContent = styled.div`
    padding: 12px;
    max-height: 350px;
    overflow-y: auto;
`;

const ToolSelector = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
`;

const ToolButton = styled.button<{ isActive: boolean }>`
    padding: 6px 12px;
    border: 1px solid ${p => p.isActive ? (p as any).theme.popColor : (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => p.isActive ? (p as any).theme.popColor : (p as any).theme.mainBackground};
    color: ${p => p.isActive ? 'white' : (p as any).theme.mainColor};
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        opacity: 0.8;
        transform: translateY(-1px);
    }
`;

const ToolContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const ToolInput = styled.textarea`
    padding: 8px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: 12px;
    font-family: ${p => p.theme.monoFontFamily};
    resize: vertical;
    min-height: 80px;

    &:focus {
        outline: none;
        border-color: ${p => (p as any).theme.popColor};
    }
`;

const ToolOutput = styled.div`
    padding: 8px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: 12px;
    font-family: ${p => p.theme.monoFontFamily};
    min-height: 80px;
    max-height: 150px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-all;
`;

const ToolControls = styled.div`
    display: flex;
    gap: 8px;
    justify-content: flex-end;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
    padding: 6px 12px;
    border: 1px solid ${p => (p as any).variant === 'primary' ? (p as any).theme.popColor : (p as any).theme.containerBorder};
    border-radius: 3px;
    background-color: ${p => (p as any).variant === 'primary' ? (p as any).theme.popColor : (p as any).theme.mainBackground};
    color: ${p => (p as any).variant === 'primary' ? 'white' : (p as any).theme.mainColor};
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        opacity: 0.8;
    }
`;

const ToolDescription = styled.div`
    font-size: 11px;
    color: ${p => (p as any).theme.lowlightText};
    margin-bottom: 8px;
`;

// Tool implementations
const formatJSON = (input: string): string => {
    try {
        const parsed = JSON.parse(input);
        return JSON.stringify(parsed, null, 2);
    } catch (error) {
        throw new Error('Invalid JSON format');
    }
};

const encodeURL = (input: string): string => {
    try {
        return encodeURIComponent(input);
    } catch (error) {
        throw new Error('Failed to encode URL');
    }
};

const decodeURL = (input: string): string => {
    try {
        return decodeURIComponent(input);
    } catch (error) {
        throw new Error('Failed to decode URL');
    }
};

const generateUUID = (): string => {
    return generateUUIDv4();
};

const convertColorInline = (input: string): string => {
    try {
        const color = parseColor(input);
        if (!color) {
            throw new Error('Invalid color format');
        }
        return `HEX: ${color.hex}\nRGB: ${color.rgb}\nHSL: ${color.hsl}\nHSV: ${color.hsv}\nCMYK: ${color.cmyk}`;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Color conversion failed');
    }
};

export const SendInlineTools: React.FC<SendInlineToolsProps> = ({
    headers,
    body,
    onBodyUpdated,
    onHeadersUpdated
}) => {
    const [state, setState] = React.useState<ToolState>({
        activeTool: 'none',
        isExpanded: false
    });

    const [toolInput, setToolInput] = React.useState('');
    const [toolOutput, setToolOutput] = React.useState('');
    const [toolError, setToolError] = React.useState('');

    const toggleExpanded = () => {
        setState(prev => ({ ...prev, isExpanded: !prev.isExpanded }));
    };

    const selectTool = (tool: ToolState['activeTool']) => {
        setState(prev => ({ ...prev, activeTool: tool }));
        setToolInput('');
        setToolOutput('');
        setToolError('');
    };

    const executeTool = () => {
        setToolError('');
        setToolOutput('');

        try {
            let result = '';

            switch (state.activeTool) {
                case 'json-formatter':
                    result = formatJSON(toolInput);
                    break;
                case 'url-encoder':
                    result = encodeURL(toolInput);
                    break;
                case 'uuid-generator':
                    result = generateUUID();
                    break;
                case 'color-converter':
                    result = convertColorInline(toolInput);
                    break;
                default:
                    return;
            }

            setToolOutput(result);
        } catch (error) {
            setToolError(error instanceof Error ? error.message : 'Tool execution failed');
        }
    };

    const applyToBody = () => {
        if (!toolOutput) return;

        try {
            const buffer = Buffer.from(toolOutput, 'utf8');
            onBodyUpdated(buffer);
            setToolError('');
            setToolOutput('Applied to request body!');
        } catch (error) {
            setToolError('Failed to apply to request body');
        }
    };

    const copyToClipboard = async () => {
        if (!toolOutput) return;

        try {
            await navigator.clipboard.writeText(toolOutput);
            setToolError('');
            setToolOutput('Copied to clipboard!');
        } catch (error) {
            setToolError('Failed to copy to clipboard');
        }
    };

    const getToolDescription = () => {
        switch (state.activeTool) {
            case 'json-formatter':
                return 'Format and beautify JSON data';
            case 'url-encoder':
                return 'Encode/decode URL strings';
            case 'uuid-generator':
                return 'Generate UUID v4';
            case 'color-converter':
                return 'Convert between color formats (HEX, RGB, HSL, etc.)';
            default:
                return '';
        }
    };

    return (
        <InlineToolsContainer isExpanded={state.isExpanded}>
            <ToolsHeader onClick={toggleExpanded}>
                <ToolsTitle>
                    🔧 Inline Tools
                </ToolsTitle>
                <ToolsToggle isExpanded={state.isExpanded}>
                    ▼
                </ToolsToggle>
            </ToolsHeader>

            {state.isExpanded && (
                <ToolsContent>
                    <ToolSelector>
                        <ToolButton
                            isActive={state.activeTool === 'none'}
                            onClick={() => selectTool('none')}
                        >
                            None
                        </ToolButton>
                        <ToolButton
                            isActive={state.activeTool === 'json-formatter'}
                            onClick={() => selectTool('json-formatter')}
                        >
                            JSON
                        </ToolButton>
                        <ToolButton
                            isActive={state.activeTool === 'url-encoder'}
                            onClick={() => selectTool('url-encoder')}
                        >
                            URL
                        </ToolButton>
                        <ToolButton
                            isActive={state.activeTool === 'uuid-generator'}
                            onClick={() => selectTool('uuid-generator')}
                        >
                            UUID
                        </ToolButton>
                        <ToolButton
                            isActive={state.activeTool === 'color-converter'}
                            onClick={() => selectTool('color-converter')}
                        >
                            Color
                        </ToolButton>
                    </ToolSelector>

                    {state.activeTool !== 'none' && (
                        <ToolContent>
                            <ToolDescription>
                                {getToolDescription()}
                            </ToolDescription>

                            {state.activeTool !== 'uuid-generator' && (
                                <ToolInput
                                    value={toolInput}
                                    onChange={(e) => setToolInput(e.target.value)}
                                    placeholder={
                                        state.activeTool === 'json-formatter' ? 'Enter JSON data...' :
                                        state.activeTool === 'url-encoder' ? 'Enter URL to encode/decode...' :
                                        state.activeTool === 'color-converter' ? 'Enter color (HEX, RGB, HSL)...' :
                                        'Enter input...'
                                    }
                                />
                            )}

                            <ToolControls>
                                <ActionButton
                                    variant="primary"
                                    onClick={executeTool}
                                    disabled={!toolInput && state.activeTool !== 'uuid-generator'}
                                >
                                    {state.activeTool === 'uuid-generator' ? 'Generate' : 'Process'}
                                </ActionButton>
                            </ToolControls>

                            {toolOutput && (
                                <>
                                    <ToolOutput>
                                        {toolOutput}
                                    </ToolOutput>
                                    <ToolControls>
                                        <ActionButton onClick={copyToClipboard}>
                                            Copy
                                        </ActionButton>
                                        <ActionButton onClick={applyToBody}>
                                            Apply to Body
                                        </ActionButton>
                                    </ToolControls>
                                </>
                            )}

                            {toolError && (
                                <ToolOutput style={{ color: '#c33' }}>
                                    Error: {toolError}
                                </ToolOutput>
                            )}
                        </ToolContent>
                    )}
                </ToolsContent>
            )}
        </InlineToolsContainer>
    );
};
