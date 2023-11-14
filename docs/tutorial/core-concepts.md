---
sidebar_position: 1
---

# 核心概念

## 经典 Slim

为了更快速的启用 Slim，`slim.Classic` 提供了一些默认的组件以方便 Web 开发:

```go
s := slim.Classic()
// ... 可以在这里使用中间件和注册路由
http.ListenAndServe(":8080", s)
```

下面是 `slim.Classic` 已经包含的功能：

* 请求/响应日志 - `slim.Logging`
* 容错恢复 - `slim.Recover`
* 静态文件服务 - `slim.Static`


## Slim 实例

任何类型为 `slim.Slim` 的对象都可以被认为是 `Slim` 的实例，您可以在单个程序中使用任意数量的 `Slim` 实例。


## 处理器

处理器是 Slim 最底层和最核心的，是用于处理网络请求的函数，它接受一个类型为 `slim.Context` 的参数，
通过返回一个错误对象来表示是否处理成功。

```go
s := slim.Classic() // 创建 Slim
r := s.Router()     // 返回路由器
// 添加访问路径为 `/` 的处理器
r.GET("/", func(c slim.Context) error {
	return c.String(http.StatusOK, "Hello world!")
})
```

### 处理器上下文

我们处理器函数接受的参数，是一个实现了 `slim.Context` 接口的实例，表示当前 HTTP 请求的上下文。
该上下文接口定义了丰富的方法，主要有以下几点：

* 与请求相关的方法
* 与响应相关的方法
* 路由信息
* 内容协商
* 附加属性


### 处理器返回值

在处理器中，我们的关注点应该是在的业务逻辑上，任何与此相悖的结果都可以**通过返回一个错误值来交给错误机制处理**。

```go
s.POST("/books", func(c slim.Context) error {
    var book Book

    // 将请求参数绑定到 book 实例上，我们业务逻辑可以
    // 不用关心具体错误，直接将这个错误值 return 出去
    err := c.Bind(&book)
    if err != nil {
        return err
    }

    // 同样的，我们也可以不用关心最终是否被成功保存的数据库中
    err := db.Create(&book)
    if err != nil {
        return err
    }

	return c.JSON(http.StatusOK, slim.Map{
		"book": book,
		//... 其它数据
    })
})
```

## 中间件

中间件处理器是工作于请求和路由之间的，您可以使用如下方法来添加一个中间件处理器到队列中:

```go
s.Use(func(c slim.Context, next slim.HandlerFunc) error {
  // todo ...
})
```

中间件处理器可以非常好的处理一些功能，包括日志记录、授权认证、会话（sessions）处理、错误反馈等其他任何需要在发生在 HTTP 请求之前或者之后的操作:

```go
// 验证一个 API 密钥
s.Use(func(c slim.Context, next slim.HandlerFunc) error {
    if c.Header("X-API-KEY") != "secret123" {
		return ErrUnauthorized
    }
	return next(c)
})
```
