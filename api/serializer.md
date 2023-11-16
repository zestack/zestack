---
sidebar_position: 6
---

# Serializer


## type Serializer

```go
type Serializer interface {
    // 序列化
    Serialize(w io.Writer, v any, indent string) error
    // 反序列化
    Deserialize(r io.Reader, v any) error
}
```

定义 JSON 和 XML 的序列化与反序列化接口。


### type JSONSerializer

```go
type JSONSerializer struct{}
```

为 JSON 实现的默认序列化接口。


### type XMLSerializer

```go
type XMLSerializer struct{}
```

为 XML 实现的默认序列化接口。