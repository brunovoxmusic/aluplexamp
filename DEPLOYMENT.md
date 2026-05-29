# ALUPLEXamp deployment checklist

## Vercel project

- Framework preset: Next.js
- Build command: `npm run build`
- Install command: default
- Output: handled by Next.js
- Production branch: `main`

The project uses file-based content in `src/content`. No database is required for the live website or CMS.

## Environment variables

Set these in Vercel for Production. Add the same values to Preview only if you want preview deployments to send emails and write CMS changes.

| Variable | Required | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | Yes | Password required by `/admin` before saving content. |
| `GITHUB_CONTENT_TOKEN` | Yes | Fine-grained GitHub token used by CMS to commit JSON content changes. |
| `GITHUB_REPO` | Yes | Repository target, normally `brunovoxmusic/aluplexamp`. |
| `GITHUB_BRANCH` | Yes | Branch where CMS commits content, normally `main`. |
| `RESEND_API_KEY` | Yes | Sends contact form emails in production. |
| `CONTACT_TO_EMAIL` | Yes | Universal recipient inbox, use `info@aluplexamp.com`. |
| `CONTACT_FROM_EMAIL` | Yes | Verified Resend sender address, preferably `ALUPLEXamp <info@aluplexamp.com>`. |

## GitHub token scope

Create a fine-grained GitHub token with access only to `brunovoxmusic/aluplexamp`.

Required repository permission:

- Contents: Read and write

Do not use a broad personal access token if a fine-grained token is available.

## Resend setup

1. Verify the sender domain in Resend.
2. Set `CONTACT_FROM_EMAIL` to `ALUPLEXamp <info@aluplexamp.com>` after the domain is verified.
3. Set `CONTACT_TO_EMAIL` to `info@aluplexamp.com`.
4. Submit one test inquiry after deploy and confirm delivery.

## Post-deploy checks

After the first production deploy, check:

- `/` loads without console errors.
- `/robots.txt` blocks `/admin` and points to the production sitemap.
- `/sitemap.xml` uses the production domain from `src/content/site.json`.
- `/admin` loads and requires `ADMIN_PASSWORD` to save.
- A CMS save creates a GitHub commit on `GITHUB_BRANCH`.
- The contact form sends an email through Resend.
- Vercel deployment logs contain no missing env variable errors.
