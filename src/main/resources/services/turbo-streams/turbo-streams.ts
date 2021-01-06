import {Request, Response, WebSocketEvent} from "enonic-types/controller";
import {addSocketId, logSocketIdMap, removeSocketId} from "../../lib/socket-id-map";
import {DEFAULT_GROUP_ID} from "../../lib/turbo-streams";

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
  if (event.type == 'open') {
    addSocketId(event.data.sessionId, event.session.id);
    addToGroup(DEFAULT_GROUP_ID, event.session.id);
  } else if (event.type == 'close') {
    removeSocketId(event.data.sessionId, event.session.id);
    removeFromGroup(DEFAULT_GROUP_ID, event.session.id);
  }
}
