import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';

// User testing and feedback collection system
export class UserTestingManager {
    private static instance: UserTestingManager;
    private feedbackData: UserFeedback[] = [];
    private testSessions: TestSession[] = [];
    private currentSession: TestSession | null = null;

    static getInstance(): UserTestingManager {
        if (!UserTestingManager.instance) {
            UserTestingManager.instance = new UserTestingManager();
        }
        return UserTestingManager.instance;
    }

    // Start a new user testing session
    startTestSession(scenario: TestScenario): string {
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const session: TestSession = {
            id: sessionId,
            scenario,
            startTime: Date.now(),
            endTime: null,
            feedback: [],
            metrics: {
                taskCompletionTime: [],
                errorCount: 0,
                helpRequests: 0,
                satisfactionRating: null,
                comments: []
            },
            participantInfo: {
                experienceLevel: 'unknown',
                deviceInfo: this.getDeviceInfo(),
                browserInfo: this.getBrowserInfo()
            }
        };

        this.currentSession = session;
        this.testSessions.push(session);

        return sessionId;
    }

    // End the current test session
    endTestSession(): void {
        if (this.currentSession) {
            this.currentSession.endTime = Date.now();
            this.currentSession = null;
        }
    }

    // Record user feedback
    recordFeedback(feedback: Omit<UserFeedback, 'timestamp' | 'sessionId'>): void {
        const fullFeedback: UserFeedback = {
            ...feedback,
            timestamp: Date.now(),
            sessionId: this.currentSession?.id || 'no-session'
        };

        this.feedbackData.push(fullFeedback);

        if (this.currentSession) {
            this.currentSession.feedback.push(fullFeedback);
        }
    }

    // Record task completion time
    recordTaskCompletion(taskName: string, duration: number): void {
        if (this.currentSession) {
            this.currentSession.metrics.taskCompletionTime.push({
                taskName,
                duration,
                timestamp: Date.now()
            });
        }
    }

    // Record error or help request
    recordError(error: string, context?: string): void {
        if (this.currentSession) {
            this.currentSession.metrics.errorCount++;
            this.recordFeedback({
                type: 'error',
                message: error,
                context,
                severity: 'medium'
            });
        }
    }

    recordHelpRequest(helpTopic: string, context?: string): void {
        if (this.currentSession) {
            this.currentSession.metrics.helpRequests++;
            this.recordFeedback({
                type: 'help',
                message: helpTopic,
                context,
                severity: 'low'
            });
        }
    }

    // Record satisfaction rating
    recordSatisfactionRating(rating: number, comment?: string): void {
        if (this.currentSession) {
            this.currentSession.metrics.satisfactionRating = rating;
            if (comment) {
                this.currentSession.metrics.comments.push({
                    timestamp: Date.now(),
                    comment
                });
            }
        }
    }

    // Get testing analytics
    getAnalytics(): TestingAnalytics {
        const completedSessions = this.testSessions.filter(s => s.endTime !== null);
        
        const averageSessionDuration = completedSessions.length > 0
            ? completedSessions.reduce((sum, s) => sum + (s.endTime! - s.startTime), 0) / completedSessions.length
            : 0;

        const averageSatisfaction = completedSessions
            .filter(s => s.metrics.satisfactionRating !== null)
            .reduce((sum, s) => sum + s.metrics.satisfactionRating!, 0) / completedSessions.length || 0;

        const scenarioAnalytics = this.testSessions.reduce((acc, session) => {
            const scenario = session.scenario.name;
            if (!acc[scenario]) {
                acc[scenario] = {
                    totalSessions: 0,
                    averageDuration: 0,
                    averageSatisfaction: 0,
                    commonErrors: [],
                    helpRequests: 0
                };
            }
            
            acc[scenario].totalSessions++;
            return acc;
        }, {} as Record<string, ScenarioAnalytics>);

        return {
            totalSessions: this.testSessions.length,
            completedSessions: completedSessions.length,
            averageSessionDuration,
            averageSatisfaction,
            scenarioAnalytics,
            feedbackSummary: this.getFeedbackSummary()
        };
    }

