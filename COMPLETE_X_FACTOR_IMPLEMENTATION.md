# 🚀 Complete Implementation Guide - All 3 X-Factor Features

This document provides the complete code to implement all three X-Factor features.

---

## 📋 **Implementation Checklist**

### **Phase 1: Emotional Roulette (2-3 hours)**
- [x] Backend AI service
- [x] Backend API endpoint
- [x] Mobile modal component
- [ ] Integration into VoiceCircleScreen
- [ ] WebSocket events
- [ ] Testing

### **Phase 2: Midnight Circles (4-6 hours)**
- [ ] Database schema updates
- [ ] Time-based matching logic
- [ ] Auto-delete cron job
- [ ] Midnight UI theme
- [ ] Countdown timer
- [ ] Testing

### **Phase 3: Emotional Twins (8-10 hours)**
- [ ] Voice emotion API integration
- [ ] Voice recording screen
- [ ] Emotional matching algorithm
- [ ] Twin score calculation
- [ ] Voice visualization
- [ ] Testing

---

## 🎲 **STEP-BY-STEP: Completing Emotional Roulette**

### **Step 1: Update API Service (Mobile)**

Add this to `mobile-app/src/services/api.service.ts`:

```typescript
// Add to apiService object:

async getEmotionalRouletteQuestion(
  circleId: string,
  trustLevel: number,
  previousQuestions: string[]
): Promise<{
  question: string;
  trustLevel: number;
  answerTimeLimit: number;
  canPass: boolean;
}> {
  const response = await axios.post(`${this.baseURL}/api/circle/${circleId}/roulette`, {
    trustLevel,
    previousQuestions,
  });
  return response.data;
},
```

### **Step 2: Update VoiceCircleScreen**

Add these state variables and logic to `VoiceCircleScreen.tsx`:

```typescript
// Add to imports:
import { EmotionalRouletteModal } from '../components/EmotionalRouletteModal';

// Add to state (after existing useState declarations):
const [showRoulette, setShowRoulette] = useState(false);
const [rouletteQuestion, setRouletteQuestion] = useState('');
const [trustLevel, setTrustLevel] = useState(1);
const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);
const [sessionStartTime] = useState(Date.now());

// Add function to calculate trust level based on time:
const calculateTrustLevel = (): number => {
  const minutesElapsed = (Date.now() - sessionStartTime) / 60000;
  if (minutesElapsed < 5) return Math.min(3, Math.floor(minutesElapsed) + 1);
  if (minutesElapsed < 15) return Math.min(7, Math.floor((minutesElapsed - 5) / 2) + 4);
  return Math.min(10, Math.floor((minutesElapsed - 15) / 3) + 8);
};

// Add function to trigger roulette:
const triggerEmotionalRoulette = async () => {
  try {
    const currentTrust = calculateTrustLevel();
    setTrustLevel(currentTrust);

    const result = await apiService.getEmotionalRouletteQuestion(
      circleId,
      currentTrust,
      previousQuestions
    );

    setRouletteQuestion(result.question);
    setShowRoulette(true);
    setPreviousQuestions(prev => [...prev, result.question].slice(-5)); // Keep last 5
  } catch (error) {
    console.error('Error getting roulette question:', error);
  }
};

// Add useEffect for random roulette triggers:
useEffect(() => {
  // Trigger roulette at random intervals (3-7 minutes)
  const scheduleNextRoulette = () => {
    const delay = (3 + Math.random() * 4) * 60 * 1000; // 3-7 minutes
    return setTimeout(() => {
      triggerEmotionalRoulette();
      scheduleNextRoulette();
    }, delay);
  };

  const timer = scheduleNextRoulette();
  return () => clearTimeout(timer);
}, [circleId, previousQuestions]);

// Add handlers for roulette:
const handleRouletteAnswer = () => {
  setShowRoulette(false);
  // Optionally: Unmute user automatically
  if (isMuted) {
    handleToggleMute();
  }
};

const handleRoulettePass = () => {
  setShowRoulette(false);
};

// Add to JSX (before closing </SafeAreaView>):
<EmotionalRouletteModal
  visible={showRoulette}
  question={rouletteQuestion}
  answerTimeLimit={60}
  onAnswer={handleRouletteAnswer}
  onPass={handleRoulettePass}
  onClose={() => setShowRoulette(false)}
/>
```

---

## 🌙 **STEP-BY-STEP: Implementing Midnight Circles**

### **Step 1: Update Database Schema**

Add to your database migration:

```sql
-- Add circle type column
ALTER TABLE circle_sessions 
ADD COLUMN circle_type VARCHAR(50) DEFAULT 'standard';

-- Add auto-delete timestamp
ALTER TABLE circle_sessions
ADD COLUMN auto_delete_at TIMESTAMP;

-- Create index for midnight circles
CREATE INDEX idx_circle_type ON circle_sessions(circle_type);
```

### **Step 2: Create Midnight Circle Service**

Create `backend/src/services/midnight.service.ts`:

