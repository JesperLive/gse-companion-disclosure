# Update 2026-08-27: CurseForge closes the claim on the merits, and the withdrawals that came with it

This one runs in my favour, so it gets handled more carefully than the ones that do
not. Everything below is either quoted from the other party's own published record or
checked against shipped code, and where I am making an argument rather than reporting a
fact I say so in the sentence.

Two things happened. CurseForge re-examined the copyright claim against GRIP-EMS and
closed it. And across five commits on 2026-08-27 the claimant withdrew a series of
claims, including the two that were most damaging to me personally.

One caveat before any of it, and it is not decoration. **A platform closing a claim
under its own policy is not a legal ruling.** It does not adjudicate anything, it binds
nobody, and it can be revisited. The claimant's own file says exactly this, and he is
right. I am recording an outcome, not a vindication.

---

## 1. The closure

Received 2026-08-27 06:31 in the claimant's local time, from
`CurseForge Copyright Claims <copyright@curseforge.com>`, as a reply into the existing
thread. CurseForge state they *"fully re-examined this claim, read both your emails, and
held an internal consultation."*

> **"Please consider this case closed."**

Their reasoning, as recorded by the claimant, has three parts.

**One, the author-confirmation prompt.** *"Before a sequence you wrote can leave a
player's client and be sent to friends, the addon now names you as the author and
requires that player to actively confirm."* That is the v2.4.8 work.

**Two, responsibility sits with the user.** *"It is their decision whether to pass it
on, and their responsibility if they do so without the right to do so. It's not
different from downloading and sending it manually."*

**Three, and this is the one that decided it: his own licence permits the conversion.**
CurseForge quote the SLG-Sequences licence back and conclude:

> *"A player bringing sequences they have already lawfully installed into a different
> tool, on their own machine, for their own play, is doing exactly what that grant
> permits. The addon carrying out that action on their instruction is therefore not a
> breach of your license."*

The claimant's own analysis of that paragraph is more generous to CurseForge than I
would have been, and I quote it rather than characterise it:

> *"§1 of the SLG-Sequences licence grants personal, non-commercial use "in World of
> Warcraft" -- not "in GSE" -- "including modifying it for your own personal use." If a
> licensee's local conversion falls inside that grant, there is no direct infringement on
> that path and nothing for a tool-provision theory to attach to. Ambiguity in a licence
> is construed against its drafter, which here is the rights holder. This is the
> strongest argument made against the claim by anyone to date, and it is built entirely
> from the rights holder's own text."*

I had no part in that argument. I did not write to CurseForge at any point in this
matter, and I did not know the claim had been re-examined until I read his repository.

### The earlier state of the same claim

For the record, because the sequence matters. The same claim was **actioned** on
2026-08-20 and GRIP-EMS project 1489414 was removed from CurseForge. The listing
returned on 2026-08-25. Both of those are recorded in
[UPDATE-2026-08-26-platform-actions-and-current-builds.md](UPDATE-2026-08-26-platform-actions-and-current-builds.md).
So this is a platform reversing its own earlier decision on re-examination, not a claim
that was rejected at first sight.

---

## 2. What was withdrawn

All five of these were volunteered by the claimant rather than extracted, and four of
them appear in the same batch of commits. I am listing them because a record that
carries an allegation and not its retraction is not a record. I am not going to gloss
them as anything more than they are.

### The "Executed" evidence row

The package cited a Discord message of mine, *"Kind of solved it, not 100% happy though,
because see what happens when I make it narrow"* (2026-04-30 16:24:57), as the moment the
capability was built, roughly four hours after the conversation began. The row is
**withdrawn in full** and struck in eight places. Their own note:

> *"That reading is wrong and the row is withdrawn in full... the two attachments are
> screenshots of the addon's own user interface at different window widths."*

They are correct. It was about window layout. I challenged this and the challenge was
accepted.

The withdrawal is partial in one respect they state plainly, and I record their
qualification alongside it: *"What falls with this row is the timeline, not the
execution... This thread evidences the planning; RELEASE-DELTA-ANALYSIS-2026-08-26.md
evidences the execution."*

### That GRIP-EMS strips the author's name

Withdrawn, and this one is unambiguous:

