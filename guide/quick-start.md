---
sidebar_position: 2
---

# 快速上手

## 安装 {#install}

要安装 Slim，需要 Go 1.21.0 或更高版本。

```shell title="初始化项目"
$ mkdir myapp && cd myapp
$ go mod init myapp
// highlight-next-line
$ go get zestack.dev/slim
```

## 经典实例 {#classic}

为了更快速的启用 Slim，函数 `slim.Classic` 提供了一些默认的组件以方便 Web 开发:

```go title="经典实例"
s := slim.Classic()
// ... 可以在这里使用中间件和注册路由
s.Start(":1324", s)
```

下面是函数 `slim.Classic` 已经包含的功能：

* 访问日志 - `slim.Logging`，打印请求和响应信息；
* 容错恢复 - `slim.Recovery`，防止程序崩溃；
* 静态文件服务 - `slim.Static`，使用 `./public` 作为静态文件根目录。

## 实例 {#instance}

任何类型为 `slim.Slim` 的对象都可以被认为是 Slim 的实例，我们可以在单个程序中使用任意数量的 Slim 实例。

```go title="普通实例"
s := slim.New()
```

使用函数 `slim.New` 仅仅初始化一个基本的 Slim 实例，没有注册任何中间件。

## Hello world! {#hello-world}

创建入口文件 `server.go`

```go title="server.go"
package main

import (
    "net/http"

    "zestack.dev/slim"
)

func main() {
    s := slim.Classic()
    s.GET("/", func(c slim.Context) error {
        return c.String(http.StatusOK, "Hello, World!")
    })
    s.Logger.Fatal(s.Start(":1324"))
}
```

启动服务器

```shell title="terminal"
$ go run server.go
```

打开网址 http://localhost:1324 ，我们能够在页面上看到字符串 `Hello, World!` 。

## 路由 {#routing}

```go title="定义 RESTful 路由"
s.POST("/users", saveUser)
s.GET("/users/:id", getUser)
s.PUT("/users/:id", updateUser)
s.DELETE("/users/:id", deleteUser)
```

## 路径参数 {#path}

```go title="处理路径参数" {4}
// s.GET("/users/:id", getUser)
func getUser(c slim.Context) error {
    // User ID from path `users/:id`
    id := c.PathParam("id")
    return c.String(http.StatusOK, id)
}
```

打开网址 http://localhost:1324/users/joe ，我们会在页面上看到字符串 `joe`。

## 查询参数 {#query}

```go title="处理查询参数" {4-5}
// s.GET("/show", show)
func show(c slim.Context) error {
    // Get team and member from the query string
    team := c.QueryParam("team")
    member := c.QueryParam("member")
    return c.String(http.StatusOK, "team:" + team + ", member:" + member)
}
```

打开网址 http://localhost:1324/show?team=x-men&member=wolverine ，我们会在页面上看到字符串 `team: x-men, member: wolverine`。

## 表单数据 {#form}

我们使用表单提交下面的数据：

| name  | value           |
|-------|-----------------|
| name  | Joe Smith       |
| email | joe@zestack.dev |

```go title="处理表单数据" {4-5}
// s.POST("/save", save)
func save(c slim.Context) error {
    // Get name and email
    name := c.FormValue("name")
    email := c.FormValue("email")
    return c.String(http.StatusOK, "name:" + name + ", email:" + email)
}
```

我们打开控制台，使用 `curl` 命令执行下面的命令模拟表单请求：

```shell title="Terminal"
$ curl -d "name=Joe Smith" -d "email=joe@zestack.dev" http://localhost:1324/save
// => name:Joe Smith, email:joe@zestack.dev
```

## 文件上传 {#upload}

我们使用表单提交下面的数据：

| name   | value         |
|--------|---------------|
| name   | Joe Smith     |
| avatar | a avatar file |

```go title=" 处理文件上传" {6,12,19,26}
// s.POST("/save", save)
func save(c slim.Context) error {
    // Get name
    name := c.FormValue("name")
    // Get avatar
    avatar, err := c.FormFile("avatar")
    if err != nil {
        return err
    }
 
    // Source
    src, err := avatar.Open()
    if err != nil {
        return err
    }
    defer src.Close()
 
    // Destination
    dst, err := os.Create(avatar.Filename)
    if err != nil {
        return err
    }
    defer dst.Close()
 
    // Copy
    _, err = io.Copy(dst, src)
    if err != nil {
        return err
    }

    return c.HTML(http.StatusOK, "<b>Thank you! " + name + "</b>")
}
```

同样的，我们使用 `curl` 命令在控制台执行下面的命令模拟文件上传请求：

```shell title="Terminal"
$ curl -F "name=Joe Smith" -F "avatar=@/path/to/your/avatar.png" http://localhost:1324/save
// => <b>Thank you! Joe Smith</b>
```

要检查上传的图片，请运行以下命令：

```shell title="Terminal"
$ cd <project directory>
$ ls avatar.png
// => avatar.png
```

## 处理请求 {#handling}

- 调用方法 `Context#Bind` ，Slim 会根据请求标头 `Content-Type` 的值，将提交的 `json`、`xml`、`form`、`query`、`header` 等数据绑定到 Go 结构中；
- 响应 HTTP 状态码，并渲染 `json`、`xml` 或其它格式的数据。

```go title="请求处理程序" {8}
type User struct {
    Name  string `json:"name" xml:"name" form:"name" query:"name"`
    Email string `json:"email" xml:"email" form:"email" query:"email"`
}

e.POST("/users", func(c slim.Context) error {
    u := new(User)
    if err := c.Bind(u); err != nil {
        return err
    }
    return c.JSON(http.StatusCreated, u)
    // 或者
    // return c.XML(http.StatusCreated, u)
})
```

## 静态内容 {#static}

为路径 `/static/` 提供静态文件服务。

```go title="静态服务路由"
s.Static("/static", "static")
```

## 模板渲染 {#template}

需要提前实现模板渲染接口。

## 中间件 {#middleware}

```go title="中间件示例"
package main

func main() {
    s := slim.New()

    // Root level middleware
    s.Use(slim.Logging())
    s.Use(slim.Recovery())

    // Group level middleware
    s.Group("/admin", func(r slim.RouteCollector) {
        r.Use(BasicAuth(func(c slim.Context, username, password string) (bool, error) {
            if username == "joe" && password == "secret" {
                return true, nil
            }
            return false, nil
        }))
    })
    
    // Route level middleware
    track := func(c slim.Context, next slim.HandlerFunc) error {
        println("request to /users")
        return next(c)
    }
    route := s.GET("/users", func(c slim.Context) error {
        return c.String(http.StatusOK, "/users")
    })
    route.Use(track)
    
    // ... business logic
    
    s.Logger.Fatal(s.Start(":1324"))
}
```

:::tip
如果您使用过其它 Web 框架，比如：chi、echo、gin 等，虽然具有相同的路由组概念，但却有本质上的区别：

* 这些框架的在路由声明期间，会将路由组的中间件复制并合并到路由上面，在路由声明完成后，路由组会被抛弃。
* 而我们路由组会与路由器及路由形成树形结构，在处理请求期间，会**自上而下传递请求**，之后过滤并**逆序返回响应**，
  基于此，实现了友好的符合直观思维的**洋葱模型**。
:::