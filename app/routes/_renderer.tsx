import { jsxRenderer } from 'hono/jsx-renderer';
import { Script } from 'honox/server';

export default jsxRenderer(({ children, title }: { children?: any; title?: string }) => {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title || 'Job Parser'}</title>
        <link rel="stylesheet" href="/static/style.css" />
      </head>
      <body>
        <div class="container">{children}</div>
        <Script src="/app/client.tsx" />
      </body>
    </html>
  );
});