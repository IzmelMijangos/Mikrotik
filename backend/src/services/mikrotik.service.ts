import RouterOSAPI from 'routeros';

export interface MikrotikConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  timeout?: number;
}

export interface HotspotUser {
  username: string;
  password: string;
  profile: string;
  limitUptime?: string;
  limitBytesTotal?: string;
  comment?: string;
}

export class MikrotikService {
  private config: MikrotikConfig;

  constructor(config: MikrotikConfig) {
    this.config = {
      ...config,
      timeout: config.timeout || 5000,
    };
  }

  private async connect(): Promise<RouterOSAPI> {
    const api = new RouterOSAPI({
      host: this.config.host,
      port: this.config.port,
      user: this.config.username,
      password: this.config.password,
      timeout: this.config.timeout,
    });

    await api.connect();
    return api;
  }

  async testConnection(): Promise<boolean> {
    try {
      const api = await this.connect();
      await api.close();
      return true;
    } catch (error) {
      console.error('MikroTik connection test failed:', error);
      return false;
    }
  }

  async createHotspotUser(user: HotspotUser): Promise<string> {
    let api: RouterOSAPI | null = null;
    try {
      api = await this.connect();

      const params: any = {
        name: user.username,
        password: user.password,
        profile: user.profile,
      };

      if (user.limitUptime) {
        params['limit-uptime'] = user.limitUptime;
      }

      if (user.limitBytesTotal) {
        params['limit-bytes-total'] = user.limitBytesTotal;
      }

      if (user.comment) {
        params.comment = user.comment;
      }

      const result = await api.write('/ip/hotspot/user/add', params);

      await api.close();
      return result[0].ret;
    } catch (error: any) {
      if (api) await api.close();
      throw new Error(`Failed to create hotspot user: ${error.message}`);
    }
  }

  async removeHotspotUser(username: string): Promise<void> {
    let api: RouterOSAPI | null = null;
    try {
      api = await this.connect();

      // Find user by name
      const users = await api.write('/ip/hotspot/user/print', {
        '?name': username,
      });

      if (users.length === 0) {
        throw new Error(`User ${username} not found`);
      }

      const userId = users[0]['.id'];
      await api.write('/ip/hotspot/user/remove', {
        '.id': userId,
      });

      await api.close();
    } catch (error: any) {
      if (api) await api.close();
      throw new Error(`Failed to remove hotspot user: ${error.message}`);
    }
  }

  async getUserInfo(username: string): Promise<any> {
    let api: RouterOSAPI | null = null;
    try {
      api = await this.connect();

      const users = await api.write('/ip/hotspot/user/print', {
        '?name': username,
      });

      await api.close();

      if (users.length === 0) {
        return null;
      }

      return users[0];
    } catch (error: any) {
      if (api) await api.close();
      throw new Error(`Failed to get user info: ${error.message}`);
    }
  }

  async listProfiles(): Promise<any[]> {
    let api: RouterOSAPI | null = null;
    try {
      api = await this.connect();

      const profiles = await api.write('/ip/hotspot/user/profile/print');

      await api.close();
      return profiles;
    } catch (error: any) {
      if (api) await api.close();
      throw new Error(`Failed to list profiles: ${error.message}`);
    }
  }

  async getActiveUsers(): Promise<any[]> {
    let api: RouterOSAPI | null = null;
    try {
      api = await this.connect();

      const activeUsers = await api.write('/ip/hotspot/active/print');

      await api.close();
      return activeUsers;
    } catch (error: any) {
      if (api) await api.close();
      throw new Error(`Failed to get active users: ${error.message}`);
    }
  }

  async disconnectUser(username: string): Promise<void> {
    let api: RouterOSAPI | null = null;
    try {
      api = await this.connect();

      // Find active session
      const activeSessions = await api.write('/ip/hotspot/active/print', {
        '?user': username,
      });

      if (activeSessions.length === 0) {
        throw new Error(`No active session found for user ${username}`);
      }

      const sessionId = activeSessions[0]['.id'];
      await api.write('/ip/hotspot/active/remove', {
        '.id': sessionId,
      });

      await api.close();
    } catch (error: any) {
      if (api) await api.close();
      throw new Error(`Failed to disconnect user: ${error.message}`);
    }
  }

  async updateUserProfile(username: string, newProfile: string): Promise<void> {
    let api: RouterOSAPI | null = null;
    try {
      api = await this.connect();

      // Find user by name
      const users = await api.write('/ip/hotspot/user/print', {
        '?name': username,
      });

      if (users.length === 0) {
        throw new Error(`User ${username} not found`);
      }

      const userId = users[0]['.id'];
      await api.write('/ip/hotspot/user/set', {
        '.id': userId,
        profile: newProfile,
      });

      await api.close();
    } catch (error: any) {
      if (api) await api.close();
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }
}
