# LearnWorlds Continuous Handoff Addendum: Vercel Authorization Retest

**Date:** 2026-08-11  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Production cutover:** Not authorized

## Owner request

The owner asked ChatGPT to retest Vercel project access after attempting to correct the Vercel app authorization.

## Actions performed

1. Queried the connected Vercel app for projects under the Obserra team ID `team_xpUE1GefY2JHuFFCqbAdnZAj`.
2. Queried the connected Vercel app directly for project slug `obserra-website-live` under the same team.

## Results

```text
Obserra team visible: yes
Projects returned: 0
Direct project lookup: 404 Not Found
Project-level Vercel authority: not established
```

## Finding

The attempted authorization change did not grant the connected Vercel app access to `obserra-website-live`. The app can identify the Obserra team but cannot enumerate or retrieve any project in that team.

## Operational decision

This connector limitation does not block continued repository development. The LearnWorlds integration will continue through the governed GitHub branch, pull-request CI, and Vercel's existing Git deployment integration. Direct Vercel connector management remains unavailable until project scope is corrected.

## Prevention rule

Do not claim Vercel project access based on the app capability screen or team discovery alone. Project authority requires both a nonempty `list_projects` result and a successful `get_project` result.
