import * as React from 'react';
import { observer } from 'mobx-react';
import { styled, css } from '../../styles';
import { Icon } from '../../icons';

export interface ToolDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
}

interface ColorConversion {
    hex: string;
    rgb: string;
    hsl: string;
    hsv: string;
    cmyk: string;
}

interface ColorPalette {
    name: string;
    colors: string[];
}

interface ColorConverterState {
    input: string;
    currentColor: ColorConversion;
    error: string;
    success: string;
    palette: ColorPalette[];
    activePalette: string;
    history: ColorConversion[];
}

const ColorConverterContainer = styled.div`
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
    gap: 24px;
`;

const InputSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const InputGroup = styled.div`
    display: flex;
    gap: 12px;
    align-items: center;
`;

const InputLabel = styled.label`
    font-weight: 500;
    color: ${p => (p as any).theme.mainColor};
    font-size: 14px;
    min-width: 80px;
`;

const ColorInput = styled.input`
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

const ColorPicker = styled.input`
    width: 50px;
    height: 36px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    cursor: pointer;
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
`;

const ResultsSection = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const ColorPreview = styled.div`
    background-color: ${p => p.color || '#ffffff'};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 8px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${p => p.color ? getContrastColor(p.color) : (p as any).theme.mainColor};
    font-weight: 500;
    font-size: 16px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const ConversionResults = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
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
`;

const ResultLabel = styled.div`
    font-weight: 500;
    color: ${p => (p as any).theme.mainColor};
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const ResultValue = styled.div`
    font-family: ${p => p.theme.monoFontFamily};
    font-size: 14px;
    color: ${p => (p as any).theme.mainColor};
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

const PaletteSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const PaletteHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const PaletteTitle = styled.h3`
    margin: 0;
    color: ${p => (p as any).theme.mainColor};
    font-size: 16px;
    font-weight: 500;
`;

const PaletteSelector = styled.select`
    padding: 6px 12px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: 12px;
    cursor: pointer;
`;

const ColorGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 8px;
`;

const ColorSwatch = styled.div<{ color: string }>`
    background-color: ${p => p.color};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    height: 60px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
`;

const ColorTooltip = styled.div`
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    background-color: ${p => (p as any).theme.containerBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 3px;
    padding: 2px 6px;
    font-size: 10px;
    color: ${p => (p as any).theme.mainColor};
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
    z-index: 10;
`;

const ColorSwatchContainer = styled.div`
    position: relative;
    
    &:hover ${ColorTooltip} {
        opacity: 1;
    }
`;

const HistorySection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const HistoryGrid = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
`;

const HistoryItem = styled.div<{ color: string }>`
    background-color: ${p => p.color};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    width: 40px;
    height: 40px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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

// Color conversion functions
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const rgbToHsv = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max !== min) {
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
};

const rgbToCmyk = (r: number, g: number, b: number): { c: number; m: number; y: number; k: number } => {
    r /= 255;
    g /= 255;
    b /= 255;

    const k = 1 - Math.max(r, g, b);
    const c = (1 - r - k) / (1 - k) || 0;
    const m = (1 - g - k) / (1 - k) || 0;
    const y = (1 - b - k) / (1 - k) || 0;

    return {
        c: Math.round(c * 100),
        m: Math.round(m * 100),
        y: Math.round(y * 100),
        k: Math.round(k * 100)
    };
};

const parseColorInput = (input: string): ColorConversion | null => {
    input = input.trim().toLowerCase();

    // Try HEX
    if (input.startsWith('#')) {
        const rgb = hexToRgb(input);
        if (rgb) {
            return convertColor(rgb.r, rgb.g, rgb.b);
        }
    }

    // Try RGB
    const rgbMatch = input.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        return convertColor(r, g, b);
    }

    // Try HSL
    const hslMatch = input.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (hslMatch) {
        // Convert HSL to RGB (simplified)
        const h = parseInt(hslMatch[1]) / 360;
        const s = parseInt(hslMatch[2]) / 100;
        const l = parseInt(hslMatch[3]) / 100;
        
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return convertColor(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
    }

    return null;
};

