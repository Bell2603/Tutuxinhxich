export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      order_events: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: number;
          note: string;
          order_id: string;
          status: Database["public"]["Enums"]["order_status"];
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: never;
          note?: string;
          order_id: string;
          status: Database["public"]["Enums"]["order_status"];
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: never;
          note?: string;
          order_id?: string;
          status?: Database["public"]["Enums"]["order_status"];
        };
        Relationships: [
          {
            foreignKeyName: "order_events_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_events_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: number;
          image_url: string;
          line_total: number;
          order_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          sku: string;
          unit_price: number;
        };
        ComputedFields: never;
        Insert: {
          id?: never;
          image_url?: string;
          line_total: number;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          quantity: number;
          sku: string;
          unit_price: number;
        };
        Update: {
          id?: never;
          image_url?: string;
          line_total?: number;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          quantity?: number;
          sku?: string;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          address: string;
          client_request_id: string;
          code: string;
          created_at: string;
          id: string;
          item_count: number;
          note: string;
          payment_method: Database["public"]["Enums"]["payment_method"];
          phone: string;
          province: string;
          recipient_name: string;
          shipping_fee: number;
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          updated_at: string;
          user_id: string | null;
          ward: string;
        };
        ComputedFields: never;
        Insert: {
          address: string;
          client_request_id: string;
          code: string;
          created_at?: string;
          id?: string;
          item_count: number;
          note?: string;
          payment_method: Database["public"]["Enums"]["payment_method"];
          phone: string;
          province: string;
          recipient_name: string;
          shipping_fee: number;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          updated_at?: string;
          user_id?: string | null;
          ward: string;
        };
        Update: {
          address?: string;
          client_request_id?: string;
          code?: string;
          created_at?: string;
          id?: string;
          item_count?: number;
          note?: string;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          phone?: string;
          province?: string;
          recipient_name?: string;
          shipping_fee?: number;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          total?: number;
          updated_at?: string;
          user_id?: string | null;
          ward?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      product_reviews: {
        Row: {
          author_name: string;
          content: string;
          created_at: string;
          id: string;
          is_visible: boolean;
          product_id: string;
          rating: number;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          author_name: string;
          content: string;
          created_at?: string;
          id?: string;
          is_visible?: boolean;
          product_id: string;
          rating: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          author_name?: string;
          content?: string;
          created_at?: string;
          id?: string;
          is_visible?: boolean;
          product_id?: string;
          rating?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          badge: Database["public"]["Enums"]["product_badge"] | null;
          care_instructions: string;
          colors: NonNullable<Json>;
          compare_at_price: number | null;
          created_at: string;
          description: string;
          fabric: Database["public"]["Enums"]["fabric_type"];
          gallery: string[];
          id: string;
          image_url: string;
          is_featured: boolean;
          is_visible: boolean;
          material: string;
          name: string;
          price: number;
          short_description: string;
          size: string;
          sku: string;
          slug: string;
          sort_order: number;
          stock: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          badge?: Database["public"]["Enums"]["product_badge"] | null;
          care_instructions?: string;
          colors?: NonNullable<Json>;
          compare_at_price?: number | null;
          created_at?: string;
          description?: string;
          fabric: Database["public"]["Enums"]["fabric_type"];
          gallery?: string[];
          id?: string;
          image_url?: string;
          is_featured?: boolean;
          is_visible?: boolean;
          material?: string;
          name: string;
          price: number;
          short_description?: string;
          size?: string;
          sku: string;
          slug: string;
          sort_order?: number;
          stock?: number;
          updated_at?: string;
        };
        Update: {
          badge?: Database["public"]["Enums"]["product_badge"] | null;
          care_instructions?: string;
          colors?: NonNullable<Json>;
          compare_at_price?: number | null;
          created_at?: string;
          description?: string;
          fabric?: Database["public"]["Enums"]["fabric_type"];
          gallery?: string[];
          id?: string;
          image_url?: string;
          is_featured?: boolean;
          is_visible?: boolean;
          material?: string;
          name?: string;
          price?: number;
          short_description?: string;
          size?: string;
          sku?: string;
          slug?: string;
          sort_order?: number;
          stock?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          full_name: string;
          id: string;
          phone: string;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          full_name?: string;
          id: string;
          phone?: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          full_name?: string;
          id?: string;
          phone?: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      product_review_stats: {
        Row: {
          average_rating: number | null;
          product_id: string | null;
          review_count: number | null;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      admin_dashboard_stats: { Args: Record<PropertyKey, never>; Returns: Json };
      admin_update_order_status: {
        Args: {
          p_note?: string;
          p_order_id: string;
          p_status: Database["public"]["Enums"]["order_status"];
        };
        Returns: Database["public"]["Enums"]["order_status"];
      };
      can_transition_order: {
        Args: {
          p_from: Database["public"]["Enums"]["order_status"];
          p_to: Database["public"]["Enums"]["order_status"];
        };
        Returns: boolean;
      };
      cancel_my_order: {
        Args: { p_order_id: string };
        Returns: Database["public"]["Enums"]["order_status"];
      };
      has_delivered_product: { Args: { p_product_id: string; p_user: string }; Returns: boolean };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      place_order: {
        Args: {
          p_client_request_id: string;
          p_items: Json;
          p_payment_method: Database["public"]["Enums"]["payment_method"];
          p_shipping: Json;
        };
        Returns: {
          order_code: string;
          order_id: string;
        }[];
      };
      restock_order: { Args: { p_order_id: string }; Returns: undefined };
      review_display_name: { Args: { p_full_name: string }; Returns: string };
      review_status_for_me: { Args: { p_product_id: string }; Returns: Json };
      shipping_fee_for: { Args: { p_subtotal: number }; Returns: number };
      submit_review: {
        Args: { p_content: string; p_product_id: string; p_rating: number };
        Returns: string;
      };
    };
    Enums: {
      fabric_type: "satin" | "len" | "voan" | "cotton";
      order_status: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
      payment_method: "cod" | "bank_transfer_mock";
      product_badge: "new" | "best_seller" | "limited";
      user_role: "customer" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      fabric_type: ["satin", "len", "voan", "cotton"],
      order_status: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
      payment_method: ["cod", "bank_transfer_mock"],
      product_badge: ["new", "best_seller", "limited"],
      user_role: ["customer", "admin"],
    },
  },
} as const;
