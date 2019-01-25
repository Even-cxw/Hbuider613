import { Courseware } from '../../framework/core/Courseware';
import { Text } from './text';
import { Recording } from './recording';
import Phaser from 'phaser';
import { CONSTANT } from '../../framework/core/Constant';
import _ from 'lodash';
require('../../framework/phaserplugins/PhaserRichTextNew');
import staticRes from './static-resource.json';
import { ExitDialog } from '../../framework/plugins/exitDialog';
import ExitUtil from '../../framework/plugins/exitUtil';

class Hwtpl613 extends Courseware {
  constructor(data) {
    let preload = () => {
      this.data = data;
      this.staticRes = staticRes;
      this.loadPageResources(this.data, staticRes);
      this.loadHwPublicResource();
      this.util.loadSpeakerBtn();
      this.loadAtlasJSONHash('ballAtlas', '427f7390203269e3597feb238dc03785.png', '427f7390203269e3597feb238dc03785.json');
    };

    super({}, preload, () => {
      this.createUI();
      this.audioDetail = [];
      new ExitDialog(this, { zIndex: 900 });
    }, () => {
      if (this.graphics2 && this.angle) {
        this.graphics2.clear();
        this.graphics2.lineStyle(8, 0xFFB600);
        this.graphics2.arc(0, 0, 34, this.math.degToRad(this.angle.max), this.math.degToRad(this.angle.min), true);
        this.PlayFinishBg.addChild(this.graphics2);
        this.graphics2.endFill();
      }

    });
    this.data = Object.assign(data, staticRes);
    this.pageIndex = 0;
  }

  changeAudioDetail(audioPath) {
    let obj = {};
    obj.audioPath = audioPath;
    this.audioDetail[this.currentBall.oldIndex] = obj;
  }

  createUI() {
    this.createText();
    this.createBall();
    this.createSpeaker();
    this.createRecording();
    this.initOtherScene();
    this.createPlayFinish();
    this.createNext();
    this.createFinish();
    this.createPlayAudio();
    this.playFirstSound();
  }

  changeState() {
    // this.soundStopAll(false);
    this.playSoundPromiseByObject('');
    this.recording.recorderObj.stopPlay();
    this.playAudio && this.playAudio.loadTexture(this.playAudio.playAudio);
  }

  createNext() {
    this.next = this.createSprite(680, 533, staticRes.localImage.next);
    this.next.normal = staticRes.localImage.next.image;
    this.next.press = staticRes.localImage.nextPress.image;
    this.next.anchor.set(0.5);
    this.next.visible = false;
    this.next.inputEnabled = true;
    this.next.events.onInputDown.add((item) => {
      item.loadTexture(item.press);
    });
    this.next.events.onInputUp.add(this.nextUpEvent, this);
  }

  nextUpEvent(item) {
    item.loadTexture(item.normal);
    this.recording.stopPlay();
    let sprite = this.getNextBall();
    if (sprite) {
      if (sprite === this.currentBall) return;
      this.scoreMessage && this.scoreMessage.destroy();
      this.changeState();
      this.currentBall = sprite;
      this.text.showDom(this.data.pages[sprite.oldIndex]);
      this.recording.init(this.newPages[sprite.oldIndex]);
      this.recording.Timeing && this.recording.clearTimeOut(this.recording.Timeing);
      this.changeNormalState();
      sprite.loadTexture(sprite.pressBall);
      this.toggleNextFinish(sprite);
    }
  }

  getNextBall() {
    let sprite = '';
    this.orderBallSpriteArr.forEach(item => {
      if (item.oldIndex === this.currentBall.oldIndex + 1) {
        sprite = item;
      }
    });
    return sprite;
  }

  createFinish() {
    this.finish = this.createSprite(680, 533, staticRes.localImage.finish);
    this.finish.normal = staticRes.localImage.finish.image;
    this.finish.press = staticRes.localImage.finishPress.image;
    this.finish.anchor.set(0.5);
    this.finish.visible = false;
    this.finish.inputEnabled = true;
    this.finish.events.onInputDown.add((item) => {
      item.loadTexture(item.press);
    });
    this.finish.events.onInputUp.add((item) => {
      this.recording.stopPlay();
      item.loadTexture(item.normal);
      this.soundStopAll(false);
      ExitUtil.exitGame();
    });
  }

