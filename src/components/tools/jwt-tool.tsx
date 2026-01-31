import * as React from 'react';
import { observer } from 'mobx-react';
import { styled } from '../../styles';

// JWT Decoder Tool Component
const JWTToolContainer = styled.div`
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
    flex-direction: column;
    flex: 1;
    gap: 20px;
    min-height: 0;
`;

const InputSection = styled.div`
    display: flex;
    flex-direction: column;
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

const ResultsSection = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
`;

const JWTCard = styled.div`
    padding: 16px;
    background-color: ${p => (p as any).theme.containerBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    margin-bottom: 16px;
`;

const JWTHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
`;

const JWTTitle = styled.h4`
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: ${p => (p as any).theme.mainColor};
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

const JWTContent = styled.div`
    background-color: ${p => (p as any).theme.mainBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    padding: 12px;
    font-family: ${p => (p as any).theme.monoFontFamily};
    font-size: 12px;
    color: ${p => (p as any).theme.mainColor};
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 200px;
    overflow-y: auto;
`;

const ErrorMessage = styled.div`
    padding: 12px;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 4px;
    color: #dc2626;
    font-size: 13px;
    margin-bottom: 16px;
`;

const SuccessMessage = styled.div`
    padding: 12px;
    background-color: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 4px;
    color: #16a34a;
    font-size: 13px;
    margin-bottom: 16px;
`;

const ValidationSection = styled.div`
    padding: 16px;
    background-color: ${p => (p as any).theme.containerBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    margin-bottom: 16px;
`;

const ValidationItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid ${p => (p as any).theme.containerBorder};

    &:last-child {
        border-bottom: none;
    }
`;

const ValidationValue = styled.span<{ valid?: boolean }>`
    font-size: 13px;
    color: ${p => (p as any).valid ? '#16a34a' : '#dc2626'};
    font-weight: 600;
`;

const ValidationLabel = styled.span`
    font-size: 13px;
    color: ${p => (p as any).theme.mainColor};
    font-weight: 500;
`;

const ClaimsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 12px;
    margin-top: 12px;
`;

const ClaimCard = styled.div`
    padding: 8px;
    background-color: ${p => (p as any).theme.mainBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
`;

const ClaimKey = styled.div`
    font-size: 11px;
    color: ${p => (p as any).theme.lowlightText};
    margin-bottom: 2px;
`;

interface JWTDecoded {
    header: any;
    payload: any;
    signature: string;
    valid: boolean;
    error?: string;
}

const ClaimValue = styled.div`
    font-size: 12px;
    color: ${p => (p as any).theme.mainColor};
    word-break: break-all;
`;

