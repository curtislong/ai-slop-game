// Scoring utilities for AI Slop: The Game!

export interface ScoringResult {
  score: number; // 0-100
  grade: 'gold' | 'silver' | 'bronze' | 'none';
  message: string;
  teamVsAI?: {
    teamWon: boolean;
    sabotageImpact: number; // How much corruption affected the result
    pointsAwarded: {
      team: number; // 0-3 points
      ai: number; // 0-3 points
    };
  };
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Get embedding from OpenAI
async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Calculate points awarded based on who got AI help
// Each player who got helped: -1 point (to AI)
// Each player who didn't get helped: +1 point (to team)
function calculatePointsFromHelp(turns: any[]): { team: number; ai: number } {
  const helpedCount = turns.filter(turn => turn.originalPrompt && turn.corruptedPrompt).length;
  const notHelpedCount = turns.length - helpedCount;

  return {
    team: notHelpedCount,
    ai: helpedCount,
  };
}

// Calculate similarity score using AI embeddings
export async function calculateSimilarityScore(
  originalPrompt: string,
  finalPrompt: string,
  hadSabotage: boolean = false,
  turns?: any[]
): Promise<ScoringResult> {
  try {
    // Get embeddings for both prompts
    const [originalEmbedding, finalEmbedding] = await Promise.all([
      getEmbedding(originalPrompt),
      getEmbedding(finalPrompt),
    ]);

    // Calculate similarity (0-1)
    const similarity = cosineSimilarity(originalEmbedding, finalEmbedding);

    // Convert to percentage (0-100)
    const score = Math.round(similarity * 100);

    // Determine grade and message
    let grade: 'gold' | 'silver' | 'bronze' | 'none';
    let message: string;

    if (hadSabotage && turns) {
      // Calculate points based on who got help
      const pointsAwarded = calculatePointsFromHelp(turns);

      // Team vs AI messaging
      if (score >= 75) {
        grade = 'gold';
        message = 'Victory! The team overcame the AI sabotage!';
      } else if (score >= 60) {
        grade = 'silver';
        message = 'Good fight! You partially resisted the chaos!';
      } else if (score >= 45) {
        grade = 'bronze';
        message = 'The AI put up a fight, but you survived!';
      } else {
        grade = 'none';
        message = 'Despite AI\'s best efforts to help, total chaos ensued!';
      }

      // Calculate Team vs AI data
      const teamVsAI = {
        teamWon: score >= 60, // Team wins if score is 60% or higher
        sabotageImpact: 100 - score, // How much the AI corrupted things
        pointsAwarded,
      };

      return { score, grade, message, teamVsAI };
    } else {
      // Normal game messaging
      if (score >= 90) {
        grade = 'gold';
        message = 'Amazing! You kept the essence intact!';
      } else if (score >= 75) {
        grade = 'silver';
        message = 'Great job! Most of the meaning survived!';
      } else if (score >= 60) {
        grade = 'bronze';
        message = 'Nice work! Some elements made it through!';
      } else {
        grade = 'none';
        message = 'Total drift! But that\'s AI, am I right?';
      }

      return { score, grade, message };
    }
  } catch (error) {
    console.error('Scoring error:', error);
    // Fallback to basic word overlap if API fails
    return calculateBasicScore(originalPrompt, finalPrompt);
  }
}

// Fallback: Simple word overlap scoring (no API needed)
function calculateBasicScore(originalPrompt: string, finalPrompt: string): ScoringResult {
  const origWords = new Set(
    originalPrompt.toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3) // Ignore short words
  );

  const finalWords = new Set(
    finalPrompt.toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3)
  );

  const overlap = [...origWords].filter(w => finalWords.has(w)).length;
  const score = Math.round((overlap / Math.max(origWords.size, 1)) * 100);

  let grade: 'gold' | 'silver' | 'bronze' | 'none';
  let message: string;

  if (score >= 90) {
    grade = 'gold';
    message = 'Amazing! You kept the essence intact!';
  } else if (score >= 75) {
    grade = 'silver';
    message = 'Great job! Most of the meaning survived!';
  } else if (score >= 60) {
    grade = 'bronze';
    message = 'Nice work! Some elements made it through!';
  } else {
    grade = 'none';
    message = 'Total drift! But that\'s AI, am I right?';
  }

  return { score, grade, message };
}
