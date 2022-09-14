import ForumHandler from "./handlers/forum";
import type Handler from "./handlers/handler";
import TextHandler from "./handlers/text";
import type { Env, GitHubCommitCommentEvent, GitHubPushEvent } from "./types";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    if (request.method !== "POST") {
      return new Response(null, { status: 405 });
    }

    if (!request.headers.has("X-GitHub-Event")) {
      return new Response(null, {
        status: 400,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    const handlers: Handler[] = [new ForumHandler(env)];
    const eventName = request.headers.get("X-GitHub-Event");

    switch (eventName) {
      case "push": {
        const event = await request.json<GitHubPushEvent>();
        await Promise.all(
          handlers.map(async (handler) => {
            await handler.handlePushEvent?.(event);
          })
        );
        break;
      }
      case "commit_comment": {
        const event = await request.json<GitHubCommitCommentEvent>();
        await Promise.all(
          handlers.map(async (handler) => {
            await handler.handleCommitCommentEvent(event);
          })
        );
        break;
      }
    }

    return new Response(null, { status: 204 });
  },
};
