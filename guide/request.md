---
sidebar_position: 11
---

# 请求

## 获取数据

### 表单数据

使用上下文方法 `Context#FormValue(name string)` 按字段名称获取表单数据：

```go title="获取表单数据" {3}
// Handler
func(c slim.Context) error {
  name := c.FormValue("name")
  return c.String(http.StatusOK, name)
}
```

我们使用 `curl` 命令来模拟浏览器发送表单请求：

```shell title="terminal"
curl -X POST http://localhost:1324 -d 'name=Joe'
// => Joe
```

另外，我们可以实现接口 `Slim#BindUnmarshaler`，来完成自定义数据类型的值的绑定:

```go title="自定义时间戳类型"
type Timestamp time.Time

func (t *Timestamp) UnmarshalParam(src string) error {
  ts, err := time.Parse(time.RFC3339, src)
  *t = Timestamp(ts)
  return err
}
```

### 查询参数

使用上下文方法 `Context#QueryParam(name string)` 按字段名称获取查询参数：

```go title="获取查询参数" {3}
// Handler
func(c slim.Context) error {
  name := c.QueryParam("name")
  return c.String(http.StatusOK, name)
})
```

我们使用 `curl` 命令来模拟浏览器发送请求：

```shell title="terminal"
curl -X GET http://localhost:1323\?name\=Joe
// => Joe
```

与表单数据类似，我们也可以完成自定义数据类型的值的绑定。

### 路径参数

使用上下文方法 `Context#Param(name string) string` 按定义的参数名称获取路径参数，示例:

```go title="获取路径参数" {2}
s.GET("/users/:name", func(c slim.Context) error {
  name := c.Param("name")
  return c.String(http.StatusOK, name)
})
```

我们使用 `curl` 命令来模拟浏览器发送请求：

```shell title="terminal"
curl http://localhost:1323/users/Joe
// => Joe
```

### 绑定数据

此外，我们还可以通过 **[数据绑定](binding)** 将请求数据绑定到 Go 结构体上。

## 验证数据

Slim 没有内置的数据验证功能，但是，我们可以通过设置 Slim 的实例属性 `Slim#Validator` 来注册自定义验证器。

以下示例使用 https://github.com/go-playground/validator 框架进行验证：

```go {6,16-18,21-27,37} title="使用第三方框架"
package main

import (
  "net/http"

  "github.com/go-playground/validator"
  "zestack.dev/slim"
)

type (
  User struct {
    Name  string `json:"name" validate:"required"`
    Email string `json:"email" validate:"required,email"`
  }

  CustomValidator struct {
    validator *validator.Validate
  }
)

func (cv *CustomValidator) Validate(i interface{}) error {
  if err := cv.validator.Struct(i); err != nil {
    // Optionally, you could return the error to give each route more control over the status code
    return slim.NewHTTPError(http.StatusBadRequest, err.Error())
  }
  return nil
}

func main() {
  s := slim.Classic()
  s.Validator = &CustomValidator{validator: validator.New()}
  s.POST("/users", func(c slim.Context) (err error) {
    u := new(User)
    if err = c.Bind(u); err != nil {
      return slim.NewHTTPError(http.StatusBadRequest, err.Error())
    }
    if err = c.Validate(u); err != nil {
      return err
    }
    return c.JSON(http.StatusOK, u)
  })
  s.Logger.Fatal(s.Start(":1323"))
}
```

使用 `curl` 命令模拟浏览器发送请求

```shell title="terminal"
curl -X POST http://localhost:1324/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Joe","email":"joe@invalid-domain"}'
{"message":"Key: 'User.Email' Error:Field validation for 'Email' failed on the 'email' tag"}
```