import * as React from 'react';
import styled from 'styled-components';
import { Theme } from '../../styles';
import { Button, Select } from '../common/inputs';
import { ContentLabel, ContentValue } from '../common/text-content';

interface HexConverterState {
    inputText: string;
    outputText: string;
    conversionType: 'text-to-hex' | 'hex-to-text' | 'decimal-to-hex' | 'hex-to-decimal' | 'binary-to-hex' | 'hex-to-binary';
    error: string;
    formatOutput: boolean;
    uppercase: boolean;
}

const HexConverterContainer = styled.div`
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const ControlsContainer = styled.div`
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    flex-wrap: wrap;
    align-items: center;
`;

const ControlGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const TextAreaContainer = styled.div`
    display: flex;
    gap: 16px;
    flex: 1;
    min-height: 300px;
`;

const InputSection = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const OutputSection = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const StyledTextArea = styled.textarea`
    flex: 1;
    min-height: 250px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
    margin-top: 16px;
`;

const ErrorMessage = styled.div`
    color: ${p => (p as any).theme.warningColor};
    padding: 8px;
    background-color: ${p => (p as any).theme.highlightBackground};
    border-radius: 4px;
    margin-top: 8px;
`;

const InfoMessage = styled.div`
    color: ${p => (p as any).theme.lowlightText};
    font-size: 12px;
    margin-top: 8px;
`;

const CheckboxContainer = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
`;

const StyledCheckbox = styled.input`
    cursor: pointer;
`;

const StatsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin-top: 16px;
`;

const StatCard = styled.div`
    padding: 12px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 6px;
    background-color: ${p => (p as any).theme.containerBackground};
