import * as React from 'react';
import styled from 'styled-components';
import { Theme } from '../../styles';
import { Button, Select } from '../common/inputs';
import { ContentLabel, ContentValue } from '../common/text-content';

interface CSVConverterState {
    inputText: string;
    outputText: string;
    conversionType: 'csv-to-json' | 'json-to-csv';
    delimiter: string;
    hasHeaders: boolean;
    error: string;
    formatOutput: boolean;
}

const CSVConverterContainer = styled.div`
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

const DelimiterInput = styled.input`
    width: 60px;
    padding: 6px 8px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.inputBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: 14px;
    text-align: center;
`;

class CSVConverter {
    static csvToJson(csvString: string, delimiter: string, hasHeaders: boolean): any[] {
        try {
            const lines = csvString.split('\n').filter(line => line.trim());
            if (lines.length === 0) {
                return [];
            }

            const result: any[] = [];
            const headers = hasHeaders 
                ? lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''))
                : lines[0].split(delimiter).map((_, i) => `column${i + 1}`);

            const startIndex = hasHeaders ? 1 : 0;

            for (let i = startIndex; i < lines.length; i++) {
                const values = this.parseCSVLine(lines[i], delimiter);
                const obj: any = {};
                
                headers.forEach((header, index) => {
                    obj[header] = values[index] || '';
                });
                
                result.push(obj);
            }

            return result;
        } catch (error) {
            throw new Error(`CSV to JSON conversion failed: ${(error as Error).message}`);
        }
    }

    static parseCSVLine(line: string, delimiter: string): string[] {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === delimiter && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    static jsonToCsv(jsonString: string, delimiter: string): string {
        try {
            const data = JSON.parse(jsonString);
            
            if (!Array.isArray(data)) {
                throw new Error('Input must be an array of objects');
            }

            if (data.length === 0) {
                return '';
            }

            // Get all unique keys from all objects
            const allKeys = new Set<string>();
            data.forEach(obj => {
                if (typeof obj === 'object' && obj !== null) {
                    Object.keys(obj).forEach(key => allKeys.add(key));
                }
            });

            const headers = Array.from(allKeys);
            
            // Create CSV content
            let csv = headers.join(delimiter) + '\n';

            data.forEach(obj => {
                const row = headers.map(header => {
                    const value = obj[header];
                    if (value === null || value === undefined) {
                        return '';
                    }
                    const stringValue = String(value);
                    // Quote values that contain delimiter, quotes, or newlines
                    if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
                        return '"' + stringValue.replace(/"/g, '""') + '"';
                    }
                    return stringValue;
                });
                csv += row.join(delimiter) + '\n';
            });

            return csv;
        } catch (error) {
            throw new Error(`JSON to CSV conversion failed: ${(error as Error).message}`);
        }
    }

    static formatJson(obj: any, indent: number = 2): string {
        return JSON.stringify(obj, null, indent);
    }
}

export const CSVConverterTool: React.FC = () => {
    const [state, setState] = React.useState<CSVConverterState>({
        inputText: '',
        outputText: '',
        conversionType: 'csv-to-json',
        delimiter: ',',
        hasHeaders: true,
        error: '',
        formatOutput: true
    });

    const handleConvert = () => {
        try {
            setState(prev => ({ ...prev, error: '', outputText: 'Converting...' }));
            
            let result: string;
            
            if (state.conversionType === 'csv-to-json') {
                const jsonArray = CSVConverter.csvToJson(state.inputText, state.delimiter, state.hasHeaders);
                result = CSVConverter.formatJson(jsonArray, state.formatOutput ? 2 : 0);
            } else {
                result = CSVConverter.jsonToCsv(state.inputText, state.delimiter);
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

    const handleLoadSample = (type: 'csv' | 'json') => {
        let sampleText = '';
        
        if (type === 'csv') {
            sampleText = `Name,Age,City,Country
