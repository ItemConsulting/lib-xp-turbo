import {
  DEFAULT_GROUP_ID,
  getUsersPersonalGroupName,
} from "../../lib/turbo-streams";
import { addToGroup } from "/lib/xp/websocket";

export function get(
  req: XP.Request
): XP.Response | XP.WebSocketResponse<WebSocketData> {
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

export function webSocketEvent(event: XP.WebSocketEvent<WebSocketData>): void {
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
