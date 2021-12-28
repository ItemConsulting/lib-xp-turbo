import { sendByWebSocket, type SendByWebSocketTarget } from "./websockets";
import {
  serialize,
  type TurboStreamRemoveAction,
  type TurboStreamChangeAction,
} from "./actions";

/**
 * Default group that all websocket connections in the "turbo-stream" service is registered to
 */
export const DEFAULT_GROUP_ID = "turbo-streams";

/**
 * Mime type to use when returning Turbo Streams over HTTP
 */
export const MIME_TYPE_TURBO_STREAMS = "text/vnd.turbo-stream.html";

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
    })
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
    })
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
    })
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
    })
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
    })
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
    })
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
    })
  );
}

/**
 * Checks the request header if the response can be of mime type "text/vnd.turbo-stream.html"
 */
export function acceptTurboStreams(req: XP.Request): boolean {
  return req.headers["Accept"]?.indexOf(MIME_TYPE_TURBO_STREAMS) !== -1;
}

/**
 * Parameters for "append", "prepend" and "replace". It takes either "socketId" or "groupId".
 *
 * If neither is specified it falls back to the default group. The default group has a name based on the session
 * key from the request. If the "turbo-streams"-service was used this is the group registered with the web socket.
 */
export type TurboStreamsParams = Omit<TurboStreamChangeAction, "action"> &
  SendByWebSocketTarget;

/**
 * Parameters for "remove". It takes either "socketId" or "groupId".
 *
 * If neither is specified it falls back to the default group. The default group has a name based on the session
 * key from the request. If the "turbo-streams"-service was used this is the group registered with the web socket.
 */
export type TurboStreamsRemoveParams = Omit<TurboStreamRemoveAction, "action"> &
  SendByWebSocketTarget;

export * from "./actions";
export {
  getUsersPersonalGroupName,
  getWebSocketUrl,
  GetWebSocketUrlParams,
} from "./websockets";