> *"CORRECTION -- the author name is NOT stripped... Any statement anywhere in this
> package that GRIP-EMS removes the author's name is withdrawn."*

Their standing guidance to anyone using the package now reads *"Do not say the author's
name is stripped. It is not."* They verified it against the shipped v2.4.8 archive and
cite the line numbers: `Import/LegacyImport.lua` populates the author at lines 911, 936
and 977, and `ExportFrame.lua:933` displays it read-only.

### That I blocked them

Inverted. Their correction:

> *"The rights holder and the GSE author blocked the developer on GitHub at the outset of
> this matter... A block existed. It ran the other way."*

This was corrected to CurseForge in writing on 2026-08-26. They also record that they
cannot establish whether the original statement ever reached CurseForge, because the
submitted text is not archived, and they corrected it anyway.

### Two quotes attributed to me

Reattributed to a third participant, CzarTheMad. The rows previously headed *"Intended
to remove the identifying data"* and *"Removal was the object, not a side effect"* were
presented under the heading "developers' own words" and are not mine.

They add a qualification which I record because leaving it out would be selective:
*"This is a correction of authorship only -- it does not detach the developer from the
exchange... Six of the nine logged messages are his."* That is accurate. I opened the
conversation and most of the messages in it are mine.

### That v2.4.8's protections are not real

Credited, in their own evidence file:

> *"This is a real protection and it works. Sequences exported through GSE.Tools with
> the current encryption cannot be imported by GRIP-EMS."*

---

## 3. The GSE author's own test

Separately, on 2026-08-27 01:13 UTC, Timothy Luke, GSE's author and the operator of the
GSE.Tools server, tested v2.4.8 himself and reported the result by direct message:

> *"yesterdays release honours the no export and wont convert the gse.tools exports. i
> checked it yesterday"*

> *"of the stuff that is exported from teh game (or copied from your personal gse.lua
> file). Of the stuff exported from gse.tools that has the updated encryption he is not
> touching that stuff"*

Three caveats travel with this and the claimant states all three himself, so I do too.
It is testimony rather than an artifact. It is sourced from DMs, so no third party can
open the permalinks and verification rests on the screenshots and the decoded message
IDs. And the second message carries Discord's "(edited)" marker, with the pre-edit text
unavailable.

---

## 4. What survives, and where it is correct about my code

The claim CurseForge closed is not the whole of what was alleged. One part survives, it
is narrow, and it no longer depends on any Discord message. As it was put, it was two
fields from GSE's `MetaData` table that GRIP-EMS does not carry across on the plain
`!GSE3!` import path: `PlatformID` and `HelpURL`.

**I checked it against my own shipped code rather than taking it on trust. One of the two
holds outright. The other holds for some payloads and not others, and the difference
turns out to matter. Both are set out below.**

`PlatformID` is right, and I am not going to argue with it. At v2.4.8 the string appears
**zero times across all 165 Lua files** in the addon, while `Import/LegacyImport.lua`
does carry two other fields from the same table. Here is that block in full,
lines 849 to 871, indentation included, so it can be diffed against the shipped file
rather than taken on trust:

```lua
    -- Store legacy format metadata for future use (informational only)
    seqData.importMeta = {}
    if sequence.MetaData then
        if sequence.MetaData.GSEVersion then
            seqData.importMeta.sourceVersion = tostring(sequence.MetaData.GSEVersion)
        end
        if sequence.MetaData.Checksum then
            seqData.importMeta.sourceChecksum = tostring(sequence.MetaData.Checksum)
        end
        -- Read disabled state from metadata
        if sequence.MetaData.Disabled then
            seqData.disabled = true
        end
        -- Preserve dependency metadata onto the runtime sequence so
        -- post-import lookups (ResolveMacroDeps + future deps surfaces)
        -- can read it. Selective copy under MetaData.Dependencies to
        -- match the source-format field name expected by readers at
        -- ExportPreview.lua L292-298.
        if sequence.MetaData.Dependencies and type(sequence.MetaData.Dependencies) == "table" then
            seqData.MetaData = seqData.MetaData or {}
            seqData.MetaData.Dependencies = sequence.MetaData.Dependencies
        end
    end
```

Two fields reach `importMeta`: `sourceVersion` and `sourceChecksum`. `Disabled` and
`Dependencies` are read in the same block and land elsewhere on the record. `PlatformID`
is not read here, and not anywhere else in the addon.

