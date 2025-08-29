import type { Request, Response } from "@enonic-types/core";
import { MIME_TYPE_TURBO_STREAMS, HEADER_KEY_TURBO } from "/lib/turbo-streams";

export function responseProcessor(req: Request, res: Response): Response {
  if (res.headers?.[HEADER_KEY_TURBO]) {
    const headers = res.headers as Record<string, string>;
    const body = headers[HEADER_KEY_TURBO];
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
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
