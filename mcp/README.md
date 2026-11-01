# Formwheel MCP Plugin 1.0

Read-only discovery for the public [Formwheel Hub](https://semicolonxss.github.io/Formwheel/).

## Development

Requires Node.js 20+.

```bash
cd mcp
npm install
npm test
npm start
```

Health check: `http://localhost:3000/health`

MCP endpoint: `http://localhost:3000/mcp` (Streamable HTTP, stateless POST requests).

## Tools

- `list_projects`: list public games and tools by category
- `search_projects`: search names and descriptions
- `random_project`: choose a random project by category
- `open_formwheel`: return the official Hub URL

Catalog entries are fetched from the repository's public README, cached for 15 minutes and restricted to Formwheel GitHub Pages project origins. This is a curated subset, **not** the complete live Hub catalog. Projects without a published HTTPS page in the README are omitted.

No Firebase credentials, account details, payments, Rapid balances or write operations are used.

## Deployment

GitHub Pages cannot run an MCP HTTP server. Deploy the `mcp/` folder to a Node.js hosting service with HTTPS and set the start command to `npm start`. Set its working directory to `mcp` and forward its assigned `PORT` environment variable. Then connect `https://YOUR-SERVER.example/mcp` in a client that supports custom remote MCP servers.

The server exposes public catalog data only. Before accepting untrusted internet traffic, configure your hosting proxy for rate limiting, TLS, and proper Origin / host protections. Do not add user-data tools without an authentication and authorization design.
