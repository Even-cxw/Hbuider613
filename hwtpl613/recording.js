import Phaser from 'phaser';
import staticRes from './static-resource.json';
import RecorderObj from './RecorderObj.js';
import { getScore } from '../../framework/util/apis';
import { CONSTANT } from '../../framework/core/Constant';
import ExitUtil from '../../framework/plugins/exitUtil';

class Recording extends Phaser.Group {
  constructor(game) {
    super(game);
    this.game = game;
    this.recorderObj = new RecorderObj();
  }

  init(page) {
    this.page = page;
    this.removeAll();
    this.createUI();
  }

  createUI() {
    this.createRecord();
    this.createMessage();
  }

  createMessage() {
    let style = { font: CONSTANT.DEFAULT_FONT, fill: '#FFFFFF', fontSize: '16px', fontWeight: '400' };
    this.message = this.game.createSprite(430, 503, staticRes.localImage.recordedMessage);
    this.message.anchor.set(0.5);
    let messageInfo = this.game.add.text(0, -2, '正在评分', style);
    messageInfo.anchor.set(0.5);
    this.message.addChild(messageInfo);
    this.add(this.message);
    this.message.visible = false;
  }

  createRecord() {
    let record = this.game.createSprite(400, 552, staticRes.localImage.record);
    record.normal = staticRes.localImage.record.image;
    record.press = staticRes.localImage.recordPress.image;
    record.anchor.set(0.5);
    this.add(record);
    record.inputEnabled = true;
    record.events.onInputDown.add(this.recordDownEvent, this);
    record.events.onInputUp.add(this.recordUpEvent, this);
    this.record = record;
  }

  recordDownEvent(item) {
    this.game.playSoundPromiseByObject('');
    this.recorderObj.stopPlay();
    this.game.soundStopAll(false);

    item.loadTexture(item.press);
  }

  startRecord() {
    this.recorderObj.record().then((data) => {
      this.message.visible = true;
      this.sendAxios(data);
    });
  }

  stopRecord() {
    this.recorderObj.stop();
  }

  stopPlay() {
    this.recorderObj.stopPlay();
  }


  sendAxios(data) {
    let json = unescape(this.page.longText);
    this.game.changeAudioDetail(data);
    this.currentPath = this.game.audioDetail[this.game.currentBall.oldIndex].audioPath;
    this.recorderObj.upload({ word: json }, this.currentPath).then(() => {
      this.getEvalData();
    });
  }

  clearTimeOut() {
    this.recordedTiming ? clearTimeout(this.recordedTiming) : undefined;
    this.clearRecordedTiming ? clearTimeout(this.clearRecordedTiming) : undefined;
    this.recordingTiming ? clearTimeout(this.recordingTiming) : undefined;
  }

  recordUpEvent(item) {
    // this.stopPlay();
    this.game.allClick(false);
    this.game.changeState();
    item.loadTexture(item.normal);
    item.visible = false;
    this.game.PlayFinishBg.visible = true;
    this.game.util.waitByPromise(3200).then(() => {
      // 解决录音延迟问题
      this.startRecord();
    });

    this.game.recordPrelude().then(() => {
      this.game.PlayFinishBg.inputEnabled = true;
      let time = this.page.time*1000;
      this.game.startRotate(time);
      // 开始录音的时候 总是延迟录音，解决办法；提前500毛秒开始录音 
      // this.startRecord();
      // 开始旋转圈圈了;开始录音；
      return this.startTime(time - 5000);
    }).then(() => {
      // 录音结束；
      this.stopRecordTip();
    });
  }

  startTime(time) {
    let style = { font: CONSTANT.DEFAULT_FONT, fill: '#FFFFFF', fontSize: '18px', fontWeight: '600' };
    return new Promise(resolve => {
      this.Timeing = setTimeout(() => {
        this.game.PlayFinishBg.graphicsInnerBg.graphicsInner.visible = false;
        this.game.startTime(5, style, { x: 0, y: 3 }, this.game.PlayFinishBg.graphicsInnerBg).then(() => {
          resolve();
        });
      }, time);
    });
  }

  stopRecordTip() {
    this.stopRecord();
    this.game.angle = { min: 0, max: 0 };
    this.game.tweenObj.stop();
    this.game.tweenObj2.stop();
    this.game.PlayFinishBg.visible = false;
    this.game.PlayFinishBg.graphicsInnerBg.graphicsInner.visible = true;
    this.game.PlayFinishBg.inputEnabled = false;
    this.record.visible = true;
    this.Timeing && clearTimeout(this.Timeing);
  }

  getEvalData() {
    if (this.fetchCount > 70) {
      alert('获取评分失败');
      ExitUtil.exitGame();
      return;
    }
    setTimeout(() => {
      this.fetchCount++;
      getScore({
        type: 2
      }).then(data => {
        if (!data) {
          this.getEvalData();
        } else {
          // success get score
          this.getScored(data);
        }
      });
    }, 100);
  }

  getScored(data) {
    this.message.visible = false;
    this.score = parseInt(data.score);
    this.playSound(this.score);
    this.game.scoreMessage && this.game.scoreMessage.destroy();
    this.game.createNowScore(this.score);
    this.game.scoreMessage.visible = false;
    if (this.score > this.game.currentBall.score || this.score === this.game.currentBall.score) {
      this.game.createBallAnimation(this.score).then(() => {
        this.game.currentBall.isComplete = true;
        this.game.stepByStep();
        this.game.allClick(true);
        this.game.playAudio.visible = true;
        this.game.scoreMessage.visible = true;
      });
    } else {
      this.game.util.waitByPromise(800).then(() => {
        this.game.currentBall.isComplete = true;
        this.game.stepByStep();
        this.game.allClick(true);
        this.game.playAudio.visible = true;
        this.game.scoreMessage.visible = true;
      });
    }
  }

  playSound(score) {
    if (score < 60) {
      this.game.playSoundPromiseByObject(staticRes.localSound.try_again);
    } else if (score >= 60  && score < 80 ) {
      this.game.playSoundPromiseByObject(staticRes.localSound.great_job);
    } else if (score >= 80 && score < 90) {
      this.game.playSoundPromiseByObject(staticRes.localSound.doing_great);
    } else {
      this.game.playSoundPromiseByObject(staticRes.localSound.fantastic);
    }
  }
}

export {
  Recording
};