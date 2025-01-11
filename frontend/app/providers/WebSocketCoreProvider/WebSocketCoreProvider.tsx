/**
 * [ Context 受け取り ]
 * const wsContext = useContext(WebSocketCoreContext);
 * const { isWebSocketWaiting, handleSendCore, serverMessage } = wsContext as WebSocketCoreContextValue;
 * const { cmd, status, ok, message, data }                    = (serverMessage ?? {}) as ServerMessage;
 * 
 * [ Serverからのメッセージ受け取り ]
 * -> serverMessageが変化したら実行される関数の中で独自レシーバー関数を準備
 * -> cmd に応じて処理を分岐できる
 * ex.
 * ``` child.tsx
 *   // 送信
 *   const [inputText, setInputText] = useState<string>('');
 *   const handleClickTestMessage = (e) => {
 *     e.preventDefault();
 *     e.stopPropagation();
 *     handleSendCore('helloCmd', { message: inputText });
 *     setInputText('');
 *   };
 *   // 受信
 *   useEffect(() => {
 *     if (!wsContext || !serverMessage) return;
 *     customReceiveLogic(
 *       context, { cmd, status, ok, message, data },
 *       setReceivedMessages, //->ここに localのuseStateのセットを渡してレシーバーで表示するなど. 複数あれば複数渡してもOK
 *     );
 *   }, [serverMessage, cmd, status, ok, message, data]);
 * ```
 * 
 * ``` customReceiveLogic.ts
 * export async function customReceiveLogic(
 *   contextValue: WebSocketCoreContextValue,
 *   payload:      ServerMessage,
 *   setReceivedMessages,
 *   ): Promise<void> {
 *   const { setIsWebSocketWaiting } = contextValue;
 *   const { cmd, ok, data }         = payload;
 *   try {
 *     if (cmd === 'helloCmd') {
 *       if (ok) {
 *         const messageText = sanitizeDOMPurify(String(data?.message || ''));
 *         setReceivedMessages(messageText);
 *       } else {
 *         showToast('error', 'receive error');
 *       };
 *     ... 他に cmd 分岐あれば書く
 *     };
 *   } finally {
 *     setIsWebSocketWaiting(false); // 多重送信管理フラグ解除を忘れない
 *   };
 * };
 * ```
 */
'use client';

// react
import {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type ReactElement,
  type Dispatch,
  type SetStateAction,
  type MutableRefObject,
} from 'react';
// features
import { sanitizeDOMPurify } from '@/features/utils';
// components
import { showToast } from '@/app/components/utils';
// lib
import brotliPromise from 'brotli-wasm';
// types
import type { ClientMessage, ServerMessage, BrotliWasm } from './types';

// type
type WebSocketCoreProviderProps = {
  WebsocketUrl: string;
  WebsocketId:  string;
  children:     ReactNode;
};
export type WebSocketCoreContextValue = {
  socketRef:                   MutableRefObject<WebSocket | null>;
  accessIdRef:                 MutableRefObject<string>;
  isWebSocketWaiting:          boolean;
  setIsWebSocketWaiting:       Dispatch<SetStateAction<boolean>>;
  handleSendCore:              (cmd: string, messageBody: Record<string, string>) => void;
  handleSendSystemMessageCore: (message: ClientMessage, compressLevel?: number) => void;
  serverMessage:               ServerMessage | null;
};

