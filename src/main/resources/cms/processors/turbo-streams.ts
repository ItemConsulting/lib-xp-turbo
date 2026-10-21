import type { Request, Response } from "@enonic-types/core";
import { CONTENT_TYPE_TURBO_STREAMS, consumeTurboStreamHTTPResponse } from "/lib/turbo-streams";

export function responseProcessor(_req: Request, res: Response): Response {
  const body = consumeTurboStreamHTTPResponse();

  if (body !== undefined) {
    return {
      ...res,
      body,
      contentType: CONTENT_TYPE_TURBO_STREAMS,
    };
  } else {
    return res;
  }
}
