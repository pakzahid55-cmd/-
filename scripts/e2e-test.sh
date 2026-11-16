#!/usr/bin/env bash
# KAJOK end-to-end API test suite (runs against the live dev server + API)
BASE="http://127.0.0.1:5173"
PASS=0; FAIL=0
BEMAIL="buyer-$RANDOM-$RANDOM@test.com"
ok()   { PASS=$((PASS+1)); echo "  ✓ $1"; }
fail() { FAIL=$((FAIL+1)); echo "  ✗ $1  ($2)"; }

j() { python3 -c "import json,sys; d=json.load(sys.stdin); print($1)"; }

echo "── Health & catalog ─────────────────────"
curl -sf "$BASE/api/health" | j "d['ok']" | grep -q True && ok "API health" || fail "API health" "down"

N=$(curl -sf "$BASE/api/products?limit=1" | j "d['total']")
[ "$N" -ge 12 ] && ok "Product catalog ($N products)" || fail "Product catalog" "only $N"

C=$(curl -sf "$BASE/api/categories" | j "len(d['items'])")
[ "$C" -eq 6 ] && ok "Categories ($C)" || fail "Categories" "$C"

B=$(curl -sf "$BASE/api/brands" | j "len(d['items'])")
[ "$B" -ge 6 ] && ok "Brands ($B)" || fail "Brands" "$B"

BN=$(curl -sf "$BASE/api/banners" | j "len(d['items'])")
[ "$BN" -ge 2 ] && ok "Banners ($BN)" || fail "Banners" "$BN"

echo "── Search ───────────────────────────────"
S=$(curl -sf "$BASE/api/products/suggest?q=headphones" | j "len(d['products'])")
[ "$S" -ge 1 ] && ok "Instant suggestions" || fail "Instant suggestions" "$S"
S2=$(curl -sf "$BASE/api/products?q=watch&sort=price-asc" | j "d['items'][0]['nameEn']" )
echo "$S2" | grep -qi watch && ok "Search by keyword + sort" || fail "Search by keyword" "$S2"
S3=$(curl -sf "$BASE/api/products?category=beauty&maxPrice=50" | j "len(d['items'])")
[ "$S3" -ge 2 ] && ok "Filter category + price range ($S3)" || fail "Filters" "$S3"

echo "── Product detail ───────────────────────"
P=$(curl -sf "$BASE/api/products/pulse-pro-smart-watch")
echo "$P" | j "d['product']['slug']" | grep -q pulse && ok "Product detail by slug" || fail "Product detail" "missing"
echo "$P" | j "len(d['related'])" | grep -qv '^0$' && ok "Related products" || fail "Related products" "none"

echo "── Auth ─────────────────────────────────"
TOKEN=$(curl -sf -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"sara@example.com","password":"Customer123!"}' | j "d['token']")
[ -n "$TOKEN" ] && ok "Customer login" || fail "Customer login" "no token"

ATOKEN=$(curl -sf -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"admin@kajok.com","password":"Admin123!"}' | j "d['token']")
[ -n "$ATOKEN" ] && ok "Admin login" || fail "Admin login" "no token"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"sara@example.com","password":"WRONG"}')
[ "$CODE" = "401" ] && ok "Wrong password rejected (401)" || fail "Wrong password" "$CODE"

RTOKEN=$(curl -sf -X POST "$BASE/api/auth/register" -H 'Content-Type: application/json' \
  -d "{\"name\":\"Test Buyer\",\"email\":\"$BEMAIL\",\"password\":\"Test1234\",\"phone\":\"+201111111111\"}" | j "d['token']")
[ -n "$RTOKEN" ] && ok "Register new customer" || fail "Register" "no token"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/auth/register" -H 'Content-Type: application/json' \
  -d "{\"name\":\"Test Buyer\",\"email\":\"$BEMAIL\",\"password\":\"Test1234\"}")
[ "$CODE" = "409" ] && ok "Duplicate email rejected (409)" || fail "Duplicate email" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/auth/register" -H 'Content-Type: application/json' \
  -d '{"name":"Weak","email":"weak@test.com","password":"abc"}')
[ "$CODE" = "400" ] && ok "Weak password rejected (400)" || fail "Weak password" "$CODE"

echo "── Protected routes ─────────────────────"
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/orders")
[ "$CODE" = "401" ] && ok "Orders requires auth (401)" || fail "Orders unauth" "$CODE"
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/admin/stats" -H "Authorization: Bearer $TOKEN")
[ "$CODE" = "403" ] && ok "Admin blocks customers (403)" || fail "Admin authz" "$CODE"
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/admin/stats" -H "Authorization: Bearer garbage")
[ "$CODE" = "401" ] && ok "Invalid token rejected (401)" || fail "Invalid token" "$CODE"