```typescript
import { getPool } from '../config/database';

export function isMidnightHours(): boolean {
  const hour = new Date().getHours();
  return hour >= 23 || hour < 3;
}

export function getNextMidnightTime(): Date {
  const now = new Date();
  const next = new Date(now);
  
  if (now.getHours() >= 3) {
    // Next midnight is tonight
    next.setHours(23, 0, 0, 0);
  } else {
    // Currently in midnight window
    return now;
  }
  
  return next;
}

export function getSunriseTime(): Date {
  const now = new Date();
  const sunrise = new Date(now);
  
  if (now.getHours() < 6) {
    // Today's sunrise
    sunrise.setHours(6, 0, 0, 0);
  } else {
    // Tomorrow's sunrise
    sunrise.setDate(sunrise.getDate() + 1);
    sunrise.setHours(6, 0, 0, 0);
  }
  
  return sunrise;
}

// Auto-delete midnight circles at sunrise
export async function deleteMidnightCircles(): Promise<void> {
  const pool = getPool();
  
  await pool.query(`
    DELETE FROM circle_sessions 
    WHERE circle_type = 'midnight' 
    AND auto_delete_at < NOW()
  `);
  
  await pool.query(`
    DELETE FROM session_summaries 
    WHERE circle_id IN (
      SELECT circle_id FROM circle_sessions 
      WHERE circle_type = 'midnight'
    )
  `);
  
  console.log('🌅 Deleted midnight circles at sunrise');
}

// Run cleanup every hour
setInterval(() => {
  deleteMidnightCircles().catch(console.error);
}, 60 * 60 * 1000);
```

### **Step 3: Update Matching Service**

Add to `backend/src/services/matching.service.ts`:

```typescript
import { isMidnightHours, getSunriseTime } from './midnight.service';

// In createCircle function, add:
const circleType = isMidnightHours() ? 'midnight' : 'standard';
const autoDeleteAt = circleType === 'midnight' ? getSunriseTime() : null;

// Update INSERT query to include:
`INSERT INTO circle_sessions 
 (..., circle_type, auto_delete_at)
 VALUES (..., $12, $13)`,
[..., circleType, autoDeleteAt]
```

### **Step 4: Create Midnight UI Theme**

Create `mobile-app/src/constants/midnightTheme.ts`:

```typescript
export const MidnightTheme = {
  primary: '#1a0f2e', // Deep purple-black
  secondary: '#2d1b4e', // Dark purple
  accent: '#9d4edd', // Bright purple
  surface: '#0d0221', // Almost black
  text: '#e0d9ff', // Light purple-white
  moon: '#ffd60a', // Golden moon
};
```

### **Step 5: Create Midnight Circle Component**

Create `mobile-app/src/components/MidnightCircleCard.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MidnightTheme } from '../constants/midnightTheme';

export const MidnightCircleCard: React.FC = () => {
  const [timeUntilMidnight, setTimeUntilMidnight] = useState('');
  const [isMidnightNow, setIsMidnightNow] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour >= 23 || hour < 3) {
        setIsMidnightNow(true);
        setTimeUntilMidnight('NOW OPEN');
      } else {
        setIsMidnightNow(false);
        const hoursUntil = hour < 23 ? 23 - hour : 24 - hour + 23;
        const minutesUntil = 60 - now.getMinutes();
        setTimeUntilMidnight(`${hoursUntil}h ${minutesUntil}m`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, isMidnightNow && styles.containerActive]}>
      <Text style={styles.moon}>🌙</Text>
      <Text style={styles.title}>Midnight Circle</Text>
      <Text style={styles.subtitle}>
        "The most honest conversations happen at 2 AM"
      </Text>
      
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>
          {isMidnightNow ? 'Open Now' : 'Opens in'}
        </Text>
        <Text style={styles.timeValue}>{timeUntilMidnight}</Text>
      </View>

      {isMidnightNow ? (
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join Midnight Circle</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.reminderButton}>
          <Text style={styles.reminderButtonText}>Set Reminder</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: MidnightTheme.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MidnightTheme.secondary,
  },
  containerActive: {
    borderColor: MidnightTheme.accent,
    shadowColor: MidnightTheme.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  moon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: MidnightTheme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: MidnightTheme.text + 'AA',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timeLabel: {
    fontSize: 12,
    color: MidnightTheme.text + '88',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: MidnightTheme.accent,
  },
  joinButton: {
    backgroundColor: MidnightTheme.accent,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reminderButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: MidnightTheme.accent,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  reminderButtonText: {
    color: MidnightTheme.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

---

## 🥇 **STEP-BY-STEP: Implementing Emotional Twins**

### **Step 1: Sign up for Hume AI**

1. Go to https://www.hume.ai
2. Sign up for API access
3. Get API key
4. Add to `.env`: `HUME_API_KEY=your_key_here`

### **Step 2: Install Hume SDK**

```bash
cd backend
npm install hume
```

### **Step 3: Create Voice Emotion Service**

Create `backend/src/services/emotion.service.ts`:

```typescript
import { HumeClient } from 'hume';

