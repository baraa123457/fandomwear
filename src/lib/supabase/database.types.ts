/**
 * Hand-written to match supabase/migrations/*.sql. Once your Supabase
 * project is live, regenerate this for guaranteed accuracy:
 *
 *   npx supabase gen types typescript --project-id <your-project-ref> > src/lib/supabase/database.types.ts
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string;
          avatar_url: string | null;
          role: "customer" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string; email: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      universes: {
        Row: {
          id: string;
          label: string;
          tagline: string;
          color: string;
          icon: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["universes"]["Row"]> & { id: string; label: string };
        Update: Partial<Database["public"]["Tables"]["universes"]["Row"]>;
      };
      categories: {
        Row: { id: string; label: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]> & { id: string; label: string };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          material: string;
          universe_id: string;
          category_id: string;
          price: number;
          compare_at_price: number | null;
          sizes: string[];
          colors: { name: string; hex: string }[];
          stock: number;
          rating: number;
          review_count: number;
          tags: string[];
          art_icon: string;
          image_url: string | null;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> & {
          slug: string;
          name: string;
          universe_id: string;
          category_id: string;
          price: number;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
      };
      product_images: {
        Row: { id: string; product_id: string; image_url: string; sort_order: number; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["product_images"]["Row"]> & {
          product_id: string;
          image_url: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Row"]>;
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: "processing" | "shipped" | "delivered" | "cancelled";
          subtotal: number;
          discount: number;
          coupon_code: string | null;
          shipping: number;
          tax: number;
          total: number;
          payment_method: "card" | "cod" | null;
          shipping_address: Record<string, string>;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]> & {
          id: string;
          user_id: string;
          subtotal: number;
          total: number;
          shipping_address: Record<string, string>;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          slug: string;
          unit_price: number;
          quantity: number;
          size: string | null;
          color: string | null;
          universe_id: string | null;
          art_icon: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["order_items"]["Row"]> & {
          order_id: string;
          product_name: string;
          slug: string;
          unit_price: number;
          quantity: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          author_name: string;
          rating: number;
          title: string;
          body: string;
          size: string | null;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["reviews"]["Row"]> & {
          product_id: string;
          user_id: string;
          author_name: string;
          rating: number;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Row"]>;
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          discount_type: "percentage" | "fixed";
          discount_value: number;
          minimum_order: number;
          active: boolean;
          usage_limit: number | null;
          uses: number;
          expires_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["coupons"]["Row"]> & {
          code: string;
          discount_type: "percentage" | "fixed";
          discount_value: number;
        };
        Update: Partial<Database["public"]["Tables"]["coupons"]["Row"]>;
      };
      wishlist_items: {
        Row: { id: string; user_id: string; product_id: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["wishlist_items"]["Row"]> & {
          user_id: string;
          product_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["wishlist_items"]["Row"]>;
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      validate_coupon: {
        Args: { coupon_code: string; order_subtotal: number };
        Returns: { valid: boolean; discount: number; message: string }[];
      };
      place_order: {
        Args: {
          items: { product_id: string; quantity: number; size: string | null; color: string | null }[];
          shipping_address: Record<string, string>;
          coupon_code?: string | null;
          shipping_cost?: number;
          tax_amount?: number;
          payment_method?: string;
        };
        Returns: string;
      };
    };
  };
}