`;

const StatLabel = styled.div`
    font-size: 11px;
    color: ${p => (p as any).theme.lowlightText};
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const StatValue = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: ${p => (p as any).theme.popColor};
`;

class HexConverter {
    static textToHex(text: string, uppercase: boolean, formatOutput: boolean): string {
        try {
            let hex = '';
            for (let i = 0; i < text.length; i++) {
                const hexByte = text.charCodeAt(i).toString(16).padStart(2, '0');
                hex += (uppercase ? hexByte.toUpperCase() : hexByte);
                if (formatOutput && i < text.length - 1) {
                    hex += ' ';
                }
            }
            return hex;
        } catch (error) {
            throw new Error(`Text to hex conversion failed: ${(error as Error).message}`);
        }
    }

    static hexToText(hex: string): string {
        try {
            // Clean hex string - remove spaces and common prefixes
            const cleanHex = hex.replace(/\s+/g, '').replace(/^0x/i, '').replace(/^0X/i, '');
            
            if (cleanHex.length % 2 !== 0) {
                throw new Error('Hex string must have an even number of characters');
            }

            if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
                throw new Error('Invalid hex string - contains non-hex characters');
            }

            let text = '';
            for (let i = 0; i < cleanHex.length; i += 2) {
                const hexByte = cleanHex.substr(i, 2);
                const charCode = parseInt(hexByte, 16);
                text += String.fromCharCode(charCode);
            }
            return text;
        } catch (error) {
            throw new Error(`Hex to text conversion failed: ${(error as Error).message}`);
        }
    }

    static decimalToHex(decimal: string, uppercase: boolean, formatOutput: boolean): string {
        try {
            const numbers = decimal.split(/[\s,\n]+/).filter(n => n.trim());
            const hexValues: string[] = [];

            for (const numStr of numbers) {
                const num = parseInt(numStr, 10);
                if (isNaN(num)) {
                    throw new Error(`Invalid decimal number: ${numStr}`);
                }
                if (num < 0 || num > 255) {
                    throw new Error(`Decimal number out of range (0-255): ${num}`);
                }
                hexValues.push(num.toString(16).padStart(2, '0'));
            }

            let result = hexValues.map(h => uppercase ? h.toUpperCase() : h.toLowerCase());
            return formatOutput ? result.join(' ') : result.join('');
        } catch (error) {
            throw new Error(`Decimal to hex conversion failed: ${(error as Error).message}`);
        }
    }

    static hexToDecimal(hex: string): string {
        try {
            const cleanHex = hex.replace(/\s+/g, '').replace(/^0x/i, '').replace(/^0X/i, '');
            
            if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
                throw new Error('Invalid hex string - contains non-hex characters');
            }

            // Split into bytes
            const bytes = [];
            for (let i = 0; i < cleanHex.length; i += 2) {
                const hexByte = cleanHex.substr(i, 2);
                const decimal = parseInt(hexByte, 16);
                bytes.push(decimal.toString());
            }

            return bytes.join(' ');
        } catch (error) {
            throw new Error(`Hex to decimal conversion failed: ${(error as Error).message}`);
        }
    }

    static binaryToHex(binary: string, uppercase: boolean, formatOutput: boolean): string {
        try {
            const cleanBinary = binary.replace(/\s+/g, '');
            
            if (!/^[01]*$/.test(cleanBinary)) {
                throw new Error('Invalid binary string - contains non-binary characters');
            }

            if (cleanBinary.length % 8 !== 0) {
                throw new Error('Binary string length must be a multiple of 8');
            }

            const hexValues: string[] = [];
            for (let i = 0; i < cleanBinary.length; i += 8) {
                const byte = cleanBinary.substr(i, 8);
                const decimal = parseInt(byte, 2);
                const hexByte = decimal.toString(16).padStart(2, '0');
                hexValues.push(uppercase ? hexByte.toUpperCase() : hexByte.toLowerCase());
            }

            return formatOutput ? hexValues.join(' ') : hexValues.join('');
        } catch (error) {
            throw new Error(`Binary to hex conversion failed: ${(error as Error).message}`);
        }
    }

    static hexToBinary(hex: string, formatOutput: boolean): string {
        try {
            const cleanHex = hex.replace(/\s+/g, '').replace(/^0x/i, '').replace(/^0X/i, '');
            
            if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
                throw new Error('Invalid hex string - contains non-hex characters');
            }

            const binaryValues: string[] = [];
            for (let i = 0; i < cleanHex.length; i += 2) {
                const hexByte = cleanHex.substr(i, 2);
                const decimal = parseInt(hexByte, 16);
                const binaryByte = decimal.toString(2).padStart(8, '0');
                binaryValues.push(binaryByte);
            }

            return formatOutput ? binaryValues.join(' ') : binaryValues.join('');
        } catch (error) {
            throw new Error(`Hex to binary conversion failed: ${(error as Error).message}`);
        }
    }

    static getStats(input: string, conversionType: string) {
        const cleanInput = input.replace(/\s+/g, '');
        return {
            length: input.length,
            bytes: Math.ceil(cleanInput.length / 2),
            characters: conversionType.includes('text') ? input.length : undefined
        };
    }
}

export const HexConverterTool: React.FC = () => {
    const [state, setState] = React.useState<HexConverterState>({
        inputText: '',
        outputText: '',
        conversionType: 'text-to-hex',
        error: '',
        formatOutput: true,
        uppercase: true
    });

    const handleConvert = () => {
        try {
            setState(prev => ({ ...prev, error: '', outputText: 'Converting...' }));
            
            let result: string;
            
            switch (state.conversionType) {
                case 'text-to-hex':
                    result = HexConverter.textToHex(state.inputText, state.uppercase, state.formatOutput);
                    break;
                case 'hex-to-text':
                    result = HexConverter.hexToText(state.inputText);
                    break;
                case 'decimal-to-hex':
                    result = HexConverter.decimalToHex(state.inputText, state.uppercase, state.formatOutput);
                    break;
                case 'hex-to-decimal':
                    result = HexConverter.hexToDecimal(state.inputText);
                    break;
                case 'binary-to-hex':
                    result = HexConverter.binaryToHex(state.inputText, state.uppercase, state.formatOutput);
                    break;
                case 'hex-to-binary':
                    result = HexConverter.hexToBinary(state.inputText, state.formatOutput);
                    break;
                default:
                    throw new Error('Unknown conversion type');
            }
            
            setState(prev => ({ 
                ...prev, 
                outputText: result, 
                error: '' 
            }));
        } catch (error) {
            setState(prev => ({ 
                ...prev, 
                error: (error as Error).message, 
                outputText: '' 
            }));
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(state.outputText);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    const handleClear = () => {
        setState(prev => ({
            ...prev,
            inputText: '',
            outputText: '',
            error: ''
        }));
    };

    const handleLoadSample = (type: string) => {
        let sampleText = '';
        
        switch (type) {
            case 'text':
                sampleText = 'Hello, World!';
                break;
            case 'hex':
                sampleText = '48 65 6c 6c 6f 2c 20 57 6f 72 6c 64 21';
                break;
            case 'decimal':
                sampleText = '72 101 108 108 111 44 32 87 111 114 108 100 33';
                break;
            case 'binary':
                sampleText = '01001000 01100101 01101100 01101100 01101111 00101100 00100000 01010111 01101111 01110010 01101100 01100100 00100001';
                break;
        }
        
        setState(prev => ({
            ...prev,
            inputText: sampleText,
            outputText: '',
            error: ''
        }));
    };

    const getInputLabel = () => {
        switch (state.conversionType) {
            case 'text-to-hex':
                return 'Input Text:';
            case 'hex-to-text':
                return 'Input Hex:';
            case 'decimal-to-hex':
                return 'Input Decimal (space-separated):';
            case 'hex-to-decimal':
                return 'Input Hex:';
            case 'binary-to-hex':
                return 'Input Binary (8-bit groups):';
            case 'hex-to-binary':
                return 'Input Hex:';
            default:
                return 'Input:';
        }
    };

    const getOutputLabel = () => {
        switch (state.conversionType) {
            case 'text-to-hex':
                return 'Output Hex:';
            case 'hex-to-text':
                return 'Output Text:';
            case 'decimal-to-hex':
                return 'Output Hex:';
            case 'hex-to-decimal':
                return 'Output Decimal:';
            case 'binary-to-hex':
                return 'Output Hex:';
            case 'hex-to-binary':
                return 'Output Binary:';
            default:
                return 'Output:';
        }
    };

    const stats = HexConverter.getStats(state.inputText, state.conversionType);

    return (
        <HexConverterContainer>
            <h3>Hexadecimal Converter</h3>
            
            <ControlsContainer>
                <ControlGroup>
                    <ContentLabel>Conversion Type:</ContentLabel>
                    <Select
                        value={state.conversionType}
                        onChange={(e) => setState(prev => ({ 
                            ...prev, 
                            conversionType: e.target.value as HexConverterState['conversionType'],
                            outputText: '',
                            error: ''
                        }))}
                    >
                        <option value="text-to-hex">Text → Hex</option>
                        <option value="hex-to-text">Hex → Text</option>
                        <option value="decimal-to-hex">Decimal → Hex</option>
                        <option value="hex-to-decimal">Hex → Decimal</option>
                        <option value="binary-to-hex">Binary → Hex</option>
                        <option value="hex-to-binary">Hex → Binary</option>
                    </Select>
                </ControlGroup>

                <CheckboxContainer>
                    <StyledCheckbox
                        type="checkbox"
                        checked={state.formatOutput}
                        onChange={(e) => setState(prev => ({ 
                            ...prev, 
                            formatOutput: e.target.checked,
                            outputText: ''
                        }))}
                    />
                    <ContentLabel>Format Output</ContentLabel>
                </CheckboxContainer>

                <CheckboxContainer>
                    <StyledCheckbox
                        type="checkbox"
                        checked={state.uppercase}
                        onChange={(e) => setState(prev => ({ 
                            ...prev, 
                            uppercase: e.target.checked,
                            outputText: ''
                        }))}
                    />
                    <ContentLabel>Uppercase</ContentLabel>
                </CheckboxContainer>

                <Button onClick={() => {
                    if (state.conversionType === 'text-to-hex') handleLoadSample('text');
                    else if (state.conversionType === 'hex-to-text') handleLoadSample('hex');
                    else if (state.conversionType === 'decimal-to-hex') handleLoadSample('decimal');
                    else if (state.conversionType === 'binary-to-hex') handleLoadSample('binary');
                    else handleLoadSample('hex');
                }}>
                    Load Sample
                </Button>
            </ControlsContainer>

            <TextAreaContainer>
                <InputSection>
                    <ContentLabel>{getInputLabel()}</ContentLabel>
                    <StyledTextArea
                        value={state.inputText}
                        onChange={(e) => setState(prev => ({ 
                            ...prev, 
                            inputText: e.target.value,
                            outputText: '',
                            error: ''
                        }))}
                        placeholder={
                            state.conversionType === 'text-to-hex' ? 'Enter text to convert to hex...' :
                            state.conversionType === 'hex-to-text' ? 'Enter hex to convert to text...' :
                            state.conversionType === 'decimal-to-hex' ? 'Enter decimal numbers (space-separated)...' :
                            state.conversionType === 'hex-to-decimal' ? 'Enter hex to convert to decimal...' :
                            state.conversionType === 'binary-to-hex' ? 'Enter binary (8-bit groups)...' :
                            'Enter hex to convert to binary...'
                        }
                    />
                </InputSection>

                <OutputSection>
                    <ContentLabel>{getOutputLabel()}</ContentLabel>
                    <StyledTextArea
                        value={state.outputText}
                        readOnly
                        placeholder="Converted data will appear here..."
                    />
                </OutputSection>
            </TextAreaContainer>

            {state.error && (
                <ErrorMessage>
                    {state.error}
                </ErrorMessage>
            )}

            <ActionButtons>
                <Button onClick={handleConvert}>
                    Convert
                </Button>
                <Button onClick={handleCopy} disabled={!state.outputText}>
                    Copy Output
                </Button>
                <Button onClick={handleClear}>
                    Clear
                </Button>
            </ActionButtons>

            {state.inputText && (
                <StatsContainer>
                    <StatCard>
                        <StatLabel>Input Length</StatLabel>
                        <StatValue>{stats.length}</StatValue>
                    </StatCard>
                    <StatCard>
                        <StatLabel>Bytes</StatLabel>
                        <StatValue>{stats.bytes}</StatValue>
                    </StatCard>
                    {stats.characters !== undefined && (
                        <StatCard>
                            <StatLabel>Characters</StatLabel>
                            <StatValue>{stats.characters}</StatValue>
                        </StatCard>
                    )}
                </StatsContainer>
            )}

            <InfoMessage>
                Convert between hexadecimal, text, decimal, and binary formats.
                Supports various formatting options and provides statistics about the conversion.
                Use sample data to see different conversion types in action.
            </InfoMessage>
        </HexConverterContainer>
    );
};
