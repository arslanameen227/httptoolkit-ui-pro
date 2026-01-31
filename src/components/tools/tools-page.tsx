import * as React from 'react';
import { styled } from '../../styles';
import { observer } from 'mobx-react';
import { ThemeProps } from '../../styles/theme-utils';

// Enhanced tools page with improved UI/UX
const ToolsContainer = styled.div<ThemeProps>`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: linear-gradient(135deg, ${p => p.theme.mainBackground} 0%, ${p => p.theme.containerBackground} 100%);
    color: ${p => p.theme.mainColor};
`;

const ToolsHeader = styled.div<ThemeProps>`
    padding: 24px 32px;
    background: linear-gradient(135deg, ${p => p.theme.mainLowlightBackground} 0%, ${p => p.theme.containerBackground} 100%);
    border-bottom: 1px solid ${p => p.theme.containerBorder};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
`;

const ToolsTitle = styled.h1<ThemeProps>`
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, ${p => p.theme.popColor}, ${p => p.theme.mainColor});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
`;

const ToolsSubtitle = styled.p<ThemeProps>`
    margin: 0;
    font-size: 16px;
    color: ${p => p.theme.mainLowlightColor};
    font-weight: 400;
`;

const ToolsContent = styled.div`
    display: flex;
    flex: 1;
    overflow: hidden;
`;

const ToolsSidebar = styled.div<ThemeProps>`
    width: 280px;
    border-right: 1px solid ${p => p.theme.containerBorder};
    background-color: ${p => p.theme.containerBackground};
    overflow-y: auto;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
`;

const ToolsWorkspace = styled.div<ThemeProps>`
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: ${p => p.theme.mainBackground};
`;

const ToolCategory = styled.div`
    padding: 20px 0;
`;

const CategoryTitle = styled.h3`
    margin: 0 20px 16px 20px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    color: ${p => (p as any).theme.lowlightText};
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const CategoryIcon = styled.span`
    font-size: 14px;
`;

const ToolItem = styled.button<{ active?: boolean } & ThemeProps>`
    width: 100%;
    padding: 12px 20px;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    font-size: 14px;
    color: ${p => p.active ? p.theme.popColor : p.theme.mainColor};
    border-left: 4px solid ${p => p.active ? p.theme.popColor : 'transparent'};
    background: linear-gradient(90deg, ${p => p.active ? p.theme.popColor + '15' : 'transparent'} 0%, transparent 100%);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
    
    &:hover {
        background: linear-gradient(90deg, ${p => p.theme.popColor}10 0%, transparent 100%);
        color: ${p => p.theme.popColor};
        border-left-color: ${p => p.theme.popColor};
        transform: translateX(2px);
    }

    &:focus {
        outline: none;
        box-shadow: inset 0 0 0 2px ${p => p.theme.popColor}40;
    }
`;

const ToolIcon = styled.span`
    font-size: 18px;
    width: 20px;
    text-align: center;
    flex-shrink: 0;