const convertColor = (r: number, g: number, b: number): ColorConversion => {
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const hsv = rgbToHsv(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);

    return {
        hex,
        rgb: `rgb(${r}, ${g}, ${b})`,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
        cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`
    };
};

const getContrastColor = (hex: string): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return '#000000';
    
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
};

const defaultPalettes: ColorPalette[] = [
    {
        name: 'Material Design',
        colors: ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722']
    },
    {
        name: 'Tailwind CSS',
        colors: ['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899']
    },
    {
        name: 'Pastel',
        colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#E0BBE4', '#FFDFD3', '#D4A5A5', '#A8DADC', '#457B9D', '#F1FAEE', '#A8DADC', '#457B9D', '#1D3557', '#F1FAEE', '#E63946']
    }
];

// Export utility functions for use in other components
export { hexToRgb, rgbToHex, rgbToHsl, rgbToHsv, rgbToCmyk, parseColorInput as parseColor, convertColor };

export const ColorConverterTool: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
    const [state, setState] = React.useState<ColorConverterState>({
        input: '#3B82F6',
        currentColor: convertColor(59, 130, 246),
        error: '',
        success: '',
        palette: defaultPalettes,
        activePalette: 'Material Design',
        history: []
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

    const handleInputChange = (value: string) => {
        setState(prev => ({ ...prev, input: value }));
        
        const conversion = parseColorInput(value);
        if (conversion) {
            setState(prev => ({
                ...prev,
                currentColor: conversion,
                error: '',
                history: [conversion, ...prev.history.slice(0, 19)] // Keep last 20
            }));
        } else {
            setState(prev => ({ ...prev, error: 'Invalid color format' }));
        }
    };

    const handleColorPickerChange = (value: string) => {
        setState(prev => ({ ...prev, input: value }));
        const rgb = hexToRgb(value);
        if (rgb) {
            const conversion = convertColor(rgb.r, rgb.g, rgb.b);
            setState(prev => ({
                ...prev,
                currentColor: conversion,
                error: '',
                history: [conversion, ...prev.history.slice(0, 19)]
            }));
        }
    };

    const handlePaletteColorClick = (color: string) => {
        handleColorPickerChange(color);
    };

    const handleHistoryClick = (color: ColorConversion) => {
        setState(prev => ({
            ...prev,
            input: color.hex,
            currentColor: color,
            error: ''
        }));
    };

    return (
        <ColorConverterContainer>
            <ToolHeader>
                <ToolTitle>{tool.name}</ToolTitle>
                <ToolDescription>{tool.description}</ToolDescription>
            </ToolHeader>

            <ToolContent>
                {/* Input Section */}
                <InputSection>
                    <InputGroup>
                        <InputLabel>Color Input:</InputLabel>
                        <ColorInput
                            value={state.input}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder="Enter HEX, RGB, or HSL color..."
                        />
                        <ColorPicker
                            type="color"
                            value={state.currentColor.hex}
                            onChange={(e) => handleColorPickerChange(e.target.value)}
                        />
                        <Button 
                            variant="primary"
                            onClick={() => copyToClipboard(state.currentColor.hex)}
                        >
                            Copy HEX
                        </Button>
                    </InputGroup>
                </InputSection>

                {/* Messages */}
                {state.error && <ErrorMessage>{state.error}</ErrorMessage>}
                {state.success && <SuccessMessage>{state.success}</SuccessMessage>}

                {/* Results Section */}
                <ResultsSection>
                    <ColorPreview color={state.currentColor.hex}>
                        {state.currentColor.hex.toUpperCase()}
                    </ColorPreview>

                    <ConversionResults>
                        <ResultCard>
                            <ResultInfo>
                                <ResultLabel>HEX</ResultLabel>
                                <ResultValue>{state.currentColor.hex.toUpperCase()}</ResultValue>
                            </ResultInfo>
                            <CopyButton onClick={() => copyToClipboard(state.currentColor.hex)}>
                                Copy
                            </CopyButton>
                        </ResultCard>

                        <ResultCard>
                            <ResultInfo>
                                <ResultLabel>RGB</ResultLabel>
                                <ResultValue>{state.currentColor.rgb}</ResultValue>
                            </ResultInfo>
                            <CopyButton onClick={() => copyToClipboard(state.currentColor.rgb)}>
                                Copy
                            </CopyButton>
                        </ResultCard>

                        <ResultCard>
                            <ResultInfo>
                                <ResultLabel>HSL</ResultLabel>
                                <ResultValue>{state.currentColor.hsl}</ResultValue>
                            </ResultInfo>
                            <CopyButton onClick={() => copyToClipboard(state.currentColor.hsl)}>
                                Copy
                            </CopyButton>
                        </ResultCard>

                        <ResultCard>
                            <ResultInfo>
                                <ResultLabel>HSV</ResultLabel>
                                <ResultValue>{state.currentColor.hsv}</ResultValue>
                            </ResultInfo>
                            <CopyButton onClick={() => copyToClipboard(state.currentColor.hsv)}>
                                Copy
                            </CopyButton>
                        </ResultCard>

                        <ResultCard>
                            <ResultInfo>
                                <ResultLabel>CMYK</ResultLabel>
                                <ResultValue>{state.currentColor.cmyk}</ResultValue>
                            </ResultInfo>
                            <CopyButton onClick={() => copyToClipboard(state.currentColor.cmyk)}>
                                Copy
                            </CopyButton>
                        </ResultCard>
                    </ConversionResults>
                </ResultsSection>

                {/* Color Palette */}
                <PaletteSection>
                    <PaletteHeader>
                        <PaletteTitle>Color Palettes</PaletteTitle>
                        <PaletteSelector
                            value={state.activePalette}
                            onChange={(e) => setState(prev => ({ ...prev, activePalette: e.target.value }))}
                        >
                            {state.palette.map(palette => (
                                <option key={palette.name} value={palette.name}>
                                    {palette.name}
                                </option>
                            ))}
                        </PaletteSelector>
                    </PaletteHeader>
                    <ColorGrid>
                        {state.palette
                            .find(p => p.name === state.activePalette)
                            ?.colors.map(color => (
                                <ColorSwatchContainer key={color}>
                                    <ColorSwatch
                                        color={color}
                                        onClick={() => handlePaletteColorClick(color)}
                                    />
                                    <ColorTooltip>{color}</ColorTooltip>
                                </ColorSwatchContainer>
                            ))}
                    </ColorGrid>
                </PaletteSection>

                {/* History */}
                {state.history.length > 0 && (
                    <HistorySection>
                        <PaletteTitle>Recent Colors</PaletteTitle>
                        <HistoryGrid>
                            {state.history.map((color, index) => (
                                <HistoryItem
                                    key={`${color.hex}-${index}`}
                                    color={color.hex}
                                    onClick={() => handleHistoryClick(color)}
                                    title={color.hex}
                                />
                            ))}
                        </HistoryGrid>
                    </HistorySection>
                )}
            </ToolContent>
        </ColorConverterContainer>
    );
};
