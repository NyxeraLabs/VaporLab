import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok', component: 'frontend' }, { status: 200 });
}
