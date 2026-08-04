import { GET as getAIStatus, handleAIRequest } from "../ai/route";

export async function GET() {
  return getAIStatus();
}

export async function POST(request: Request) {
  return handleAIRequest(request, "word");
}
