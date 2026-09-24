import { NextResponse } from "next/server";

export function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  };
}

export function handleOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: getCorsHeaders(),
  });
}

