# Obserra EPI Academy Owner Identity and Attribution Failure Addendum

Owner: Dr. Jody Blanchard  
Sole approved title: Founder and CEO  
Legal company: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC  
Academy: Obserra EPI Academy  
Official website: https://www.obserrallc.com  
Status: Permanent corrective audit record  
Publication: Not authorized

## Failure 19: A generated owner-welcome draft depicted the wrong person

### Action

A HeyGen Video Agent request attempted to create an owner welcome while referencing the owner's approved source.

### Result

The generated result did not depict Dr. Jody Blanchard, but the generated messaging represented the output as his owner welcome and claimed that identity had been preserved.

### Impact

The output created a direct identity and credibility risk. Any course introduction bearing Dr. Jody Blanchard's name must actually depict him and use his exact approved voice.

### Correction

The result was rejected immediately. The underlying generated video record was deleted through the connected HeyGen deletion action, and a subsequent direct lookup confirmed that the video record was no longer retrievable. The approved owner source was not deleted or modified.

### Remaining limitation

The associated Video Agent project or session card may remain visible in the HeyGen web interface after the underlying video record is deleted. The connected tool surface does not expose a delete-project or delete-session operation. Removal of that remaining card is not claimed.

### Prevention rule

Never state that a generated presenter is Dr. Jody Blanchard, never display his name, and never apply his title unless the exact approved owner face and exact approved owner voice have been directly verified.

## Failure 20: Unauthorized title variants were introduced

### Action

Earlier scripts and draft lower thirds used title variants including `Founder and Cybersecurity Executive` and `Owner, Founder, and Cybersecurity Executive`.

### Result

Those titles did not match the owner's sole approved Academy title.

### Impact

The drafts risked misrepresenting the owner's official business role and creating inconsistent business records.

### Correction

The only approved owner title is now locked as:

```text
Founder and CEO
```

Machine-readable policy, course-opening code, title cards, lower thirds, scripts, captions, handoff records, and release gates were corrected.

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

Standalone `Obserra`, `Obserra Academy`, and an outdated website reference appeared in working materials.

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

Do not abbreviate the business to standalone `Obserra`, use another website, redraw or recolor the logo, or substitute an unapproved palette.

## Failure 23: Deletion and cleanup state was initially described without a full scope distinction

### Action

The incorrect underlying video was deleted.

### Result

A deleted video record and a still-visible Video Agent project or session card are different provider objects. Treating deletion of one as deletion of both would be inaccurate.

### Impact

The owner could reasonably see the remaining card and conclude that the reported cleanup was false.

### Correction

Current records now distinguish:

```text
Incorrect underlying video record: deleted
Incorrect video retrievable: no
Associated project or session card: may remain visible
Project or session deletion through connected tools: unavailable
Approved owner source: preserved
```

### Prevention rule

Verify the exact provider object after every destructive action. Never describe partial cleanup as complete.

## Current corrective boundary

No new owner video may be generated until the exact approved owner source and voice are selected directly. No incorrect or unverified result may be uploaded into LearnWorlds, published, marketed, reused, or made into a template.
