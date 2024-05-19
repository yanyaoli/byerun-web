# unirun-web

校园跑助手网页版，欢迎加入维护~

## 使用

- [Cloudflare](https://unirun.pages.dev)

- [Vercel](https://unirun.vercel.app)


## 运行

安装依赖：

```bash
npm install
```

运行调试：

```bash
npm run serve
```

打包：

```bash
npm run build
```

## 主要API

| Name |Url |
| -------- | -------- |
| baseURL | https://run-lb.tanmasports.com/v1 |
| 登录 | `${baseURL}/auth/login/password` |
| 用户信息 | `${baseURL}/auth/query/token` |
| 完成率信息 | `${baseURL}/clubactivity/getJoinNum` |
| 标准信息 | `${baseURL}/unirun/query/runStandard` |
| 新纪录 | `${baseURL}/unirun/save/run/record/new` |
| 俱乐部信息 | `${baseURL}/clubactivity/querySemesterClubActivity` |
| 俱乐部参与记录 | `${baseURL}/clubactivity/queryMyActivityList` |
| 待签到俱乐部 | `${baseURL}/clubactivity/queryMySemesterClubActivity` |
| 俱乐部加入退出状态 | `${baseURL}/clubactivity/joinOrCancelSchoolSemesterActivity` |