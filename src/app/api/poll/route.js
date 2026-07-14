import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const bountyId = searchParams.get('bountyid');
  const matchId = searchParams.get('matchid');

  if (!bountyId || !matchId) {
    return NextResponse.json({ error: 'Missing bountyid or matchid' }, { status: 400 });
  }

  const key = `poll:${bountyId}:${matchId}`;
  
  try {
    const data = await kv.get(key) || { votes1: 0, votes2: 0 };
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch poll' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { bountyId, matchId, voteFor } = body;

    if (!bountyId || !matchId || !voteFor) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (voteFor !== 'team1' && voteFor !== 'team2') {
      return NextResponse.json({ error: 'Invalid vote value' }, { status: 400 });
    }

    const key = `poll:${bountyId}:${matchId}`;
    
    // Fetch existing
    let current = await kv.get(key) || { votes1: 0, votes2: 0 };
    
    if (voteFor === 'team1') {
      current.votes1 = (current.votes1 || 0) + 1;
    } else {
      current.votes2 = (current.votes2 || 0) + 1;
    }

    await kv.set(key, current);

    return NextResponse.json({ success: true, poll: current });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save vote' }, { status: 500 });
  }
}