  createPlayFinish() {
    this.angle = { min: 0, max: 0 };
    this.PlayFinishBg = this.createSprite(400, 550, this.data.localImage.graphicsBg);
    this.PlayFinishBg.anchor.set(0.5);
    this.PlayFinishBg.angle = -90;
    this.graphics2 = this.add.graphics(0, 0);
    this.PlayFinishBg.visible = false;
    // create innerbg
    let graphicsInnerBg = this.createSprite(0, 0, this.data.localImage.graphicsInnerNumber);
    graphicsInnerBg.anchor.set(0.5);
    this.PlayFinishBg.addChild(graphicsInnerBg);
    graphicsInnerBg.angle = 90;
    this.PlayFinishBg.graphicsInnerBg = graphicsInnerBg;
    // create inner
    let graphicsInner = this.createSprite(0, 0, this.data.localImage.graphicsInner);
    graphicsInner.anchor.set(0.5);
    graphicsInnerBg.addChild(graphicsInner);
    graphicsInnerBg.graphicsInner = graphicsInner;
    this.PlayFinishBg.events.onInputUp.add(() => {
      // 录音结束;
      this.recording.stopRecordTip();
    }, this);
  }

  recordPrelude() {
    let MaskBg = this.createMaskBg();
    return new Promise(resolve => {
      MaskBg.onComplete.add(() => {
        let style = { font: CONSTANT.DEFAULT_FONT, fill: '#FFFFFF', fontSize: '42px', fontWeight: '600' };
        this.startTime(3, style, { x: 400, y: 300 }).then(() => {
          this.tweenObj.stop();
          this.numSprite.destroy();
          this.mask.destroy();
          resolve();
        });
      });
    });
  }

  startTime(num, style, position, parent = false) {
    let pro = Promise.resolve();
    for (let i = num; i !== 0; i--) {
      pro = pro.then(() => {
        this.numSprite = this.add.text(position.x, position.y, i, style);
        this.numSprite.anchor.set(0.5);
        this.numSprite.scale.set(0.1);
        this.numSprite.alpha = 0.5;
        parent && parent.addChild(this.numSprite);
        return new Promise(resolve => {
          this.add.tween(this.numSprite).to({ alpha: 1 }, 400, 'Linear', true);
          this.tweenObj = this.add.tween(this.numSprite.scale).to({ x: 1, y: 1 }, 400, 'Linear', true);
          this.tweenObj.onComplete.add(() => {
            this.add.tween(this.numSprite).to({ alpha: 0 }, 600, 'Linear', true);
            this.tweenObj = this.add.tween(this.numSprite.scale).to({ x: 3, y: 3 }, 600, 'Linear', true);
            this.tweenObj.onComplete.add(() => {
              this.numSprite.destroy();
              resolve();
            });
          });
        });
      });
    }
    return pro;
  }

  createMaskBg() {
    let graphics = this.add.graphics(0, 0);
    graphics.beginFill(0x000000, 0.5);
    graphics.drawCircle(0, 0, 80);
    this.mask = this.add.sprite(0, 0, graphics.generateTexture());
    graphics.destroy();
    this.mask.anchor.set(0.5);
    this.mask.alpha = 0.3;
    this.mask.y = 300;
    this.mask.x = 400;
    // 不可点透事件；
    // this.mask.inputEnabled = true;
    // this.mask.input.pixelPerfectClick = true;
    return this.add.tween(this.mask).to({ height: 1000, width: 1000, alpha: 1 }, 500, 'Linear', true);
  }

  allClick(power) {
    this.playAudio.inputEnabled = power;
    this.next.inputEnabled = power;
    this.finish.inputEnabled = power;
    this.PlayFinishBg.inputEnabled = power;
    this.soundIcon.inputEnabled = power;
    this.util.setObjectArrayClicked(this.orderBallSpriteArr, power);
    this.recording.record.inputEnabled = power;
  }

  startRotate(Time) {
    this.tweenObj2 = this.add.tween(this.angle).to({ max: 365 }, Time, 'Linear', true);
  }

