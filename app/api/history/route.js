import { NextResponse } from 'next/server';
import { getHistoricalData } from '../../lib/db';

export async function GET(request) {
  try {
    // Get the parameters from the URL query parameters
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '24h';
    
    // Check if this is a custom date range request
    let customRange = null;
    if (timeRange === 'custom') {
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      
      if (!startDate || !endDate) {
        return NextResponse.json(
          { error: 'Custom time range requires both startDate and endDate parameters' },
          { status: 400 }
        );
      }
      
      customRange = { startDate, endDate };
    }
    
    // Get historical data from the database
    const data = await getHistoricalData(timeRange, customRange);
    
    return NextResponse.json({ 
      success: true, 
      data,
      timeRange,
      customRange
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Error fetching historical data: ${error.toString()}` },
      { status: 500 }
    );
  }
} 