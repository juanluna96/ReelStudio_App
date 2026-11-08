# CI/CD, releases y actualizaciones

## Gitflow

```
feature/* ──PR──▶ develop ──PR──▶ main
                     │              │
                beta vX.Y.Z-beta.N  estable vX.Y.Z
```

- Todo cambio entra por PR: `feature/*` (o `fix/*`) → `develop`, y luego `develop` → `main` con título
  `release: vX.Y.Z (develop → main)`. Nunca push directo a `develop` ni a `main`.
- Crear ramas sin tracking, para que un `git push` no caiga en develop:
  ```
  git fetch origin && git switch --no-track -c feature/<nombre> origin/develop
  git push -u origin feature/<nombre>
  ```
- El PR `develop` → `main` **debe subir la versión** (el CI lo exige):
  ```
  cd studio && npm version patch --no-git-tag-version   # o minor / major
  ```

## Workflows (`.github/workflows/`)

| Workflow | Cuándo | Qué hace |
| --- | --- | --- |
| `ci.yml` | PR a `develop` o `main` | `studio`: `npm ci`, typecheck y tests. `tools`: compila el Python. En PRs a `main`, comprueba que la versión no esté publicada. |
| `release.yml` | merge (push) a `main` o `develop` | Construye la app en macOS arm64 (`npm run dist`) y publica el `.dmg` y el `.zip` en GitHub Releases. `main` → `vX.Y.Z` estable; `develop` → `vX.Y.Z-beta.N` pre-release (siguiente parche si `X.Y.Z` ya salió). |
| `sync-upstream.yml` | lunes 08:00 (Colombia) o a mano | Trae `main` del repo original (CrissAlvarezH/ai-reel-gen-app) y abre o actualiza el PR `sync/upstream` → `develop`. Si hay conflictos, el PR lo indica con los comandos para resolverlos en local. |

## Actualizaciones automáticas de la app

`studio/desktop/updater.ts` (solo en la app instalada en macOS):

- Al abrirse (a los 15 s) y cada 6 horas consulta las releases de este repo y elige la versión más nueva
  del canal (`studio/desktop/release.ts`).
- Si hay una, descarga el `.zip`, lo descomprime, verifica la firma y pregunta: **Reiniciar ahora** o
  **Al cerrar la app**. Al salir, un script reemplaza la `.app` y, si se eligió, la vuelve a abrir.
- Menú **Reel Studio → Buscar actualizaciones…** y **Canal de actualizaciones** (Estable / Beta). El canal
  se guarda en `~/Library/Application Support/Reel Studio/updates.json`.
- No usa electron-updater porque Squirrel.Mac exige firma con Apple Developer ID; la app se firma ad-hoc.
- Para actualizarse, la app tiene que estar en una carpeta con permiso de escritura (Aplicaciones) y no abierta
  desde el DMG.

Las actualizaciones cambian la app, no la carpeta de trabajo: plantillas, tools, estilos y skills que ya
existen en el workspace no se reemplazan (ver `server/workspace.ts`).

## Configuración del repo en GitHub (una vez)

```
R=juanluna96/ReelStudio_App
# Actions viene desactivado en los forks
gh api -X PUT repos/$R/actions/permissions -F enabled=true -f allowed_actions=all
# GITHUB_TOKEN con escritura y permiso para abrir PRs (sync-upstream)
gh api -X PUT repos/$R/actions/permissions/workflow -f default_workflow_permissions=write -F can_approve_pull_request_reviews=true
# develop como rama por defecto, borrar ramas al mergear
gh api -X PATCH repos/$R -f default_branch=develop -F delete_branch_on_merge=true
# Proteger develop y main: PR obligatorio + CI en verde
for b in develop main; do
  gh api -X PUT repos/$R/branches/$b/protection --input - <<EOF
{"required_status_checks":{"strict":false,"contexts":["studio (typecheck + tests)","tools (python)"]},
 "enforce_admins":false,"required_pull_request_reviews":{"required_approving_review_count":0},
 "restrictions":null,"allow_force_pushes":false,"allow_deletions":false}
EOF
done
```
