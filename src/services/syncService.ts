import { Subscription, UserProfile, SyncConfig } from '../types';

const SYNC_FILE_NAME = 'subtrack_data.json';

export interface SyncData {
  subscriptions: Subscription[];
  profile: UserProfile;
  version: string;
  updatedAt: string;
}

export class SyncService {
  static async pushToGist(config: NonNullable<SyncConfig['gist']>, data: SyncData): Promise<string> {
    const { token, gistId } = config;
    const url = gistId 
      ? `https://api.github.com/gists/${gistId}`
      : 'https://api.github.com/gists';
    
    const method = gistId ? 'PATCH' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'SubTrack Data Sync',
        public: false,
        files: {
          [SYNC_FILE_NAME]: {
            content: JSON.stringify(data, null, 2)
          }
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Gist sync failed');
    }

    const result = await response.json();
    return result.id;
  }

  static async pullFromGist(config: NonNullable<SyncConfig['gist']>): Promise<SyncData> {
    const { token, gistId } = config;
    if (!gistId) throw new Error('Gist ID is required for pulling data');

    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to pull from Gist');
    }

    const result = await response.json();
    const file = result.files[SYNC_FILE_NAME];
    if (!file) throw new Error('Sync file not found in Gist');

    return JSON.parse(file.content);
  }

  static async pushToWebDAV(config: NonNullable<SyncConfig['webdav']>, data: SyncData): Promise<void> {
    const { url, username, password } = config;
    const fullUrl = url.endsWith('/') ? `${url}${SYNC_FILE_NAME}` : `${url}/${SYNC_FILE_NAME}`;
    
    const auth = btoa(`${username}:${password}`);
    
    const response = await fetch(fullUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data, null, 2)
    });

    if (!response.ok) {
      throw new Error(`WebDAV push failed: ${response.statusText}`);
    }
  }

  static async pullFromWebDAV(config: NonNullable<SyncConfig['webdav']>): Promise<SyncData> {
    const { url, username, password } = config;
    const fullUrl = url.endsWith('/') ? `${url}${SYNC_FILE_NAME}` : `${url}/${SYNC_FILE_NAME}`;
    
    const auth = btoa(`${username}:${password}`);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      }
    });

    if (!response.ok) {
      throw new Error(`WebDAV pull failed: ${response.statusText}`);
    }

    return await response.json();
  }
}
