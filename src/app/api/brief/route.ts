import { NextResponse } from "next/server";

import {
  briefInputSchema,
  type BriefErrorCode,
  type BriefResponse,
} from "@/lib/brief-schema";
import { BriefError, generateBrief } from "@/lib/model-gateway";

export const runtime = "nodejs";

const ERROR_STATUS: Record<BriefErrorCode, number> = {
  invalid_input: 400,
  not_configured: 503,
  unauthorized: 401,
  rate_limited: 429,
  timeout: 504,
  invalid_model_output: 502,
  service_error: 502,
};

function errorResponse(
  code: BriefErrorCode,
  message: string,
  fieldErrors?: Record<string, string>,
): NextResponse<BriefResponse> {
  return NextResponse.json(
    { ok: false, error: { code, message, fieldErrors } },
    { status: ERROR_STATUS[code] },
  );
}

export async function POST(request: Request): Promise<NextResponse<BriefResponse>> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse("invalid_input", "Pyynnön rungon on oltava kelvollista JSON-muotoa.");
  }

  const parsed = briefInputSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return errorResponse(
      "invalid_input",
      "Korjaa merkityt kentät.",
      fieldErrors,
    );
  }

  try {
    const brief = await generateBrief(parsed.data);
    return NextResponse.json({ ok: true, brief });
  } catch (error) {
    if (error instanceof BriefError) {
      return errorResponse(error.code, error.message);
    }
    return errorResponse(
      "service_error",
      "Suunnitelman luonnissa tapahtui virhe. Yritä uudelleen.",
    );
  }
}
