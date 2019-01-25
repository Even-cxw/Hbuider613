import Phaser from 'phaser';
import $ from 'jquery';
import _ from 'lodash';

let publicStyle = {
  overflowY: 'auto',
  pointerEvents: 'auto',
  color: '#333333',
  fontSize: '18px',
  lineHeight:'40px',
  padding: '0 10px',
  boxSizing: 'border-box',
  fontfamily:'Century Gothic',
};

let messageStyle = {
  zIndex: '100',
  display: 'flex',
  justifyContent: 'center',
  color: '#ffffff',
  fontSize: '16px',
  boxSizing: 'border-box',
  paddingTop: '2px',
  fontFamily:'PingFangSC-Regular',
  fontWeight:'400',
  lineHeight:'22px',
};

let textStyle = {
  height: '332px',
  width: '628px',
  position: 'absolute',
  fontFamily: 'Century Gothic',
  top: '131px',
  left: '90px',
};

let TextAndImage = {
  height: '332px',
  width: '375px',
  position: 'absolute',
  fontFamily: 'Century Gothic',
  top: '131px',
  left: '346px',
};

let TextAndText = {
  height: '242px',
  width: '628px',
  position: 'absolute',
  fontFamily: 'Century Gothic',
  top: '131px',
  left: '90px',
};

let shortStyle = {
  width:'615px',
  height:'76px',
  background:'#F6E2FF',
  borderRadius:'9px',
  position: 'absolute',
  fontFamily: 'Century Gothic-Bold',
  top: '387px',
  left: '90px',
  overflow: 'hidden',
  color:'#333333',
  padding: '0 15px',
  boxSizing: 'border-box',
};

class Text extends Phaser.Group {
  constructor(game) {
    super(game);
    this.game = game;
    this.setScrollStyle();
  }

  setScrollStyle() {
    let head = document.head || document.getElementsByTagName('head')[0];
    let style = document.createElement('style');
    style.type = 'text/css';
    head.appendChild(style);
    let allSheet = document.styleSheets;
    let insertIndex = document.styleSheets[allSheet.length-1].cssRules.length;
    allSheet[allSheet.length - 1].insertRule('::-webkit-scrollbar { width: 4px; height: 16px; background-color: #DCD3EC); }', insertIndex);
    allSheet[allSheet.length - 1].insertRule('::-webkit-scrollbar-track { box-shadow: rgba(0, 0, 0, 0.3) 0px 0px 6px inset; border-radius: 10px; background-color: #DCD3EC; }', insertIndex + 1);
    allSheet[allSheet.length - 1].insertRule('::-webkit-scrollbar-thumb { border-radius: 10px; box-shadow: rgba(0, 0, 0, 0.3) 0px 0px 6px inset; background-color: #A37DDF; }', insertIndex + 2);
  }

  showDom(page) {
    this.page = page;
    let option = page;
    this.removeDom();
    if (option.image) {
      this.initTextAndImage();
    } else {
      this.initText();
    }
  }

  removeDom() {
    this.wrapper?this.wrapper.remove():undefined;
    this.shortText?this.shortText.remove():undefined;
    this.game.maskImage?this.game.maskImage.destroy():undefined;
    this.game.image?this.game.image.destroy():undefined;
  }

  createMessage(json, style) {
    this.recordingMessage?this.recordingMessage.remove():undefined;
    this.recordingMessage = $(`<div>${json}</div>`).css(messageStyle).css(style);
    $('#CoursewareDiv').append(this.recordingMessage);
  }

  removeMessage() {
    this.recordingMessage?this.recordingMessage.remove():undefined;
  }

  initText() {
    this.wrapper = $('<div></div>').css(textStyle).css(publicStyle);
    $('#CoursewareDiv').append(this.wrapper);
    // let nihao = 111;
    let text = this.page.longText;
    // let text = `We are the so-called "Vikings" from the north.${nihao}`;
    let json = unescape(text);
    let content = `<div>${json}</div>`;
    this.wrapper.append(content);

  }

  initTextAndImage() {
    this.wrapper = $('<div></div>').css(TextAndImage).css(publicStyle);
    $('#CoursewareDiv').append(this.wrapper);
    let text = this.page.longText;
    let json = unescape(text);
    let content = `<div>${json}</div>`;
    this.wrapper.append(content);
    this.game.createImage(this.page);
  }

  initTextAndText() {
    this.wrapper = $('<div></div>').css(TextAndText).css(publicStyle);
    $('#CoursewareDiv').append(this.wrapper);
    // let text = this.page.option.longText;
    let json = unescape(this.page.longText);
    let content = `<div>${json}</div>`;
    this.wrapper.append(content);

    let shortJson = unescape(this.page.shortText);
    this.shortText = $(`<div>${shortJson}</div>`).css(shortStyle);
    $('#CoursewareDiv').append(this.shortText);    
  }

}

export {
  Text
};