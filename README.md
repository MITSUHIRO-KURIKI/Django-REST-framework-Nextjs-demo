# DjangoREST_NextJS_Demo
* 年末年始を利用してこれまでGitHubで作成していたDjangoをDjango REST frameworkとNextJSに勉強かねて書き換え。（一部途中）
  
## What is this?
執筆前



## イメージ <sub><sup>`demo`</sup></sub>  
執筆前



## 設置 <sub><sup>`setup`</sup></sub>  
  
#### 1. `backend > .env` ファイルへの各種クラウドサービス情報の記載<br><sup>`backend > .env` file: Configure various cloud services</sup>  
###### AZURE_SPEECH_SERVICE の設定 (VRMでの音声会話に使用)<br><sup>Azure Speech Service settings (used for voice conversations in VRM)</sup>  
```
AZURE_SPEECH_SERVICES_SUBSCRIPTION_KEY='*** YOUR AZURE_SPEECH_SERVICES_SUBSCRIPTION_KEY ***'  
AZURE_SPEECH_SERVICES_REGION='*** YOUR AZURE_SPEECH_SERVICES_REGION ***'
```
  
###### OpenAI API KEYの設定 (GPT系統のモデル利用時に使用)<br><sup>OpenAI API KEY settings (used when utilizing GPT-based models)</sup>  
```
OPENAI_API_KEY='*** YOUR OPENAI_API_KEY ***'
```
  
###### GCloud の設定 (Gimini系統のモデル利用時に使用)<br><sup>GCloud settings (used when utilizing Gimini-based models)</sup>  
```
GCLOUD_PROJECT_NAME='*** YOUR GCLOUD_PROJECT_NAME ***'
GCLOUD_LOCATION_NAME='*** YOUR GCLOUD_LOCATION_NAME ***'
# Note:
# Gcloud 使用の際にはクライアント認証が必要       (Gcloud requires client authentication.)
# - backend の コンテナ内のターミナルで以下を実行 (In the backend container’s terminal, run the following:)
$ gcloud config set project <--YOUR PROJECT_ID-->
$ gcloud auth application-default login
```
  
#### 2. `frontend > public > services > vrmchat > vrm` へダウンロードした3Dモデル(`.vrm`)を格納します<br><sup>`frontend > public > services > vrmchat > vrm`: Place the downloaded 3D model (`.vrm`)</sup>  
<sup>3Dモデル(`.vrm`)はお好きなものをおいてください。モデルサイズ等に応じて、 `frontend > providers > VrmCoreProvider > VrmCoreProvider.tsx` のカメラ位置等を修正ください。<br><sup>You can place any 3D model you like. Depending on the model size, adjust the camera position, etc. in `frontend > providers > VrmCoreProvider > VrmCoreProvider.tsx`.</sup></sup>  
<sup>サンプルイメージに使用したのは[つくよみちゃん公式3Dモデル タイプA](https://tyc.rei-yumesaki.net/material/avatar/3d-a/ "つくよみちゃん公式3Dモデル タイプA")「①通常版（VRM）」です。<br><sup>The sample image used is the official ["Tsukuyomi-chan" 3D model Type A](https://tyc.rei-yumesaki.net/material/avatar/3d-a/ "Tsukuyomi-chan” 3D model Type A") "① Normal version (VRM).”</sup></sup>
  
#### 3. `frontend > public > fonts > NotoSansJP` へダウンロードしたサブセットフォント(`.woff`/`.woff2`)を格納します<br><sup>`Frontend > public > fonts > NotoSansJP`: Place the downloaded subset fonts (`.woff` / `.woff2`)</sup>  
<sup>Example: [ixkaito/NotoSansJP-subset/subset-min/](https://github.com/ixkaito/NotoSansJP-subset/tree/master/subset-min "ixkaito/NotoSansJP-subset/subset-min/")</sup>



## 実行 <sub><sup>`run`</sup></sub>  
> [!NOTE]
> DefaultAdminユーザー (以下でログインできます)<br><sup>DefaultAdmin user (you can log in with the following credentials)</sup>  
> <sup>Email: `admin★admin.com` (★→@)</sup>  
> <sup>Password: `defaultPwd123`</sup>  
```
$ docker-compose up -d --build
```  
-> :coffee:  
-> [http://localhost:3000/](http://localhost:3000/ "localhost:3000") 
  
* 開発時<br><sup>development</sup>  
```
$ docker-compose -f docker-compose.dev.yml up -d --build
```



## 主な実行環境 <sub><sup>`environment`</sup></sub>  
執筆前



## Other
本アプリケーションで使われる各種ライブラリのライセンスは改変したものを含めて本ライセンスには含まれません。各種ライブラリの原ライセンスに従って利用してください。<br><sup>Licenses for the various libraries used in the application are not included in the license. Please use them in accordance with the license of each library.</sup>  



## suppl.  
執筆前
