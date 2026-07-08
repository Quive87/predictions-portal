import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const bountyId = searchParams.get('bountyid');
  const matchId = searchParams.get('matchid');

  if (!bountyId || !matchId) {
    return NextResponse.json({ error: 'Missing bountyid or matchid' }, { status: 400 });
  }

  const key = `preds:${bountyId}:${matchId}`;
  
  try {
    const predictions = await kv.get(key) || [];
    return NextResponse.json({ predictions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { bountyId, matchId, crewName, team1, team2, winner, score1, score2 } = body;

    if (!bountyId || !matchId || !crewName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const key = `preds:${bountyId}:${matchId}`;
    
    // Fetch existing
    let existing = await kv.get(key) || [];
    
    // Remove if crew member already submitted (update)
    existing = existing.filter(p => p.crew_name !== crewName);
    
    // Add new
    existing.push({
      crew_name: crewName,
      team_1: team1,
      team_2: team2,
      winner,
      score_1: score1,
      score_2: score2,
      timestamp: new Date().toISOString()
    });

    await kv.set(key, existing);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save prediction' }, { status: 500 });
  }
}
