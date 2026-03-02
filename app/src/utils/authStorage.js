const AUTH_SESSION_KEY = 'unirun_session_data';
const CHAT_USER_DATA_KEY = 'unorun_chat_userData';
const CHAT_USER_ID_KEY = 'unorun_chat_userId';

const getSessionStorage = () =>
  typeof window !== 'undefined' ? window.sessionStorage : null;

const safeParseJson = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

export const readSessionAuthData = () => {
  const session = getSessionStorage();
  if (!session) return {};
  const parsed = safeParseJson(session.getItem(AUTH_SESSION_KEY));
  return parsed && typeof parsed === 'object' ? parsed : {};
};

export const writeSessionAuthData = (data) => {
  const session = getSessionStorage();
  if (!session) return;

  const hasAuthData =
    !!data &&
    (data.userInfo || data.runInfo || data.runStandard || data.activityInfo);

  if (hasAuthData) {
    session.setItem(AUTH_SESSION_KEY, JSON.stringify(data));
  } else {
    session.removeItem(AUTH_SESSION_KEY);
  }
};

export const getSessionToken = () => {
  return readSessionAuthData().userInfo?.oauthToken?.token || '';
};

export const readCachedChatUser = () => {
  const session = getSessionStorage();
  if (!session) return null;
  return safeParseJson(session.getItem(CHAT_USER_DATA_KEY));
};

export const writeCachedChatUser = (user) => {
  const session = getSessionStorage();
  if (!session) return;

  if (user && typeof user === 'object') {
    session.setItem(CHAT_USER_DATA_KEY, JSON.stringify(user));
    if (user.user_id !== undefined && user.user_id !== null) {
      session.setItem(CHAT_USER_ID_KEY, String(user.user_id));
    }
    return;
  }

  session.removeItem(CHAT_USER_DATA_KEY);
  session.removeItem(CHAT_USER_ID_KEY);
};

export const getCachedChatUserId = () => {
  const session = getSessionStorage();
  if (!session) return null;

  const cachedId = session.getItem(CHAT_USER_ID_KEY);
  if (cachedId) return cachedId;
  const cachedUser = readCachedChatUser();
  if (cachedUser?.user_id !== undefined && cachedUser?.user_id !== null) {
    const userId = String(cachedUser.user_id);
    session.setItem(CHAT_USER_ID_KEY, userId);
    return userId;
  }
  return null;
};

export const clearAuthSessionStorage = () => {
  const session = getSessionStorage();
  if (!session) return;
  session.removeItem(AUTH_SESSION_KEY);
  session.removeItem(CHAT_USER_DATA_KEY);
  session.removeItem(CHAT_USER_ID_KEY);
};
