# Byerun Web

Goodbye Unirun  校园跑助手网页版

### 功能

- [x] 在线登录登出
- [x] 密码修改重置
- [x] 跑步记录查询
- [x] 跑步记录生成
- [x] 俱乐部活动查询
- [x] 俱乐部活动报名


| 地图支持 |
| --- |
| 成都信息工程大学（航空港校区） |
| 成都信息工程大学（龙泉校区） |
| 成都中医药大学（温江校区） |
| 四川省南充卫生学校 |
| ... |

### Demo

<img src="./intro/intro.jfif" alt="banner" height=300 />

## 使用

|Deployment Platform|||
|---|---|---|
|Cloudflare|[Byerun](https://byerun.pages.dev)|[Unirun](https://unirun.pages.dev)|
|Vercel|[Byerun](https://byerun.vercel.app)|[Unirun](https://unirun.vercel.app)|


## 编译

安装依赖：

```bash
npm install-all
```

运行调试：

```bash
npm run dev
```

打包：

```bash
npm run build
```

## APIs

| Name |Url |
| -------- | -------- |
| baseURL | run-lb.tanmasports.com/v1 |
| 登录 | `${baseURL}/auth/login/password` |
| 用户信息查询 | `${baseURL}/auth/query/token` |
| 完成率信息查询 | `${baseURL}/clubactivity/getJoinNum` |
| 标准信息查询 | `${baseURL}/unirun/query/runStandard` |
| 跑步信息查询 | `${baseURL}/unirun/query/runInfo` |
| 跑步历史记录查询 | `${baseURL}/unirun/query/student/all/run/record` |
| 跑步新纪录提交 | `${baseURL}/unirun/save/run/record/new` |
| 俱乐部活动查询 | `${baseURL}/clubactivity/querySemesterClubActivity` |
| 俱乐部参与记录查询 | `${baseURL}/clubactivity/queryMyActivityList` |
| 已报名俱乐部查询 | `${baseURL}/clubactivity/queryMySemesterClubActivity` |
| 俱乐部状态查询 | `${baseURL}/clubactivity/joinOrCancelSchoolSemesterActivity` |
| 发送验证码 | `${baseURL}/auth/sendSmsForPassWord` |
| 重置密码 | `${baseURL}/auth/updateUserPassWord` |



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

  // 克隆请求的头部
  const newHeaders = new Headers(request.headers);
  // 删除可能影响签名的头部
  newHeaders.delete('Host');

  const init = {
    method: request.method,
    headers: newHeaders,
    body: request.method === 'GET' ? null : await request.clone().text()
  };

  const response = await fetch(backendUrl, init);

  const responseHeaders = new Headers(response.headers);
  // 设置跨域相关头部
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

使用本项目所产生的任何后果，用户需自行承担。

本项目仅供学习交流使用，不得用于任何商业用途。

使用本项目即代表你同意以下声明：

1. 本项目不对任何数据的准确性、完整性或适用性做出任何保证。
2. 用户在使用本项目过程中，应遵守相关法律法规，不得利用本项目从事任何违法活动。
3. 本项目的开发者不对因使用本项目而产生的任何直接或间接损失承担责任。
4. 用户应自行承担因使用本项目而可能产生的所有风险。
5. 本项目的开发者保留随时修改或终止本项目的权利。

## Credit

[@AutoRun](https://github.com/msojocs/AutoRun)

[@Byerun](https://github.com/yanyaoli/byerun)