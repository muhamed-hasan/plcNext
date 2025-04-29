import { NextResponse } from 'next/server';
import { getHistoricalData } from '../../lib/db';

export async function GET(request) {
  try {
    // Get the timeRange from the URL query parameters
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '24h';
    
    // Get historical data from the database
    const data = await getHistoricalData(timeRange);
    
    return NextResponse.json({ 
      success: true, 
      data,
      timeRange
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Error fetching historical data: ${error.toString()}` },
      { status: 500 }
    );
  }
} 