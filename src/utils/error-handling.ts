import * as React from 'react';

export interface ErrorState {
    error: string | null;
    isError: boolean;
}

export interface ErrorHandlingOptions {
    showToast?: boolean;
    logToConsole?: boolean;
    fallbackMessage?: string;
}

/**
 * Creates a standardized error handler for React components
 */
export const createErrorHandler = (
    setState: React.Dispatch<React.SetStateAction<ErrorState>>,
    options: ErrorHandlingOptions = {}
) => {
    const {
        showToast = false,
        logToConsole = true,
        fallbackMessage = 'An unexpected error occurred'
    } = options;

    return (error: unknown) => {
        const message = error instanceof Error ? error.message : fallbackMessage;
        
        if (logToConsole) {
            console.error('Error occurred:', error);
        }

        setState(prev => ({ 
            ...prev, 
            error: message,
            isError: true 
        }));

        if (showToast) {
            // TODO: Implement toast notification system
            console.warn('Toast notifications not implemented yet');
        }
    };
};

/**
 * Creates a standardized error clear function
 */
export const createErrorClearer = (
    setState: React.Dispatch<React.SetStateAction<ErrorState>>
) => {
    return () => {
        setState(prev => ({ 
            ...prev, 
            error: null,
            isError: false 
        }));
    };
};

/**
 * Wraps async functions with standardized error handling
 */
export const withErrorHandling = async <T>(
    asyncFn: () => Promise<T>,
    errorHandler: (error: unknown) => void
): Promise<T | null> => {
    try {
        return await asyncFn();
    } catch (error) {
        errorHandler(error);
        return null;
    }
};

/**
 * Standard error messages for common scenarios
 */
export const ErrorMessages = {
    NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
    VALIDATION_ERROR: 'Invalid input. Please check your data and try again.',
    PERMISSION_ERROR: 'You don\'t have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'Server error occurred. Please try again later.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    CLIPBOARD_ERROR: 'Failed to copy to clipboard. Please try again.',
    FILE_READ_ERROR: 'Failed to read file. Please check the file format.',
    FILE_WRITE_ERROR: 'Failed to save file. Please check your permissions.',
    PARSE_ERROR: 'Failed to parse data. Please check the format.',
    ENCRYPTION_ERROR: 'Encryption failed. Please check your inputs.',
    DECRYPTION_ERROR: 'Decryption failed. Please check your inputs.',
    CONVERSION_ERROR: 'Data conversion failed. Please check your inputs.',
} as const;

/**
 * Type guard for Error objects
 */
export const isError = (error: unknown): error is Error => {
    return error instanceof Error;
};

/**
 * Extracts error message from unknown error type
 */
export const getErrorMessage = (error: unknown, fallback: string = ErrorMessages.UNKNOWN_ERROR): string => {
    if (isError(error)) {
        return error.message;
    }
    
    if (typeof error === 'string') {
        return error;
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
    }
    
    return fallback;
};

/**
 * React hook for standardized error handling
 */
export const useErrorHandler = (initialState: ErrorState = { error: null, isError: false }) => {
    const [errorState, setErrorState] = React.useState<ErrorState>(initialState);
    
    const handleError = React.useCallback((error: unknown, options?: ErrorHandlingOptions) => {
        const handler = createErrorHandler(setErrorState, options);
        handler(error);
    }, []);
    
    const clearError = React.useCallback(() => {
        const clearer = createErrorClearer(setErrorState);
        clearer();
    }, []);
    
    const withError = React.useCallback(async <T>(
        asyncFn: () => Promise<T>
    ): Promise<T | null> => {
        return withErrorHandling(asyncFn, handleError);
    }, [handleError]);
    
    return {
        error: errorState.error,
        isError: errorState.isError,
        handleError,
        clearError,
        withError
    };
};