echo "── Cart / Coupons ───────────────────────"
D=$(curl -sf -X POST "$BASE/api/coupons/validate" -H 'Content-Type: application/json' -d '{"code":"KAJOK20","subtotal":200}' | j "d['discount']")
[ "$D" = "40.0" ] || [ "$D" = "40" ] && ok "Coupon KAJOK20 → \$40 off" || fail "Coupon" "$D"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/coupons/validate" -H 'Content-Type: application/json' -d '{"code":"NOPE","subtotal":200}')
[ "$CODE" = "400" ] && ok "Invalid coupon rejected" || fail "Invalid coupon" "$CODE"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/coupons/validate" -H 'Content-Type: application/json' -d '{"code":"KAJOK20","subtotal":10}')
[ "$CODE" = "400" ] && ok "Min-order enforced" || fail "Min-order" "$CODE"

echo "── Checkout ─────────────────────────────"
STOCK_BEFORE=$(curl -sf "$BASE/api/products/airflex-running-sneakers" | j "d['product']['stock']")
ORDER=$(curl -sf -X POST "$BASE/api/orders" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"items":[{"productId":4,"quantity":2}],"customer":{"name":"Sara Hassan","phone":"+201000000002","country":"Egypt","city":"Alexandria","address":"12 Corniche Road","instructions":"Test note"},"paymentMethod":"cod","couponCode":"WELCOME10"}')
REF=$(echo "$ORDER" | j "d['order']['reference']")
TOT=$(echo "$ORDER" | j "d['order']['total']")
[ -n "$REF" ] && ok "Order placed ($REF, total \$$TOT)" || fail "Place order" "$ORDER"

STOCK_AFTER=$(curl -sf "$BASE/api/products/airflex-running-sneakers" | j "d['product']['stock']")
[ "$STOCK_AFTER" -eq $((STOCK_BEFORE - 2)) ] && ok "Stock decremented ($STOCK_BEFORE → $STOCK_AFTER)" || fail "Stock" "$STOCK_BEFORE→$STOCK_AFTER"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/orders" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"items":[{"productId":1,"quantity":1}],"customer":{"name":"Sara Hassan","phone":"1234567","country":"Egypt","city":"Cairo","address":"Some address 123"},"paymentMethod":"online"}')
[ "$CODE" = "400" ] && ok "Online payment correctly refused (not activated)" || fail "Online payment guard" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/orders" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"items":[{"productId":999999,"quantity":1}],"customer":{"name":"Sara Hassan","phone":"1234567","country":"Egypt","city":"Cairo","address":"Some address 123"},"paymentMethod":"cod"}')
[ "$CODE" = "400" ] && ok "Unknown product rejected" || fail "Unknown product" "$CODE"

MY=$(curl -sf "$BASE/api/orders" -H "Authorization: Bearer $TOKEN" | j "len(d['items'])")
[ "$MY" -ge 3 ] && ok "Order history ($MY orders)" || fail "Order history" "$MY"

TR=$(curl -sf "$BASE/api/orders/track/$REF" | j "d['order']['status']")
[ "$TR" = "pending" ] && ok "Public tracking ($REF → $TR)" || fail "Tracking" "$TR"

echo "── Reviews ──────────────────────────────"
curl -sf -X POST "$BASE/api/products/5/reviews" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"rating":5,"comment":"Excellent quality and fast delivery!"}' | j "d['review']['rating']" | grep -q 5 && ok "Submit review" || fail "Review" "failed"
RC=$(curl -sf "$BASE/api/products/voyager-leather-backpack" | j "len(d['reviews'])")
[ "$RC" -ge 1 ] && ok "Reviews listed on product ($RC)" || fail "Reviews listed" "$RC"

echo "── Account ──────────────────────────────"
curl -sf -X PUT "$BASE/api/auth/profile" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"Sara H."}' | j "d['user']['name']" | grep -q "Sara H." && ok "Update profile" || fail "Update profile" "failed"
ADDR=$(curl -sf -X POST "$BASE/api/auth/addresses" -H "Authorization: Bearer $RTOKEN" -H 'Content-Type: application/json' \
  -d '{"label":"Work","fullName":"Test Buyer","phone":"+201111111111","country":"Egypt","city":"Giza","address":"5 Sphinx St","isDefault":true}' | j "d['address']['id']")
[ -n "$ADDR" ] && ok "Add address (#$ADDR)" || fail "Add address" "failed"
AL=$(curl -sf "$BASE/api/auth/addresses" -H "Authorization: Bearer $RTOKEN" | j "len(d['items'])")
[ "$AL" -ge 1 ] && ok "List addresses ($AL)" || fail "List addresses" "$AL"

echo "── Admin ────────────────────────────────"
ST=$(curl -sf "$BASE/api/admin/stats" -H "Authorization: Bearer $ATOKEN")
echo "$ST" | j "d['totalProducts']" | grep -q 12 && ok "Dashboard stats" || fail "Dashboard stats" "bad"
echo "$ST" | j "len(d['salesByDay'])" | grep -q 14 && ok "14-day sales series" || fail "Sales series" "bad"

