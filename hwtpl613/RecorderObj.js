import $ from 'jquery';
class RecorderObj {
  constructor() {
    this.init();
  }

  // 初始化录音对象1

  init() {
    if (window.plus) {
      this.AudioRecorder = window.plus.audio.getRecorder();
    } else {
      // alert('no window.plus');
      console.log('no window.plus');
    }
  }

  stop() {
    this.AudioRecorder && this.AudioRecorder.stop();
  }

  record() {
    return new Promise((resolve, reject) => {
      if (!this.AudioRecorder) {
        reject('设备还未准备完成，耐心等待哦！');
      }
      this.AudioRecorder.record({
      },
      path => {
        this.audioSrc = path;
        resolve(path);
      },
      err => {
        console.log(err);
        // alert(err);
      }
      );
    });
  }

  play(audioPath) {
    return new Promise((resolve, reject) => {
      if (!this.audioSrc) {
        reject('未存在录音文件');
      }
      this.AudioPlayer = plus.audio.createPlayer(audioPath);
      this.AudioPlayer.play(resolve, reject);
    });
  }

  //停止播放录音
  stopPlay(cb) {
    if (this.AudioPlayer) {
      this.AudioPlayer.stop();
      typeof cb === 'function' && cb();
    }
  }

  upload(data, path) {
    return new Promise((resolve, reject) => {
      this.uploadTask = plus.uploader.createUpload('http://192.168.1.150:8012/api/ClockIn/Eval', {
        method: 'POST'
      }, (t, status) => {
        if (status === 200) {
          let JsonData;
          try{
            JsonData = JSON.parse(t.responseText);
          }catch(err){
            reject(err);
          }
          resolve(JsonData);
        } else {
          reject(t);
        }
      });
      // 上传资源地址
      this.uploadTask.addFile(path, {
        key: 'files'
      });
      // 添加其他的数据源
      let searchDetail = '';
      if (localStorage.getItem('applicationInfo')) {
        searchDetail = localStorage.getItem('applicationInfo');
      } else {
        searchDetail = '00000000-0000-0000-0000-000000000000-10899-1';
      }
      this.uploadTask.addData('Key', searchDetail);
      this.uploadTask.addData('Text', $(data.word).text());
      this.uploadTask.addData('EvalType', '2');
      this.uploadTask.addData('BatchNumber', '1');
      let token = ''; 
      if (localStorage.getItem('token')) {
        token = localStorage.getItem('token');
      } else {
        token = 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjhiY2M0Yzg0NGRlYjlkNGEzMDU5NzQ4OWEzOGQ2YWI4IiwidHlwIjoiSldUIn0.eyJuYmYiOjE1NDY0ODY0NDYsImV4cCI6MTU0NjQ5MDA0NiwiaXNzIjoiaHR0cDovL29hdXRoLjQwMDY2ODg5OTEuY29tIiwiYXVkIjpbImh0dHA6Ly9vYXV0aC40MDA2Njg4OTkxLmNvbS9yZXNvdXJjZXMiLCJDcm1BcGkiXSwiY2xpZW50X2lkIjoiY2xpZW50U3R1ZGVudCIsInN1YiI6IjAyMGY2ODQzLTVhZDItNGIxZC1hMjI5LTE0MGQwZDFhMWQ0MSIsImF1dGhfdGltZSI6MTU0NjQ4NjQ0NiwiaWRwIjoibG9jYWwiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiIwODExIiwiZnVsbE5hbWUiOiJpYW7mtYvor5UiLCJpbnN0aXR1dGlvbklkIjoiOTFlNDBkMzgtMDliYS00MDRhLThhOTItYjgzNWNmYjBjMzM1IiwidXNlck5hbWUiOiIwODExIiwiaXNTdHVkZW50IjoiMSIsInNjb3BlIjpbIm9wZW5pZCIsInByb2ZpbGUiLCJDcm1BcGkiLCJvZmZsaW5lX2FjY2VzcyJdLCJhbXIiOlsiY3VzdG9tIl19.eKKNJDKuuVn1XdsHK0_DbzNdNFEPm8udSv4OunMExkKBzQvyCun_1DK96mYZHiS4klE4IOpNH5fzdatlAK6FO2-9Wli4hrZaay0CC-sTNDPKkAsHXVWjZKLeqr9Q3nXfNFXMBniATMRf9WRcZo0jUeEXNTwyTeLVSRR1J8V3LdWDXz_jY063EKaJC914wZdZMYWpFm3C-6T1dAX6dtfpzFqFeptkCwX8AGynCyEPpErMROLa_1XBD3rUboDSz2Ti3ufcaXwAY8xlNb9-epxMBbUsWVBO6ho5_vZ_Sl8idZIJZwMRkYXe3lzoxIGuK5g_w57vieO3RLq8vI2YgJakGw';
      }
      this.uploadTask.setRequestHeader('Authorization', 'Bearer '+ token);
      this.uploadTask.start();
    });
  }
}

export default RecorderObj;
