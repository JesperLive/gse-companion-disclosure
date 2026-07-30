# The operator statement, and what 0.4.26 still does (2026-07-30)

On 2026-07-29 the GSE author gave a statement, over Discord, answering the two questions
this repository had left open for the server side: whether the access policy `enforce`
flag was ever set true, and what the diagnostic upload actually pulled. It is published in
both of the SLG repositories, in one of them alongside an audit that revises its own
findings on the strength of it.

I am glad it exists. I asked for exactly this in
[UPDATE-2026-07-18-server-control-surface.md](UPDATE-2026-07-18-server-control-surface.md),
and their own file makes the right point about what it is: "This is a statement, not an
artifact ... it is testimony, and should be presented as such rather than as reproducible
evidence."

Three items, on the parts where the published documents and the shipped bytes do not line
up. None of this goes to whether the statement is truthful, which I have no way to test
and am not questioning.

1. [The remediation row changed from a measurement to testimony between two published copies](#1-the-remediation-row-changed-from-a-measurement-to-testimony-between-two-published-copies)
2. [Shipped 0.4.26 still runs the gather on a server sent request](#2-shipped-0426-still-runs-the-gather-on-a-server-sent-request)
3. [The endpoint served a field named enforce on all three dates I captured it](#3-the-endpoint-served-a-field-named-enforce-on-all-three-dates-i-captured-it)

## 1. The remediation row changed from a measurement to testimony between two published copies

`evidence/companion-app/COMPANION-APP-FIX.md` is shipped in both repositories. Both copies
are 62 lines. One line differs, row 2 of the remediation table.

In the Conversion repository:

```
| 2. Make it opt-in | **Partly.** A `requestFiles` flag now raises a user-visible desktop
notification; the `kinds` gather still runs on a server request. |
```

In the Addon-vs repository:

```
| 2. Make it opt-in | **Per the author, done:** all diagnostic uploads are now tied to a
user-initiated request (2026-07-29). Client-side in 0.4.26 a `requestFiles` flag raises a
user-visible notification, but the handler will still service a server-sent `kinds`
request ... State it as the operator's assurance, not as something the shipped client
enforces. |
```

```bash
diff repoA/evidence/companion-app/COMPANION-APP-FIX.md \
     repoB/evidence/companion-app/COMPANION-APP-FIX.md
```

Both copies carry the same box header, "Status in 0.4.26: scoped down, not removed --
verified 2026-07-29", and the same anchor sentence saying the three statuses "were read
from those shipped bytes". Neither copy claims a re-examination. The status word a reader
scans changed from "Partly" to "done" while the measurement underneath it stayed the same
and stayed true.

The newer copy keeps the measured finding, in a subordinate clause, and tells the reader
to state the row as the operator's assurance rather than as something the client enforces.
That instruction is the correct one. It is also not what the bolded verdict at the head of
the row now says, and a reader scanning a status table reads the verdict.

Two things sit around this. The same repository's own sync note, in
`OPERATOR-STATEMENT-2026-07-29.md`, says the shared files "have not been edited here, to
avoid diverging a shared file mid-edit" and that whoever revises them should "keep both
copies identical". In the published state they are not. And in the newer copy the summary
sentence further down still reads "two of the three recommendations below are now largely
or partly met", the wording the row above it just replaced.

## 2. Shipped 0.4.26 still runs the gather on a server sent request

`OPERATOR-STATEMENT-2026-07-29.md` in the Conversion repository puts the statement into a
table of what it resolves. One row asks "Can the server still trigger an upload on its
own?" and answers "No -- all diagnostic uploads are now tied to a user-initiated request."

That is a claim about the client, and the client is checkable. In the 0.4.26 main process,
the SSE handler for `companion:request` reads the `kinds` array and calls the gather on it
when the array is non-empty:

```js
} else if (t?.type === "companion:request")
    if (t.task) ...
    else if (Array.isArray(t.idx)) ...
    else {
        const n = Array.isArray(t.kinds) ? t.kinds : [];
        if (console.log(`[sse] companion:request requestId=... kinds=${n.join(",")} ...`),
            n.length && Ho(t.requestId, n).catch(...), t.requestFiles) {
```

`requestFiles` is the condition on the branch below it, the one that fires the desktop
notification and tells the renderer to ask the user to attach files. It does not gate
`Ho`. A `companion:request` carrying a non-empty `kinds` array and no `requestFiles` runs
the gather, with no notification and no user action.

Reproduce it from the 0.4.26 installer whose hashes are recorded in
[UPDATE-2026-07-17-v0.4.26.md](UPDATE-2026-07-17-v0.4.26.md): extract `app.asar`, take
`out/main/index.js`, beautify it, and read the `companion:request` handler.

```bash
npx asar extract app.asar ./ex
npx js-beautify ./ex/out/main/index.js > main.js
grep -n 'companion:request' main.js
```

The other repository's own copy of `COMPANION-FORENSIC-FINDINGS.md` reaches the same
result and states it plainly: the SSE handler "still calls the gather when the message
carries a non-empty `kinds` array, i.e. the client will still respond to a server-sent
request", followed by "Do not claim the client rejects unsolicited requests, because in
0.4.26 it does not. Anyone can check that themselves, so claiming otherwise would be found
out."

So the two repositories publish opposite answers to the same question, and the shipped
bytes agree with the one that says the client still responds. The flat "No" is the version
a reader of the Conversion repository gets.

The distinction the author's own words support is between capability and use. "All the
diag uploads have been tied to a user initiated request" can be true of what the server
sends while the client remains willing to service what it is sent. That reading is
consistent with everything here. It is also the reading the audit file itself recommends,
and it is not the one the resolution table prints.

## 3. The endpoint served a field named enforce on all three dates I captured it

The statement includes "There was no server enforce to be able to set to 'true'", and the
resolution table renders that as "No -- and it could not be."

The three captures in this repository's `evidence/` directory each show
`GET /settings/access-policy` returning a body containing a field named `enforce`:

| Capture | Body |
|---|---|
| `live_access_policy_2026-06-20.json` | `{ "enforce": false, "updatedAt": null }` |
| `live_access_policy_2026-06-21.json` | `{ "enforce": false, "updatedAt": null, "integrity": "verified" }`, authenticated and anonymous |
| `live_access_policy_2026-07-09.json` | `{ "enforce": false, "updatedAt": null, "integrity": "verified" }`, both responses |

```bash
grep -h '"enforce"' evidence/live_access_policy_*.json
```

A server that serves a field named `enforce` has a server side value for it. Whether any
control existed to set that value true is a different question, it is the one the
statement is answering, and it is not one I can check from outside. I am not claiming the
flag was ever true. My own captures say false every time and I have published that since
June, including in the sentence of mine the SLG package quotes.

The narrow point is that "there was no server enforce" and a JSON body with `enforce` in
it are describing the same endpoint, and the second is in the evidence directory of the
repositories publishing the first.

## What I am not claiming

I am not saying the statement is untrue. I have no server side visibility, I said so in
the July 18 update, and the author is the only person who can speak to what was requested
and what was retained. Nothing above tests his account of that.

I am also not reviving anything this repository has already retired.
[UPDATE-2026-07-17-v0.4.26.md](UPDATE-2026-07-17-v0.4.26.md) records that 0.4.26 removed
the arbitrary file capture that Finding 1 described, and that stands. The remaining item on
my side is the unsigned auto-updater, which is unchanged by any of this.

What the three items go to is narrower: two published copies of one audit reached
different conclusions from the same bytes under the same verification date, and the
resolution table in one repository states two things about the shipped client that the
shipped client does not do. The underlying measurements in their own files are right. The
summaries laid over them are the part that drifted.

## Verification

- Both SLG repositories, cloned 2026-07-30. `COMPANION-APP-FIX.md` compared byte for byte
  across the pair.
- GSE Companion 0.4.26, `out/main/index.js` from the installer whose sha256 values are
  recorded in `UPDATE-2026-07-17-v0.4.26.md`, beautified and read at the
  `companion:request` handler.
- `evidence/live_access_policy_2026-06-20.json`, `-06-21.json` and `-07-09.json` in this
  repository, unchanged since publication.
