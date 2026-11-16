import { io, type Socket } from 'socket.io-client';
import type { ChatContentPart } from '@/types/domain';

export interface MessageClientOptions {
  baseUrl?: string;
  token?: string | null;
}

export class MessageClient {
  public baseUrl: string;
  public token: string | null;
  public socket: Socket | null;
  public events: Record<string, Set<(data: any) => void>>;

  constructor({ baseUrl = 'http://localhost:3000', token = null }: MessageClientOptions = {}) {
    this.baseUrl = String(baseUrl).replace(/\/$/, '');
    this.token = token;
    this.socket = null;
    this.events = Object.create(null);
  }

  setToken(token: string | null, { reconnect = true } = {}): void {
    const nextToken = token || null;
    if (this.token === nextToken) return;
    this.token = nextToken;
    if (reconnect && this.socket) {
      this.disconnectSocket();
      this.connectSocket();
    }
  }

  /**
   * 初始化 WebSocket 连接
   */
  connectSocket(): void {
    if (this.socket) return;

    this.socket = io(this.baseUrl, {
      auth: { token: this.token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    this.socket.on('new_message', (msg: any) => this._emit('message', msg));
    this.socket.on('delete_message', (data: any) => this._emit('delete', data));

    this.socket.on('connect_error', (err: any) => {
      console.error('WebSocket connection error:', err.message);
      this._emit('error', err);
      if (err.message === 'Authentication error: Token missing') {
        this._emit('auth_error', err);
      }
    });
  }

  disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * 事件监听接口
   */
  on(event: string, callback: (data: any) => void): () => void {
    if (!this.events[event]) this.events[event] = new Set();
    this.events[event].add(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback?: (data: any) => void): void {
    if (!this.events[event]) return;
    if (callback) {
      this.events[event].delete(callback);
    } else {
      this.events[event].clear();
    }
    if (this.events[event].size === 0) delete this.events[event];
  }

  _emit(event: string, data: any): void {
    const listeners = this.events[event];
    if (!listeners) return;
    listeners.forEach((cb) => cb(data));
  }

  /**
   * 内部请求封装
   */
  async _fetch(path: string, opts: RequestInit = {}): Promise<any> {
    const headers: Record<string, string> = Object.assign(
      { 'Content-Type': 'application/json' },
      (opts.headers as Record<string, string>) || {},
    );
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const res = await fetch(this.baseUrl + path, Object.assign({}, opts, { headers }));

    // 统一处理 401
    if (res.status === 401) {
      const err = new Error('unauthorized') as any;
      err.code = 'unauthorized';
      throw err;
    }

    // 尝试解析 JSON，失败则抛出可识别错误
    let json: any;
    try {
      json = await res.json();
    } catch {
      const err = new Error(`invalid_json_response (${res.status})`) as any;
      err.status = res.status;
      throw err;
    }

    if (!json.success) {
      const err = new Error(json.message || 'api_error') as any;
      err.code = json.code;
      err.payload = json;
      throw err;
    }
    return json.data;
  }

  // --- Health ---
  async health(): Promise<any> {
    return this._fetch('/health', { method: 'GET' });
  }

  // --- User ---
  async getProfile(): Promise<any> {
    return this._fetch('/api/user/profile', { method: 'GET' });
  }

  async updateUser({ nickname, qq }: { nickname?: string; qq?: string } = {}): Promise<any> {
    return this._fetch('/api/user/update', {
      method: 'POST',
      body: JSON.stringify({ nickname, qq }),
    });
  }

  async getUserInfo(userid: string | number): Promise<any> {
    if (!userid) throw new Error('userid is required');
    return this._fetch(`/api/user/info/${encodeURIComponent(String(userid))}`, {
      method: 'GET',
    });
  }

  getAvatarUrl(userid: string | number): string {
    if (!userid) throw new Error('userid is required');
    return `${this.baseUrl}/api/avatar/${encodeURIComponent(String(userid))}`;
  }

  getImageUrl(fileKey: string): string {
    if (!fileKey) throw new Error('fileKey is required');
    return `${this.baseUrl}/api/image/${encodeURIComponent(String(fileKey))}`;
  }

  // --- Messages ---
  async uploadImage(file: File | Blob): Promise<{ fileKey: string }> {
    if (!file) {
      throw new Error('file is required');
    }
    if (file.type !== 'image/webp') {
      throw new Error('Only WebP images are allowed');
    }

    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    const res = await fetch(this.baseUrl + '/api/message/upload', {
      method: 'POST',
      headers,
      body: formData,
    });
    const json = await res.json();
    if (!json.success) {
      const err = new Error(json.message || 'upload_error') as any;
      err.code = json.code;
      err.payload = json;
      throw err;
    }
    return json.data;
  }

  async listMessages(page = 1, size = 20): Promise<{ messages: any[]; hasNext: boolean }> {
    const q = `?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`;
    return this._fetch(`/api/message/list${q}`, { method: 'GET' });
  }

  async getUnreadState(): Promise<any> {
    return this._fetch('/api/message/unread', { method: 'GET' });
  }

  _validateContent(content: any[]): void {
    if (!Array.isArray(content)) {
      throw new Error('content must be an array, e.g. [{ type: "text", value: "Hello" }]');
    }

    const allowedTypes = new Set(['text', 'image', 'sticker']);
    content.forEach((seg, i) => {
      if (!seg || typeof seg !== 'object') {
        throw new Error(`content[${i}] must be an object`);
      }
      if (!allowedTypes.has(seg.type)) {
        throw new Error(`content[${i}].type must be one of: text, image, sticker`);
      }
      if (typeof seg.value !== 'string') {
        throw new Error(`content[${i}].value must be a string`);
      }
    });
  }

  async sendMessage(content: ChatContentPart[], parentId: string | number | null = null): Promise<any> {
    this._validateContent(content);
    const body = {
      content,
      parentId: parentId ? String(parentId) : null,
    };
    return this._fetch('/api/message/send', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async deleteMessage(id: string | number): Promise<any> {
    if (!id) throw new Error('message id is required');
    return this._fetch('/api/message/delete', {
      method: 'POST',
      body: JSON.stringify({ id: String(id) }),
    });
  }
}

export default MessageClient;
