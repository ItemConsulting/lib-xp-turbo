import type { Request, Response, WebSocketEvent } from "@enonic-types/core";
import { DEFAULT_GROUP_ID, getUsersPersonalGroupName } from "/lib/turbo-streams";
import { addToGroup } from "/lib/xp/websocket";

type QueryParams = {
  groupId?: string;
};

type WebSocketResponse<WebSocketData = Record<PropertyKey, never>> = {
  webSocket: {
    data?: WebSocketData;
    subProtocols?: string[];
  };
};

type WebSocketData = {
  usersPersonalGroupName: string;
  groupId?: string;
};

export function get(req: Request<{ params: QueryParams }>): Response | WebSocketResponse<WebSocketData> {
  if (!req.webSocket) {
    return {
      status: 404,
    };
  }

  return {
    webSocket: {
      data: {
        usersPersonalGroupName: getUsersPersonalGroupName(),
        groupId: req.params.groupId,
      },
    },
  };
}

export function webSocketEvent(event: WebSocketEvent<WebSocketData>): void {
  if (event.type === "open") {
    addToGroup(event.data.usersPersonalGroupName, event.session.id);
    addToGroup(DEFAULT_GROUP_ID, event.session.id);

    if (event.data.groupId) {
      addToGroup(event.data.groupId, event.session.id);
    }
  }
}
