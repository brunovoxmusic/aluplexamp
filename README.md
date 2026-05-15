# ALUPLEXamp

Next.js landing page for ALUPLEXamp with a simple file-based CMS.

## Development

```bash
npm install
npm run dev
```

## CMS

The admin editor is available at `/admin`.

Content is stored in:

- `src/content/translations.json` for page text, CTA labels, FAQ and form copy
- `src/content/site.json` for SEO metadata

In local development the admin API writes directly to these files. In production it commits changes back to GitHub, so Vercel can deploy the updated content without a database.

Required production environment variables:

```bash
ADMIN_PASSWORD="strong-admin-password"
GITHUB_CONTENT_TOKEN="github-fine-grained-token"
GITHUB_REPO="brunovoxmusic/aluplexamp"
GITHUB_BRANCH="main"
RESEND_API_KEY="resend-api-key"
CONTACT_TO_EMAIL="info@aluplex.sk,objednavky@aluplex.sk"
CONTACT_FROM_EMAIL="ALUPLEXamp <noreply@your-verified-domain.com>"
```

The GitHub token needs repository access to `brunovoxmusic/aluplexamp` with `Contents: Read and write`.

`RESEND_API_KEY` is required in production for the contact form. `CONTACT_FROM_EMAIL` must use a domain verified in Resend. Until the domain is verified, use Resend's allowed test sender only for development/testing.

## Vercel setup

1. Open the Vercel project.
2. Go to `Settings` -> `Environment Variables`.
3. Add the variables listed above for Production, Preview and Development as needed.
4. Use a fine-grained GitHub token scoped only to `brunovoxmusic/aluplexamp`.
5. Add a Resend API key and verified sender for contact form delivery.
6. Redeploy the latest `main` branch after adding the variables.

When `/admin` saves content in production, it creates GitHub commits. If the Vercel project is connected to the repository, those commits trigger a new deployment automatically.

## Checks

```bash
npm run lint
npm run build
```
