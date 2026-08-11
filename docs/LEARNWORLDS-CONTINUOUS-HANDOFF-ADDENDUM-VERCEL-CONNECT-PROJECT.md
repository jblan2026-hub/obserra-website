# LearnWorlds Continuous Handoff Addendum: Vercel Project Connection Required

**Date:** 2026-08-11  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Production cutover:** Not authorized

## Evidence supplied by owner

The owner supplied a screenshot of the Vercel connector resource named `obserra-website-live`. The screen states:

```text
No projects connected yet
Connect projects so they can call this connector's APIs from their builds and runtime.
```

A visible `Connect Project` button is present.

## Finding

The connector resource exists, but no Vercel project is linked to it. This directly explains why the ChatGPT Vercel connector can discover the Obserra team but returns zero projects and cannot retrieve `obserra-website-live`.

## Required owner action

1. Click `Connect Project` on the screen shown.
2. Select the Vercel project `obserra-website-live`.
3. Confirm or save the connection.
4. Return to ChatGPT and request another access test.

## Security note

Do not reveal or copy the Default API Key into chat. Project linking should be completed through the Vercel user interface.

## Acceptance evidence

Project authorization is established only when the connected Vercel app returns a nonempty project list and successfully retrieves `obserra-website-live` by project name or ID.