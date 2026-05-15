declare module "sql.js" {
  interface Database {
    run(sql: string, params?: any[]): this;
    exec(sql: string, params?: any[]): any[];
    prepare(sql: string, params?: any[]): Statement;
    close(): void;
    export(): Uint8Array;
  }

  interface Statement {
    all(params?: any[]): any[];
    get(params?: any[]): any | undefined;
    run(params?: any[]): this;
    bind(params: any[]): this;
    step(): boolean;
    get(): any;
    getAsObject(): any;
    free(): void;
  }

  interface SqlJsStatic {
    (opts?: any): Promise<{ Database: typeof Database }>;
  }

  var Sql: SqlJsStatic;
  export default Sql;
  export { Sql, Database, Statement };
}