import { RtcTokenBuilder, RtcRole } from 'agora-token';

interface VoiceRoomCredentials {
  token: string;
  appId: string;
  channelName: string;
  uid: number;
}

// Agora credentials (should be in .env in production)
const AGORA_APP_ID = process.env.AGORA_APP_ID || 'your-agora-app-id';
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || 'your-agora-certificate';

/**
 * Generate Agora RTC token for voice call
 */
export async function generateVoiceRoomToken(
  circleId: string,
  userId?: string
): Promise<VoiceRoomCredentials> {
  try {
    // Generate a unique UID for this user (or use provided userId)
    const uid = userId ? parseInt(userId.replace(/\D/g, '').slice(0, 10)) : Math.floor(Math.random() * 100000);

    // Channel name is the circleId
    const channelName = circleId;

    // Token expires in 1 hour
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Build the token
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      uid,
      RtcRole.PUBLISHER, // User can both publish and subscribe
      privilegeExpiredTs,
      privilegeExpiredTs // Token expiration time
    );

    console.log(`✅ Generated Agora token for circle ${circleId}, uid: ${uid}`);

    return {
      token,
      appId: AGORA_APP_ID,
      channelName,
      uid,
    };
  } catch (error) {
    console.error('❌ Error generating Agora token:', error);

    // Fallback to mock data if Agora credentials are not configured
    console.warn('⚠️ Using mock voice credentials. Configure AGORA_APP_ID and AGORA_APP_CERTIFICATE in .env');

    return {
      token: `mock_token_${circleId}`,
      appId: 'mock_app_id',
      channelName: circleId,
      uid: Math.floor(Math.random() * 100000),
    };
  }
}

/**
 * End a voice room
 */
export async function endVoiceRoom(circleId: string): Promise<void> {
  // Agora channels are automatically cleaned up when all users leave
  // No explicit API call needed
  console.log(`📤 Voice room ended for circle ${circleId}`);
}

/**
 * Get voice room status
 * Note: Agora doesn't provide a simple API to check room status
 * You would need to implement this using Agora's RESTful API or maintain state in your database
 */
export async function getVoiceRoomStatus(circleId: string): Promise<any> {
  // This is a placeholder
  // In production, you might query your database for active participants
  return {
    active: true,
    channelName: circleId,
  };
}
