import { sendByWebSocket, type SendByWebSocketTarget } from "./websockets";
import { serialize, type TurboStreamRemoveAction, type TurboStreamChangeAction, TurboStreamAction } from "./actions";
import type { Request, Response } from "@item-enonic-types/global/controller";

/**
 * Default group that all websocket connections in the "turbo-stream" service is registered to
 */
export const DEFAULT_GROUP_ID = "turbo-streams";

/**
 * Mime type to use when returning Turbo Streams over HTTP
 */
export const MIME_TYPE_TURBO_STREAMS = "text/vnd.turbo-stream.html; charset=utf-8";

/**
 * A header field that can be temporarily used to send a payload to the "turbo-streams" processor
 */
export const HEADER_KEY_TURBO = "x-turbo";

/**
 * Append some markup to a target id in the dom over web socket
 */
export function append(params: TurboStreamsParams): void {
  sendByWebSocket(
    params,
    serialize({
      action: "append",
      content: params.content,
      target: params.target,
      targets: params.targets,
    }),
  );
}

/**
 * Prepend some markup to a target id in the dom over web socket
 */
export function prepend(params: TurboStreamsParams): void {
  sendByWebSocket(
    params,
    serialize({
      action: "prepend",
      content: params.content,
      target: params.target,
      targets: params.targets,
    }),
  );
}

/**
 * Replace some markup at a target id in the dom over web socket
 */
export function replace(params: TurboStreamsParams): void {
  sendByWebSocket(
    params,
    serialize({
      action: "replace",
      content: params.content,
      target: params.target,
      targets: params.targets,
    }),
  );
}

/**
 * Updates some markup inside a target with the id in the dom over web socket
 */
export function update(params: TurboStreamsParams): void {
  sendByWebSocket(
    params,
    serialize({
      action: "update",
      content: params.content,
      target: params.target,
      targets: params.targets,
    }),
  );
}

/**
 * Remove an element with a target id from the dom over web socket
 */
export function remove(params: TurboStreamsRemoveParams): void {
  sendByWebSocket(
    params,
    serialize({
      action: "remove",
      target: params.target,
      targets: params.targets,
    }),
  );
}

/**
 * Insert some markup before a target id in the dom over web socket
 */
export function before(params: TurboStreamsParams): void {
  sendByWebSocket(
    params,
    serialize({
      action: "before",
      content: params.content,
      target: params.target,
      targets: params.targets,
    }),
  );
}

/**
 * Insert some markup after a target id in the dom over web socket
 */
export function after(params: TurboStreamsParams): void {
  sendByWebSocket(
    params,
    serialize({
      action: "after",
      content: params.content,
      target: params.target,
      targets: params.targets,
    }),
  );
}

/**
 * Checks the request header if the response can be of mime type "text/vnd.turbo-stream.html"
 */
export function acceptTurboStreams(req: Request): boolean {
  return req.headers["Accept"]?.indexOf(MIME_TYPE_TURBO_STREAMS) !== -1;
}

/**
 * Creates a response for a part that can be processed by the "turbo-streams" processor
 */
export function createTurboStreamResponse(actions: TurboStreamAction | Array<TurboStreamAction>): Response {
  return {
    headers: {
      [HEADER_KEY_TURBO]: serialize(actions),
    },
  };
}

/**
 * Parameters for "append", "prepend" and "replace". It takes either "socketId" or "groupId".
 *
 * If neither is specified it falls back to the default group. The default group has a name based on the session
 * key from the request. If the "turbo-streams"-service was used this is the group registered with the web socket.
 */
export type TurboStreamsParams = Omit<TurboStreamChangeAction, "action"> & SendByWebSocketTarget;

/**
 * Parameters for "remove". It takes either "socketId" or "groupId".
 *
 * If neither is specified it falls back to the default group. The default group has a name based on the session
 * key from the request. If the "turbo-streams"-service was used this is the group registered with the web socket.
 */
export type TurboStreamsRemoveParams = Omit<TurboStreamRemoveAction, "action"> & SendByWebSocketTarget;

export * from "./actions";
export { getUsersPersonalGroupName, getWebSocketUrl, SERVICE_NAME_TURBO_STREAMS } from "./websockets";
