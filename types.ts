export type DeeBeeType = "number" | "string" | "boolean" | "array";

export type DeeBeeSchema = {
  [key: string]: DeeBeeType;
};

export interface TableFile<T = any>  {
  rows: T[];
};

export type SchemaValidation =
  | {
      isValid: true;
      message: "Success";
    }
  | {
      isValid: false;
      message: string;
    };


export type QueryBuilderAction = 'update' | 'delete'