    private getFeedbackSummary(): FeedbackSummary {
        const feedbackByType = this.feedbackData.reduce((acc, feedback) => {
            acc[feedback.type] = (acc[feedback.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const feedbackBySeverity = this.feedbackData.reduce((acc, feedback) => {
            acc[feedback.severity] = (acc[feedback.severity] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalFeedback: this.feedbackData.length,
            byType: feedbackByType,
            bySeverity: feedbackBySeverity,
            commonIssues: this.getCommonIssues()
        };
    }

    private getCommonIssues(): string[] {
        const issues = this.feedbackData
            .filter(f => f.type === 'error' || f.type === 'usability')
            .map(f => f.message)
            .reduce((acc, issue) => {
                acc[issue] = (acc[issue] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        return Object.entries(issues)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([issue]) => issue);
    }

    private getDeviceInfo(): string {
        return `${navigator.platform} ${navigator.userAgent}`;
    }

    private getBrowserInfo(): string {
        return `${navigator.appName} ${navigator.appVersion}`;
    }

    // Export data for analysis
    exportData(): TestingExportData {
        return {
            sessions: this.testSessions,
            feedback: this.feedbackData,
            analytics: this.getAnalytics(),
            exportDate: new Date().toISOString()
        };
    }

    // Clear all data
    clearData(): void {
        this.feedbackData = [];
        this.testSessions = [];
        this.currentSession = null;
    }
}

// Predefined test scenarios
export const TEST_SCENARIOS: TestScenario[] = [
    {
        name: 'basic-grouping',
        title: 'Basic Grouping Functionality',
        description: 'Test basic grouping by domain and method',
        tasks: [
            'Group requests by domain',
            'Switch to method grouping',
            'Expand and collapse groups',
            'Navigate between groups'
        ],
        expectedTime: 300 // seconds
    },
    {
        name: 'hierarchical-grouping',
        title: 'Hierarchical Grouping',
        description: 'Test multi-level grouping functionality',
        tasks: [
            'Group by domain then method',
            'Navigate subgroups',
            'Expand nested groups',
            'Filter within groups'
        ],
        expectedTime: 450
    },
    {
        name: 'advanced-filtering',
        title: 'Advanced Filtering',
        description: 'Test complex filtering combinations',
        tasks: [
            'Create multiple filters',
            'Combine filter types',
            'Toggle filter states',
            'Clear all filters'
        ],
        expectedTime: 600
    },
    {
        name: 'bulk-operations',
        title: 'Bulk Operations',
        description: 'Test bulk selection and operations',
        tasks: [
            'Select multiple groups',
            'Pin selected groups',
            'Export selected groups',
            'Delete selected groups'
        ],
        expectedTime: 400
    },
    {
        name: 'keyboard-accessibility',
        title: 'Keyboard Accessibility',
        description: 'Test keyboard navigation and shortcuts',
        tasks: [
            'Navigate with keyboard',
            'Use grouping shortcuts',
            'Access filter controls',
            'Use screen reader support'
        ],
        expectedTime: 350
    },
    {
        name: 'performance-large-dataset',
        title: 'Large Dataset Performance',
        description: 'Test performance with many requests',
        tasks: [
            'Group 1000+ requests',
            'Expand/collapse groups',
            'Apply filters',
            'Navigate quickly'
        ],
        expectedTime: 300
    }
];

// Hook for user testing integration
export const useUserTesting = (scenario?: TestScenario) => {
    const [isTestMode, setIsTestMode] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [testingManager] = useState(() => UserTestingManager.getInstance());

    const startTesting = useCallback((testScenario: TestScenario) => {
        const sessionId = testingManager.startTestSession(testScenario);
        setCurrentSessionId(sessionId);
        setIsTestMode(true);
    }, [testingManager]);

    const endTesting = useCallback(() => {
        testingManager.endTestSession();
        setIsTestMode(false);
        setCurrentSessionId(null);
    }, [testingManager]);

    const recordFeedback = useCallback((feedback: Omit<UserFeedback, 'timestamp' | 'sessionId'>) => {
        testingManager.recordFeedback(feedback);
    }, [testingManager]);

    const recordTaskCompletion = useCallback((taskName: string, duration: number) => {
        testingManager.recordTaskCompletion(taskName, duration);
    }, [testingManager]);

    const recordError = useCallback((error: string, context?: string) => {
        testingManager.recordError(error, context);
    }, [testingManager]);

    const recordHelpRequest = useCallback((helpTopic: string, context?: string) => {
        testingManager.recordHelpRequest(helpTopic, context);
    }, [testingManager]);

    const recordSatisfaction = useCallback((rating: number, comment?: string) => {
        testingManager.recordSatisfactionRating(rating, comment);
    }, [testingManager]);

    const getAnalytics = useCallback(() => {
        return testingManager.getAnalytics();
    }, [testingManager]);

    // Auto-start testing if scenario is provided
    useEffect(() => {
        if (scenario && isTestMode) {
            startTesting(scenario);
        }
    }, [scenario, isTestMode, startTesting]);

    return {
        isTestMode,
        currentSessionId,
        startTesting,
        endTesting,
        recordFeedback,
        recordTaskCompletion,
        recordError,
        recordHelpRequest,
        recordSatisfaction,
        getAnalytics,
        testingManager
    };
};

// In-app feedback collection component
export const FeedbackCollector: React.FC<{
    isVisible: boolean;
    onSubmit: (feedback: UserFeedback) => void;
    onCancel: () => void;
}> = ({ isVisible, onSubmit, onCancel }) => {
    const [feedbackType, setFeedbackType] = useState<'general' | 'error' | 'help' | 'suggestion'>('general');
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
    const [context, setContext] = useState('');

    if (!isVisible) return null;

    const handleSubmit = () => {
        if (!message.trim()) return;

        onSubmit({
            type: feedbackType,
            message: message.trim(),
            context: context.trim(),
            severity
        });

        // Reset form
        setMessage('');
        setContext('');
        setFeedbackType('general');
        setSeverity('medium');
    };

    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '400px',
            maxHeight: '80vh',
            overflowY: 'auto'
        }}>
            <h3>Provide Feedback</h3>
            
            <div style={{ marginBottom: '15px' }}>
                <label>
                    Feedback Type:
                    <select 
                        value={feedbackType} 
                        onChange={(e) => setFeedbackType(e.target.value as any)}
                        style={{ marginLeft: '10px', padding: '5px' }}
                    >
                        <option value="general">General</option>
                        <option value="error">Error</option>
                        <option value="help">Help Request</option>
                        <option value="suggestion">Suggestion</option>
                    </select>
                </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>
                    Severity:
                    <select 
                        value={severity} 
                        onChange={(e) => setSeverity(e.target.value as any)}
                        style={{ marginLeft: '10px', padding: '5px' }}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>
                    Message:
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your feedback..."
                        style={{ 
                            width: '100%', 
                            height: '80px', 
                            marginLeft: '10px',
                            resize: 'vertical',
                            padding: '5px'
                        }}
                    />
                </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>
                    Context (optional):
                    <input
                        type="text"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="What were you doing when this occurred?"
                        style={{ 
                            width: '100%', 
                            marginLeft: '10px',
                            padding: '5px'
                        }}
                    />
                </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                    onClick={onCancel}
                    style={{
                        padding: '8px 16px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        backgroundColor: '#f5f5f5',
                        cursor: 'pointer'
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!message.trim()}
                    style={{
                        padding: '8px 16px',
                        border: '1px solid #007bff',
                        borderRadius: '4px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        cursor: 'pointer',
                        opacity: message.trim() ? 1 : 0.5
                    }}
                >
                    Submit Feedback
                </button>
            </div>
        </div>
    );
};

// Type definitions
interface UserFeedback {
    type: 'general' | 'error' | 'help' | 'suggestion';
    message: string;
    context?: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: number;
    sessionId: string;
}

interface TestSession {
    id: string;
    scenario: TestScenario;
    startTime: number;
    endTime: number | null;
    feedback: UserFeedback[];
    metrics: {
        taskCompletionTime: Array<{
            taskName: string;
            duration: number;
            timestamp: number;
        }>;
        errorCount: number;
        helpRequests: number;
        satisfactionRating: number | null;
        comments: Array<{
            timestamp: number;
            comment: string;
        }>;
    };
    participantInfo: {
        experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'unknown';
        deviceInfo: string;
        browserInfo: string;
    };
}

interface TestScenario {
    name: string;
    title: string;
    description: string;
    tasks: string[];
    expectedTime: number;
}

interface TestingAnalytics {
    totalSessions: number;
    completedSessions: number;
    averageSessionDuration: number;
    averageSatisfaction: number;
    scenarioAnalytics: Record<string, ScenarioAnalytics>;
    feedbackSummary: FeedbackSummary;
}

interface ScenarioAnalytics {
    totalSessions: number;
    averageDuration: number;
    averageSatisfaction: number;
    commonErrors: string[];
    helpRequests: number;
}

interface FeedbackSummary {
    totalFeedback: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    commonIssues: string[];
}

interface TestingExportData {
    sessions: TestSession[];
    feedback: UserFeedback[];
    analytics: TestingAnalytics;
    exportDate: string;
}
