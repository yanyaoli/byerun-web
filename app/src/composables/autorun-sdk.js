export class ApiBusinessError extends Error {
  constructor(envelope) {
    super(envelope?.message || `API business error: ${envelope?.code}`);
    this.name = "ApiBusinessError";
    this.envelope = envelope;
  }
}

export class AutorunClient {
  /**
   * @param {{ baseURL: string, headers?: Record<string, string>, fetchImpl?: typeof fetch }} options
   */
  constructor(options) {
    this.baseURL = options.baseURL.replace(/\/+$/, "");
    this.headers = options.headers || {};
    const rawFetch = options.fetchImpl || globalThis.fetch;
    this.fetchImpl = (...args) => rawFetch.call(globalThis, ...args);
  }

  ping(requestId) {
    return this.request("/ping", { method: "GET" }, requestId);
  }

  getMaps(requestId) {
    return this.request("/api/maps", { method: "GET" }, requestId);
  }

  /** @param {{ phone: string, password: string }} body */
  login(body, requestId) {
    return this.request(
      "/api/login",
      { method: "POST", body: JSON.stringify(body) },
      requestId
    );
  }

  /** @param {string} token @param {{ map_id?: string, cron?: string, enabled: 0|1 }} body */
  register(token, body, requestId) {
    return this.request(
      "/api/register",
      { method: "POST", headers: this.authHeaders(token), body: JSON.stringify(body) },
      requestId
    );
  }

  /** @param {string} token */
  getConfig(token, requestId) {
    return this.request(
      "/api/config",
      { method: "POST", headers: this.authHeaders(token), body: JSON.stringify({}) },
      requestId
    );
  }

  /** @param {string} token */
  getStatus(token, requestId) {
    return this.request(
      "/api/status",
      { method: "POST", headers: this.authHeaders(token), body: JSON.stringify({}) },
      requestId
    );
  }

  /** @param {string} token @param {{ map_id?: string, mapid?: string }} [query] */
  getRandom(token, query = {}, requestId) {
    const params = new URLSearchParams();
    const mapId = String(query?.map_id ?? "").trim();
    const mapIdCompat = String(query?.mapid ?? "").trim();
    if (mapId) params.set("map_id", mapId);
    if (!mapId && mapIdCompat) params.set("mapid", mapIdCompat);

    const suffix = params.toString();
    const path = suffix ? `/api/random?${suffix}` : "/api/random";

    return this.request(path, { method: "GET", headers: this.authHeaders(token) }, requestId);
  }

  authHeaders(token) {
    return { Authorization: `Bearer ${token}` };
  }

  async request(path, init, requestId) {
    const headers = {
      "Content-Type": "application/json",
      ...this.headers,
      ...(init.headers || {}),
    };
    if (requestId) {
      headers["X-Request-Id"] = requestId;
    }

    const resp = await this.fetchImpl(`${this.baseURL}${path}`, {
      ...init,
      headers,
    });

    if (!resp.ok) {
      throw new Error(`HTTP error: ${resp.status}`);
    }

    const envelope = await resp.json();
    if (!envelope.success) {
      throw new ApiBusinessError(envelope);
    }
    return envelope;
  }
}
