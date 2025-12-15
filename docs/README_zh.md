<p align="center">
  <a href="https://byerun.pages.dev" target="_blank" rel="noopener noreferrer">
    <img width="160" height="160" src="../app/public/favicon.ico" alt="Byerun">
  </a>
</p>

<h1 align="center"/>Byerun <sup><em>web</em></sup></h1>

<p align="center">
告别 Unirun - 校园跑步助手网页版🏃‍♂️
</p>

## 支持的地图

| 学校列表                                     |
| -------------------------------------------- |
| [成都信息工程大学](https://cuit.edu.cn/)     |
| [成都中医药大学](https://cdutcm.edu.cn/)     |
| [四川省南充卫生学校](http://www.ncwsxx.com/) |
| ...                                          |

## 演示

| 部署平台   | Byerun                              | Unirun                              |
| ---------- | ----------------------------------- | ----------------------------------- |
| Cloudflare | [Byerun](https://byerun.pages.dev)  | [Unirun](https://unirun.pages.dev)  |
| Vercel     | [Byerun](https://byerun.vercel.app) | [Unirun](https://unirun.vercel.app) |

## 构建

进入项目文件夹：

```bash
cd app
```

安装依赖：

```bash
npm install-all
```

或

```bash
npm install
```

运行开发服务器：

```bash
npm run start
```

或

```bash
npm run dev
```

构建生产版本：

```bash
npm run build
```

## 服务器

支持在 Vercel 和 Cloudflare 上部署服务器后端。

功能：避免源服务器的跨域限制。

```mermaid
graph TD;

    classDef process fill:#E5F6FF,stroke:#73A6FF,stroke-width:2px;

    classDef error fill:#FFEBEB,stroke:#E68994,stroke-width:2px;



    A([ByerunWeb]):::process -->|直接请求| U([UnirunAPI]):::process

    U --> |跨域限制| E([请求失败]):::error

    A -->|转发请求| C([Cloudflare / Vercel]):::process

    C --> U

    U --> C

    C --> |返回响应| A
```

#### Cloudflare Worker

```
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': '*'
        }
      });
    } else {
      return handleRequest(request, env);
    }
  }
};

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const backendUrl = 'https://run-lb.tanmasports.com/v1' + url.pathname + url.search;

  const newHeaders = new Headers(request.headers);
  newHeaders.delete('Host');

  const init = {
    method: request.method,
    headers: newHeaders,
    body: request.method === 'GET' ? null : await request.clone().text()
  };

  const response = await fetch(backendUrl, init);

  const responseHeaders = new Headers(response.headers);
  responseHeaders.set('Access-Control-Allow-Origin', '*');
  responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  responseHeaders.set('Access-Control-Allow-Headers', '*');

  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: responseHeaders
  });
}
```

## 免责声明

本项目仅供学习与研究使用，不得用于任何商业或非法用途。如需体验完整功能，请使用官方 App。

因使用本项目导致的任何直接或间接的风险损害，无论性质如何，均由使用者自行承担，开发者对用户的违法行为不承担任何责任。

如官方认为本项目不妥，请通过 Issues 联系我们，我们将进行修改或移除。

## 致谢

[@msojocs/AutoRun](https://github.com/msojocs/AutoRun)

## 许可证

Byerun 基于 [CC BY-NC License, Version 4.0](https://creativecommons.org/licenses/by-nc/4.0/) 发布。
