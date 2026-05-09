export type PrinterStatus = "ready" | "busy" | "maintenance";
export type MaterialType = "PLA" | "PETG" | "PETG-CF" | "TPU" | "ABS" | "Resin";

export type Database = {
  public: {
    Tables: {
      printers: {
        Row: {
          id: string;
          name: string;
          model: string;
          status: PrinterStatus;
          build_volume_x: number;
          build_volume_y: number;
          build_volume_z: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          model: string;
          status: PrinterStatus;
          build_volume_x: number;
          build_volume_y: number;
          build_volume_z: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          model?: string;
          status?: PrinterStatus;
          build_volume_x?: number;
          build_volume_y?: number;
          build_volume_z?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      materials: {
        Row: {
          id: string;
          name: string;
          type: MaterialType;
          color: string;
          density: number;
          unit_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: MaterialType;
          color: string;
          density: number;
          unit_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: MaterialType;
          color?: string;
          density?: number;
          unit_price?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      pricing_rules: {
        Row: {
          id: string;
          material_id: string;
          base_price: number;
          min_volume: number;
          discount_factor: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          material_id: string;
          base_price: number;
          min_volume: number;
          discount_factor: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          material_id?: string;
          base_price?: number;
          min_volume?: number;
          discount_factor?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pricing_rules_material_id_fkey";
            columns: ["material_id"];
            referencedRelation: "materials";
            referencedColumns: ["id"];
          },
        ];
      };
      workshop_info: {
        Row: {
          id: string;
          key: string;
          value: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      page_views: {
        Row: {
          id: string;
          url: string;
          referrer: string | null;
          user_agent: string | null;
          ip_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          referrer?: string | null;
          user_agent?: string | null;
          ip_hash: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          url?: string;
          referrer?: string | null;
          user_agent?: string | null;
          ip_hash?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      quote_checkout_requests: {
        Row: {
          id: string;
          created_at: string;
          customer_name: string;
          customer_phone: string;
          customer_note: string;
          slicer_task_id: string;
          filename: string;
          material: string;
          is_student: boolean;
          student_id_verification_pending: boolean;
          quantity: number;
          model_scale: number;
          dim_x_mm: number;
          dim_y_mm: number;
          dim_z_mm: number;
          filament_used_mm: number;
          estimated_print_time: string;
          total_vnd: number;
          line_subtotal_vnd: number;
          floor_applied: boolean;
          quote_asset_id: string | null;
          stl_storage_path: string | null;
          preview_image_url: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          customer_name: string;
          customer_phone: string;
          customer_note?: string;
          slicer_task_id: string;
          filename: string;
          material: string;
          is_student?: boolean;
          student_id_verification_pending?: boolean;
          quantity: number;
          model_scale: number;
          dim_x_mm: number;
          dim_y_mm: number;
          dim_z_mm: number;
          filament_used_mm: number;
          estimated_print_time?: string;
          total_vnd: number;
          line_subtotal_vnd: number;
          floor_applied?: boolean;
          quote_asset_id?: string | null;
          stl_storage_path?: string | null;
          preview_image_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_note?: string;
          slicer_task_id?: string;
          filename?: string;
          material?: string;
          is_student?: boolean;
          student_id_verification_pending?: boolean;
          quantity?: number;
          model_scale?: number;
          dim_x_mm?: number;
          dim_y_mm?: number;
          dim_z_mm?: number;
          filament_used_mm?: number;
          estimated_print_time?: string;
          total_vnd?: number;
          line_subtotal_vnd?: number;
          floor_applied?: boolean;
          quote_asset_id?: string | null;
          stl_storage_path?: string | null;
          preview_image_url?: string | null;
        };
        Relationships: [];
      };
      bulk_rfq_requests: {
        Row: {
          id: string;
          created_at: string;
          contact_name: string;
          email: string;
          phone: string;
          company: string;
          quantity_estimate: number;
          technical_requirements: string;
          attachment_paths: string[];
        };
        Insert: {
          id?: string;
          created_at?: string;
          contact_name: string;
          email: string;
          phone?: string;
          company?: string;
          quantity_estimate: number;
          technical_requirements?: string;
          attachment_paths?: string[];
        };
        Update: {
          id?: string;
          created_at?: string;
          contact_name?: string;
          email?: string;
          phone?: string;
          company?: string;
          quantity_estimate?: number;
          technical_requirements?: string;
          attachment_paths?: string[];
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          total_price: number;
          estimated_delivery: string | null;
          created_at: string;
          material_id: string | null;
          printer_id: string | null;
          quantity: number;
          dim_x: number | null;
          dim_y: number | null;
          dim_z: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: string;
          total_price: number;
          estimated_delivery?: string | null;
          created_at?: string;
          material_id?: string | null;
          printer_id?: string | null;
          quantity?: number;
          dim_x?: number | null;
          dim_y?: number | null;
          dim_z?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: string;
          total_price?: number;
          estimated_delivery?: string | null;
          created_at?: string;
          material_id?: string | null;
          printer_id?: string | null;
          quantity?: number;
          dim_x?: number | null;
          dim_y?: number | null;
          dim_z?: number | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      analytics_page_views_by_hour: {
        Args: { p_since: string };
        Returns: { bucket: string; view_count: number }[];
      };
      analytics_page_views_by_day: {
        Args: { p_since: string };
        Returns: { bucket: string; view_count: number }[];
      };
      analytics_top_urls: {
        Args: { p_since: string; p_limit?: number };
        Returns: { url: string; view_count: number }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type PrinterRow = Database["public"]["Tables"]["printers"]["Row"];
export type MaterialRow = Database["public"]["Tables"]["materials"]["Row"];
export type PricingRuleRow = Database["public"]["Tables"]["pricing_rules"]["Row"];
export type WorkshopInfoRow = Database["public"]["Tables"]["workshop_info"]["Row"];

/** Nested select: `from("materials").select("*, pricing_rules(*)")` */
export type MaterialWithPricing = MaterialRow & {
  pricing_rules: PricingRuleRow[] | null;
};
