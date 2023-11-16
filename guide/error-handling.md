---
sidebar_position: 7
---

# 错误处理

我们提倡通过从中间件函数和处理器函数返回错误来集中式处理错误。
然后使用统一的错误处理器函数将错误记录到外部服务上，并向客户端发送自定义的 HTTP 响应。

我们可以返回一个标准的错误 `error` 实例或者一个 `*slim.HTTPError` 对象。

例如，当基本身份验证中间件发现无效凭据时，返回 401（未经授权的错误）来中止当前 HTTP 请求：

```go {6} title="身份认证"
e.Use(func(c slim.Context, next slim.HandlerFunc) error {
    // Extract the credentials from HTTP request header and perform a security
    // check

    // For invalid credentials
    return slim.NewHTTPError(http.StatusUnauthorized, "Please provide valid credentials")

    // For valid credentials call next
    // return next(c)
})
```

也可以返回一个错误信息的 slim.HTTPError 实例 `slim.NewHTTPError(http.StatusUnauthorized)`，在这种情况下，Slim 将使用状态文本 "Unauthorized" 作为错误消息。

## 默认错误处理程序

Slim 提供了一个默认的 HTTP 错误处理程序，它使用了 Go 的标准库函数 `http.Error` 来响应错误。

```http title="默认错误处理示例"
500 Internal Server Error
```

默认的错误处理函数功能简单，不会暴露多余的信息，能够保证在生产环境下的安全。

## 自定义错误处理程序

我们可以通过实例属性 `Slim#ErrorHandler` 来自定义 HTTP 错误处理函数。

在大多数情况下，默认错误 HTTP 处理程序就足够了。但是，如果我们想捕获不同类型的错误，那么自定义 HTTP 错误处理器函数可以派上用场，
可以自由的采取相应的措施，例如发送通知、电子邮件或记录错误， 还可以向客户端发送自定义响应，例如错误页面或一个有助于调试的 JSON 数据。

### 错误页面

下面是通过自定义 HTTP 错误处理器函数来显示不同错误类型并记录错误的例子：

```go {14} title="定义错误页面"
func customErrorHandler(c slim.Context, err error) {
    code := http.StatusInternalServerError
    if he, ok := err.(*slim.HTTPError); ok {
        code = he.Code
    }
    c.Logger().Error(err)
    errorPage := fmt.Sprintf("%d.html", code)
    err2 = c.File(errorPage)
    if err2 != nil {
        c.Logger().Error(err2)
    }
}

s.ErrorHandler = customErrorHandler
```

:::tip
除了将日志写入记录器之外，我们还可以将它们写入外部服务，如 Elasticsearch 或 Splunk 等。
:::