---
sidebar_position: 3
---

# 处理器

处理器是一个函数，是 slim 框架最核心的概念，主要用于对请求的处理，它的签名如下：

```go
type HandlerFunc(slim.Context) error
```

它接收一个 [上下文](./context)，通过返回一个错误来表示处理是否成功。

比如，我们添加路由 `GET /users/:id` 用于获取指定 ID 的用户信息： 

```go
r.GET("/users/:id", func(c slim.Context) error {
  var user User
  id := c.PathParam("id")
  err := db.FindById(&user, id)
  if err != nil {
    return err // 将查询用户失败的错误返回出去
  }
  // 以 JSON 格式响应用户信息
  return c.JSON(user)
})
```
