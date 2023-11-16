---
sidebar_position: 15
---

# 模板

## 渲染

在处理器函数中，可以使用上下文方法 `Context#Render(code int, name string, data any) error` 将我们的模板文件渲染成 HTML 代码并响应给客户端。
但在此之前，我们必须通过设置 Slim 实例的属性 `Slim#Renderer` 注册模板引擎。

Slim 允许我们使用任何模板引擎实现模板的渲染功能，只需要实现如下接口即可：

```go title="模板引擎接口"
type Renderer interface {
    Render(c slim.Context, w io.Writer, name string, data any) error
}
```

下面示例展示如何使用 Go 标准库的 html/template 包实现模板引擎：

1. 实现接口 `slim.Renderer`

    ````go title="实现模板引擎"
    type Template struct {
        templates *template.Template
    }
    
    func (t *Template) Render(c slim.Context, w io.Writer, name string, data any) error {
        return t.templates.ExecuteTemplate(w, name, data)
    }
    ````

2. 预编译模板

    ```text title="views/hello.html"
    {{define "hello"}}Hello, {{.}}!{{end}}
    ```

    ```go title="预编译模板"
    t := &Template{
        templates: template.Must(template.ParseGlob("views/*.html")),
    }
    ```

3. 注册模板
    
   ```go title="注册模板"
    s := slim.New()
    s.Renderer = t
    s.GET("/hello", Hello)
    ```

4. 在处理程序中呈现模板
    
    ```go title="渲染模板"
    func Hello(c slim.Context) error {
        return c.Render(http.StatusOK, "hello", "World")
    }
    ```

## 增强

在某些情况下，从模板生成 URI 可能很有用。为此，您需要从模板本身调用。而 Golang 的标准库 html/template 不适合这项工作的，
但这可以通过两种方式完成：在传递给模板的所有对象上提供通用方法，或者在自定义渲染器中传递和增强此对象。
鉴于后一种方法的灵活性，下面是一个示例程序：

```html title="template.html"
<html>
<body>
    <h1>Hello {{index . "name"}}</h1>
    <p>{{ with $x := index . "reverse" }}
       {{ call $x "foobar" }} &lt;-- this will call the $x with parameter "foobar"
       {{ end }}
    </p>
</body>
</html>
```

我们的服务器代码：

```go title="server.go"
package main

import (
    "html/template"
    "io"
    "net/http"

    "zestack.dev/slim"
)

// TemplateRenderer is a custom html/template renderer for Echo framework
type TemplateRenderer struct {
    templates *template.Template
}

// Render renders a template document
func (t *TemplateRenderer) Render(c slim.Context, w io.Writer, name string, data interface{}) error {
    // Add global methods if data is a map
    if viewContext, isMap := data.(map[string]interface{}); isMap {
        viewContext["reverse"] = c.Slim().Reverse
    }

    return t.templates.ExecuteTemplate(w, name, data)
}

func main() {
  s := slim.New()
  renderer := &TemplateRenderer{
      templates: template.Must(template.ParseGlob("*.html")),
  }
  s.Renderer = renderer

  // Named route "foobar"
  s.GET("/something", func(c slim.Context) error {
      return c.Render(http.StatusOK, "template.html", map[string]any{
          "name": "Dolly!",
      })
  }).Name = "foobar"

  s.Logger.Fatal(s.Start(":8000"))
}
```