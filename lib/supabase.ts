// Robust Universal Supabase/API Client for StarFashion Test DB

class LocalQueryBuilder {
  table: string;
  queryType: 'select' | 'insert' | 'update' | 'delete' = 'select';
  filters: { column: string; operator: string; value: any }[] = [];
  orderCol: string | null = null;
  ascending: boolean = true;
  singleRow: boolean = false;
  payload: any = null;

  constructor(table: string, queryType: 'select' | 'insert' | 'update' | 'delete' = 'select') {
    this.table = table;
    this.queryType = queryType;
  }

  limitCount: number | null = null;

  select(columns = '*') {
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ column, operator: 'eq', value });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push({ column, operator: 'neq', value });
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.orderCol = column;
    this.ascending = ascending;
    return this;
  }

  single() {
    this.singleRow = true;
    return this;
  }

  insert(data: any) {
    this.queryType = 'insert';
    this.payload = data;
    return this;
  }

  update(data: any) {
    this.queryType = 'update';
    this.payload = data;
    return this;
  }

  delete() {
    this.queryType = 'delete';
    return this;
  }

  async then(resolve: (res: { data: any; error: any }) => void, reject?: (err: any) => void) {
    try {
      if (typeof window !== 'undefined') {
        // Client-side execution via API routes
        if (this.queryType === 'select') {
          let endpoint = this.table === 'products' ? '/api/admin/products' : this.table === 'orders' ? '/api/admin/orders' : '/api/admin/settings';
          const idFilter = this.filters.find(f => f.column === 'id' && f.operator === 'eq');
          if (this.table === 'orders' && idFilter?.value) {
            endpoint = `/api/orders?id=${encodeURIComponent(idFilter.value)}`;
          }
          const res = await fetch(endpoint);
          const data = await res.json();
          let results = Array.isArray(data) ? data : data && !data.error ? [data] : [];

          for (const f of this.filters) {
            if (f.operator === 'eq') {
              results = results.filter((item: any) => item[f.column] === f.value);
            } else if (f.operator === 'neq') {
              results = results.filter((item: any) => item[f.column] !== f.value);
            }
          }
          if (this.orderCol) {
            results.sort((a: any, b: any) => {
              const valA = a[this.orderCol!];
              const valB = b[this.orderCol!];
              if (valA < valB) return this.ascending ? -1 : 1;
              if (valA > valB) return this.ascending ? 1 : -1;
              return 0;
            });
          }
          if (this.limitCount !== null) {
            results = results.slice(0, this.limitCount);
          }
          if (this.singleRow) {
            resolve({ data: results[0] || null, error: null });
          } else {
            resolve({ data: results, error: null });
          }
        } else if (this.queryType === 'insert') {
          const endpoint = this.table === 'products' ? '/api/admin/products' : '/api/admin/orders';
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Array.isArray(this.payload) ? this.payload[0] : this.payload),
          });
          const json = await res.json();
          resolve({ data: json.product || json.order || json, error: json.error || null });
        } else if (this.queryType === 'update') {
          const endpoint = this.table === 'products' ? '/api/admin/products' : this.table === 'orders' ? '/api/admin/orders' : '/api/admin/settings';
          const method = this.table === 'orders' ? 'PATCH' : 'PUT';
          const id = this.filters.find(f => f.column === 'id')?.value;
          const res = await fetch(endpoint, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...this.payload }),
          });
          const json = await res.json();
          resolve({ data: json.product || json.order || json.settings || json, error: json.error || null });
        } else if (this.queryType === 'delete') {
          const id = this.filters.find(f => f.column === 'id')?.value;
          const endpoint = `${this.table === 'products' ? '/api/admin/products' : '/api/admin/orders'}?id=${id}`;
          const res = await fetch(endpoint, { method: 'DELETE' });
          const json = await res.json();
          resolve({ data: json, error: json.error || null });
        }
      } else {
        // Server-side execution using dynamic import of fs/db
        const { readDB, writeDB } = await import('./db');
        const db = readDB();
        let tableData: any[] = [];
        if (this.table === 'products') tableData = db.products;
        else if (this.table === 'orders') tableData = db.orders;
        else if (this.table === 'store_settings') tableData = [db.store_settings];

        if (this.queryType === 'select') {
          let results = [...tableData];
          for (const f of this.filters) {
            if (f.operator === 'eq') results = results.filter((item: any) => item[f.column] === f.value);
            else if (f.operator === 'neq') results = results.filter((item: any) => item[f.column] !== f.value);
          }
          if (this.orderCol) {
            results.sort((a: any, b: any) => {
              const valA = a[this.orderCol!];
              const valB = b[this.orderCol!];
              if (valA < valB) return this.ascending ? -1 : 1;
              if (valA > valB) return this.ascending ? 1 : -1;
              return 0;
            });
          }
          if (this.limitCount !== null) {
            results = results.slice(0, this.limitCount);
          }
          if (this.singleRow) {
            resolve({ data: results[0] || null, error: null });
          } else {
            resolve({ data: results, error: null });
          }
        } else if (this.queryType === 'insert') {
          const itemsToInsert = Array.isArray(this.payload) ? this.payload : [this.payload];
          const newItems = itemsToInsert.map((item: any) => ({
            id: item.id || (this.table === 'products' ? 'prod-' : 'ord-') + Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString(),
            ...item,
          }));
          if (this.table === 'products') db.products.unshift(...newItems);
          else if (this.table === 'orders') db.orders.unshift(...newItems);
          writeDB(db);
          resolve({ data: this.singleRow ? newItems[0] : newItems, error: null });
        } else if (this.queryType === 'update') {
          let updatedItem = null;
          if (this.table === 'products') {
            db.products = db.products.map((item: any) => {
              let match = true;
              for (const f of this.filters) {
                if (item[f.column] !== f.value) match = false;
              }
              if (match) {
                updatedItem = { ...item, ...this.payload };
                return updatedItem;
              }
              return item;
            });
          } else if (this.table === 'orders') {
            db.orders = db.orders.map((item: any) => {
              let match = true;
              for (const f of this.filters) {
                if (item[f.column] !== f.value) match = false;
              }
              if (match) {
                updatedItem = { ...item, ...this.payload };
                return updatedItem;
              }
              return item;
            });
          } else if (this.table === 'store_settings') {
            db.store_settings = { ...db.store_settings, ...this.payload };
            updatedItem = db.store_settings;
          }
          writeDB(db);
          resolve({ data: updatedItem, error: null });
        } else if (this.queryType === 'delete') {
          if (this.table === 'products') {
            for (const f of this.filters) {
              if (f.column === 'id') db.products = db.products.filter((p: any) => p.id !== f.value);
            }
          } else if (this.table === 'orders') {
            for (const f of this.filters) {
              if (f.column === 'id') db.orders = db.orders.filter((o: any) => o.id !== f.value);
            }
          }
          writeDB(db);
          resolve({ data: true, error: null });
        }
      }
    } catch (err: any) {
      resolve({ data: null, error: err.message });
    }
  }
}

class LocalSupabaseClient {
  from(table: string) {
    return new LocalQueryBuilder(table);
  }
  channel(name: string) {
    const chain: any = {
      on: () => chain,
      subscribe: () => chain,
    };
    return chain;
  }
  removeChannel(channel?: any) {}
}

export const supabase = new LocalSupabaseClient() as any;
export const supabaseAdmin = new LocalSupabaseClient() as any;
