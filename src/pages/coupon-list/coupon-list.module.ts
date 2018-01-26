import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CouponListPage } from './coupon-list';
import { DirectivesModule } from '../../directives/directives.module';

@NgModule({
  declarations: [
    CouponListPage,
  ],
  imports: [
    IonicPageModule.forChild(CouponListPage),
    DirectivesModule,
  ],
})
export class CouponListPageModule {}
