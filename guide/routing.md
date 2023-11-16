---
sidebar_position: 13
---

# 路由器

路由是用于定义应用程序的终结点（URI）的，是用于响应客户端地请求的。

通过标准的 HTTP 请求方法，并指定有个 url 路径和处理器函数 (HandlerFunc) 可以注册一个路由。
下面的代码则展示了一个注册路由的例子：它包括 `GET` 的访问方式、值为 `/hello` 的访问路径，以及能够响应 `Hello World` 的 HTTP 处理程序。

```go title="定义路由"
// 业务处理
func hello(c echo.Context) error {
    return c.String(http.StatusOK, "Hello, World!")
}

s := slim.New()
r := s.Router()

// 路由
r.GET("/hello", hello)
```

我们可以用 `r.Any(pattern string, h slim.HandlerFunc)` 来为所有的 HTTP 方法注册处理器（handlerFunc)；
如果仅需要为某个特定的方法注册路由，则可使用方法 `r.Some(methods []string, pattern string, h HandlerFunc)`。

## 路由表达式 {#pattern}

我们使用字符 `/` 作为层级分割路由表达式，然后，每一层根据需要又可以区分出**静态层**和**动态层**，所以最终形成一颗基于前缀树的路由树，而每一层被称为**路由节点**。

路由节点主要有三种类型，按匹配的优先级分别是：
* 使用字面量声明的**静态节点**，如表达式 `/users/new`；
* 以 `/:` 开头的紧随变量名声明的**参数节点**，如表达式 `/users/:id` 中的 `/:id` 就是一个变量名为 `id` 的参数节点；
* 以 `/*` 开头后面可以指定一个变量名来声明的**通配节点**，如表达式 `/users/*` 中的 `/*` 就是用于匹配以 `/users/` 开头的所有请求，另外，我们还可以为这个通配模式取一个变量名如 `/users/*name`，然后通过变量名 `name` 获取通配部分的值。

```go title="示例"
s := slim.Classic()
r := s.Router()

// 使用`冒号+变量名`的方式声明参数节点
r.GET("/users/:id", func(c slim.Context) error {
    return c.String(http.StatusOK, "/users/:id")
})

// 声明一个固定路径的路由
r.GET("/users/new", func(c slim.Context) error {
    return c.String(http.StatusOK, "/users/new")
})

// 使用 `*` 声明一个通配节点
r.GET("/users/*", func(c slim.Context) error {
    return c.String(http.StatusOK, "/users/*")
})
```

上面定义的路由将按下面的优先级顺序匹配：

1. `/users/new`
2. `/users/:id`
3. `/users/*`

:::tip
完全静态的路由优先级高于参数路由，而参数路由的优先级高于通配路由。
:::

## 路由处理器 {#handler-func}

**路由处理器**被作为 HTTP 请求的终结点的程序，是用来响应客户端的请求的。

```go title="处理器函数签名"
type HandlerFunc(c slim.Context) error
```

## 路由方法 {#method}

我们定义了一些常用的路由方法，分别对应不同的 HTTP 请求方法：

```go title=与HTTP的标准请求方法保持一致的
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
```

另外还有四个方法

```go
// Some registers a new route for multiple HTTP methods and path with matching
// handler in the router. Panics on error.
r.Some(methods []string, pattern string, h slim.HandlerFunc) slim.Route
// Any registers a new route for all supported HTTP methods and path with matching
// handler in the router. Panics on error.
r.Any(pattern string, h slim.HandlerFunc) slim.Route
// Static registers a new route with path prefix to serve static files
// from the provided root directory. Panics on error.
r.Static(prefix, root string) Route
// File registers a new route with a path to serve a static file.
// Panics on error.
r.File(pattern, file string) Route
```

## 路由 {#route}

所有路由器方法均会返回一个描述当前注册相关的路由实例 `slim.Route`，此刻，你可以为通过方法 `slim.Route#SetName` 为这个路由指定一个名称，还可以使用方法 `slim.Route#Use` 为这个路由注册专属中间件。

```go title="设置路由属性"
route := s.GET("/users/:id", handler)
route.SetName("userhome")
route.Use(AuthMiddleware)

// 上面的代码还可以链式书写
s.GET("/users/:id", handler).
    SetName("userhome").
    Use(AuthMiddleware)
```


## 路由组 {#group}

我们可以将具有相同前缀的路由归为一组，从而定义具有可选中间件的新子路由，路由组也可以嵌套形成上下级关系。

下面的代码，我们创建了一个 `admin` 组，它需要对 `/admin/*` 路由进行基本的 HTTP 身份认证。

```go title=基于相同前缀分组
g := s.Route("/admin", func(r slim.RouteCollector) {
    r.Use(BasicAuth(func(username, password string) bool {
        if username == "joe" && password == "secret" {
            return true
        }
        return false
    }))

    r.Get("/:id", GetAdmin)
    // ...其它路由
})
```

当具有相同前缀，但是不同路由需要有不同的中间件来过滤请求时，我们可以使用 Group 方法实现：

```go title=无前置分组
s.Route("/admin", func(r slim.RouteCollector) {
    // 无前缀分组，里面的路由共享中间件 `Role("manager")`
    r.Group(func(r slim.RouteCollector) {
        r.Use(Role("manager"))
        r.Get("/:id", GetAdmin)
        // ...其它路由
    })
    // ...其它组
})
```

路由组是使用路由收集器（RouteCollector）接口实现的，所以路由组**只是路由收集器的别称**。