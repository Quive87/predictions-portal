import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, bans } = body; // bans should be an array of brawler IDs

    if (!token || !bans) {
      return NextResponse.json({ error: 'Missing token or bans' }, { status: 400 });
    }

    // Lookup token
    const tokenData = await kv.get(`ban_token_${token}`);
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
    }

    const { matchId, team } = tokenData;

    // Get the phase data
    const phaseData = await kv.get(`global_bans_${matchId}`);
    if (!phaseData || !phaseData.isOpen) {
      return NextResponse.json({ error: 'Global ban phase is closed' }, { status: 403 });
    }

    // Update bans for the specific team
    if (team === 'A') {
      if (phaseData.bansA && phaseData.bansA.length > 0) {
        return NextResponse.json({ error: 'Team A has already submitted their bans and cannot change them.' }, { status: 403 });
      }
      phaseData.bansA = bans;
    } else {
      if (phaseData.bansB && phaseData.bansB.length > 0) {
        return NextResponse.json({ error: 'Team B has already submitted their bans and cannot change them.' }, { status: 403 });
      }
      phaseData.bansB = bans;
    }
    phaseData.updatedAt = new Date().toISOString();

    // Save updated phase data
    await kv.set(`global_bans_${matchId}`, phaseData);

    return NextResponse.json({ 
      success: true, 
      team, 
      bans,
      bansA: phaseData.bansA,
      bansB: phaseData.bansB 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to submit global bans' }, { status: 500 });
  }
}
