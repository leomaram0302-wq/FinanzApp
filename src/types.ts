/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  type: 'ingreso' | 'gasto';
  description: string;
  amount: number;
  date: string; // Formato YYYY-MM-DD
  category: 'Gaming' | 'Alimentos' | 'Transporte' | 'Estudios' | 'Otros';
}

export interface Coupon {
  id: string;
  title: string;
  description: string;
  discount: string;
  code: string;
  category: string;
  icon: string;
  activated: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'fini';
  text: string;
  timestamp: string;
}
