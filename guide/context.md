---
sidebar_position: 5
---

# 上下文

接口 `slim.Context` 是用于当前 HTTP 请求的 Slim 处理器函数的上下文，它包括对请求和响应的引用、路由匹配的信息、运行时数据等，用于读取请求和写入响应。

:::tip
我们要区分 `slim.Context` 和 HTTP 请求上下文（http.Request.Context）的区别。
:::

## 扩展上下文

因为 slim.Context 是一个接口，所以我们可以十分容易的扩展它。

定义我们自己的上下文：

```go title="扩展上下文"
type CustomContext struct {
	slim.Context
}

func (c *CustomContext) Foo() {
    println("foo")
}

func (c *CustomContext) Bar() {
    println("bar")
}
```

然后创建一个中间件来扩展默认的上下文，并将这个新的上下文传递给下游：

```go {2} title="使用自定义上下文"
s.Use(func(c slim.Context, next slim.HandlerFunc) error {
    cc := &CustomContext{c}
    return next(cc)
})
```

:::caution
这个中间件应该先于其它中间件之前被注册。
:::

然后，我们就可以在处理器函数中使用它了。

```go {2}
s.GET("/", func(c slim.Context) error {
    cc := c.(*CustomContext)
    cc.Foo()
    cc.Bar()
    return cc.String(200, "OK")
})
```

## 并发操作

:::caution

`slim.Context` 不能在处理请求的 goroutine 之外被访问，原因以下有两点：

1. 默认的 `slim.Context` 的实现是**并发不安全的**，因此，我们应该只在一个 `goroutine` 中访问它；
2. 另外，`slim.Context` 是使用对象池 `sync.Pool` 来创建的，当请求处理完成后，会返回到对象池中以备将来被重新启用。

由于并发的复杂性，在使用 goroutines 时要十分小心地注意这个陷阱。

:::

我们可以使用通道来阻止请求处理，等待处理器函数的子协程结束后完成对请求的处理：

```go {3,14,18} title="并发示例"
func(c slim.Context) error {
    // 首先，我们准备一个容量为 1 的非阻塞通道
    ca := make(chan string, 1)
    r := c.Request()
    method := r.Method

    go func() {
        // 我们应该在这个函数之外，事先准备好与上下文有关的数据， 
        // 切勿在此使用 slim.Context 实例 `c` 来获取数据。
        fmt.Printf("Method: %s\n", method) 

        // 在这里，我们可以做一些耗时操作
        // 然后使用通道告诉处理器处理完成。 
        ca <- "Hey!"
    }()

    select {
    case result := <-ca:
        // 接收其它 goroutine 处理的结果 
        return c.String(http.StatusOK, "Result: "+result)
    case <-c.Context().Done():
        // 如果代码运行到这里，这就说明上下文被取消了（比如超时等）。
        return nil
    }
}
```