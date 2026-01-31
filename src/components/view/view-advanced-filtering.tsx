import * as React from 'react';
import { observer } from 'mobx-react';
import { styled, css } from '../../styles';
import { CollectedEvent, HttpExchangeView } from '../../types';
import { FilterSet, StringFilter, emptyFilterSet } from '../../model/filters/search-filters';

interface AdvancedFilteringProps {
    events: CollectedEvent[];
    onFilterChange: (filters: FilterSet) => void;
    currentFilters: FilterSet;
}

interface FilterState {
    methodFilter: string[];
    statusCodeFilter: string[];
    contentTypeFilter: string[];
    urlFilter: string;
    responseTimeFilter: { min: number; max: number } | null;
    sizeFilter: { min: number; max: number } | null;
    hasHeaders: boolean;
    hasBody: boolean;
    isWebSocket: boolean;
    isHttp2: boolean;
    hasErrors: boolean;
    timeRange: { start: Date | null; end: Date | null } | null;
    customFilters: Array<{ id: string; name: string; filter: string; enabled: boolean }>;
    showAdvanced: boolean;
}

const FilteringContainer = styled.div`
    background-color: ${p => (p as any).theme.containerBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 6px;
    margin: 8px 0;
    padding: 12px;
`;

const FilteringHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
`;

const FilteringTitle = styled.h4`
    margin: 0;
    color: ${p => (p as any).theme.mainColor};
    font-size: 14px;
    font-weight: 500;
`;

const ToggleButton = styled.button<{ isExpanded: boolean }>`
    background: none;
    border: none;
    color: ${p => (p as any).theme.lowlightText};
    cursor: pointer;
    font-size: 12px;
    padding: 4px;
    border-radius: 3px;
    transition: all 0.2s ease;

    &:hover {
        background-color: ${p => (p as any).theme.containerBorder};
        color: ${p => (p as any).theme.mainColor};
    }

    ${p => p.isExpanded && css`
        transform: rotate(180deg);
    `}
`;

const FilteringContent = styled.div<{ isExpanded: boolean }>`
    max-height: ${p => p.isExpanded ? '1000px' : '0'};
    overflow: hidden;
    transition: max-height 0.3s ease;
`;

const FilterSection = styled.div`
    margin-bottom: 16px;
`;

const SectionTitle = styled.h5`
    margin: 0 0 8px 0;
    color: ${p => (p as any).theme.mainColor};
    font-size: 13px;
    font-weight: 500;
`;

const FilterGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
`;

const FilterGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
`;

const FilterLabel = styled.label`
    font-size: 11px;
    color: ${p => (p as any).theme.lowlightText};
    font-weight: 500;
`;

const FilterInput = styled.input`
    padding: 6px 8px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 3px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: 11px;

    &:focus {
        outline: none;
        border-color: ${p => (p as any).theme.popColor};
    }
`;

const FilterSelect = styled.select`
    padding: 6px 8px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 3px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: 11px;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: ${p => (p as any).theme.popColor};
    }
`;

const CheckboxGroup = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
`;

const CheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: ${p => (p as any).theme.mainColor};
    cursor: pointer;
`;

const CheckboxInput = styled.input`
    cursor: pointer;
`;

const RangeInput = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const RangeNumber = styled(FilterInput)`
    width: 80px;
`;

const FilterActions = styled.div`
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid ${p => (p as any).theme.containerBorder};
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
    padding: 6px 12px;
    border: 1px solid ${p => (p as any).variant === 'primary' ? (p as any).theme.popColor : (p as any).theme.containerBorder};
    border-radius: 3px;
    background-color: ${p => (p as any).variant === 'primary' ? (p as any).theme.popColor : (p as any).theme.mainBackground};
    color: ${p => (p as any).variant === 'primary' ? 'white' : (p as any).theme.mainColor};
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        opacity: 0.8;
    }
