# Moderation and correspondence record

**Published:** 2026-07-17
**Author:** Jesper (JesperLive / MrSataana), developer of GRIP - Enhanced Macro Sequencer (GRIP-EMS)

## Why this is a separate file

The rest of this repository has one rule: every claim is a line you can read in a shipped file,
and every section tells you how to check it yourself. That rule is the reason the repository is
worth anything. I am a competitor, so my framing is worthless — the files are not.

This file breaks that rule, and that is why it is not in the README.

Everything below is correspondence. Most of it you cannot verify. The CurseForge ticket is visible
only to my account. The emails are in my mailbox. I am publishing it because leaving it out means
the public record shows me withdrawing my weakest claim in June and says nothing about what the
platform did in July, and that is a misleading picture. But you should treat it differently from
the rest of the repository: **this is my account of what I was told, and you are taking my word
for it.** Nothing in the README depends on any of it.

Names of individual support staff are removed. They were doing their jobs and none of this is
about them.

A dated, ordered version of everything below — same caveats, same redactions — is in
[MODERATION-RECORD-TIMELINE.md](MODERATION-RECORD-TIMELINE.md).

---

## CurseForge / Overwolf — ticket 375489

**2026-06-11.** I filed a moderation report against the GSE project. Two findings: the Companion's
detection, account-flagging and server-gated deletion of GRIP-EMS data, and the paid "PATRON"
build. I disclosed in the report that I am a direct competitor and asked them to verify from the
files rather than weigh my account against the author's.

**2026-06-16.** First substantive reply. On the Companion:

> "as this is distributed independently via the developer's own website and is not hosted on
> CurseForge, it falls outside our enforcement scope. We also found no evidence that the
> CurseForge-hosted addon requires it, links to it, or triggers its download in any way."

The remaining claims were forwarded to their moderation and community teams.

