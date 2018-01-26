import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Platform } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';

const ACCESS_TOKEN : string = 'DropboxAPIV2_ACCESS_TOKEN';

@Injectable()
export class DropboxApiV2Provider {
  private accessToken: any;
  private appKey: any;
  private redirectURI: any;
  private url: any;

  constructor(public http: Http,
              private platform: Platform,
              private storage: Storage,
              private iab: InAppBrowser) {
    //OAuth
    this.appKey = '9ov0rdwqdhqrmxv';
    this.redirectURI = 'http://localhost';
    this.url = 'https://www.dropbox.com/1/oauth2/authorize?' +
                'client_id=' + this.appKey +
                '&redirect_uri=' + this.redirectURI +
                '&response_type=token';

    storage.ready().then(() => {
      storage.get(ACCESS_TOKEN).then((val) => {
        if (val !== null && val != '') {
          console.log('DropboxApiV2: access token restored');
          
          this.accessToken = val;
        }
      });
    });
  }
 
  setAccessToken(token) {
    this.accessToken = token;
    this.storage.set(ACCESS_TOKEN, this.accessToken).then(() => {
      console.log('DropboxApiV2: access token stored');
    });
  }
 
  getUserInfo() : Observable<JSON> {
    let headers = new Headers();
 
    headers.append('Authorization', 'Bearer ' + this.accessToken);
    headers.append('Content-Type', 'application/json');
  
    return this.http.post('https://api.dropboxapi.com/2/users/get_current_account', "null", {headers: headers})
      .map(res => res.json());
  }
 
  getFolders(path?) : Observable<JSON> {
    let headers = new Headers();
  
    headers.append('Authorization', 'Bearer ' + this.accessToken);
    headers.append('Content-Type', 'application/json');
  
    let folderPath;
  
    if(typeof(path) == "undefined" || !path) {
      folderPath = {
        path: ""
      };
    } else {
      folderPath = {
        path: path
      };  
    }
    return this.http.post('https://api.dropboxapi.com/2/files/list_folder', JSON.stringify(folderPath), {headers: headers})
      .map(res => res.json());
  }
 
  login() : Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let browser = this.iab.create(this.url, '_blank', this.platform.is('ios') ? 'location=yes' : 'location=no');
      let listener = browser.on('loadstart').subscribe((event: any) => {
        // Ignore the dropbox authorize screen
        if(event.url.indexOf('oauth2/authorize') > -1) {
          return;
        }

        // Check the redirect uri
        if(event.url.indexOf(this.redirectURI) > -1 ) {
          listener.unsubscribe();
          browser.close();

          let token = event.url.split('=')[1].split('&')[0];
          this.setAccessToken(token);
          resolve();
        } else {
          reject("Could not authenticate");
        }
      });
    });
  }

  isLogined() : boolean {
    return this.accessToken != null;
  }

  downloadJSON(path) : Observable<JSON> {
    let headers = new Headers();
    let dropboxAPIArg = {
      path: path,
    };
  
    headers.append('Authorization', 'Bearer ' + this.accessToken);
    headers.append('Dropbox-API-Arg', JSON.stringify(dropboxAPIArg));
    
    return this.http.post('https://content.dropboxapi.com/2/files/download',
                          null,
                          {headers: headers})
                    .map(res => res.json());
  }

  uploadJSON(path, data) : Observable<JSON> {
    let headers = new Headers();
    let dropboxAPIArg = {
      path: path,
      mode: {
        ".tag": "overwrite",
      },
    };

    headers.append('Authorization', 'Bearer ' + this.accessToken);
    headers.append('Content-Type', 'application/octet-stream');
    headers.append('Dropbox-API-Arg', JSON.stringify(dropboxAPIArg));

    return this.http.post('https://content.dropboxapi.com/2/files/upload',
                          new Blob([JSON.stringify(data)]),
                          {headers: headers})
                    .map(res => res.json());
  }
}
