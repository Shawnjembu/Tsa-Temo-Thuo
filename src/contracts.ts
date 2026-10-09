/** Lab 09 TypeScript *illustration*, not proof of a chosen project framework.
 * Aligned with Lab 07 ADR-001 and Lab 08 logical data/API contract.
 * All repositories provided to a transaction callback MUST participate in the SAME DB transaction.
 */
export type Id = string;
export type OrderState = 'Placed'|'Confirmed'|'Assigned'|'InTransit'|'Delivered'|'Declined'|'Cancelled'|'ReservationExpired';
export type ListingState = 'Active'|'SoldOut'|'Expired';
export interface PlaceOrderRequest { listingId: Id; quantity: number; }
export interface PlaceOrderContext { buyerId: Id; idempotencyToken: string; }
export interface OrderRecord {
  orderId: Id; listingId: Id; buyerId: Id; quantity: number;
  state: OrderState; reservedAt: string; reservationExpiresAt: string;
  idempotencyToken: string;
}
export interface ListingRecord {
  listingId: Id; state: ListingState; totalQuantity: number;
  reservedQuantity: number; confirmedQuantity: number;
  /** Derived; MUST NOT be stored independently. */
  availableQuantity: number;
}
export type ReservationOutcome =
  | { kind: 'reserved'; listing: ListingRecord }
  | { kind: 'not_found' }
  | { kind: 'not_active'; listingState: 'SoldOut'|'Expired' }
  | { kind: 'insufficient'; maxAvailable: number };
export interface ListingRepository {
  /** Must use row-level lock or atomic guarded update within the enclosing transaction. */
  tryReserve(listingId: Id, quantity: number): Promise<ReservationOutcome>;
}
export interface OrderRepository {
  findByIdempotencyToken(token: string): Promise<OrderRecord|null>;
  save(order: OrderRecord): Promise<void>; // DB UNIQUE(Order.idempotencyToken)
}
export interface OrderStatusEventRepository {
  append(event: { eventId: Id; orderId: Id; toState: OrderState; occurredAt: string }): Promise<void>;
}
export interface PlaceOrderTransaction {
  listing: ListingRepository; orders: OrderRepository; history: OrderStatusEventRepository;
}
export interface UnitOfWork {
  execute<T>(work: (tx: PlaceOrderTransaction) => Promise<T>): Promise<T>;
}
export interface BuyerAuthorization {
  requireVerifiedBuyer(buyerId: Id): Promise<void>;
}
export interface PlaceOrderServicePort {
  /** API adapter authenticates session, validates request shape and maps Lab 08 response/errors. */
  placeOrder(request: PlaceOrderRequest, context: PlaceOrderContext): Promise<OrderRecord>;
}
export interface SmsGatewayStub { notifyOrderPlaced(orderId: Id): Promise<void>; }
export interface RoutingStub { lookupRoute(orderId: Id): Promise<void>; }
/** Called OUTSIDE DB commit. Failures logged separately and do not cancel committed orders. */
