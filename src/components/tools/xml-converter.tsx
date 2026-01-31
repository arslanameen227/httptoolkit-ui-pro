import * as React from 'react';
import styled from 'styled-components';
import { Theme } from '../../styles';
import { Button, Select } from '../common/inputs';
import { ContentLabel, ContentValue } from '../common/text-content';
import { ThemeProps } from '../../styles/theme-utils';
import { useErrorHandler, ErrorMessages } from '../../utils/error-handling';

interface ToolDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    component: React.ComponentType<any>;
}

interface XMLConverterState {
    inputText: string;
    outputText: string;
    conversionType: 'xml-to-json' | 'json-to-xml';
    formatOutput: boolean;
}

const XMLConverterContainer = styled.div<ThemeProps>`
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
`;

// ===== LAYOUT COMPONENTS =====
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
    min-width: 200px;
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

// ===== UI ELEMENTS =====
const StyledTextArea = styled.textarea<ThemeProps>`
    flex: 1;
    min-height: 250px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    border: 1px solid ${p => p.theme.containerBorder};
    border-radius: 4px;
    padding: 8px;
    background-color: ${p => p.theme.mainBackground};
    color: ${p => p.theme.mainColor};
    resize: vertical;
    
    &:focus {
        outline: none;
        border-color: ${p => p.theme.popColor};
    }
    
    &::placeholder {
        color: ${p => p.theme.lowlightText};
    }
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
    margin-top: 16px;
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

// ===== MESSAGES =====
const ErrorMessage = styled.div<ThemeProps>`
    color: ${p => p.theme.warningColor};
    background-color: ${p => p.theme.highlightBackground};
    padding: 8px;
    border-radius: 4px;
    margin-top: 8px;
`;

const InfoMessage = styled.div<ThemeProps>`
    color: ${p => p.theme.lowlightText};
    font-size: 12px;
    margin-top: 8px;
`;

class XMLConverter {
    static xmlToJson(xmlString: string): any {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");
            
            // Check for parsing errors
            const parseError = xmlDoc.getElementsByTagName("parsererror");
            if (parseError.length > 0) {
                throw new Error("Invalid XML format");
            }

            const xmlToJson = (node: Node): any => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const textContent = node.textContent?.trim();
                    return textContent ? textContent : null;
                }

                if (node.nodeType !== Node.ELEMENT_NODE) {
                    return null;
                }

                const element = node as Element;
                const result: any = {};

                // Handle attributes
                if (element.attributes.length > 0) {
                    result["@attributes"] = {};
                    for (let i = 0; i < element.attributes.length; i++) {
                        const attr = element.attributes[i];
                        result["@attributes"][attr.nodeName] = attr.nodeValue;
                    }
                }

                // Handle child nodes
                const children = element.childNodes;
                if (children.length === 0) {
                    return result;
                }

                let hasOnlyText = true;
                const childObjects: any[] = [];

                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    if (child.nodeType === Node.ELEMENT_NODE) {
                        hasOnlyText = false;
                        const childJson = xmlToJson(child);
                        if (childJson !== null) {
                            childObjects.push({
                                name: child.nodeName,
                                value: childJson
                            });
                        }
                    }
                }

                if (hasOnlyText) {
                    const textContent = element.textContent?.trim();
                    if (textContent && Object.keys(result).length === 0) {
                        return textContent;
                    } else if (textContent) {
                        result["#text"] = textContent;
                    }
                } else {
                    // Process child elements
                    for (const childObj of childObjects) {
                        if (result[childObj.name]) {
                            if (!Array.isArray(result[childObj.name])) {
                                result[childObj.name] = [result[childObj.name]];
                            }
                            result[childObj.name].push(childObj.value);
                        } else {
                            result[childObj.name] = childObj.value;
                        }
                    }
                }

                return Object.keys(result).length === 0 ? null : result;
            };

            const jsonResult = xmlToJson(xmlDoc.documentElement);
            return jsonResult || {};
        } catch (error) {
            throw new Error(`XML to JSON conversion failed: ${(error as Error).message}`);
        }
    }

    static jsonToJsonString(obj: any, indent: number = 2): string {
        return JSON.stringify(obj, null, indent);
    }

    static jsonToXml(jsonString: string): string {
        try {
            const jsonObj = JSON.parse(jsonString);
            return this.objectToXml(jsonObj, "root");
        } catch (error) {
            throw new Error(`JSON to XML conversion failed: ${(error as Error).message}`);
        }
    }

    static objectToXml(obj: any, rootName: string, indent: number = 0): string {
        const indentStr = "  ".repeat(indent);
        let xml = `${indentStr}<${rootName}>`;

        if (obj === null || obj === undefined) {
            xml += `</${rootName}>`;
            return xml;
        }

        if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") {
            xml += this.escapeXml(String(obj));
            xml += `</${rootName}>`;
            return xml;
        }

        if (Array.isArray(obj)) {
            xml += "\n";
            for (const item of obj) {
                xml += this.objectToXml(item, "item", indent + 1) + "\n";
            }
            xml += indentStr + `</${rootName}>`;
            return xml;
        }

        if (typeof obj === "object") {
            xml += "\n";
            
            // Handle attributes if present
            if (obj["@attributes"]) {
                const attrs = obj["@attributes"];
                const parts = xml.split(">");
                parts[0] += " " + Object.entries(attrs)
                    .map(([key, value]) => `${key}="${this.escapeXml(String(value))}"`)
                    .join(" ");
                xml = parts.join(">");
                delete obj["@attributes"];
            }

            // Handle text content
            if (obj["#text"]) {
                xml += this.escapeXml(String(obj["#text"]));
                delete obj["#text"];
            }

            // Handle child elements
            for (const [key, value] of Object.entries(obj)) {
                if (value !== null && value !== undefined) {
                    xml += this.objectToXml(value, key, indent + 1) + "\n";
                }
            }
            
            xml += indentStr + `</${rootName}>`;
            return xml;
        }

        xml += `</${rootName}>`;
        return xml;
    }

    static escapeXml(text: string): string {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    static formatXml(xmlString: string): string {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");
            const serializer = new XMLSerializer();
            let xml = serializer.serializeToString(xmlDoc);
            
            // Simple formatting - add line breaks and indentation
            xml = xml.replace(/></g, ">\n<");
            const lines = xml.split('\n');
            let indent = 0;
            const formattedLines: string[] = [];
            
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                
                if (trimmed.startsWith('</')) {
                    indent = Math.max(0, indent - 1);
                }
                
                formattedLines.push("  ".repeat(indent) + trimmed);
                
                if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
                    indent++;
                }
            }
            
            return formattedLines.join('\n');
        } catch (error) {
            return xmlString; // Return original if formatting fails
        }
    }
}

export const XMLConverterTool: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
    const [state, setState] = React.useState<XMLConverterState>({
        inputText: '',
        outputText: '',
        conversionType: 'xml-to-json',
        formatOutput: true
    });

    const { error, isError, handleError, clearError } = useErrorHandler();

    const handleConvert = () => {
        clearError();
        
        try {
            setState(prev => ({ ...prev, outputText: 'Converting...' }));
            
            let result: string;
            
            if (state.conversionType === 'xml-to-json') {
                const jsonObj = XMLConverter.xmlToJson(state.inputText);
                result = XMLConverter.jsonToJsonString(jsonObj, state.formatOutput ? 2 : 0);
            } else {
                result = XMLConverter.jsonToXml(state.inputText);
                if (state.formatOutput) {
                    result = XMLConverter.formatXml(result);
                }
            }
            
            setState(prev => ({ 
                ...prev, 
                outputText: result
            }));
        } catch (error) {
            handleError(error, { fallbackMessage: ErrorMessages.CONVERSION_ERROR });
            setState(prev => ({ ...prev, outputText: '' }));
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(state.outputText);
        } catch (error) {
            handleError(error, { fallbackMessage: ErrorMessages.CLIPBOARD_ERROR });
        }
    };

    const handleClear = () => {
        clearError();
        setState(prev => ({
            ...prev,
            inputText: '',
            outputText: ''
        }));
    };

    const handleLoadSample = () => {
        clearError();
        const sampleText = state.conversionType === 'xml-to-json' 
            ? `<?xml version="1.0" encoding="UTF-8"?>