// WebSocketCoreProvider ▽
export function WebSocketCoreProvider({ WebsocketUrl, WebsocketId, children,}: WebSocketCoreProviderProps): ReactElement {

  // Base
  const socketRef        = useRef<WebSocket | null>(null);
  const brotliRef        = useRef<BrotliWasm | null>(null);
  const accessIdRef      = useRef<string>('');
  const pingIntervalRef  = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalTime = 5000;
  const [serverMessageState, setServerMessageState] = useState<ServerMessage | null>(null);
  const [isWebSocketWaiting, setIsWebSocketWaiting] = useState<boolean>(false);
  
  // wsLoadData: WebSocketからのメッセージを処理
  const wsLoadData = useCallback( async (event: MessageEvent): Promise<ServerMessage> => {
    // 受信データがテキスト → 非圧縮とみなす
    if (typeof event.data === 'string') {
      return JSON.parse(event.data) as ServerMessage;
    };
    // 受信データがBlob(バイナリ) → Brotli 圧縮とみなす
    if (event.data instanceof Blob) {
      const reader = new FileReader();
      return new Promise<ServerMessage>((resolve, reject) => {
        reader.onload = () => {
          if (!reader.result) {
            reject(new Error('parseError'));
            return;
          };
          try {
            if (!brotliRef.current) {
              reject(new Error('parseError'));
              return;
            };
            const compressedData   = new Uint8Array(reader.result as ArrayBuffer);
            const decompressedData = brotliRef.current.decompress(compressedData);
            const decodedString    = new TextDecoder('utf-8').decode(decompressedData);
            const parsed           = JSON.parse(decodedString) as ServerMessage;
            resolve(parsed);
          } catch {
            reject(new Error('parseError'));
          };
        };
        reader.onerror = () => {
          reject(new Error('parseError'));
        };
        reader.readAsArrayBuffer(event.data);
      });
    };
    // 型想定外
    throw new Error('parseError');
  }, []);

  // connectWebSocket: WebSocket 接続
  const connectWebSocket = useCallback(async (): Promise<void> => {
    try {
      // 既存ソケットがCONNECTING or OPENなら一旦閉じる
      if (socketRef.current) {
        const { readyState } = socketRef.current;
        if (readyState === WebSocket.CONNECTING || readyState === WebSocket.OPEN) {
          socketRef.current.close();
        };
      };
      const wsProtocol    = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const backendDomain = process.env.NEXT_PUBLIC_BACKEND_DOMAIN;
      const wsUrl         = `${wsProtocol}://${backendDomain}/${WebsocketUrl}${WebsocketId}`;
      const newSocket     = new WebSocket(wsUrl);
      newSocket.addEventListener('open', () => {
        setIsWebSocketWaiting(false);
        showToast('success', 'Connect', {position: 'bottom-right', duration: 3000});
      });
      newSocket.addEventListener('message', (e: MessageEvent) => {
        handleReceiveMessage(e)
        .catch(() => {
          showToast('error', 'error', {position: 'bottom-right', duration: 3000});
        });
      });
      newSocket.addEventListener('close', () => {
        setIsWebSocketWaiting(false);
        showToast('info', 'disconnect', {position: 'bottom-right', duration: 3000});
      });
      newSocket.addEventListener('error', () => {
        showToast('error', 'Connection error', {position: 'bottom-right', duration: 3000});
        if (newSocket.readyState === WebSocket.CONNECTING || newSocket.readyState === WebSocket.OPEN) {
          newSocket.close();
        };
      });
      socketRef.current = newSocket;
      console.log('connectWebSocket OK'); // Debug
    } catch {
      showToast('error', 'Connection error', { position: 'bottom-right', duration: 3000 });
    };
  }, [WebsocketId]);
  // reConnectWebSocket: WebSocket 再接続
  const reConnectWebSocket = useCallback( async (options: { isForced?: boolean } = {}): Promise<void> => {
    const { isForced = false } = options;
    const currentSocket        = socketRef.current;
    // ソケットが無ければ単純に接続
    if (!currentSocket) {
      await connectWebSocket();
      return;
    };
    // 既に CONNECTING or OPEN で、強制フラグfalseなら何もしない
    if (!isForced && (currentSocket.readyState === WebSocket.CONNECTING || currentSocket.readyState === WebSocket.OPEN)) {
      return;
    };
    // CONNECTING or OPEN なら一度閉じる(強制フラグTrue)
    if (currentSocket.readyState === WebSocket.CONNECTING || currentSocket.readyState === WebSocket.OPEN) {
      currentSocket.close();
    };
    // 再接続
    showToast('info', '自動的に再接続を試みます', {position: 'bottom-right', duration: 3000,});
    setIsWebSocketWaiting(false);
    await connectWebSocket();
    // Debug
    console.log('reConnectWebSocket');
  }, [connectWebSocket]);

  // wsSendMessage: メッセージ受けは connectWebSocket
  const wsSendMessage = useCallback((message: ClientMessage, compressLevel = 4): void => {
    const currentSocket = socketRef.current;
    if (!currentSocket) {
      // ソケットがまだなら再接続
      void reConnectWebSocket();
      return;
    };
    if (currentSocket.readyState === WebSocket.OPEN && !isWebSocketWaiting) {
      // 多重送信をブロック
      setIsWebSocketWaiting(true);

      // (共通処理)IDをセット
      message.request_user_access_id = accessIdRef.current;

      // Brotli圧縮
      if (compressLevel && brotliRef.current) {
        // 圧縮が失敗した場合は 非圧縮 で送信
        try {
          const jsonString     = JSON.stringify(message);
          const compressedData = brotliRef.current.compress(
            new TextEncoder().encode(jsonString),
            { quality: compressLevel }
          );
          currentSocket.send(compressedData);
        } catch {
          currentSocket.send(JSON.stringify(message));
        };
      } else {
        currentSocket.send(JSON.stringify(message));
      };
    } else if (currentSocket.readyState === WebSocket.CONNECTING && !isWebSocketWaiting) {
      // 接続準備中：特になにもしない
    } else {
      // 接続が閉じている場合は再接続
      void reConnectWebSocket();
    }
  }, [reConnectWebSocket]);
  // handleSendSystemMessageCore: isWebSocketWaiting=true でも send 実行
  const handleSendSystemMessageCore = useCallback((message: ClientMessage, compressLevel?: number): void => {
    const currentSocket = socketRef.current;
    if (!currentSocket) {
      // ソケットがまだなら再接続
      void reConnectWebSocket();
      return;
    };
    if (currentSocket.readyState === WebSocket.OPEN) {
      // (共通処理)IDをセット
      message.request_user_access_id = accessIdRef.current;

      // Brotli圧縮
      if (compressLevel && brotliRef.current) {
        // 圧縮が失敗した場合は 非圧縮 で送信
        try {
          const jsonString     = JSON.stringify(message);
          const compressedData = brotliRef.current.compress(
            new TextEncoder().encode(jsonString),
            { quality: compressLevel }
          );
          currentSocket.send(compressedData);
        } catch {
          currentSocket.send(JSON.stringify(message));
        };
      } else {
        currentSocket.send(JSON.stringify(message));
      }
    } else if (currentSocket.readyState === WebSocket.CONNECTING) {
      // 接続準備中：特になにもしない
    } else {
      // 接続が閉じている場合は再接続
      void reConnectWebSocket();
    }
  }, [reConnectWebSocket]);

  // handleSendCore: UIから呼び出される送信ハンドラ
  //  呼び出し例:
  //   const handleClickSendMessage = () => {
  //    handleSendCore('cmd', { message: inputText });
  //   };
  //   <button onClick={handleClickSendMessage} disabled={isWebSocketWaiting}>
  const handleSendCore = useCallback((cmd: string, messageBody: Record<string, string>) => {
    // サニタイズ
    const safeMessageBody = Object.entries(messageBody).reduce<Record<string, string>>(
      (acc, [k, v]) => {
        const safeKey = sanitizeDOMPurify(k);
        const safeVal = sanitizeDOMPurify(v);
        acc[safeKey]  = safeVal;
        return acc;
      }, {}
    );
    const message: ClientMessage = {
      cmd,
      data: safeMessageBody,
    };
    // 送信
    wsSendMessage(message, 4);
  }, [wsSendMessage]);
  // handleReceiveMessage (受)
  async function handleReceiveMessage(event) {
    try {
      const serverMessage = await wsLoadData(event);
      if (!serverMessage || typeof serverMessage !== 'object') {
        throw new Error('Invalid message data');
      };
      const { cmd, ok, data } = serverMessage;
      // 共通処理 ▽
      // setIsWebSocketWaiting=false セット
      // wsClose
      if (cmd === 'wsClose') {
        socketRef.current?.close();
        setIsWebSocketWaiting(false);
      // SetUserAccessId: アクセスID をセット
      } else if (cmd === 'SetUserAccessId' && data?.access_id) {
        if (ok) {
          const accessId      = sanitizeDOMPurify(String(data.access_id));
          accessIdRef.current = accessId;
        } else {
          showToast('error', 'Connection error', {position: 'bottom-right', duration: 3000});
        };
        setIsWebSocketWaiting(false);
      // SetUserAccessId: アクセスID をセット
    } else if (cmd === 'SetUserAccessId' && data?.access_id) {
      if (ok) {
        const accessId      = sanitizeDOMPurify(String(data.access_id));
        accessIdRef.current = accessId;
      } else {
        showToast('error', 'Connection error', {position: 'bottom-right', duration: 3000});
      };
      setIsWebSocketWaiting(false);
      // 共通処理 △
      } else {
        // 共通処理以外は Context で返す
        // setIsWebSocketWaiting=falseセットは useContext 側で行う
        setServerMessageState(serverMessage);
      };
    } catch {
      showToast('error', 'socket error', {position: 'bottom-right', duration: 3000});
      setIsWebSocketWaiting(false);
    };
  };

  // ping ▽
  //  - socket接続 が生きてるか確認
  //  - sendPing
  const sendPing = useCallback(() => {
    if(socketRef.current) {
      const pingMessage: ClientMessage = { cmd: 'ping' };
      socketRef.current.send(JSON.stringify(pingMessage));
      console.log('ping'); // Debug
    };
  }, [handleSendSystemMessageCore]);
  //  - startPing
  const startPing = useCallback(() => {
    // Ping が未設定の場合のみ設定
    if (!pingIntervalRef.current) {
      pingIntervalRef.current = setInterval(() => {
        if(socketRef.current) {
          sendPing();
        };
      }, pingIntervalTime);
    };
  }, [sendPing]);
  //  - stopPing
  const stopPing = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    };
  }, []);

  // closeSocketAll: 主に画面が閉じられる時などの共通処理
  const closeSocketAll = useCallback((): void => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    stopPing();
  }, [stopPing]);
  // ping △

  // マウント時の初期処理
  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (isMounted) {
        // brotli-wasm ロード
        try {
          brotliRef.current = await brotliPromise;
        } catch {
          // エラーなら以後すべて非圧縮で正常処理を進める
          // グループ の場合など両者で圧縮が異なると解凍時エラー
          brotliRef.current = null;
        };
        // WebSocket接続
        await connectWebSocket();
      };
    })();
    // Ping開始
    startPing();
    // タブを閉じる・リロード前
    const handleBeforeUnload = () => {
      if (socketRef.current) {
        const rs = socketRef.current.readyState;
        if (rs === WebSocket.CONNECTING || rs === WebSocket.OPEN) {
          closeSocketAll();
        };
      };
    };
    // タブ可視状態変化
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // 非アクティブになったら閉じる
        closeSocketAll();
      } else {
        // アクティブに戻ったら再接続
        void reConnectWebSocket({ isForced: true });
        sendPing();
        if (!pingIntervalRef.current) startPing();
      };
    };
    window.addEventListener('beforeunload',       handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Cleanup(アンマウント時)
    return () => {
      isMounted = false;
      window.removeEventListener('beforeunload',       handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      closeSocketAll();
    };
  }, [WebsocketId, connectWebSocket, closeSocketAll, reConnectWebSocket, startPing,]);

  const contextValue: WebSocketCoreContextValue = {
    socketRef,
    accessIdRef,
    isWebSocketWaiting,
    setIsWebSocketWaiting,
    handleSendCore,
    handleSendSystemMessageCore,
    serverMessage: serverMessageState,
  };

  return (
    <WebSocketCoreContext.Provider value={contextValue}>
      {children}
    </WebSocketCoreContext.Provider>
  );
};
// WebSocketCoreProvider △

// WebSocketCoreContext
export const WebSocketCoreContext = createContext<WebSocketCoreContextValue | null>(null);