`HelpURL` is more complicated, and it runs partly in my favour and partly against me, so
both halves are here.

**GSE has never had a field by that name.** Not "does not currently". Never. A pickaxe
search across the whole upstream repository, all 4015 commits and every ref,
case-insensitively, returns zero commits that ever added or removed the string
`HelpURL`. Two controls run the same way against the same repository show the search
works rather than silently matching nothing: `PlatformID` returns nine commits and
`Helplink` returns seventeen. It is absent from the Companion's `out/main/index.js` at
0.4.22 as well, a copy of which is published here as
`evidence/companion_0.4.22_main_beautified.js`, so a reader can check that half without
taking my word for it.

```
git log --oneline --regexp-ignore-case -S "helpurl" --all
git log --oneline -S "PlatformID" --all
git log --oneline -S "Helplink" --all
```

What GSE's editor writes is `MetaData.Helplink`, at `GSE_GUI/Editor_Metadata.lua:640`,
defaulting to the GSE United discord invite.

**GRIP-EMS reads that one.** `Import/LegacyImport.lua:842` seeds `helplink` from
`sequence.Helplink` when the sequence record is built, line 999 fills it from
`MetaData.Helplink` when it is still empty, and the value reaches the editor as a
labelled field, survives a rename at `UI/SequenceList.lua:1409`, and carries a translated
string in all eleven locales. So where a payload uses GSE's own help-link field, the link
travels.

**I am still not going to call the field imaginary, and the reason is in this repository
already.** [UPDATE-2026-07-30-slg-exhibits-measured.md](UPDATE-2026-07-30-slg-exhibits-measured.md)
recorded `HelpURL` as present in an input I examined on 2026-07-30, and I confirmed that
finding at the time. Something wrote it, and the addon history above says it was not the
addon. GSE.Tools is a separate codebase from the addon, I have no account on it and
cannot read its export schema, and it is the obvious candidate. I am recording that as an
open question rather than resolving it in my own favour, which is the standing this
repository gives every other question it cannot close.

So where it lands: GRIP-EMS reads neither `HelpURL` nor `helpUrl`, in any case, at zero
occurrences across all 165 files. For a payload written by GSE's addon the help link
still arrives, under `Helplink`. For a payload carrying `HelpURL` instead, it does not.
The claim is right about the second kind and wrong about the first, and the two have been
treated as one thing.

What survives, then, is `PlatformID` outright, plus `HelpURL` for payloads that use that
spelling. The addon reads fifteen distinct `MetaData` fields: `Author`, `Checksum`,
`Default`, `Dependencies`, `Description`, `Disabled`, `GSEVersion`, `Help`, `HelpTxt`,
`Helplink`, `Icon`, `LastUpdated`, `Normal`, `SpecID` and `noExport`. Two of them are
carried into `importMeta`.

A note on how that field count was reached, because the method matters and the obvious
method gets it wrong. Matching `MetaData.Field` alone finds thirteen. It misses every
field read through a local alias, and two of the fifteen are read that way. The same
applies to the `HelpURL` finding above: a grep over one checkout can only say what a
project does now, never what it has never done, which is why that claim rests on a
pickaxe over the full history instead. This is the caveat recorded in
[hashes.txt](hashes.txt): a scan finds only the shape it encodes, and a second scan of
the same shape confirms nothing.

On what `PlatformID` is, GSE's own source is where I get it rather than from my own
characterisation. `GSE/API/Storage.lua:219` calls it the "Companion PlatformID sidecar"
and keeps it in `GSEVariablePlatformIDs` and `GSEMacroPlatformIDs`, name to server-id
maps whose stated purpose is to stop the next sync re-uploading a deleted item.
`MetaData.PlatformID` itself is read at `GSE/API/Storage.lua:727` and
`GSE/API/SequenceDelta.lua:298`. It is an identifier on the GSE.Tools service.

I am not going to characterise my own intent here, because my account of my own intent
is worth exactly as much as any other interested party's. What is checkable is the
comment the block carries, which reads "for future use (informational only)", and the
fact that the field map is incomplete rather than exhaustive.

CurseForge did not address this point at all. The claimant's drafted reply asks only
that the closure record it as *"raised and not decided"* rather than rejected, which is
a fair characterisation of what happened to it.

