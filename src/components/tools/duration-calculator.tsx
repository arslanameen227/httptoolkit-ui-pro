import * as React from 'react';
import styled from 'styled-components';
import { Theme } from '../../styles';
import { Button, Select } from '../common/inputs';
import { ContentLabel, ContentValue } from '../common/text-content';

interface DurationCalculatorState {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    result: {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        totalSeconds: number;
        totalMinutes: number;
        totalHours: number;
        workingDays: number;
        weekends: number;
    };
    error: string;
}

const DurationCalculatorContainer = styled.div`
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const ControlsContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 24px;
`;

const DateTimeGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 8px;
    background-color: ${p => (p as any).theme.containerBackground};
`;

const DateTimeTitle = styled.h4`
    margin: 0 0 8px 0;
    color: ${p => (p as any).theme.mainColor};
`;

const DateTimeInputs = styled.div`
    display: flex;
    gap: 12px;
`;

const DateTimeInput = styled.input`
    flex: 1;
    padding: 8px 12px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.inputBackground};
    color: ${p => (p as any).theme.mainColor};
    font-size: 14px;
`;

const ResultContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
`;

const ResultCard = styled.div`
    padding: 16px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 8px;
    background-color: ${p => (p as any).theme.containerBackground};
`;

const ResultTitle = styled.div`
    font-size: 12px;
    color: ${p => (p as any).theme.lowlightText};
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const ResultValue = styled.div`
    font-size: 24px;
    font-weight: 600;
    color: ${p => (p as any).theme.popColor};
`;

const ResultSubtext = styled.div`
    font-size: 12px;
    color: ${p => (p as any).theme.lowlightText};
    margin-top: 4px;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
`;

const QuickButtons = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
`;

const QuickButton = styled.button`
    padding: 6px 12px;
    border: 1px solid ${p => (p as any).theme.containerBorder};
    border-radius: 4px;
    background-color: ${p => (p as any).theme.inputBackground};
    color: ${p => (p as any).theme.mainColor};
    cursor: pointer;
    font-size: 12px;
    
    &:hover {
        background-color: ${p => (p as any).theme.highlightBackground};
    }
`;

const ErrorMessage = styled.div`
    color: ${p => (p as any).theme.warningColor};
    padding: 8px;
    background-color: ${p => (p as any).theme.highlightBackground};
    border-radius: 4px;
    margin-bottom: 16px;
`;

const InfoMessage = styled.div`
    color: ${p => (p as any).theme.lowlightText};
    font-size: 12px;
    margin-top: 16px;
`;

