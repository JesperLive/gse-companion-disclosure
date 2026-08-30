# Update 2026-08-30: a third-party video about this record was removed, and the correction that has to come with it

This one is about someone else. A video that covered the findings in this repository has
been removed from YouTube following a copyright removal request naming the claimant in the
dispute I am party to. That is convenient for me to report, which is exactly why the
correction comes first and the removal comes second.

I am not a party to that removal. I was not consulted about the video before it was
published, I have never spoken to its author, and nothing below is his account of anything.
Everything here is either quoted from an archived page, read out of a public repository, or
stated as an inference in the sentence that makes it.

---

## 1. The correction, first

The video is "A Huge WoW Addon Put Malware On Players' PCs", Bellular Warcraft, uploaded
2026-07-29T14:20:11-07:00, 1349 seconds. On 2026-08-29T21:50:14Z its author posted publicly
about the removal and restated the characterisation: "Gnome Sequencer people copyright
struck us for reporting on them literally smuggling malware onto peoples computers."

**This repository does not support that characterisation, and did not support it on the day
the video was published.** Three things were already true on 2026-07-29:

- The server-triggered routine that read arbitrary files under `Interface\AddOns` and `WTF`
  was **already gone**. It was removed in v0.4.26, recorded in
  [UPDATE-2026-07-17-v0.4.26.md](UPDATE-2026-07-17-v0.4.26.md), twelve days before the video
  went up. The write path had been restricted earlier, in v0.4.24, recorded in
  [UPDATE-2026-07-17-v0.4.24.md](UPDATE-2026-07-17-v0.4.24.md).
- **Finding 2 was already substantially retracted**, on 2026-07-17, and the retraction is at
  the top of the README, not buried.
- Nothing removed has returned. Every competitor-facing marker reads zero in 0.4.27 and
  0.5.3, measured in
  [UPDATE-2026-08-26-platform-actions-and-current-builds.md](UPDATE-2026-08-26-platform-actions-and-current-builds.md).

Since then, on 2026-08-27, CurseForge re-examined the copyright claim against GRIP-EMS and
closed it on the merits, recorded in
[UPDATE-2026-08-27-curseforge-closes-the-claim.md](UPDATE-2026-08-27-curseforge-closes-the-claim.md),
with the standing caveat that a platform closing a claim under its own policy is not a legal
ruling.

I record this because the correction does not become less true when the person who needs to
hear it has just been on the receiving end of a copyright claim. If a follow-up repeats the
original framing, it will be repeating something this repository had already withdrawn or
superseded before the original went up.

## 2. The removal, and what the notice actually says

The page was archived on 2026-08-30 at 15:45:23 UTC:

`https://web.archive.org/web/20260830154523/https://www.youtube.com/watch?v=u37h_2yliyY`

In that capture `playabilityStatus.status` reads `ERROR`, and the notice is carried as two
separate fields, quoted here exactly as they appear:

| Field | Value |
|---|---|
| `title.content` | `Video unavailable` |
| `description.content` | `It was removed following a copyright removal request by Larry Thiessen (ScaryLarryGames / GSE United)` |

The description carries no trailing full stop. Anyone quoting it as one sentence ending in a
period is paraphrasing.

**Reproduction.** The notice lives inside `ytInitialData`, under
`playabilityStatus.errorScreen.playerInterstitialRenderer.content.interstitialViewModel`. It
is not in the rendered text, so a text extraction of that page returns nothing and a check
that only asserts the page exists proves nothing about what it says. Fetch the capture with
the Wayback `id_` modifier and search the response body for `Thiessen`.

## 3. The window, bounded by four dated observations

| Observation | When | Source |
|---|---|---|
| Page live, 79,299 views | 2026-08-04T21:28:32Z | Wayback capture `20260804212832` |
| Page live, 85,937 views | 2026-08-23T13:53:39Z | Wayback capture `20260823135339` |
| Author posts about the removal | 2026-08-29T21:50:14Z | the post itself |
| Page archived in the removed state | 2026-08-30T15:45:23Z | Wayback capture `20260830154523` |

So the removal falls after 2026-08-23T13:53:39Z and at or before 2026-08-29T21:50:14Z. That
is a six-day window and it is as tight as the evidence goes.

## 4. The claimant's own folder reference, and what it does not show

A file in the claimant's public repository cites a path on his own machine:
`C:\Git\Image-Vault\dmca-u37h_2yliyY\TIMESTAMPS.md`. That is the video's ID, in a folder
named for a DMCA. It was introduced in commit `f64d2fa`, authored 2026-08-26 19:53:25 -0500,
which is **2026-08-27T00:53:25Z**.

**What this does not show.** That timestamp sits *inside* the six-day window in section 3.
It therefore cannot be shown to predate the removal, and I am not asserting that it does. An
earlier working note of mine measured this against the day I discovered the removal rather
than the day the removal happened, which produced a stronger claim than the evidence carries.
That claim is withdrawn here, not quietly dropped.

Both commits are archived as plain-text patches, which capture the diff and the git
authorship header; the rendered GitHub pages do not, because the diff is loaded lazily:

- `https://web.archive.org/web/20260830162553/` over the addon-violations commit `.patch`
- `https://web.archive.org/web/20260830162816/` over the conversion-violations commit `.patch`

## 5. Two other videos, now archived

This repository cites `https://youtu.be/2Lwqu93TiFY` as video discussion. A sibling video on
the same subject has now been removed, so that citation was one claim away from being a dead
link with nothing behind it. It is archived:

- TheKephas, `2Lwqu93TiFY`, archived `20260830154639`. Verified as content and not an empty
  shell: 1,553 KB, `playabilityStatus.status` reads `OK`, title and view count present.
- Samiccus, `IDhhnAYk_Dw`, archived `20260830154647`, its first capture. Not cited here; it
  is recorded because it excerpts the removed video and its description still carries the
  now-dead original URL.

Archiving a source is not an endorsement of it. Both of these state positions I disagree
with in places, which is the ordinary reason to preserve a source, not a reason to skip it.

## 6. What I could not verify

- **The notice itself.** I have only the public string on the watch page. I have not seen the
  removal request, I was not a party to it, and I do not know what it claims.
- **Whether a counter-notification has been filed**, or what YouTube's response was.
- **Whether the `dmca-` folder predates the removal.** See section 4. It cannot be settled
  from the timestamps available.
- **What the claim concerns.** The claimant's files cross-reference a 17-screenshot gallery
  to a moment in the video at 9:06. That the claim is about those images is my inference and
  nothing more.
- **The replies to the author's post.** Twelve at the time of writing. I have not read them.
- **Whether the video will return.** It was still unavailable when this was written.

## 7. Nothing in this changes the findings above

The Companion findings stand where
[UPDATE-2026-08-26-platform-actions-and-current-builds.md](UPDATE-2026-08-26-platform-actions-and-current-builds.md)
left them, measured through 0.5.3. Nothing in this update is evidence about the shipped
application, and none of it should be read as such. It is here because a video about this
record was removed, and because the record should say plainly what it does and does not
support before anyone else characterises it.
