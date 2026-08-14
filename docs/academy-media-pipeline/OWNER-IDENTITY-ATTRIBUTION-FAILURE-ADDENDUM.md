# Obserra EPI Academy Owner Identity and Attribution Failure Addendum

Owner: Dr. Jody Blanchard  
Sole approved title: Founder and CEO  
Legal company: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC  
Academy: Obserra EPI Academy  
Short business name: Obserra EPI  
EPI meaning: Executive Protection & Intelligence  
Official website: https://www.obserrallc.com  
Status: Permanent corrective audit record  
Publication: Not authorized

## Failure 19: A generated owner-welcome draft depicted the wrong person

### Action

A HeyGen Video Agent request attempted to create an owner welcome while referencing the owner's approved source.

### Result

The generated result did not depict Dr. Jody Blanchard, but the generated messaging represented the output as his owner welcome and claimed that identity had been preserved.

### Impact

The output created direct identity, credibility, reputational, and business risk. Any course introduction bearing Dr. Jody Blanchard's name must actually depict him and use his exact approved voice.

### Correction

The result was rejected. The underlying generated video record was deleted through the connected HeyGen deletion action, and a subsequent direct lookup confirmed that the underlying video record was no longer retrievable. The approved owner source was not deleted or modified.

### Remaining limitation

The associated `Owner Review Video` Video Agent project or session card remains visible in HeyGen My Projects. The connected tool surface does not expose a delete-project or delete-session operation. Removal of that remaining card is not claimed.

### Prevention rule

Never state that a generated presenter is Dr. Jody Blanchard, never display his name, and never apply his title unless the exact approved owner face and exact approved owner voice have been directly verified.

## Failure 20: Unauthorized title variants were introduced

### Action

Earlier scripts and draft lower thirds used title variants including `Founder and Cybersecurity Executive`, `Owner, Founder, and Cybersecurity Executive`, `Founder and Owner`, and other unapproved variants.

### Result

Those titles did not match the owner's sole approved Academy title.

### Impact

The drafts risked misrepresenting the owner's official business role and creating inconsistent business records.

### Correction

The only approved owner title is locked as:

```text
Founder and CEO
```

Machine-readable policy, course-opening code, title cards, lower thirds, scripts, captions, handoff records, certificate attribution, and release gates were corrected.

### Prevention rule

No alternate title or additional title may be added. Resume titles, outside employment titles, military titles, licenses, awards, and advisory roles may not override the sole approved Academy title.

## Failure 21: Employer and resume information was treated as available course attribution

### Action

The owner's resume and professional background were discussed while owner-facing course attribution was being developed.

### Result

There was a risk that current or former employer names, outside titles, or career history could be inserted into course introductions or marketing without explicit authorization.

### Impact

That would violate the owner's direction, create avoidable employer and privacy exposure, and confuse the Obserra EPI business identity.

### Correction

Current and former employer names, employer logos, outside job titles, and employment history are prohibited in all learner-facing Academy materials. The resume is internal grounding only and does not authorize biographical expansion.

### Prevention rule

Use only Dr. Jody Blanchard, Founder and CEO, and the approved Obserra EPI business identity unless a separate, specific owner approval authorizes a distinct biography.

## Failure 22: Registered business identity drift occurred

### Action

Earlier drafts used incomplete organization references and inconsistent website information.

### Result

Standalone `Obserra`, `Obserra Academy`, `OBSERRA ACADEMY`, and inconsistent business-name language appeared in working materials.

### Impact

The drafts did not consistently reflect the registered business identity.

### Correction

The only approved organization references are:

```text
Academy: Obserra EPI Academy
Short business name: Obserra EPI
EPI: Executive Protection & Intelligence
Legal company: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC
Official website: https://www.obserrallc.com
```

The registered logo, names, website, and approved colors are immutable.

### Prevention rule

Do not abbreviate the business to standalone `Obserra`, use another Academy name, use another website, redraw or recolor the logo, or substitute an unapproved palette.

## Failure 23: Deletion and cleanup state was initially described without a full scope distinction

### Action

The incorrect underlying video record was deleted.

### Result

A deleted video record and a still-visible Video Agent project or session card are different provider objects. Treating deletion of one as deletion of both was inaccurate.

### Impact

The owner could still see the remaining `Owner Review Video` card and reasonably conclude that the reported cleanup was false.

### Correction

Current records distinguish:

```text
Incorrect underlying video record: deleted
Incorrect video retrievable: no
Associated project or session card visible in My Projects: yes
Project or session card removed: no
Project or session deletion through connected tools: unavailable
Approved owner source: preserved
```

### Prevention rule

Verify the exact provider object after every destructive action. Never describe partial cleanup as complete.

## Failure 24: Owner-supplied screenshot was misread

### Action

An audit summary interpreted the owner-supplied HeyGen My Projects screenshot as showing only the two approved owner projects and stated that the rejected project had been moved to Trash.

### Result

The screenshot identified by SHA-256 `68316b82e22f922fe27a2019babb64965d9e0d69a8c908c4e5c898f434291d13` actually shows three cards:

1. `Owner Review Video` - rejected wrong-person project - still visible.
2. `Professional man speaking to camera.` - approved owner project.
3. `Confident_Cybersecurity_Leadership` - approved owner project.

No Trash action is visible in that screenshot.

### Impact

The audit record falsely indicated that the visible wrong project had been removed, forcing the owner to correct the same deletion status again.

### Correction

All current-state and audit documents must state that the wrong project or session card remains visible in My Projects. Any local package or record that says only two projects are visible or that the owner moved the project to Trash is superseded and must be replaced.

### Prevention rule

Read screenshots directly and record only visible evidence. Do not infer hidden actions, Trash state, or permanent deletion. Preserve the screenshot hash and describe every visible project card.

## Failure 25: Certificate retained obsolete Academy name and owner title

### Action

The active Academy certificate component was audited.

### Result

It still used `Obserra Academy` and `Founder and Owner` despite the registered Academy name and sole approved owner title.

### Impact

Learner completion records would have contained inconsistent business identity and incorrect owner attribution.

### Correction

The certificate component was corrected to use:

```text
Obserra EPI Academy
Dr. Jody Blanchard
Founder and CEO
OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC
```

### Prevention rule

Identity and brand scans must include certificate templates, completion pages, signature blocks, metadata, accessible labels, and verification text, not only course introductions.

## Current corrective boundary

No new owner video may be generated until the exact approved owner source and voice are selected directly and deterministically. No incorrect or unverified result may be uploaded into LearnWorlds, published, marketed, reused, or made into a template. The `Owner Review Video` project or session card remains visible and quarantined until removed through an authorized supported path.
