export interface UserSession {
    sessionId: string;
    emotionalTheme: EmotionalTheme;
    emotionalIntensity: number; // 1-10
    comfortLevel: ComfortLevel;
    timezone: string;
    preferredDuration: number; // 20 or 30 minutes
    createdAt: string;
    expiresAt: string;
}

export type EmotionalTheme =
    | 'loneliness'
    | 'work-stress'
    | 'breakup'
    | 'anxiety'
    | 'feeling-stuck'
    | 'grief'
    | 'overwhelm';

export type ComfortLevel =
    | 'listening'
    | 'sharing-sometimes'
    | 'comfortable';

export interface CircleSession {
    circleId: string;
    participants: string[]; // Array of sessionIds
    theme: EmotionalTheme;
    startTime: Date;
    endTime: Date;
    status: CircleStatus;
    voiceRoomToken?: string;
    voiceRoomUrl?: string; // Deprecated, kept for backward compatibility
    voiceAppId?: string; // Agora App ID
    voiceChannelName?: string; // Agora Channel Name
    aiModeratorActive: boolean;
    createdAt: Date;
}

export type CircleStatus =
    | 'waiting'
    | 'active'
    | 'completed'
    | 'terminated';

export interface SessionSummary {
    circleId: string;
    commonEmotions: string[];
    speakingBalance: number[]; // Percentage per participant
    sentimentTrend: 'positive' | 'neutral' | 'negative';
    validationMessage: string;
    createdAt: Date;
    expiresAt: Date;
}

export interface MatchingRequest {
    sessionId: string;
    theme: EmotionalTheme;
    intensity: number;
    comfortLevel: ComfortLevel;
    timezone: string;
    duration: number;
    timestamp: Date;
}

export interface SafetyReport {
    reportId: string;
    circleId: string;
    reporterSessionId: string;
    reason: string;
    timestamp: Date;
    actionTaken?: string;
}
