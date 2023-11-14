---
sidebar_position: 5
---

# Router

## type Router

```go
type Router interface {
	// Add 注册请求处理器，返回对应的路由接口实例
	Add([]string, string, HandlerFunc) (Route, error)
	// Remove 移除路由
	Remove(methods []string, path string) error
	// Routes 返回注册的路由
	Routes() []Route
	// Match 匹配路由
	Match(req *http.Request, params *PathParams) RouteMatch
	MiddlewareRegistrar
	MiddlewareComposer
	RouteRegistrar
}
```

Router is interface for routing requests to registered routes.


## type RouterConfig

```go
type RouterConfig struct {
	AllowOverwritingRoute    bool
	UnescapePathParamValues  bool
	UseEscapedPathForRouting bool
	RoutingTrailingSlash     bool
	RouteCollector           RouteCollector
	ErrorHandler             ErrorHandlerFunc
}
```

## type func NewRouter

```go
func NewRouter(config RouterConfig) Router
```

## type RouteCollector

```go
type RouteCollector interface {
	// Prefix 返回路由共用前缀
	Prefix() string
	// Parent 返回上级路由收集器
	Parent() RouteCollector
	// Router 返回所属路由器
	Router() Router
	MiddlewareRegistrar
	MiddlewareComposer
	RouteRegistrar
}
```

路由收集器接口


## func NewRouteCollector

```go
func NewRouteCollector(prefix string, parent RouteCollector, router Router) RouteCollector
```


## type RouteRegistrar

```go
type RouteRegistrar interface {
	// Group 实现路由分组注册，实际调用 `RouteCollector.Route` 实现
	Group(fn func(sub RouteCollector))
	// Route 以指定前缀实现路由分组注册
	Route(prefix string, fn func(sub RouteCollector))
	// Some registers a new route for multiple HTTP methods and path with matching
	// handler in the router. Panics on error.
	Some(methods []string, pattern string, h HandlerFunc) Route
	// Any registers a new route for all supported HTTP methods and path with matching
	// handler in the router. Panics on error.
	Any(pattern string, h HandlerFunc) Route
	// CONNECT registers a new CONNECT route for a path with matching handler in
	// the router. Panics on error.
	CONNECT(pattern string, h HandlerFunc) Route
	// DELETE registers a new DELETE route for a path with matching handler in
	// the router. Panics on error.
	DELETE(pattern string, h HandlerFunc) Route
	// GET registers a new GET route for a path with matching handler in
	// the router. Panics on error.
	GET(pattern string, h HandlerFunc) Route
	// HEAD registers a new HEAD route for a path with matching handler in
	// the router. Panics on error.
	HEAD(pattern string, h HandlerFunc) Route
	// OPTIONS registers a new OPTIONS route for a path with matching handler
	// in the router. Panics on error.
	OPTIONS(pattern string, h HandlerFunc) Route
	// PATCH registers a new PATCH route for a path with matching handler in
	// the router. Panics on error.
	PATCH(pattern string, h HandlerFunc) Route
	// POST registers a new POST route for a path with matching handler in
	// the router. Panics on error.
	POST(pattern string, h HandlerFunc) Route
	// PUT registers a new PUT route for a path with matching handler in
	// the router. Panics on error.
	PUT(pattern string, h HandlerFunc) Route
	// TRACE registers a new TRACE route for a path with matching handler in
	// the router. Panics on error.
	TRACE(pattern string, h HandlerFunc) Route
	// Static registers a new route with path prefix to serve static files
	// from the provided root directory. Panics on error.
	Static(prefix, root string) Route
	// File registers a new route with a path to serve a static file.
	// Panics on error.
	File(pattern, file string) Route
}
```

路由注册表接口


## type Route

```go
type Route interface {
	// Router 返回所属路由器
	Router() Router
	// Collector 返回所属收集器
	Collector() RouteCollector
	// Name 返回路由名称
	Name() string
	// SetName 设置路由名称，返回 Route 方便链式操作。
	SetName(name string) Route
	// Pattern 路由路径表达式
	Pattern() string
	// Methods 返回支持的 HTTP 请求方法
	Methods() []string
	// Handler 返回注册的请求处理器函数
	Handler() HandlerFunc
	// Params 返回支持的路由参数列表
	Params() []string
	// ToRouteInfo 返回路由描述接口实例
	ToRouteInfo() RouteInfo
	// Use 注册中间件，返回 Route 方便链式操作。
	Use(middleware ...MiddlewareFunc) Route
	// Middleware 返回注册的中间件
	Middleware() []MiddlewareFunc
	MiddlewareComposer
}
```

路由接口。


## type RouteInfo

```go
type RouteInfo interface {
	// Router 返回所属路由器
	Router() Router
	// Collector 返回所属收集器
	Collector() RouteCollector
	// Name 返回路由名称
	Name() string
	// Methods 返回支持的请求方法列表
	Methods() []string
	// Pattern 路由路径表达式
	Pattern() string
	// Params 返回支持的路由参数列表
	Params() []string
	// Reverse 通过提供的参数来反转路由表达式，返回为真实请求路径。
	// 如果参数为空或 nil 时则尝试使用用默认值，若无法解决参数
	// 则会 panic 错误
	Reverse(params ...any) string
}
```

路由描述接口。


## type RouteMatchType

```go
type RouteMatchType uint8
```

describes possible states that request could be in perspective of routing.

```go
const (
	// RouteMatchUnknown is state before routing is done. Default state for fresh context.
	RouteMatchUnknown RouteMatchType = iota
	// RouteMatchNotFound is state when router did not find matching route for current request
	RouteMatchNotFound
	// RouteMatchMethodNotAllowed is state when router did not find route with matching path + method for current request.
	// Although router had a matching route with that path but different method.
	RouteMatchMethodNotAllowed
	// RouteMatchFound is state when router found exact match for path + method combination
	RouteMatchFound
)
```


## type RouteMatch

```go
type RouteMatch struct {
	// Type contains a result as enumeration of Router.Match and helps to understand did Router actually matched Route or
	// what kind of error case (404/405) we have at the end of the handler chain.
	Type RouteMatchType
	// AllowMethods 能够接受处理的请求方法列表，主要
	// 在 Type 值为 RouteMatchMethodNotAllowed 时被使用。
	AllowMethods []string
	// Handler is function(chain) that was matched by router. In case of no match could result to ErrNotFound or ErrMethodNotAllowed.
	Handler HandlerFunc
	// RouteInfo is information about the route we just matched
	RouteInfo RouteInfo
}
```

RouteMatch is result object for Router.Match. Its main purpose is to avoid allocating memory for PathParams inside router.
