# Correspondence timeline

**Published:** 2026-07-18
**Author:** Jesper (JesperLive / MrSataana), developer of GRIP - Enhanced Macro Sequencer (GRIP-EMS)

## What this is, and how to read it

This is the dated chronology behind [MODERATION-RECORD.md](MODERATION-RECORD.md). That file tells the
correspondence as prose; this one lays it out in order, with the time of each event and the document
that records it. It adds no new claim. It adds the sequence.

The same caveat applies, in full. This is correspondence, not shipped code. Most of it you cannot
check: the emails are in my mailbox, the DMs are in a Discord export I hold, the CurseForge ticket is
visible only to my account. **It is my account of what I was told, and you are taking my word for it.**
Nothing in the [README](README.md) depends on any of it, and the technical findings there do not rest
on a single line below.

Two things about the columns. "Confidence" means whether I have checked the row against a document I
hold — not whether you can. A row marked VERIFIED is one I can show from an artifact in my possession;
a row marked INFERRED is a reading of cause or motive that the artifacts do not state, and I mark it so
you do not read it as established. Individual support staff are named by role only. My own account
identifiers are removed. Where a row concerns the shipped software, it points to the technical write-up
that verifies it from the public download, which is the part you can check.

---

## Timeline

| Date / time (UTC) | Event | Recorded in | Confidence |
|---|---|---|---|
| 2026-05-09 -> 06-13 | I acquire GSE patron builds on an ongoing basis (3.3.15 onward), predating any dispute | My download folder; see the binary-acquisition write-up | VERIFIED |
| 2026-06-08 | My GRIP-EMS thread on wowlazymacros.com is closed and hidden | 2026-06-09 support email ("*yesterday* my thread was closed") | VERIFIED (my account of it; forum-side record not held) |
| 2026-06-09 | My wowlazymacros account is banned; on-site chat closed | Same email ("*this morning* my account has been banned") | INFERRED (my account of it) |
| 2026-06-09 14:41 | I email wowlazymacros support asking for a reason | `Gmail - Reason for closing and hiding EMS thread, and banning my account.pdf` | VERIFIED |
| 2026-06-11 01:03 | I acquire Companion 0.4.12 and addon 3.3.20-9 (free + patron) within six seconds | Download folder; binary-acquisition write-up | VERIFIED |
| 2026-06-11 19:38 | First Discord DM to TimothyLuke, calling the Companion "malware" | DM export | VERIFIED (the wrong word; owned in MODERATION-RECORD) |
| 2026-06-11 19:30 | Overwolf automated acknowledgement of the moderation report | Overwolf ticket 375489 export | VERIFIED |
| 2026-06-11 20:25 | CurseForge / Overwolf moderation report filed (two findings: Companion detection/deletion; paid build) | Overwolf ticket 375489 export | VERIFIED |
| 2026-06-12 | Disclosure repository published | Public git history, commit `743226f` | VERIFIED (public) |
| 2026-06-12 03:38 -> 03:44 | Second and third DMs; no reply | DM export | VERIFIED |
| 2026-06-15 18:32 | I chase Overwolf ("the add-on is making the companion app near mandatory") | Overwolf ticket 375489 export | VERIFIED |
| 2026-06-16 09:45 | Overwolf's first substantive reply: Companion "falls outside our enforcement scope"; remaining claims forwarded to moderation and community teams | Overwolf ticket 375489 export | VERIFIED |
| 2026-06-16 12:41 | I send a cease and desist to TimothyLuke by Discord DM, as a PDF | DM export; `Cease_and_Desist_GSE_2026-06-16.pdf` | VERIFIED (outbound; see below) |
| 2026-06-20 08:52 | I report GSE's use of the Qik platform to Qik support | `Gmail - A customer (GSE / gse.tools) is using the Qik platform.pdf` | VERIFIED |
| 2026-06-20 09:03 | I send a subject access request to admin@gse.tools | `Gmail - Subject Access Request.pdf` | VERIFIED |
| 2026-06-20 09:04 | The access request bounces: `554 5.7.1 <admin@gse.tools>: Relay access denied` | Same PDF (mailer-daemon) | VERIFIED |
| 2026-06-20 09:08 | Retried to admin@ and support@gse.tools; both bounce | Same PDF | VERIFIED |
| 2026-06-20 09:13 | I paste the access-request text into a Discord DM instead | DM export | VERIFIED |
| 2026-06-20 10:30 | My rebuttal to Overwolf: the addon is the on-ramp (three shipped-file quotes); I raise the paid build, the undisclosed on-ramp, the format funnel | Overwolf ticket 375489 export | VERIFIED |
| 2026-06-20 17:47 | I follow up with Qik in a personal capacity, noting the gse.tools addresses bounce so Qik is the only working contact | Qik email thread | VERIFIED (my account identifier redacted) |
| 2026-06-21 19:41 | I report a broken-access-control issue on admin.gse.tools to TimothyLuke by DM ("reporting privately so you can fix it") | DM export | VERIFIED |
| 2026-06-21 19:44 | Same security report sent to Qik | Qik email thread | VERIFIED |
| 2026-06-22 01:06 | Qik replies (a Qik support representative): Qik is a processor, not the controller; refers the access request to its customer; will not share any outcome; asks me not to access data outside my own account or test the application further | Qik email thread | VERIFIED |
| 2026-06-22 05:53 | Final DM to TimothyLuke; no reply had come on any channel | DM export | VERIFIED |
| 2026-06-22 09:05 | Overwolf: "The ticket will remain open until this is resolved." | Overwolf ticket 375489 export | VERIFIED |
| 2026-07-15 | Companion 0.4.23 removes the client-side detection and the account flag | Repo `UPDATE-2026-07-15-v0.4.23.md` (verify from the public download) | VERIFIED (technical write-up) |
| 2026-07-16 11:20 | An Overwolf moderation agent: "The project GSE has been taken down for changes." | Overwolf ticket 375489 export | VERIFIED |
| 2026-07-16 11:28 | I reply, and state I am holding some material back (it involves personal data and a security issue) | Overwolf ticket 375489 export | VERIFIED |
| 2026-07-16 11:39 | Overwolf: "both the companion app and the pay-gated features have been addressed in the changes request" | Overwolf ticket 375489 export | VERIFIED |
| 2026-07-16 20:10 | GSE commit `7732fe5` "Restructure power user features" | Public git history | VERIFIED (public) |
| 2026-07-17 | Companion 0.4.24 (write guard) and 0.4.26 (capture removed) ship | Repo `UPDATE-2026-07-17-v0.4.24.md`, `UPDATE-2026-07-17-v0.4.26.md` | VERIFIED (technical write-up) |
| 2026-07-17 | Addon 3.3.25 on CurseForge; description reads "This addon is 100% free" | CurseForge project page | Recorded, not cited as evidence (see README, which rules this out in either direction) |