class DurationCalculator {
    static calculateDuration(start: Date, end: Date) {
        const diffMs = end.getTime() - start.getTime();
        
        if (diffMs < 0) {
            throw new Error('End date must be after start date');
        }

        const totalSeconds = Math.floor(diffMs / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const days = Math.floor(totalHours / 24);
        
        const hours = totalHours % 24;
        const minutes = totalMinutes % 60;
        const seconds = totalSeconds % 60;

        // Calculate working days (Monday-Friday)
        let workingDays = 0;
        let weekends = 0;
        let currentDate = new Date(start);
        
        while (currentDate <= end) {
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                weekends++;
            } else {
                workingDays++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return {
            days,
            hours,
            minutes,
            seconds,
            totalSeconds,
            totalMinutes,
            totalHours,
            workingDays,
            weekends
        };
    }

    static getDateTimeString(date: Date): string {
        return date.toISOString().slice(0, 16);
    }
}

export const DurationCalculatorTool: React.FC = () => {
    const [state, setState] = React.useState<DurationCalculatorState>({
        startDate: new Date().toISOString().split('T')[0],
        startTime: new Date().toTimeString().slice(0, 5),
        endDate: new Date().toISOString().split('T')[0],
        endTime: new Date(Date.now() + 3600000).toTimeString().slice(0, 5), // +1 hour
        result: {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            totalSeconds: 0,
            totalMinutes: 0,
            totalHours: 0,
            workingDays: 0,
            weekends: 0
        },
        error: ''
    });

    const handleCalculate = () => {
        try {
            const startDateTime = new Date(`${state.startDate}T${state.startTime}`);
            const endDateTime = new Date(`${state.endDate}T${state.endTime}`);

            if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                throw new Error('Invalid date or time format');
            }

            const result = DurationCalculator.calculateDuration(startDateTime, endDateTime);
            
            setState(prev => ({ 
                ...prev, 
                result, 
                error: '' 
            }));
        } catch (error) {
            setState(prev => ({ 
                ...prev, 
                error: (error as Error).message,
                result: {
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    totalSeconds: 0,
                    totalMinutes: 0,
                    totalHours: 0,
                    workingDays: 0,
                    weekends: 0
                }
            }));
        }
    };

    const handleQuickSet = (type: 'now' | 'today' | 'tomorrow' | 'week') => {
        const now = new Date();
        let startDate = '';
        let startTime = '';
        let endDate = '';
        let endTime = '';

        switch (type) {
            case 'now':
                startDate = now.toISOString().split('T')[0];
                startTime = now.toTimeString().slice(0, 5);
                endDate = startDate;
                endTime = startTime;
                break;
            case 'today':
                startDate = now.toISOString().split('T')[0];
                startTime = '00:00';
                endDate = startDate;
                endTime = '23:59';
                break;
            case 'tomorrow':
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                startDate = now.toISOString().split('T')[0];
                startTime = now.toTimeString().slice(0, 5);
                endDate = tomorrow.toISOString().split('T')[0];
                endTime = now.toTimeString().slice(0, 5);
                break;
            case 'week':
                const nextWeek = new Date(now);
                nextWeek.setDate(nextWeek.getDate() + 7);
                startDate = now.toISOString().split('T')[0];
                startTime = now.toTimeString().slice(0, 5);
                endDate = nextWeek.toISOString().split('T')[0];
                endTime = now.toTimeString().slice(0, 5);
                break;
        }

        setState(prev => ({
            ...prev,
            startDate,
            startTime,
            endDate,
            endTime,
            error: ''
        }));
    };

    const handleSwap = () => {
        setState(prev => ({
            ...prev,
            startDate: prev.endDate,
            startTime: prev.endTime,
            endDate: prev.startDate,
            endTime: prev.startTime,
            error: ''
        }));
    };

    const handleClear = () => {
        const now = new Date();
        setState(prev => ({
            ...prev,
            startDate: now.toISOString().split('T')[0],
            startTime: now.toTimeString().slice(0, 5),
            endDate: now.toISOString().split('T')[0],
            endTime: new Date(now.getTime() + 3600000).toTimeString().slice(0, 5),
            result: {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                totalSeconds: 0,
                totalMinutes: 0,
                totalHours: 0,
                workingDays: 0,
                weekends: 0
            },
            error: ''
        }));
    };

    React.useEffect(() => {
        handleCalculate();
    }, []);

    return (
        <DurationCalculatorContainer>
            <h3>Duration Calculator</h3>
            
            <QuickButtons>
                <QuickButton onClick={() => handleQuickSet('now')}>Now</QuickButton>
                <QuickButton onClick={() => handleQuickSet('today')}>Today</QuickButton>
                <QuickButton onClick={() => handleQuickSet('tomorrow')}>Tomorrow</QuickButton>
                <QuickButton onClick={() => handleQuickSet('week')}>Next Week</QuickButton>
            </QuickButtons>

            <ControlsContainer>
                <DateTimeGroup>
                    <DateTimeTitle>Start Date & Time</DateTimeTitle>
                    <DateTimeInputs>
                        <DateTimeInput
                            type="date"
                            value={state.startDate}
                            onChange={(e) => setState(prev => ({ 
                                ...prev, 
                                startDate: e.target.value,
                                error: ''
                            }))}
                        />
                        <DateTimeInput
                            type="time"
                            value={state.startTime}
                            onChange={(e) => setState(prev => ({ 
                                ...prev, 
                                startTime: e.target.value,
                                error: ''
                            }))}
                        />
                    </DateTimeInputs>
                </DateTimeGroup>

                <DateTimeGroup>
                    <DateTimeTitle>End Date & Time</DateTimeTitle>
                    <DateTimeInputs>
                        <DateTimeInput
                            type="date"
                            value={state.endDate}
                            onChange={(e) => setState(prev => ({ 
                                ...prev, 
                                endDate: e.target.value,
                                error: ''
                            }))}
                        />
                        <DateTimeInput
                            type="time"
                            value={state.endTime}
                            onChange={(e) => setState(prev => ({ 
                                ...prev, 
                                endTime: e.target.value,
                                error: ''
                            }))}
                        />
                    </DateTimeInputs>
                </DateTimeGroup>
            </ControlsContainer>

            <ActionButtons>
                <Button onClick={handleCalculate}>
                    Calculate Duration
                </Button>
                <Button onClick={handleSwap}>
                    Swap Start/End
                </Button>
                <Button onClick={handleClear}>
                    Clear
                </Button>
            </ActionButtons>

            {state.error && (
                <ErrorMessage>
                    {state.error}
                </ErrorMessage>
            )}

            <ResultContainer>
                <ResultCard>
                    <ResultTitle>Total Duration</ResultTitle>
                    <ResultValue>
                        {state.result.days}d {state.result.hours}h {state.result.minutes}m {state.result.seconds}s
                    </ResultValue>
                </ResultCard>

                <ResultCard>
                    <ResultTitle>Total Hours</ResultTitle>
                    <ResultValue>{state.result.totalHours}</ResultValue>
                    <ResultSubtext>hours</ResultSubtext>
                </ResultCard>

                <ResultCard>
                    <ResultTitle>Total Minutes</ResultTitle>
                    <ResultValue>{state.result.totalMinutes}</ResultValue>
                    <ResultSubtext>minutes</ResultSubtext>
                </ResultCard>

                <ResultCard>
                    <ResultTitle>Total Seconds</ResultTitle>
                    <ResultValue>{state.result.totalSeconds.toLocaleString()}</ResultValue>
                    <ResultSubtext>seconds</ResultSubtext>
                </ResultCard>

                <ResultCard>
                    <ResultTitle>Working Days</ResultTitle>
                    <ResultValue>{state.result.workingDays}</ResultValue>
                    <ResultSubtext>Monday-Friday</ResultSubtext>
                </ResultCard>

                <ResultCard>
                    <ResultTitle>Weekend Days</ResultTitle>
                    <ResultValue>{state.result.weekends}</ResultValue>
                    <ResultSubtext>Saturday-Sunday</ResultSubtext>
                </ResultCard>
            </ResultContainer>

            <InfoMessage>
                Calculate the duration between two dates and times. 
                Includes working days calculation (Monday-Friday) and weekend days.
                Use quick buttons for common time ranges or set custom dates and times.
            </InfoMessage>
        </DurationCalculatorContainer>
    );
};
