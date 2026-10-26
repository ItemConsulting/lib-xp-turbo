import type { Request, Response, SseEvent } from "@enonic-types/core";
import { DEFAULT_GROUP_ID, getUsersPersonalGroupName } from "/lib/turbo-streams";
import { addToGroup } from "/lib/xp/sse";

export type SSEQueryParams = {
  group?: string | string[];
};

type SSEResponse<Attributes = Record<PropertyKey, never>> = {
  sse: {
    attributes?: Attributes;
    retry?: number;
    timeout?: number;
  };
};

type SSEAttributes = {
  usersPersonalGroupName: string;
  group?: string;
};

const MIME_TYPE_EVENT_STREAM = "text/event-stream";

export function GET(req: Request<{ params: SSEQueryParams }>): Response | SSEResponse<SSEAttributes> {
  if (!acceptsEventStream(req)) {
    return {
      status: 406,
    };
  }

  const group = firstValue(req.params.group);

  // XP fails the request if an SSE attribute is undefined, so only set group when given
  return {
    sse: {
      attributes: {
        usersPersonalGroupName: getUsersPersonalGroupName(),
        ...(group ? { group } : {}),
      },
    },
  };
}

/**
 * Called by Enonic XP. Groups are joined on "open" event.
 */
export function sseEvent(event: SseEvent<SSEAttributes>): void {
  if (event.type === "open" && event.attributes) {
    addToGroup({
      group: event.attributes.usersPersonalGroupName,
      clientId: event.clientId,
    });

    addToGroup({
      group: DEFAULT_GROUP_ID,
      clientId: event.clientId,
    });

    if (event.attributes.group) {
      addToGroup({
        group: event.attributes.group,
        clientId: event.clientId,
      });
    }
  }
}

/**
 * EventSource sends "Accept: text/event-stream". getHeader() is case-insensitive,
 * which matters since HTTP/2 lowercases header names.
 */
function acceptsEventStream(req: Request): boolean {
  return (req.getHeader("Accept") ?? "").indexOf(MIME_TYPE_EVENT_STREAM) !== -1;
}

/**
 * XP gives a repeated query parameter as an array. Use the first value.
 */
function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
