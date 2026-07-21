import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { matchId, team1Name, team2Name } = body;

    if (!matchId) {
      return NextResponse.json({ error: 'Missing matchId' }, { status: 400 });
    }

    // Generate unique unguessable tokens for each team
    const tokenA = crypto.randomBytes(8).toString('hex');
    const tokenB = crypto.randomBytes(8).toString('hex');

    const phaseData = {
      matchId,
      team1Name: team1Name || 'Team A',
      team2Name: team2Name || 'Team B',
      tokenA,
      tokenB,
      bansA: [],
      bansB: [],
      isOpen: true,
      updatedAt: new Date().toISOString()
    };

    // Store phase data against the matchId
    await kv.set(`global_bans_${matchId}`, phaseData);

    // Also store tokens mapping to matchId for easy lookup when submitting
    await kv.set(`ban_token_${tokenA}`, { matchId, team: 'A' }, { ex: 86400 }); // Expire in 24h
    await kv.set(`ban_token_${tokenB}`, { matchId, team: 'B' }, { ex: 86400 });

    return NextResponse.json({ success: true, phaseData });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to open global ban phase' }, { status: 500 });
  }
}
