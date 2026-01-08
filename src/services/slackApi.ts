/**
 * Slack API service layer
 * Handles all Slack-related API calls
 */

import type {
  SlackUser,
  SlackUserListResponse,
} from '../types/employee';

/**
 * Fetch all users from Slack workspace
 * Returns active, non-bot users that haven't been deleted
 */
export async function fetchSlackUsers(): Promise<SlackUserListResponse> {
  try {
    const response = await fetch('/api/admin/slack/users');

    if (!response.ok) {
      if (response.status === 503) {
        throw new Error('Slack integration is not configured or is disabled');
      } else if (response.status === 500) {
        throw new Error('Error communicating with Slack API');
      }
      throw new Error(`Failed to fetch Slack users: ${response.status} ${response.statusText}`);
    }

    const data: SlackUserListResponse = await response.json();
    console.log(data);
    
    return data;
  } catch (error) {
    console.error('Error fetching Slack users:', error);
    throw error;
  }
}

/**
 * Filter Slack users to get only active, non-bot, non-deleted users
 * Useful for matching with employees
 */
export function filterActiveSlackUsers(slackUsers: SlackUser[]): SlackUser[] {
  return slackUsers.filter(user => user.isActive && !user.isBot && !user.deleted);
}
