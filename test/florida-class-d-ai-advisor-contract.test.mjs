import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("Florida Class D AI advisor is authenticated, grounded, reasoning-enabled, voice-capable, and non-authoritative", () => {
  const advisor = read("lib/florida-class-d-ai-advisor.ts");
  const route = read("app/api/florida-class-d/live/advisor/route.ts");
  const panel = read("app/florida-security-training/live/[liveSessionId]/AiAdvisorPanel.tsx");
  const classroom = read("app/florida-security-training/live/[liveSessionId]/LiveClassroom.tsx");

  assert.match(route, /requireFloridaClassDSignedInUser/);
  assert.match(route, /getFloridaClassDLiveStudentState/);
  assert.match(route, /getFloridaClassDActiveTextScreen/);
  assert.match(route, /same-origin/i);
  assert.match(route, /application\/json/);
  assert.match(route, /cache-control/);
  assert.match(route, /private, no-store/);
  assert.match(route, /question\.length/);
  assert.match(route, /voice/);

  assert.match(advisor, /https:\/\/api\.openai\.com\/v1\/responses/);
  assert.match(advisor, /reasoning/);
  assert.match(advisor, /effort:\s*"medium"/);
  assert.match(advisor, /store:\s*false/);
  assert.match(advisor, /gpt-5\.1/);
  assert.match(advisor, /https:\/\/api\.openai\.com\/v1\/audio\/speech/);
  assert.match(advisor, /gpt-4o-mini-tts/);
  assert.match(advisor, /voice:\s*"marin"/);
  assert.match(advisor, /instructions/);
  assert.match(advisor, /assessment/i);
  assert.match(advisor, /does not award|cannot award|never awards/i);
  assert.match(advisor, /attendance/i);
  assert.match(advisor, /credit/i);
  assert.match(advisor, /correlationId/);
  assert.doesNotMatch(advisor, /NEXT_PUBLIC_OPENAI/);

  assert.match(panel, /AI Advisor/);
  assert.match(panel, /aria-live/);
  assert.match(panel, /Voice/);
  assert.match(panel, /AbortController/);
  assert.match(panel, /URL\.revokeObjectURL/);
  assert.match(panel, /maxLength/);
  assert.match(classroom, /AiAdvisorPanel/);
});
