# ALUPLEXamp

Next.js landing page for ALUPLEXamp with a simple file-based CMS.

## Development

```bash
npm install
npm run dev
```

## CMS

The admin editor is available at `/admin`.

Content is stored in `src/content/translations.json`. In local development the admin API writes directly to that file. In production it commits changes back to GitHub, so Vercel can deploy the updated content without a database.

Required production environment variables:

```bash
ADMIN_PASSWORD="strong-admin-password"
GITHUB_CONTENT_TOKEN="github-fine-grained-token"
GITHUB_REPO="brunovoxmusic/aluplexamp"
GITHUB_BRANCH="main"
```

The GitHub token needs repository access to `brunovoxmusic/aluplexamp` with `Contents: Read and write`.

## Checks

```bash
npm run lint
npm run build
```