John Doe,30,New York,USA
Jane Smith,25,London,UK
Bob Johnson,35,Tokyo,Japan
Alice Brown,28,Paris,France`;
        } else {
            sampleText = `[
  {
    "Name": "John Doe",
    "Age": "30",
    "City": "New York",
    "Country": "USA"
  },
  {
    "Name": "Jane Smith",
    "Age": "25",
    "City": "London",
    "Country": "UK"
  },
  {
    "Name": "Bob Johnson",
    "Age": "35",
    "City": "Tokyo",
    "Country": "Japan"
  },
  {
    "Name": "Alice Brown",
    "Age": "28",
    "City": "Paris",
    "Country": "France"
  }
]`;
        }
        
        setState(prev => ({
            ...prev,
            inputText: sampleText,
            outputText: '',
            error: ''
        }));
    };

    const handleDelimiterChange = (newDelimiter: string) => {
        setState(prev => ({
            ...prev,
            delimiter: newDelimiter,
            outputText: '',
            error: ''
        }));
    };

    return (
        <CSVConverterContainer>
            <h3>CSV ↔ JSON Converter</h3>
            
            <ControlsContainer>
                <ControlGroup>
                    <ContentLabel>Conversion Type:</ContentLabel>
                    <Select
                        value={state.conversionType}
                        onChange={(e) => setState(prev => ({ 
                            ...prev, 
                            conversionType: e.target.value as 'csv-to-json' | 'json-to-csv',
                            outputText: '',
                            error: ''
                        }))}
                    >
                        <option value="csv-to-json">CSV → JSON</option>
                        <option value="json-to-csv">JSON → CSV</option>
                    </Select>
                </ControlGroup>

                <ControlGroup>
                    <ContentLabel>Delimiter:</ContentLabel>
                    <Select
                        value={state.delimiter}
                        onChange={(e) => handleDelimiterChange(e.target.value)}
                    >
                        <option value=",">Comma (,)</option>
                        <option value=";">Semicolon (;)</option>
                        <option value="\t">Tab (\t)</option>
                        <option value="|">Pipe (|)</option>
                        <option value="custom">Custom</option>
                    </Select>
                    {state.delimiter === 'custom' && (
                        <DelimiterInput
                            value={state.delimiter}
                            onChange={(e) => handleDelimiterChange(e.target.value)}
                            placeholder="|"
                            maxLength={1}
                        />
                    )}
                </ControlGroup>

                {state.conversionType === 'csv-to-json' && (
                    <CheckboxContainer>
                        <StyledCheckbox
                            type="checkbox"
                            checked={state.hasHeaders}
                            onChange={(e) => setState(prev => ({ 
                                ...prev, 
                                hasHeaders: e.target.checked,
                                outputText: ''
                            }))}
                        />
                        <ContentLabel>First Row is Headers</ContentLabel>
                    </CheckboxContainer>
                )}

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

                <Button onClick={() => handleLoadSample(state.conversionType === 'csv-to-json' ? 'csv' : 'json')}>
                    Load Sample
                </Button>
            </ControlsContainer>

            <TextAreaContainer>
                <InputSection>
                    <ContentLabel>
                        {state.conversionType === 'csv-to-json' ? 'Input CSV:' : 'Input JSON:'}
                    </ContentLabel>
                    <StyledTextArea
                        value={state.inputText}
                        onChange={(e) => setState(prev => ({ 
                            ...prev, 
                            inputText: e.target.value,
                            outputText: '',
                            error: ''
                        }))}
                        placeholder={state.conversionType === 'csv-to-json' 
                            ? 'Enter CSV data to convert to JSON...'
                            : 'Enter JSON array to convert to CSV...'
                        }
                    />
                </InputSection>

                <OutputSection>
                    <ContentLabel>
                        {state.conversionType === 'csv-to-json' ? 'Output JSON:' : 'Output CSV:'}
                    </ContentLabel>
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

            <InfoMessage>
                Convert between CSV and JSON formats. 
                Supports custom delimiters and header detection.
                CSV values containing delimiters, quotes, or newlines are automatically quoted.
            </InfoMessage>
        </CSVConverterContainer>
    );
};
