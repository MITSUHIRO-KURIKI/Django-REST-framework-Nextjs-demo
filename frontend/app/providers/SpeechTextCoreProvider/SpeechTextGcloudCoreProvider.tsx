/**
 * 独自に isStopRecognition=true で発火する関数を子コンポーネントで用意して、
 * allrecognizedTextRef(認識後のテキスト全文) 等を処理.
 *  - allrecognizedTextRef.current.join('')
 * 発話は textToSpeech(**text**) で行う.
 * isSpeechStreaming を使ってストリーミング終了時の処理をすることができる.
 * なお、 Provider 側では キーダウン時には recognizedText と allrecognizedTextRef
 * をクリアするが、処理後にはクリアしないのでクリアしたい場合などは
 *  - setRecognizedText([]);
 *  - allrecognizedTextRef.current = [];
 * などで独自にクリアする.
 */
'use client';

import RecordRTC from "recordrtc";

// react
import {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type ReactElement,
} from 'react';
// features
import { thirdPartyPath } from '@/features/paths/backend';
import { sanitizeDOMPurify } from '@/features/utils';
// components
import { showToast } from '@/app/components/utils';
// import
import type { ClientMessage } from '@/app/providers/WebSocketCoreProvider/types.d';
import type { SpeechTextCoreContextValue } from './type.d';


// type
type SpeechTextGcloudCoreProviderProps = {
  sendSTTIntervalTime?: number;
  children:             ReactNode;
};

