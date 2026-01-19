import { Pool } from 'pg';

let pool: Pool;

export async function initializeDatabase(): Promise<void> {
  // Skip database initialization if DATABASE_URL is not configured
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL not configured - skipping database initialization');
    console.warn('   Database-dependent features will not be available');
    return;
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Test connection
  try {
    await pool.query('SELECT NOW()');

    // Create tables if they don't exist
    await createTables();
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

async function createTables(): Promise<void> {
  const createSessionsTable = `
    CREATE TABLE IF NOT EXISTS user_sessions (
      session_id VARCHAR(255) PRIMARY KEY,
      emotional_theme VARCHAR(50) NOT NULL,
      emotional_intensity INTEGER NOT NULL CHECK (emotional_intensity BETWEEN 1 AND 10),
      comfort_level VARCHAR(50) NOT NULL,
      timezone VARCHAR(100) NOT NULL,
      preferred_duration INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL
    );
  `;

  const createCirclesTable = `
    CREATE TABLE IF NOT EXISTS circle_sessions (
      circle_id VARCHAR(255) PRIMARY KEY,
      participants TEXT[] NOT NULL,
      theme VARCHAR(50) NOT NULL,
      start_time TIMESTAMP NOT NULL,
      end_time TIMESTAMP NOT NULL,
      status VARCHAR(20) NOT NULL,
      voice_app_id VARCHAR(255),
      voice_channel_name VARCHAR(255),
      voice_room_token TEXT,
      voice_room_url TEXT,
      ai_moderator_active BOOLEAN DEFAULT true,
      circle_type VARCHAR(50) DEFAULT 'standard',
      auto_delete_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createSummariesTable = `
    CREATE TABLE IF NOT EXISTS session_summaries (
      summary_id SERIAL PRIMARY KEY,
      circle_id VARCHAR(255) NOT NULL,
      common_emotions TEXT[] NOT NULL,
      speaking_balance FLOAT[] NOT NULL,
      sentiment_trend VARCHAR(20) NOT NULL,
      validation_message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL,
      FOREIGN KEY (circle_id) REFERENCES circle_sessions(circle_id)
    );
  `;

  const createSafetyReportsTable = `
    CREATE TABLE IF NOT EXISTS safety_reports (
      report_id VARCHAR(255) PRIMARY KEY,
      circle_id VARCHAR(255) NOT NULL,
      reporter_session_id VARCHAR(255) NOT NULL,
      reason TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      action_taken TEXT,
      FOREIGN KEY (circle_id) REFERENCES circle_sessions(circle_id)
    );
  `;

  const createEmotionProfilesTable = `
    CREATE TABLE IF NOT EXISTS emotion_profiles (
      profile_id SERIAL PRIMARY KEY,
      session_id VARCHAR(255) UNIQUE NOT NULL,
      primary_emotion VARCHAR(50) NOT NULL,
      emotion_scores JSONB NOT NULL,
      voice_tone VARCHAR(20) NOT NULL,
      voice_pace VARCHAR(20) NOT NULL,
      voice_energy INTEGER NOT NULL,
      signature VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES user_sessions(session_id)
    );
  `;

  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_circles_status ON circle_sessions(status);
    CREATE INDEX IF NOT EXISTS idx_summaries_expires ON session_summaries(expires_at);
    CREATE INDEX IF NOT EXISTS idx_emotion_profiles_signature ON emotion_profiles(signature);
  `;

  try {
    await pool.query(createSessionsTable);
    await pool.query(createCirclesTable);
    await pool.query(createSummariesTable);
    await pool.query(createSafetyReportsTable);
    await pool.query(createEmotionProfilesTable);
    await pool.query(createIndexes);
    console.log('✓ Database tables created/verified');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return pool;
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
  }
}
