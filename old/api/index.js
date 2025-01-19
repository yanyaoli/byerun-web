const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const morgan = require('morgan');
const { createLogger, transports, format } = require('winston');

const app = express();
const port = 3000;

// 创建 winston 日志记录器
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'combined.log' })
  ]
});

// 使用 morgan 中间件记录 HTTP 请求日志
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// 设置请求主体大小限制
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*'
    });
    res.sendStatus(200);
  } else {
    next();
  }
});

app.all('*', async (req, res) => {
  const url = new URL(req.originalUrl, `http://${req.headers.host}`);
  const backendUrl = 'https://run-lb.tanmasports.com/v1' + url.pathname + url.search;

  logger.info(`Forwarding request to: ${backendUrl}`);

  const newHeaders = { ...req.headers };
  delete newHeaders.host;

  const init = {
    method: req.method,
    headers: newHeaders,
    body: req.method === 'GET' ? null : JSON.stringify(req.body)
  };

  try {
    const response = await fetch(backendUrl, init);
    const body = await response.text();

    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*'
    });

    res.status(response.status).send(body);
  } catch (error) {
    logger.error(`Error during fetch: ${error.message}`);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
});