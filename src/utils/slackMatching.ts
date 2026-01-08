/**
 * Slack-to-Employee Matching Algorithm
 * Provides multiple matching strategies with confidence scoring
 */

import type {
  Employee,
  SlackUser,
  MatchSuggestion,
  MatchConfidence,
} from '../types/employee';

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy name matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity score between two strings (0-100)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const normalized1 = str1.toLowerCase().trim();
  const normalized2 = str2.toLowerCase().trim();

  if (normalized1 === normalized2) return 100;

  const maxLen = Math.max(normalized1.length, normalized2.length);
  if (maxLen === 0) return 100;

  const distance = levenshteinDistance(normalized1, normalized2);
  return Math.round(((maxLen - distance) / maxLen) * 100);
}

/**
 * Strategy 1: Exact email match (95% confidence)
 */
function emailMatch(employee: Employee, slackUsers: SlackUser[]): SlackUser | null {
  // Try to match with googleId if it's an email
  if (employee.googleId && employee.googleId.includes('@')) {
    const match = slackUsers.find(user => user.email === employee.googleId);
    if (match) return match;
  }

  // If we had email in employee, we would match here
  return null;
}

/**
 * Strategy 2: Exact full name match (80% confidence)
 */
function nameMatch(employee: Employee, slackUsers: SlackUser[]): SlackUser | null {
  const employeeName = employee.name.toLowerCase().trim();

  const match = slackUsers.find(user => {
    const userName = user.name.toLowerCase().trim();
    return userName === employeeName;
  });

  return match || null;
}

/**
 * Strategy 3: Display name contains employee name (60% confidence)
 */
function displayNameMatch(employee: Employee, slackUsers: SlackUser[]): SlackUser | null {
  const employeeNameParts = employee.name.toLowerCase().trim().split(/\s+/);

  const match = slackUsers.find(user => {
    const displayName = user.displayName.toLowerCase().trim();

    // Check if display name contains all parts of employee name
    return employeeNameParts.every(part => displayName.includes(part));
  });

  return match || null;
}

/**
 * Strategy 4: Fuzzy name similarity (40% confidence)
 * Requires at least 70% similarity threshold
 */
function fuzzyNameMatch(employee: Employee, slackUsers: SlackUser[]): SlackUser | null {
  const SIMILARITY_THRESHOLD = 70;
  let bestMatch: SlackUser | null = null;
  let bestSimilarity = 0;

  for (const user of slackUsers) {
    const similarity = calculateSimilarity(employee.name, user.name);

    if (similarity >= SIMILARITY_THRESHOLD && similarity > bestSimilarity) {
      bestMatch = user;
      bestSimilarity = similarity;
    }
  }

  return bestMatch;
}

/**
 * Find all potential matches for an employee
 * Returns array of matches sorted by confidence
 */
function findAllPotentialMatches(
  employee: Employee,
  slackUsers: SlackUser[],
  usedSlackIds: Set<string>
): Array<{ user: SlackUser; confidence: MatchConfidence; score: number }> {
  const availableSlackUsers = slackUsers.filter(user => !usedSlackIds.has(user.slackId));
  const matches: Array<{ user: SlackUser; confidence: MatchConfidence; score: number }> = [];

  // Try each strategy and collect all matches
  const strategies = [
    { match: emailMatch(employee, availableSlackUsers), confidence: 'EXACT_EMAIL' as MatchConfidence, score: 95 },
    { match: nameMatch(employee, availableSlackUsers), confidence: 'EXACT_NAME' as MatchConfidence, score: 80 },
    { match: displayNameMatch(employee, availableSlackUsers), confidence: 'DISPLAY_NAME' as MatchConfidence, score: 60 },
    { match: fuzzyNameMatch(employee, availableSlackUsers), confidence: 'FUZZY_NAME' as MatchConfidence, score: 40 },
  ];

  for (const strategy of strategies) {
    if (strategy.match) {
      // Avoid duplicate users
      if (!matches.find(m => m.user.slackId === strategy.match!.slackId)) {
        matches.push({
          user: strategy.match!,
          confidence: strategy.confidence,
          score: strategy.score,
        });
      }
    }
  }

  // Sort by score descending
  return matches.sort((a, b) => b.score - a.score);
}

/**
 * Main function: Generate match suggestions for all employees
 * Combines all strategies with confidence scoring
 */
export function findBestMatches(
  employees: Employee[],
  slackUsers: SlackUser[]
): MatchSuggestion[] {
  const suggestions: MatchSuggestion[] = [];
  const usedSlackIds = new Set<string>();

  // Sort employees by those who already have slackId (skip them) or don't (process them)
  const employeesWithoutSlack = employees.filter(emp => !emp.slackId);

  for (const employee of employeesWithoutSlack) {
    const potentialMatches = findAllPotentialMatches(employee, slackUsers, usedSlackIds);

    if (potentialMatches.length > 0) {
      // Best match is the first one
      const bestMatch = potentialMatches[0];

      suggestions.push({
        employee,
        suggestedSlackUser: bestMatch.user,
        confidence: bestMatch.confidence,
        confidenceScore: bestMatch.score,
        alternativeSlackUsers: potentialMatches.slice(1).map(m => m.user),
      });

      // Mark this Slack user as used to avoid duplicate assignments
      usedSlackIds.add(bestMatch.user.slackId);
    } else {
      // No match found
      suggestions.push({
        employee,
        suggestedSlackUser: null,
        confidence: 'NONE',
        confidenceScore: 0,
        alternativeSlackUsers: [],
      });
    }
  }

  // Sort suggestions by confidence score descending
  return suggestions.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

/**
 * Get confidence label for display
 */
export function getConfidenceLabel(confidence: MatchConfidence): string {
  const labels: Record<MatchConfidence, string> = {
    'EXACT_EMAIL': 'Exact email match',
    'EXACT_NAME': 'Exact name match',
    'DISPLAY_NAME': 'Display name match',
    'FUZZY_NAME': 'Similar name',
    'NONE': 'No match',
  };
  return labels[confidence];
}

/**
 * Get confidence color for UI
 */
export function getConfidenceColor(confidence: MatchConfidence): string {
  const colors: Record<MatchConfidence, string> = {
    'EXACT_EMAIL': 'green',
    'EXACT_NAME': 'blue',
    'DISPLAY_NAME': 'yellow',
    'FUZZY_NAME': 'orange',
    'NONE': 'gray',
  };
  return colors[confidence];
}
