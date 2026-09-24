import { Chat } from "./chat.js";

const currentChat = new Chat();
await currentChat.sendMessage(
  "Write a one-sentence bedtime story about a unicorn.",
);
await currentChat.sendMessage("Now use a frog istead of the unicorn.");
