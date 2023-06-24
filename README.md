# Auto Attach Child Processes

Visual Studio Extension allowing auto attaching child processes (currently only using codelldb)

## Requirements

For now you need CodeLLDB for it to work

## how to use
Add `"autoAttachChildProcess": true` to launch configuration you want to allow auto attaching

examples:
```json
{
    "type": "lldb",
    "request": "attach",
    "name": "Attach",
    "autoAttachChildProcess": true,
    "pid": "${command:pickMyProcess}"
},
{
    "type": "lldb",
    "request": "launch",
    "name": "Debug",
    "program": "${workspaceFolder}/a.out",
    "args": [],
    "cwd": "${workspaceFolder}",
    "autoAttachChildProcess": true
}
```

## Known Issues

Working only with codelldb fow now

## Release Notes

### 0.0.1

Initial release of auto attaching codelldb
