import { NextResponse } from 'next/server'

export function GET(request) {
  return NextResponse.redirect(new URL('/assets/favicon.png', request.url), 308)
}
