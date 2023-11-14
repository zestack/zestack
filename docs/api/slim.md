---
sidebar_position: 9
---

# Slim

## MIME types

```go
const (
	MIMEApplicationJSON                  = "application/json"
	MIMEApplicationJSONCharsetUTF8       = "application/json; charset=UTF-8"
	MIMEApplicationJavaScript            = "application/javascript"
	MIMEApplicationJavaScriptCharsetUTF8 = "application/javascript; charset=UTF-8"
	MIMEApplicationXML                   = "application/xml"
	MIMEApplicationXMLCharsetUTF8        = "application/xml; charset=UTF-8"
	MIMETextXML                          = "text/xml"
	MIMETextXMLCharsetUTF8               = "text/xml; charset=UTF-8"
	MIMEApplicationForm                  = "application/x-www-form-urlencoded"
	MIMEApplicationProtobuf              = "application/protobuf"
	MIMEApplicationMsgpack               = "application/msgpack"
	MIMETextHTML                         = "text/html"
	MIMETextHTMLCharsetUTF8              = "text/html; charset=UTF-8"
	MIMETextPlain                        = "text/plain"
	MIMETextPlainCharsetUTF8             = "text/plain; charset=UTF-8"
	MIMEMultipartForm                    = "multipart/form-data"
	MIMEOctetStream                      = "application/octet-stream"
)
```


## Headers

```go
const (
	HeaderAccept         = "Accept"
	HeaderAcceptEncoding = "Accept-Encoding"
	// HeaderAllow is the name of the "Allow" header field used to list the set of methods
	// advertised as supported by the target resource. Returning an Allow header is mandatory
	// for status 405 (method not found) and useful for the OPTIONS method in responses.
	// See RFC 7231: https://datatracker.ietf.org/doc/html/rfc7231#section-7.4.1
	HeaderAllow               = "Allow"
	HeaderAuthorization       = "Authorization"
	HeaderContentDisposition  = "Content-Disposition"
	HeaderContentEncoding     = "Content-Encoding"
	HeaderContentLength       = "Content-Length"
	HeaderContentType         = "Content-Type"
	HeaderCookie              = "Cookie"
	HeaderSetCookie           = "Set-Cookie"
	HeaderIfModifiedSince     = "If-Modified-Since"
	HeaderLastModified        = "Last-Modified"
	HeaderLocation            = "Location"
	HeaderUpgrade             = "Upgrade"
	HeaderVary                = "Vary"
	HeaderWWWAuthenticate     = "WWW-Authenticate"
	HeaderXForwardedFor       = "X-Forwarded-For"
	HeaderXForwardedProto     = "X-Forwarded-Proto"
	HeaderXForwardedProtocol  = "X-Forwarded-Protocol"
	HeaderXForwardedSsl       = "X-Forwarded-Ssl"
	HeaderXUrlScheme          = "X-Url-Scheme"
	HeaderXHTTPMethodOverride = "X-HTTP-Method-Override"
	HeaderXRealIP             = "X-Real-IP"
	HeaderXRequestID          = "X-Request-ID"
	HeaderXRequestedWith      = "X-Requested-With"
	HeaderServer              = "Server"
	HeaderOrigin              = "Origin"
	HeaderCacheControl        = "Cache-Control"
	HeaderConnection          = "Connection"

	// Access control
	HeaderAccessControlRequestMethod    = "Access-Control-Request-Method"
	HeaderAccessControlRequestHeaders   = "Access-Control-Request-Headers"
	HeaderAccessControlAllowOrigin      = "Access-Control-Allow-Origin"
	HeaderAccessControlAllowMethods     = "Access-Control-Allow-Methods"
	HeaderAccessControlAllowHeaders     = "Access-Control-Allow-Headers"
	HeaderAccessControlAllowCredentials = "Access-Control-Allow-Credentials"
	HeaderAccessControlExposeHeaders    = "Access-Control-Expose-Headers"
	HeaderAccessControlMaxAge           = "Access-Control-Max-Age"

	// Security
	HeaderStrictTransportSecurity         = "Strict-Transport-Security"
	HeaderXContentTypeOptions             = "X-Content-Type-Config"
	HeaderXXSSProtection                  = "X-XSS-Protection"
	HeaderXFrameOptions                   = "X-Frame-Config"
	HeaderContentSecurityPolicy           = "Content-Security-Policy"
	HeaderContentSecurityPolicyReportOnly = "Content-Security-Policy-Report-Only"
	HeaderXCSRFToken                      = "X-CSRF-Token"
	HeaderReferrerPolicy                  = "Referrer-Policy"
)
```


