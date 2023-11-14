---
sidebar_position: 6
---

# Serializer


## type Serializer

```go
type Serializer interface {
	Serialize(w io.Writer, v any, indent string) error
	Deserialize(r io.Reader, v any) error
}
```

定义 JSON 和 XML 的序列化接口。


### type JSONSerializer

```go
type JSONSerializer struct{}
```

为 JSON 实现序列化接口。


### type XMLSerializer

```go
type XMLSerializer struct{}
```

为 XML 实现序列化接口。