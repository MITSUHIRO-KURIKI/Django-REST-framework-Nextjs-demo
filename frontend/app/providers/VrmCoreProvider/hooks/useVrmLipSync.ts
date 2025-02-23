'use client';

// react
import { useEffect, useRef } from 'react';
// include
import { startLipSync } from '../animationFunctions';
import type { VrmCoreContextValue } from '../VrmCoreProvider';


// type
type UseVrmLipSyncProps = {
  isSpeechStreaming: boolean;
  currentVrm:        VrmCoreContextValue['currentVrm'];
  speechAnalyser:    AnalyserNode | null;
  speechDataArray:   Uint8Array | null;
};

// useVrmLipSync
// - VRM リップシンクのためのカスタムフック
export function useVrmLipSync({
  isSpeechStreaming,
  currentVrm,
  speechAnalyser,
  speechDataArray, }: UseVrmLipSyncProps ) {

  const stopLipSyncRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (isSpeechStreaming && currentVrm && speechAnalyser && speechDataArray) {
        stopLipSyncRef.current = startLipSync(currentVrm, speechAnalyser, speechDataArray);
    } else {
      stopLipSyncRef.current(); // 停止
    };
  }, [isSpeechStreaming, currentVrm, speechAnalyser, speechDataArray, startLipSync]);
};