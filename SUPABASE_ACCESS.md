# Supabase access for this project

The production Supabase project for this repository is **BizRent**.

- Project ref: `ippbpimivjuabjijuwvv`
- Organisation id: `ypyblbwqecfkqfhcgrct`

## For local Codex / CLI work

Privileged credentials are kept in `.env.local`, which is intentionally gitignored.
A future local Codex session should load that file before running Supabase management commands, for example:

```bash
set -a
source .env.local
set +a
npx supabase projects list --output json
npx supabase migration list --linked
```

Do **not** commit real access tokens, database passwords, or service-role keys to the repository.
Use `.env.example` as the template when setting up a new machine.

## Security note

If a personal access token is pasted into chat, logs, or any shared place, rotate it in Supabase after the work is done.
