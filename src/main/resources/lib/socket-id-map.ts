type SocketIdMap = Record<string, Array<string>>;

const socketIdMap: SocketIdMap = {}

export function addSocketId(sessionId: string, socketId: string) {
  const arr = socketIdMap[sessionId] ?? [];

  if (arr.indexOf(socketId) === -1) {
    arr.push(socketId);
  }

  socketIdMap[sessionId] = arr;
}

export function removeSocketId(sessionId: string, socketId: string) {
  socketIdMap[sessionId] = (socketIdMap[sessionId] ?? [])
    .filter(id => id !== socketId);

  if (socketIdMap[sessionId].length === 0) {
    delete socketIdMap[sessionId];
  }
}

export function getSocketIds(sessionId: string): Array<string> {
  logSocketIdMap();
  log.info("Damn sessionId " + sessionId);
  return socketIdMap[sessionId] ?? [];
}

export function logSocketIdMap() {
  log.info(JSON.stringify(socketIdMap, null, 2));
}
