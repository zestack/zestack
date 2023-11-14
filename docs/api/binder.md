---
sidebar_position: 2
---

# Binder

## type Binder

Binder is the interface that wraps the Bind method.

```go
type Binder interface {
	Bind(c Context, i any) error
}
```

## type BindUnmarshaler

BindUnmarshaler is the interface used to wrap the UnmarshalParam method.
Types that don't implement this, but do implement encoding.TextUnmarshaler will use that interface instead.

```go
type BindUnmarshaler interface {
	// UnmarshalParam decodes and assigns a value from an form or query param. 
	UnmarshalParam(param string) error
}
```

## type DefaultBinder

DefaultBinder is the default implementation of the Binder interface.

```go
type DefaultBinder struct{}
```

### func (*DefaultBinder) BindHeaders

BindHeaders binds HTTP headers to a bindable object

```go
func (*DefaultBinder) BindHeaders(c Context, i any) error
```

### func (*DefaultBinder) Bind

Bind implements the `Binder#Bind` function.
Binding is done in the following order: 1) path params; 2) query params; 3) request body. Each step COULD override previous step bound values. For single source binding use their own methods BindBody, BindQueryParams, BindPathParams.

```go
func (*DefaultBinder) Bind(c Context, i any) (err error)
```

## func BindPathParams

BindPathParams binds path params to a bindable object

```go
func BindPathParams(c Context, i any) error
```

## func BindQueryParams

BindQueryParams binds query params to bindable object

```go
func BindQueryParams(c Context, i any) error
```

## func BindBody

BindBody binds request body contents to bindable object.

```go
func BindBody(c Context, i any) (err error)
```

:::tip
then binding forms take note that this implementation uses standard library form parsing
which parses form data from BOTH URL and BODY if content type is not MIMEMultipartForm

* See non-MIMEMultipartForm: https://golang.org/pkg/net/http/#Request.ParseForm
* See MIMEMultipartForm: https://golang.org/pkg/net/http/#Request.ParseMultipartForm
:::
