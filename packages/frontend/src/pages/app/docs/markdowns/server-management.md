# Server Management

Control your Minecraft server from the Remnant dashboard.

## Start / Stop Server

Main controls are available on the dashboard:

- **Start** - Starts the server with configured parameters
- **Stop** - Stops the server gracefully (sends `stop` then SIGTERM)
- **Restart** - Restarts the server

## Server Status

The dashboard displays in real-time:

| Indicator | Description                  |
| --------- | ---------------------------- |
| Status    | Running / Stopped / Starting |
| Uptime    | Time since startup           |
| Players   | Number of connected players  |
| CPU       | Processor usage              |
| RAM       | Memory used                  |

## Auto-start

To start the server automatically with Remnant:

1. Go to server **Settings**
2. Enable **Auto-start**
3. The server will start when Remnant launches
