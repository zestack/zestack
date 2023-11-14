---
sidebar_position: 10
---

# Error


## builtin errors

```go

// Errors
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


##  func NewHTTPError

```go
func NewHTTPError(code int, message ...any) *HTTPError
```

creates a new HTTPError instance.


## func NewHTTPErrorWithInternal

```go
func NewHTTPErrorWithInternal(code int, internalError error, message ...any) *HTTPError
```

creates a new HTTPError instance with an internal error set.


## type HTTPError

```go
type HTTPError struct {
	StatusCode int   `json:"-"`
	Message    any   `json:"message"`
	Internal   error `json:"-"` // Stores the error returned by an external dependency
}
```

represents an error that occurred while handling a request.


### func (*HTTPError) Error

```go
func (he *HTTPError) Error() string
```

makes it compatible with `error` interface.


### func (*HTTPError) WithInternal

```go
func (he *HTTPError) WithInternal(err error) *HTTPError
```

returns clone of HTTPError with err set to HTTPError.Internal field


### func (*HTTPError) Unwrap

```go
func (he *HTTPError) Unwrap() error
```

satisfies the Go 1.13 error wrapper interface.
