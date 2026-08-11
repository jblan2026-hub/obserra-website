# LearnWorlds Continuous Handoff Addendum: OpenAI Linked to Website Project in Vercel

**Date:** 2026-08-11  
**Repository:** `jblan2026-hub/obserra-website`  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Production cutover:** Not authorized

## Owner-reported action

The owner confirmed that the OpenAI Vercel Connect resource was linked to the `obserra-website-live` project inside Vercel.

## Correct interpretation

This linkage authorizes the Vercel project to obtain governed runtime access to the configured OpenAI resource through Vercel Connect. It does not grant the ChatGPT Vercel connector permission to enumerate or administer the Vercel project.

The linkage may support future website runtime features that call OpenAI through Vercel Connect. It is not a substitute for LearnWorlds course content, LearnWorlds API authorization, or the course-production acceptance gates.

## Connector retest performed after owner confirmation

```text
Obserra team visible: yes
Team ID: team_xpUE1GefY2JHuFFCqbAdnZAj
list_projects result: 0 projects
get_project(obserra-website-live): 404 Not Found
Direct ChatGPT Vercel project authority: not established
```

## Operational decision

1. Preserve the OpenAI-to-project link in Vercel.
2. Do not expose, copy, regenerate, or place the Vercel Connect API key in chat or GitHub.
3. Do not spend additional owner time trying to make the ChatGPT Vercel connector list the project.
4. Continue implementation through GitHub branch changes, pull-request CI, and the existing Git-to-Vercel deployment path.
5. Treat direct Vercel project administration from ChatGPT as optional and currently unavailable.

## Current first incomplete action

Build and load the complete Cybersecurity Foundations instructional course into LearnWorlds. The working checkout, Sandbox purchase, invoice, learner entitlement, and OpenAI project linkage do not change the fact that the LearnWorlds course is currently an empty shell.

## Prevention rule

Keep these authorization concepts separate:

1. **Vercel Connect resource linkage:** permits a Vercel project to call an external API at runtime.
2. **Vercel Git integration:** deploys repository changes to Vercel.
3. **ChatGPT Vercel connector authorization:** permits this chat to inspect or manage Vercel projects.
4. **LearnWorlds API authorization:** permits supported LMS operations through LearnWorlds credentials.

No one mechanism should be represented as granting the authority of another.