  playFirstSound() {
    if (this.data.firstAudio.sound) {
      this.allClick(false);
      this.playSoundPromiseByObject(this.data.firstAudio).then(() => {
        this.allClick(true);
      });
    }
  }

  createRecording() {
    this.recording = new Recording(this);
    this.recording.init(this.newPages[0]);
  }

  createText() {
    this.createSprite(0, 0, this.data.localImage.bg);
    this.newPages = this.data.isRandom ? _.shuffle(this.data.pages) : this.data.pages;
    this.text = new Text(this);
    this.text.showDom(this.newPages[0]);
  }

  initOtherScene() {
    this.scrollBall().then(() => {
      !this.data.firstAudio.sound && this.allClick(true);
      this.currentBall = this.orderBallSpriteArr[0];
      this.soundIcon.inputEnabled = true;
      this.util.setObjectArrayClicked(this.orderBallSpriteArr, true);
      this.currentBall.loadTexture(this.currentBall.pressBall);
    });
  }

  createSoundTrack() {
    this.soundTrack = this.add.sprite(380, 300, 'audioAtlas');
    this.soundTrack.anchor.set(0.5);
    this.soundTrack.animations.add('track');
    this.soundTrack.visible = false;
    this.soundTrack.animations.play('track', 10, true);
  }

  createSpeaker() {
    this.soundIcon = this.util.createSpeakerAnimationBtn(265, 522, 'circleSpeaker');
    this.soundIcon.events.onInputDown.add(item => {
      this.changeState();
      item.playSound(this.newPages[this.currentBall.oldIndex].sound, 5);
      this.playAudio.inputEnabled = true;
    });
  }

  createBall() {
    let x = 788;
    this.ballSpriteArr = [];
    this.newPages.forEach((item, index) => {
      let ball = this.createSprite(120, 70, this.data.localImage.normalBall.image);
      ball.normalBall = this.data.localImage.normalBall.image;
      ball.pressBall = this.data.localImage.pressBall.image;
      ball.finishBall = this.data.localImage.finishBall.image;
      ball.greenSoundObj = this.newPages[index];
      ball.anchor.set(0.5);
      ball.oldIndex = this.newPages.length - index - 1;
      ball.oldX = x - 58;
      ball.oldY = 70;
      ball.score = 0;
      x -= 58;
      this.ballSpriteArr.push(ball);
      ball.events.onInputUp.add(this.ballUpEvent, this);
    });
    let newBallArr = [...this.ballSpriteArr];
    this.orderBallSpriteArr = newBallArr.reverse();
    this.orderBallSpriteArr[0].isCurrent = true;
  }


  createBallAnimation(score) {
    this.currentBall.visible = false;
    this.currentBall.titleNumber.visible = false;
    this.currentBall.scoreSprite ? this.currentBall.scoreSprite.destroy() : undefined;
    this.currentBall.score = score;
    let x = this.currentBall.oldX;
    let y = this.currentBall.oldY;
    let ballAtlas = this.add.sprite(x, y, 'ballAtlas');
    ballAtlas.anchor.set(0.5);
    ballAtlas.scale.set(0.5);
    ballAtlas.animations.add('main');
    ballAtlas.animations.play('main', 10, true);
    return this.util.waitByPromise(800).then(() => {
      ballAtlas.destroy();
      this.currentBall.visible = true;
      this.currentBall.titleNumber.visible = true;
      this.currentBall.loadTexture(this.currentBall.pressBall);
      this.createBallScore(this.currentBall, score);
      return this.util.waitByPromise(10);
    });
  }

  createBallScore(item, score) {
    let fontStyle = { font: CONSTANT.DEFAULT_FONT, fill: '#FFFFFF', fontSize: '26px', fontWeight: 400 };
    let scoreSprite = this.add.text(item.oldX, item.oldY + 3, score, fontStyle);
    scoreSprite.alpha = 0.8;
    scoreSprite.anchor.set(0.5);
    item.scoreSprite = scoreSprite;
  }

  changeNormalState() {
    this.orderBallSpriteArr.forEach(item => {
      if (item.isComplete) {
        item.loadTexture(item.finishBall);
      } else {
        item.loadTexture(item.normalBall);
      }
    });
  }

