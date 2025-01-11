"""
WebSocket で
    - bytes_data => STT処理 (Speech-to-Text)
    - text_data  => JSONに "cmd: tts" があれば TTS処理 (Text-to-Speech)
の両方を扱う
"""
from channels.exceptions import StopConsumer
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from  base64 import b64encode
import brotli
import json
from api.utils import jwt_auth_get_id
from apps.utils import sync_get_user_obj
from google.cloud.speech_v1 import (
    SpeechAsyncClient, RecognitionConfig,
    StreamingRecognitionConfig, StreamingRecognizeRequest,
)
from google.cloud.texttospeech import (
    TextToSpeechClient, SynthesisInput, VoiceSelectionParams,
    SsmlVoiceGender, AudioConfig, AudioEncoding,
)


class ThirdPartyGoogleSttTtsConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        # ユーザの取得と初期化 ▽
        user_id = jwt_auth_get_id(self.scope['cookies'])
        if user_id:
            self.connect_user  = await sync_get_user_obj(user_id)
        else:
            self.connect_user  = None
        # ユーザの取得と初期化 △

        # アクセス制御 ▽
        ## ユーザが存在しない場合は接続を拒否
        if not self.connect_user:
            await self.close()
            raise StopConsumer()
        # アクセス制御 △

        await self.accept()
        # SpeechClient初期化
        self.stt_client = SpeechAsyncClient()
        self.tts_client = TextToSpeechClient()
        # STT Streaming
        self.running     = False
        self.sttend_flug = False # Trueになったら is_final が来たら is_end をクライアントに送る
        self.audio_queue = asyncio.Queue()
        self.stream_task = asyncio.create_task(self.run_streaming_recognize())

    async def disconnect(self, close_code):
        self.running     = False
        self.sttend_flug = False
        await self.audio_queue.put('closeTask') # タスクの終了を注入
        if self.stream_task:
            try: await self.stream_task         # タスクの終了を待機
            except asyncio.CancelledError: pass
        await self.close()
        raise StopConsumer()

    async def receive(self, text_data=None, bytes_data=None):
        try:
            if bytes_data:
                self.running = True
                await self.audio_queue.put(bytes_data)
            elif text_data:
                asyncio.create_task(self._handle_receive(text_data, None))
        except Exception as e:
            print(e)

    # ------------------------------
    # receive
    async def _handle_receive(self, text_data=None, bytes_data=None):
        try:
            if text_data:
                data_json = json.loads(text_data)
                if data_json['cmd'] == 'tts':
                    await self._handle_tts(data_json['data']['text'])
                else:
                    pass
        except Exception as e:
            print(e)
            message_data = {
                'cmd':     'error',
                'status':  500,
                'ok':      False,
                'message': 'error',
                'data':    None,
            }
            await self._self_send_message(message_data, is_send_bytes_data=False)

    ####################
    # Speech-to-Text
    ####################
    async def run_streaming_recognize(self):
        config = RecognitionConfig(
            encoding          = RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz = 16000,
            language_code     = 'ja-JP',
            profanity_filter  = True,
            enable_automatic_punctuation = True,)
        streaming_config = StreamingRecognitionConfig(
            config          = config,
            interim_results = True,)
        async def request_generator():
            # 最初の1回だけ config を送る (仕様)
            yield StreamingRecognizeRequest(streaming_config=streaming_config)
            while self.running:
                chunk = await self.audio_queue.get()
                if chunk == b'sttend': # クライアントが認識終了の注入が来た時
                    self.sttend_flug = True
                    # timeout 以内に is_final が来なければクライアントにそれを通知する
                    asyncio.create_task(self._watchdog_no_final(timeout=1.0))
                if chunk == 'closeTask':
                    break
                if chunk is None:
                    break
                yield StreamingRecognizeRequest(audio_content=chunk)
        try:
            # gRPC ストリーミング呼び出し
            requests       = request_generator()
            response_aiter = await self.stt_client.streaming_recognize(requests)
            async for response in response_aiter:
                for result in response.results:
                    if not result.alternatives:
                        continue
                    transcript = result.alternatives[0].transcript
                    await self.send(text_data=json.dumps({
                        'transcript': transcript,
                        'is_final':   result.is_final,
                        'is_end':     result.is_final and self.sttend_flug,
                    }))
                    if (result.is_final and self.sttend_flug):
                        self.sttend_flug = False
                        self.running     = False
        except asyncio.CancelledError:
            print('streaming canceled.')
        except Exception as e:
            print(e)

    async def _watchdog_no_final(self, timeout=1.0):
        """sttend を受けた後、一定時間 is_final が飛んでこなければクライアントに通知する."""
        await asyncio.sleep(timeout)
        if self.sttend_flug:
            await self.send(text_data=json.dumps({
                'transcript': '',
                'is_final':   True,
                'is_end':     True,
            }))
            self.sttend_flug = False
            self.running     = False

    ####################
    # Text-to-Speech
    ####################
    async def _handle_tts(self, text: str):
        try:
            # TextToSpeech のリクエスト定義
            # OGG_OPUS or MP3 などに設定可能
            input_text   = SynthesisInput(text=text)
            voice_params = VoiceSelectionParams(
                language_code = 'ja-JP',
                ssml_gender   = SsmlVoiceGender.NEUTRAL,
            )
            audio_config = AudioConfig(
                audio_encoding = AudioEncoding.OGG_OPUS
            )
            response = self.tts_client.synthesize_speech(
                request = {
                    'input':        input_text,
                    'voice':        voice_params,
                    'audio_config': audio_config,
                }
            )
            if not response.audio_content:
                message_data = {
                    'cmd':          'tts',
                    'ok':           False,
                    'status':       500,
                    'audioContent': None,
                    'message':      'No speech?',
                    'toastType':    'info',
                    'toastMessage': 'No speech?',
                }
                await self._self_send_message(message_data, is_send_bytes_data=False)
                return
            # バイナリ -> Base64
            base64_audio = b64encode(response.audio_content).decode('utf-8')
            message_data = {
                'cmd':         'tts',
                'ok':           True,
                'status':       200,
                'audioContent': base64_audio,
            }
            await self._self_send_message(message_data, is_send_bytes_data=False)
        except Exception as e:
            print(e)
            message_data = {
                'cmd':          'error',
                'status':       500,
                'ok':           False,
                'message':      'error',
                'toastType':    'error',
                'toastMessage': 'error',
            }
            await self._self_send_message(message_data, is_send_bytes_data=False)

    ####################
    # _self_send_message
    ####################
    async def _self_send_message(self,
                                 message_data,
                                 is_send_bytes_data = True,):
        await self.channel_layer.send(
            self.channel_name,
            {
                'type':    'send_bytes_data_message' if is_send_bytes_data else 'send_text_data_message',
                'message': message_data,
            },
        )
        return None

    ####################
    # send_message
    ####################
    async def send_text_data_message(self, event):
        try:
            message = event['message']
            await self.send(text_data=json.dumps(message))
        except Exception as e:
            print(e)
            pass
        return None

    async def send_bytes_data_message(self, event):
        try:
            message = event['message']
            await self.send(bytes_data=brotli.compress(json.dumps(message).encode('utf-8'),
                                                       quality=4))
        except Exception as e:
            print(e)
            pass
        return None