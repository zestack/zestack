---
sidebar_position: 12
---

# 响应

## 发送字符串 {#string}

使用上下文方法 `Context#String(code int, s string)` 来响应 HTTP 状态码和纯文本数据。

```go title="响应纯文本" {2}
func(c slim.Context) error {
    return c.String(http.StatusOK, "Hello, World!")
}
```

## 发送 HTML {#html}

使用上下文方法 `Context#HTML(code int, html string)` 可用于发送简单的 HTML 文本，如果我们发送动态生成的 HTML，可以参考 [模板](template) 章节。

```go title="响应超文本标记" {2}
func(c slim.Context) error {
  return c.HTML(http.StatusOK, "<strong>Hello, World!</strong>")
}
```

### 发送 HTML Blob {#html-blob}

使用上下文方法 `Context#HTMLBlob(code int, b []byte)` 可用于发送具有状态的 HTML blob 内容。

## 渲染模板 {#render}

参考 [模板](template) 章节了解更多信息。

## 发送 JSON {#json}

使用上下文方法 `Context#JSON(code int, i any)` 可用于将提供的 Go 类型数据序列化为 JSON 数据，与状态码一起响应出去。

```go {13} title="响应 JSON 数据"
// User
type User struct {
  Name  string `json:"name" xml:"name"`
  Email string `json:"email" xml:"email"`
}

// Handler
func(c slim.Context) error {
  u := &User{
    Name:  "Jon",
    Email: "jon@zestack.com",
  }
  return c.JSON(http.StatusOK, u)
}
```

### Stream JSON {#stream-json}

由于方法 `Context#JSON()` 内部使用 json.Marshal 对数据进行序列化，对于大型 JSON 可能效率不高，在这种情况下，我们可以使用数据流来传输 JSON，示例：

```go title="JSON 数据流" {8}
func(c slim.Context) error {
  u := &User{
    Name:  "Jon",
    Email: "jon@zestack.com",
  }
  c.Response().Header().Set(slim.HeaderContentType, slim.MIMEApplicationJSONCharsetUTF8)
  c.Response().WriteHeader(http.StatusOK)
  return json.NewEncoder(c.Response()).Encode(u)
}
```

### Pretty JSON {#pretty-json}

使用上下文方法 `Context#JSONPretty(code int, i any, indent string)` 可用于发送一个基于空格或制表符缩进的 JSON 数据。

下面的示例是发送基于空格缩进 JSON 数据：

```go title="发送被格式化的 JSON 数据"
func(c slim.Context) error {
    u := &User{
        Name:  "Jon",
        Email: "joe@zestack.com",
    }
    return c.JSONPretty(http.StatusOK, u, "  ")
}
```

```json title="示例结果"
{
  "email": "joe@zestack.com",
  "name": "Jon"
}
```

### JSON Blob {#json-blob}

使用上下文方法 `Context#JSONBlob(code int, b []byte)` 可用于直接发送自外部源的预编码的 JSON blob 来，例如数据库。

```go title="JSON Blob"
func(c slim.Context) error {
  encodedJSON := []byte{} // Encoded JSON from external source
  return c.JSONBlob(http.StatusOK, encodedJSON)
}
```

## 发送 JSONP {#jsonp}

使用上下文方法 `Context#JSONP(code int, callback string, i any)` 可用于对提供的 JSON 数据以 `JavaScript` 脚本的回调方式进行响应。


## 发送 XML {#xml}

使用上下文方法 `Context#XML(code int, i any)` 可用于将提供的 Go 类型的数据编码为 XML 格式的文本，与状态码一起的被发送出去。

```go title="响应 XML 文本" {6}
func(c slim.Context) error {
  u := &User{
    Name:  "Jon",
    Email: "jon@zestack.com",
  }
  return c.XML(http.StatusOK, u)
}
```

### Stream XML {#stream-xml}

上下文方法 `Context#XML` 使用的是 Go 内置的 xml.Marshal 对数据进行编码, 对于大型的 XML 可能效率不高，在这种情况下，我们可以通过是数据流的方式传输 XML 来加快响应。

