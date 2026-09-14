import test from 'node:test';
import assert from 'node:assert/strict';
import { runStorageMigration } from './storageMigration.js';

class MemoryStorage {
  constructor(entries = {}, { failAppStateWrites = false } = {}) {
    this.data = new Map(Object.entries(entries));
    this.failAppStateWrites = failAppStateWrites;
  }

  getItem(key) {
    return this.data.has(key) ? this.data.get(key) : null;
  }

  setItem(key, value) {
    if (this.failAppStateWrites && key === 'byerun.app_state') {
      throw new Error('storage write failed');
    }
    this.data.set(key, String(value));
  }

  removeItem(key) {
    this.data.delete(key);
  }
}

function useStorage(entries, options) {
  const storage = new MemoryStorage(entries, options);
  globalThis.localStorage = storage;
  globalThis.window = { localStorage: storage };
  return storage;
}

test('从版本 1 升级时删除已保存的密码并保留其他状态', () => {
  const originalState = {
    userInfo: { userId: 42 },
    rememberLogin: true,
    savedPhone: '13800138000',
    savedPassword: 'plain-text-password',
    activeTab: 'records',
  };
  const storage = useStorage({
    'byerun.migration_version': '1',
    'byerun.app_state': JSON.stringify(originalState),
  });

  runStorageMigration();

  assert.deepEqual(JSON.parse(storage.getItem('byerun.app_state')), {
    userInfo: { userId: 42 },
    rememberLogin: true,
    savedPhone: '13800138000',
    activeTab: 'records',
  });
  assert.equal(storage.getItem('byerun.migration_version'), '2');
});

test('从旧存储键迁移时不会把密码带入新状态', () => {
  const storage = useStorage({
    'unirun.app_state': JSON.stringify({
      rememberLogin: true,
      savedPhone: '13800138000',
      savedPassword: 'legacy-password',
      activeTab: 'submit',
    }),
    'byerun.app_state': JSON.stringify({ activeTab: 'records' }),
  });

  runStorageMigration();

  assert.deepEqual(JSON.parse(storage.getItem('byerun.app_state')), {
    rememberLogin: true,
    savedPhone: '13800138000',
    activeTab: 'records',
  });
  assert.equal(storage.getItem('unirun.app_state'), null);
  assert.equal(storage.getItem('byerun.migration_version'), '2');
});

test('不存在密码字段时不重写应用状态', () => {
  const appState = JSON.stringify({ savedPhone: '13800138000', activeTab: 'submit' });
  const storage = useStorage({
    'byerun.migration_version': '1',
    'byerun.app_state': appState,
  });

  runStorageMigration();

  assert.equal(storage.getItem('byerun.app_state'), appState);
  assert.equal(storage.getItem('byerun.migration_version'), '2');
});

test('应用状态损坏时清除整项存储，避免遗留明文密码', () => {
  const storage = useStorage({
    'byerun.migration_version': '1',
    'byerun.app_state': '{"savedPassword":"plain-text-password"',
  });

  runStorageMigration();

  assert.equal(storage.getItem('byerun.app_state'), null);
  assert.equal(storage.getItem('byerun.migration_version'), '2');
});

test('清理后的状态写入失败时删除整项存储', () => {
  const storage = useStorage(
    {
      'byerun.migration_version': '1',
      'byerun.app_state': JSON.stringify({
        savedPhone: '13800138000',
        savedPassword: 'plain-text-password',
      }),
    },
    { failAppStateWrites: true },
  );

  runStorageMigration();

  assert.equal(storage.getItem('byerun.app_state'), null);
  assert.equal(storage.getItem('byerun.migration_version'), '2');
});
