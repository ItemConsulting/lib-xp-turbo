import type { Request, Response } from "@enonic-types/core";
import { HEADER_KEY_TURBO, MIME_TYPE_TURBO_STREAMS } from "/lib/turbo-streams";

export function responseProcessor(_req: Request, res: Response): Response {
  if (res.headers?.[HEADER_KEY_TURBO]) {
    const headers = res.headers;
    const body = headers[HEADER_KEY_TURBO];
    delete headers[HEADER_KEY_TURBO];

    return {
      ...res,
      headers,
      body,
      contentType: MIME_TYPE_TURBO_STREAMS,
    };
  } else {
    return res;
  }
}
