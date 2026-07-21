import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchid');
    
    // An endpoint to also fetch token details for the bans page
    const token = searchParams.get('token');

    if (token) {
      const tokenData = await kv.get(`ban_token_${token}`);
      if (!tokenData) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
      }
      const phaseData = await kv.get(`global_bans_${tokenData.matchId}`);
      if (!phaseData) {
         return NextResponse.json({ error: 'No active ban phase found' }, { status: 404 });
      }
      let returnBansA = phaseData.bansA || [];
      let returnBansB = phaseData.bansB || [];

      // Hide opponent's bans if this team hasn't banned yet
      if (tokenData.team === 'A' && (!phaseData.bansA || phaseData.bansA.length === 0)) {
        returnBansB = [];
      } else if (tokenData.team === 'B' && (!phaseData.bansB || phaseData.bansB.length === 0)) {
        returnBansA = [];
      }

      return NextResponse.json({
         matchId: phaseData.matchId,
         team1Name: phaseData.team1Name,
         team2Name: phaseData.team2Name,
         isOpen: phaseData.isOpen,
         myTeam: tokenData.team,
         bansA: returnBansA,
         bansB: returnBansB
      });
    }

    if (!matchId) {
      return NextResponse.json({ error: 'Missing matchId' }, { status: 400 });
    }

    const phaseData = await kv.get(`global_bans_${matchId}`);
    if (!phaseData) {
      return NextResponse.json({ bansA: [], bansB: [], isOpen: false });
    }

    // Return the bans for auto-polling, but NEVER expose the tokens in GET!
    return NextResponse.json({
      matchId: phaseData.matchId,
      bansA: phaseData.bansA || [],
      bansB: phaseData.bansB || [],
      isOpen: phaseData.isOpen,
      updatedAt: phaseData.updatedAt
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch global bans' }, { status: 500 });
  }
}