`;

const ToolInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const ToolName = styled.div`
    font-weight: 500;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ToolDescription = styled.div<ThemeProps>`
    font-size: 11px;
    color: ${p => p.theme.mainLowlightColor};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

interface ToolDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'json' | 'crypto' | 'jwt' | 'timestamp' | 'conversion' | 'markdown' | 'uuid' | 'color';
    component: React.ComponentType<any>;
}

// Tool categories and tools
const TOOLS_CATEGORIES = {
    json: {
        title: 'JSON Tools',
        tools: [
            {
                id: 'json-beautifier',
                name: 'JSON Beautifier',
                description: 'Format and prettify JSON data',
                icon: '📝',
                category: 'json' as const
            },
            {
                id: 'json-validator',
                name: 'JSON Validator',
                description: 'Validate JSON syntax and structure',
                icon: '✅',
                category: 'json' as const
            }
        ]
    },
    markdown: {
        title: 'Markdown Tools',
        tools: [
            {
                id: 'markdown-preview',
                name: 'Markdown Preview',
                description: 'Live preview with syntax highlighting and export',
                icon: '📄',
                category: 'markdown' as const
            }
        ]
    },
    crypto: {
        title: 'Encryption & Decryption',
        tools: [
            {
                id: 'base64-encoder',
                name: 'Base64 Encoder/Decoder',
                description: 'Encode and decode Base64 data',
                icon: '🔐',
                category: 'crypto' as const
            },
            {
                id: 'url-encoder-decoder',
                name: 'URL Encoder/Decoder',
                description: 'Encode and decode URL strings with different encoding schemes',
                icon: '🔗',
                category: 'crypto' as const
            },
            {
                id: 'hash-generator',
                name: 'Hash Generator',
                description: 'Generate MD5, SHA1, SHA256 hashes',
                icon: '#️⃣',
                category: 'crypto' as const
            },
            {
                id: 'aes-encryptor',
                name: 'AES Encryptor',
                description: 'Encrypt/decrypt with AES',
                icon: '🔒',
                category: 'crypto' as const
            }
        ]
    },
    jwt: {
        title: 'JWT Tools',
        tools: [
            {
                id: 'jwt-decoder',
                name: 'JWT Decoder',
                description: 'Decode and validate JWT tokens',
                icon: '🎫',
                category: 'jwt' as const
            },
            {
                id: 'jwt-generator',
                name: 'JWT Generator',
                description: 'Generate custom JWT tokens',
                icon: '🎟️',
                category: 'jwt' as const
            }
        ]
    },
    timestamp: {
        title: 'Timestamp Tools',
        tools: [
            {
                id: 'timestamp-converter',
                name: 'Timestamp Converter',
                description: 'Convert between timestamp formats',
                icon: '⏰',
                category: 'timestamp' as const
            },
            {
                id: 'duration-calculator',
                name: 'Duration Calculator',
                description: 'Calculate time differences',
                icon: '⏱️',
                category: 'timestamp' as const
            }
        ]
    },
    uuid: {
        title: 'UUID Tools',
        tools: [
            {
                id: 'uuid-generator',
                name: 'UUID Generator',
                description: 'Generate UUIDs in multiple versions and formats',
                icon: '🆔',
                category: 'uuid' as const
            }
        ]
    },
    color: {
        title: 'Color Tools',
        tools: [
            {
                id: 'color-converter',
                name: 'Color Converter',
                description: 'Convert between HEX, RGB, HSL, CMYK color formats',
                icon: '🎨',
                category: 'color' as const
            }
        ]
    },
    conversion: {
        title: 'Data Conversion',
        tools: [
            {
                id: 'xml-converter',
                name: 'XML Converter',
                description: 'Convert XML to JSON and vice versa',
                icon: '📄',
                category: 'conversion' as const
            },
            {
                id: 'csv-converter',
                name: 'CSV Converter',
                description: 'Convert CSV to JSON and vice versa',
                icon: '📊',
                category: 'conversion' as const
            },
            {
                id: 'hex-converter',
                name: 'Hex Converter',
                description: 'Convert between hex and text',
                icon: '🔢',
                category: 'conversion' as const
            },
            {
                id: 'qr-code-generator',
                name: 'QR Code Generator',
                description: 'Generate QR codes from text or URLs',
                icon: '📱',
                category: 'conversion' as const
            }
        ]
    }
};

// Import actual tool components
import { JSONBeautifierTool } from './json-beautifier';
import { JSONValidatorTool } from './json-validator';
import { Base64Tool } from './base64-tool';
import { HashTool } from './hash-tool';
import { JWTTool } from './jwt-tool';
import { TimestampTool } from './timestamp-tool';
import { URLEncoderDecoderTool } from './url-encoder-decoder';
import { MarkdownPreviewTool } from './markdown-preview';
import { UUIDGeneratorTool } from './uuid-generator';
import { ColorConverterTool } from './color-converter';
import { QRCodeGeneratorTool } from './qr-code-generator';
import { AESEncryptorTool } from './aes-encryptor';
import { JWTGeneratorTool } from './jwt-generator';
import { DurationCalculatorTool } from './duration-calculator';
import { XMLConverterTool } from './xml-converter';
import { CSVConverterTool } from './csv-converter';
import { HexConverterTool } from './hex-converter';

// Tool component mapping - using actual components
const TOOL_COMPONENTS: Record<string, React.ComponentType<any>> = {
    'json-beautifier': JSONBeautifierTool,
    'json-validator': JSONValidatorTool,
    'base64-encoder': Base64Tool,
    'hash-generator': HashTool,
    'jwt-decoder': JWTTool,
    'timestamp-converter': TimestampTool,
    'url-encoder-decoder': URLEncoderDecoderTool,
    'markdown-preview': MarkdownPreviewTool,
    'uuid-generator': UUIDGeneratorTool,
    'color-converter': ColorConverterTool,
    'qr-code-generator': QRCodeGeneratorTool,
    'aes-encryptor': AESEncryptorTool,
    'jwt-generator': JWTGeneratorTool,
    'duration-calculator': DurationCalculatorTool,
    'xml-converter': XMLConverterTool,
    'csv-converter': CSVConverterTool,
    'hex-converter': HexConverterTool
};

const ToolsPageComponent = () => {
    const [selectedTool, setSelectedTool] = React.useState<string>('json-beautifier');
    const [tools] = React.useState(() => {
        const allTools: ToolDefinition[] = [];
        Object.values(TOOLS_CATEGORIES).forEach(category => {
            allTools.push(...category.tools.map(tool => ({
                ...tool,
                component: TOOL_COMPONENTS[tool.id]
            })));
        });
        return allTools;
    });

    const selectedToolDefinition = tools.find(tool => tool.id === selectedTool);

    return (
        <ToolsContainer>
            <ToolsHeader>
                <HeaderContent>
                    <div>
                        <ToolsTitle>Web Development Tools</ToolsTitle>
                        <ToolsSubtitle>Professional utilities for developers and designers</ToolsSubtitle>
                    </div>
                </HeaderContent>
            </ToolsHeader>

            <ToolsContent>
                <ToolsSidebar>
                    {tools.map(tool => (
                        <ToolItem
                            key={tool.id}
                            active={selectedTool === tool.id}
                            onClick={() => setSelectedTool(tool.id)}
                        >
                            <ToolIcon>{tool.icon}</ToolIcon>
                            <ToolInfo>
                                <ToolName>{tool.name}</ToolName>
                                <ToolDescription>{tool.description}</ToolDescription>
                            </ToolInfo>
                        </ToolItem>
                    ))}
                </ToolsSidebar>

                <ToolsWorkspace>
                    {selectedToolDefinition && (
                        <selectedToolDefinition.component tool={selectedToolDefinition} />
                    )}
                </ToolsWorkspace>
            </ToolsContent>
        </ToolsContainer>
    );
};

// Export categories and component mapping for barrel exports
export { TOOLS_CATEGORIES, TOOL_COMPONENTS };

export const ToolsPage = ToolsPageComponent;
