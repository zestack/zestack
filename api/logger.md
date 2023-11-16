---
sidebar_position: 8
---

# Logger


## type Logger

```go
type Logger interface {
    Output() io.Writer
    SetOutput(w io.Writer)
    Print(i ...any)
    Printf(format string, args ...any)
    Printj(j map[string]any)
    Debug(i ...any)
    Debugf(format string, args ...any)
    Debugj(j map[string]any)
    Info(i ...any)
    Infof(format string, args ...any)
    Infoj(j map[string]any)
    Warn(i ...any)
    Warnf(format string, args ...any)
    Warnj(j map[string]any)
    Error(i ...any)
    Errorf(format string, args ...any)
    Errorj(j map[string]any)
    Panic(i ...any)
    Panicf(format string, args ...any)
    Panicj(j map[string]any)
    Fatal(i ...any)
    Fatalf(format string, args ...any)
    Fatalj(j map[string]any)
}
```

定义的日志接口。

## func NewLogger

```go
func NewLogger() Logger
```

返回一个简单的日志接口实例。


## type LoggingConfig

```go
type LoggingConfig struct {
    Colorful bool
}
```

日志打印中间件配置结构体。

### func (LoggingConfig) ToMiddleware

```go
func (l LoggingConfig) ToMiddleware() MiddlewareFunc
```

为 `LoggingConfig` 实现 **[MiddlewareConfigurator](slim#type-middlewareconfigurator)** 接口。


## func Logging

```go
func Logging() MiddlewareFunc
```

返回默认日志打印中间件，它在非 windows 系统下，将会在控制台输出带颜色的日志信息。
