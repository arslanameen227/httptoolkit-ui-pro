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

interface MarkdownPreviewState {
    input: string;
    html: string;
    error: string;
    success: string;
    theme: 'light' | 'dark';
    customCSS: string;
    useCustomCSS: boolean;
    exportFormat: 'html' | 'pdf';
    isPreviewMode: boolean;
}

const MarkdownPreviewContainer = styled.div`
    padding: 20px;
    max-width: 1400px;
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
    gap: 20px;
`;

const EditorContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    min-height: 600px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        min-height: 400px;
    }
`;

const EditorSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
`;

const SectionTitle = styled.h3`
    margin: 0;
    color: ${p => (p as any).theme.mainColor};
    font-size: 16px;
    font-weight: 500;
`;

const EditorTextArea = styled.textarea`
    flex: 1;
    width: 100%;
    padding: 16px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 6px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-family: ${p => p.theme.monoFontFamily};
    font-size: 13px;
    line-height: 1.5;
    resize: vertical;
    min-height: 400px;

    &:focus {
        outline: none;
        border-color: ${p => (p as any).theme.popColor};
    }
`;

const PreviewContainer = styled.div`
    flex: 1;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 6px;
    background-color: ${p => (p as any).theme.mainBackground};
    overflow: hidden;
    display: flex;
    flex-direction: column;
`;

const PreviewHeader = styled.div`
    padding: 12px 16px;
    background-color: ${p => (p as any).theme.containerBackground};
    border-bottom: 1px solid ${p => (p as any).theme.containerBorder};
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const PreviewContent = styled.div<{ previewTheme?: 'light' | 'dark' }>`
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background-color: ${p => p.previewTheme === 'dark' ? '#1e1e1e' : '#ffffff'};
    color: ${p => p.previewTheme === 'dark' ? '#d4d4d4' : '#333333'};

    /* Markdown styling */
    h1, h2, h3, h4, h5, h6 {
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
    }

    h1 { font-size: 2em; border-bottom: 1px solid ${p => p.previewTheme === 'dark' ? '#333' : '#eee'}; padding-bottom: 8px; }
    h2 { font-size: 1.5em; border-bottom: 1px solid ${p => p.previewTheme === 'dark' ? '#333' : '#eee'}; padding-bottom: 6px; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1em; }
    h5 { font-size: 0.875em; }
    h6 { font-size: 0.85em; }

    p {
        margin-bottom: 16px;
        line-height: 1.6;
    }

    code {
        background-color: ${p => p.previewTheme === 'dark' ? '#2d2d2d' : '#f5f5f5'};
        padding: 2px 4px;
        border-radius: 3px;
        font-family: ${p => p.theme.monoFontFamily};
        font-size: 0.9em;
    }

    pre {
        background-color: ${p => p.previewTheme === 'dark' ? '#2d2d2d' : '#f5f5f5'};
        padding: 16px;
        border-radius: 6px;
        overflow-x: auto;
        margin-bottom: 16px;

        code {
            background: none;
            padding: 0;
            font-size: 0.9em;
        }
    }

    blockquote {
        border-left: 4px solid ${p => (p as any).theme.popColor};
        padding-left: 16px;
        margin: 16px 0;
        font-style: italic;
        color: ${p => p.previewTheme === 'dark' ? '#b0b0b0' : '#666'};
    }

    ul, ol {
        margin-bottom: 16px;
        padding-left: 24px;
    }

    li {
        margin-bottom: 4px;
    }

    table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 16px;
    }

    th, td {
        border: 1px solid ${p => p.previewTheme === 'dark' ? '#444' : '#ddd'};
        padding: 8px 12px;
        text-align: left;
    }

    th {
        background-color: ${p => p.previewTheme === 'dark' ? '#2d2d2d' : '#f5f5f5'};
        font-weight: 600;
    }

    a {
        color: ${p => (p as any).theme.popColor};
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }

    img {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
    }

    hr {
        border: none;
        border-top: 1px solid ${p => p.previewTheme === 'dark' ? '#444' : '#ddd'};
        margin: 24px 0;
    }
`;

const ControlsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
`;

const ThemeSelector = styled.div`
    display: flex;
    gap: 8px;
`;

