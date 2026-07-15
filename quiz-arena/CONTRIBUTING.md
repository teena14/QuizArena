# Contributing to QuizArena

Thanks for taking the time to contribute! Please read this guide before opening an issue or pull request.

---

## Table of Contents

1. [Local Setup](#1-local-setup)
2. [Branch Naming](#2-branch-naming)
3. [Commit Style](#3-commit-style)
4. [Opening a Pull Request](#4-opening-a-pull-request)
5. [Code Quality Checks](#5-code-quality-checks)
6. [Reporting Bugs & Requesting Features](#6-reporting-bugs--requesting-features)

---

## 1. Local Setup

Follow the **Quick Start** in the [README](./README.md). The short version:

```bash
git clone https://github.com/your-username/quiz-arena.git
cd quiz-arena
cp .env.example .env.local   # fill in your Supabase + NextAuth values
npm install
npx prisma generate
npx prisma db push
npm run dev
```

> **Node 18+ required.** You also need a free [Supabase](https://supabase.com) project for the database.

---

## 2. Branch Naming

Use a short, descriptive name that starts with the change type:

| Type | Pattern | Example |
|------|---------|---------|
| New feature | `feat/<short-name>` | `feat/class-code-join` |
| Bug fix | `fix/<short-name>` | `fix/timer-auto-submit` |
| Documentation | `docs/<short-name>` | `docs/api-reference` |
| Refactor | `refactor/<short-name>` | `refactor/quiz-submission` |
| Chore / tooling | `chore/<short-name>` | `chore/upgrade-prisma` |

---

## 3. Commit Style

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short imperative summary>

[optional body — explain the *why*, not the what]
[optional footer — Breaking: ..., Closes #123]
```

**Good examples:**
```
feat(quiz): add server-side auto-submit on timer expiry
fix(auth): redirect teacher to /teacher after login
docs(readme): add architecture diagram link
refactor(prisma): extract db client to lib/prisma.ts
chore(ci): cache node_modules in GitHub Actions
```

**Bad examples** (please avoid):
```
fix
fix2
asdf
final final FINAL
```

---

## 4. Opening a Pull Request

1. Fork the repo and create your branch from `main`.
2. Make your changes. Keep each PR focused on **one thing**.
3. Run all checks locally (see §5) before pushing.
4. Open the PR against `main` and fill in the PR template.
5. Link any related issue with `Closes #<issue-number>`.

A maintainer will review within a few days. Be prepared for feedback — it's normal and expected.

---

## 5. Code Quality Checks

Run these before every push:

```bash
# Type-check (zero TypeScript errors)
npm run typecheck

# Lint (ESLint + Next.js rules)
npm run lint

# Build (ensure production build succeeds)
npm run build
```

CI will run all three automatically on every push and PR — a failing check will block the merge.

---

## 6. Reporting Bugs & Requesting Features

- **Bug?** Open an issue using the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) template.
- **Feature idea?** Open an issue using the [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) template.

Please search existing issues before opening a new one.
