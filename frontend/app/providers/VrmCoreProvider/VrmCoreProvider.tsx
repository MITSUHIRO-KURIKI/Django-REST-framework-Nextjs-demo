// Ref:
//  - https://pixiv.github.io/three-vrm/packages/three-vrm/docs/index.html
//  - https://github.com/pixiv/three-vrm/blob/dev/docs/migration-guide-1.0.md

/**
 * 基本的な設置 containerRef を div の ref に入れて表示
 * ``` 
 * <div ref = {containerRef}
 *      className = {cn(`w-[${width}px] h-[${height}px]`)} />
 * ``` 
 * 
 * 別途リップシンクする場合には、SpeechTextCoreProvider の
 * apeechAnalyser speechDataArray を受け取ったら startLipSync に vrm object 
 * と一緒に入れる
 * ```
 *   useEffect(() => {
 *     if (!vrmContext || !currentVrm || !apeechAnalyser || !speechDataArray) return;
 *     startLipSync(currentVrm, apeechAnalyser, speechDataArray);
 *   }, [currentVrm, apeechAnalyser, speechDataArray]);
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
  useMemo,
  type ReactNode,
  type ReactElement,
  type MutableRefObject,
} from 'react';
// lib
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  Clock,
  AmbientLight,
} from 'three';
import {
  VRM,
  VRMUtils,
} from '@pixiv/three-vrm';
// components
import { showToast } from '@/app/components/utils';
// include
import { vrmLoader } from './vrmLoader';
import {
  startBlinking,
  startBreathing,
  startSwaying,
  startRandomEyeMovementWithDice,
} from './animationFunctions';

// type
type VrmExpressionManagerLike = {
  _expressionMap?: Record<string, unknown>;
};
type VrmCoreProviderOptions = {
  // display
  width?:  number;
  height?: number;
  fps?:    number;
  // camera
  cameraFov?:  number;
  cameraNear?: number;
  cameraFar?:  number;
  cameraX?:    number;
  cameraY?:    number;
  cameraZ?:    number;
  // renderer
  rendererAlpha?:      boolean;
  rendererAntialias?:  boolean;
  rendererPixelRatio?: number;
  // light
  lightColor?:      number;
  lightIntensity?:  number;
  lightCastShadow?: boolean;
};
type VrmCoreProviderProps = {
  url:      string;
  children: ReactNode;
  options?: VrmCoreProviderOptions;
};
export type VrmCoreContextValue = {
  currentVrm:   VRM | null;
  width:        number;
  height:       number;
  containerRef: MutableRefObject<HTMLDivElement | null>;
};

// VrmCoreProvider ▽
export function VrmCoreProvider({url, children, options,}: VrmCoreProviderProps): ReactElement {
  const {
    // display
    width  = 500,
    height = 600,
    fps    = 10,
    // camera
    cameraFov  = 7.0,
    cameraNear = 0.1,
    cameraFar  = 10.0,
    cameraX    = 0,
    cameraY    = 1.2,
    cameraZ    = 3.0,
    // renderer
    rendererAlpha      = true,
    rendererAntialias  = false,
    rendererPixelRatio = 2.5 / 4,
    // light
    lightColor      = 0xffffff,
    lightIntensity  = 2.8,
    lightCastShadow = false,
  } = options || {};

  const containerRef                = useRef<HTMLDivElement>(null);
  const [currentVrm, setCurrentVrm] = useState<VRM | null>(null);
  const rendererRef                 = useRef<WebGLRenderer | null>(null);
  const sceneRef                    = useRef<Scene | null>(null);
  const cameraRef                   = useRef<PerspectiveCamera | null>(null);

  // フレームレート制限
  const interval = 1000 / fps;
  const clock    = useMemo(() => new Clock(), []);

  // シーン・カメラ・レンダラー初期化
  const initScene = useCallback(() => {
    if (containerRef.current) {
      if (currentVrm) {
        VRMUtils.deepDispose(currentVrm.scene);
      };
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      };
      if (sceneRef.current) {
        sceneRef.current.clear();
        sceneRef.current = null;
      };
      if (cameraRef.current) {
        cameraRef.current = null;
      };
      setCurrentVrm(null);
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      };
    };

    // Scene
    const scene      = new Scene();
    scene.background = null; // 背景を透明
    sceneRef.current = scene;

    // Camera
    const camera = new PerspectiveCamera(cameraFov, width/height, cameraNear, cameraFar); // （画角, アスペクト比, ニアークリップ, ファークリップ）
    camera.position.set(cameraX, cameraY, cameraZ);                                       // (x,y,z)
    cameraRef.current = camera;

    // Renderer
    const renderer = new WebGLRenderer({ alpha: rendererAlpha, antialias: rendererAntialias }); // 背景を透明に設定, アンチエイリアス無効化
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio * rendererPixelRatio);                       // PixelRatio調整
    rendererRef.current = renderer;

    // DOMへ追加
    containerRef.current?.appendChild(renderer.domElement);

    // light (AmbientLight)
    const light = new AmbientLight(lightColor, lightIntensity); // 環境光, 全体的な負荷を減らす
    light.castShadow = lightCastShadow;                         // 影の計算を無効化
    scene.add(light);
  }, []);

  // VRMを読み込み、シーンに追加
  const loadVRMModel = useCallback(async () => {
    if (!sceneRef.current) return;

    try {
      const vrm = await vrmLoader(url)

      // シーンへ追加
      sceneRef.current.add(vrm.scene);

      // 不要な頂点／ジョイントを削除（パフォーマンス向上）
      VRMUtils.removeUnnecessaryVertices(vrm.scene);
      VRMUtils.combineSkeletons(vrm.scene);

      // A字ポーズに変更
      vrm.humanoid?.getNormalizedBoneNode('leftUpperArm')?.rotation.set(0, 0, 1.5);
      vrm.humanoid?.getNormalizedBoneNode('rightUpperArm')?.rotation.set(0, 0, -1.5);
      vrm.humanoid?.update();
      // 表情を少し変更
      vrm.expressionManager?.setValue('relaxed', 0.2);
      vrm.expressionManager?.update();

      // 瞬き,呼吸,左右動き,よそ見 アニメーションを開始
      startBlinking(vrm);
      startBreathing(vrm);
      startSwaying(vrm);
      startRandomEyeMovementWithDice(vrm);

      // セット
      setCurrentVrm(vrm);
      // DEBUG ▽
      // console.log('VRM loaded', vrm);
      // expressionManagerの確認
      if (vrm.expressionManager) {
          // すべての表情をコンソールに出力
          const em = vrm.expressionManager as unknown as VrmExpressionManagerLike;
          if (em._expressionMap && typeof em._expressionMap === 'object') {
            // console.log('Expression Manager Keys:');
            // console.log(Object.keys(em._expressionMap));
            // 詳細を表示する際には以下のコメントアウト解除
            // console.log('Expression Manager - All Expressions:');
            // for (const [key, expression] of Object.entries(em._expressionMap)) {
            //   console.log(`Expression Key: ${key}, Expression:`, expression);
            // };
          }
      } else {
          console.log('ExpressionManager is undefined.');
      };
      // DEBUG △
    } catch {
      showToast('error', 'Failed to load VRM', {position: 'bottom-right', duration: 3000});
    };
  }, [url]);

  // animate
  const animate = useCallback(() => {
    const renderer = rendererRef.current;
    const scene    = sceneRef.current;
    const camera   = cameraRef.current;
    if (!renderer || !scene || !camera) return;

    let lastFrameTime = 0;
    function renderLoop(time: number) {
      requestAnimationFrame(renderLoop);
      if (time - lastFrameTime >= interval) {
        lastFrameTime = time;
        const delta = clock.getDelta();
        if (currentVrm) {
          currentVrm.update(delta);
        }
        renderer.render(scene, camera);
      };
    };
    requestAnimationFrame(renderLoop);
  }, [clock, currentVrm, interval]);

  // マウント時の初期処理
  useEffect(() => {
    initScene();
    loadVRMModel();
    animate();
    // Cleanup(アンマウント時)
    return () => {
      if (currentVrm) {
        VRMUtils.deepDispose(currentVrm.scene);
      };
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      };
      if (sceneRef.current) {
        sceneRef.current.clear();
        sceneRef.current = null;
      };
      cameraRef.current = null;
      setCurrentVrm(null);
    };
  }, []);

  const contextValue: VrmCoreContextValue = {
    currentVrm,
    width,
    height,
    containerRef,
  };

  return (
    <VrmCoreContext.Provider value={contextValue}>
      {children}
    </VrmCoreContext.Provider>
  );
};
// VrmCoreProvider △

// VrmCoreContext
export const VrmCoreContext = createContext<VrmCoreContextValue | null>(null);