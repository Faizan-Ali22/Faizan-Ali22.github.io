# AGENTS — Guidance for AI coding agents

Purpose
- Short, actionable instructions to help an AI agent be immediately productive in this Hugo portfolio repository.

Quick commands
- Run local preview: `hugo server` (visit http://localhost:1313)
- Build production site: `hugo`

High-value locations
- `data/` — primary source of truth for content and site settings (profile.yml, config.yml, skills, tools, testimonials).
- `i18n/en.yaml` — UI strings and display names; any `key` used in `data/*` must have a matching entry here.
- `content/` — markdown content for pages, blog posts, projects, experiences, education.
- `layouts/` — Hugo templates and partials; changes here affect HTML structure.
- `static/` — public images, icons and files copied to the site root.
- `assets/`, `scss/`, `js/` — source styles and scripts (no enforced build pipeline in repo).

Conventions & rules agents should follow
- Data-driven edits: Only edit templates or HTML in `layouts/` if the requested structural change cannot be achieved by exclusively updating data entries in `data/` and `i18n/en.yaml`.
- Skill keys: keys in `data/programming_languages.yml`, `frameworks_engines.yml`, `specialties.yml`, `soft_skills.yml`, and `tools.yml` use prefixes (e.g. `pl_`, `fw_`, `spec_`, `skill_`, `tool_`) — always add the corresponding `i18n` entry.
- Front matter: content files use YAML front matter. When creating content, copy patterns from existing files in `content/`.
- Images: place assets under `static/images/` and reference them with absolute paths ( `/images/...` ).

What agents should check for in PRs
- Missing or mismatched `i18n` keys for any new `data` entry.
- Image paths referenced in `data/` or front matter actually exist under `static/images/`.
- Unintentional edits to `public/` — avoid committing generated `public/` files.

Where to look for context and examples
- Project README with examples and conventions: [README.md](README.md)
- Site config and settings: `data/config.yml` and `hugo.toml`

Contact
- If unsure, review the examples under `content/` and `data/` before making structural changes.