  createPlayAudio() {
    this.playAudio = this.createSprite(510, 550, staticRes.localImage.playAudio);
    this.playAudio.playAudio = staticRes.localImage.playAudio.image;
    this.playAudio.playAudioStop = staticRes.localImage.playAudioStop.image;
    this.playAudio.anchor.set(0.5);
    this.playAudio.visible = false;
    this.playAudio.inputEnabled = true;
    this.playAudio.events.onInputUp.add(this.playAudioUpEvent, this);
  }

  playAudioUpEvent(item) {
    this.changeState();
    let currentPath = this.audioDetail[this.currentBall.oldIndex].audioPath;
    item.loadTexture(item.playAudioStop);
    item.inputEnabled = false;
    this.recording.recorderObj.play(currentPath).then(() => {
      item.loadTexture(item.playAudio);
      item.inputEnabled = true;
    });
  }

  createNowScore(score) {
    let style = { font: CONSTANT.DEFAULT_FONT, fill: '#FFFFFF', fontSize: '15px', fontWeight: 400 };
    this.scoreMessage = this.createSprite(525, 505, this.data.localImage.scoreMessage);
    this.scoreMessage.anchor.set(0.5);
    let nowScore = this.add.text(0, 0, score + '分', style);
    nowScore.anchor.set(0.5);
    this.scoreMessage.addChild(nowScore);
  }

  stepByStep() {
    if (this.checkIsComplete()) {
      this.next.visible = false;
      this.finish.visible = true;
    } else {
      this.next.visible = true;
    }
  }

  checkIsComplete() {
    let flag = true;
    this.orderBallSpriteArr.forEach((item) => {
      if (!item.isComplete) {
        flag = false;
      }
    });
    return flag;
  }

  ballUpEvent(item) {
    if (item === this.currentBall) return;
    this.scoreMessage && this.scoreMessage.destroy();
    this.changeState();
    this.currentBall = item;
    this.text.showDom(this.data.pages[item.oldIndex]);
    this.recording.init(this.newPages[item.oldIndex]);
    this.recording.Timeing && this.recording.clearTimeOut(this.recording.Timeing);
    this.changeNormalState();
    item.loadTexture(item.pressBall);
    this.toggleNextFinish(item);
    this.playAudio.inputEnabled = true;
  }

  toggleNextFinish(item) {
    if (item.isComplete) {
      this.playAudio.visible = true;
      if (this.checkIsComplete()) {
        this.finish.visible = true;
        this.next.visible = false;
      } else {
        this.next.visible = true;
      }
    } else {
      this.playAudio.visible = false;
      this.finish.visible = false;
      this.next.visible = false;
    }
  }

  scrollBall() {
    let titleStyle = { font: CONSTANT.DEFAULT_FONT, fill: '#FFFFFF', fontSize: '15px', fontWeight: 400 };
    let sign = this.ballSpriteArr.length;
    this.ballSpriteArr.forEach((item, index) => {
      this.add.tween(item).to({ x: item.oldX }, 1500 + index * 50, Phaser.Easing.Bounce.Out, true).onComplete.add(() => {
        let titleNumber = this.add.text(item.oldX + 10, item.oldY - 15, sign, titleStyle);
        titleNumber.alpha = 0.5;
        sign -= 1;
        titleNumber.anchor.set(0.5);
        item.titleNumber = titleNumber;
      });
    });
    return this.util.waitByPromise(2000);
  }

  createImage(page) {
    this.maskImage = this.createSprite(210, 233, this.data.localImage.bg);
    this.maskImage.height = 180;
    this.maskImage.width = 240;
    this.maskImage.anchor.set(0.5);
    this.maskImage.visible = false;
    this.image = this.createSprite(210, 233, page);
    this.image.anchor.set(0.5);
    this.util.setImgScaleToBg(this.image, this.maskImage);
  }

  isAllComplete() {
    this.sign = true;
    this.orderBallSpriteArr.forEach((item) => {
      item.isComplete ? undefined : this.sign = false;
    });
    return this.sign;
  }
}

export {
  Hwtpl613
};