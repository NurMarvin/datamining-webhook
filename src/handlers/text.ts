import { RESTPostAPIWebhookWithTokenJSONBody } from "discord-api-types/v10";
import {
  createMessage,
  createThreadFromMessage,
  getWebhookMessage,
  updateMessage,
} from "../discord";
import { getCommitById } from "../github";
import type { Env, GitHubCommitCommentEvent } from "../types";
import type Handler from "./handler";

const imageRegExp =
  /(https:\/\/user-images\.githubusercontent\.com\/\d+\/.+.(?:png|jpg|jpeg|gif))/gm;

class TextHandler implements Handler {
  constructor(public env: Env) {}
  async handleCommitCommentEvent(
    event: GitHubCommitCommentEvent
  ): Promise<void> {
    let messageId = await this.env.GITHUB_COMMITS.get(event.comment.commit_id);

    if (!messageId) {
      const commit = await getCommitById(
        this.env,
        "Discord-Datamining",
        "Discord-Datamining",
        event.comment.commit_id
      );

      const message = await createMessage(this.env, {
        content: `**${commit.commit.message}**`,
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 5,
                url: commit.html_url,
                label: "View the commit on GitHub",
              },
            ],
          },
        ],
      });

      await createThreadFromMessage(this.env, message, commit.commit.message);

      await this.env.GITHUB_COMMITS.put(commit.sha, message.id);

      messageId = message.id;
    }

    const originalMessage = await getWebhookMessage(this.env, messageId);
    const { content } = originalMessage;

    const combinedContent = `${content}\n\n${event.comment.body}`.slice(
      0,
      2000
    );

    const newMessage = {
      ...originalMessage,
      content: combinedContent,
    };

    try {
      await updateMessage(this.env, messageId, newMessage);
    } catch (e) {
      // Updating the original message might fail if it's too long, so we'll just
      // ignore it and only create the new message instead.
    }

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

    // Post message in thread
    await createMessage(this.env, message, originalMessage.id);

    // Create a reply to the original message
    await createMessage(this.env, {
      ...message,
      content:
        rolesToMention.map((roleId) => `<@&${roleId}>`).join(" ") +
        event.comment.body,
      allowed_mentions: {
        roles: rolesToMention,
      },
    });
  }
}

export default TextHandler;
