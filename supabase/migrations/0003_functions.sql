-- FandomWear — secure RPCs
-- These run with SECURITY DEFINER so they can read/write beyond what a
-- customer's own RLS policies allow (e.g. reading the coupons table, or
-- decrementing another row's stock) while keeping the actual authorization
-- logic tightly scoped inside the function body. Call these instead of
-- writing to orders/order_items/products.stock directly from the client.

-- ---------------------------------------------------------
-- validate_coupon(code, subtotal) -> discount amount to apply
-- ---------------------------------------------------------
create or replace function public.validate_coupon(coupon_code text, order_subtotal numeric)
returns table (valid boolean, discount numeric, message text)
language plpgsql
security definer set search_path = public
as $$
declare
  c public.coupons%rowtype;
begin
  select * into c from public.coupons where upper(code) = upper(coupon_code);

  if not found then
    return query select false, 0::numeric, 'Coupon not found';
    return;
  end if;
  if not c.active then
    return query select false, 0::numeric, 'Coupon is no longer active';
    return;
  end if;
  if c.expires_at is not null and c.expires_at < now() then
    return query select false, 0::numeric, 'Coupon has expired';
    return;
  end if;
  if c.usage_limit is not null and c.uses >= c.usage_limit then
    return query select false, 0::numeric, 'Coupon usage limit reached';
    return;
  end if;
  if order_subtotal < c.minimum_order then
    return query select false, 0::numeric, format('Minimum order of $%s required', c.minimum_order);
    return;
  end if;

  if c.discount_type = 'percentage' then
    return query select true, round(order_subtotal * (c.discount_value / 100), 2), 'ok';
  else
    return query select true, least(c.discount_value, order_subtotal), 'ok';
  end if;
end;
$$;

grant execute on function public.validate_coupon(text, numeric) to authenticated, anon;

-- ---------------------------------------------------------
-- place_order(...) -> creates order + order_items, decrements stock,
-- atomically. Prices come from the products table, never from the client.
-- ---------------------------------------------------------
create type public.order_item_input as (
  product_id uuid,
  quantity integer,
  size text,
  color text
);

create or replace function public.place_order(
  items public.order_item_input[],
  shipping_address jsonb,
  coupon_code text default null,
  shipping_cost numeric default 0,
  tax_amount numeric default 0,
  payment_method text default 'card'
)
returns text -- the new order id
language plpgsql
security definer set search_path = public
as $$
declare
  new_order_id text;
  item public.order_item_input;
  product public.products%rowtype;
  computed_subtotal numeric := 0;
  discount_amount numeric := 0;
  coupon_valid boolean := true;
  coupon_message text;
  order_total numeric;
begin
  if auth.uid() is null then
    raise exception 'Must be signed in to place an order';
  end if;
  if array_length(items, 1) is null or array_length(items, 1) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  -- Validate stock and compute the real subtotal from current DB prices —
  -- never trust price/stock values sent by the browser.
  foreach item in array items loop
    select * into product from public.products where id = item.product_id for update;
    if not found then
      raise exception 'Product % no longer exists', item.product_id;
    end if;
    if product.stock < item.quantity then
      raise exception 'Not enough stock for %: % left, % requested', product.name, product.stock, item.quantity;
    end if;
    computed_subtotal := computed_subtotal + (product.price * item.quantity);
  end loop;

  if coupon_code is not null and coupon_code <> '' then
    select v.valid, v.discount, v.message
      into coupon_valid, discount_amount, coupon_message
      from public.validate_coupon(coupon_code, computed_subtotal) v;
    if not coupon_valid then
      raise exception 'Coupon error: %', coupon_message;
    end if;
  end if;

  order_total := computed_subtotal - coalesce(discount_amount, 0) + coalesce(shipping_cost, 0) + coalesce(tax_amount, 0);
  new_order_id := 'FW-' || floor(10000 + random() * 89999)::int;

  insert into public.orders (id, user_id, status, subtotal, discount, coupon_code, shipping, tax, total, payment_method, shipping_address)
  values (new_order_id, auth.uid(), 'processing', computed_subtotal, coalesce(discount_amount, 0), nullif(coupon_code, ''), coalesce(shipping_cost, 0), coalesce(tax_amount, 0), order_total, coalesce(payment_method, 'card'), shipping_address);

  foreach item in array items loop
    select * into product from public.products where id = item.product_id;
    insert into public.order_items (order_id, product_id, product_name, slug, unit_price, quantity, size, color, universe_id, art_icon)
    values (new_order_id, product.id, product.name, product.slug, product.price, item.quantity, item.size, item.color, product.universe_id, product.art_icon);

    update public.products set stock = stock - item.quantity where id = product.id;
  end loop;

  if coupon_code is not null and coupon_code <> '' then
    update public.coupons set uses = uses + 1 where upper(code) = upper(coupon_code);
  end if;

  return new_order_id;
end;
$$;

grant execute on function public.place_order(public.order_item_input[], jsonb, text, numeric, numeric, text) to authenticated;
