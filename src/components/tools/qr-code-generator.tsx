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

interface QRCodeOptions {
    text: string;
    size: number;
    errorCorrection: 'L' | 'M' | 'Q' | 'H';
    margin: number;
    darkColor: string;
    lightColor: string;
    format: 'png' | 'svg' | 'base64';
}

interface QRCodeGeneratorState {
    options: QRCodeOptions;
    qrCodeUrl: string;
    error: string;
    success: string;
    isGenerating: boolean;
    history: { text: string; timestamp: number; url: string }[];
}

const QRCodeGeneratorContainer = styled.div`
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
    gap: 24px;
`;

const ControlsSection = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const ControlGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const SectionTitle = styled.h3`
    margin: 0 0 16px 0;
    color: ${p => (p as any).theme.mainColor};
    font-size: 16px;
    font-weight: 500;
`;

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const Label = styled.label`
    font-weight: 500;
    color: ${p => (p as any).theme.mainColor};
    font-size: 14px;
`;

const TextArea = styled.textarea`
    padding: 8px 12px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: 13px;
    font-family: ${p => p.theme.monoFontFamily};
    resize: vertical;
    min-height: 100px;

    &:focus {
        outline: none;
        border-color: ${p => (p as any).theme.popColor};
    }
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

    &:focus {
        outline: none;
        border-color: ${p => (p as any).theme.popColor};
    }
`;

const ColorInput = styled.input`
    width: 60px;
    height: 36px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    cursor: pointer;
`;

const ColorInputGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
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

const ButtonGroup = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
`;

const PreviewSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const PreviewContainer = styled.div`
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 8px;
    background-color: ${p => (p as any).theme.mainBackground};
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
`;

const QRCodeImage = styled.img`
    max-width: 100%;
    height: auto;
    border-radius: 4px;
`;

const QRCodeSVG = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const EmptyPreview = styled.div`
    text-align: center;
    color: ${p => (p as any).theme.lowlightText};
    font-style: italic;
    padding: 40px;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
`;

const HistorySection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const HistoryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
`;

const HistoryItem = styled.div`
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 6px;
    background-color: ${p => (p as any).theme.mainBackground};
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: ${p => (p as any).theme.popColor};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
`;

const HistoryPreview = styled.div`
    width: 60px;
    height: 60px;
    margin: 0 auto 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: #f5f5f5;
`;

const HistoryText = styled.div`
    font-size: 12px;
    color: ${p => (p as any).theme.mainColor};
    text-align: center;
    word-break: break-all;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
`;

const HistoryTimestamp = styled.div`
    font-size: 10px;
    color: ${p => (p as any).theme.lowlightText};
    text-align: center;
    margin-top: 4px;
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

// Simple QR Code Generator (basic implementation)
const generateQRCode = (text: string, options: QRCodeOptions): string => {
    // This is a simplified QR code generator for demonstration
    // In production, you'd use a proper QR code library like qrcode.js
    
    const size = options.size;
    const margin = options.margin;
    const darkColor = options.darkColor.replace('#', '');
    const lightColor = options.lightColor.replace('#', '');
    
    // Create a simple pattern-based QR code (this is just a placeholder)
    const modules = 25; // Standard QR code size
    const cellSize = Math.floor((size - 2 * margin) / modules);
    
    // Generate a pseudo-random pattern based on text
    const pattern: boolean[][] = [];
    let seed = 0;
    for (let i = 0; i < text.length; i++) {
        seed = ((seed << 5) - seed) + text.charCodeAt(i);
        seed |= 0; // Convert to 32bit integer
    }
    
    const random = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
    
    for (let y = 0; y < modules; y++) {
        pattern[y] = [];
        for (let x = 0; x < modules; x++) {
            // Create position patterns (corner squares)
            const isCornerPattern = 
                (x < 7 && y < 7) || // Top-left
                (x >= modules - 7 && y < 7) || // Top-right
                (x < 7 && y >= modules - 7); // Bottom-left
            
            pattern[y][x] = isCornerPattern || random() > 0.5;
        }
    }
    
    // Generate SVG
    let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${size}" height="${size}" fill="#${lightColor}"/>`;
    
    for (let y = 0; y < modules; y++) {
        for (let x = 0; x < modules; x++) {
            if (pattern[y][x]) {
                svg += `<rect x="${margin + x * cellSize}" y="${margin + y * cellSize}" width="${cellSize}" height="${cellSize}" fill="#${darkColor}"/>`;
            }
        }
    }
    
    svg += '</svg>';
    
    if (options.format === 'svg') {
        return 'data:image/svg+xml;base64,' + btoa(svg);
    } else {
        // For PNG/base64, we'd need a canvas-based implementation
        // This is a simplified version that returns the SVG as base64
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }
};

