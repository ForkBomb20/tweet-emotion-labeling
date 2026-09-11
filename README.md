# Tweet Emotion Labeling

A web interface for labeling tweets with one of six emotions: anger, fear, joy, love, sadness, or surprise. Built for CSE 594 at the University of Michigan.

Each participant labels 5 randomly selected tweets from a pool of 54 (drawn from the [Emotion dataset](https://huggingface.co/datasets/dair-ai/emotion)). Responses are stored locally in the browser and optionally sent to a Google Sheet.

**Live version:** https://forkbomb20.github.io/tweet-emotion-labeling/

## Running locally

This is a static site — no build step, no dependencies. You just need a local HTTP server because `fetch` won't work with `file://` URLs.

```sh
# Python (any version)
python3 -m http.server 8000

# or Node
npx serve .
```

Then open http://localhost:8000.

## Files

- `index.html` — main labeling interface (instructions, labeling flow, review, submission)
- `app.js` — application logic (random tweet selection, navigation, data recording)
- `style.css` — styles
- `tweets.json` — the 54 tweets with ground truth labels
- `results.html` — local data viewer with CSV export
- `google-apps-script.js` — Apps Script code for optional Google Sheets backend

## Google Sheets backend (optional)

If you want responses from multiple participants collected in one place:

1. Create a Google Sheet with headers: `uid`, `timestamp`, `tweet_id`, `tweet_text`, `selected_label`
2. Open Extensions > Apps Script and paste the contents of `google-apps-script.js`
3. Deploy as a web app (Execute as: Me, Access: Anyone)
4. Set the `SCRIPT_URL` variable in `app.js` to your deployment URL

Without this, everything still works — data is saved to `localStorage` and viewable at `results.html`.

## Swapping in your own tweets

Replace `tweets.json` with any JSON array of objects containing `id` (int), `text` (string), and `ground_truth` (string). The emotion buttons are hardcoded to the six categories above, so you'd need to edit `index.html` and `app.js` if you want different labels.