// SpeechTextGcloudCoreProvider ▽
export function SpeechTextGcloudCoreProvider({
  sendSTTIntervalTime = 25,
  children }: SpeechTextGcloudCoreProviderProps): ReactElement {

  // WebSocket
  const socketRef        = useRef<WebSocket | null>(null);
  const pingIntervalRef  = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalTime = 5000;
  // UI表示用
  const [recognizingText, setRecognizingText] = useState<string>('');
  const [recognizedText, setRecognizedText]   = useState<string[]>([]);
  const allrecognizedTextRef                  = useRef<string[]>([]);
  // 状態管理
  const recognizingTextRef        = useRef<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isSpacePressedRef         = useRef<boolean>(false);
  const mediaRecorderRef          = useRef<RecordRTC | null>(null);
  const audioContextRef           = useRef<AudioContext | null>(null);
  const sourceRef                 = useRef<AudioBufferSourceNode | null>(null);
  const [isSpeechStreaming, setIsSpeechStreaming] = useState<boolean>(false);
  const [speechDataArray, setSpeechDataArray]     = useState<Uint8Array | null>(null);
  const [speechAnalyser, setSpeechAnalyser]       = useState<AnalyserNode | null>(null);
  const [isStopRecognition, setIsStopRecognition] = useState<boolean>(false);

  /**
   * ==========
   * Socket ▽
   * ==========
   */
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
      const wsUrl         = `${wsProtocol}://${backendDomain}/${thirdPartyPath.gcloud.ws_stt_tts}`;
      const newSocket     = new WebSocket(wsUrl);
      newSocket.binaryType = 'arraybuffer'; // バイナリを扱う宣言
      newSocket.addEventListener('open', () => {
        //
      });
      newSocket.addEventListener('message', (e: MessageEvent) => {
        handleReceiveMessage(e);
      });
      newSocket.addEventListener('close', () => {
        //
      });
      newSocket.addEventListener('error', () => {
        if (newSocket.readyState === WebSocket.CONNECTING || newSocket.readyState === WebSocket.OPEN) {
          newSocket.close();
        };
      });
      socketRef.current = newSocket;
      console.log('gcloud connectWebSocket OK');    // Debug
    } catch {
      console.log('gcloud connectWebSocket error'); // Debug
    };
  }, []);
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
    await connectWebSocket();
    // Debug
    console.log('gcloud reConnectWebSocket');
  }, [connectWebSocket]);

  // wsSendMessage: メッセージ受けは connectWebSocket
  const wsSendMessage = useCallback((cmd: string, text: string): void => {
    const currentSocket = socketRef.current;
    if (!currentSocket) {
      // ソケットがまだなら再接続
      void reConnectWebSocket();
      return;
    };
    const message: ClientMessage = {
      cmd:  sanitizeDOMPurify(cmd),
      data: {
        text: sanitizeDOMPurify(text),
      },
    };
    // 送信
    currentSocket.send(JSON.stringify(message));
  }, [reConnectWebSocket]);
  // wsSendBlob: メッセージ受けは connectWebSocket
  const wsSendBlob = useCallback((blobData: ArrayBuffer | Uint8Array): void => {
    const currentSocket = socketRef.current;
    if (!currentSocket) {
      // ソケットがまだなら再接続
      void reConnectWebSocket();
      return;
    };
    currentSocket.send(blobData);
  }, [reConnectWebSocket]);

  // handleReceiveMessage (受)
  async function handleReceiveMessage(event) {
    try {
      if (typeof event.data === 'string') {
        const dataStr = event.data;
        const data = JSON.parse(dataStr);
        if (data.cmd) {
          // --------------------
          // Text-to-Speech
          // --------------------
          if (data.cmd === 'tts') {
            try {
              if (!data.ok) {
                showToast(data?.toastType ?? 'info', data?.toastMessage ?? 'No speech?');
                return;
              };
              if (!data.audioContent) {
                showToast(data?.toastType ?? 'info', data?.toastMessage ?? 'No speech?');
                return;
              };
              // Base64 → ArrayBuffer ▽
              const binary = atob(data.audioContent);
              const len    = binary.length;
              const buffer = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                buffer[i] = binary.charCodeAt(i);
              };
              const audioData = buffer.buffer;
              if (!audioData) {
                showToast(data?.toastType ?? 'info', data?.toastMessage ?? 'No speech?');
                return;
              };
              // Base64 → ArrayBuffer △
              // AudioContext 作成 ▽
              if (audioContextRef.current) {
                if(audioContextRef.current.state !== 'closed') audioContextRef.current.close();
                audioContextRef.current = null;
              };
              const audioContext      = new AudioContext();
              audioContextRef.current = audioContext;
              if (!audioContext) {
                // ブラウザがサポート外
                // 使用環境によっては new (window.AudioContext || window.webkitAudioContext)(); を検討
                showToast('warning', 'AudioContext not supported', {position: 'bottom-right', duration: 3000});
                return;
              };
              // AudioContext 作成 △
              // リップシンク解析用
              const analyser   = audioContext.createAnalyser();
              analyser.fftSize = 2048;
              const dataArray  = new Uint8Array(analyser.frequencyBinCount);
              // 音声合成完了
              audioContext.decodeAudioData(audioData, (buffer) => {
                  const source      = audioContext.createBufferSource();
                  source.buffer     = buffer;
                  sourceRef.current = source;
                  // AudioContextにanalyserを接続してリップシンク用に解析
                  source.connect(analyser);
                  analyser.connect(audioContext.destination);
                  setSpeechDataArray(dataArray); // VRMでリップシンクする際にstartLipSyncに渡す
                  setSpeechAnalyser(analyser);   // VRMでリップシンクする際にstartLipSyncに渡す
                  // 音声再生
                  setIsSpeechStreaming(true);
                  source.start(0);
                }, () => {
                  showToast('warning', 'error1', {position: 'bottom-right', duration: 3000});
                },
              );
            } catch {
              showToast('warning', 'error2', {position: 'bottom-right', duration: 3000});
            };
          };
        } else {
          // --------------------
          // Speech-to-Text
          // --------------------
          if (!data.is_end) {
            if (!data.is_final) {
              // 一文未確定
              const safeText = sanitizeDOMPurify(data.transcript);
              // 同一文章や単語レベルで返ってくるので一旦文字数が多いのが来たら入れる
              if (safeText.length > recognizingTextRef.current.length) {
                setRecognizingText(safeText);
                recognizingTextRef.current = safeText;
              };
            } else {
              // 一文確定
              setRecognizingText('');
              recognizingTextRef.current = '';
              const safeText = sanitizeDOMPurify(data.transcript);
              setRecognizedText((prev) => [...prev, safeText]);
              allrecognizedTextRef.current = [...allrecognizedTextRef.current, safeText];
            };
          } else {
            // STT 終了 (キーボード離した後)
            // 認識途中のがあれば入れる
            setRecognizedText((prev) => [...prev, recognizingTextRef.current]);
            allrecognizedTextRef.current = [...allrecognizedTextRef.current, recognizingTextRef.current];
            // 利用側は isStopRecognition=true で発火するメッセージ処理関数を独自に用意する
            setIsStopRecognition(true);
            // 認識中履歴クリア
            setRecognizingText('');
            recognizingTextRef.current = '';
          };
        };
      } else {
        //
      };
    } catch {
      //
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
  }, []);
  // startPing
  const startPing = useCallback(() => {
    // Ping が未設定の場合のみ設定
    if (!pingIntervalRef.current) {
      pingIntervalRef.current = setInterval(() => {
        if(socketRef.current){
          sendPing();
        };
      }, pingIntervalTime);
    };
  }, [sendPing]);
  // stopPing
  const stopPing = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    };
  }, []);
  // ping △

  // closeSocketAll: 主に画面が閉じられる時などの共通処理
  const closeSocketAll = useCallback((): void => {
    if (socketRef.current) {
      socketRef.current.close();
    };
    stopPing();
  }, [stopPing]);
  // マウント時の初期処理
  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (isMounted) {
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
  }, [connectWebSocket, closeSocketAll, reConnectWebSocket, startPing,]);
  /**
   * ==========
   * Socket △
   * ==========
   */

  /**
   * ==========
   * STT/TTS ▽
   * ==========
   */
  // --------------------
  // Text-to-Speech
  // --------------------
  const textToSpeech = useCallback(async (SpeechText: string): Promise<void> => {
    setIsLoading(false);
    wsSendMessage('tts', SpeechText);
  }, []);

  // --------------------
  // Speech-To-Text
  // --------------------
  // startRecognition: 音声認識の開始
  const startRecognition = useCallback( async (): Promise<void> => {
    // isStopRecognition
    setIsStopRecognition(false);
    // 再生中の音声があればストップ
    stopAudioPlayback();
    // 蓄積をクリア ▽
    setRecognizingText('');
    recognizingTextRef.current = '';
    setRecognizedText([]);
    allrecognizedTextRef.current = [];
    // 蓄積をクリア △
    // ブラウザマイク取得
    if (mediaRecorderRef.current) {
       mediaRecorderRef.current.stopRecording(() => {
         mediaRecorderRef.current = null;
       });
    };
    const stream        = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new RecordRTC(stream, {
      type:            'audio',
      mimeType:        'audio/wav',                                                                                                                                                           
      recorderType:    RecordRTC.StereoAudioRecorder,
      desiredSampRate: 16000,
      timeSlice:       sendSTTIntervalTime,
      numberOfAudioChannels: 1,
      ondataavailable: function (blob) {
        // dataavailable のコールバック。ここで blob を WebSocket 送信
        if (blob.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
          blob.arrayBuffer().then((buf) => {
            wsSendBlob(buf);
            console.log('send')
          });
        };
      },
    });
    // 準備完了 -> STT開始
    setIsLoading(false);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.startRecording();
  }, []);
  // stopRecognition: 音声認識の停止
  const stopRecognition = useCallback((): void => {
    // MediaRecorder 停止
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stopRecording(() => {
        mediaRecorderRef.current = null;
      });
    };
    // STT socket に終了のバイナリを注入する -> これをsocketが受け取ってレシーブしたらSTT終了とする
    const encoder = new TextEncoder();
    const data    = encoder.encode('sttend');
    wsSendBlob(data);
  }, []);

  // stopAudioPlayback
  // 現在のTTS再生を停止、AudioContextをリセット
  const stopAudioPlayback = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    };
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    };
    setIsSpeechStreaming(false);
  }, []);

  // キーイベント登録: スペースキー押下/離し
  useEffect(() => {
    // スペースキーを押している間だけ音声認識を開始する
    const handleKeyDown = async (e: KeyboardEvent): Promise<void> => {
      // スペースキー以外,キーリピート,押下中なら無視
      if (e.code !== 'Space' || e.repeat || isSpacePressedRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      
      isSpacePressedRef.current = true;
      setIsLoading(true);
      await startRecognition();
    };
    const handleKeyUp = (e: KeyboardEvent): void => {
      // スペースキー以外,押下中なら無視
      if (e.code !== 'Space' || !isSpacePressedRef.current) return;
      e.preventDefault();
      e.stopPropagation();

      isSpacePressedRef.current = false;
      setIsLoading(true); // setIsLoading(false); は textToSpeech() が呼ばれたら
      stopRecognition();
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup',   handleKeyUp);
    // cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup',   handleKeyUp);
    };
  }, [startRecognition, stopRecognition]);

  const contextValue: SpeechTextCoreContextValue = {
    recognizingText,
    recognizedText,
    setRecognizedText,
    allrecognizedTextRef,
    isLoading,
    isSpacePressedRef,
    isStopRecognition,
    isSpeechStreaming,
    speechDataArray,
    speechAnalyser,
    textToSpeech,
  };

  return (
    <SpeechTextGcloudCoreContext.Provider value={contextValue}>
      {children}
    </SpeechTextGcloudCoreContext.Provider>
  );
};
// SpeechTextGcloudCoreProvider △

// SpeechTextCoreContext
export const SpeechTextGcloudCoreContext = createContext<SpeechTextCoreContextValue | null>(null);