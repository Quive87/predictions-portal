import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const activeMatch = await kv.get('active_match');
    if (!activeMatch) {
      return NextResponse.json({ error: 'No active match found' }, { status: 404 });
    }
    return NextResponse.json(activeMatch);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch active match' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { bountyId, matchId, team1, team2, bestOf } = body;

    if (!bountyId || !matchId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const matchData = {
      bountyId,
      matchId,
      team1: team1 || 'Team A',
      team2: team2 || 'Team B',
      bestOf: bestOf || 3,
      updatedAt: new Date().toISOString()
    };

    await kv.set('active_match', matchData);

    return NextResponse.json({ success: true, activeMatch: matchData });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save active match' }, { status: 500 });
  }
}
