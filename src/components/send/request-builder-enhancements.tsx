import * as React from 'react';
import { observer } from 'mobx-react';
import { styled } from '../../styles';
import { Icon } from '../../icons';
import { Method } from 'mockttp';
import * as HarFormat from 'har-format';
import { parseCurlCommand } from 'curl-as-har-request';

interface RequestBuilderEnhancementsProps {
    method: string;
    url: string;
    updateMethod: (method: string) => void;
    updateUrl: (url: string) => void;
    onImportFromCurl: (curlCommand: string) => void;
    onExportAsCurl: () => void;
    onValidateRequest: () => void;
}

interface EnhancementState {
    showCurlImporter: boolean;
    curlCommand: string;
    showUrlValidator: boolean;
    urlValidationResult: { isValid: boolean; message: string } | null;
    showMethodSuggestions: boolean;
    recentUrls: string[];
    recentMethods: string[];
}

const EnhancementsContainer = styled.div`
    background-color: ${p => (p as any).theme.containerBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 6px;
    margin: 8px 0;
    padding: 12px;
`;

const EnhancementHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
`;

const EnhancementTitle = styled.h4`
    margin: 0;
    color: ${p => (p as any).theme.mainColor};
    font-size: 14px;
    font-weight: 500;
`;

const EnhancementControls = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
`;

const EnhancementButton = styled.button<{ variant?: 'primary' | 'secondary' | 'success' | 'warning' }>`
    padding: 6px 12px;
    border: 1px solid ${p => {
        switch (p.variant) {
            case 'primary': return (p as any).theme.popColor;
            case 'success': return '#4CAF50';
            case 'warning': return '#FF9800';
            default: return (p as any).theme.containerBorder;
        }
    }};
    border-radius: 4px;
    background-color: ${p => {
        switch (p.variant) {
            case 'primary': return (p as any).theme.popColor;
            case 'success': return '#4CAF50';
            case 'warning': return '#FF9800';
            default: return (p as any).theme.mainBackground;
        }
    }};
    color: ${p => {
        switch (p.variant) {
            case 'primary':
            case 'success':
            case 'warning':
                return 'white';
            default:
                return (p as any).theme.mainColor;
        }
    }};
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 4px;

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

const CurlImporter = styled.div`
    margin-top: 12px;
    padding: 12px;
    background-color: ${p => (p as any).theme.mainBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
`;

const CurlTextArea = styled.textarea`
    width: 100%;
    min-height: 100px;
    padding: 8px;
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

const CurlActions = styled.div`
    display: flex;
    gap: 8px;
    margin-top: 8px;
    justify-content: flex-end;
`;

const UrlValidator = styled.div`
    margin-top: 12px;
    padding: 12px;
    background-color: ${p => (p as any).theme.mainBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
`;

const ValidationMessage = styled.div<{ isValid: boolean }>`
    padding: 8px;
    border-radius: 4px;
    font-size: 12px;
    margin-top: 8px;
    background-color: ${p => p.isValid ? '#e8f5e8' : '#fee'};
    border: 1px solid ${p => p.isValid ? '#4CAF50' : '#fcc'};
    color: ${p => p.isValid ? '#2e7d32' : '#c33'};
`;

const MethodSuggestions = styled.div`
    margin-top: 12px;
    padding: 12px;
    background-color: ${p => (p as any).theme.mainBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
`;

const MethodGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 8px;
    margin-top: 8px;
`;

const MethodSuggestion = styled.button<{ method: string }>`
    padding: 8px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => {
        const methodColor = getMethodColor(p.method);
        return methodColor + '20'; // Add transparency
    }};
    color: ${p => getMethodColor(p.method)};
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${p => getMethodColor(p.method)};
        color: white;
        transform: translateY(-1px);
    }
