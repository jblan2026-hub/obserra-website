import "server-only";

import { floridaClassDServerDailyRequest } from "./florida-class-d-daily-provider";
import {
  createFloridaClassDOwnerPreviewDailySession,
  deleteFloridaClassDOwnerPreviewDailyRoom,
} from "./florida-class-d-owner-preview-daily";

export function provisionFloridaClassDOwnerPreviewDailySession(releaseSha: string) {
  return createFloridaClassDOwnerPreviewDailySession({
    request: floridaClassDServerDailyRequest,
    releaseSha,
  });
}

export function cleanupFloridaClassDOwnerPreviewDailyRoom(
  roomName: string,
  releaseSha: string,
) {
  return deleteFloridaClassDOwnerPreviewDailyRoom({
    request: floridaClassDServerDailyRequest,
    roomName,
    releaseSha,
  });
}
