import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ready', component: 'frontend' }, { status: 200 });
}
