import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

// Generic admin API route that uses service_role key to bypass RLS
// Supports: SELECT, INSERT, UPDATE, DELETE on allowed tables

const ALLOWED_TABLES = [
  "products",
  "categories",
  "product_variants",
  "coupons",
  "orders",
  "order_items",
  "site_settings",
];

function isAllowedTable(table: string): boolean {
  return ALLOWED_TABLES.includes(table);
}

// GET: Read data (SELECT)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const table = searchParams.get("table");
  const select = searchParams.get("select") || "*";
  const orderBy = searchParams.get("orderBy");
  const orderAsc = searchParams.get("orderAsc") === "true";
  const filterCol = searchParams.get("filterCol");
  const filterVal = searchParams.get("filterVal");
  const filterEq = searchParams.get("filterEq");
  const isSingle = searchParams.get("single") === "true";
  // Pagination
  const rangeFrom = searchParams.get("rangeFrom");
  const rangeTo = searchParams.get("rangeTo");
  const countType = searchParams.get("count"); // "exact" etc
  // Search / or filter
  const orFilter = searchParams.get("or");

  if (!table || !isAllowedTable(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  try {
    const supabase = createAdminSupabaseClient();
    let query = supabase.from(table).select(
      select,
      countType ? { count: countType as "exact" } : undefined
    );

    if (filterCol && filterVal) {
      query = query.eq(filterCol, filterVal);
    }
    if (filterEq) {
      // Support multiple eq filters: "col1:val1,col2:val2"
      const pairs = filterEq.split(",");
      for (const pair of pairs) {
        const [col, val] = pair.split(":");
        if (col && val) query = query.eq(col, val);
      }
    }
    if (orFilter) {
      query = query.or(orFilter);
    }
    if (orderBy) {
      query = query.order(orderBy, { ascending: orderAsc });
    }
    if (rangeFrom && rangeTo) {
      query = query.range(parseInt(rangeFrom), parseInt(rangeTo));
    }
    if (isSingle) {
      const { data, error } = await query.single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ data });
    }

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data, count });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Insert data
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { table, data: rowData, returnData } = body;

    if (!table || !isAllowedTable(table)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    let query = supabase.from(table).insert(rowData);

    if (returnData) {
      const { data, error } = await query.select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ data });
    }

    const { error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Update data
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { table, data: updateData, match } = body;

    if (!table || !isAllowedTable(table)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }
    if (!match || typeof match !== "object") {
      return NextResponse.json({ error: "match filter required" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    let query = supabase.from(table).update(updateData);

    // Apply all match filters
    for (const [col, val] of Object.entries(match)) {
      query = query.eq(col, val as string);
    }

    const { error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Delete data
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { table, match } = body;

    if (!table || !isAllowedTable(table)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }
    if (!match || typeof match !== "object") {
      return NextResponse.json({ error: "match filter required" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    let query = supabase.from(table).delete();

    for (const [col, val] of Object.entries(match)) {
      query = query.eq(col, val as string);
    }

    const { error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
