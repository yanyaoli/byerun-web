import { io } from 'socket.io-client';

class MessageClient {
  constructor({ baseUrl = 'http://localhost:3000', token = null } = {}) {
    this.baseUrl = String(baseUrl).replace(/\/$/, '');
    this.token = token;
    this.socket = null; // 初始化 socket 实例
    this.events = Object.create(null); // 简单的事件订阅系统
  }

  setToken(token, { reconnect = true } = {}) {
    const nextToken = token || null;
    if (this.token === nextToken) return;
    this.token = nextToken;
    // 如果 token 变更且 socket 已连接，建议断开重连以同步权限
    if (reconnect && this.socket) {
      this.disconnectSocket();
      this.connectSocket();
    }
  }

  /**
   * 初始化 WebSocket 连接
   */
  connectSocket() {
    if (this.socket) return;

    // 连接时带上 auth token
    this.socket = io(this.baseUrl, {
      auth: { token: this.token },
      transports: ['websocket', 'polling'],
      pingInterval: 25000,
      pingTimeout: 20000,
    });

    // 监听后端发出的实时事件
    this.socket.on('new_message', (msg) => this._emit('message', msg));
    this.socket.on('delete_message', (data) => this._emit('delete', data));

    this.socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err.message);
      this._emit('error', err);
      // 如果是鉴权失败，可以在这里触发一个全局事件提醒用户重新登录
      if (err.message === 'Authentication error: Token missing') {
        this._emit('auth_error', err);
      }
    });
  }

  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * 事件监听接口
   * @param {'message'|'delete'} event
   * @param {Function} callback
   */
  on(event, callback) {
    if (!this.events[event]) this.events[event] = new Set();
    this.events[event].add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.events[event]) return;
    if (callback) {
      this.events[event].delete(callback);
    } else {
      this.events[event].clear();
    }
    if (this.events[event].size === 0) delete this.events[event];
  }

  _emit(event, data) {
    const listeners = this.events[event];
    if (!listeners) return;
    listeners.forEach((cb) => cb(data));
  }

  /**
   * 内部请求封装
   */
  async _fetch(path, opts = {}) {
    const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const res = await fetch(this.baseUrl + path, Object.assign({}, opts, { headers }));

    // 统一处理 401
    if (res.status === 401) {
      const err = new Error('unauthorized');
      err.code = 'unauthorized';
      throw err;
    }

    // 尝试解析 JSON，失败则抛出可识别错误
    let json;
    try {
      json = await res.json();
    } catch (e) {
      const err = new Error(`invalid_json_response (${res.status})`);
      err.status = res.status;
      throw err;
    }

    if (!json.success) {
      const err = new Error(json.message || 'api_error');
      err.code = json.code;
      err.payload = json;
      throw err;
    }
    return json.data;
  }

  // --- Health ---
  async health() {
    return this._fetch('/health', { method: 'GET' });
  }

  // --- User ---
  /**
   * 获取当前登录用户的资料
   */
  async getProfile() {
    return this._fetch('/api/user/profile', { method: 'GET' });
  }

  /**
   * 更新用户信息
   */
  async updateUser({ nickname, qq } = {}) {
    return this._fetch('/api/user/update', {
      method: 'POST',
      body: JSON.stringify({ nickname, qq }),
    });
  }

  /**
   * 获取指定用户的公开资料
   * @param {string} userid - 用户 ID
   */
  async getUserInfo(userid) {
    if (!userid) throw new Error('userid is required');
    return this._fetch(`/api/user/info/${encodeURIComponent(String(userid))}`, {
      method: 'GET',
    });
  }

  /**
   * 获取头像完整地址
   * @param {string} userid - 用户 ID
   * @returns {string} 头像链接
   */
  getAvatarUrl(userid) {
    if (!userid) throw new Error('userid is required');
    return `${this.baseUrl}/api/avatar/${encodeURIComponent(String(userid))}`;
  }

  /**
   * 获取聊天图片代理链接
   * @param {string} fileKey - 图片存储 key
   * @returns {string} 代理后的图片链接
   */
  getImageUrl(fileKey) {
    if (!fileKey) throw new Error('fileKey is required');
    return `${this.baseUrl}/api/image/${encodeURIComponent(String(fileKey))}`;
  }

  // --- Messages ---
  /**
   * 上传聊天图片
   * @param {File|Blob} file - WebP 格式的图片文件（最大 2MB）
   * @returns {Promise<{fileKey: string}>} 返回存储 key，用于发送消息
   * @throws 若文件不是 WebP 格式，后端会返回 400 错误
   * @description 前端需要先使用 canvas/sharp 等工具将其他图片格式转换为 WebP，然后上传
   */
  async uploadImage(file) {
    if (!file) {
      throw new Error('file is required');
    }
    if (file.type !== 'image/webp') {
      throw new Error('Only WebP images are allowed');
    }

    const formData = new FormData();
    formData.append('file', file);

    const headers = {};
    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    const res = await fetch(this.baseUrl + '/api/message/upload', {
      method: 'POST',
      headers,
      body: formData,
    });
    const json = await res.json();
    if (!json.success) {
      const err = new Error(json.message || 'upload_error');
      err.code = json.code;
      err.payload = json;
      throw err;
    }
    return json.data;
  }

  /**
   * 分页获取消息列表，返回 { messages: Message[], hasNext: boolean }
   * @param {number} page
   * @param {number} size
   */
  async listMessages(page = 1, size = 20) {
    const q = `?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`;
    return this._fetch(`/api/message/list${q}`, { method: 'GET' });
  }
  async getUnreadState() {
    return this._fetch('/api/message/unread', { method: 'GET' });
  }

  _validateContent(content) {
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

  /**
   * 发送消息 - 支持混合内容
   * 支持的内容片段类型：text、image、sticker
   * @param {Array} content - 消息内容数组
   *   - {type: 'text', value: '文本内容'}  - 纯文本（支持 Unicode 表情符号）
   *   - {type: 'image', value: 'file_key'}  - 图片（WebP 格式）
   *   - {type: 'sticker', value: 'sticker_id'}  - 表情包
   * @param {string|null} parentId - 父消息的 message_id（可选，用于回复）
   * @example
   *   // 发送纯文本
   *   await client.sendMessage([{ type: 'text', value: 'Hello!' }]);
   *
   *   // 发送文本 + 图片
   *   await client.sendMessage([
   *     { type: 'text', value: 'Check this:' },
   *     { type: 'image', value: 'chat/abc123.webp' }
   *   ]);
   *
   *   // 发送表情包
   *   await client.sendMessage([{ type: 'sticker', value: 'sticker_happy_001' }]);
   *
   *   // 回复消息
   *   await client.sendMessage(
   *     [{ type: 'text', value: 'Thanks!' }],
   *     parentMessageId
   *   );
   */
  async sendMessage(content, parentId = null) {
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

  /**
   * 删除消息
   * @param {string} id - message_id
   */
  async deleteMessage(id) {
    if (!id) throw new Error('message id is required');
    return this._fetch('/api/message/delete', {
      method: 'POST',
      body: JSON.stringify({ id: String(id) }),
    });
  }
}

export default MessageClient;