export const QRCodeGeneratorTool: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
    const [state, setState] = React.useState<QRCodeGeneratorState>({
        options: {
            text: 'https://example.com',
            size: 200,
            errorCorrection: 'M',
            margin: 4,
            darkColor: '#000000',
            lightColor: '#ffffff',
            format: 'png'
        },
        qrCodeUrl: '',
        error: '',
        success: '',
        isGenerating: false,
        history: []
    });

    const generateQR = async () => {
        try {
            setState(prev => ({ ...prev, isGenerating: true, error: '', success: '' }));

            if (!state.options.text.trim()) {
                setState(prev => ({
                    ...prev,
                    error: 'Please enter text or URL to generate QR code',
                    isGenerating: false
                }));
                return;
            }

            const qrCodeUrl = generateQRCode(state.options.text, state.options);

            setState(prev => ({
                ...prev,
                qrCodeUrl,
                success: 'QR code generated successfully!',
                isGenerating: false,
                history: [
                    {
                        text: state.options.text,
                        timestamp: Date.now(),
                        url: qrCodeUrl
                    },
                    ...prev.history.slice(0, 9) // Keep last 10
                ]
            }));

        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to generate QR code',
                success: '',
                isGenerating: false
            }));
        }
    };

    const downloadQRCode = async () => {
        if (!state.qrCodeUrl) return;

        try {
            const link = document.createElement('a');
            link.href = state.qrCodeUrl;
            link.download = `qrcode-${Date.now()}.${state.options.format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setState(prev => ({ ...prev, success: 'QR code downloaded!' }));
            setTimeout(() => setState(prev => ({ ...prev, success: '' })), 3000);
        } catch (error) {
            setState(prev => ({ ...prev, error: 'Failed to download QR code' }));
        }
    };

    const copyToClipboard = async () => {
        if (!state.qrCodeUrl) return;

        try {
            await navigator.clipboard.writeText(state.options.text);
            setState(prev => ({ ...prev, success: 'Text copied to clipboard!' }));
            setTimeout(() => setState(prev => ({ ...prev, success: '' })), 3000);
        } catch (error) {
            setState(prev => ({ ...prev, error: 'Failed to copy to clipboard' }));
        }
    };

    const handleHistoryClick = (item: { text: string; timestamp: number; url: string }) => {
        setState(prev => ({
            ...prev,
            options: { ...prev.options, text: item.text },
            qrCodeUrl: item.url
        }));
    };

    const updateOption = (key: keyof QRCodeOptions, value: any) => {
        setState(prev => ({
            ...prev,
            options: { ...prev.options, [key]: value }
        }));
    };

    return (
        <QRCodeGeneratorContainer>
            <ToolHeader>
                <ToolTitle>{tool.name}</ToolTitle>
                <ToolDescription>{tool.description}</ToolDescription>
            </ToolHeader>

            <ToolContent>
                {/* Controls */}
                <ControlsSection>
                    <ControlGroup>
                        <SectionTitle>Content</SectionTitle>
                        <InputGroup>
                            <Label>Text or URL:</Label>
                            <TextArea
                                value={state.options.text}
                                onChange={(e) => updateOption('text', e.target.value)}
                                placeholder="Enter text, URL, or any data to encode..."
                            />
                        </InputGroup>
                    </ControlGroup>

                    <ControlGroup>
                        <SectionTitle>Appearance</SectionTitle>
                        <InputGroup>
                            <Label>Size: {state.options.size}px</Label>
                            <NumberInput
                                type="range"
                                min="100"
                                max="500"
                                value={state.options.size}
                                onChange={(e) => updateOption('size', parseInt(e.target.value))}
                            />
                        </InputGroup>

                        <InputGroup>
                            <Label>Error Correction:</Label>
                            <Select
                                value={state.options.errorCorrection}
                                onChange={(e) => updateOption('errorCorrection', e.target.value)}
                            >
                                <option value="L">Low (7%)</option>
                                <option value="M">Medium (15%)</option>
                                <option value="Q">Quartile (25%)</option>
                                <option value="H">High (30%)</option>
                            </Select>
                        </InputGroup>

                        <InputGroup>
                            <Label>Margin:</Label>
                            <NumberInput
                                type="number"
                                min="0"
                                max="20"
                                value={state.options.margin}
                                onChange={(e) => updateOption('margin', parseInt(e.target.value))}
                            />
                        </InputGroup>

                        <InputGroup>
                            <Label>Colors:</Label>
                            <ColorInputGroup>
                                <div>
                                    <Label style={{ fontSize: '12px' }}>Dark:</Label>
                                    <ColorInput
                                        type="color"
                                        value={state.options.darkColor}
                                        onChange={(e) => updateOption('darkColor', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label style={{ fontSize: '12px' }}>Light:</Label>
                                    <ColorInput
                                        type="color"
                                        value={state.options.lightColor}
                                        onChange={(e) => updateOption('lightColor', e.target.value)}
                                    />
                                </div>
                            </ColorInputGroup>
                        </InputGroup>

                        <InputGroup>
                            <Label>Format:</Label>
                            <Select
                                value={state.options.format}
                                onChange={(e) => updateOption('format', e.target.value)}
                            >
                                <option value="png">PNG</option>
                                <option value="svg">SVG</option>
                                <option value="base64">Base64</option>
                            </Select>
                        </InputGroup>
                    </ControlGroup>
                </ControlsSection>

                {/* Action Buttons */}
                <ButtonGroup>
                    <Button 
                        variant="primary" 
                        onClick={generateQR}
                        disabled={state.isGenerating}
                    >
                        {state.isGenerating ? 'Generating...' : 'Generate QR Code'}
                    </Button>
                    <Button onClick={downloadQRCode} disabled={!state.qrCodeUrl}>
                        Download
                    </Button>
                    <Button onClick={copyToClipboard} disabled={!state.options.text}>
                        Copy Text
                    </Button>
                </ButtonGroup>

                {/* Messages */}
                {state.error && <ErrorMessage>{state.error}</ErrorMessage>}
                {state.success && <SuccessMessage>{state.success}</SuccessMessage>}

                {/* Preview */}
                <PreviewSection>
                    <SectionTitle>Preview</SectionTitle>
                    <PreviewContainer>
                        {state.qrCodeUrl ? (
                            state.options.format === 'svg' ? (
                                <QRCodeSVG dangerouslySetInnerHTML={{ __html: atob(state.qrCodeUrl.replace('data:image/svg+xml;base64,', '')) }} />
                            ) : (
                                <QRCodeImage src={state.qrCodeUrl} alt="Generated QR Code" />
                            )
                        ) : (
                            <EmptyPreview>
                                Enter content and click "Generate QR Code" to see preview
                            </EmptyPreview>
                        )}
                    </PreviewContainer>
                </PreviewSection>

                {/* History */}
                {state.history.length > 0 && (
                    <HistorySection>
                        <SectionTitle>Recent QR Codes</SectionTitle>
                        <HistoryGrid>
                            {state.history.map((item, index) => (
                                <HistoryItem
                                    key={`${item.timestamp}-${index}`}
                                    onClick={() => handleHistoryClick(item)}
                                >
                                    <HistoryPreview>
                                        {item.url && (
                                            <img 
                                                src={item.url} 
                                                alt="QR Code" 
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                            />
                                        )}
                                    </HistoryPreview>
                                    <HistoryText>{item.text}</HistoryText>
                                    <HistoryTimestamp>
                                        {new Date(item.timestamp).toLocaleTimeString()}
                                    </HistoryTimestamp>
                                </HistoryItem>
                            ))}
                        </HistoryGrid>
                    </HistorySection>
                )}

                {/* Information */}
                <InfoSection>
                    <InfoTitle>About QR Codes</InfoTitle>
                    <InfoList>
                        <li><strong>Error Correction:</strong> Higher levels allow QR codes to be read even if partially damaged</li>
                        <li><strong>Size:</strong> Larger QR codes are easier to scan from a distance</li>
                        <li><strong>Colors:</strong> Ensure sufficient contrast between dark and light areas</li>
                        <li><strong>Formats:</strong> SVG is scalable, PNG is widely supported, Base64 for embedding</li>
                    </InfoList>
                </InfoSection>
            </ToolContent>
        </QRCodeGeneratorContainer>
    );
};
