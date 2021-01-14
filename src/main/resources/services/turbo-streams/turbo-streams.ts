import {HttpResponse, Request, WebSocketEvent, WebSocketResponse} from "enonic-types/controller";
import {DEFAULT_GROUP_ID, getUsersPersonalGroupName} from "../../lib/turbo-streams";

const {addToGroup} = __non_webpack_require__('/lib/xp/websocket');

export function get(req: Request): HttpResponse | WebSocketResponse<WebSocketData> {
  if (!req.webSocket) {
    return {
      status: 404
    };
  }

  return {
    webSocket: {
      data: {
        usersPersonalGroupName: getUsersPersonalGroupName(),
        groupId: req.params.groupId
      }
    }
  };
}

export function webSocketEvent(event: WebSocketEvent<WebSocketData>): void {
  if (event.type == 'open') {
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


