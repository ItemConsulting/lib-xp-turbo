import {XOR} from "enonic-types/types";

const websocketLib = __non_webpack_require__('/lib/xp/websocket');
const portalLib = __non_webpack_require__('/lib/xp/portal');

export const DEFAULT_GROUP_ID = "turbo-streams"

/**
 * Append some markup to a target id in the dom
 */
export function append(params: TurboStreamsUpdateParams) {
  dispatch(params, createMessage(params, "append"));
}

/**
 * Prepend some markup to a target id in the dom
 */
export function prepend(params: TurboStreamsUpdateParams) {
  dispatch(params, createMessage(params, "prepend"));
}

/**
 * Replace some markup at a target id in the dom
 */
export function replace(params: TurboStreamsUpdateParams) {
  dispatch(params, createMessage(params, "replace"));
}

/**
 * Remove an element with a target id from the dom
 */
export function remove(params: TurboStreamsRemoveParams) {
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

function dispatch(params: TurboStreamsUpdateParams | TurboStreamsRemoveParams, content: string) {
  const groupId = params.groupId ?? getUsersPersonalGroupName();

  if (isSingleMessage(params)) {
    websocketLib.send(params.socketId, content);
  } else {
    websocketLib.sendToGroup(groupId, content);
  }
}

function createMessage(params: TurboStreamsUpdateParams, action: Action) {
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
  const bean = __.newBean('no.item.xp.session.SessionBean');
  return bean.getId();
}

type Action =
  | 'append'
  | 'prepend'
  | 'replace'
  | 'remove';

interface BySocketId {
  /**
   * The web socket id to send to.
   * Default value is socket id stored on user session by websocket service
   */
  socketId: string;
}

interface ByGroupId {
  /**
   * A group of web socket connections to send content to
   */
  groupId?: string;
}

type Id = XOR<BySocketId, ByGroupId>;

export type TurboStreamsUpdateParams = {
  /**
   * Dom ID to update
   */
  target: string;

  /**
   * The new content to insert into the dom
   */
  content: string;
} & Id

export type TurboStreamsRemoveParams = {
  /**
   * Dom ID to update
   */
  target: string;
} & Id

export interface GetTurboStreamPageContributionParams {
  readonly service: string;
}
