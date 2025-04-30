import { NextResponse } from 'next/server';
import { storePlcData } from '../../lib/db';

// Handles GET requests to /api/test-insert
export async function GET(request) {
  try {
    // Generate a sample data point
    const generateSampleData = () => {
      return {
        // Temperature fields
        T1: Math.floor(20 + Math.random() * 10),
        T2: Math.floor(22 + Math.random() * 8),
        T3: Math.floor(18 + Math.random() * 12),
        T4: Math.floor(21 + Math.random() * 9),
        T5: Math.floor(19 + Math.random() * 11),
        T6: Math.floor(22 + Math.random() * 7),
        T7: Math.floor(23 + Math.random() * 8),
        T8: Math.floor(21 + Math.random() * 10),
        T9: Math.floor(20 + Math.random() * 9),
        T10: Math.floor(19 + Math.random() * 11),
        // Humidity fields
        H1: Math.floor(40 + Math.random() * 20),
        H2: Math.floor(45 + Math.random() * 15),
        // Air Speed field (re-added)
        Air_Speed: parseFloat((5 + Math.random() * 10).toFixed(2))
      };
    };

    // Get count parameter from query string (default to 1)
    const searchParams = request.nextUrl.searchParams;
    const count = parseInt(searchParams.get('count') || '1', 10);
    const interval = parseInt(searchParams.get('interval') || '10', 10);
    
    // Insert data points with specified intervals
    const insertPromises = [];
    
    for (let i = 0; i < count; i++) {
      const timestamp = new Date(Date.now() - (i * interval * 60000)).toISOString();
      const data = generateSampleData();
      
      // Store the data in the database
      const result = { timestamp, data };
      insertPromises.push(storePlcData(result));
    }
    
    // Wait for all inserts to complete
    await Promise.all(insertPromises);
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully inserted ${count} test data points into InfluxDB`,
      interval: `${interval} minutes between data points`
    });
  } catch (error) {
    console.error('Error inserting test data:', error);
    return NextResponse.json(
      { error: `Error inserting test data: ${error.toString()}` },
      { status: 500 }
    );
  }
}
