# The one claim they got right, and what I did about it (2026-07-30)

On 2026-07-30 two repositories were published by Larry A. Thiessen setting out copyright
and misrepresentation claims against GRIP-EMS and against LazyGrip.net. I read both in
full and checked every code citation against the live GRIP-EMS working tree and against
the four release archives the repositories bundle.

Most of what follows is me agreeing with them. One of their claims is correct, it is not a
copyright claim, and it was mine to fix. This update records the fix, the evidence, and
two mistakes I made while making it.

## Their claim was correct

LazyGrip.net stated that GRIP-EMS holds its place on a failed cast and does not advance
until the cast succeeds. The addon does not do that. The claim was wrong and it had been
on the site for as long as the guide has existed.

I re-verified this first-hand on 2026-07-30 rather than taking it on trust:

- The step advance in `Engine/StepFunctions.lua` is an unconditional
  `step = step % numS + 1` followed by `SetAttribute('step', step)`, inside the secure
  snippet body, with no predicate in front of it.
- `castsequence` occurs zero times in `Engine/ActionCompiler.lua`,
  `Engine/StepFunctions.lua` and `Engine/Engine.lua`.
- `UNIT_SPELLCAST_SUCCEEDED` appears only in `Engine/Engine.lua`, on the talent-swap path.

There is no cast-success gate anywhere in the advancement path. The engine advances one
step per keypress and never looks at whether the spell went out.

## What is actually true, and why players still saw a hold

The behaviour players report is real. The attribution was wrong.

When a macro line does `/cast` on a spell that is on cooldown, the WoW macro engine stops
there and the cast lines below it in that same press never run, so the press produces
nothing further. A `/castsequence` sitting on an entry that is on cooldown does the same.
That is WoW reading the macro text. It happens identically under any sequencer, including
GSE, and it does not stop the step advancing. Conditional lines are the exception: a
condition that does not apply is skipped and the line after it still runs.

This is from live 12.0.7 testing on a target dummy with combat logs, not from reading the
code alone. Ninety-four stuck presses of a macro whose first line was on cooldown produced
ninety-four cast failures and zero casts of the line beneath it.

So the honest description has two halves, and the site was only ever telling one of them,
with the wrong subject attached.

## What I changed on LazyGrip.net

Merged as `5ea6e12` on 2026-07-30, pull request #26 against `lazygrip/lazygrip-gg`, nine
files, 55 insertions and 99 deletions.

- Every statement that the engine holds, waits, or does not advance until a cast succeeds
  is gone from the homepage, `/guide/how-it-works`, `/guide/from-legacy-program`,
  `/guide/validating` and `/guide/building-sequences`.
- Both halves above are now stated together on both mechanics pages, with the halt
  attributed to WoW and noted as identical under any sequencer.
- The Failed cast comparison row is gone, along with the single-row table it lived in.
  Once the halt is attributed correctly, both addons behave the same on that axis.
- Priority and Reverse Priority were described as firing the first step that succeeds.
  They are weighted pre-expansion round-robin: N steps expand to N*(N+1)/2 entries so step
  1 appears most often, reverse inverts it, and both reuse the Sequential click body. The
  descriptions now match the implementation. Their reading of `SF:ExpandPriority` was
  right and mine was the one that needed correcting.

## Two mistakes I made while fixing it

The first attempt at the fix over-corrected. It deleted the guide sections that taught the
behaviour instead of re-attributing them, which left the site saying less than it honestly
could. That was reverted in approach and the sections were restored with the correct
attribution.

The first attempt also introduced two macro-syntax claims that are wrong. Both were live
only in an uncommitted working tree and never reached the site, but they were wrong and
they are worth recording because they are easy errors to repeat:

- It presented `/cast Heroic Strike; Slam` as a fallback pattern. It is not one. Clause
  selection takes the first clause whose conditional passes, and a clause with no
  conditional in front of it is always true, so the first spell wins every press and the
  second is unreachable. The documented example is `/cast [dead] Resurrection; Heal`, where
  the fallback is reachable only because the first clause carries a condition that can
  evaluate false.
