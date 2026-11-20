import { randomUUID } from 'node:crypto';
import type { Order, OrderItem, OrderStatus, SellerOrder, SellerOrderView } from '../db/types.js';
import { HttpError } from '../middleware/error.js';

export const money = (amount: number) => Math.round(amount * 100) / 100;

// Allocate minor units without losing pennies when splitting coupons or shipping.
function allocate(total: number, weights: number[]): number[] {
  const cents = Math.round(total * 100);
  if (weights.every(w => w === 0)) weights = weights.map(() => 1);
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map(w => cents * (w / sum));
  const parts = raw.map(Math.floor);
  let remaining = cents - parts.reduce((a, b) => a + b, 0);
  const ordered = raw.map((v, i) => ({ i, delta: v - parts[i] })).sort((a, b) => b.delta - a.delta);
  for (const { i } of ordered) if (remaining-- > 0) parts[i]++;
  return parts.map(v => v / 100);
}

export function splitOrder(items: OrderItem[], discount: number, shippingEach: number, commissionBps: number): SellerOrder[] {
  const groups = new Map<number | null, OrderItem[]>();
  for (const item of items) {
    const id = item.sellerId ?? null;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id)!.push(item);
  }
  const totals = [...groups.values()].map(group => money(group.reduce((s, i) => s + i.quantity * i.price, 0)));
  const discounts = allocate(discount, totals.map(v => Math.round(v * 100)));
  return [...groups].map(([sellerId, lines], index) => {
    const subtotal = totals[index];
    const discount = discounts[index];
    const net = money(subtotal - discount);
    const commission = sellerId === null ? 0 : money(net * commissionBps / 10000);
    return { reference: `KUJUK-S-${randomUUID()}`, sellerId, items: lines, subtotal, discount, shipping: shippingEach,
      total: money(net + shippingEach), commission, commissionBps: sellerId === null ? 0 : commissionBps,
      earnings: money(net - commission), status: 'pending' };
  });
}

const transitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing', 'cancelled'], processing: ['shipped', 'cancelled'], shipped: ['delivered'], delivered: [], cancelled: [],
};

export function changeFulfillment(order: Order, status: OrderStatus, sellerId?: number | null): { order: Order; restock: OrderItem[] } {
  const parts = order.sellerOrders ?? [];
  if (sellerId !== undefined && !parts.some(p => p.sellerId === sellerId)) throw new HttpError(404, 'Order not found');
  const restock: OrderItem[] = [];
  const change = (previous: OrderStatus, items: OrderItem[]) => {
    if (previous !== status && !transitions[previous].includes(status)) throw new HttpError(409, `Cannot change ${previous} to ${status}`);
    if (status === 'cancelled' && previous !== status) restock.push(...items);
    return status;
  };
  const sellerOrders = parts.map(p => sellerId === undefined || p.sellerId === sellerId ? { ...p, status: change(p.status, p.items) } : p);
  // A customer order is delivered (and COD collected) only once all live shipments arrive.
  const live = sellerOrders.filter(p => p.status !== 'cancelled');
  const summary: OrderStatus = sellerOrders.length === 0 ? change(order.status, order.items) :
    live.length === 0 ? 'cancelled' : live.every(p => p.status === 'delivered') ? 'delivered' :
    live.every(p => p.status === 'delivered' || p.status === 'shipped') ? 'shipped' :
    live.every(p => p.status === 'pending') ? 'pending' : 'processing';
  return { order: { ...order, sellerOrders, status: summary, updatedAt: new Date().toISOString(),
    paymentStatus: summary === 'delivered' && order.paymentMethod === 'cod' ? 'paid' : order.paymentStatus }, restock };
}

export function sellerView(order: Order, sellerId: number): SellerOrderView {
  const part = order.sellerOrders?.find(p => p.sellerId === sellerId);
  if (!part) throw new HttpError(404, 'Order not found');
  return { ...part, id: order.id, currency: order.currency, exchangeRate: order.exchangeRate,
    customer: order.customer, paymentMethod: order.paymentMethod, createdAt: order.createdAt, updatedAt: order.updatedAt };
}