---

## 5. On the sandbox, and what it does and does not answer

This section is argument, not measurement. Labelled as such.

A World of Warcraft addon cannot read files. Blizzard's Lua sandbox exposes no `io`
library, no `loadfile`, no `dofile` and no `os.execute`, so none of the four is reachable
from GRIP-EMS at runtime whatever its source happens to contain.

Because a reader will grep for those names, here is what they will find. In the shipped
files the only occurrence of any of the four is a comment at `Data/VariableStore.lua:374`,
listing what the addon's own variable sandbox withholds from user-written variable bodies:
*"Deliberately ABSENT, and not to be added: _G, getfenv, setfenv, loadstring, load,
dofile, require, rawset, setmetatable, getmetatable, collectgarbage, newproxy, coroutine,
debug, SendChatMessage, RunMacro, RunMacroText, C_AddOns."* `io.open` and `loadfile` do
occur in `Test/`, which is the headless harness. It runs under a desktop Lua interpreter,
outside the game and outside the packaged addon, and one of those files says so at the
call site: *"loadfile is dev-harness file I/O, intentionally outside the addon WoW std."*
`loadstring` also appears in shipped files, and it compiles a string rather than opening
anything, so it does not reach the filesystem either.

The claim is about reach, not about string counts: none of the four can touch a file from
inside the game, whichever files the repository happens to contain.

What the addon reads in game are globals the client itself populates from GSE's own
`## SavedVariables` declarations.

Every addon shares one global table and Blizzard ships no permission model between
addons. So sequence data is reachable because the platform is built that way and because
GSE declared those variables saved, not because anything was bypassed. Where GSE has
chosen to protect content programmatically, with the `!GSE3!+` encrypted format, the
addon refuses it before any decode is attempted, at eight enforced call sites.

**The access is read-only, and that is checkable.** GRIP-EMS never writes to, alters or
deletes any GSE file or GSE variable. Measured against the shipped v2.4.8 tree, excluding
tests and bundled libraries:

- Zero assignments to any GSE global anywhere in the repository, tests included. Seven
  lines assign to a name beginning `GSE`, and every one of them is a key inside a local
  mock table in a test file: `Test/TestSuite.lua`, `test_author_confirm.lua`,
  `test_frg1_v2_reader.lua` twice, `test_malformed_entry_guards.lua` twice, and
  `test_variable_sandbox_and_noredistribute.lua`. None of them touches a global.
- **Nineteen read sites in total, and here is every one of them.** Eighteen are in
  `Import/LegacyMigrate.lua`, inside exactly three functions:
  `LM.GetSourceSequenceCount` reads `GSESequences`; `LM.MigrateAll` reads `_G.GSE`,
  `GSESequences`, `GSEVariables` and `GSEMacros`; `LM.MigrateKeybinds` reads `GSE_C`.
  The nineteenth is `ReadExternalSkyrideBinds` at `Engine/VehicleKeybinds.lua:493`, which
  reads `GSEOptions.SkyRidingBinds`. That one is not sequence data and is dealt with
  separately below.
- **Nothing reads GSE sequence data unless the user asks for a migration.** The only
  paths that touch `_G.GSESequences` are `LM.MigrateAll` and the count that precedes it,
  and both are reached only from `/gems migrate` (`Core/Core.lua:849`) or from
  `SL:ShowMigrateConfirm` (`UI/SequenceList.lua:1480`), which puts a three-choice
  confirmation dialog in front of it with Cancel as an option. A user who never runs a
  migration has no code path by which GRIP-EMS reads a single GSE sequence.
- The other calls into that module do not read sequence data at all.
  `LM.GetSourceStatus()` calls `C_AddOns.IsAddOnLoaded("GSE")` and
  `C_AddOns.GetAddOnInfo("GSE")`, which are Blizzard API calls reporting whether the
  addon is installed and enabled. That is presence detection, not data access, and it is
  what the settings panel and the sequence list use to decide whether to offer a migrate
  option at all.
- `GRIP-EMS.toc` declares only `GRIP_EMS_DB`, `GRIP_EMS_Settings`, `GRIP_EMS_TRACE` and
  `GRIP_EMS_CHAR`. It declares no GSE variable, so the game client never writes GSE data
  into a GRIP-EMS file either.

