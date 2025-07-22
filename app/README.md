# byerun-web

本项目为基于 Vite + Vue3 + TypeScript 的极简前端实现，主要功能包括：

- 用户登录
- 获取用户信息
- 跑步信息展示

## 启动方式

1. 安装依赖：
   ```bash
   npm install
   ```
2. 启动开发服务器：
   ```bash
   npm run dev
   ```

## API 说明

详细接口文档请见 `API.md`。

## 环境变量

请在根目录下创建 `.env` 文件，配置如下：

```
VITE_API_BASE_URL=你的后端API地址
VITE_APP_KEY=你的appKey
```

## 目录结构

- `src/` 主要源码目录
- `API.md` 接口文档
- `.env` 环境变量配置

---

如需扩展功能，请参考 `API.md` 文档。