## type HandlerFunc

```go
type HandlerFunc func(c Context) error
```

HTTP请求处理函数签名。


## type ErrorHandlerFunc

```go
type ErrorHandlerFunc func(c Context, err error)
```

错误处理函数签名。


## type MiddlewareFunc

```go
type MiddlewareFunc func(c Context, next HandlerFunc) error
```

请求中间件函数签名。


## type MiddlewareRegistrar

```go
type MiddlewareRegistrar interface {
	// Use 注册中间件
	Use(middleware ...MiddlewareFunc)
	// Middleware 返回注册的所有中间件
	Middleware() []MiddlewareFunc
}
```

中间件注册接口。


## type MiddlewareComposer

```go
type MiddlewareComposer interface {
	// Compose 将注册的所有中间件合并成一个中间件
	Compose() MiddlewareFunc
}
```

中间件合成器接口。


## type MiddlewareConfigurator

```go
type MiddlewareConfigurator interface {
	// ToMiddleware 将实例转换成中间件函数
	ToMiddleware() MiddlewareFunc
}
```

中间件配置器接口。


## type Renderer

```go
type Renderer interface {
	Render(c Context, w io.Writer, name string, data any) error
}
```

Renderer is the interface that wraps the Render function.


## type Validator

```go
type Validator interface {
	Validate(i any) error
}
```

Validator is the interface that wraps the Validate function.


## type Map

```go
type Map map[string]any
```

Map defines a generic map of type `map[string]any`.


## func Classic

```go
func Classic() *Slim
```


## func New

```go
func New() *Slim
```


## type Slim

```go
type Slim struct
```


### func (*Slim) NewContext

```go
func (s *Slim) NewContext(w http.ResponseWriter, r *http.Request) Context
```


### func (*Slim) NewRouter

```go
func (s *Slim) NewRouter() Router
```


### func (*Slim) Router

```go
func (s *Slim) Router() Router
```

返回默认路由器


### func (*Slim) Routers

```go
func (s *Slim) Routers() map[string]Router
```

返回 vhost 的 `host => router` 映射


### func (*Slim) RouterFor

```go
func (s *Slim) RouterFor(host string) Router
```

返回与指定 `host` 相关的路由器


### func (*Slim) ResetRouterCreator

```go
func (s *Slim) ResetRouterCreator(creator func(s *Slim) Router)
```

重置路由器创建函数。

:::tip
会立即重新创建默认路由器，并且 vhost 路由器会被清除。
:::


### func (*Slim) Use

```go
func (s *Slim) Use(middleware ...MiddlewareFunc)
```

注册全局中间件，实现接口 `MiddlewareRegistrar`  的 `Use` 方法。


### func (*Slim) Host

```go
func (s *Slim) Host(name string, middleware ...MiddlewareFunc) Router
```

通过提供名称和中间件函数创建对应 `host` 的路由器实例


### func (*Slim) Negotiator

```go
func (s *Slim) Negotiator() *Negotiator
```

返回内容协商工具


### func (*Slim) SetNegotiator

```go
func (s *Slim) SetNegotiator(negotiator *Negotiator)
```

设置自定义内容协商工具


### func (*Slim) AcquireContext

```go
func (s *Slim) AcquireContext() Context
```

自上下文缓存池中返回一个空闲的 `slim.Context` 实例， 在不需要的时候，必须通过调用 `Slim#ReleaseContext` 方法归还该上下文。


### func (*Slim) ReleaseContext

```go
func (s *Slim) ReleaseContext(c Context)
```

归还通过 `Mux.AcquireContext` 获取的 `mux.Context` 实例到上下文缓存池中.


### func (s *Slim) ServeHTTP

```go
func (s *Slim) ServeHTTP(w http.ResponseWriter, r *http.Request)
```

实现 `http.Handler` 接口。


## func ErrorHandler

```go
func ErrorHandler(c Context, err error)
```

默认错误处理函数


## func NotFoundHandler

```go
func NotFoundHandler(_ Context) error
```

默认 404 处理器


## func MethodNotAllowedHandler

```go
func MethodNotAllowedHandler(_ Context) error
```

默认 405 处理器