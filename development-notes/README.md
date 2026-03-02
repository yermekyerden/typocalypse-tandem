# RS Tandem: Development Diary

Development Diary is a **required** artifact of this project.

The goal is simple: make your personal progress visible (facts, decisions, blockers, next plan).
It also helps later with the final presentation (e.g. “3 hardest problems you solved”, “what you learned”, etc.).

---

## Rules (parser-friendly)

1) **Personal format**
- Each student writes their own diary.

2) **Location**
- All entries live here:
  - `/development-notes/<github-username>/`

3) **Folder structure (required)**

```txt
/development-notes
  /github-username-1
     github-username-1-2026-02-18.md
     github-username-1-2026-02-20.md
  /github-username-2
     github-username-2-2026-02-18.md
````

4. **File name format (required)**

* `<github-username>-YYYY-MM-DD.md`

5. **Frequency (required)**

* Minimum **2 entries per week**

6. **No backdating (required)**

* Each entry should be committed on the same day or the next day
* Don’t write 10 entries on Sunday and commit in one batch — commit history may be checked

7. **Hand-made (required)**

* Diary text must be written by you
* AI is allowed only for light grammar fixes

8. **Language**

* Russian or English

9. **Final merged file (before final submission)**

* Create: `development-notes/<github-username>/<github-username>-merged.md`
* Keep daily files (do not delete them)

---

## Commit message convention (diary branch)

Use Conventional Commits with your username as the scope:

* `docs(<github-username>): add diary entry YYYY-MM-DD`
* `docs(<github-username>): update diary entry YYYY-MM-DD`
* `docs(<github-username>): add week plan`
* `docs(<github-username>): add merged diary`

Examples:

* `docs(yermekyerden): add diary entry 2026-02-18`
* `docs(yermekyerden): add week 2 plan`
* `docs(yermekyerden): add merged diary`

Recommendation: keep diary commits small and frequent. One entry = one commit.

---

## Copy-paste template (use inside your daily file)

Create a file:
`development-notes/<github-username>/<github-username>-YYYY-MM-DD.md`

Template:

```md
# Date: YYYY-MM-DD

## What was done
- ✅
- ✅

## Problems / blockers
- Problem:
- What I tried:
- Current status:
- What I need next:

## Decisions (and why)
- Decision:
- Why:
- Trade-offs:

## What I learned
- Concept / tool / pattern:
- What I understand now:
- What is still unclear:

## Plan (next steps)
- [ ] Next step 1
- [ ] Next step 2

## Links (optional)
- PRs:
- Issues:
- Screenshots/GIFs:
```