interface JWTToolState {
    input: string;
    decoded: JWTDecoded | null;
    error: string | null;
    success: string | null;
    validating: boolean;
}

    export const JWTTool: React.FC = () => {
    const [state, setState] = React.useState<JWTToolState>({
        input: '',
        decoded: null,
        error: null,
        success: null,
        validating: false
    });

    const decodeJWT = React.useCallback(() => {
        if (!state.input.trim()) {
            setState(prev => ({
                ...prev,
                decoded: null,
                error: null,
                success: null
            }));
            return;
        }
            
            try {
            const parts = state.input.split('.');
            
            if (parts.length !== 3) {
                throw new Error('Invalid JWT format. Expected 3 parts separated by dots.');
            }

            const header = JSON.parse(atob(parts[0]));
            const payload = JSON.parse(atob(parts[1]));
            const signature = parts[2];

            setState(prev => ({
                ...prev,
                decoded: {
                    header,
                    payload,
                    signature,
                    valid: false
                },
                error: null,
                success: 'JWT decoded successfully!'
            }));

            validateJWT(parts[0], parts[1], signature);
        } catch (error) {
            setState(prev => ({
                ...prev,
                decoded: null,
                error: `Failed to decode JWT: ${error instanceof Error ? error.message : 'Unknown error'}`,
                success: null
            }));
        }
    }, [state.input]);

    const validateJWT = React.useCallback(async (headerB64: string, payloadB64: string, signature: string) => {
        setState(prev => ({ ...prev, validating: true }));

        // Basic validation - in a real implementation, you'd verify with the actual secret/key
        setTimeout(() => {
            // For demo purposes, we'll just check if signature exists and has reasonable length
            const isValid = signature.length > 0 && signature.length < 1000;
            
            setState(prev => ({
                ...prev,
                validating: false,
                decoded: prev.decoded ? {
                    ...prev.decoded,
                    valid: isValid
                } : null
            }));
        }, 500);
    }, []);

    const copyToClipboard = React.useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setState(prev => ({
                ...prev,
                success: 'Copied to clipboard!'
            }));
            
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
    }, []);

    const clearAll = React.useCallback(() => {
        setState({
            input: '',
            decoded: null,
            error: null,
            success: null,
            validating: false
        });
    }, []);

    const loadSample = React.useCallback(() => {
        const sampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        
        setState(prev => ({
            ...prev,
            input: sampleJWT,
            decoded: null,
            error: null,
            success: 'Sample JWT loaded!'
        }));
    }, []);

    const formatTimestamp = (timestamp: number): string => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    const renderClaims = (claims: any): JSX.Element => {
        const claimEntries = Object.entries(claims);
        
        return (
            <ClaimsGrid>
                {claimEntries.map(([key, value]) => (
                    <ClaimCard key={key}>
                        <ClaimKey>{key}</ClaimKey>
                        <ClaimValue>
                            {typeof value === 'object' 
                                ? JSON.stringify(value, null, 2)
                                : String(value)
                            }
                        </ClaimValue>
                    </ClaimCard>
                ))}
            </ClaimsGrid>
        );
    };

    // Auto-decode on input change
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (state.input) {
                decodeJWT();
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [state.input, decodeJWT]);

    return (
        <JWTToolContainer>
            <ToolHeader>
                <ToolTitle>JWT Decoder</ToolTitle>
                <ToolDescription>
                    Decode and validate JSON Web Tokens (JWT) with detailed payload analysis
                </ToolDescription>
            </ToolHeader>

            {state.error && <ErrorMessage>{state.error}</ErrorMessage>}
            {state.success && <SuccessMessage>{state.success}</SuccessMessage>}

            <ToolContent>
                <InputSection>
                    <SectionHeader>
                        <SectionTitle>JWT Token</SectionTitle>
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
                            decoded: null,
                            error: null,
                            success: null
                        }))}
                        placeholder="Paste your JWT token here..."
                        spellCheck={false}
                    />
                </InputSection>

                {state.decoded && (
                    <ResultsSection>
                        <SectionHeader>
                            <SectionTitle>Decoded JWT</SectionTitle>
                            <Button onClick={decodeJWT} variant="primary">
                                Refresh Decode
                            </Button>
                        </SectionHeader>

                        <ValidationSection>
                            <JWTHeader>
                                <JWTTitle>Validation Status</JWTTitle>
                            </JWTHeader>
                            <ValidationItem>
                                <ValidationLabel>Format:</ValidationLabel>
                                <ValidationValue valid={true}>Valid JWT Structure</ValidationValue>
                            </ValidationItem>
                            <ValidationItem>
                                <ValidationLabel>Signature:</ValidationLabel>
                                <ValidationValue valid={state.decoded.valid}>
                                    {state.validating ? 'Validating...' : state.decoded.valid ? 'Present' : 'Invalid'}
                                </ValidationValue>
                            </ValidationItem>
                            <ValidationItem>
                                <ValidationLabel>Algorithm:</ValidationLabel>
                                <ValidationValue>{state.decoded.header.alg || 'Unknown'}</ValidationValue>
                            </ValidationItem>
                            <ValidationItem>
                                <ValidationLabel>Token Type:</ValidationLabel>
                                <ValidationValue>{state.decoded.header.typ || 'JWT'}</ValidationValue>
                            </ValidationItem>
                        </ValidationSection>

                        <JWTCard>
                            <JWTHeader>
                                <JWTTitle>Header</JWTTitle>
                                <Button onClick={() => copyToClipboard(JSON.stringify(state.decoded?.header, null, 2))}>
                                    Copy
                                </Button>
                            </JWTHeader>
                            <JWTContent>
                                {JSON.stringify(state.decoded?.header, null, 2)}
                            </JWTContent>
                        </JWTCard>

                        <JWTCard>
                            <JWTHeader>
                                <JWTTitle>Payload (Claims)</JWTTitle>
                                <Button onClick={() => copyToClipboard(JSON.stringify(state.decoded?.payload, null, 2))}>
                                    Copy
                                </Button>
                            </JWTHeader>
                            <JWTContent>
                                {JSON.stringify(state.decoded?.payload, null, 2)}
                            </JWTContent>
                            {state.decoded?.payload && renderClaims(state.decoded.payload)}
                        </JWTCard>

                        <JWTCard>
                            <JWTHeader>
                                <JWTTitle>Signature</JWTTitle>
                                <Button onClick={() => copyToClipboard(state.decoded?.signature || '')}>
                                    Copy
                                </Button>
                            </JWTHeader>
                            <JWTContent>
                                {state.decoded?.signature || ''}
                            </JWTContent>
                        </JWTCard>

                        {/* Time-based claims analysis */}
                        {state.decoded?.payload && (
                            <ValidationSection>
                                <JWTHeader>
                                    <JWTTitle>Time Analysis</JWTTitle>
                                </JWTHeader>
                                {state.decoded.payload.iat && (
                                    <ValidationItem>
                                        <ValidationLabel>Issued At (iat):</ValidationLabel>
                                        <ValidationValue>
                                            {formatTimestamp(state.decoded.payload.iat)}
                                        </ValidationValue>
                                    </ValidationItem>
                                )}
                                {state.decoded.payload.exp && (
                                    <ValidationItem>
                                        <ValidationLabel>Expires At (exp):</ValidationLabel>
                                        <ValidationValue>
                                            {formatTimestamp(state.decoded.payload.exp)}
                                            {Date.now() > state.decoded.payload.exp * 1000 && ' (EXPIRED)'}
                                        </ValidationValue>
                                    </ValidationItem>
                                )}
                                {state.decoded.payload.nbf && (
                                    <ValidationItem>
                                        <ValidationLabel>Not Before (nbf):</ValidationLabel>
                                        <ValidationValue>
                                            {formatTimestamp(state.decoded.payload.nbf)}
                                            {Date.now() < state.decoded.payload.nbf * 1000 && ' (NOT YET VALID)'}
                                        </ValidationValue>
                                    </ValidationItem>
                                )}
                            </ValidationSection>
                        )}
                    </ResultsSection>
                )}
            </ToolContent>
        </JWTToolContainer>
    );
};
