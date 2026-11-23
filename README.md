# Stillspace

A five-page meditation and mindfulness website for Web Technology Lab (34261107). Built with semantic HTML, external CSS, vanilla JavaScript and XML.

## Run locally

In the folder containing index.html, start VS Code Live Server or run:

```sh
python -m http.server 8000
```

Open http://localhost:8000. The pages use JavaScript modules and load sessions.xml over HTTP. All photos, icons and application files are included locally.

The website files are at the repository root. The live version is available at [Stillspace](https://stillspace-by-aj.atomiccoral1.chatgpt.site).

## Pages

| File | Purpose |
| --- | --- |
| index.html | Start a three-minute pause and view the current week. |
| techniques.html | Explore four techniques and open related sessions. |
| sessions.html | Filter seven guided meditations by technique and duration. |
| practice.html | Follow timed prompts. Pause, resume, hide the timer or save a completion. |
| tracker.html | Log practices, browse weekly history and review totals. |

## Data

sessions.xml supplies the session names, descriptions, durations, associated techniques and timed cues. Each cue's at attribute is measured in seconds from the start of practice.

Practice history is saved in browser localStorage, under one key per entry. The active timer stores its deadline in sessionStorage so a reload in the same tab can restore it. The site starts with an empty history. Each browser and origin keeps a separate journal.

## Demonstrate in class

1. On Techniques, open Mindful listening and choose Try a guided session. The session list is already filtered.
2. Return to Home and use Begin 3-minute session. Pause, hide the countdown and resume.
3. After the timer ends, select Save to tracker, then View tracker.
4. Log an offline practice on a different date and check the day markers and total minutes.
5. Open Deep Stillness to demonstrate the longer 20-minute practice. Its cues cover settling in, a body scan, quiet breath awareness and a gradual return.
