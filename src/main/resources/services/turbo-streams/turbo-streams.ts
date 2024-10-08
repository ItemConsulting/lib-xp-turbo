import { DEFAULT_GROUP_ID, getUsersPersonalGroupName } from "../../lib/turbo-streams";
import { addToGroup } from "/lib/xp/websocket";
import type { Request, Response, WebSocketEvent } from "@item-enonic-types/global/controller";

interface WebSocketResponse<WebSocketData = Record<PropertyKey, never>> {
  webSocket: {
    data?: WebSocketData;
    subProtocols?: ReadonlyArray<string>;
  };
}

export function get(req: Request): Response | WebSocketResponse<WebSocketData> {
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
  if (event.type == "open") {
    addToGroup(event.data.usersPersonalGroupName, event.session.id);
    addToGroup(DEFAULT_GROUP_ID, event.session.id);

    if (event.data.groupId) {
      addToGroup(event.data.groupId, event.session.id);
    }
  }
}

interface WebSocketData {
  usersPersonalGroupName: string;
  groupId?: string;
}