const hume = new HumeClient({
  apiKey: process.env.HUME_API_KEY || '',
});

export interface VoiceEmotionProfile {
  userId: string;
  primaryEmotion: string;
  emotionScores: Record<string, number>;
  voiceTone: 'calm' | 'anxious' | 'sad' | 'energetic';
  speechRate: number;
  pitch: number;
  signature: string; // Unique identifier
}

export async function analyzeVoiceEmotion(
  audioBuffer: Buffer
): Promise<VoiceEmotionProfile> {
  try {
    const result = await hume.empathicVoice.inferEmotionsFromAudio({
      audio: audioBuffer,
    });

    const emotions = result.predictions[0]?.emotions || [];
    const topEmotion = emotions[0];

    // Calculate voice tone
    const anxietyScore = emotions.find(e => e.name === 'Anxiety')?.score || 0;
    const sadnessScore = emotions.find(e => e.name === 'Sadness')?.score || 0;
    const calmScore = emotions.find(e => e.name === 'Calmness')?.score || 0;

    let voiceTone: 'calm' | 'anxious' | 'sad' | 'energetic' = 'calm';
    if (anxietyScore > 0.6) voiceTone = 'anxious';
    else if (sadnessScore > 0.6) voiceTone = 'sad';
    else if (calmScore < 0.3) voiceTone = 'energetic';

    // Create unique signature
    const signature = emotions
      .slice(0, 5)
      .map(e => `${e.name}:${e.score.toFixed(2)}`)
      .join('|');

    return {
      userId: '',
      primaryEmotion: topEmotion?.name || 'Neutral',
      emotionScores: emotions.reduce((acc, e) => {
        acc[e.name] = e.score;
        return acc;
      }, {} as Record<string, number>),
      voiceTone,
      speechRate: result.predictions[0]?.prosody?.speechRate || 1.0,
      pitch: result.predictions[0]?.prosody?.pitch || 1.0,
      signature,
    };
  } catch (error) {
    console.error('Error analyzing voice emotion:', error);
    throw error;
  }
}

export function calculateEmotionalTwinScore(
  profile1: VoiceEmotionProfile,
  profile2: VoiceEmotionProfile
): number {
  let score = 0;

  // Compare primary emotions (30 points)
  if (profile1.primaryEmotion === profile2.primaryEmotion) {
    score += 30;
  }

  // Compare voice tone (25 points)
  if (profile1.voiceTone === profile2.voiceTone) {
    score += 25;
  }

  // Compare emotion scores (30 points)
  const emotions = ['Anxiety', 'Sadness', 'Joy', 'Anger', 'Fear'];
  emotions.forEach(emotion => {
    const diff = Math.abs(
      (profile1.emotionScores[emotion] || 0) - (profile2.emotionScores[emotion] || 0)
    );
    score += (1 - diff) * 6; // Max 6 points per emotion
  });

  // Compare speech patterns (15 points)
  const speechDiff = Math.abs(profile1.speechRate - profile2.speechRate);
  const pitchDiff = Math.abs(profile1.pitch - profile2.pitch);
  score += Math.max(0, 15 - (speechDiff + pitchDiff) * 10);

  return Math.round(Math.min(100, Math.max(0, score)));
}
```

### **Step 4: Add Voice Recording Screen**

Create `mobile-app/src/screens/VoiceRecordingScreen.tsx`:

```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';

export const VoiceRecordingScreen: React.FC = ({ navigation }) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    
    // Upload to backend for analysis
    // ... implementation
    
    navigation.navigate('EmotionalTwinResults');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Record Your Voice</Text>
      <Text style={styles.subtitle}>
        Tell us how you're feeling in 10 seconds
      </Text>

      <TouchableOpacity
        style={[styles.recordButton, isRecording && styles.recordButtonActive]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Text style={styles.recordIcon}>{isRecording ? '⏹️' : '🎤'}</Text>
      </TouchableOpacity>

      <Text style={styles.instruction}>
        {isRecording ? 'Recording... Tap to stop' : 'Tap to start recording'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 48,
    textAlign: 'center',
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#6B7FD7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  recordButtonActive: {
    backgroundColor: '#FF6B9D',
  },
  recordIcon: {
    fontSize: 48,
  },
  instruction: {
    fontSize: 14,
    color: '#999',
  },
});
```

---

## 📊 **Summary: What You'll Have**

After implementing all three features:

1. **Emotional Roulette** - Deep questions that appear randomly, getting more vulnerable over time
2. **Midnight Circles** - Exclusive late-night sessions that auto-delete at sunrise
3. **Emotional Twins** - AI-powered voice matching that finds your emotional match

**Total Implementation Time:** 14-19 hours  
**Viral Potential:** ⭐⭐⭐⭐⭐

---

**Ready to continue? I can help you implement any of these step-by-step!** 🚀
