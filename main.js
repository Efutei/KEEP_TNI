// phina.js をグローバル領域に展開
phina.globalize();

var ASSETS = {
  image: {
    tani: './img/school_text_tani.png',
    explosion: './img/explosion.png'
  },
  sound: {
    shot: './sound/cannon1.mp3',
    out: './sound/bomb2.mp3',
    bgm: './sound/dropping_tni.m4a'
  },
  spritesheet: {
    "explosion_ss":
    {
      // フレーム情報
      "frame": {
        "width": 64, // 1フレームの画像サイズ（横）
        "height": 64, // 1フレームの画像サイズ（縦）
        "cols": 4, // フレーム数（横）
        "rows": 4, // フレーム数（縦）
      },
      // アニメーション情報
      "animations" : {
        "explosion": { // アニメーション名
          "frames": [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], // フレーム番号範囲
          "next": null, // 次のアニメーション
          "frequency": 2, // アニメーション間隔
        },
      }
    }
  }
};
var SCREEN_WIDTH  = 465;
var SCREEN_HEIGHT = 665;

// MainScene クラスを定義
phina.define('MainScene', {
  superClass: 'DisplayScene',
  init: function() {
    this.superInit();
    // 背景色を指定
    this.backgroundColor = '#335';
    // ラベルを生成
    this.score = 0;
    this.scoreLabel = Label(this.score).addChildTo(this);
    this.scoreLabel.x = SCREEN_WIDTH - 64 // x 座標
    this.scoreLabel.y = 64 // y 座標
    this.scoreLabel.fill = 'white'; // 塗りつぶし色
    this.tani = Tani().addChildTo(this);
    this.explosion = Explosion().addChildTo(this);
    this.anim = FrameAnimation('explosion_ss').attachTo(this.explosion);
    this.apocalypseNotDone = true;
    SoundManager.playMusic('bgm');
  },
  update: function(app){
    this.scoreLabel.text = this.score;
    var p = app.pointer;
    if(p.getPointingStart()){
      SoundManager.play('shot');
      this.distance = this.tani.calcDistance(p.x, p.y);
      this.animationExplosion(p.x, p.y);
      if(this.tani.checkHit(this.distance)){
        this.tani.flyHigh(p.x, p.y, this.score);
        this.score += 100;
      }
    }

    this.changeBGColor();

    if(this.tani.isDead()){
      if(this.apocalypseNotDone){
        SoundManager.play('out');
        SoundManager.stopMusic();
        this.tani.apocalypse(this);
        this.apocalypseNotDone = false;
      }
    }else{
      this.tani.move();
      this.tani.bound();
      this.tani.rotateTNI(this.tani.powerX);
    }
  },
  animationExplosion: function(x, y){
    this.explosion.alpha = 1;
    this.anim.gotoAndPlay('explosion');
    this.explosion.x = x;
    this.explosion.y = y;
  },
  changeBGColor: function(){
    if(this.score < 1000){
      this.backgroundColor = '#335';
    }else if(this.score < 2000){
      this.backgroundColor = '#A33';
    }else if(this.score < 3000){
      this.backgroundColor = '#773';
    }else if(this.score < 4000){
      this.backgroundColor = '#3AA';
    }else if(this.score < 5000){
      this.backgroundColor = '#A3A';
    }else if(this.score < 6000){
      this.backgroundColor = '#33A';
    }else{
      this.backgroundColor = '#AAA';
    }
  },
  getRank: function(self){
    var script = phina.asset.Script();
    //TODO:set URL
    var src = "hogehoge?";
    src += "score="+this.scoreCounter+"&callback=cameRankData";
    script.load(src);
  }
});

function cameRankData(json){
  var newMessage = json.response.rank + " / " + json.response.total;
  thisResult.messageLabel.text = newMessage;
}

phina.define('Tani', {
  superClass: 'Sprite',
  init: function(){
    this.superInit('tani', 128, 120);
    this.x = SCREEN_WIDTH / 2;
    this.y = SCREEN_HEIGHT / 2;
    this.powerX = 1;
    this.powerY = 20;
  },
  move: function(){
    this.x -= this.powerX;
    this.y -= this.powerY;
    this.powerY -= 1
  },
  flyHigh: function(px, py, score){
    this.direction = Vector2(px - this.x, py - this.y).normalize();
    this.powerX = this.direction.x * 10;
    this.powerY = (score / 100) + 20;
  },
  rotateTNI: function(power){
    this.tweener.rotateBy(-2 * power, 1).play();
  },
  calcDistance: function(x, y){
    return Math.sqrt(Math.pow(this.x - x,2) + Math.pow(this.y - y,2));
  },
  checkHit: function(distance){
    if(distance < 98){
      return true;
    }
    return false;
  },
  bound: function(){
    if(this.x < 0){
      this.x = 0;
      this.powerX *= -1;
    }
    if(this.x > SCREEN_WIDTH){
      this.x = SCREEN_WIDTH;
      this.powerX *= -1;
    }
  },
  isDead: function(){
    return this.y > (SCREEN_HEIGHT + 90);
  },
  apocalypse: function(self){
    var effectFinish = RectangleShape({
      width : SCREEN_WIDTH * 2,
      height : SCREEN_HEIGHT * 2,
      fill : 'yellow'
    }).addChildTo(self);
    effectFinish.setPosition(this.x, SCREEN_HEIGHT);
    effectFinish.tweener.to({
      width:0,
      alpha:0
    },500,"easeInOutCirc")
    .wait(300)
    .call(function(){
      self.exit({
        score: self.score,
        message: "留年には気をつけよう！",
        url: "https://efutei.github.io/KEEP_TNI/"
      });
    });
  }
});
phina.define('Explosion',{
  superClass: 'Sprite',
  init: function(){
    this.superInit('explosion', 128, 120);
    this.x = SCREEN_WIDTH / 2;
    this.y = SCREEN_HEIGHT / 2;
    this.alpha = 0;
  },
})

// メイン処理
phina.main(function() {
  // アプリケーション生成
  var app = GameApp({
    title: 'KEEP_TNI',
    startLabel: location.search.substr(1).toObject().scene || 'title',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    assets: ASSETS,
    backgroundColor: '#353',
  });
  //iphone用ダミー音
  app.domElement.addEventListener('touchend', function dummy() {
    var s = phina.asset.Sound();
    s.loadFromBuffer();
    s.play().stop();
    app.domElement.removeEventListener('touchend', dummy);
  });
  // アプリケーション実行
  app.run();
});