**2026-06-20.** I replied on the one factual point in that answer. The addon they host does link to
the Companion and walks users into installing it — three lines in the free build that every user
downloads: the in-game link to gse.tools in `GSE_GUI/Editor_Tree.lua`, the on-ramp text in
`GSE/Localization/ModL_enUS.lua` ("Download the Companion at gse.tools. Once installed, a small
bridge addon (GSE Companion Bridge) appears in your addon list, keep it enabled."), and the
built-in "Companion App" settings panel in `GSE_Options/Options.lua`. I asked for a decision on
three items inside their scope: the paid feature-gated build, the undisclosed on-ramp, and the
format funnel.

**2026-06-22.** "We are still looking into this. The ticket will remain open until this is
resolved."

**2026-07-16, 11:20.** From an Overwolf moderation agent:

> "The project GSE (GnomeSequencer-Enhanced) has been taken down for changes.
> We apologize for the long wait. This was a complicated case that we needed to thoroughly check
> and confirm."

**2026-07-16, 11:39.** After I asked whether to open a new ticket if anything changed:

> "You can reopen this ticket if anything related to this case changes. For your information, both
> the companion app and the pay-gated features have been addressed in the changes request."

### What this does and does not establish

It establishes that CurseForge reviewed the report for five weeks and took the project down for
changes, and that both items were in the changes request.

It does **not** establish what the changes request said. I have never seen it — it went to the
developer, not to me. Everything past that one sentence is my inference, and inference is not
evidence.

It does **not** establish that any particular later change was made because of it. GSE shipped
Companion 0.4.23, 0.4.24 and 0.4.26 and addon 3.3.25 across 15–17 July, and those builds removed
the detection, blocked the write path and removed the capture. The timing fits. Timing is not
causation, and I am not claiming it is. The same goes for the CurseForge description now reading
"This addon is 100% free" as of 3.3.25 on 17 July. It may be a response to the changes request. It
may not be. I do not know, and neither does anyone else outside GSE and CurseForge.

I should also say the obvious thing about my own position here: a platform taking action after my
report is not proof that I was right. It is proof that they reviewed it and decided something
needed to change. Those are different, and I would rather state it than let the reader assume the
stronger one.

---

## Cease and desist — 2026-06-16

**I sent this. Nobody has sent me one.** It went to the GSE developer by Discord DM on 2026-06-16
as a PDF, after two earlier messages went unanswered.

It asked for two things:

1. Remove the detection, account-flagging and deletion of GRIP-EMS data from the Companion in the
   next release.
2. Confirm in writing that the `enforce`-gated deletion has not been and will not be activated
   against GRIP-EMS users.

I set a 14-day deadline. It expired on 2026-06-30 with no reply.

It also said, and I still mean it:

> "To be clear, I am not contesting your right to manage your own sequences or your own users. I am
> asking you to stop having your software detect, flag, and delete data inside another developer's
> addon, on users' computers, without their knowledge or consent."

**Where that stands now.** Point 1 has been met, on all three limbs, without any reply to me:
0.4.23 removed the client-side scan and the account flag, 0.4.24 blocked the signed engine from
writing to `GRIP-EMS.lua`, and 0.4.26 removed the arbitrary-file capture. Point 2 has not been met.
I never received an answer on any channel.

I am recording that the substance of what I asked for has happened. Whether it happened because I
asked is not something I can know.

---

## Subject access request — sent 2026-06-20, never delivered

On 2026-06-20 I sent a data subject access request to GSE, asking for the personal data held about
me, specifically the value of any field recording whether I have third-party software installed —
the `restrictedAccount` flag — and any automated decision-making applied to my account.

**It bounced.** Both published contact addresses rejected it at the mail server:

> `554 5.7.1 <admin@gse.tools>: Relay access denied`
> `554 5.7.1 <support@gse.tools>: Relay access denied`

I pasted the text into a Discord DM instead. No reply.

**To be precise, because this matters and it would be easy to imply otherwise: GSE has not ignored
a subject access request. GSE never received one.** The addresses on their own site do not accept
mail. I am not claiming a failure to respond. I am recording that there is no working written
channel to the developer, which is the only reason the platform correspondence below exists.

---

## Qik — reported 2026-06-20, replied 2026-06-22

The Companion's account data is stored on Qik (`api.qik.dev`), an infrastructure platform. On
2026-06-20 I wrote to them about a customer's use of their platform: storing a flag against each
user recording whether a competitor's addon is installed, and backing a remotely-gated routine to
delete that competitor's data. I told them I was a competitor and asked them to reach their own
conclusion from the files rather than take my characterisation.

I also sent them, and the developer, a security report on 2026-06-21: the admin interface at
`admin.gse.tools` loaded for my ordinary non-admin account, including a site-wide "Enforcement"
toggle. I viewed the pages and changed nothing, and reported it privately rather than publishing
it.

**2026-06-22.** A Qik support representative replied. In summary: Qik is an infrastructure provider,
its customers build and operate their own applications on it, and Qik does not direct how they are
designed. On my access request, Qik generally acts as a service provider to the customer, so they
referred the request to the customer and asked them to respond. On the admin interface, that is
part of a customer's application and access to it is configured by the customer; they passed the
report on. They said they would review the platform questions internally and, as a matter of
policy, would not share any outcome with a third party.

They also asked this, and I am publishing it because it constrains me and the reader should know
that:

> "we would ask that you not access areas or data outside your own account, or carry out further
> testing on the application."

I have not tested the application since.

No response to the referred access request has reached me.

---

## Forum thread closure and account ban — 2026-06-08 to 2026-06-09

My GRIP-EMS thread on wowlazymacros.com was closed and hidden on 2026-06-08. I tried to resolve it
privately by DM; the first message went through and later ones did not. I opened an on-site chat to
ask about the closure. The chat was closed, and my account was banned.

I emailed the site's support on 2026-06-09 asking for a reason. I have had no reply.

**This is the weakest item here and I am flagging that myself.** It is a third-party forum, it is
not CurseForge, it is not GSE, and I have no evidence connecting the ban to the GSE dispute. I have
one side of it — mine. I include it for completeness of the record, not because it proves anything.
A reader would be right to give it no weight.

---

## One thing I got wrong, in private, and am not hiding

My first message to the GSE developer, on 2026-06-11, asked why he was "distributing malware that
edits my files."

That was the wrong word. Nothing in this repository has ever called it malware, because the
evidence does not support that characterisation and I was careful about it in every public
document. I was not careful in a DM at the point I had just found the code. I am recording it here
rather than leaving it to be discovered, because a record that only contains the parts that suit me
is not a record.

---

## What is not here

I hold material I am not publishing. The Qik correspondence contains my own account identifiers.
The security report concerns a flaw I reported privately and have no interest in helping anyone
exploit. Individual support staff are unnamed throughout.
