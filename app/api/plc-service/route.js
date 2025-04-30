import { NextResponse } from 'next/server';
import { storePlcData } from '../../lib/db';
import S7 from 'nodes7';

// Global variables to track service state
let isServiceRunning = false;
let serviceInterval = null;
let lastRunTime = null;
let errorCount = 0;
let successCount = 0;

// PLC connection configuration
const conn = new S7();
const connectionParams = {
  host: '192.168.0.1', // PLC IP address
  port: 102,           // Standard S7 port
  rack: 0,             // Rack number
  slot: 1              // Slot number
};

// Variables to read from the PLC
const variables = {
  T1: 'DB1,REAL24',
  T2: 'DB1,REAL28',
  T3: 'DB1,REAL32',
  T4: 'DB1,REAL36',
  T5: 'DB1,REAL40',
  T6: 'DB1,REAL44',
  T7: 'DB1,REAL48',
  T8: 'DB1,REAL52',
  T9: 'DB1,REAL56',
  T10: 'DB1,REAL60',
  H1: 'DB1,REAL64',
  H2: 'DB1,REAL68',
  Air_Speed: 'DB1,REAL72'
};

/**
 * Read data from the PLC and store it in the database
 */
async function readAndStorePlcData() {
  return new Promise((resolve, reject) => {
    // Connect to the PLC
    conn.initiateConnection(connectionParams, (err) => {
      if (err) {
        console.error('❌ Failed to connect to PLC:', err);
        errorCount++;
        return reject(err);
      }

      console.log('✅ Connected to PLC');
      
      // Add variables to read
      conn.setTranslationCB((tag) => tag); // Use default translation
      conn.addItems(Object.values(variables));
      
      // Read the variables
      conn.readAllItems((err, data) => {
        if (err) {
          console.error('❌ Failed to read from PLC:', err);
          errorCount++;
          return reject(err);
        }
        
        // Format the data for storage
        const formattedData = {};
        Object.entries(variables).forEach(([key, address]) => {
          formattedData[key] = data[address];
        });
        
        console.log('📊 Read data from PLC:', formattedData);
        
        // Store the data in the database
        const timestamp = new Date().toISOString();
        storePlcData({ timestamp, data: formattedData })
          .then(() => {
            console.log('✅ Data stored in InfluxDB at', timestamp);
            successCount++;
            lastRunTime = timestamp;
            resolve({ success: true, data: formattedData, timestamp });
          })
          .catch((error) => {
            console.error('❌ Failed to store data in InfluxDB:', error);
            errorCount++;
            reject(error);
          });
      });
    });
  });
}

/**
 * Start the PLC data collection service
 * @param {number} interval - Interval in seconds
 */
function startService(interval = 10) {
  if (isServiceRunning) {
    return { success: false, message: 'Service is already running' };
  }
  
  const intervalMs = interval * 1000;
  console.log(`🚀 Starting PLC data collection service with interval: ${interval} seconds`);
  
  // Run immediately
  readAndStorePlcData().catch(err => console.error('Error in initial PLC data read:', err));
  
  // Set up interval
  serviceInterval = setInterval(() => {
    readAndStorePlcData().catch(err => console.error('Error in scheduled PLC data read:', err));
  }, intervalMs);
  
  isServiceRunning = true;
  
  return { 
    success: true, 
    message: `Service started with interval: ${interval} seconds` 
  };
}

/**
 * Stop the PLC data collection service
 */
function stopService() {
  if (!isServiceRunning) {
    return { success: false, message: 'Service is not running' };
  }
  
  console.log('🛑 Stopping PLC data collection service');
  clearInterval(serviceInterval);
  serviceInterval = null;
  isServiceRunning = false;
  
  return { 
    success: true, 
    message: 'Service stopped' 
  };
}

// Start the service when the server starts
// Use a small delay to ensure the server is fully initialized
setTimeout(() => {
  startService(10); // 10 seconds interval
}, 5000);

/**
 * API route to control the PLC data collection service
 */
export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  // Handle different actions
  switch (action) {
    case 'start':
      const interval = parseInt(searchParams.get('interval') || '10', 10);
      return NextResponse.json(startService(interval));
      
    case 'stop':
      return NextResponse.json(stopService());
      
    case 'status':
      return NextResponse.json({
        isRunning: isServiceRunning,
        lastRunTime,
        errorCount,
        successCount,
        interval: serviceInterval ? 'Running' : 'Stopped'
      });
      
    case 'read':
      try {
        const data = await readAndStorePlcData();
        return NextResponse.json({ success: true, data });
      } catch (error) {
        return NextResponse.json(
          { success: false, error: error.toString() },
          { status: 500 }
        );
      }
      
    default:
      return NextResponse.json({
        message: 'PLC Data Collection Service',
        usage: 'Use ?action=start|stop|status|read to control the service',
        isRunning: isServiceRunning,
        lastRunTime,
        errorCount,
        successCount
      });
  }
}
