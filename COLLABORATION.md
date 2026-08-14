# 🤝 CivicEye / Amrita Eye — Git Collaboration Guide

How to work together on the same repo without breaking anything.
**The #1 rule: NEVER use `git push -f` (force push).** It overwrites the
remote and erases other people's work.

---

## 1. The mental model

Git keeps a **history of snapshots** (commits). Everyone has their own copy
(local), and the remote (GitHub) is the shared source of truth.

```
Your computer          GitHub (origin/main)        Teammate's computer
   local main  ──────►  remote main   ◄──────────   local main
```

- `pull`  = download changes from GitHub into your copy
- `push`  = upload your commits to GitHub
- `commit` = save a snapshot locally
- `branch` = a separate line of work you can switch between

---

## 2. The safe daily loop (do this every time you work)

```powershell
# 1. Start: get the latest
git pull origin main

# 2. Make your changes, then save them
git add .
git commit -m "describe what you changed"

# 3. Before pushing, pull again (in case someone pushed meanwhile)
git pull --rebase origin main

# 4. Push
git push origin main
```

> If step 3 says "conflict", STOP and resolve (section 4) — don't force-push.

---

## 3. What each command does

| Command | What it does | When |
|---|---|---|
| `git status` | Shows changed files & branch | Always, to check state |
| `git diff` | Shows your uncommitted changes | Before committing |
| `git add .` | Stage all changes | Before commit |
| `git commit -m "msg"` | Save a local snapshot | After staging |
| `git pull origin main` | Download + merge remote changes | Start of session |
| `git pull --rebase origin main` | Download + reapply your commits on top | Before push (cleaner) |
| `git push origin main` | Upload your commits | End of session |
| `git fetch` | Download changes WITHOUT merging | To inspect before pulling |
| `git log --oneline` | See recent commits | Orientation |

---

## 4. Branches — the safe way to work in parallel

A branch is a separate line of work. It lets two people edit the same files
without stepping on each other, and you merge when ready.

```powershell
# Create + switch to a new branch (e.g. amrita-ui)
git checkout -b amrita-ui

# ... work, commit as usual ...
git add .
git commit -m "amrita theme changes"

# Push the branch to GitHub (first time)
git push -u origin amrita-ui

# Later pushes on the branch
git push
```

**Switch back to main anytime** (commits on the branch are preserved):
```powershell
git checkout main
```

**See all branches:** `git branch -a`

### Merge a branch back into main
```powershell
git checkout main
git pull origin main
git merge amrita-ui
git push origin main
```

### The safest option: Pull Request (PR)
Push the branch, then on GitHub → **Pull requests → New** → merge with review.
Nothing touches `main` until you approve. Great for teammates who aren't sure.

---

## 5. Merge conflicts — what they are, how to fix

A conflict happens when **two people changed the same lines** of the same
file. Git can't decide — it marks the file:

```
<<<<<<< HEAD
your version
=======
their version
>>>>>>> amrita-ui
```

**Fix:**
1. Open the file, keep the parts you want, delete the `<<<<<<<`, `=======`,
   `>>>>>>>` markers and the unwanted version.
2. `git add <file>`
3. `git commit -m "merge: resolve conflict in X"`

Then push. Conflicts are **normal** — they don't break anything; they just
need a human decision.

---

## 6. Who owns what (avoid most conflicts)

CivicEye and Amrita Eye are **one codebase** (a theme toggle), so two people
editing the same UI files WILL conflict. Minimize it:

| Person | Owns these files |
|---|---|
| CivicEye UI dev | Landing, Features, About, Contact, Navbar, Footer |
| Amrita UI dev | Theme (styles/index.css amrita block, BrandContext), ReportPage, admin theme bits |
| Live AI dev | LiveDetection, detectionService, worker/* |

Rule of thumb: **if you didn't change a file, don't commit it.** Only
`git add` the files you actually edited:
```powershell
git add src/pages/Landing.tsx src/components/Navbar.tsx
```
(Avoid `git add .` if unsure — it can sweep up others' work-in-progress.)

---

## 7. NEVER do these

- ❌ `git push -f` / `git push --force` — erases others' commits
- ❌ Committing `.env` or API keys — GitHub blocks it, and it leaks secrets
- ❌ Committing `node_modules` / `dist` (they're gitignored anyway)
- ❌ Pulling with uncommitted local changes that overlap (commit or stash first)

If you already force-pushed by accident, `git reflog` + reset can recover —
tell the person it's urgent.

---

## 8. Quick troubleshooting

| Error | Meaning | Fix |
|---|---|---|
| "failed to push some refs" | Remote has commits you don't | `git pull --rebase origin main` then push |
| "conflict (content)" | Same lines changed twice | Resolve markers (section 5) |
| "not a git repository" | Wrong folder | `cd` into the project |
| "remote origin already exists" | Already linked | Skip `git remote add` |
| "push declined / secret" | A key is in a commit | Remove the key, amend/filter history |

---

## 9. Your workflow as the owner (recommended)

1. Keep `main` stable (it's the deployed version).
2. Have each teammate work on a branch (`civiceye-ui`, `amrita-ui`,
   `live-ai`).
3. They push their branch, you review/merge (PR or `git merge`), you push.
4. You deploy from `main` (Vercel auto-deploys).

This way nobody can break the live site — merges only happen with your
approval.