<book>
    <title>Sample Book</title>
    <author>John Doe</author>
    <year>2023</year>
</book>`
            : `{
    "title": "Sample Book",
    "author": "John Doe",
    "year": 2023
}`;
        
        setState(prev => ({
            ...prev,
            inputText: sampleText,
            outputText: ''
        }));
    };

    return (
        <XMLConverterContainer>
            <h3>XML ↔ JSON Converter</h3>
            
            <ControlsContainer>
                <ControlGroup>
                    <ContentLabel>Conversion Type:</ContentLabel>
                    <Select
                        value={state.conversionType}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setState(prev => ({ 
                            ...prev, 
                            conversionType: e.target.value as 'xml-to-json' | 'json-to-xml',
                            outputText: '',
                            error: ''
                        }))}
                    >
                        <option value="xml-to-json">XML → JSON</option>
                        <option value="json-to-xml">JSON → XML</option>
                    </Select>
                </ControlGroup>

                <CheckboxContainer>
                    <StyledCheckbox
                        type="checkbox"
                        checked={state.formatOutput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setState(prev => ({ 
                            ...prev, 
                            formatOutput: e.target.checked,
                            outputText: ''
                        }))}
                    />
                    <ContentLabel>Format Output</ContentLabel>
                </CheckboxContainer>

                <Button onClick={() => handleLoadSample()}>
                    Load Sample
                </Button>
            </ControlsContainer>

            <TextAreaContainer>
                <InputSection>
                    <ContentLabel>
                        {state.conversionType === 'xml-to-json' ? 'Input XML:' : 'Input JSON:'}
                    </ContentLabel>
                    <StyledTextArea
                        value={state.inputText}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setState(prev => ({ 
                            ...prev, 
                            inputText: e.target.value,
                            outputText: '',
                            error: ''
                        }))}
                        placeholder={state.conversionType === 'xml-to-json' 
                            ? 'Enter XML data to convert to JSON...'
                            : 'Enter JSON data to convert to XML...'
                        }
                    />
                </InputSection>

                <OutputSection>
                    <ContentLabel>
                        {state.conversionType === 'xml-to-json' ? 'Output JSON:' : 'Output XML:'}
                    </ContentLabel>
                    <StyledTextArea
                        value={state.outputText}
                        readOnly
                        placeholder="Converted data will appear here..."
                    />
                </OutputSection>
            </TextAreaContainer>

            {isError && (
                <ErrorMessage>
                    {error}
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
                Convert between XML and JSON formats. 
                XML attributes are preserved as "@attributes" in JSON.
                Use sample data to see the conversion in action.
            </InfoMessage>
        </XMLConverterContainer>
    );
};
