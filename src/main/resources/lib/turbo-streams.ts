import {XOR} from "enonic-types/types";

const websocketLib = __non_webpack_require__('/lib/xp/websocket');
const portalLib = __non_webpack_require__('/lib/xp/portal');

export const DEFAULT_GROUP_ID = "turbo-streams"

/**
 * Append some markup to a target id in the dom
 */
export function append(params: TurboStreamsParams) {
  dispatch(params, createMessage(params, "append"));
}

/**
 * Prepend some markup to a target id in the dom
 */
export function prepend(params: TurboStreamsParams) {
  dispatch(params, createMessage(params, "prepend"));
}

/**
 * Replace some markup at a target id in the dom
 */
export function replace(params: TurboStreamsParams) {
  dispatch(params, createMessage(params, "replace"));
}

/**
 * Remove an element with a target id from the dom
 */
export function remove(params: TurboStreamsParamsWithoutContent) {
  dispatch(params, `<turbo-stream action="remove" target="${params.target}"></turbo-stream>`);
}

/**
 * Returns a page contribution that initializes the turbo stream frontend connecting it to the "turbo-streams" service,
 * or another service specified by the developer.
 */
export function getTurboStreamPageContribution(
  params: GetTurboStreamPageContributionParams = { service: "turbo-streams" }
): Array<string> {
  const url = portalLib.serviceUrl({
    service: params.service,
    type: "absolute"
  })
    .replace("http://", "ws://")
    .replace("https://", "wss://");

  return [`<script>
    Turbo.connectStreamSource(new WebSocket("${url}"));
  </script>`];
}

export function getUsersPersonalGroupName(): string {
  return `turbo-streams-${getSessionId()}`;
}

function dispatch(params: TurboStreamsParamsWithoutContent, content: string) {
  const groupId = params.groupId ?? getUsersPersonalGroupName();

  if (isSingleMessage(params)) {
    websocketLib.send(params.socketId, content);
  } else {
    websocketLib.sendToGroup(groupId, content);
  }
}

function createMessage(params: TurboStreamsParams, action: 'append' | 'prepend' | 'replace') {
  return `<turbo-stream action="${action}" target="${params.target}">
      <template>
        ${params.content}
      </template>
    </turbo-stream>`;
}

function isSingleMessage(params: unknown): params is BySocketId {
  return (params as BySocketId).socketId !== undefined;
}

function getSessionId(): string | null {
  const bean = __.newBean('no.item.xp.turbo.SessionBean');
  return bean.getId();
}

/**
 * Send message trough a socket specified by a socket id
 */
interface BySocketId {
  /**
   * The web socket id to send to.
   * Default value is socket id stored on user session by websocket service
   */
  readonly socketId: string;
}

/**
 * Send message trough a group of sockets specified by the group id
 */
interface ByGroupId {
  /**
   * A group of web socket connections to send content to
   */
  readonly groupId?: string;
}

/**
 * Parameters for "append", "prepend" and "replace". It takes either "socketId" or "groupId".
 *
 * If neither is specified it falls back to the default group. The default group has a name based on the session
 * key from the request. If the "turbo-streams"-service was used this is the group registered with the web socket.
 */
export type TurboStreamsParams = {
  /**
   * Dom ID to update
   */
  readonly target: string;

  /**
   * The new content to insert into the dom
   */
  readonly content: string;
} & XOR<BySocketId, ByGroupId>;

/**
 * Parameters for the "remove" action. It is the same as for the other actions, but without the "content" property.
 */
export type TurboStreamsParamsWithoutContent = Omit<TurboStreamsParams, "content">;

/**
 * Params for configuring page contributions
 */
export interface GetTurboStreamPageContributionParams {
  readonly service: string;
}
