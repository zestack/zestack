---
sidebar_position: 3
---

# Compose

## func Explicitly

一个承上启下的中间件

```go
func Explicitly(c Context, next HandlerFunc) error {
    return next(c)
}
```

## func Compose

合并多个中间件为一个，实现洋葱模型，
有别于 gin/chi/echo 等框架的的后入先出模式。

```go
func Compose(middleware ...MiddlewareFunc) MiddlewareFunc
```

:::warning
当我们不提供参数时，函数 Compose 的返回值是 **nil**。 
:::