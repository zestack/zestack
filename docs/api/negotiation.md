---
sidebar_position: 1
---

# Negotiation

## type Negotiator

```go
// Negotiator An HTTP content negotiator
type Negotiator struct {
	// 缓存容量
	capacity int
	// 有些时候，解析出来的 Accept 并
	// 不是 W3C 所定义的标准的值，我们
	// 通过该函数将其重写成标准格式的值。
	onParse func(*Accept)
}
```

## func NewNegotiator

```go
func NewNegotiator(capacity int, onParse func(*Accept)) *Negotiator
```

### func (*Negotiator) Slice

解析 HTTP 的 Accept(-Charset|-Encoding|-Language) 报头，
返回 AcceptSlice，该结果是根据值的类型和权重因子按照降序排列的，
如果类型一致且权重一致，则使用出场的先后顺序排列。

http://www.w3.org/Protocols/rfc2616/rfc2616-sec14

```go
func (n *Negotiator) Slice(header string) AcceptSlice
```

### func (*Negotiator) Charset

```go
func (n *Negotiator) Charset(r *http.Request, charsets ...string) string
```

### func (*Negotiator) Encoding

```go
func (n *Negotiator) Encoding(r *http.Request, encodings ...string) string
```

### func (*Negotiator) Language

```go
func (n *Negotiator) Language(r *http.Request, languages ...string) string
```

### func (*Negotiator) Type

```go
func (n *Negotiator) Type(r *http.Request, types ...string) string
```

### func (*Negotiator) Accepts

```go
func (n *Negotiator) Accepts(header string, ctypes ...string) string
```

## type Accept

represents a parsed `Accept(-Charset|-Encoding|-Language)` header.

```go
type Accept struct {
	Type       string
	Subtype    string
	Quality    float64
	Extensions map[string]any
}
```

## type AcceptSlice

AcceptSlice is a slice of accept.

```go
type AcceptSlice []Accept
```

### func (AcceptSlice) Len()

Len implements the Len() method of the Sort interface.

```go
func (as AcceptSlice) Len() int
```

### func (AcceptSlice) Less

Less implements the Less() method of the Sort interface.
Elements are sorted in order of decreasing preference.

```go
func (as AcceptSlice) Less(i, j int) bool
```

### func (AcceptSlice) Swap

Swap implements the Swap() method of the Sort interface.

```go
func (as AcceptSlice) Swap(i, j int)
```

### func (AcceptSlice) Negotiate

returns a type that is accepted by both the AcceptSlice, and the list of types provided.
If no common types are found, an empty string is returned.

```go
func (as AcceptSlice) Negotiate(ctypes ...string) (string, int, error)
```

### func (AcceptSlice) Accepts

returns true if the provided type is accepted.

```go
func (as AcceptSlice) Accepts(ctype string) bool
```
