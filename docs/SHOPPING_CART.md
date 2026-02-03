Shopping Cart

Overview
- Lightweight shopping cart stored per-user (when logged in) or per-session for guests.

Endpoints
- GET /cart : View cart (Inertia page)
- POST /cart/items : Add an item to cart (accepts JSON or form)
- PUT /cart/items/{item} : Update item quantity
- DELETE /cart/items/{item} : Remove item
- GET /cart/summary : Returns JSON summary { items, count, total } used by the sidebar
- POST /cart/checkout : Basic checkout that reserves tickets and decrements availability

Frontend
- `resources/js/components/CartSidebar.tsx` fetches `/cart/summary` and listens for `cart:updated` events.
- `resources/js/pages/Events/Show.tsx` calls `/cart/items` via fetch and dispatches `cart:updated` on success.

Notes / Next steps
- Replace the simple checkout with a full payment integration (Stripe/PayPal).
- Add user-facing toasts instead of console logs.
- Consider sharing `cart` via Inertia shared props for more fine-grained partial reloads.
- Add end-to-end tests covering the checkout flow and edge cases (concurrent reservation failures).
