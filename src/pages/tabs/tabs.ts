import { Component } from '@angular/core';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tabShopping: any = 'ShoppingCurrItemListPage';
  tabCoupons: any = 'CouponListPage';

  constructor() {

  }
}
