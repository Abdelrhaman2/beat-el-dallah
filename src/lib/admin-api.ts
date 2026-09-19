// Admin API helper — all admin write operations go through /api/admin
// which uses the service_role key server-side to bypass RLS

const API_BASE = "/api/admin";

interface AdminQueryParams {
  table: string;
  select?: string;
  orderBy?: string;
  orderAsc?: boolean;
  filterCol?: string;
  filterVal?: string;
  filterEq?: string;
  single?: boolean;
  rangeFrom?: number;
  rangeTo?: number;
  count?: "exact";
  or?: string;
}

interface AdminInsertParams {
  table: string;
  data: Record<string, any>;
  returnData?: boolean;
}

interface AdminUpdateParams {
  table: string;
  data: Record<string, any>;
  match: Record<string, string>;
}

interface AdminDeleteParams {
  table: string;
  match: Record<string, string>;
}

async function handleResponse(res: Response) {
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(json.error || `Request failed with status ${res.status}`);
  }
  return json;
}

/** SELECT data via admin API (bypasses RLS) */
export async function adminSelect(params: AdminQueryParams) {
  const searchParams = new URLSearchParams();
  searchParams.set("table", params.table);
  if (params.select) searchParams.set("select", params.select);
  if (params.orderBy) searchParams.set("orderBy", params.orderBy);
  if (params.orderAsc !== undefined) searchParams.set("orderAsc", String(params.orderAsc));
  if (params.filterCol) searchParams.set("filterCol", params.filterCol);
  if (params.filterVal) searchParams.set("filterVal", params.filterVal);
  if (params.filterEq) searchParams.set("filterEq", params.filterEq);
  if (params.single) searchParams.set("single", "true");
  if (params.rangeFrom !== undefined) searchParams.set("rangeFrom", String(params.rangeFrom));
  if (params.rangeTo !== undefined) searchParams.set("rangeTo", String(params.rangeTo));
  if (params.count) searchParams.set("count", params.count);
  if (params.or) searchParams.set("or", params.or);

  const res = await fetch(`${API_BASE}?${searchParams.toString()}`);
  return handleResponse(res);
}

/** INSERT data via admin API (bypasses RLS) */
export async function adminInsert(params: AdminInsertParams) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

/** UPDATE data via admin API (bypasses RLS) */
export async function adminUpdate(params: AdminUpdateParams) {
  const res = await fetch(API_BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}

/** DELETE data via admin API (bypasses RLS) */
export async function adminDelete(params: AdminDeleteParams) {
  const res = await fetch(API_BASE, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse(res);
}
