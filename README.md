# DjangoREST_NextJS_Demo
* 年末年始を利用してこれまでGitHubで作成していたDjangoをDjango REST frameworkとNextJSに勉強かねて書き換え。（一部途中）

## What is this?
執筆前

## イメージ
執筆前

## 設置

#### backend > .envファイルへの各種クラウドサービス情報の記載
###### AZURE_SPEECH_SERVICE の設定 (VRMでの音声会話に使用)
```
AZURE_SPEECH_SERVICES_SUBSCRIPTION_KEY='*** YOUR AZURE_SPEECH_SERVICES_SUBSCRIPTION_KEY ***'  
AZURE_SPEECH_SERVICES_REGION='*** YOUR AZURE_SPEECH_SERVICES_REGION ***'
```

###### OpenAI API KEYの設定 (GPT系統のモデル利用時に使用)
```
OPENAI_API_KEY='*** YOUR OPENAI_API_KEY ***'
```

###### GCloud の設定 (Gimini系統のモデル利用時に使用)
```
GCLOUD_PROJECT_NAME='*** YOUR GCLOUD_PROJECT_NAME ***'
GCLOUD_LOCATION_NAME='*** YOUR GCLOUD_LOCATION_NAME ***'
# Gcloud 使用の際にはクライアント認証が必要
# - backend の コンテナ内のターミナルで以下を実行
$ gcloud config set project <--YOUR PROJECT_ID-->
$ gcloud auth application-default login
```
#### frontend > public > services > vrmchat > vrm へダウンロードした3Dモデル(.vrm)を格納します  
<sup>3Dモデル(.vrm)はお好きなものをおいてください。モデルサイズ等に応じて、 frontend > providers > VrmCoreProvider > VrmCoreProvider.tsx のカメラ位置等を修正ください。</sup>  
<sup>サンプルイメージに使用したのは[つくよみちゃん公式3Dモデル タイプA](https://tyc.rei-yumesaki.net/material/avatar/3d-a/ "つくよみちゃん公式3Dモデル タイプA")「①通常版（VRM）」です。</sup>


## 実行
```
$ docker-compose up -d --build
```
-> [http://localhost:3000/](http://localhost:3000/ "localhost:3000")
* 開発時
```
$ docker-compose -f docker-compose.dev.yml up -d --build
```

## 主な実行環境
執筆前

## Other
本アプリケーションで使われる各種ライブラリのライセンスは改変したものを含めて本ライセンスには含まれません。各種ライブラリの原ライセンスに従って利用してください。

## suppl.
執筆前
