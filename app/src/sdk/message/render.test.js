import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { messageSdkConfig } from './config.js';
import { renderContent } from './render.js';

describe('renderContent', () => {
  beforeEach(() => {
    messageSdkConfig.apiBaseUrl = 'https://chat.example.com';
  });

  it('转义普通消息中的 HTML 与事件属性', () => {
    const output = renderContent([
      { type: 'text', value: '<img src=x onerror="alert(1)"><script>alert(2)</script>' },
    ]);

    assert.match(output, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
    assert.match(output, /&lt;script&gt;alert\(2\)&lt;\/script&gt;/);
    assert.doesNotMatch(output, /<script>/);
    assert.doesNotMatch(output, /<img src=x/);
  });

  it('保留文本中的 emoji 渲染能力', () => {
    const output = renderContent([{ type: 'text', value: '你好😀' }]);

    assert.match(output, /你好/);
    assert.match(
      output,
      /https:\/\/cdn\.jsdelivr\.net\/gh\/twitter\/twemoji@latest\/assets\/svg\/1f600\.svg/,
    );
    assert.match(output, /alt="emoji"/);
  });

  it('只将安全 URL 渲染为贴纸图片', () => {
    const safeOutput = renderContent([{ type: 'sticker', value: 'https://cdn.example.com/happy.png' }]);
    const unsafeOutput = renderContent([{ type: 'sticker', value: 'javascript:alert(1)' }]);

    assert.match(safeOutput, /<img src="https:\/\/cdn\.example\.com\/happy\.png"/);
    assert.equal(unsafeOutput, 'javascript:alert(1)');
    assert.doesNotMatch(unsafeOutput, /<img/);
  });

  it('转义贴纸属性，阻止属性逃逸', () => {
    const output = renderContent([
      { type: 'sticker', value: 'https://cdn.example.com/a.png" onerror="alert(1)' },
    ]);

    assert.match(output, /&quot; onerror=&quot;alert\(1\)/);
    assert.doesNotMatch(output, / onerror="alert\(1\)/);
  });

  it('兼容旧格式贴纸标签，同时转义标签之外的文本', () => {
    const output = renderContent(
      '前缀<img src="https://cdn.example.com/legacy.png" onerror="alert(1)" atk-emoticon="happy">后缀<b>危险</b>',
    );

    assert.match(output, /前缀<img src="https:\/\/cdn\.example\.com\/legacy\.png"/);
    assert.match(output, /atk-emoticon="happy"/);
    assert.doesNotMatch(output, /onerror/);
    assert.match(output, /后缀&lt;b&gt;危险&lt;\/b&gt;/);
  });

  it('对聊天图片的文件键进行 URL 编码', () => {
    const output = renderContent([{ type: 'image', value: '../secret?x=<script>' }]);

    assert.match(
      output,
      /src="https:\/\/chat\.example\.com\/api\/image\/\.\.%2Fsecret%3Fx%3D%3Cscript%3E"/,
    );
  });

  it('转义自定义聊天接口地址中的属性字符', () => {
    messageSdkConfig.apiBaseUrl = 'https://chat.example.com/\" onerror=\"alert(1)';

    const output = renderContent([{ type: 'image', value: 'photo.webp' }]);

    assert.match(output, /&quot; onerror=&quot;alert\(1\)\/api\/image\/photo\.webp/);
    assert.doesNotMatch(output, / onerror="alert\(1\)/);
  });

  it('忽略格式错误的消息片段', () => {
    assert.equal(
      renderContent([null, undefined, { type: 'text', value: '有效消息' }]),
      '有效消息',
    );
  });
});
