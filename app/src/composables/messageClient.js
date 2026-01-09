import { io } from 'socket.io-client';

class MessageClient {
  constructor({ baseUrl = 'http://localhost:3000', token = null } = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = token;
    this.socket = null; // 初始化 socket 实例
    this.events = {}; // 简单的事件订阅系统
  }

  setToken(token) {
    this.token = token;
    // 如果 token 变更且 socket 已连接，建议断开重连以同步权限
    if (this.socket) {
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
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (!this.events[event]) return;
    if (callback) {
      this.events[event] = this.events[event].filter((cb) => cb !== callback);
    } else {
      this.events[event] = [];
    }
  }

  _emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach((cb) => cb(data));
    }
  }

  /**
   * 内部请求封装
   */
  async _fetch(path, opts = {}) {
    const headers = Object.assign(
      { 'Content-Type': 'application/json' },
      opts.headers || {}
    );
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const res = await fetch(
      this.baseUrl + path,
      Object.assign({}, opts, { headers })
    );

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
      const err = new Error('invalid_response');
      err.code = 'invalid_response';
      err.payload = { status: res.status, ok: res.ok };
      throw err;
    }

    if (!json.success) {
      const err = new Error(json.message || 'api_error');
      err.code = json.code || 'api_error';
      err.payload = json;
      throw err;
    }
    return json.data;
  }

  // --- Health ---
  async health() {
    return this._fetch('/health', { method: 'GET' });
  }

  // --- Profile ---
  /**
   * 获取我的资料
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
   * @param {string} userid - 目标用户的 user_id (雪花 ID)
   */
  async getUserInfo(userid) {
    if (!userid) throw new Error('userid is required');
    return this._fetch(`/api/user/info/${encodeURIComponent(String(userid))}`, {
      method: 'GET',
    });
  }

  /**
   * 获取头像地址
   * @param {string} identifier - 应用内 user_id 或脱敏后的标识符
   */
  getAvatarUrl(identifier) {
    if (!identifier) throw new Error('identifier is required');
    return `${this.baseUrl}/api/avatar/${encodeURIComponent(
      String(identifier)
    )}`;
  }

  // --- Messages ---
  /**
   * 分页获取消息列表，返回 { messages: Message[], hasNext: boolean }
   * @param {number} page
   * @param {number} size
   */
  async listMessages(page = 1, size = 20) {
    const q = `?page=${encodeURIComponent(page)}&size=${encodeURIComponent(
      size
    )}`;
    return this._fetch(`/api/message/list${q}`, { method: 'GET' });
  }

  /**
   * 发送消息
   * @param {string} content - 消息正文
   * @param {string|null} parentId - 父消息 of the message_id
   */
  async sendMessage(content, parentId = null) {
    const body = { content, parentId: parentId ? String(parentId) : null };
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
