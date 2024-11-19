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

### 1. **用途限制**
本项目的代码和功能仅供个人学习、技术研究和非商业性用途。任何违反本项目使用条款的行为，开发者不承担任何责任。

### 2. **数据安全**
本项目要求用户提供个人账号和密码等敏感信息。用户应当对自己的账号和密码的安全性负责。开发者不对由于用户提供错误信息、泄露或未经授权使用信息导致的任何损失或法律责任承担责任。

- 请确保使用该项目时，不泄露个人信息，避免使用相同的密码与其他重要账户绑定。
- 用户应当定期修改密码，确保账号安全。

### 3. **法律责任**
用户在使用本项目过程中，应遵守适用的法律法规，并承担因使用本项目产生的所有风险。用户不得通过本项目从事任何非法活动，开发者对于用户违法行为不承担任何责任。

### 4. **免责条款**
开发者对于因使用本项目而产生的任何直接或间接损失等不承担责任，使用本项目的所有风险由用户自行承担，开发者不对因项目使用过程中出现的任何问题或技术故障负责。

### 5. **服务中断与项目终止**
开发者保留随时修改、暂停或终止本项目的权利。由于不可预见的技术问题或其他原因，项目可能出现服务中断或暂停，开发者不对此类中断或暂停负责。

### 6. **隐私保护**
本项目不会主动收集用户的个人信息，不对用户自行公开隐私信息的行为负责，包含但不限于：因自行部署而将配置文件或环境变量等信息公布在与本项目有关的Issues或Pull requests中。

### 7. **第三方服务**
本项目可能与第三方服务进行集成。对于这些第三方服务提供商的服务质量、稳定性或安全性，开发者不做任何保证。使用这些服务时，用户应当遵循第三方服务商的相关条款。

### 8. **修改与更新**
开发者有权根据需要修改、更新或停止本项目的任何部分。所有更新和修改将发布在项目的相关平台或存储库，用户应定期查看并遵守最新版本的使用条款。

### 9. **终止使用**
用户可以随时停止使用本项目。如果用户不同意本免责声明中的任何条款，或在使用过程中遇到不适应的内容，应立即停止使用该项目。

## Credit

[@AutoRun](https://github.com/msojocs/AutoRun)

[@Byerun](https://github.com/yanyaoli/byerun)