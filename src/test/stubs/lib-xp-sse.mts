// Stub for "/lib/xp/sse". The real module is Java-backed and has no Node implementation, so the tests get
// mocks that record their calls.
import { mock } from "node:test";
import type { AddToGroupParams, SendToGroupParams } from "@enonic-types/lib-sse";

export const addToGroup = mock.fn((_params: AddToGroupParams): void => undefined);
export const sendToGroup = mock.fn((_params: SendToGroupParams): void => undefined);
