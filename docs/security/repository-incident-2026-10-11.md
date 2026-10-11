# Repository data exposure response — 2026-10-11

## Scope

A repository review found SQL backups and one-off migration files containing
account rows and password hashes in public Git history. This document records
the response without reproducing any email address, hash, token, or database
row.

The affected paths are:

- `server/.env`
- `client/.env`
- `pysim_database_backup_2026-08-25.sql`
- `postgres_dump_latest.sql`
- `24.8.2569.sql`
- `fullprojectpython 27_6_69.sql`
- `fullprojectpython.sql`
- `python_coder_game (2).sql`
- `server/backup_python_coder_game_before.sql`
- `server/backup_python_coder_game_after.sql`
- `server/scripts/fullproject_mysql_dump.sql`
- `server/scripts/after_friend_db_import_keep_our_shop_theme.sql`
- `server/scripts/archive/fullproject_mysql_dump.sql`
- `server/scripts/archive/after_friend_db_import_keep_our_shop_theme.sql`
- `client/src/client.zip`
- historical `server/node_modules/` content
- a historical progress-log line that included the value assigned to
  `NVIDIA_CODE_JUDGE_API_KEY`

The current snapshot removes all tracked copies. Repository and Docker ignore
rules reject backup/dump filenames at any directory depth, and CI scans both
tracked files and complete reachable Git history without printing matched
secret values.

## Required account response

1. Treat every password hash in the affected history as exposed. Require a
   password reset for the affected legacy accounts before public deployment.
2. Check authentication and database audit logs for unexpected access from the
   first public commit containing the files through completion of this response.
3. Rotate a credential only when the private incident inventory confirms that
   it appeared in a removed blob. Do not copy credential values into this file,
   GitHub issues, CI logs, or chat.
4. Store the private inventory and user-contact status in a restricted system,
   identified by account ID rather than copying database rows.

The historical server environment file used variables for mail credentials, an
AI-provider key, MySQL credentials, and PostgreSQL credentials. Rotate the mail
password, AI-provider key, and every database password that was assigned a real
value. The historical client environment contained a Google client ID, which is
public configuration; verify its authorized origins but do not treat the ID as
a client secret.

## History rewrite procedure

The rewrite must be run from a fresh mirror clone after all collaborators have
committed or exported their work. Install `git-filter-repo` from its official
distribution. Create a replacement-expression file outside the repository with
this single sanitized rule:

```text
regex:NVIDIA_CODE_JUDGE_API_KEY=[^`\s]+==>NVIDIA_CODE_JUDGE_API_KEY=[REDACTED]
```

Then remove all affected paths and redact the historical progress-log value in
one rewrite:

```text
git filter-repo --invert-paths \
  --replace-text /restricted/path/replacements.txt \
  --path server/.env \
  --path client/.env \
  --path pysim_database_backup_2026-08-25.sql \
  --path postgres_dump_latest.sql \
  --path "24.8.2569.sql" \
  --path "fullprojectpython 27_6_69.sql" \
  --path fullprojectpython.sql \
  --path "python_coder_game (2).sql" \
  --path server/backup_python_coder_game_before.sql \
  --path server/backup_python_coder_game_after.sql \
  --path server/scripts/fullproject_mysql_dump.sql \
  --path server/scripts/after_friend_db_import_keep_our_shop_theme.sql \
  --path server/scripts/archive/fullproject_mysql_dump.sql \
  --path server/scripts/archive/after_friend_db_import_keep_our_shop_theme.sql \
  --path client/src/client.zip \
  --path server/node_modules
```

Before publishing rewritten refs:

1. Clone the rewritten mirror into a temporary checkout.
2. Run the repository safety unit test and full history scan.
3. Confirm every listed path and generated dependency directory is absent from
   `git log --all --name-only`.
4. Run the normal client and server test suites from the rewritten head.
5. Record the old and new head IDs in the restricted incident record.

Force-pushing rewritten branches and tags invalidates existing commit IDs. It
must be the final reviewed action after collaborators confirm they have exported
uncommitted work. Afterward, each collaborator must clone again or reset to the
new history and reapply only source changes. Merging an old branch reintroduces
the removed blobs.

The upstream repository and existing forks retain their own copies. Their
owners must perform the same rewrite or remove the affected repository. After
all reachable refs are clean, request cached-view cleanup from the hosting
provider if the removed objects remain directly accessible.

## Verification

The public repository is considered contained only when all of these are true:

- the safety scan passes against every branch and tag that remains public;
- the upstream repository and known forks have completed equivalent cleanup;
- affected users have completed the required password reset;
- no release image or downloadable artifact contains the removed files; and
- a clean clone passes application tests without recovering data from a dump.
