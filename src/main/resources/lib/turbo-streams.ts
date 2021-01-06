import {XOR} from "enonic-types/types";
import {getSocketIds} from "./socket-id-map";

const websocketLib = __non_webpack_require__('/lib/xp/websocket');
const sessionLib = __non_webpack_require__('/lib/session');
const portalLib = __non_webpack_require__('/lib/xp/portal');

export const DEFAULT_GROUP_ID = "turbo-streams"

export function append(params: TurboStreamsUpdateParams) {
  dispatch(params, createMessage(params, "append"));
}

export function prepend(params: TurboStreamsUpdateParams) {
  dispatch(params, createMessage(params, "prepend"));
}

export function replace(params: TurboStreamsUpdateParams) {
  dispatch(params, createMessage(params, "replace"));
}

export function remove(params: TurboStreamsRemoveParams) {
  dispatch(params, `<turbo-stream action="remove" target="${params.target}"></turbo-stream>`);
}

export function getTurboStreamPageContribution(service: string = "turbo-streams"): Array<string> {
  const url = portalLib.serviceUrl({
    service: service,
    type: "absolute"
  })
    .replace("http://", "ws://")
    .replace("https://", "wss://");

  return [`<script>
    Turbo.connectStreamSource(new WebSocket("${url}"));
  </script>`];
}

function dispatch(params: TurboStreamsUpdateParams | TurboStreamsRemoveParams, content: string) {
  if (isGroupMessage(params)) {
    websocketLib.sendToGroup(params.groupId, content);
  } else {
    const userSocketId = params.socketId ?? getSocketIds(sessionLib.getId())[0];

    if (userSocketId) {
      websocketLib.send(userSocketId, content);
    } else {
      log.error("Turbo Streams is missing socket id")
    }
  }
}

function createMessage(params: TurboStreamsUpdateParams, action: Action) {
  return `<turbo-stream action="${action}" target="${params.target}">
      <template>
        ${params.content}
      </template>
    </turbo-stream>`
}

function isGroupMessage(params: unknown): params is ByGroupId {
  return (params as ByGroupId).groupId !== undefined;
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
  socketId?: string;
}

interface ByGroupId {
  /**
   * A group of web socket connections to send content to
   */
  groupId: string;
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