- It offered `[known:SpellName]` as a way to gate a step on a proc. `known` tests whether a
  spell is in your spellbook, not whether a proc is up. The documented macro conditional
  set contains no aura or buff test at all, so a step cannot be gated on a proc. Where WoW
  substitutes the proc version onto the button, the correct advice is to name the base
  spell and let the substitution happen.

Both were corrected in the same commit that shipped the re-attribution.

## Their technical claims I am not contesting

Each of these was re-verified independently against the live tree and the four bundled
release archives. They are correct and I am not disputing any of them.

- `PlatformID`, `HelpURL` and `gse.tools` each occur zero times in GRIP-EMS, across
  v1.0.4, v1.9.1, v2.3.5, v2.3.16 and the live tree.
- `Checksum` occurs exactly 30 times in v2.3.5, and 30 times in v2.3.16.
- `SF:ExpandPriority` sits at `Engine/StepFunctions.lua:248-262` and emits N*(N+1)/2
  entries as increasing prefixes, via nested loops.
- The Sequential secure body advances unconditionally.
- Priority and ReversePriority reuse the Sequential click body.
- The only `UNIT_SPELLCAST_SUCCEEDED` consumer in the engine is the talent swap, gated on
  spell 384255.
- No cast-success gate exists in the advancement path.
- The `LegacyMigrate.lua` comment they quote is quoted verbatim and correctly.
- The four bundled zip files are genuine release artifacts. All four sha256 values match
  `SHA256SUMS.txt` and the hashes asserted in their prose.
- Their version scan holds 64 rows, v1.0.4 to v2.3.5, and is byte-identical in both repos.

Their package also concedes there is no source copying and no DMCA 1201 circumvention, and
it states its own limits. I am recording that because it is accurate and because a reply
that contested everything would be worth less than one that contests only what is wrong.

## Correcting the record on who runs LazyGrip.net

Their materials treat LazyGrip.net as mine. It is not, and the precise position matters
more than a broad denial, so here is the whole of it including the parts that cut against
me.

I do not own the `lazygrip` GitHub organisation and I do not own or operate LazyGrip.net.
I do not control the domain, the hosting, the database, or moderation of the site. On the
site's repository my permissions are `push` and `triage`. I hold neither `admin` nor
`maintain`.

What I do have is commit access as a collaborator, by arrangement with the site's owner,
and that is the established way I contribute. I have authored most of the recent pull
requests on that repository and I have merged several of my own, including the one in this
update. Other pull requests of mine were merged by the site's operator. Anyone can confirm
all of this from the public API.

So "not affiliated" would be the wrong word and I am not using it. Contributing code to a
community site under an agreed arrangement is not the same as owning or running it, and
the ownership claim is the one I dispute.

I have also corrected the site's own wording, in the same commit, because it previously
said LazyGrip.net was not affiliated with the GRIP-EMS developer. That was inaccurate for
the same reason. The footer, `/about`, `/tos` and the FAQ now say the site is
independently owned and operated and is not an official GRIP-EMS site, and the FAQ states
the contributor relationship directly instead of denying it.

## What I am not claiming here

This update is a record of what I checked and what I changed. It is not a legal document
and it is not a full answer to every claim in either repository. Where their technical
citations are right I have said so above. Where I think their inferences do not follow
from their own evidence, that is a separate matter and not something I am arguing in this
file.

I am not claiming the site copy was wrong on purpose. It was written from a wrong mental
model of my own addon, it went unchecked for months, and the first person to check it
properly was the person accusing me.

## Verification

- Site repository: `lazygrip/lazygrip-gg`, pull request #26, merge commit `5ea6e12`,
  parent `e539ab5`.
- Engine facts: `Engine/StepFunctions.lua`, `Engine/ActionCompiler.lua`,
  `Engine/Engine.lua` in GRIP-EMS v2.3.16.
- Macro conditional set: the Macro conditionals page on warcraft.wiki.gg, which lists every
  documented boolean condition and contains no aura or buff test.
- Repository permissions and pull request history: the GitHub REST API, `repos/lazygrip/
  lazygrip-gg` and its pulls collection.
