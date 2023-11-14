---
sidebar_position: 3
---

# Compose

## func Explicitly

一个承上启下的中间件

```go
func Explicitly(c Context, next HandlerFunc) error
```

## func Compose

合并多个中间件为一个，实现洋葱模型，
有别于 gin/chi/echo 等框架的的后入先出模式。

```go
func Compose(middleware ...MiddlewareFunc) MiddlewareFunc
```