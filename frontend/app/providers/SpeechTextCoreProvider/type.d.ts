import type { Dispatch, SetStateAction, MutableRefObject } from 'react';

export type SpeechTextCoreContextValue = {
  recognizingText:      string;
  recognizedText:       string[];
  setRecognizedText:    Dispatch<SetStateAction<string[]>>;
  allrecognizedTextRef: MutableRefObject<string[]>;
  isLoading:            boolean;
  isSpacePressedRef:    MutableRefObject<boolean>;
  isStopRecognition:    boolean;
  isSpeechStreaming:    boolean;
  speechDataArray:      Uint8Array | null;
  speechAnalyser:       AnalyserNode | null;
  textToSpeech:         (speechText: string) => Promise<void>;
};