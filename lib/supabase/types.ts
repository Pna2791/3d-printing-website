export type PrinterStatus = "ready" | "busy" | "maintenance";
export type MaterialType = "PLA" | "PETG" | "ABS" | "Resin";

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
    Functions: Record<string, never>;
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
