import {Request, Response, WebSocketEvent} from "enonic-types/controller";
import {DEFAULT_GROUP_ID, getUsersPersonalGroupName} from "../../lib/turbo-streams";

const {addToGroup} = __non_webpack_require__('/lib/xp/websocket');

interface WithSessionId {
  usersPersonalGroupName: string;
}

export function get(req: Request): Response {
  if (!req.webSocket) {
    return {
      status: 404
    };
  }

  return {
    webSocket: {
      data: {
        usersPersonalGroupName: getUsersPersonalGroupName()
      }
    }
  };
}

export function webSocketEvent(event: WebSocketEvent<WithSessionId>): void {
  if (event.type == 'open') {
    addToGroup(event.data.usersPersonalGroupName, event.session.id);
    addToGroup(DEFAULT_GROUP_ID, event.session.id);
  }
}

