---
sidebar_position: 6
---

# Cookies

由于 HTTP 是无状态协议，服务器不能记录浏览器的访问状态，也就是说服务器不能区分出多次请求是否由一个客户端发出，
这样的设计严重阻碍的 Web 程序的设计。比如，在我们进行网购时，买了一条裤子，然后又买了一个手机，但是由于 http 协议是无状态的，
如果不通过其它辅助手段，服务器是不能知道用户到底买了什么，Cookie 就是解决方案之一。

Cookie 被设计为能够记住网站状态和信息的一种可靠机制，在我们每次加载网站时，浏览器都会将 cookie 发送回服务器，
以通知服务器当前用户的最新活动，服务器以此做出不同的反馈。

我们使用了 Go 的标准库，通过上下文 `Context` 能够在处理器函数中接收、设置和添加 cookie 对象。

## Cookie 属性

| 属性       | 是否必须 |
|----------|------|
| Name     | Yes  |
| Value    | Yes  |
| Path     | No   |
| Domain   | No   |
| Expires  | No   |
| Secure   | No   |
| HttpOnly | No   |

## 创建 Cookie

```go {2-6} title="添加 Cookie"
func writeCookie(c slim.Context) error {
    cookie := new(http.Cookie)
    cookie.Name = "username"
    cookie.Value = "jon"
    cookie.Expires = time.Now().Add(24 * time.Hour)
    c.SetCookie(cookie)
    return c.String(http.StatusOK, "write a cookie")
}
```

从上面的代码可以看出添加一个 Cookie 的步骤：

* 使用 Go 的标准库，通过代码 `new(http.Cookie)` 来创建一个 Cookie;
* 然后设置 http.Cookie 实例的相关属性：`Name`、`Path`、`Expires`；
* 最后，使用方法 `c.SetCookie(cookie)` 将它添加到 HTTP 的响应报头 **Set-Cookie** 上面。

## 读取 Cookie

在我们的路由处理器函数中，通过上下文 `c.Cookie("username")` 就能够快速获取前面设置的名为 `username` 结果是 `http.Cookie` 结构的 Cookie 值。

```go {2} title="获取 Cookie"
func readCookie(c slim.Context) error {
    cookie, err := c.Cookie("username")
    if err != nil {
        return err
    }
    fmt.Println(cookie.Name)
    fmt.Println(cookie.Value)
    return c.String(http.StatusOK, "read a cookie")
}
```

## 全部 Cookie

我们能够通过上下文的 `Context#Cookies` 方法获取所有尚未过期的 Cookie：

```go {2} title="获取全部 Cookie"
func readAllCookies(c slim.Context) error {
    for _, cookie := range c.Cookies() {
        fmt.Println(cookie.Name)
        fmt.Println(cookie.Value)
    }
    return c.String(http.StatusOK, "read all the cookies")
}
```