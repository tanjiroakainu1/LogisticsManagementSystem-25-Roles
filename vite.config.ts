import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'http';
import { proxyToOpenRouter } from './api/chat/openrouterProxy.js';

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

function aiChatPlugin(apiKey: string, model: string): Plugin {
  const handler = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.method !== 'POST' || !req.url?.startsWith('/api/chat/completions')) {
      next();
      return;
    }
    const body = await readBody(req);
    const result = await proxyToOpenRouter({
      apiKey,
      model,
      referer: 'http://localhost:5173',
      body,
    });
    res.statusCode = result.status;
    res.setHeader('Content-Type', 'application/json');
    res.end(result.body);
  };

  return {
    name: 'lms-ai-gateway',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      aiChatPlugin(env.OPENROUTER_API_KEY ?? '', env.OPENROUTER_MODEL ?? 'qwen/qwen-2.5-7b-instruct'),
    ],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
    base: '/',
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
