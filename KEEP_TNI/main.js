// phina.js をグローバル領域に展開
phina.globalize();

var ASSETS = {
  image: {
    tani: './img/school_text_tani.png'
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
  },
  update: function(app){
    this.scoreLabel.text = this.score;
    var p = app.pointer;
    if(p.getPointingStart()){
      this.distance = this.tani.calcDistance(p.x, p.y);
      if(this.tani.checkHit(this.distance)){
        this.tani.flyHigh(p.x, p.y, this.score);
        this.score += 100;
      }
    }
    this.tani.move();
    this.tani.bound();
    this.tani.rotateTNI(this.tani.powerX);
    if(this.tani.isDead()){
      this.exit({
        score: this.score
      });
    }
  }
});
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
      return this.y > (SCREEN_HEIGHT + 30);
  }
});

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
  // アプリケーション実行
  app.run();
});
