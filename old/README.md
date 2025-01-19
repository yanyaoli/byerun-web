<p align="center">
  <a href="https://byerun.pages.dev" target="_blank" rel="noopener noreferrer">
    <img width="160" height="160" src="./public/favicon.ico" alt="Byerun">
  </a>
</p>

<h1 align="center"/>Byerun <sup><em>web</em></sup></h1>

<p align="center">
Goodbye Unirun - Campus Running Assistant Web Version🏃‍♂️
</p>

<p align="center">
  <a href="https://byerun.pages.dev/" target="_blank" rel="noopener noreferrer" >
    <img src="./intro/intro.jfif" alt="Byerun screenshots" width="600" height="auto">
  </a>
</p>

## Supported Maps

| School List |
| --- |
| [Chengdu University of Information Technology](https://cuit.edu.cn/) |
| [Chengdu University of Traditional Chinese Medicine](https://cdutcm.edu.cn/) |
| [Nanchong Health School of Sichuan Province](http://www.ncwsxx.com/) |
| ... |


## Demo

| Deployment Platform | Byerun | Unirun |
| --- | --- | --- |
| Cloudflare | [Byerun](https://byerun.pages.dev) | [Unirun](https://unirun.pages.dev) |
| Vercel | [Byerun](https://byerun.vercel.app) | [Unirun](https://unirun.vercel.app) |


## Build

Install dependencies:

```bash
npm install-all
```

Run for development:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Cloudflare Worker

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

## Disclaimer

This project is for learning and research purposes only and shall not be used for any commercial or illegal purposes. If you need to experience the full functionality, please use the official App.

Any direct or indirect risk damage of any nature caused by the use of this project shall be borne by the user, and the developer shall not bear any responsibility for the user's illegal behavior.

If the official believes that this project is inappropriate, please contact us through Issues and we will modify or remove it.

## Acknowledgements

[@msojocs/AutoRun](https://github.com/msojocs/AutoRun)

## License
Byerun is released under the [CC BY-NC License, Version 4.0](https://creativecommons.org/licenses/by-nc/4.0/).



