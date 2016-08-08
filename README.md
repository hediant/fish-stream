# Event Stream Server

   事件流服务器

## **依赖**

* PM2 1.1.3+

## **安装**

> cd stream

> npm install

## **运行**

> ./sbin/stream.sh start

## **停止**

> ./sbin/stream.sh stop

## **配置说明**

配置文件的路径: config/config.js

```javascript
{
	"appName" : 'stream service',
	"bufferLen" : 30000,
	"readMax" : 1024,
	"ioPort" : 10016,
	"diagnosis" : true,
	"diagnosis-interval" : 15 * 60 * 1000 // 15 mins
}
```