```go title="响应 XML 数据流" {8}
func(c slim.Context) error {
  u := &User{
    Name:  "Jon",
    Email: "jon@zestack.com",
  }
  c.Response().Header().Set(slim.HeaderContentType, slim.MIMEApplicationXMLCharsetUTF8)
  c.Response().WriteHeader(http.StatusOK)
  return xml.NewEncoder(c.Response()).Encode(u)
}
```

### Pretty XML {#pretty-xml}

使用上下文方法 `Context#XMLPretty(code int, i any, indent string)` 可用于发送一个基于空格或制表符缩进的 XML 数据。

下面的示例发送一个基于空格缩进的 XML 数据：

```go title="格式化输出 XML 文本" {6}
func(c slim.Context) error {
  u := &User{
    Name:  "Jon",
    Email: "joe@zestack.com",
  }
  return c.XMLPretty(http.StatusOK, u, "  ")
}
```

结果如下：

```xml title="被格式化的 XML 文本"
<?xml version="1.0" encoding="UTF-8"?>
<User>
  <Name>Jon</Name>
  <Email>joe@zestack.com</Email>
</User>
```

### XML Blob {#xml-blob}

使用上下文方法 `Context#XMLBlob(code int, b []byte)` 可用于直接发送来自外部源的预编码过的 XML blob 数据，例如来于自数据库。

```go title="XML blob" {3}
func(c slim.Context) error {
  encodedXML := []byte{} // Encoded XML from external source
  return c.XMLBlob(http.StatusOK, encodedXML)
}
```

## 发送文件 {#file}

使用上下文方法 `Context#File(file string)` 可用于发送基于 `Slim#Filesystem` 的文件的内容作为响应。 它会自动设置正确的内容类型并优雅地处理缓存。

```go title="发送文件" {2}
func(c slim.Context) error {
  return c.File("<PATH_TO_YOUR_FILE>")
}
```

## 发送附件 {#attachment}

使用上下文方法 `Context#Attachment(file, name string)` 用于将文件作为附件发送，浏览器会使用我们提供名称将文件下载到用户的设备上。

```go title="发送附件" {2}
func(c slim.Context) error {
  return c.Attachment("<PATH_TO_YOUR_FILE>", "<ATTACHMENT_NAME>")
}
```

## 发送内联文件 {#inline}

使用上下文方法 `Context#Inline(file, name string)` 用于将文件以内联的形式（即网页或者页面的一部分）发送到浏览器上。

```go title="内联文件" {2}
func(c slim.Context) error {
  return c.Inline("<PATH_TO_YOUR_FILE>")
}
```

## 发送 Blob {#blob}

使用上下文方法 `Context#Blob(code int, contentType string, b []byte)` 用于字节切片，但是我们必须提供正确的 MIME 类型，只有这样客户端才能够理解我们的意图。

```go title="发送 Blob 数据" {4}
func(c slim.Context) (err error) {
  data := []byte(`0306703,0035866,NO_ACTION,06/19/2006
      0086003,"0005866",UPDATED,06/19/2006`)
    return c.Blob(http.StatusOK, "text/csv", data)
}
```

## 发送数据流 {#stream}

使用上下文方法 `Context#Stream(code int, contentType string, r io.Reader)` 用于发送来自接口 `io.Reader` 的数据，并且以数据流的方式做出响应，这个时候，我们必须提供正确的 MIME 类型，客户端才能够理解我们的意图。

```go title="响应数据流"
func(c slim.Context) error {
  f, err := os.Open("<PATH_TO_IMAGE>")
  if err != nil {
    return err
  }
  return c.Stream(http.StatusOK, "image/png", f)
}
```

## 不发送任何内容 {#no-content}

使用上下文方法 `Context#NoContent(code int)` 用于发送指定的状态代码，该方法不响应任何内容。

常用的状态码是 `204 - http.StatusNoContent`。

```go title="无内容响应" {2}
func(c slim.Context) error {
  return c.NoContent(http.StatusOK)
}
```

## 重定向请求 {#redirect}

使用上下文方法 `Context#Redirect(code int, url string)` 用于对请求的重定向。

```go {3} title="重定向"
// handler a request
func(c slim.Context) error {
  return c.Redirect(http.StatusMovedPermanently, "<URL>")
}
```