import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

const BUCKET = "ebooks";
const SIGNED_URL_TTL_SECONDS = 10 * 60;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const { orderNumber } = await params;

  if (!orderNumber) {
    return NextResponse.json(
      { ok: false, message: "Order number is required." },
      { status: 400 }
    );
  }

  let client;
  try {
    client = getServiceClient();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Service unavailable." },
      { status: 500 }
    );
  }

  const { data: order, error } = await client
    .from("orders")
    .select("id, status, book_id")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { ok: false, message: "Could not look up the order." },
      { status: 500 }
    );
  }
  if (!order) {
    return NextResponse.json(
      { ok: false, message: "Order not found." },
      { status: 404 }
    );
  }
  if (order.status !== "PAID") {
    return NextResponse.json(
      { ok: false, message: "Download is available after a successful payment." },
      { status: 403 }
    );
  }

  const { data: book } = await client
    .from("books")
    .select("file_path")
    .eq("id", order.book_id)
    .maybeSingle();

  if (!book || !book.file_path) {
    return NextResponse.json(
      { ok: false, message: "E-book file is not configured." },
      { status: 500 }
    );
  }

  console.log("BOOK FILE PATH:", book.file_path);

  const { data: signed, error: signedError } = await client.storage
    .from(BUCKET)
    .createSignedUrl(book.file_path, SIGNED_URL_TTL_SECONDS);

  console.log("SIGNED:", signed);
  console.log("SIGNED ERROR:", signedError);

  if (signedError || !signed?.signedUrl) {
    console.error("Download error:", signedError);

    return NextResponse.json(
      {
        ok: false,
        message: "Could not create a download link.",
        debug: signedError?.message ?? null,
        filePath: book.file_path,
      },
      { status: 500 }
    );
  }

  return NextResponse.redirect(signed.signedUrl);
}