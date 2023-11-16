---
sidebar_position: 3
---

# 定制

:::tip
下面使用 **属性** 指代 **`Slim 实例的属性`**。
:::

## Debug

Slim 实例的属性 `Slim#Debug` 可用于启用或关闭调试模式。

| 值     | 描述     |
|-------|--------|
| true  | 开启调试模式 |
| false | 关闭调试模式 |

## Filesystem

属性 `Slim#Filesystem` 用于静态文件服务，默认作用在我们程序的工作目录。

```go title="自定义文件系统"
s.Filesystem = os.DirFS("/path/to/entry")
```

## Validator

属性 `Slim#Validator` 可用于注册验证器以执行数据验证，根据请求有效负载。

```go title="自定义验证器" {5}
func newCustomValidator() slim.Validator {
    // ...
}

s.Validator = newCustomValidator()
```

## Custom Binder

属性 `Slim#Binder` 可用于注册自定义的 [数据绑定](binding) 逻辑，实现对请求时提交的数据的解析。

```go title="自定义数据绑定" {5}
func newCustomBinder() slim.Binder {
    // ...
}

s.Binder = newCustomBinder()
```

## Custom Serializer

我们可以通过下面两个属性来定制序列化逻辑：

* 属性 `Slim#JSONSerializer` 用于 JSON 数据的序列化和反序列化；
* 属性 `Slim#XMLSerializer` 用于 XML 数据的序列化和反序列化。

```go title="自定义制序列化逻辑" {4,5}
func newJSONSerializer() slim.Serializer {}
func newXMLSerializer() slim.Serializer {}

s.JSONSerializer = newJSONSerializer()
s.XMLSerializer = newXMLSerializer()
```

## Renderer

属性 `Slim#Renderer` 可用于注册模板渲染的渲染器。

```go title="自定义模板渲染器" {5}
func newRenderer() slim.Renderer {
    // ...
}

s.Renderer = newRenderer()
```

## Error Handler

属性 `Slim#ErrorHandler` 可用于注册自定义 HTTP 错误处理程序。


```go title="自定义数据绑定"
s.ErrorHandler = func(c slim.Context, err error) {
    //  handling the error
    c.JSON(http.StatusInternalServerError, slim.Map{
        "message": err.Error(),
        "stack": stackFor(err), // for debug
    })
}
```
