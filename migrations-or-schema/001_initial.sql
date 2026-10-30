PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users (
 user_id TEXT PRIMARY KEY, role TEXT NOT NULL CHECK(role IN ('Buyer','Farmer','Administrator')),
 verified INTEGER NOT NULL CHECK(verified IN (0,1))
);
CREATE TABLE IF NOT EXISTS listings (
 listing_id TEXT PRIMARY KEY, farmer_id TEXT NOT NULL REFERENCES users(user_id), crop TEXT NOT NULL,
 grade TEXT NOT NULL, district TEXT NOT NULL, unit_price REAL NOT NULL CHECK(unit_price>0),
 total_quantity INTEGER NOT NULL CHECK(total_quantity>0), reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK(reserved_quantity>=0),
 confirmed_quantity INTEGER NOT NULL DEFAULT 0 CHECK(confirmed_quantity>=0),
 state TEXT NOT NULL CHECK(state IN ('Active','SoldOut','Expired')),
 available_until TEXT NOT NULL,
 CHECK(reserved_quantity+confirmed_quantity<=total_quantity)
);
CREATE TABLE IF NOT EXISTS orders (
 order_id TEXT PRIMARY KEY, listing_id TEXT NOT NULL REFERENCES listings(listing_id),
 buyer_id TEXT NOT NULL REFERENCES users(user_id), quantity INTEGER NOT NULL CHECK(quantity>0),
 state TEXT NOT NULL CHECK(state IN ('Placed','Confirmed','Declined')),
 idempotency_token TEXT NOT NULL UNIQUE, request_signature TEXT NOT NULL,
 created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS order_status_events (
 event_id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(order_id),
 to_state TEXT NOT NULL, occurred_at TEXT NOT NULL
);
