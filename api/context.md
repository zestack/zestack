---
sidebar_position: 4
---

# Context

## type Context

```go
type Context interface {
    Context() stdctx.Context
    // 返回当前请求的 `*http.Request` 结构体实例。
    Request() *http.Request
    // 设置 `*http.Request` 结构体实例。
    SetRequest(r *http.Request)
    // Response returns `slim.ResponseWriter`.
    Response() ResponseWriter
    // SetResponse sets `slim.ResponseWriter`.
    SetResponse(r ResponseWriter)
    // Logger returns the `Logger` instance.
    Logger() Logger
    // SetLogger Set the logger
    SetLogger(logger Logger)
    // Filesystem returns `fs.FS`.
    Filesystem() fs.FS
    // SetFilesystem sets `fs.FS`
    SetFilesystem(fs.FS)
    // IsTLS returns true if HTTP connection is TLS otherwise false.
    IsTLS() bool
    // IsWebSocket returns true if HTTP connection is WebSocket otherwise false.
    IsWebSocket() bool
    // Scheme returns the HTTP protocol scheme, `http` or `https`.
    Scheme() string
    // RealIP returns the client's network address based on `X-Forwarded-For`
    // or `X-Real-IP` request header.
    // The behavior can be configured using `Echo#IPExtractor`.
    RealIP() string
    RequestURI() string
    // Accepts 返回支持的权重最高的媒体类型，若匹配失败则会返回空字符串。
    // 给出的值可以是标准的媒体类型（如 application/json），也可以是扩展名（如 json、xml 等）。
    Accepts(expect ...string) string
    // AcceptsEncodings 返回支持的权重最高的编码方式，若匹配失败则会返回空字符串。
    AcceptsEncodings(encodings ...string) string
    // AcceptsCharsets 返回支持的权重最高的字符集，若匹配失败则会返回空字符串。
    AcceptsCharsets(charsets ...string) string
    // AcceptsLanguages 返回支持的权重最高的语言，若匹配失败则会返回空字符串。
    AcceptsLanguages(languages ...string) string
    // AllowsMethods 返回允许的请求方法
    AllowsMethods() []string
    // 返回路由器匹配的结果
    RouteMatchType() RouteMatchType
    // RouteInfo returns current request route information. Method, Path, Name and params if they exist for matched route.
    // In the case of 404 (route not found) and 405 (method not allowed) RouteInfo returns generic struct for these cases.
    RouteInfo() RouteInfo
    // PathParam returns path parameter by name.
    PathParam(name string) string
    // PathParams returns path parameter values.
    PathParams() PathParams
    // SetPathParams set path parameter for during current request lifecycle.
    SetPathParams(params PathParams)
    // QueryParam returns the query param for the provided name.
    QueryParam(name string) string
    // QueryParams returns the query parameters as `url.Values`.
    QueryParams() url.Values
    // QueryString returns the URL query string.
    QueryString() string
    // FormValue returns the form field value for the provided name.
    FormValue(name string) string
    // FormParams returns the form parameters as `url.Values`.
    FormParams() (url.Values, error)
    // FormFile returns the multipart form file for the provided name.
    FormFile(name string) (*multipart.FileHeader, error)
    Header(key string) string
    SetHeader(key string, values ...string)
    // MultipartForm returns the multipart form.
    MultipartForm() (*multipart.Form, error)
    // Cookie returns the named cookie provided in the request.
    Cookie(name string) (*http.Cookie, error)
    // SetCookie adds a `Set-Cookie` header in HTTP response.
    SetCookie(cookie *http.Cookie)
    // Cookies return the HTTP cookies sent with the request.
    Cookies() []*http.Cookie
    // Get retrieves data from the context.
    Get(key string) any
    // Set saves data in the context.
    Set(key string, val any)
    // Bind binds the request body into a provided type `i`. The default binder
    // does it based on Content-Type header.
    Bind(i any) error
    // Validate validates provided `i`. It is usually called after `Context#Bind()`.
    // Validator must be registered using `Echo#Validator`.
    Validate(i any) error
    // Written returns whether the context response has been written to
    Written() bool
    // Render renders a template with data and sends a text/html response with status
    // code. Renderer must be registered using `Echo.Renderer`.
    Render(code int, name string, data any) error
    // HTML sends an HTTP response with status code.
    HTML(code int, html string) error
    // HTMLBlob sends an HTTP blob response with status code.
    HTMLBlob(code int, b []byte) error
    // String sends a string response with status code.
    String(code int, s string) error
    // JSON sends a JSON response with status code.
    JSON(code int, i any) error
    // JSONPretty sends a pretty-print JSON with status code.
    JSONPretty(code int, i any, indent string) error
    // JSONBlob sends a JSON blob response with status code.
    JSONBlob(code int, b []byte) error
    // JSONP sends a JSONP response with status code. It uses `callback` to construct
    // the JSONP payload.
    JSONP(code int, callback string, i any) error
    // JSONPBlob sends a JSONP blob response with status code. It uses `callback`
    // to construct the JSONP payload.
    JSONPBlob(code int, callback string, b []byte) error
    // XML sends an XML response with status code.
    XML(code int, i any) error
    // XMLPretty sends a pretty-print XML with status code.
    XMLPretty(code int, i any, indent string) error
    // XMLBlob sends an XML blob response with status code.
    XMLBlob(code int, b []byte) error
    // Blob sends a blob response with a status code and content type.
    Blob(code int, contentType string, b []byte) error
    // Stream sends a streaming response with status code and content type.
    Stream(code int, contentType string, r io.Reader) error
    // File sends a response with the content of the file.
    File(file string, filesystem ...fs.FS) error
    // Attachment sends a response as attachment, prompting client to save the
    // file.
    Attachment(file string, name string) error
    // Inline sends a response as inline, opening the file in the browser.
    Inline(file string, name string) error
    // NoContent sends a response with nobody and a status code.
    NoContent(code ...int) error
    // Redirect redirects the request to a provided URL with status code.
    Redirect(code int, url string) error
    // Error invokes the registered HTTP error handler.
    // NB: Avoid using this method. It is better to return errors, so middlewares up in a chain could act on returned error.
    Error(err error)
    // Slim 返回 Slim 实例
    Slim() *Slim
}
```

接口 `Context` 是表示当前 HTTP 请求的上下文，它包含对请求和响应对象的引用、路径、路径参数、数据和匹配的路由信息。

## type EditableContext

```go
type EditableContext interface {
    Context
    // RawPathParams returns raw path pathParams value.
    RawPathParams() *PathParams
    // SetRawPathParams replaces any existing param values with new values for this context lifetime (request).
    SetRawPathParams(params *PathParams)
    // SetRouteMatchType sets the RouteMatchType of router match for this request.
    SetRouteMatchType(t RouteMatchType)
    SetAllowsMethods(methods []string)
    // SetRouteInfo sets the route info of this request to the context.
    SetRouteInfo(ri RouteInfo)
    // Reset resets the context after request completes. It must be called along
    // with `Echo#AcquireContext()` and `Echo#ReleaseContext()`.
    // See `Echo#ServeHTTP()`
    Reset(w http.ResponseWriter, r *http.Request)
}
```

## type PathParam

```go
type PathParam struct {
    Name  string
    Value string
}
```

路由参数单元结构体。

## type PathParams

```go
type PathParams []PathParam
```

### func (PathParams) Get

```go
func (p PathParams) Get(name string, defaultValue ...string) string
```

获取路参数，如果参数不存在，则使用给出的默认值，要是没有给出默认值，则返回空字符。

### func (PathParams) Lookup

```go
func (p PathParams) Lookup(name string) (string, bool)
```

获取路由参数，返回的第二个参数表示给出的名称是否存在。

## type context

```go
type context struct{}
```

默认上下文结构体，实现了 `Context` 和 `EditableContext` 这连个接口。

### func (*context) Context()

```go
func (c *context) Context()
```

返回 HTTP 请求上下文，也有是 `*http.Request` 的上下文，该方法实际上是：`c.Request().Context()` 。

### func (*context) Request

```go
func (c *context) Request(()
```

返回当前请求的 `*http.Request` 结构体实例。

### func (*context) SetRequest

```go
func (c *context) SetRequest()
```

设置 `*http.Request` 结构体实例。

### func (*context) Response

```go
func (c *context) Response() ResponseWriter
```

返回 `slim.ResponseWriter` 接口的实现，包装了 `http.ResponseWriter` 实例，同时实现了 `http.Flusher`、`http.Pusher` 两个接口。

### func (*context) SetResponse

```go
func (c *context) SetResponse(r ResponseWriter)
```

设置自定义 `slim.ResponseWriter`。

### func (*context) Logger

```go
func (c *context) Logger() Logger
```

返回日志接口 `slim.Logger` 的实例。

### func (*context) SetLogger

```go
func (c *context) SetLogger(logger Logger)
```

设置上下文的日志接口 `slim.Logger`。

### func (*context) Filesystem

```go
func (c *context) Filesystem() fs.FS
```

返回文件系统 `fs.FS` 接口。

### func (*context) SetFilesystem

```go
func (c *context) SetFilesystem(fs.FS)
```

设置文件系统 `fs.FS` 接口。

### func (*context) IsTLS

```go
func (c *context) IsTLS() bool
```

如果 HTTP 连接是 TLS 则返回 true，否则返回 false。

### func (*context) IsWebSocket

```go
func (c *context) IsWebSocket() bool
```

如果是 WebSocket 连接则返回 true，反之返回 false。

### func (*context) Scheme

```go
func (c *context) Scheme() string
```

返回 HTTP 协议方案，值是 `http` 或 `https`。

### func (*context) RealIP

```go
func (c *context) RealIP() string
```

基于报头 `X-Forwarded-For` 和 `X-Real-IP` 返回客户端的 IP 地址。

### func (*context) RequestURI

```go
func (c *context) RequestURI() string
```

返回完整的请求地址字符串。

### func (*context) Accepts

```go
func (c *context) Accepts(expect ...string) string
```

返回支持的权重最高的媒体类型，若匹配失败则会返回空字符串。给出的参数 `expect` 的值可以是标准的媒体类型（如 application/json），也可以是扩展名（如 json、xml 等）。

具体逻辑参考接口 [Negotiation](negotiation.md#func-negotiator-type)

```go title="使用示例"
// Accept: text/html
c.accepts("html")
// => "html"

// Accept: text/*, application/json
c.accepts("html")
// => "html"
c.accepts("text/html")
// => "text/html"
c.accepts("json", "text")
// => "json"
c.accepts("application/json")
// => "application/json"

// Accept: text/*, application/json
c.accepts("image/png")
c.accepts("png")
// => false

// Accept: text/*;q=.5, application/json
c.accepts("html", "json")
// => "json"

// No Accept header
c.accepts("html", "json")
// => ""
c.accepts("json", "html")
// => ""
```

某些情况下，需要根据内容协商做出不同的行为，我们可以使用 **switch**：

```go title="使用示例"
switch(c.accepts("json", "html", "text")) {
  case "json":
  case "html":
  case "text":
  default:
}
```

### func (*context) AcceptsEncodings

```go
func (c *context) AcceptsEncodings(encodings ...string) string
```

返回当前请求支持的权重最高的编码方式，若匹配失败则会返回空字符串。

```go title="使用示例"
// Accept-Encoding: gzip
c.acceptsEncodings("gzip", "deflate", "identity")
// => "gzip"
```

### func (*context) AcceptsCharsets

```go
func (c *context) AcceptsCharsets(charsets ...string) string
```

返回支持的权重最高的字符集，若匹配失败则会返回空字符串。

```go title="使用示例"
// Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5
c.acceptsCharsets("utf-8", "utf-7")
// => "utf-8"
```

### func (*context) AcceptsLanguages

```go
func (c *context) AcceptsLanguages(languages ...string) string
```

返回支持的权重最高的语言，若匹配失败则会返回空字符串。

```go title="使用示例"
// Accept-Language: en;q=0.8, es, pt
c.acceptsLanguages("es", "en")
// => "es"
```

### func (*context) AllowsMethods

```go
func (c *context) AllowsMethods() []string
```

返回本次请求路径所支持的所有请求方法（包括与路径匹配的路由所支持的 HTTP 方法和不匹配的路由所支持的 HTTP 方法）。

### func (*context) RouteMatchType

```go
func (c *context) RouteMatchType() RouteMatchType
```

返回路由器匹配的结果，我们可以据此确定使用那种方式完成本次请求:

* RouteMatchFound - 通过当前请求的路径和方法成功匹配到我们定义的路由；
* RouteMatchNotFound - 没有与本次请求路径相匹配的路由；
* RouteMatchMethodNotAllowed - 能够通过请求路径匹配到路由，但是该无法支持本次请求所使用的 HTTP 方法；
* RouteMatchUnknown — 程序尚未开始执行匹配，表示上下文为初始状态。

:::tip
如果在通过方法 Slim#Use 注册在 Slim 实例上的中间件上调用当方法，返回的值极有可能是 RouteMatchUnknown，
那是因为此刻程序尚未对本次请求去匹配路由，只有等到请求逆序返回的时候才可能取到其它值。

参考 [《快速上手》](../guide/quick-start#middleware) 理解什么是中间件。
:::

### func (*context) RouteInfo

```go
func (c *context) RouteInfo() RouteInfo
```

返回当前请求的路由信息。

### func (*context) PathParam

```go
func (c *context) PathParam(name string) string
```

获取指定名称的路径参数值，如果不存在返回空字符串。

### func (*context) PathParams

```go
func (c *context) PathParams() PathParams
```

返回所以的路径参数。

### func (*context) SetPathParams

```go
func (c *context) SetPathParams(params PathParams)
```

set path parameter for during current request lifecycle.

### func (*context) QueryParam

```go
func (c *context) QueryParam(name string) string
```

返回指定名称的查询参数值，若不存在则返回空字符串。

### func (*context) QueryParams

```go
func (c *context) QueryParams() url.Values
```

使用 `url.Values` 结构体返回所有的查询参数。

### func (*context) QueryString

```go
func (c *context) QueryString() string
```

返回查询字符串。

### func (*context) FormValue

```go
func (c *context) FormValue(name string) string
```

返回指定名称的表单数据。

### func (*context) FormParams() 

```go
func (c *context) FormParams() (url.Values, error)
```

使用 `url.Values` 结构体返回提交的所有表单数据。

### func (*context) FormFile(name string) 

```go
func (c *context) FormFile(name string) (*multipart.FileHeader, error)
```

返回上传的文件。

### func (*context) Header

```go
func (c *context) Header(key string) string
```

返回名称为 `key` 的请求报头的值。

### func (*context) SetHeader

```go
func (c *context) SetHeader(key string, values ...string)
```

设置响应报头

### func (*context) MultipartForm() 

```go
func (c *context) MultipartForm() (*multipart.Form, error)
```

返回上传的所以文件，第二个返回值表示解析文件失败。

### func (*context) Cookie(name string) 

```go
func (c *context) Cookie(name string) (*http.Cookie, error)
```

returns the named cookie provided in the request.

### func (*context) SetCookie

```go
func (c *context) SetCookie(cookie *http.Cookie)
```

adds a `Set-Cookie` header in HTTP response.

### func (*context) Cookies

```go
func (c *context) Cookies() []*http.Cookie
```

return the HTTP cookies sent with the request.

### func (*context) Get

```go
func (c *context) Get(key string) any
```

返回储存在上下文中的数据。

### func (*context) Set

```go
func (c *context) Set(key string, val any)
```

将一个值保存到上下文中。

### func (*context) Bind

```go
func (c *context) Bind(i any) error
```

将请求时提交的数据绑定到参数 `i` 上，主要来源如下：

- 查询参数（Query String）；
- 请求体（通过 POST 等请求方法提交的）数据；
- 匹配的路由参数；
- 提交的报头值。

请求体通过报头 `Content-Type` 的值来识别，然后调用不同的序列化程序 `Serializer` 解构到参数 `i` 上。

### func (*context) Validate

```go
func (c *context) Validate(i any) error
```

validates provided `i`. It is usually called after `Context#Bind()`.
Validator must be registered using `Slim#Validator`.

### func (*context) Written

```go
func (c *context) Written() bool
```

returns whether the context response has been written to

### func (*context) Render

```go
func (c *context) Render(code int, name string, data any) error
```

renders a template with data and sends a text/html response with status code.
Renderer must be registered using `Echo.Renderer`.

### func (*context) HTML

```go
func (c *context) HTML(code int, html string) error
```

sends an HTTP response with status code.

### func (*context) HTMLBlob

```go
func (c *context) HTMLBlob(code int, b []byte) error
```

sends an HTTP blob response with status code.

### func (*context) String

```go
func (c *context) String(code int, s string) error
```

sends a string response with status code.

### func (*context) JSON

```go
func (c *context) JSON(code int, i any) error
```

sends a JSON response with status code.

### func (*context) JSONPretty

```go
func (c *context) JSONPretty(code int, i any, indent string) error
```

sends a pretty-print JSON with status code.

### func (*context) JSONBlob

```go
func (c *context) JSONBlob(code int, b []byte) error
```

sends a JSON blob response with status code.

### func (*context) JSONP

```go
func (c *context) JSONP(code int, callback string, i any) error
```

sends a JSONP response with status code. It uses `callback` to construct the JSONP payload.

### func (*context) JSONPBlob

```go
func (c *context) JSONPBlob(code int, callback string, b []byte) error
```

sends a JSONP blob response with status code. It uses `callback` to construct the JSONP payload.

### func (*context) XML

```go
func (c *context) XML(code int, i any) error
```

sends an XML response with status code.

### func (*context) XMLPretty

```go
func (c *context) XMLPretty(code int, i any, indent string) error
```

sends a pretty-print XML with status code.

### func (*context) XMLBlob

```go
func (c *context) XMLBlob(code int, b []byte) error
```

sends an XML blob response with status code.

### func (*context) Blob

```go
func (c *context) Blob(code int, contentType string, b []byte) error
```

sends a blob response with a status code and content type.

### func (*context) Stream

```go
func (c *context) Stream(code int, contentType string, r io.Reader) error
```

sends a streaming response with status code and content type.

### func (*context) File

```go
func (c *context) File(file string, filesystem ...fs.FS) error
```

sends a response with the content of the file.

### func (*context) Attachment

```go
func (c *context) Attachment(file string, name string) error
```

sends a response as attachment, prompting client to save the file.

### func (*context) Inline

```go
func (c *context) Inline(file string, name string) error
```

sends a response as inline, opening the file in the browser.

### func (*context) NoContent

```go
func (c *context) NoContent(code ...int) error
```

sends a response with nobody and a status code.

### func (*context) Redirect

```go
func (c *context) Redirect(code int, url string) error
```

redirects the request to a provided URL with status code.

### func (*context) Error

```go
func (c *context) Error(err error)
```

Error invokes the registered HTTP error handler.

:::warning
我们不应该在路由处理器函数和中间件中使用使用该方法，而是通过返回错误值，Slim 程序会调用我们定义的错误处理器函数来统一处理错误。
:::

### func (*context) Slim

```go
func (c *context) Slim() *Slim
```

返回 Slim 实例
