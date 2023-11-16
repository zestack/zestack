---
sidebar_position: 1
---

# Negotiation

## type Negotiator

```go
type Negotiator struct {
    // 缓存容量，当协商报头相同时我们复用解析结果的。
    capacity int
    // 有些时候，解析出来的 Accept 并不是 W3C 所定义的
    // 标准的值，我们通过该函数将其重写成标准格式的值。
    onParse func(*Accept)
}
```

一个 HTTP 请求的内容协商工具，根据下面的报头来处理协商的：

- **[Accept](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Accept)**，客户端可以处理的内容类型，这种内容类型用 [MIME](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types) 类型来表示；
- **[Accept-Charset](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Accept-Charset)**，客户端可以处理的字符集类型，比如 `utf-8` 或 `iso-8859-1` 等；
- **[Accept-Encoding](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Accept-Encoding)**，客户端提交的能够理解的内容编码方式，通常是某种压缩算法；
- **[Accept-Language](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Accept-Language)**，客户端声明它可以理解的自然语言，比如 `zh` 等。

## func NewNegotiator

```go
func NewNegotiator(capacity int, onParse func(*Accept)) *Negotiator
```

创建内容协商工具。

### func (*Negotiator) Slice

```go
func (n *Negotiator) Slice(header string) AcceptSlice
```

解析 HTTP 的 Accept(-Charset|-Encoding|-Language) 报头，返回 **[AcceptSlice](#type-acceptslice)**，
该结果是根据值的类型和权重因子按照降序排列的，如果类型一致且权重一致，则使用出场的先后顺序排列。

我们可以查看标准：https://www.rfc-editor.org/rfc/rfc9110.html#name-accept

### func (*Negotiator) Charset

```go
func (n *Negotiator) Charset(r *http.Request, charsets ...string) string
```

解析报头 **Accept-Charset** 并从给出字符集类型列表 `charsets` 中返回权重最高的，如果没有匹配的值，则返回空字符串。

### func (*Negotiator) Encoding

```go
func (n *Negotiator) Encoding(r *http.Request, encodings ...string) string
```

解析报头 **Accept-Encoding** 并从给出内容编码方式列表 `encodings` 中返回权重最高的，如果没有匹配的值，则返回空字符串。

### func (*Negotiator) Language

```go
func (n *Negotiator) Language(r *http.Request, languages ...string) string
```

解析报头 **Accept-Language** 并从给出语言列表 `languages` 中返回权重最高的，如果没有匹配的值，则返回空字符串。

### func (*Negotiator) Type

```go
func (n *Negotiator) Type(r *http.Request, types ...string) string
```

解析报头 **Accept** 并从给出内容类型列表 `types` 中返回权重最高的，如果没有匹配的值，则返回空字符串。
其中，给出的参数 types 的值可以是标准的媒体类型（如 application/json），也可以是扩展名（如 json、xml 等）。

### func (*Negotiator) Accepts

```go
func (n *Negotiator) Accepts(header string, ctypes ...string) string
```

解析报头 `header` 并从给出参数列表 `ctypes` 中返回权重最高的，如果没有匹配的值，则返回空字符串。
该方法属于上面 4 个方法的合并版本，但是与方法 Negotiator#Type 稍有区别，就是不支持通过扩展名来判断内容类型。

## type Accept

```go
type Accept struct {
    Type       string
    Subtype    string
    Quality    float64
    Extensions map[string]any
}
```

表示解析后的 `Accept(-Charset|-Encoding|-Language)` 这些报头的单元值。

## type AcceptSlice

```go
type AcceptSlice []Accept
```

表示解析后的 `Accept(-Charset|-Encoding|-Language)` 这些报头的值，是有 Accept 结构切片。

### func (AcceptSlice) Len()

```go
func (as AcceptSlice) Len() int
```

实现了 `sort.Interface` 接口的 Len() 方法。

### func (AcceptSlice) Less

```go
func (as AcceptSlice) Less(i, j int) bool
```

实现了 `sort.Interface` 接口的 Less() 方法，是元素按优先级递减的顺序进行排序。

### func (AcceptSlice) Swap

```go
func (as AcceptSlice) Swap(i, j int)
```

实现了 `sort.Interface` 接口的 Swap() 方法。

### func (AcceptSlice) Negotiate

```go
func (as AcceptSlice) Negotiate(ctypes ...string) (string, int, error)
```

从切片中返回能够被客户端接受的类型，如果没有找到类型，则返回空字符串。

### func (AcceptSlice) Accepts

```go
func (as AcceptSlice) Accepts(ctype string) bool
```

如果提供的类型 `ctype` 能够被客户端接受，就返回 true，相反就返回 false。