---

## The cease and desist — 2026-06-16

**It went from me to TimothyLuke. Nobody has ever sent me one.** It was delivered by Discord DM as a
PDF, after two earlier messages went unanswered.

- Title: "Formal Notice - Request to Cease." It is not a lawyer's letter: no counsel is named and no
  litigation is threatened.
- From: Jesper Driessen, GRIP-EMS, driessenlive@gmail.com. To: TimothyLuke, developer of GSE.
- Basis: the Companion 0.4.12 access-policy system that scans for `GRIP-EMS.lua`, reports its presence,
  sets `restrictedAccount`, and carries `purgeGripCharSequences` gated on a server `enforce` flag.
- Demand 1: remove the detection, account-flagging, and deletion of GRIP-EMS data in the next release.
- Demand 2: confirm in writing that the `enforce`-gated deletion has not been and will not be activated
  against GRIP-EMS users.
- It also said, and I still mean it: "I am not contesting your right to manage your own sequences or
  your own users."
- Deadline: 14 days. It lapsed on 2026-06-30 with no reply.

### Where the demands stand

| Demand | Status | How |
|---|---|---|
| 1 - remove the detection | Met | 0.4.23 removed the client-side scan and the account flag |
| 1 - remove the deletion of GRIP-EMS data | Met | 0.4.24 added a basename guard that blocks writes to `GRIP-EMS.lua` |
| 1 - remove the collection | Met (later, beyond what the notice asked) | 0.4.26 removed the server-triggered file capture |
| 2 - written confirmation | Not met | No reply on any channel |

The substance of what I asked for has happened, without any reply. Whether it happened because I asked
is not something I can know, and I do not claim it. Demand 2 is the only item still open, and it is a
request for a written assurance about the past.

---

## What the sequence does not answer

1. Did Companion 0.4.25 ever release? No build was acquired. Unknown — I assert nothing either way.
2. Did TimothyLuke ever reply, on any channel? No artifact I hold shows a reply. That is not proof none
   was sent through a channel I do not see. Unknown.
3. What did the CurseForge changes request actually say? Only Overwolf's one-line characterisation is
   held. The request went to the developer, not to me. Unknown, and it is the single most valuable
   missing document.
4. Did the `enforce` flag ever read true for any account? It read false in every capture I took. It is
   server-side and not visible from the client. Unknown.
5. Was the "100% free" CurseForge description written in response to the changes request? It fits the
   sequence, but timing is not cause. Inferred, not established, and I do not upgrade it.
