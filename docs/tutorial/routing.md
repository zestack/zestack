---
sidebar_position: 4
---

# 路由器

路由用于定义应用程序的终结点（URI）来响应客户端的请求。

通过标准的 HTTP 方法，url 路径和一个匹配的处理器函数 (HandlerFunc) 可以注册一个路由。下面的代码则展示了一个注册路由的例子：它包括 `GET` 的访问方式， `/hello` 的访问路径，以及发送 `Hello World` HTTP 响应的处理程序。

```go
// 业务处理
func hello(c echo.Context) error {
	return c.String(http.StatusOK, "Hello, World!")
}

s := slim.New()
r := s.Router()

// 路由
r.GET("/hello", hello)
```

你可以用 `r.Any(pattern string, h slim.HandlerFunc)` 来为所有的 HTTP 方法发送注册处理器（handlerFunc)；如果仅需要为某个特定的方法注册路由，可使用 `r.Some(methods []string, pattern string, h HandlerFunc)`。

:::tip
注册路由之前，我们必须了解[处理器 HandlerFunc](./handler-func) 的用途，以及[上下文 Context](./context)
:::


## 路由表达式

我们使用字符 `/` 作为层级分割路由表达式，然后，每一层根据需要又可以区分出静态层和动态层，所以最终形成一颗基于前缀树的路由树，而每一层被称为路由节点。

路由节点主要有三种类型，按匹配的优先级分别是：
* 使用字面量声明的**静态节点**，如表达式 `/users/new`；
* 以 `/:` 开头的紧随变量名声明的**参数节点**，如表达式 `/users/:id` 中的 `/:id` 就是一个变量名为 `id` 的参数节点；
* 以 `/*` 开头后面可以指定一个变量名来声明的**通配节点**，如表达式 `/users/*` 中的 `/*` 就是用于匹配以 `/users/` 开头的所有请求，另外，我们还可以为这个通配模式取一个变量名如 `/users/*name`，然后通过变量名 `name` 获取通配部分的值。

示例：

```go
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


## 路由处理器

**路由处理器**被作为 HTTP 请求的终结点程序来响应客户端的请求，就是我们前面所介绍的[处理器](./handler-func)。

```go title=处理器函数签名
type HandlerFunc(Context) error
```


## 路由方法

我们定义了一些常用的路由方法：

```go title=与HTTP的标准请求方法保持一致的
r.CONNECT(pattern string, h HandlerFunc) Route
r.DELETE(pattern string, h HandlerFunc) Route
r.GET(pattern string, h HandlerFunc) Route
r.HEAD(pattern string, h HandlerFunc) Route
r.OPTIONS(pattern string, h HandlerFunc) Route
r.PATCH(pattern string, h HandlerFunc) Route
r.POST(pattern string, h HandlerFunc) Route
r.PUT(pattern string, h HandlerFunc) Route
r.TRACE(pattern string, h HandlerFunc) Route
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


## 路由

所有路由方法均会返回一个描述当前注册相关的路由实例 `slim.Route`，此刻，你可以为通过方法 `slim.Route#SetName` 为这个路由指定一个名称，还可以使用方法 `slim.Route#Use` 为这个路由注册专属中间件。
 
```go
route := r.GET("/users/:id", handler)
route.SetName("userhome")
route.Use(AuthMiddleware)

// 上面的代码还可以链式书写
r.GET("/users/:id", handler).
	SetName("userhome").
	Use(AuthMiddleware)
```


## 路由组

可以将具有相同前缀的路由归为一组从而定义具有可选中间件的新子路由，路由组也可以嵌套形成上下级关系。

下面的代码，我们创建了一个 `admin` 组，它需要对 `/admin/*` 路由进行基本的 HTTP 身份认证。

```go title=基于相同前缀分组
g := r.Route("/admin", func(r slim.RouteCollector) {
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
g := r.Route("/admin", func(r slim.RouteCollector) {
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


:::tip
如果您使用过其它 Web 框架，比如：chi、echo、gin 等，虽然具有相同的路由组概念，但却有本质上的区别：这些框架的在路由声明期间，会将路由组的中间件复制并合并到路由上面，在路由声明完成后，路由组会被抛弃。
而我们路由组会与路由器及路由形成树形结构，在处理请求期间，会自上而下传递请求，之后过滤并逆序返回响应，这样做主要是为了实现友好的符合直观思维的**洋葱模型**。
:::