# I checked my own claims — the verification pass — 2026-07-18

**Author:** Jesper (JesperLive / MrSataana), developer of GRIP - Enhanced Macro Sequencer (GRIP-EMS)

I am a competitor of GSE. That is the first thing this repository says, and it is the reason every
finding here ends with steps for you to check it yourself. But "check it yourself" is a lot to ask, so
I also checked it myself — adversarially, against my own writing — and this file records what that pass
did and what it found, including the places it found me wrong.

The rule I set was simple: read every claim in the README and the update files, and for each one ask five
questions. Is the quoted code actually present in the build it is attributed to? Is the hash correct? Is
the date correct? Is it still true of the current build, and does the document say which build? Has it
been superseded, and if so does the document say so? A claim only survives if every applicable question
is answered against a real artifact.

## What the five questions found

**Is the quoted code present in the build it is attributed to?** This is the one that matters most,
because it is the one a hostile reader would attack: a quote lifted from the wrong build, or a line
number that points at nothing. I re-extracted the `app.asar` from the verified installer of every build
the repo quotes — 0.4.12, 0.4.14, 0.4.15, 0.4.16, 0.4.20, 0.4.21, 0.4.22, 0.4.23, 0.4.24 and 0.4.26 —
read the version from inside each archive so I was checking against the right build, and confirmed every
quoted snippet, identifier, marker, and cited line number against the freshly extracted code. **Ten
builds, zero code mismatches.** Where a build's line numbers are cited against a beautified copy, I
beautified the same way and the numbers landed dead-on.

**Is the hash correct?** Every SHA-256 the repo publishes was recomputed from the file on disk. All of
them match, every published byte size matches, and every published archive file-count matches. No claim
here cites a hash that is not reproducible.

**Is the date correct?** The correspondence dates were checked against the source emails and exports, and
one internal working date was corrected against the source. The repo does not claim build release dates —
it says so, repeatedly — so there is nothing there to check.

**Is it still true of the current build?** Every capability the repo attributes to the current Companion
was checked against the current build (0.4.26). The retained ones — the unsigned auto-updater, the
signed engine, the engine's unguarded read, the write guard, the mandatory GSE-scoped gather — all hold.
The detection that was removed stays removed. The one claim that went stale (a line calling the
arbitrary-file capture "still live") is corrected in place, and the correction is stated four times over
in the document.

**Has it been superseded, and does the document say so?** The builds move fast, so this question has real
teeth. The answers are the corrections below.

## Where the pass found me wrong

A verification pass that finds nothing is not a verification pass; it is a press release. This one found
thirteen problems in my own writing. Every one is now fixed, in place, dated, with the original wording
left standing where the repository's own rule requires it.

| # | What was wrong | Fixed by |
|---|---|---|
| 1 | The README says my withdrawal of point 1 was a mistake, then links to an update that still carried the withdrawn wording | Dated correction markers added to the update, mirroring the README |
| 2 | Several lines called v0.4.24 "the current build" after v0.4.26 had shipped; one of them asserted a capability the newer build removed | Each reworded to name the build it is true of |
| 3 | The README said the updates "track every build since" while three builds I hold were untracked | Diffed and published the gap; reworded the claim |
| 4 | An audit called the installer's trailing bytes an "appended Authenticode signature" — the installer is not signed at all | Corrected to name the real cause; added that every build back to 0.4.12 is unsigned, which strengthens the updater finding |
| 5 | The file index omitted the very update that reverses the headline | Added it |
| 6 | The README sets a rule not to cite GSE's "100% free" description as evidence, then cited it as accurate twice | Removed the citations; the public source repo carries the point without it |
| 7 | Two sentences slipped into a voice that was not first person, in a repo bylined with my name | Restored to first person |
| 8 | An open question about where the updater gets its releases | Resolved: the GitHub config is vestigial; the real updater is api.qik.dev |
| 9 | I started to claim a build was "documented nowhere" — it was documented in full | Caught as false and withdrawn before it was published |
| 10 | An evidence excerpt omitted part of the code it claimed to carry | The missing region was appended to the excerpt |
| 11 | Four line numbers in one audit had drifted from the code | Corrected against the current extraction |
| 12 | Two line citations pointed one line off inside the right function | Corrected |
| 13 | A file-count sentence crossed the free build's number with the patron build's | Reworded to the accurate counts |

Numbers 9 through 13 are the kind of small error that a verification pass exists to catch — an off-by-one
line number, a crossed count, an excerpt that stops a few lines short. None of them changed a finding.
Numbers 1 through 8 are the ones I would least like a reader to find first, which is exactly why I went
looking for them.

## What this does and does not establish

It establishes that the quotes are real, the hashes reproduce, and the claims are attributed to the right
builds — the checkable parts are checkable. It does not establish that I am right about what any of it
means, and it does not make me not a competitor. Those are still yours to judge, from the files, which is
the only reason this repository is worth anything.