`;

const FilterSummary = styled.div`
    padding: 8px;
    background-color: ${p => (p as any).theme.mainBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    font-size: 11px;
    color: ${p => (p as any).theme.mainColor};
    margin-bottom: 12px;
`;

const FilterTag = styled.span`
    display: inline-block;
    padding: 2px 6px;
    background-color: ${p => (p as any).theme.popColor};
    color: white;
    border-radius: 3px;
    font-size: 10px;
    margin-right: 4px;
    margin-bottom: 4px;
`;

const CustomFilterSection = styled.div`
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid ${p => (p as any).theme.containerBorder};
`;

const CustomFilterItem = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    padding: 8px;
    background-color: ${p => (p as any).theme.mainBackground};
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
`;

const CustomFilterName = styled.input`
    flex: 1;
    padding: 4px 6px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 3px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: 11px;
`;

const CustomFilterExpression = styled.input`
    flex: 2;
    padding: 4px 6px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 3px;
    background-color: ${p => (p as any).theme.mainBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: 11px;
    font-family: ${p => p.theme.monoFontFamily};
`;

const RemoveFilterButton = styled.button`
    padding: 4px;
    border: 1px solid #fcc;
    border-radius: 3px;
    background-color: #fee;
    color: #c33;
    cursor: pointer;
    font-size: 10px;

    &:hover {
        background-color: #fdd;
    }
`;

// Helper functions
const getUniqueMethods = (events: CollectedEvent[]): string[] => {
    const methods = new Set<string>();
    events.forEach(event => {
        if (event.isHttp?.()) {
            methods.add(event.request.method || 'Unknown');
        }
    });
    return Array.from(methods).sort();
};

const getUniqueStatusCodes = (events: CollectedEvent[]): string[] => {
    const codes = new Set<string>();
    events.forEach(event => {
        if (event.isHttp?.()) {
            const response = event.response;
            if (response && response !== 'aborted' && 'statusCode' in response) {
                codes.add(response.statusCode?.toString() || 'Unknown');
            }
        }
    });
    return Array.from(codes).sort((a, b) => parseInt(a) - parseInt(b));
};

const getUniqueContentTypes = (events: CollectedEvent[]): string[] => {
    const types = new Set<string>();
    events.forEach(event => {
        if (event.isHttp?.()) {
            const response = event.response;
            if (response && response !== 'aborted' && 'headers' in response) {
                const contentType = response.headers['content-type']?.split(';')[0];
                if (contentType) {
                    types.add(contentType);
                }
            }
        }
    });
    return Array.from(types).sort();
};

export const ViewAdvancedFiltering: React.FC<AdvancedFilteringProps> = ({
    events,
    onFilterChange,
    currentFilters
}) => {
    const [state, setState] = React.useState<FilterState>({
        methodFilter: [],
        statusCodeFilter: [],
        contentTypeFilter: [],
        urlFilter: '',
        responseTimeFilter: null,
        sizeFilter: null,
        hasHeaders: false,
        hasBody: false,
        isWebSocket: false,
        isHttp2: false,
        hasErrors: false,
        timeRange: null,
        customFilters: [],
        showAdvanced: false
    });

    const uniqueMethods = getUniqueMethods(events);
    const uniqueStatusCodes = getUniqueStatusCodes(events);
    const uniqueContentTypes = getUniqueContentTypes(events);

    const toggleAdvanced = () => {
        setState(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }));
    };

    const updateFilter = (key: keyof FilterState, value: any) => {
        setState(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        const filterExpression = buildFilterExpression();
        const filters: FilterSet = filterExpression 
            ? [new StringFilter(filterExpression)] as FilterSet
            : emptyFilterSet();
        onFilterChange(filters);
    };

    const clearFilters = () => {
        setState({
            methodFilter: [],
            statusCodeFilter: [],
            contentTypeFilter: [],
            urlFilter: '',
            responseTimeFilter: null,
            sizeFilter: null,
            hasHeaders: false,
            hasBody: false,
            isWebSocket: false,
            isHttp2: false,
            hasErrors: false,
            timeRange: null,
            customFilters: [],
            showAdvanced: state.showAdvanced
        });
        onFilterChange(emptyFilterSet());
    };

    const buildFilterExpression = (): string => {
        const parts: string[] = [];

        if (state.methodFilter.length > 0) {
            parts.push(`method:(${state.methodFilter.join(' OR ')})`);
        }

        if (state.statusCodeFilter.length > 0) {
            parts.push(`status:(${state.statusCodeFilter.join(' OR ')})`);
        }

        if (state.contentTypeFilter.length > 0) {
            parts.push(`content-type:(${state.contentTypeFilter.join(' OR ')})`);
        }

        if (state.urlFilter) {
            parts.push(`url:${state.urlFilter}`);
        }

        if (state.responseTimeFilter) {
            const { min, max } = state.responseTimeFilter;
            if (min > 0) parts.push(`response-time:>${min}`);
            if (max < Infinity) parts.push(`response-time:<${max}`);
        }

        if (state.sizeFilter) {
            const { min, max } = state.sizeFilter;
            if (min > 0) parts.push(`size:>${min}`);
            if (max < Infinity) parts.push(`size:<${max}`);
        }

        if (state.hasHeaders) parts.push('has-headers:true');
        if (state.hasBody) parts.push('has-body:true');
        if (state.isWebSocket) parts.push('websocket:true');
        if (state.isHttp2) parts.push('http2:true');
        if (state.hasErrors) parts.push('has-errors:true');

        if (state.timeRange) {
            if (state.timeRange.start) {
                parts.push(`after:${state.timeRange.start.toISOString()}`);
            }
            if (state.timeRange.end) {
                parts.push(`before:${state.timeRange.end.toISOString()}`);
            }
        }

        state.customFilters
            .filter(f => f.enabled)
            .forEach(f => parts.push(f.filter));

        return parts.join(' AND ');
    };

    const addCustomFilter = () => {
        const newFilter = {
            id: Date.now().toString(),
            name: '',
            filter: '',
            enabled: true
        };
        setState(prev => ({
            ...prev,
            customFilters: [...prev.customFilters, newFilter]
        }));
    };

    const updateCustomFilter = (id: string, field: 'name' | 'filter' | 'enabled', value: any) => {
        setState(prev => ({
            ...prev,
            customFilters: prev.customFilters.map(f =>
                f.id === id ? { ...f, [field]: value } : f
            )
        }));
    };

    const removeCustomFilter = (id: string) => {
        setState(prev => ({
            ...prev,
            customFilters: prev.customFilters.filter(f => f.id !== id)
        }));
    };

    const getFilterSummary = () => {
        const filters = [];
        
        if (state.methodFilter.length > 0) filters.push(`Methods: ${state.methodFilter.length}`);
        if (state.statusCodeFilter.length > 0) filters.push(`Status: ${state.statusCodeFilter.length}`);
        if (state.contentTypeFilter.length > 0) filters.push(`Content: ${state.contentTypeFilter.length}`);
        if (state.urlFilter) filters.push('URL');
        if (state.responseTimeFilter) filters.push('Response Time');
        if (state.sizeFilter) filters.push('Size');
        if (state.hasHeaders || state.hasBody || state.isWebSocket || state.isHttp2 || state.hasErrors) {
            filters.push('Properties');
        }
        if (state.timeRange) filters.push('Time Range');
        if (state.customFilters.some(f => f.enabled)) filters.push('Custom');

        return filters;
    };

    return (
        <FilteringContainer>
            <FilteringHeader>
                <FilteringTitle>Advanced Filtering</FilteringTitle>
                <ToggleButton isExpanded={state.showAdvanced} onClick={toggleAdvanced}>
                    ▼
                </ToggleButton>
            </FilteringHeader>

            <FilteringContent isExpanded={state.showAdvanced}>
                {/* Filter Summary */}
                <FilterSummary>
                    <strong>Active Filters:</strong> {getFilterSummary().length > 0 ? 
                        getFilterSummary().map((filter, index) => (
                            <FilterTag key={index}>{filter}</FilterTag>
                        )) : 
                        'No filters applied'
                    }
                </FilterSummary>

                {/* Method Filter */}
                <FilterSection>
                    <SectionTitle>HTTP Methods</SectionTitle>
                    <CheckboxGroup>
                        {uniqueMethods.map(method => (
                            <CheckboxLabel key={method}>
                                <CheckboxInput
                                    type="checkbox"
                                    checked={state.methodFilter.includes(method)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            updateFilter('methodFilter', [...state.methodFilter, method]);
                                        } else {
                                            updateFilter('methodFilter', state.methodFilter.filter(m => m !== method));
                                        }
                                    }}
                                />
                                {method}
                            </CheckboxLabel>
                        ))}
                    </CheckboxGroup>
                </FilterSection>

                {/* Status Code Filter */}
                <FilterSection>
                    <SectionTitle>Status Codes</SectionTitle>
                    <CheckboxGroup>
                        {uniqueStatusCodes.map(code => (
                            <CheckboxLabel key={code}>
                                <CheckboxInput
                                    type="checkbox"
                                    checked={state.statusCodeFilter.includes(code)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            updateFilter('statusCodeFilter', [...state.statusCodeFilter, code]);
                                        } else {
                                            updateFilter('statusCodeFilter', state.statusCodeFilter.filter(c => c !== code));
                                        }
                                    }}
                                />
                                {code}
                            </CheckboxLabel>
                        ))}
                    </CheckboxGroup>
                </FilterSection>

                {/* Content Type Filter */}
                <FilterSection>
                    <SectionTitle>Content Types</SectionTitle>
                    <CheckboxGroup>
                        {uniqueContentTypes.slice(0, 10).map(contentType => (
                            <CheckboxLabel key={contentType}>
                                <CheckboxInput
                                    type="checkbox"
                                    checked={state.contentTypeFilter.includes(contentType)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            updateFilter('contentTypeFilter', [...state.contentTypeFilter, contentType]);
                                        } else {
                                            updateFilter('contentTypeFilter', state.contentTypeFilter.filter(c => c !== contentType));
                                        }
                                    }}
                                />
                                {contentType}
                            </CheckboxLabel>
                        ))}
                    </CheckboxGroup>
                </FilterSection>

                {/* Text Filters */}
                <FilterSection>
                    <SectionTitle>Text Filters</SectionTitle>
                    <FilterGrid>
                        <FilterGroup>
                            <FilterLabel>URL Contains:</FilterLabel>
                            <FilterInput
                                type="text"
                                value={state.urlFilter}
                                onChange={(e) => updateFilter('urlFilter', e.target.value)}
                                placeholder="Enter URL pattern..."
                            />
                        </FilterGroup>
                    </FilterGrid>
                </FilterSection>

                {/* Numeric Range Filters */}
                <FilterSection>
                    <SectionTitle>Numeric Ranges</SectionTitle>
                    <FilterGrid>
                        <FilterGroup>
                            <FilterLabel>Response Time (ms):</FilterLabel>
                            <RangeInput>
                                <RangeNumber
                                    type="number"
                                    placeholder="Min"
                                    value={state.responseTimeFilter?.min || ''}
                                    onChange={(e) => updateFilter('responseTimeFilter', {
                                        ...state.responseTimeFilter,
                                        min: parseInt(e.target.value) || 0
                                    })}
                                />
                                <span>-</span>
                                <RangeNumber
                                    type="number"
                                    placeholder="Max"
                                    value={state.responseTimeFilter?.max === Infinity ? '' : state.responseTimeFilter?.max || ''}
                                    onChange={(e) => updateFilter('responseTimeFilter', {
                                        ...state.responseTimeFilter,
                                        max: parseInt(e.target.value) || Infinity
                                    })}
                                />
                            </RangeInput>
                        </FilterGroup>

                        <FilterGroup>
                            <FilterLabel>Response Size (bytes):</FilterLabel>
                            <RangeInput>
                                <RangeNumber
                                    type="number"
                                    placeholder="Min"
                                    value={state.sizeFilter?.min || ''}
                                    onChange={(e) => updateFilter('sizeFilter', {
                                        ...state.sizeFilter,
                                        min: parseInt(e.target.value) || 0
                                    })}
                                />
                                <span>-</span>
                                <RangeNumber
                                    type="number"
                                    placeholder="Max"
                                    value={state.sizeFilter?.max === Infinity ? '' : state.sizeFilter?.max || ''}
                                    onChange={(e) => updateFilter('sizeFilter', {
                                        ...state.sizeFilter,
                                        max: parseInt(e.target.value) || Infinity
                                    })}
                                />
                            </RangeInput>
                        </FilterGroup>
                    </FilterGrid>
                </FilterSection>

                {/* Property Filters */}
                <FilterSection>
                    <SectionTitle>Properties</SectionTitle>
                    <CheckboxGroup>
                        <CheckboxLabel>
                            <CheckboxInput
                                type="checkbox"
                                checked={state.hasHeaders}
                                onChange={(e) => updateFilter('hasHeaders', e.target.checked)}
                            />
                            Has Headers
                        </CheckboxLabel>
                        <CheckboxLabel>
                            <CheckboxInput
                                type="checkbox"
                                checked={state.hasBody}
                                onChange={(e) => updateFilter('hasBody', e.target.checked)}
                            />
                            Has Body
                        </CheckboxLabel>
                        <CheckboxLabel>
                            <CheckboxInput
                                type="checkbox"
                                checked={state.isWebSocket}
                                onChange={(e) => updateFilter('isWebSocket', e.target.checked)}
                            />
                            WebSocket
                        </CheckboxLabel>
                        <CheckboxLabel>
                            <CheckboxInput
                                type="checkbox"
                                checked={state.isHttp2}
                                onChange={(e) => updateFilter('isHttp2', e.target.checked)}
                            />
                            HTTP/2
                        </CheckboxLabel>
                        <CheckboxLabel>
                            <CheckboxInput
                                type="checkbox"
                                checked={state.hasErrors}
                                onChange={(e) => updateFilter('hasErrors', e.target.checked)}
                            />
                            Has Errors
                        </CheckboxLabel>
                    </CheckboxGroup>
                </FilterSection>

                {/* Custom Filters */}
                <CustomFilterSection>
                    <SectionTitle>Custom Filters</SectionTitle>
                    {state.customFilters.map(filter => (
                        <CustomFilterItem key={filter.id}>
                            <CheckboxInput
                                type="checkbox"
                                checked={filter.enabled}
                                onChange={(e) => updateCustomFilter(filter.id, 'enabled', e.target.checked)}
                            />
                            <CustomFilterName
                                type="text"
                                placeholder="Filter name..."
                                value={filter.name}
                                onChange={(e) => updateCustomFilter(filter.id, 'name', e.target.value)}
                            />
                            <CustomFilterExpression
                                type="text"
                                placeholder="Filter expression..."
                                value={filter.filter}
                                onChange={(e) => updateCustomFilter(filter.id, 'filter', e.target.value)}
                            />
                            <RemoveFilterButton onClick={() => removeCustomFilter(filter.id)}>
                                ×
                            </RemoveFilterButton>
                        </CustomFilterItem>
                    ))}
                    <ActionButton variant="secondary" onClick={addCustomFilter}>
                        + Add Custom Filter
                    </ActionButton>
                </CustomFilterSection>

                {/* Actions */}
                <FilterActions>
                    <ActionButton variant="secondary" onClick={clearFilters}>
                        Clear All
                    </ActionButton>
                    <ActionButton variant="primary" onClick={applyFilters}>
                        Apply Filters
                    </ActionButton>
                </FilterActions>
            </FilteringContent>
        </FilteringContainer>
    );
};
