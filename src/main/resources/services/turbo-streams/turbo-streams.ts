import {Request, Response, WebSocketEvent} from "enonic-types/controller";
import {DEFAULT_GROUP_ID, getUsersPersonalGroupName} from "../../lib/turbo-streams";

const sessionLib = __non_webpack_require__('/lib/session');
const {addToGroup,removeFromGroup} = __non_webpack_require__('/lib/xp/websocket');

interface WithSessionId {
  sessionId: string;
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
        sessionId: sessionLib.getId()
      }
    }
  };
}

export function webSocketEvent(event: WebSocketEvent<WithSessionId>): void {
  const usersPersonalGroupName = getUsersPersonalGroupName(event.data.sessionId);

  if (event.type == 'open') {
    addToGroup(usersPersonalGroupName, event.session.id);
    addToGroup(DEFAULT_GROUP_ID, event.session.id);
  } else if (event.type == 'close') {
    removeFromGroup(usersPersonalGroupName, event.session.id);
    removeFromGroup(DEFAULT_GROUP_ID, event.session.id);
  }
}

