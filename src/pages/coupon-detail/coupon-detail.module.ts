import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CouponDetailPage } from './coupon-detail';

@NgModule({
  declarations: [
    CouponDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(CouponDetailPage),
  ],
})
export class CouponDetailPageModule {}
