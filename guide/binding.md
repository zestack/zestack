---
sidebar_position: 4
---

# 数据绑定

解析请求数据是 Web 应用程序的关键部分。客户端在发起 HTTP 请求时提供以下部分的信息，在 Slim 中，通过一个“绑定过程”就能够完成数据解析：

* URL 路径参数
* URL 查询参数
* 请求报头
* 请求正文

Slim 提供了不同的绑定执行方法，以下将介绍每种方法。

## 结构体标记

我们可以定义一个 Go 结构体，通过相应的标记指定数据源，在请求处理函数中，使用方法 `Context#Bind` 方法，就可以将提交的参数绑定到结构体上面了。

在下面示例中，通过给结构体字段 `ID` 指定 `query` 标记来告诉绑定器将查询字符串中的参数绑定到 `User#ID` 上面：

```go title="结构体绑定示例" {2,7}
type User struct {
    ID string `query:"id"`
}

// in the handler for /users?id=<userID>
var user User
err := c.Bind(&user)
if err != nil {
    return c.String(http.StatusBadRequest, "bad request")
}
```

### 数据源

框架支持以下标签指定数据源：

* query - 关联 URL 查询参数；
* param - 关联 URL 路径参数；
* header - 关联请求报头信息；
* json - 关联提交的 JSON 数据；
* xml - 关联提交的 XML 数据；
* form - 关联提交的表单数据（包括请求体和查询参数）。

### 数据类型

我们结合报头 `Content-Type` 的值来自动选择合适的程序解析请求体，支持以下三种方式提交数据:

* application/json - 以 JSON 格式提交数据
* application/xml - 以 XML 格式提交数据 
* application/x-www-form-urlencoded - 以标单方式提交数据

当绑定路径参数、查询参数、请求报头或表单数据时，必须在结构体字段上显式设置标记。如果省略标记，则使用 JSON 或 XML 对结构字段名进行绑定。

对于表单数据，我们使用 Go 的标准库解析表单。如果内容类型不是 `MIMEMultipartForm`，则会尝试解析来自请求 URL 和请求正文的表单数据。

参考链接：
* non-MIMEMultipartForm：https://golang.org/pkg/net/http/#Request.ParseForm
* MIMEMultipartForm：https://golang.org/pkg/net/http/#Request.ParseMultipartForm

### 多源绑定

可以在同一字段上指定多个源，在这种情况下，请求数据按以下顺序进行绑定：

1. 路径参数；
2. 查询参数（仅仅在 GET 和 DELETE 请求下）；
3. 请求体数据。

```go title="指定多个数据源" {2}
type User struct {
	ID string `param:"id" query:"id" form:"id" json:"id" xml:"id"`
}
```

:::warning
由于会按照上述方法依次执行数据绑定，所以可能会出现覆盖现象。比如，我们请求的查询参数包含 `name=query`，而请求体中包含 `{"name":"body"}`，这个时候的结果将会是 `User{Name: "body"}`。
:::


### 单源绑定

使用指定的单一数据源来绑定数据:

```go title="绑定请求体的数据"
err := (&DefaultBinder{}).BindBody(c, &payload)
```

```go title="绑定查询参数"
err := (&DefaultBinder{}).BindQueryParams(c, &payload)
```

```go title="绑定路由参数"
err := (&DefaultBinder{}).BindPathParams(c, &payload)
```

```go title="绑定 HTTP 请求报头"
err := (&DefaultBinder{}).BindHeaders(c, &payload)
```

### 安全

为了确保应用程序的安全，如果绑定的结构体实例包含不应绑定的字段，我们应该避免将这个结构体实例直接传递给其它方法，而应该并将其显式映射到业务结构上。

思考一下，如果我们需要绑定的结构体中有一个可以被导出的 bool 类型的字段 `IsAdmin`，而请求体的数据包含中 `{IsAdmin: true, Name: "hacker"}`，会发生什么。

在下面的示例中，我们定义了一个 `User` 结构类型，其中包含要绑定的字段标记 `json`, `form` 和 `query` 用于绑定数据：

```go title="数据结构"
type User struct {
    Name  string `json:"name" form:"name" query:"name"`
    Email string `json:"email" form:"email" query:"email"`
}

type UserDTO struct {
    Name    string
    Email   string
    IsAdmin bool
}
```

然后定义一个路由 `POST /users` 来处理请求，将数据绑定到结构体上：

```go title="路由处理函数" {3,9-13}
s.POST("/users", func(c slim.Context) (err error) {
    u := new(User)
    err := c.Bind(u)
    if err != nil {
        return c.String(http.StatusBadRequest, "bad request")
    }

    // Load into separate struct for security
    user := UserDTO{
        Name: u.Name,
        Email: u.Email,
        IsAdmin: false // avoids exposing field that should not be bound
    }

    // 执行我们的业务逻辑
    executeSomeBusinessLogic(user)

    return c.JSON(http.StatusOK, u)
})
```

#### JSON Data

```shell title="模拟浏览器发送 JSON 数据"
curl -X POST http://localhost:1323/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Joe","email":"joe@labstack"}'
```

#### Form Data

```shell title="模拟浏览器发送表单数据"
curl -X POST http://localhost:1323/users \
  -d 'name=Joe' \
  -d 'email=joe@labstack.com'
```

## 自定义绑定器

我们在前面[《定制》](customization)章节中提到过，通过设置 Slim 的实例属性 `Slim#Binder` 能够注册一个自定义的[数据绑定](binding)。

```go title="自定义数据绑定" {14}
type CustomBinder struct {}

func (cb *CustomBinder) Bind(c slim.Context, i any) error {
    // 我们可以使用默认绑定器
    db := new(slim.DefaultBinder)
    err := db.Bind(i, c)
    if  err != slim.ErrUnsupportedMediaType {
        return err
    }
    // 实现我们自己的参数绑定逻辑
    return nil
}

s.Binder = new(CustomBinder)
```