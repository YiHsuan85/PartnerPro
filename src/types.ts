/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category = '食' | '衣' | '住' | '行' | '育' | '樂' | '其他';

export interface Vendor {
  id: string;
  name: string;        // 店家名稱
  category: Category;  // 類別
  discount: string;    // 優惠內容
  contractEnd: string; // 合約期限 (YYYY-MM-DD)
  address: string;     // 住址
  phone: string;       // 電話
}

export interface ContractAlert {
  vendorId: string;
  vendorName: string;
  daysRemaining: number;
  status: 'expired' | 'warning' | 'active';
}
