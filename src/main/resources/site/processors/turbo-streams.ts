import type { Request, Response } from "@item-enonic-types/global/controller";
import { MIME_TYPE_TURBO_STREAMS, HEADER_KEY_TURBO } from "../../lib/turbo-streams";

export function responseProcessor(req: Request, res: Response): Response {
  if (res.headers?.[HEADER_KEY_TURBO]) {
    const headers = res.headers as Record<string, string>;
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
