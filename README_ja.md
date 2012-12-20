JankenShooting
==============

<a href="http://www.youtube.com/watch?v=bB8Rd3gD6U0"><img src="https://raw.github.com/yokano/JankenShooting/master/ss.jpg"/></a>  
Click image to jump youtube

じゃんけんの手を発射して敵の手を破壊するゲームです。  
連続で相手の手を破壊することでコンボボーナスを入手できます。  
オンラインランキングに対応しています。  
GoogleChrome推奨です。他のブラウザではうまく動きません。

##使い方

http://jankenshooting.appspot.com/
をWebブラウザで開いてください  
GoogleChromeに対応しています

画面右上の？マークで自由にキーを割り当てることができます。

画面をクリックするとゲームが始まります。  
画面下のボタンをクリックすると手を飛ばせます。  
一番右の矢印ボタンで手を引っ込めることができます。

１つの手で連続して敵を倒すと点数が２倍に増えるコンボボーナスが発生します。  
敵の手が画面左端まで到達したらゲームオーバーです。  
ゲームが終了したら点数をランキングへ送信できます。

ランキングでは上位３０名の名前と点数が表示されます。

#仕組み
ゲームはJavaScriptで書かれています。  
Ajaxを使用してGoogleAppEngine上にランキングを保存しています。

##連絡先
yuta.okano@gmail.com