`;

const RecentItems = styled.div`
    margin-top: 12px;
    padding: 12px;
    background-color: ${p => (p as any).theme.mainBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
`;

const RecentList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 8px;
    max-height: 150px;
    overflow-y: auto;
`;

const RecentItem = styled.div`
    padding: 6px 8px;
    border-radius: 3px;
    font-size: 11px;
    color: ${p => (p as any).theme.mainColor};
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: ${p => p.theme.monoFontFamily};
    word-break: break-all;

    &:hover {
        background-color: ${p => (p as any).theme.containerBackground};
    }
`;

const ErrorMessage = styled.div`
    padding: 8px;
    background-color: #fee;
    border: 1px solid #fcc;
    border-radius: 4px;
    color: #c33;
    font-size: 12px;
    margin-top: 8px;
`;

const SuccessMessage = styled.div`
    padding: 8px;
    background-color: #efe;
    border: 1px solid #cfc;
    border-radius: 4px;
    color: #3c3;
    font-size: 12px;
    margin-top: 8px;
`;

// Helper function to get method color
const getMethodColor = (method: string): string => {
    const colors: Record<string, string> = {
        GET: '#4CAF50',
        POST: '#2196F3',
        PUT: '#FF9800',
        DELETE: '#F44336',
        PATCH: '#9C27B0',
        HEAD: '#607D8B',
        OPTIONS: '#795548',
        CONNECT: '#009688',
        TRACE: '#FFC107'
    };
    return colors[method] || '#666';
};

// URL validation function
const validateUrl = (url: string): { isValid: boolean; message: string } => {
    try {
        const urlObj = new URL(url);
        
        if (!urlObj.protocol || !urlObj.host) {
            return { isValid: false, message: 'Invalid URL: missing protocol or host' };
        }
        
        if (!['http:', 'https:', 'ws:', 'wss:'].includes(urlObj.protocol)) {
            return { isValid: false, message: 'Invalid protocol: only HTTP/HTTPS/WebSocket are supported' };
        }
        
        if (urlObj.pathname.length > 2048) {
            return { isValid: false, message: 'URL path too long (max 2048 characters)' };
        }
        
        return { isValid: true, message: 'URL is valid' };
    } catch (error) {
        return { isValid: false, message: 'Invalid URL format' };
    }
};

// Generate cURL command
const generateCurlCommand = (method: string, url: string): string => {
    return `curl -X ${method} '${url}'`;
};

export const RequestBuilderEnhancements: React.FC<RequestBuilderEnhancementsProps> = ({
    method,
    url,
    updateMethod,
    updateUrl,
    onImportFromCurl,
    onExportAsCurl,
    onValidateRequest
}) => {
    const [state, setState] = React.useState<EnhancementState>({
        showCurlImporter: false,
        curlCommand: '',
        showUrlValidator: false,
        urlValidationResult: null,
        showMethodSuggestions: false,
        recentUrls: [],
        recentMethods: []
    });

    // Load recent items from localStorage
    React.useEffect(() => {
        try {
            const recentUrls = JSON.parse(localStorage.getItem('httptoolkit-recent-urls') || '[]');
            const recentMethods = JSON.parse(localStorage.getItem('httptoolkit-recent-methods') || '[]');
            setState(prev => ({ ...prev, recentUrls, recentMethods }));
        } catch (error) {
            // Ignore localStorage errors
        }
    }, []);

    // Save to localStorage when URL or method changes
    React.useEffect(() => {
        if (url) {
            const newRecentUrls = [url, ...state.recentUrls.filter(u => u !== url)].slice(0, 10);
            setState(prev => ({ ...prev, recentUrls: newRecentUrls }));
            localStorage.setItem('httptoolkit-recent-urls', JSON.stringify(newRecentUrls));
        }
    }, [url]);

    React.useEffect(() => {
        if (method) {
            const newRecentMethods = [method, ...state.recentMethods.filter(m => m !== method)].slice(0, 10);
            setState(prev => ({ ...prev, recentMethods: newRecentMethods }));
            localStorage.setItem('httptoolkit-recent-methods', JSON.stringify(newRecentMethods));
        }
    }, [method]);

    const toggleCurlImporter = () => {
        setState(prev => ({ ...prev, showCurlImporter: !prev.showCurlImporter }));
    };

    const toggleUrlValidator = () => {
        setState(prev => ({ ...prev, showUrlValidator: !prev.showUrlValidator }));
    };

    const toggleMethodSuggestions = () => {
        setState(prev => ({ ...prev, showMethodSuggestions: !prev.showMethodSuggestions }));
    };

    const importFromCurl = () => {
        try {
            const harRequests = parseCurlCommand(state.curlCommand);
            if (harRequests && harRequests.length > 0) {
                const firstRequest = harRequests[0];
                if (firstRequest.url) {
                    updateMethod(firstRequest.method || 'GET');
                    updateUrl(firstRequest.url || '');
                }
                onImportFromCurl(state.curlCommand);
                setState(prev => ({ ...prev, showCurlImporter: false, curlCommand: '' }));
            }
        } catch (error) {
            // Error will be shown in the UI
        }
    };

    const exportAsCurl = () => {
        const curlCommand = generateCurlCommand(method, url);
        navigator.clipboard.writeText(curlCommand).then(() => {
            onExportAsCurl();
        }).catch(() => {
            // Handle clipboard error
        });
    };

    const validateCurrentUrl = () => {
        const result = validateUrl(url);
        setState(prev => ({ ...prev, urlValidationResult: result }));
        onValidateRequest();
    };

    const selectRecentUrl = (recentUrl: string) => {
        updateUrl(recentUrl);
    };

    const selectRecentMethod = (recentMethod: string) => {
        updateMethod(recentMethod);
    };

    const selectMethodSuggestion = (suggestedMethod: string) => {
        updateMethod(suggestedMethod);
    };

    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE'];

    return (
        <EnhancementsContainer>
            <EnhancementHeader>
                <EnhancementTitle>Request Builder Tools</EnhancementTitle>
            </EnhancementHeader>

            <EnhancementControls>
                <EnhancementButton variant="primary" onClick={toggleCurlImporter}>
                    <Icon icon={['fas', 'terminal']} />
                    Import cURL
                </EnhancementButton>
                <EnhancementButton variant="secondary" onClick={exportAsCurl} disabled={!url}>
                    <Icon icon={['far', 'copy']} />
                    Export cURL
                </EnhancementButton>
                <EnhancementButton variant="success" onClick={toggleUrlValidator}>
                    <Icon icon={['fas', 'check-circle']} />
                    Validate URL
                </EnhancementButton>
                <EnhancementButton variant="warning" onClick={toggleMethodSuggestions}>
                    <Icon icon={['fas', 'list']} />
                    Method Guide
                </EnhancementButton>
            </EnhancementControls>

            {/* cURL Importer */}
            {state.showCurlImporter && (
                <CurlImporter>
                    <EnhancementTitle>Import from cURL Command</EnhancementTitle>
                    <CurlTextArea
                        value={state.curlCommand}
                        onChange={(e) => setState(prev => ({ ...prev, curlCommand: e.target.value }))}
                        placeholder="Paste your cURL command here..."
                    />
                    <CurlActions>
                        <EnhancementButton variant="secondary" onClick={toggleCurlImporter}>
                            Cancel
                        </EnhancementButton>
                        <EnhancementButton variant="primary" onClick={importFromCurl} disabled={!state.curlCommand}>
                            Import Request
                        </EnhancementButton>
                    </CurlActions>
                </CurlImporter>
            )}

            {/* URL Validator */}
            {state.showUrlValidator && (
                <UrlValidator>
                    <EnhancementTitle>URL Validation</EnhancementTitle>
                    <EnhancementButton variant="primary" onClick={validateCurrentUrl} disabled={!url}>
                        Validate Current URL
                    </EnhancementButton>
                    {state.urlValidationResult && (
                        <ValidationMessage isValid={state.urlValidationResult.isValid}>
                            {state.urlValidationResult.message}
                        </ValidationMessage>
                    )}
                </UrlValidator>
            )}

            {/* Method Suggestions */}
            {state.showMethodSuggestions && (
                <MethodSuggestions>
                    <EnhancementTitle>HTTP Method Suggestions</EnhancementTitle>
                    <MethodGrid>
                        {httpMethods.map(suggestedMethod => (
                            <MethodSuggestion
                                key={suggestedMethod}
                                method={suggestedMethod}
                                onClick={() => selectMethodSuggestion(suggestedMethod)}
                            >
                                {suggestedMethod}
                            </MethodSuggestion>
                        ))}
                    </MethodGrid>
                </MethodSuggestions>
            )}

            {/* Recent URLs */}
            {state.recentUrls.length > 0 && (
                <RecentItems>
                    <EnhancementTitle>Recent URLs</EnhancementTitle>
                    <RecentList>
                        {state.recentUrls.map((recentUrl, index) => (
                            <RecentItem
                                key={`${recentUrl}-${index}`}
                                onClick={() => selectRecentUrl(recentUrl)}
                            >
                                {recentUrl}
                            </RecentItem>
                        ))}
                    </RecentList>
                </RecentItems>
            )}

            {/* Recent Methods */}
            {state.recentMethods.length > 0 && (
                <RecentItems>
                    <EnhancementTitle>Recent Methods</EnhancementTitle>
                    <MethodGrid>
                        {state.recentMethods.map((recentMethod, index) => (
                            <MethodSuggestion
                                key={`${recentMethod}-${index}`}
                                method={recentMethod}
                                onClick={() => selectRecentMethod(recentMethod)}
                            >
                                {recentMethod}
                            </MethodSuggestion>
                        ))}
                    </MethodGrid>
                </RecentItems>
            )}
        </EnhancementsContainer>
    );
};
