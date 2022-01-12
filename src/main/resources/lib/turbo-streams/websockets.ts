import { type XOR } from "enonic-types/types";
import { serviceUrl, type ServiceUrlParams } from "/lib/xp/portal";
import { send, sendToGroup } from "/lib/xp/websocket";

/**
 * Returns a websocket group name specific for the user, based on the user session number
 */
export function getUsersPersonalGroupName(): string {
  const bean = __.newBean("no.item.xp.turbo.SessionBean");
  return `turbo-streams-${bean.getId()}`;
}

/**
 * Returns a url to a service, but using the web socket protocols
 */
export function getWebSocketUrl(params: GetWebSocketUrlParams = {}): string {
  return serviceUrl({
    service: params.service ?? "turbo-streams",
    type: params.type ?? "absolute",
    params: params.params,
    application: params.application,
  })
    .replace("http://", "ws://")
    .replace("https://", "wss://");
}

/**
 * Sends some content over web socket, either based on `socketId` or `groupId`.
 */
export function sendByWebSocket(
  params: SendByWebSocketTarget,
  content: string
): void {
  if (isSingleMessage(params)) {
    send(params.socketId, content);
  } else {
    const groupId = params.groupId ?? getUsersPersonalGroupName();
    sendToGroup(groupId, content);
  }
}

function isSingleMessage(params: unknown): params is BySocketId {
  return (params as BySocketId).socketId !== undefined;
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
 * Object with either "socketId" or "groupId" parameter
 */
export type SendByWebSocketTarget = XOR<BySocketId, ByGroupId>;

/**
 * Params for configuring web socket urls
 */
export type GetWebSocketUrlParams = Omit<
  Partial<ServiceUrlParams>,
  "params"
> & {
  params?: {
    groupId?: string;
  };
};
