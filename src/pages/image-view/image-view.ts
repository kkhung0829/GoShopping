import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-image-view',
  templateUrl: 'image-view.html',
})
export class ImageViewPage {
  title: string;
  imgURI: string;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private viewCtrl: ViewController) {}

  ionViewDidLoad() {
    this.title = this.navParams.get('title');
    this.imgURI = this.navParams.get('imgURI');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
