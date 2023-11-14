---
sidebar_position: 9
---

# Recover

## var DefaultRecoverConfig

```go
var DefaultRecoverConfig = RecoverConfig{
	StackSize:         4 << 10, // 4 KB
	DisableStackAll:   false,
	DisablePrintStack: false,
}
```

DefaultRecoverConfig is the default Recover middleware config.

## type RecoverConfig

```go
type RecoverConfig struct {
	// Size of the stack to be printed.
	// Optional. Default value 4KB.
	StackSize int
	// DisableStackAll disables formatting stack traces of all other goroutines
	// into buffer after the trace for the current goroutine.
	// Optional. Default value is false.
	DisableStackAll bool
	// DisablePrintStack disables printing stack trace.
	// Optional. Default value as false.
	DisablePrintStack bool
}
```

defines the config for Recover middleware.


### func (RecoverConfig) ToMiddleware

```go
func (config RecoverConfig) ToMiddleware() MiddlewareFunc
```

converts RecoverConfig to middleware or returns an error for invalid configuration

## func Recover

```go
func Recover() MiddlewareFunc
```

Recover returns a middleware which recovers from panics anywhere in the chain and handles the control to the centralized ErrorHandler.


## func RecoverWithConfig 

```go
func RecoverWithConfig(config RecoverConfig) MiddlewareFunc
```

returns Recovery middleware with config or panics on invalid configuration.