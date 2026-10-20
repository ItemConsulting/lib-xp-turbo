import type { Request } from "@enonic-types/core";
import { get as getContext, setCustomLocalAttribute } from "/lib/xp/context";
import { sendToGroup } from "/lib/xp/sse";
import {
  serialize,
  type TurboStreamAction,
  type TurboStreamChangeAction,
  type TurboStreamMorphableAction,
  type TurboStreamRefreshAction,
  type TurboStreamRemoveAction,
} from "./actions";

export * from "./actions";

type TurboStreamsParams<T extends TurboStreamAction> = Omit<T, "action"> & { group?: string };

/**
 * The name of the universal API created by this library
 */
export const API_TURBO_STREAMS = "turbo-streams";

/**
 * Default group that all SSE connections to the "turbo-streams" API are registered to
 */
export const DEFAULT_GROUP_ID = "turbo-streams";

/**
 * Mime type of Turbo Streams, as sent by Turbo in the "Accept" header
 */
export const MIME_TYPE_TURBO_STREAMS = "text/vnd.turbo-stream.html";

/**
 * Content type to use when returning Turbo Streams over HTTP
 */
export const CONTENT_TYPE_TURBO_STREAMS = `${MIME_TYPE_TURBO_STREAMS}; charset=utf-8`;

/**
 * The key for storing a Turbo Stream we want to return as a body
 */
export const CONTEXT_ATTRIBUTE_TURBO_STREAM = "no.item.turbo.stream.body";

/**
 * The key for storing a Turbo Stream we want to return as a body
 */
export const CONTEXT_ATTRIBUTE_TURBO_STREAM_OUT = `custom.${CONTEXT_ATTRIBUTE_TURBO_STREAM}`;

/**
 * Append some markup to a target id in the dom over server-sent events
 */
export function append(params: TurboStreamsParams<TurboStreamChangeAction>): void {
  sendBySSE({
    ...params,
    action: "append",
  });
}

/**
 * Prepend some markup to a target id in the dom over server-sent events
 */
export function prepend(params: TurboStreamsParams<TurboStreamChangeAction>): void {
  sendBySSE({
    ...params,
    action: "prepend",
  });
}

/**
 * Replace some markup at a target id in the dom over server-sent events
 */
export function replace(params: TurboStreamsParams<TurboStreamMorphableAction>): void {
  sendBySSE({
    ...params,
    action: "replace",
  });
}

/**
 * Updates some markup inside a target with the id in the dom over server-sent events
 */
export function update(params: TurboStreamsParams<TurboStreamMorphableAction>): void {
  sendBySSE({
    ...params,
    action: "update",
  });
}

/**
 * Remove an element with a target id from the dom over server-sent events
 */
export function remove(params: TurboStreamsParams<TurboStreamRemoveAction>): void {
  sendBySSE({
    ...params,
    action: "remove",
  });
}

/**
 * Insert some markup before a target id in the dom over server-sent events
 */
export function before(params: TurboStreamsParams<TurboStreamChangeAction>): void {
  sendBySSE({
    ...params,
    action: "before",
  });
}

/**
 * Insert some markup after a target id in the dom over server-sent events
 */
export function after(params: TurboStreamsParams<TurboStreamChangeAction>): void {
  sendBySSE({
    ...params,
    action: "after",
  });
}

/**
 * Initiates a Page Refresh to render new content with morphing.
 */
export function refresh(params: TurboStreamsParams<TurboStreamRefreshAction>): void {
  sendBySSE({
    ...params,
    action: "refresh",
  });
}

export function sendBySSE(params: TurboStreamAction & { group?: string }): void {
  const { group, ...actionParams } = params;

  sendToGroup({
    group: group ?? getUsersPersonalGroupName(),
    message: {
      data: serialize(actionParams),
    },
  });
}

/**
 * Checks the request header if the response can be of mime type "text/vnd.turbo-stream.html"
 */
export function acceptTurboStreams(req: Request): boolean {
  // getHeader() is case-insensitive. HTTP/2 lowercases header names, so `req.headers.Accept` can be undefined.
  return (req.getHeader("Accept") ?? "").indexOf(MIME_TYPE_TURBO_STREAMS) !== -1;
}

/**
 * The HTTP Response will return the actions as a string with mime type text/vnd.turbo-stream.html
 */
export function setTurboStreamHTTPResponse(actions: TurboStreamAction | TurboStreamAction[]): void {
  setCustomLocalAttribute<string>(CONTEXT_ATTRIBUTE_TURBO_STREAM, serialize(actions));
}

/**
 * Returns the Turbo Stream set by `setTurboStreamHTTPResponse()` in this request, and clears it
 */
export function consumeTurboStreamHTTPResponse(): string | undefined {
  const body = getContext<{ [CONTEXT_ATTRIBUTE_TURBO_STREAM_OUT]: string }>().attributes[
    CONTEXT_ATTRIBUTE_TURBO_STREAM_OUT
  ];

  setCustomLocalAttribute(CONTEXT_ATTRIBUTE_TURBO_STREAM, null);
  return body;
}

/**
 * Returns an SSE group name specific for the user, based on the user session number
 */
export function getUsersPersonalGroupName(): string {
  const bean = __.newBean<{
    getId(): string;
  }>("no.item.xp.turbo.SessionBean");
  return `turbo-streams-${bean.getId()}`;
}
