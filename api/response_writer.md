---
sidebar_position: 7
---

# ResponseWriter


## type ResponseWriter

```go
type ResponseWriter interface {
	http.ResponseWriter
	http.Flusher
	http.Pusher
	// Status returns the status code of the response or 0 if the response has not been written.
	Status() int
	// Written returns whether the ResponseWriter has been written.
	Written() bool
	// Size returns the size of the response body.
	Size() int
}
```

ResponseWriter is a wrapper around http.ResponseWriter that provides extra information about the response. It is recommended that middleware handlers use this construct to wrap a ResponseWriter if the functionality calls for it.


## func NewResponseWriter

```go
func NewResponseWriter(method string, rw http.ResponseWriter) ResponseWriter
```

creates a ResponseWriter that wraps an `http.ResponseWriter`
