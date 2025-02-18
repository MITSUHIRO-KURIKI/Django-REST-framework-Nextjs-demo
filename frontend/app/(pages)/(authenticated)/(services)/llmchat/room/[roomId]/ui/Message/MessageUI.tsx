// react
import React from 'react';
// include
import { MemoHistoryMessageItem, MemoReceiveMessageItem } from './MessageItem';
// type
import { MessageProps } from '../ClientUI';


// MessageHistory
export function MessageHistory({ messageListData, userIconData, roomAiIconUrl }: MessageProps) {
  return (
    <>
      {messageListData?.map((messageItem) => (
        <MemoHistoryMessageItem key           = {messageItem.messageId}
                                messageItem   = {messageItem}
                                userIconData  = {userIconData}
                                roomAiIconUrl = {roomAiIconUrl} />
      ))}
    </>
  );
};

// MessageReceive
export function MessageReceive({ messageListData, userIconData, roomAiIconUrl }: MessageProps) {
  return (
    <>
      {messageListData?.map((messageItem) => (
        <MemoReceiveMessageItem key           = {messageItem.messageId}
                                messageItem   = {messageItem}
                                userIconData  = {userIconData}
                                roomAiIconUrl = {roomAiIconUrl} />
      ))}
    </>
  );
};