import fs from "fs";
import { DeeBeeSchema, TableFile, SchemaValidation, QueryBuilderAction } from "./types";

export class Model {
  readonly name;
  readonly schema;

  constructor(name: string, schema: DeeBeeSchema) {
    this.name = name;
    this.schema = schema;
  }
}

class QueryBuiler<T> {
  private tableName
  private db
  private rows
  private schema
  private action

  constructor(tableName: string, rows: T[], schema: DeeBeeSchema, action: QueryBuilderAction, db: DeeBee){
    this.tableName = tableName
    this.rows = rows
    this.schema = schema
    this.action = action
    this.db = db
  }


  where(query: Partial<T>){
    
    const newRows = []

    let foundTarget = false
    let i = 0
    while(i < this.rows.length && foundTarget === false){
      const currentRow = this.rows[i]
      for(const key in currentRow){

        if(currentRow[key] === query[key] && this.action === 'delete'){
          foundTarget = true
          break
        }

      }

      if(!foundTarget && this.action === 'delete'){
        newRows.push(currentRow)
      }
      i++
    }

    const newTableData = {
      rows: newRows
    }

    this.db.writeToTable(this.tableName,newTableData)
  }
}

export class DeeBee {
  private root: string;
  private modelPath;
  readonly models: Record<Model["name"], Model>;
  readonly tablesPath: string;
  

  constructor(root?: string) {

    this.root = root || "./deebee";
    this.tablesPath = this.root + "/tables";
    this.modelPath = this.root + "/models"

    this.models = {};

    const isFirstStart = !fs.existsSync(`${this.tablesPath}`);

    if (isFirstStart) {

      fs.mkdirSync(this.tablesPath, { recursive: true });
      fs.mkdirSync(this.modelPath, { recursive: true });

    } else {
      const currentTables = fs.readdirSync(this.tablesPath, "utf-8");

      for (const t of currentTables) {
        const tableName = t.slice(0, -5);
        this.models[tableName] = this.getModel(tableName);
      }
    }
  }

   getModel(modelName: string) {

    if (modelName in this.models){
      return this.models[modelName]
    }

    const schema = JSON.parse(
      fs.readFileSync(`${this.modelPath}/${modelName}.json` , "utf-8")
    );
    
    return new Model(modelName, schema);
  }

  private addModelFile(model: Model) {
    fs.writeFileSync(`${this.modelPath}/${model.name}.json`, JSON.stringify(model.schema, null, 4));
  }

  async addModel(model: Model): Promise<void> {
    const tableExists = fs.existsSync(`${this.tablesPath}/${model.name}.json`);

    if (this.hasTable(model.name) || tableExists) {
      return Promise.reject( new Error(
        `Model with name: ${model.name} already exists. Change model name`
      ));
    }

    this.addModelFile(model);
    this.models[model.name] = model;

    fs.writeFileSync(
      `${this.tablesPath}/${model.name}.json`,
      `{
      "rows": []
    }`
    );

    return Promise.resolve()
  }

  getTable(tableName: string): TableFile {
    const fileName = `${this.tablesPath}/${tableName}.json`;
    return JSON.parse(fs.readFileSync(fileName, "utf-8"));
  }

  validateSchema(tableName: string, data: Record<string, any>): SchemaValidation {


    for (const key in data) {
      const expected = this.models[tableName].schema[key];
      const received = data[key];

      // complex validations
      if(!Array.isArray(received) && expected === 'array'){
        
        return {
          isValid: false,
          message: `Property: ${key} does not match schema for ${tableName}
          Expected: ${expected} 
          Received: ${typeof received}: ${received} 
          `
        }
      }
      
      
      if (typeof received != expected) {
        return {
          isValid: false,
          message: `Property: ${key} does not match schema for ${tableName}
          Expected: ${expected} 
          Received: ${typeof received}: ${received}`
        }
      }
    }

    return {
      isValid: true,
      message: "Success",
    };
  }

   writeToTable(tableName: string, data: TableFile){
    const fileName = `${this.tablesPath}/${tableName}.json`;
    const jsonData = JSON.stringify(data, null, 4);
    fs.writeFileSync(fileName, jsonData); 
  }

  insertInto(tableName: string, data: object): void {
    if (!this.hasTable(tableName)) {
      throw Error(
        `Model with name: ${tableName} does not exist. Change model name`
      );
    }
    
    const schemaValidation = this.validateSchema(tableName, data);
    if (!schemaValidation.isValid) {
      throw new Error(schemaValidation.message);
    }


    const table = this.getTable(tableName);
    table.rows.push(data);
    this.writeToTable(tableName,table)
  }

  deleteFrom(tableName: string){
    const table = this.getTable(tableName)
    const schema = this.getModel(tableName).schema
     
    return new QueryBuiler(tableName,table.rows, schema, 'delete', this)

  }

  hasTable(tableName: string): boolean {
    return tableName in this.models;
  }

  listTables(): string[] {
    const res = [];

    for (const key in this.models) {
      res.push(key);
    }

    return res;
  }
}
