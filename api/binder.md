---
sidebar_position: 2
---

# Binder

## type Binder

```go
type Binder interface {
	Bind(c Context, i any) error
}
```

客户端请求提交的数据绑定接口。

理论上，通过我们对该接口的实现，可以从下面的数据源中解析出数据并将之绑定到我们定义的结构体实例里面：

- 路径参数
- 查询参数
- 请求报头
- 请求体（比如：JSON、XML、Form、Protobuf、Msgpack 等等）
- Cookies
- Session
- JWT

或者其它能够通过请求获取的数据。

## type BindUnmarshaler

```go
type BindUnmarshaler interface {
	// UnmarshalParam decodes and assigns a value from an form or query param. 
	UnmarshalParam(param string) error
}
```

BindUnmarshaler is the interface used to wrap the UnmarshalParam method.
Types that don't implement this, but do implement encoding.TextUnmarshaler will use that interface instead.

## type DefaultBinder

```go
type DefaultBinder struct{}
```

接口 Binder 的默认实现，能够绑定路径参数、查询参数、请求报头和请求体。

### func (*DefaultBinder) BindHeaders

```go
func (*DefaultBinder) BindHeaders(c Context, i any) error
```

将 HTTP 报头绑定到参数 `i` 上面。

### func (*DefaultBinder) Bind

```go
func (*DefaultBinder) Bind(c Context, i any) (err error)
```

实现前面提到过的 **[Binder](#binder)** 接口， 按以下顺序将提交的数据绑定到参数 `i` 上面:

1) 路径参数;
2) 查询参数;
3) 请求体。 

每一步都可以覆盖前一步的绑定值。

如果我们只需要对于单源进行绑定，我们可以只使用它们自己的方法 [BindPathParams](#func-bindpathparams)、[BindQueryParams](#func-bindqueryparams)、[BindBody](#func-bindbody)。


## func BindPathParams

```go
func BindPathParams(c Context, i any) error
```

将通过路由定义的路径参数绑定到参数 `i` 上面。

## func BindQueryParams

```go
func BindQueryParams(c Context, i any) error
```

将 HTTP 请求的查询参数到参数 `i` 上面。

## func BindBody

```go
func BindBody(c Context, i any) (err error)
```

将 HTTP 请求体上的数据绑定到参数 `i` 上面。

:::tip
表单绑定 需要注意，此实现使用了 Go 的标准库来解析表单，如果内容类型不是 MIMEMultipartForm，那么将从 URL 和 BODY 中解析表单数据。

* 非 MIMEMultipartForm 类型: https://golang.org/pkg/net/http/#Request.ParseForm
* MIMEMultipartForm 类型: https://golang.org/pkg/net/http/#Request.ParseMultipartForm
:::
