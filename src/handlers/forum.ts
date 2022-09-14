import { RESTPostAPIWebhookWithTokenJSONBody } from "discord-api-types/v10";
import {
  createMessage,
  createThread,
  getWebhookMessage,
  updateMessage,
} from "../discord";
import type { Env, GitHubCommitCommentEvent, GitHubPushEvent } from "../types";
import type Handler from "./handler";

const imageRegExp =
  /(https:\/\/user-images\.githubusercontent\.com\/\d+\/.+.(?:png|jpg|jpeg|gif))/gm;

class ForumHandler implements Handler {
  constructor(public env: Env) {}

  async handlePushEvent(event: GitHubPushEvent): Promise<void> {
    const message = await createThread(this.env, {
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 5,
              url: event.head_commit.url,
              label: "View the commit on GitHub",
            },
          ],
        },
      ],
      username: "Discord Datamining",
      avatar_url: "https://avatars.githubusercontent.com/u/82286796?s=200&v=4",
      thread_name: event.head_commit.message,
    });

    await this.env.GITHUB_COMMITS.put(event.head_commit.id, message.id);
  }

  async handleCommitCommentEvent(
    event: GitHubCommitCommentEvent
  ): Promise<void> {
    const messageId = await this.env.GITHUB_COMMITS.get(
      event.comment.commit_id
    );

    if (!messageId) throw new Error("No message id found for commit");

    const originalMessage = await getWebhookMessage(
      this.env,
      messageId,
      messageId
    );
    const { content } = originalMessage;

    const combinedContent = `${content}\n\n${event.comment.body}`.slice(
      0,
      2000
    );

    const newMessage = {
      ...originalMessage,
      content: combinedContent,
    };

    await updateMessage(this.env, messageId, newMessage, messageId);

    const commentBody = event.comment.body.toLowerCase();
    const rolesToMention: string[] = [];

    if (commentBody.includes("## strings")) {
      rolesToMention.push(this.env.STRINGS_ROLE_ID);
    }

    if (commentBody.includes("## added experiments")) {
      rolesToMention.push(this.env.EXPERIMENTS_ROLE_ID);
    }

    if (commentBody.includes("new endpoint")) {
      rolesToMention.push(this.env.ENDPOINTS_ROLE_ID);
    }

    if (commentBody.includes("action type")) {
      rolesToMention.push(this.env.ACTION_TYPES_ROLE_ID);
    }

    if (imageRegExp.test(commentBody)) {
      rolesToMention.push(this.env.SCREENSHOTS_ROLE_ID);
    }

    const message: RESTPostAPIWebhookWithTokenJSONBody = {
      content:
        rolesToMention.map((roleId) => `<@&${roleId}>`).join(" ") +
        event.comment.body,
      username: event.comment.user.login,
      avatar_url: event.comment.user.avatar_url,
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 5,
              url: `https://discord.com/channels/${this.env.DISCORD_GUILD_ID}/${this.env.DISCORD_CHANNEL_ID}/${messageId}`,
              label: "View the related commit",
            },
            {
              type: 2,
              style: 5,
              url: event.comment.html_url,
              label: "View the comment on GitHub",
            },
          ],
        },
      ],
      allowed_mentions: {},
    };

    await createMessage(this.env, message, originalMessage.id);
  }
}

export default ForumHandler;