const ThemeButton = styled.button<{ active?: boolean }>`
    padding: 6px 12px;
    border: 1px solid ${p => p.active ? (p as any).theme.popColor : (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => p.active ? (p as any).theme.popColor : (p as any).theme.mainBackground};
    color: ${p => p.active ? 'white' : (p as any).theme.mainColor};
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        opacity: 0.8;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 8px;
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

const CustomCSSSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const CSSToggle = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: ${p => (p as any).theme.mainColor};
`;

const Checkbox = styled.input`
    cursor: pointer;
`;

const CSSTextArea = styled.textarea`
    width: 100%;
    min-height: 100px;
    padding: 12px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-family: ${p => p.theme.monoFontFamily};
    font-size: 12px;
    resize: vertical;

    &:focus {
        outline: none;
        border-color: ${p => (p as any).theme.popColor};
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

const FullscreenButton = styled.button`
    padding: 6px 12px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: 12px;
    cursor: pointer;

    &:hover {
        background-color: ${p => (p as any).theme.containerBackground};
    }
`;

// Simple markdown parser (basic implementation)
const parseMarkdown = (markdown: string): string => {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // Code blocks
    html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr>');
    html = html.replace(/^\*\*\*$/gim, '<hr>');
    
    // Lists
    html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
    html = html.replace(/^- (.+)$/gim, '<li>$1</li>');
    html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');
    
    // Wrap lists in ul/ol tags
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    html = html.replace(/<ul>(<ul>.*<\/ul>)<\/ul>/g, '<ol>$1</ol>');
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    
    // Wrap in paragraphs
    html = '<p>' + html + '</p>';
    
    // Clean up double tags
    html = html.replace(/<\/p><p><\/p>/g, '</p>');
    html = html.replace(/<p><\/p>/g, '');
    
    return html;
};

export const MarkdownPreviewTool: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
    const [state, setState] = React.useState<MarkdownPreviewState>({
        input: `# Markdown Preview Tool

## Features

This is a **live markdown preview** tool with the following features:

- **Real-time preview** as you type
- **Syntax highlighting** for code blocks
- **Export to HTML** and PDF
- **Custom CSS** support
- **Light and dark themes**

## Code Example

