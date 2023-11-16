---
sidebar_position: 10
---

# Error


## builtin errors

```go title="内置的错误变量"
var (
    ErrUnsupportedMediaType        = NewHTTPError(http.StatusUnsupportedMediaType)
    ErrNotFound                    = NewHTTPError(http.StatusNotFound)
    ErrUnauthorized                = NewHTTPError(http.StatusUnauthorized)
    ErrForbidden                   = NewHTTPError(http.StatusForbidden)
    ErrMethodNotAllowed            = NewHTTPError(http.StatusMethodNotAllowed)
    ErrStatusRequestEntityTooLarge = NewHTTPError(http.StatusRequestEntityTooLarge)
    ErrTooManyRequests             = NewHTTPError(http.StatusTooManyRequests)
    ErrBadRequest                  = NewHTTPError(http.StatusBadRequest)
    ErrBadGateway                  = NewHTTPError(http.StatusBadGateway)
    ErrInternalServerError         = NewHTTPError(http.StatusInternalServerError)
    ErrRequestTimeout              = NewHTTPError(http.StatusRequestTimeout)
    ErrServiceUnavailable          = NewHTTPError(http.StatusServiceUnavailable)
    ErrValidatorNotRegistered      = errors.New("validator not registered")
    ErrRendererNotRegistered       = errors.New("renderer not registered")
    ErrInvalidRedirectCode         = errors.New("invalid redirect status code")
    ErrCookieNotFound              = errors.New("cookie not found")
    ErrInvalidCertOrKeyType        = errors.New("invalid cert or key type, must be string or []byte")
    ErrInvalidListenerNetwork      = errors.New("invalid listener network")
    ErrFilesystemNotRegistered     = errors.New("filesystem not registered")
)
```

## func NewHTTPError

```go
func NewHTTPError(code int, message ...any) *HTTPError
```

创建一个 HTTP 错误实例。

## func NewHTTPErrorWithInternal

```go
func NewHTTPErrorWithInternal(code int, internalError error, message ...any) *HTTPError
```

创建一个包含内部异常的 HTTP 错误实例。

## type HTTPError

```go
type HTTPError struct {
    StatusCode int   `json:"-"`
    Message    any   `json:"message"`
    Internal   error `json:"-"` // Stores the error returned by an external dependency
}
```

HTTP 错误结构体，表示在处理请求时发生的错误。

### func (*HTTPError) Error

```go
func (he *HTTPError) Error() string
```

实现 `error` 接口。

### func (*HTTPError) WithInternal

```go
func (he *HTTPError) WithInternal(err error) *HTTPError
```

复制当前实例并设置内部异常。

### func (*HTTPError) Unwrap

```go
func (he *HTTPError) Unwrap() error
```

实现错误包装器接口。
