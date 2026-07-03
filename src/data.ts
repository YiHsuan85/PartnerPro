/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vendor } from './types';

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: '1',
    name: '好時光精品咖啡館 (Good Times Coffee)',
    category: '食',
    discount: '憑員工識別證，享全品項飲品 85 折優惠，精選單品豆耳掛咖啡買一送一。',
    contractEnd: '2026-07-15', // Expiring soon (13 days left relative to 2026-07-02)
    address: '台北市大安區新生南路三段 88 號 1 樓',
    phone: '02-2362-0000'
  },
  {
    id: '2',
    name: '品味和風食堂 (Gourmet Canteen)',
    category: '食',
    discount: '消費滿 500 元贈送日式炸豆腐一份；生日當月同行皆享 9 折。',
    contractEnd: '2027-03-31', // Active
    address: '新北市板橋區文化路一段 120 號',
    phone: '02-8965-1111'
  },
  {
    id: '3',
    name: '風尚時尚服飾 (Fashion Trend)',
    category: '衣',
    discount: '全館新品享 9 折優惠；換季特賣期間出示員工證再享折上折 95 折。',
    contractEnd: '2026-12-31', // Active
    address: '台中市西區公益路 68 號 (勤美誠品旁)',
    phone: '04-2321-2222'
  },
  {
    id: '4',
    name: '運動極限潮流館 (Athletic Trend)',
    category: '衣',
    discount: '專業運動鞋款、機能服飾、運動配件，單筆消費享 88 折特惠。',
    contractEnd: '2026-06-15', // Already Expired (relative to 2026-07-02)
    address: '高雄市新興區中山一路 15 號',
    phone: '07-281-3333'
  },
  {
    id: '5',
    name: '晶華景觀大飯店 (Regent View Hotel)',
    category: '住',
    discount: '平假日住宿享商務合約價（平日 6 折、假日 8 折），含精緻雙人早餐及免費迎賓飲品。',
    contractEnd: '2026-07-28', // Expiring soon (26 days left relative to 2026-07-02)
    address: '南投縣魚池鄉日月潭環湖路 101 號',
    phone: '049-285-4444'
  },
  {
    id: '6',
    name: '綠意環保青年旅舍 (Green Hostel)',
    category: '住',
    discount: '出示工作證明，背包客單人床位每晚折抵 150 元，雙人套房享 85 折。',
    contractEnd: '2026-10-31', // Active
    address: '花蓮縣花蓮市國聯一路 250 號',
    phone: '03-833-5555'
  },
  {
    id: '7',
    name: '馳騁租車有限公司 (Gallop Car Rental)',
    category: '行',
    discount: '租車享日租金 75 折（不含保險），平日租滿兩日享第 3 日半價，全車系皆附導航與行車記錄器。',
    contractEnd: '2027-06-30', // Active
    address: '台北市大同區承德路一段 10 號',
    phone: '02-2555-6666'
  },
  {
    id: '8',
    name: '啟迪外語中心 (Inspire Language)',
    category: '育',
    discount: '多國語言（英、日、韓）實體或線上課程，報名整期享學費 8 折，免收首次建檔費 500 元。',
    contractEnd: '2027-01-15', // Active
    address: '高雄市左營區博愛二路 360 號',
    phone: '07-558-7777'
  },
  {
    id: '9',
    name: '歡樂視界影城 (Joy Cinema)',
    category: '樂',
    discount: '出示員工證，臨櫃購買電影票享團體優惠票價（每張折抵 60-80 元），爆米花可樂套餐 7 折。',
    contractEnd: '2026-09-30', // Active
    address: '台中市東區復興路四段 186 號 (大魯閣新時代)',
    phone: '04-3608-8888'
  },
  {
    id: '10',
    name: '極限挑戰攀岩館 (Limitless Climbing)',
    category: '樂',
    discount: '單人單次入場門票 8 折（含租借岩鞋與安全吊帶），團體包場體驗另有專案 75 折。',
    contractEnd: '2026-05-30', // Already Expired (relative to 2026-07-02)
    address: '新北市中和區建一路 180 號',
    phone: '02-8228-9999'
  },
  {
    id: '11',
    name: '悅禾舒活全身按摩會館 (Soothe Massage)',
    category: '其他',
    discount: '精油全身舒壓按摩 90 分鐘以上課程，出示員工證立折 300 元，並加贈肩頸舒緩熱敷。',
    contractEnd: '2026-11-30', // Active
    address: '台北市信義區忠孝東路五段 236 號',
    phone: '02-2725-1234'
  }
];