\`\`\`javascript
function hello(name) {
    console.log(\`Hello, \${name}!\`);
}

hello('World');
\`\`\`

## Links and Images

[Visit HTTP Toolkit](https://httptoolkit.tech)

> This is a blockquote for important information.

## Lists

### Unordered List
- Item 1
- Item 2
- Item 3

### Ordered List
1. First item
2. Second item
3. Third item

---

## Tables

| Feature | Status |
|---------|--------|
| Markdown parsing | ✅ Done |
| Export functionality | 🚧 In progress |
| Custom themes | 📋 Planned |`,
        html: '',
        error: '',
        success: '',
        theme: 'light',
        customCSS: '',
        useCustomCSS: false,
        exportFormat: 'html',
        isPreviewMode: false
    });

    const updatePreview = React.useCallback((input: string) => {
        try {
            const html = parseMarkdown(input);
            setState(prev => ({ ...prev, html, error: '' }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to parse markdown',
                html: ''
            }));
        }
    }, []);

    React.useEffect(() => {
        updatePreview(state.input);
    }, [state.input, updatePreview]);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setState(prev => ({ ...prev, success: 'Copied to clipboard!', error: '' }));
            setTimeout(() => setState(prev => ({ ...prev, success: '' })), 3000);
        } catch (err) {
            setState(prev => ({ ...prev, error: 'Failed to copy to clipboard', success: '' }));
        }
    };

    const exportAsHTML = () => {
        try {
            const css = state.useCustomCSS ? state.customCSS : getDefaultCSS(state.theme);
            const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Export</title>
    <style>${css}</style>
</head>
<body>
    <div class="markdown-content">
        ${state.html}
    </div>
</body>
</html>`;
            
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'markdown-export.html';
            a.click();
            URL.revokeObjectURL(url);
            
            setState(prev => ({ ...prev, success: 'HTML exported successfully!', error: '' }));
            setTimeout(() => setState(prev => ({ ...prev, success: '' })), 3000);
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to export HTML',
                success: ''
            }));
        }
    };

    const exportAsPDF = () => {
        // For now, we'll open in a new window and let user print to PDF
        // In a real implementation, you'd use a library like jsPDF or puppeteer
        const css = state.useCustomCSS ? state.customCSS : getDefaultCSS(state.theme);
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Export</title>
    <style>${css}</style>
</head>
<body>
    <div class="markdown-content">
        ${state.html}
    </div>
</body>
</html>`;
        
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.write(html);
            newWindow.document.close();
            setState(prev => ({ ...prev, success: 'Opened in new window - use Ctrl+P to save as PDF', error: '' }));
            setTimeout(() => setState(prev => ({ ...prev, success: '' })), 5000);
        } else {
            setState(prev => ({ ...prev, error: 'Failed to open new window for PDF export', success: '' }));
        }
    };

    const getDefaultCSS = (theme: 'light' | 'dark'): string => {
        return theme === 'dark' ? `
            body { background-color: #1e1e1e; color: #d4d4d4; }
            .markdown-content { max-width: 800px; margin: 0 auto; padding: 20px; }
        ` : `
            body { background-color: #ffffff; color: #333333; }
            .markdown-content { max-width: 800px; margin: 0 auto; padding: 20px; }
        `;
    };

    const clearAll = () => {
        setState(prev => ({
            ...prev,
            input: '',
            html: '',
            error: '',
            success: ''
        }));
    };

    return (
        <MarkdownPreviewContainer>
            <ToolHeader>
                <ToolTitle>{tool.name}</ToolTitle>
                <ToolDescription>{tool.description}</ToolDescription>
            </ToolHeader>

            <ToolContent>
                {/* Controls */}
                <ControlsContainer>
                    <ThemeSelector>
                        <ThemeButton 
                            active={state.theme === 'light'}
                            onClick={() => setState(prev => ({ ...prev, theme: 'light' }))}
                        >
                            ☀️ Light
                        </ThemeButton>
                        <ThemeButton 
                            active={state.theme === 'dark'}
                            onClick={() => setState(prev => ({ ...prev, theme: 'dark' }))}
                        >
                            🌙 Dark
                        </ThemeButton>
                    </ThemeSelector>

                    <ButtonGroup>
                        <Button onClick={() => copyToClipboard(state.html)}>
                            Copy HTML
                        </Button>
                        <Button onClick={exportAsHTML}>
                            Export HTML
                        </Button>
                        <Button onClick={exportAsPDF}>
                            Export PDF
                        </Button>
                        <Button onClick={clearAll}>
                            Clear All
                        </Button>
                    </ButtonGroup>
                </ControlsContainer>

                {/* Custom CSS Section */}
                <CustomCSSSection>
                    <CSSToggle>
                        <Checkbox
                            type="checkbox"
                            checked={state.useCustomCSS}
                            onChange={(e) => setState(prev => ({ ...prev, useCustomCSS: e.target.checked }))}
                        />
                        Use Custom CSS
                    </CSSToggle>
                    {state.useCustomCSS && (
                        <CSSTextArea
                            value={state.customCSS}
                            onChange={(e) => setState(prev => ({ ...prev, customCSS: e.target.value }))}
                            placeholder="Enter custom CSS here..."
                        />
                    )}
                </CustomCSSSection>

                {/* Messages */}
                {state.error && <ErrorMessage>{state.error}</ErrorMessage>}
                {state.success && <SuccessMessage>{state.success}</SuccessMessage>}

                {/* Editor and Preview */}
                <EditorContainer>
                    <EditorSection>
                        <SectionHeader>
                            <SectionTitle>Markdown Editor</SectionTitle>
                        </SectionHeader>
                        <EditorTextArea
                            value={state.input}
                            onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
                            placeholder="Enter your markdown here..."
                        />
                    </EditorSection>

                    <EditorSection>
                        <SectionHeader>
                            <SectionTitle>Live Preview</SectionTitle>
                            <FullscreenButton onClick={() => setState(prev => ({ ...prev, isPreviewMode: !prev.isPreviewMode }))}>
                                {state.isPreviewMode ? 'Exit Fullscreen' : 'Fullscreen'}
                            </FullscreenButton>
                        </SectionHeader>
                        <PreviewContainer>
                            <PreviewContent 
                                previewTheme={state.theme}
                                dangerouslySetInnerHTML={{ 
                                    __html: state.useCustomCSS && state.customCSS ? 
                                        `<style>${state.customCSS}</style>${state.html}` : 
                                        state.html 
                                }}
                            />
                        </PreviewContainer>
                    </EditorSection>
                </EditorContainer>
            </ToolContent>
        </MarkdownPreviewContainer>
    );
};
