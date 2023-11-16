---
sidebar_position: 14
---

# 静态文件

图像、JavaScript、CSS、PDF、字体等......

## 使用静态中间件

```go
s := slim.New()
s.Use(slim.Static("./static"))
```

:::tip
如果我们使用函数 **`slim.Classic()`** 来初始化，就需要注意了，该方法已经内置了静态中间件，它使用 **./public 文件夹**作为静态服务的根目录。

关于 Slim 实例的更多信息，请查看 [经典实例](quick-start#classic) 一节。
:::

## 使用 Slim#Static()

实例方法 `Slim#Static(prefix, root string)` 用于注册依据路径前缀来提供静态服务的路由。

```go title="注册基于文件夹的静态服务路由"
s := slim.Classic()
s.Static("/static", "assets")
```

上面的示例使用了字符串 "/static" 为前缀的路由，以 assets 目录中的任何文件来响应请求。
例如，当客户端请求文件 `/static/js/main.js` 时，程序就会以 `assets/js/main.js` 做出响应。

:::tip
另外，我们同时为`路由器` 和 `路由收集器` 提供了类似的方法来响应静态服务。
:::

## 使用 Slim#File()

实例方法 `Slim#File` 用于注册文件路由，能够正确的响应文件内容。

```go title="示例"
s := slim.Classic()
// 定义在 Slim 实例上的 File 方法
s.File("/path", "<PATH/TO/FILE>")

r := s.Router()
// 定义在路由器上面的 File 方法
r.File("/path", "<PATH/TO/FILE>")

r.Group(func(g slim.RouteCollector) {
// 定义在路由收集器上面的 File 方法
   g.File("/path", "<PATH/TO/FILE>")
})
```

```go title="首页路由"
s.File("/", "public/index.html")
```

使用我们提供的文件 “public/index.html” 来响应首页。

```go title="网站图标"
s.File("/favicon.ico", "images/favicon.ico")
```

使用我们提供的图标文件 “images/favicon.ico” 来响应图标请求 。

:::tip
在此处，我们利用了在前面的 **[《响应》](response)** 章节里面提到过的上下文方法 **[Context#File(file string)](response#file)** 来正确地响应文件。
另外， 我们也同时为 `路由器` 和 `路由收集器` 提供了类似的方法来注册文件路由。
:::
