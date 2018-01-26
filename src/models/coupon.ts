import { CouponUsage } from './coupon-usage';

export interface Coupon {
    _id?: any;
    _rev?: any;
    name: string;
    startDate: number;
    endDate: number;
    numUnit: number;
    usages: CouponUsage[];
}