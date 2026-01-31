/**
 * Standardized state management hooks for tools
 * Provides consistent state patterns across all tool components
 */

import * as React from 'react';

export interface ToolState<T = {}> {
    data: T;
    isLoading: boolean;
    error: string | null;
}

export interface ToolStateOptions<T> {
    initialData: T;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
}

/**
 * Standardized hook for tool state management
 */
export const useToolState = <T>(
    initialData: T,
    options: Partial<ToolStateOptions<T>> = {}
) => {
    const { onSuccess, onError } = options;
    
    const [state, setState] = React.useState<ToolState<T>>({
        data: initialData,
        isLoading: false,
        error: null
    });

    const updateData = React.useCallback((updates: Partial<T>) => {
        setState(prev => ({
            ...prev,
            data: { ...prev.data, ...updates },
            error: null
        }));
    }, []);

    const setLoading = React.useCallback((loading: boolean) => {
        setState(prev => ({ ...prev, isLoading: loading }));
    }, []);

    const setError = React.useCallback((error: string | null) => {
        setState(prev => ({ ...prev, error, isLoading: false }));
        if (error && onError) {
            onError(error);
        }
    }, [onError]);

    const clearError = React.useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    const reset = React.useCallback(() => {
        setState({
            data: initialData,
            isLoading: false,
            error: null
        });
    }, [initialData]);

    const executeAsync = React.useCallback(async <R>(
        asyncFn: (data: T) => Promise<R>,
        options: { showLoading?: boolean } = {}
    ): Promise<R | null> => {
        const { showLoading = true } = options;
        
        try {
            if (showLoading) {
                setLoading(true);
            }
            
            clearError();
            const result = await asyncFn(state.data);
            
            if (onSuccess) {
                onSuccess(state.data);
            }
            
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred';
            setError(errorMessage);
            return null;
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }, [state.data, setLoading, clearError, setError, onSuccess]);

    return {
        data: state.data,
        isLoading: state.isLoading,
        error: state.error,
        updateData,
        setLoading,
        setError,
        clearError,
        reset,
        executeAsync
    };
};

/**
 * Hook for managing input/output state in tools
 */
export const useInputOutputState = (
    initialInput = '',
    initialOutput = '',
    options: Partial<ToolStateOptions<{ input: string; output: string }>> = {}
) => {
    const initialData = { input: initialInput, output: initialOutput };
    
    return useToolState(initialData, {
        ...options,
        initialData
    });
};

/**
 * Hook for managing conversion tools state
 */
export const useConversionState = (
    initialInput = '',
    initialOutput = '',
    conversionType: string = '',
    options: Partial<ToolStateOptions<{ 
        input: string; 
        output: string; 
        conversionType: string 
    }>> = {}
) => {
    const initialData = { 
        input: initialInput, 
        output: initialOutput, 
        conversionType 
    };
    
    return useToolState(initialData, {
        ...options,
        initialData
    });
};

/**
 * Hook for managing form state in tools
 */
export const useFormState = <T extends Record<string, any>>(
    initialForm: T,
    options: Partial<ToolStateOptions<T>> = {}
) => {
    const initialData = initialForm;
    
    const state = useToolState(initialData, {
        ...options,
        initialData
    });

    const updateField = React.useCallback(<K extends keyof T>(
        field: K,
        value: T[K]
    ) => {
        state.updateData({ [field]: value });
    }, [state.updateData]);

    const updateFields = React.useCallback((updates: Partial<T>) => {
        state.updateData(updates);
    }, [state.updateData]);

    const resetForm = React.useCallback(() => {
        state.reset();
    }, [state.reset]);

    return {
        ...state,
        formData: state.data,
        updateField,
        updateFields,
        resetForm
    };
};
