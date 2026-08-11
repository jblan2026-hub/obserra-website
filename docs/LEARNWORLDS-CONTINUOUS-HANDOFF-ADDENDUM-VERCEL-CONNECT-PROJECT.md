# LearnWorlds Continuous Handoff Addendum: Vercel Connect Resource Correction

**Date:** 2026-08-11  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Production cutover:** Not authorized  
**Status:** Supersedes the earlier instruction to connect a project on this screen

## Evidence supplied by owner

The owner supplied screenshots of a Vercel resource named `obserra-website-live` whose identifier begins with:

```text
api.openai.com/obserra-website-live
```

The screen includes:

```text
Projects
No projects connected yet
Token APIs
getToken('api.openai.com/obserra-website-live', ...)
Default API Key
```

The owner also showed the actual Vercel project under the Obserra team and reported that it did not appear in the resource's `Connect Project` picker.

## Correct finding

This screen is a **Vercel Connect API resource** used by Vercel projects to obtain tokens for an external API. It is not the ChatGPT Vercel MCP/OAuth project-authorization screen.

Connecting `obserra-website-live` to this resource would authorize that Vercel project to call the configured external API from its build or runtime. It would not grant ChatGPT access to the Vercel project and is not required for the LearnWorlds commercial pipeline.

The project not appearing in the picker is consistent with a Vercel scope or team mismatch between the Connect resource and the actual project, but that mismatch does not need to be repaired for this work.

## Recorded failure

**Failure:** The prior guidance incorrectly treated the Vercel Connect resource as the mechanism for granting ChatGPT project access.

**Impact:** The owner was directed toward an unrelated project-connection workflow and could not find the project in the list.

**Root cause:** Two separate Vercel concepts were conflated:

1. Vercel Connect resources that issue runtime tokens to projects.
2. The Vercel MCP/OAuth app that allows ChatGPT to inspect Vercel projects and deployments.

## Correction

1. Do not connect any project on the `api.openai.com/obserra-website-live` resource for this LearnWorlds setup.
2. Do not reveal, copy, regenerate, or test the Default API Key shown on that page.
3. Leave the resource unchanged unless a separately approved OpenAI runtime integration requires it.
4. Continue the LearnWorlds implementation through the governed GitHub branch, pull-request CI, and the repository's existing Git-to-Vercel deployment integration.
5. Treat direct ChatGPT Vercel project access as optional. Current connector tests still return zero projects and a 404 for `obserra-website-live`.

## Prevention rule

Before directing an owner to link a project, verify the Vercel resource type, URL namespace, and stated purpose. A `Token APIs` screen using `@vercel/connect` is not proof of ChatGPT MCP authorization.

## Current operational path

```text
GitHub branch feature/learnworlds-commercial-pipeline
-> Pull request #55
-> GitHub CI
-> Existing Vercel Git preview deployment
-> LearnWorlds sandbox acceptance test
```

No production cutover, live checkout, or pull-request merge is authorized until the complete LearnWorlds canary acceptance test passes.