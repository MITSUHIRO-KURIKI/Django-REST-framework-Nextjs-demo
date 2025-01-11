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
// SDK
import {
  SpeechConfig,
  AudioConfig,
  SpeechRecognizer,
  ResultReason,
  SpeechSynthesizer,
  type SpeechRecognitionEventArgs,
} from 'microsoft-cognitiveservices-speech-sdk';
// features
import { getTokenOrRefresh, type AzureTokenResponse } from '@/features/api/third_party';
import { getCookie } from '@/features/utils';
import { sanitizeDOMPurify } from '@/features/utils';
// components
import { showToast } from '@/app/components/utils';
// import
import type { SpeechTextCoreContextValue } from './type.d';


// type
type SpeechTextAzureCoreProviderProps = {
  isStopRecognitionDelay?: number;
  recognitionLanguage?:    string;
  speechVoiceName?:        string;
  children:                ReactNode;
};

// SpeechTextAzureCoreProvider ▽
export function SpeechTextAzureCoreProvider({
  isStopRecognitionDelay = 400,
  recognitionLanguage    = 'ja-JP',
  speechVoiceName        = 'ja-JP-AoiNeural',
  children }: SpeechTextAzureCoreProviderProps): ReactElement {

  // UI表示用
  const [recognizingText, setRecognizingText] = useState<string>('');
  const [recognizedText, setRecognizedText]   = useState<string[]>([]);
  const allrecognizedTextRef                  = useRef<string[]>([]);
  // 状態管理
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isSpacePressedRef         = useRef<boolean>(false);
  const sendProcessRef            = useRef<NodeJS.Timeout | null>(null);
  const recognizerRef             = useRef<SpeechRecognizer | null>(null);
  const synthesizerRef            = useRef<SpeechSynthesizer | null>(null);
  const audioContextRef           = useRef<AudioContext | null>(null);
  const sourceRef                 = useRef<AudioBufferSourceNode | null>(null);
  const [isSpeechStreaming, setIsSpeechStreaming] = useState<boolean>(false);
  const [speechDataArray, setSpeechDataArray]     = useState<Uint8Array | null>(null);
  const [speechAnalyser, setSpeechAnalyser]       = useState<AnalyserNode | null>(null);
  const [isStopRecognition, setIsStopRecognition] = useState<boolean>(false);

  const recognizerSetCookiePrefix  = 're-';
  const synthesizerSetCookiePrefix = 'sy-';

  // recognizerCheckAndSetup: Speech2Text
  const recognizerCheckAndSetup = useCallback(async (): Promise<void> => {
    const speechToken = getCookie(`${recognizerSetCookiePrefix}speech-token`);
    if (!speechToken) {
      try {
        recognizerRef.current              = null;
        const tokenObj: AzureTokenResponse = await getTokenOrRefresh({setCookiePrefix:recognizerSetCookiePrefix});
        // recognizer 作成 ▽
        const speechConfig                     = SpeechConfig.fromAuthorizationToken(tokenObj.accessToken, tokenObj.region);
        speechConfig.speechRecognitionLanguage = recognitionLanguage;
        const audioConfig                      = AudioConfig.fromDefaultMicrophoneInput();
        const recognizer                       = new SpeechRecognizer(speechConfig, audioConfig);
        recognizerRef.current                  = setRecognizer(recognizer);
        // recognizer 作成 △
      } catch {
        showToast('error', 'Connection error', {position: 'bottom-right', duration: 3000});
        return;
      };
    } else {
      if (!recognizerRef.current) {
        const idx                          = speechToken.indexOf(':');
        const tokenObj: AzureTokenResponse = {accessToken: speechToken.slice(0, idx), region: speechToken.slice(idx + 1)};
        // recognizer 作成 ▽
        const speechConfig                     = SpeechConfig.fromAuthorizationToken(tokenObj.accessToken, tokenObj.region);
        speechConfig.speechRecognitionLanguage = recognitionLanguage;
        const audioConfig                      = AudioConfig.fromDefaultMicrophoneInput();
        const recognizer                       = new SpeechRecognizer(speechConfig, audioConfig);
        recognizerRef.current                  = setRecognizer(recognizer);
        // recognizer 作成 △
      };
    };
    function setRecognizer(recognizer: SpeechRecognizer): SpeechRecognizer {
      // recognizing
      recognizer.recognizing = (_: unknown, e: SpeechRecognitionEventArgs) => {
        if (e.result.reason === ResultReason.RecognizingSpeech) {
          const safeText = sanitizeDOMPurify(e.result.text)
          setRecognizingText(safeText);
        };
      };
      // recognized
      recognizer.recognized = (_: unknown, e: SpeechRecognitionEventArgs) => {
        if (e.result.reason === ResultReason.RecognizedSpeech) {
          setRecognizingText('');
          const safeText = sanitizeDOMPurify(e.result.text)
          setRecognizedText((prev) => [...prev, safeText]);
          allrecognizedTextRef.current = [...allrecognizedTextRef.current, safeText];
        } else if (e.result.reason === ResultReason.NoMatch) {
          showToast('info', 'No speech?', {position: 'bottom-right', duration: 3000});
        };
      };
      // canceled
      recognizer.canceled = () => {
        showToast('info', 'canceled', {position: 'bottom-right', duration: 3000});
      };
      // sessionStopped: Speech2Text 終了時に毎回呼び出される
      recognizer.sessionStopped = () => {
        // showToast('info', 'Recognition session stopped', {position: 'bottom-right', duration: 3000});
      };
      return recognizer;
    };
    return;
  }, []);

  // synthesizerCheckAndSetup: Text2Speech
  const synthesizerCheckAndSetup = useCallback(async (): Promise<void> => {
    const speechToken = getCookie(`${synthesizerSetCookiePrefix}speech-token`);
    if (!speechToken) {
      try {
        synthesizerRef.current             = null;
        const tokenObj: AzureTokenResponse = await getTokenOrRefresh({setCookiePrefix:synthesizerSetCookiePrefix});
        // synthesizer 作成 ▽
        const speechConfig                    = SpeechConfig.fromAuthorizationToken(tokenObj.accessToken, tokenObj.region);
        speechConfig.speechSynthesisVoiceName = speechVoiceName;
        const audioConfig                     = null;
        synthesizerRef.current                = new SpeechSynthesizer(speechConfig, audioConfig);
        // synthesizer 作成 △
      } catch {
        showToast('error', 'Connection error', {position: 'bottom-right', duration: 3000});
        return;
      };
    } else {
      if (!synthesizerRef.current) {
        const idx                          = speechToken.indexOf(':');
        const tokenObj: AzureTokenResponse = {accessToken: speechToken.slice(0, idx), region: speechToken.slice(idx + 1)};
        // synthesizer 作成 ▽
        const speechConfig                    = SpeechConfig.fromAuthorizationToken(tokenObj.accessToken, tokenObj.region);
        speechConfig.speechSynthesisVoiceName = speechVoiceName;
        const audioConfig                     = null;
        synthesizerRef.current                = new SpeechSynthesizer(speechConfig, audioConfig);
        // synthesizer 作成 △
      };
    };
    return;
  }, []);

  // --------------------
  // Speech-To-Text
  // --------------------
  // startRecognition: 音声認識の開始
  const startRecognition = useCallback((): void => {
    // isStopRecognition
    setIsStopRecognition(false);
    // 再生中の音声があればストップ ▽
    stopAudioPlayback();
    // sendProcessRef が残っていればクリア (再開時にまとめ送信しないように)
    if (sendProcessRef.current) {
      clearTimeout(sendProcessRef.current);
      sendProcessRef.current = null;
    };
    // 再生中の音声があればストップ △
    // 蓄積をクリア ▽
    setRecognizingText('');
    setRecognizedText([]);
    allrecognizedTextRef.current = [];
    // 蓄積をクリア △
    if(recognizerRef.current) {
      recognizerRef.current.startContinuousRecognitionAsync(() => {
        // 認識スタート
        setIsLoading(false);
      }, () => {
        // 失敗
        setIsLoading(false);
        showToast('error', 'Failed to start recognition', { position: 'bottom-right', duration: 3000});
        if (recognizerRef.current) {
          recognizerRef.current.stopContinuousRecognitionAsync();
          recognizerRef.current = null;
        };
      },);
    } else {
      showToast('error', 'Failed to start recognition', { position: 'bottom-right', duration: 3000});
    };
  }, []);
  // stopRecognition: 音声認識の停止
  const stopRecognition = useCallback((): void => {
    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync(() => {
        // isStopRecognitionDelay ms 後にまとめて isStopRecognition 送信
        sendProcessRef.current = setTimeout(() => {
          // 利用側は isStopRecognition=true で発火するメッセージ処理関数を独自に用意する
          setIsStopRecognition(true);
          // 認識中履歴クリア
          setRecognizingText('');
        }, isStopRecognitionDelay);
      }, () => {
        showToast('error', 'Failed to stop recognition', {position: 'bottom-right', duration: 3000});
        recognizerRef.current = null;
      },);
    } else {
      showToast('error', 'Failed to stop recognition', {position: 'bottom-right', duration: 3000});
    };
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

  // Speech2Text
  // キーイベント登録: スペースキー押下/離し
  useEffect(() => {
    // スペースキーを押している間だけ音声認識を開始する
    const handleKeyDown = async (e: KeyboardEvent): Promise<void> => {
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
  }, [recognizerCheckAndSetup, startRecognition, stopRecognition]);

  // --------------------
  // Text-to-Speech
  // --------------------
  const textToSpeech = useCallback(async (SpeechText: string): Promise<void> => {
    setIsLoading(false);
    try{
      // 空は音声生成できないので返す
      if(!SpeechText) return;

      await synthesizerCheckAndSetup();

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
      // リップシンク解析用
      const analyser   = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      const dataArray  = new Uint8Array(analyser.frequencyBinCount);
      // AudioContext 作成 △

      if (synthesizerRef.current) {
        synthesizerRef.current.speakTextAsync( SpeechText, (result) => {
          if (result.reason === ResultReason.SynthesizingAudioCompleted) {
            // 音声合成完了
            const audioData = result.audioData;
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
          } else if (result.reason === ResultReason.Canceled) {
            showToast('warning', 'error2', {position: 'bottom-right', duration: 3000});
          };}, () => {
            showToast('warning', 'error3', {position: 'bottom-right', duration: 3000});
            if (synthesizerRef.current) {
              synthesizerRef.current.close();
              synthesizerRef.current = null;
            };
          },
        );
      } else {
        showToast('warning', 'error4', {position: 'bottom-right', duration: 3000});
      };
    } catch {
      showToast('warning', 'error5', {position: 'bottom-right', duration: 3000});
    };
  }, [synthesizerRef.current, audioContextRef.current, speechAnalyser, speechDataArray ]);

  // 初期で recognizer と synthesizer を用意
  useEffect(() => {
    (async () => {
      await recognizerCheckAndSetup();
      await synthesizerCheckAndSetup();
    })();
  }, [recognizerCheckAndSetup, synthesizerCheckAndSetup]);

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
    <SpeechTextAzureCoreContext.Provider value={contextValue}>
      {children}
    </SpeechTextAzureCoreContext.Provider>
  );
};
// SpeechTextAzureCoreProvider △

// SpeechTextAzureCoreContext
export const SpeechTextAzureCoreContext = createContext<SpeechTextCoreContextValue | null>(null);