**The nineteenth read site, stated separately so it is not buried.**
`ReadExternalSkyrideBinds` at `Engine/VehicleKeybinds.lua:493` reads
`GSEOptions.SkyRidingBinds`, gated on `GSE_QoL` being loaded. It is reached from
`VK:GetExternalSkyrideBindCollisions` and `VK:GetExternalPetBattleBindCollisions`, whose
only callers are `UI/KeybindTab.lua:1459` and `:1657`. So it runs when the user opens the
Keybind tab, and its purpose is to warn that a key is claimed by both addons. It is
keybind configuration rather than sequence data, it writes nothing, and its own comment
says so: *"Read-only: never writes the external table."*

I state it separately because a reader who greps for themselves will find this site, and
should not have to wonder why a nineteenth read went unmentioned in a section counting
eighteen.

Blizzard ships no permission model between addons, so nothing here is bypassed. Whether
cross-addon reading is *common* practice is a claim I have not measured and am not
making; I have measured only what GRIP-EMS does.

**What this does and does not answer.** It disposes of any suggestion that GRIP-EMS
modifies, damages or removes anything belonging to GSE, because it does not touch GSE's
data at all. It does not by itself dispose of the surviving point, and I would rather
say so than let it look stronger than it is. That point is not about the original, which
is untouched. It is about the new record GRIP-EMS writes into its own store, and whether
the platform fields it does not read should travel into that record alongside the two
that already do. Note that neither disputed field is among the fifteen it reads, which is
the point: the map is incomplete rather than selective about things it already has.

There is a further question here that I am not qualified to answer and am not going to
pretend to. A converted sequence in GRIP-EMS is not a byte copy of a GSE sequence; it is
a different structure with different fields, produced by a format conversion. Whether
that distinction matters to the provision being invoked is a question for a lawyer, not
for me, and I flag it as open rather than resolving it in my own favour.

The claimant addresses the protection question directly and his answer is reasonable on
its face:

> *"A rights holder cannot be required to adopt a third party's platform in order to
> have their licence observed... the provision keyed to technical measures is §1201,
> which this memo declines to plead."*

I record that because it is the argument against my own, and it is a decent one.

**The same principle has a second edge, and it is worth stating.** If a rights holder
cannot be required to adopt someone else's platform, it is not obvious that an
independent tool can be required to carry that platform's bindings either. The
symmetry does not resolve anything by itself, but it does mean the argument cannot be
run in only one direction.

That matters here because of what the disputed fields actually are, and the distinction
is easy to lose. **The author's name is carried through.** The claimant verified this
himself against v2.4.8 and withdrew any suggestion to the contrary, and it is in the
code: `seqData.author` is populated on import, and `originalAuthor` is set and preserved.
The help link is carried too, under GSE's own name for it, `Helplink`. What is not
carried is `PlatformID`, an identifier on the GSE.Tools service, and `HelpURL` where a
payload uses that spelling instead. Both are bindings to a particular platform rather
than authorship information in the ordinary sense.

Whether a service account identifier counts as protected information for the purpose
being invoked is a real question and I am not qualified to answer it. I raise the
distinction because it is not the same question as whether the author is identified, and
the two have been treated as one. A tool that preserves who wrote something, while not
preserving a third party's account binding for it, is doing something different from a
tool that discards the author.

There is also the matter of who is acting. GRIP-EMS does not migrate anything on its own
initiative. It does so when a user runs `/gems migrate` or confirms the dialog, on data
already on that user's own machine, as measured above.

One thing this section is careful not to imply, because the shorthand is easy to reach
for and it would be false: nothing is "written back out" to GSE. The question is only
what the new record in GRIP-EMS's own store contains. GSE's copy is not read from again
after the migration and is never written to at all, as measured above.

### One observation about ecosystem norms, and what it is not

Whether one project reading another's saved data is unusual is a fair question to ask,
and this repository happens to hold measurements on both directions of it. They are set
out here because leaving them out would be selective. **This is an observation about how
the ecosystem works. It is not offered as a defence, it is not a rebuttal to the
surviving claim, and it does not answer it.** A second party doing a comparable thing has
no bearing on whether the first party should carry two fields forward, and I am not
arguing otherwise.

