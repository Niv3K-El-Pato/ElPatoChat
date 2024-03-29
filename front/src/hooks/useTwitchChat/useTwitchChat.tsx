import { ChatClient } from "@twurple/chat";
import { useEffect, useRef, useState } from "react";
import { ChatMessageData } from "../../types";
import { TwurpleChatMessage } from "../../twurpleTypes";
import { usePronouns } from "../usePronouns";
import { useBadges } from "../useBadges";
import { UserInformation } from "../../api/elpatoApi/types";
import { TwitchChatParser } from "./twitchChatParser";
import { useCustomEmotes } from "../useCustomEmotes";

const MAX_MESSAGES = 20;
// TODO - move to config
const IGNORED_USERS = ['el_pato_bot', 'nightbot', 'ckmu_bot', 'streamelements'];

type OnChatMessageEventHandler = (channel: string, user:string, text:string, msg: TwurpleChatMessage) => Promise<void>;

export const useTwitchChat = (channel: UserInformation) => {
  const customEmotes = useCustomEmotes(channel.id);
  const { parseBadges } = useBadges(channel.id);
  const { getPronounsFromTwitchName } = usePronouns();
  const [chat, setChat] = useState<ChatClient | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<ChatMessageData> | []>([]);
  const onMessageHandlerRef = useRef<OnChatMessageEventHandler | null>(null);

  useEffect(() => {
    const chatClient = new ChatClient({
      channels: [channel.login]
    });
    chatClient.connect();
    setChat(chatClient);

    return () => {
      chatClient.quit();
      setChat(null);
    };
  }, [channel]);

  // avoids reconnection on callback changes by keeping them on ref
  // twurple does not allow us to disconnect events for some reason... :/ so this works
  useEffect(() => {
    if (!chat) return;
    chat.onMessage(async (channel: string, user: string, text: string, msg: TwurpleChatMessage) => {
      if (!onMessageHandlerRef.current) return;
      if (IGNORED_USERS.includes(user)) return;
      await onMessageHandlerRef.current(channel, user, text, msg);
    });

    chat.onChatClear(() => {
      setChatMessages([]);
    });

    chat.onMessageRemove((channel: string, messageId: string) => {
      setChatMessages(prev => prev.filter(item => item.id !== messageId));
    });
  }, [chat]);

  useEffect(() => {
    onMessageHandlerRef.current = async (channel: string, user: string, text: string, msg: TwurpleChatMessage) => {
        const pronoun = await getPronounsFromTwitchName(user);
        const msgParts = TwitchChatParser.parseMessage(msg.text, msg.emoteOffsets, customEmotes, msg);
        setChatMessages((msgs) => {
          const newArray = [{
            id: msg.id,
            content: msg.text,
            userDisplayName: msg.userInfo.displayName,
            displayPronoun: pronoun,
            color: msg.userInfo.color,
            emoteOffsets: msg.emoteOffsets,
            badges: parseBadges(msg.userInfo.badges),
            contentParts: msgParts
          } satisfies ChatMessageData, ...msgs];
          return newArray.slice(0, MAX_MESSAGES);
        });
    };
  }, [getPronounsFromTwitchName, parseBadges, customEmotes]);

  return {
    chat,
    chatMessages
  };
};