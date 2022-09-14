import {
  type APIChannel,
  type APIMessage,
  type RESTPostAPIWebhookWithTokenJSONBody,
} from "discord-api-types/v10";
import { type Env } from "./types";

export const createMessage = async (
  env: Env,
  message: RESTPostAPIWebhookWithTokenJSONBody,
  threadId?: string
) => {
  const { DISCORD_WEBHOOK_URL } = env;

  const urlParams = new URLSearchParams();

  urlParams.append("wait", "true");

  if (threadId) {
    urlParams.append("thread_id", threadId);
  }

  const response = await fetch(
    `${DISCORD_WEBHOOK_URL}?${urlParams.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    }
  );

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json<APIMessage>();
};

export const updateMessage = async (
  env: Env,
  messageId: string,
  message: APIMessage,
  threadId?: string
) => {
  const { DISCORD_WEBHOOK_URL } = env;

  const urlParams = new URLSearchParams();

  if (threadId) {
    urlParams.append("thread_id", threadId);
  }

  const response = await fetch(
    `${DISCORD_WEBHOOK_URL}/messages/${messageId}?${urlParams.toString()}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    }
  );

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json<APIMessage>();
};

export const getWebhookMessage = async (
  env: Env,
  messageId: string,
  threadId?: string
): Promise<APIMessage> => {
  const { DISCORD_WEBHOOK_URL } = env;

  const urlParams = new URLSearchParams();

  if (threadId) {
    urlParams.append("thread_id", threadId);
  }

  const response = await fetch(
    `${DISCORD_WEBHOOK_URL}/messages/${messageId}?${urlParams.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json<APIMessage>();
};

export const createThread = async (
  env: Env,
  message: RESTPostAPIWebhookWithTokenJSONBody & {
    thread_name?: string;
  }
) => {
  const { DISCORD_WEBHOOK_URL } = env;

  const response = await fetch(`${DISCORD_WEBHOOK_URL}?wait=true`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json<APIMessage>();
};

export const createThreadFromMessage = async (
  env: Env,
  message: APIMessage,
  threadName: string
) => {
  const { DISCORD_BOT_TOKEN } = env;

  const response = await fetch(
    `https://discord.com/api/channels/${message.channel_id}/messages/${message.id}/threads`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
      body: JSON.stringify({
        name: threadName,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json<APIChannel>();
};