The two mechanisms are not equivalent, and the differences run in both directions.

GRIP-EMS reads in-game, inside Blizzard's Lua sandbox, through a global the client itself
populates. It cannot open a file, has no `io` library available to it, reads only, and
writes nothing anywhere outside its own saved variables.

The GSE Companion is a desktop application and operates outside that sandbox entirely. As
documented throughout this repository, from v0.4.20 through v0.4.24 it carried a
server-triggered routine that read arbitrary files under `Interface\AddOns` and `WTF`,
which reached `GRIP-EMS.lua` among everything else, and through v0.4.23 it carried a
signed engine that could delete from or rewrite any addon's `.lua` saved variables.
**Both of those are gone from the shipped client**: the write path was restricted to
`GSE*.lua` in v0.4.24 and the arbitrary-file capture was removed in v0.4.26, and neither
has returned through 0.5.3. A runtime capture recorded in
[UPDATE-2026-07-18-companion-runtime.md](UPDATE-2026-07-18-companion-runtime.md) found
the Companion stats `GRIP-EMS.lua` by name but never reads, writes or deletes it.

**One distinction that does not hold, stated because it is the obvious one to reach for.**
It is tempting to separate the two on the grounds that the Companion is software the user
installed and runs deliberately. That does not survive the measurements above. GRIP-EMS
is also software the user installed, and it reads GSE sequence data only when that user
runs `/gems migrate` or confirms a dialog. On the question of user initiation the two are
alike, and I am not claiming a difference that is not there.

The difference that does survive is about who can start the process, and it is documented
throughout this repository rather than asserted here. GRIP-EMS has no remote trigger of
any kind; every path into the migration begins with a keystroke or a click on the user's
own machine. The Companion, from v0.4.20 through v0.4.24, could begin a file read on a
directive pushed from GSE's server, with no user action in the loop. That capability was
removed in v0.4.26 and has not returned through 0.5.3, which is why this is stated in the
past tense.

None of that is a defence of anything, and it is deliberately not a claim about the
ecosystem at large. **I have measured what these two projects do and nothing else.** I
have not surveyed other addons, so I make no claim about how common cross-project data
access is. It would be convenient to say that reading another addon's saved data through
the shared global table is ordinary practice here rather than anything unusual, and it
may well be true, but I have not measured it. Everything else in this document is
measured or sourced, so that sentence does not get to appear on my say-so.

What is left is narrow and checkable: both projects have read data belonging to the
other, by different mechanisms and under different constraints, and in both cases the
software doing the reading was installed by the user.

---

## 6. Where the three platforms stand

| Platform | Filed | State as of 2026-08-27 |
|---|---|---|
| CurseForge | 2026-08-02, actioned 2026-08-20 | **Closed on the merits 2026-08-27.** Listing live, v2.4.8 |
| Wago Addons | DMCA §512(c), 2026-08-20 | No response recorded. Listing live, v2.4.8 |
| WoWInterface | IP/policy complaint, 2026-08-26 | No response recorded. Listing live, v2.4.8 |

The claimant contemplates a follow-up to Wago around 2026-09-03 and records his own
expectation: *"Expect Wago and WoWInterface to reason the same way. Both remain
unanswered."*

---

## 7. What I could not verify

- **The CurseForge email itself.** I have not seen it. It is quoted here from the
  claimant's published record. I was not a party to that correspondence and received no
  notice of the claim, the removal, the restoration or the closure from CurseForge at any
  point.
- **Whether the drafted reply at his §6k was ever sent**, and whether CurseForge
  responded. It is recorded in his file as drafted.
- **Whether Wago or WoWInterface have responded to anything.** Both listings are live,
  which is all I can see from outside.
- **The pre-edit text of the second operator message.** Not available.
- **Anything about intent or motive**, mine or anyone else's. Out of scope here, as
  always.

---

## 8. Nothing in this changes the findings above

This update is about the dispute, not about the Companion. Findings 1 and 2 stand
exactly where the previous update left them: the arbitrary-file capture removed in
v0.4.26 and still absent through 0.5.3, the signed engine and unsigned auto-updater
still shipped, and Finding 2 substantially retracted since 2026-07-17. The platform
correspondence has never been evidence in this repository and is not becoming evidence
now.
