export type PlanTier = "free" | "premium";
export type AppLocale = "es" | "en";
export type ProductSource = "openbeautyfacts" | "manual";
export type ConflictSeverity =
  | "avoid"
  | "separate_am_pm"
  | "alternate_days"
  | "caution";
export type TimeOfDay = "am" | "pm";
export type ProductCategory =
  | "cleanser"
  | "toner"
  | "essence"
  | "serum"
  | "treatment"
  | "moisturizer"
  | "oil"
  | "sunscreen"
  | "mask"
  | "exfoliant"
  | "eye_cream"
  | "other";
export type SkinGoal =
  | "acne"
  | "anti_aging"
  | "dark_spots"
  | "hydration"
  | "sensitive";
export type SkinType = "dry" | "oily" | "combination" | "normal" | "sensitive";

export type IngredientKey =
  | "retinol"
  | "vitamin_c"
  | "niacinamide"
  | "aha"
  | "bha"
  | "benzoyl_peroxide"
  | "spf"
  | (string & {});

type Row<T> = T;
type Insert<T> = T;
type Update<T> = Partial<T>;

export interface Database {
  public: {
    Tables: {
      users: {
        Row: Row<{
          id: string;
          email: string | null;
          plan: PlanTier;
          locale: AppLocale;
          skin_goal: SkinGoal | null;
          skin_type: SkinType | null;
          onboarding_completed_at: string | null;
          timezone: string;
          remind_am: boolean;
          remind_pm: boolean;
          created_at: string;
        }>;
        Insert: Insert<{
          id: string;
          email?: string | null;
          plan?: PlanTier;
          locale?: AppLocale;
          skin_goal?: SkinGoal | null;
          skin_type?: SkinType | null;
          onboarding_completed_at?: string | null;
          timezone?: string;
          remind_am?: boolean;
          remind_pm?: boolean;
          created_at?: string;
        }>;
        Update: Update<{
          email: string | null;
          plan: PlanTier;
          locale: AppLocale;
          skin_goal: SkinGoal | null;
          skin_type: SkinType | null;
          onboarding_completed_at: string | null;
          timezone: string;
          remind_am: boolean;
          remind_pm: boolean;
        }>;
        Relationships: [];
      };
      push_subscriptions: {
        Row: Row<{
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          last_am_sent_on: string | null;
          last_pm_sent_on: string | null;
          created_at: string;
        }>;
        Insert: Insert<{
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          last_am_sent_on?: string | null;
          last_pm_sent_on?: string | null;
          created_at?: string;
        }>;
        Update: Update<{
          endpoint: string;
          p256dh: string;
          auth: string;
          last_am_sent_on: string | null;
          last_pm_sent_on: string | null;
        }>;
        Relationships: [];
      };
      products: {
        Row: Row<{
          id: string;
          barcode: string | null;
          name: string;
          brand: string | null;
          category: ProductCategory;
          source: ProductSource;
          created_by: string | null;
          image_url: string | null;
          created_at: string;
        }>;
        Insert: Insert<{
          id?: string;
          barcode?: string | null;
          name: string;
          brand?: string | null;
          category?: ProductCategory;
          source: ProductSource;
          created_by?: string | null;
          image_url?: string | null;
          created_at?: string;
        }>;
        Update: Update<{
          barcode: string | null;
          name: string;
          brand: string | null;
          category: ProductCategory;
          image_url: string | null;
        }>;
        Relationships: [];
      };
      product_active_ingredients: {
        Row: Row<{
          id: string;
          product_id: string;
          ingredient_key: string;
        }>;
        Insert: Insert<{
          id?: string;
          product_id: string;
          ingredient_key: string;
        }>;
        Update: Update<{
          ingredient_key: string;
        }>;
        Relationships: [];
      };
      ingredient_conflicts: {
        Row: Row<{
          id: string;
          ingredient_a: string;
          ingredient_b: string;
          severity: ConflictSeverity;
          explanation_es: string;
          explanation_en: string;
        }>;
        Insert: Insert<{
          id?: string;
          ingredient_a: string;
          ingredient_b: string;
          severity: ConflictSeverity;
          explanation_es: string;
          explanation_en: string;
        }>;
        Update: Update<{
          severity: ConflictSeverity;
          explanation_es: string;
          explanation_en: string;
        }>;
        Relationships: [];
      };
      user_products: {
        Row: Row<{
          id: string;
          user_id: string;
          product_id: string;
          added_at: string;
        }>;
        Insert: Insert<{
          id?: string;
          user_id: string;
          product_id: string;
          added_at?: string;
        }>;
        Update: Update<{
          product_id: string;
        }>;
        Relationships: [];
      };
      routine_sets: {
        Row: Row<{
          id: string;
          user_id: string;
          name: string;
          is_active: boolean;
          created_at: string;
        }>;
        Insert: Insert<{
          id?: string;
          user_id: string;
          name?: string;
          is_active?: boolean;
          created_at?: string;
        }>;
        Update: Update<{
          name: string;
          is_active: boolean;
        }>;
        Relationships: [];
      };
      routines: {
        Row: Row<{
          id: string;
          user_id: string;
          routine_set_id: string;
          time_of_day: TimeOfDay;
          step_order: number;
          product_id: string;
        }>;
        Insert: Insert<{
          id?: string;
          user_id: string;
          routine_set_id: string;
          time_of_day: TimeOfDay;
          step_order: number;
          product_id: string;
        }>;
        Update: Update<{
          time_of_day: TimeOfDay;
          step_order: number;
          product_id: string;
        }>;
        Relationships: [];
      };
      routine_logs: {
        Row: Row<{
          id: string;
          user_id: string;
          date: string;
          product_id: string;
          time_of_day: TimeOfDay;
          completed: boolean;
          completed_at: string | null;
        }>;
        Insert: Insert<{
          id?: string;
          user_id: string;
          date?: string;
          product_id: string;
          time_of_day?: TimeOfDay;
          completed?: boolean;
          completed_at?: string | null;
        }>;
        Update: Update<{
          completed: boolean;
          completed_at: string | null;
          time_of_day: TimeOfDay;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      plan_tier: PlanTier;
      app_locale: AppLocale;
      product_source: ProductSource;
      conflict_severity: ConflictSeverity;
      time_of_day: TimeOfDay;
      product_category: ProductCategory;
      skin_goal: SkinGoal;
      skin_type: SkinType;
    };
    CompositeTypes: Record<string, never>;
  };
}