NEW=$(curl -sf -X POST "$BASE/api/admin/products" -H "Authorization: Bearer $ATOKEN" -H 'Content-Type: application/json' \
  -d '{"slug":"test-widget","nameEn":"Test Widget","nameAr":"أداة اختبار","descriptionEn":"Test","descriptionAr":"اختبار","price":10,"discountPrice":null,"brandId":1,"categoryId":1,"stock":5,"images":["/images/products/watch.jpg"],"specs":{},"isFeatured":false,"isNew":true}' | j "d['product']['id']")
[ -n "$NEW" ] && ok "Admin create product (#$NEW)" || fail "Admin create" "failed"
curl -sf -X PUT "$BASE/api/admin/products/$NEW" -H "Authorization: Bearer $ATOKEN" -H 'Content-Type: application/json' \
  -d '{"stock":25}' | j "d['product']['stock']" | grep -q 25 && ok "Admin update product" || fail "Admin update" "failed"
curl -sf -X DELETE "$BASE/api/admin/products/$NEW" -H "Authorization: Bearer $ATOKEN" | j "d['ok']" | grep -q True && ok "Admin delete product" || fail "Admin delete" "failed"

OID=$(curl -sf "$BASE/api/admin/orders" -H "Authorization: Bearer $ATOKEN" | j "d['items'][0]['id']")
curl -sf -X PUT "$BASE/api/admin/orders/$OID/status" -H "Authorization: Bearer $ATOKEN" -H 'Content-Type: application/json' \
  -d '{"status":"processing"}' | j "d['order']['status']" | grep -q processing && ok "Update order status" || fail "Order status" "failed"

CC=$(curl -sf -X POST "$BASE/api/admin/coupons" -H "Authorization: Bearer $ATOKEN" -H 'Content-Type: application/json' \
  -d '{"code":"TESTCODE","type":"fixed","value":5,"minOrder":0,"active":true,"expiresAt":null}' | j "d['coupon']['code']")
[ "$CC" = "TESTCODE" ] && ok "Admin create coupon" || fail "Admin coupon" "$CC"
CID=$(curl -sf "$BASE/api/admin/coupons" -H "Authorization: Bearer $ATOKEN" | j "[c['id'] for c in d['items'] if c['code']=='TESTCODE'][0]")
curl -sf -X DELETE "$BASE/api/admin/coupons/$CID" -H "Authorization: Bearer $ATOKEN" | j "d['ok']" | grep -q True && ok "Admin delete coupon" || fail "Admin delete coupon" "failed"

CU=$(curl -sf "$BASE/api/admin/customers" -H "Authorization: Bearer $ATOKEN" | j "len(d['items'])")
[ "$CU" -ge 3 ] && ok "Admin customers list ($CU)" || fail "Customers" "$CU"

BM=$(curl -sf "$BASE/api/admin/banners" -H "Authorization: Bearer $ATOKEN" | j "len(d['items'])")
[ "$BM" -ge 2 ] && ok "Admin banners ($BM)" || fail "Banners" "$BM"

echo "── Media uploads ────────────────────────"
printf 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' | base64 -d > /tmp/kajok-test.png
UP=$(curl -sf -X POST "$BASE/api/uploads" -H "Authorization: Bearer $ATOKEN" -F "file=@/tmp/kajok-test.png;type=image/png" | j "d['url']")
[ -n "$UP" ] && ok "Admin image upload ($UP)" || fail "Image upload" "failed"
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$UP")
[ "$CODE" = "200" ] && ok "Uploaded file served ($CODE)" || fail "Upload serve" "$CODE"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/uploads" -H "Authorization: Bearer $RTOKEN" -F "file=@/tmp/kajok-test.png;type=image/png")
[ "$CODE" = "403" ] && ok "Customer upload refused (403)" || fail "Upload authz" "$CODE"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/uploads" -H "Authorization: Bearer $ATOKEN" -F "file=@/tmp/kajok-test.png;type=text/plain")
[ "$CODE" != "201" ] && ok "Non-media upload rejected ($CODE)" || fail "Upload filter" "$CODE"

echo ""
echo "─── Firebase Identity ─────────────────────"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/auth/firebase" -H 'Content-Type: application/json' -d '{"idToken":"garbage-not-a-real-token-garbage"}')
[ "$CODE" = "400" ] && ok "Garbage Firebase token rejected (400)" || fail "Firebase token validation" "$CODE"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/auth/firebase" -H 'Content-Type: application/json' -d '{}')
[ "$CODE" = "400" ] && ok "Missing Firebase idToken rejected (400)" || fail "Firebase body validation" "$CODE"

echo "─────────────────────────────────────────"
echo "PASSED: $PASS   FAILED: $FAIL"
[ "$FAIL" -eq 0 ] && echo "ALL TESTS PASSED" || echo "SOME TESTS FAILED"
exit $FAIL
