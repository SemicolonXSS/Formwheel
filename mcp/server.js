import http from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { getCatalog, searchProjects, chooseProject, hubUrl } from './catalog.js';

const PORT = Number(process.env.PORT || 3000);
function result(value) { return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] }; }
function makeServer() {
  const server = new McpServer({ name: 'formwheel', version: '1.0.0' });
  server.tool('list_projects', 'List public Formwheel games and tools; no user data is accessed.', {
    category: z.enum(['all', 'game', 'tool', 'app']).default('all')
  }, async ({ category }) => result({ source: 'official README', projects: searchProjects(await getCatalog(), '', category) }));
  server.tool('search_projects', 'Search public Formwheel project names and descriptions.', {
    query: z.string().max(100),
    category: z.enum(['all', 'game', 'tool', 'app']).default('all')
  }, async ({ query, category }) => result({ projects: searchProjects(await getCatalog(), query, category) }));
  server.tool('random_project', 'Pick a random public Formwheel project.', {
    category: z.enum(['all', 'game', 'tool', 'app']).default('all')
  }, async ({ category }) => result({ project: chooseProject(await getCatalog(), category) }));
  server.tool('open_formwheel', 'Return the official Formwheel Hub URL. Does not open a browser.', {}, async () => result({ url: hubUrl }));
  return server;
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'formwheel-mcp' }));
    return;
  }
  if (req.url !== '/mcp') { res.writeHead(404); res.end('Not found'); return; }
  if (req.method !== 'POST') { res.writeHead(405, { Allow: 'POST' }); res.end('Method not allowed'); return; }
  const origin = req.headers.origin;
  if (origin) {
    try {
      const u = new URL(origin);
      if (!['https:', 'http:'].includes(u.protocol) || !u.hostname) throw new Error();
    } catch { res.writeHead(403); res.end('Invalid Origin'); return; }
  }
  const mcp = makeServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  try {
    await mcp.connect(transport);
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error('MCP request failed:', error);
    if (!res.headersSent) { res.writeHead(500); res.end('MCP error'); }
  } finally {
    res.on('close', () => { void transport.close(); void mcp.close(); });
  }
});
server.listen(PORT, '0.0.0.0', () => console.log('Formwheel MCP listening on ' + PORT));
