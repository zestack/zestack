---
sidebar_position: 9
---

# Recovery

## var DefaultRecoverConfig

```go
var DefaultRecoverConfig = RecoverConfig{
    StackSize:         4 << 10, // 4 KB
    DisableStackAll:   false,
    DisablePrintStack: false,
}
```

容错恢复中间件的默认的配置。

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

容错恢复中间件的配置结构体。

### func (RecoverConfig) ToMiddleware

```go
func (config RecoverConfig) ToMiddleware() MiddlewareFunc
```

将结构体 `RecoverConfig` 转换为容错恢复中间件，该中间件可以捕获 **panic** 错误并将它返回出去。

## func Recover

```go
func Recover() MiddlewareFunc
```

返回容错恢复中间件，它可以捕获 **panic**，并将错误返回，方便程序将它提供给错误处理器。

## func RecoverWithConfig 

```go
func RecoverWithConfig(config RecoverConfig) MiddlewareFunc
```

通过配置返回容错恢复中间件。