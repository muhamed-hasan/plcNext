const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const cron = require('node-cron');
const S7 = require('nodes7');

// Import our database module
const { storePlcData } = require('./app/lib/db');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

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

// Statistics
let successCount = 0;
let errorCount = 0;
let lastRunTime = null;

/**
 * Read data from the PLC and store it in the database
 */
async function readAndStorePlcData() {
  return new Promise((resolve, reject) => {
    console.log('🔄 [BACKGROUND] Starting PLC data collection...');
    
    // Connect to the PLC
    conn.initiateConnection(connectionParams, (err) => {
      if (err) {
        console.error('❌ [BACKGROUND] Failed to connect to PLC:', err);
        errorCount++;
        return reject(err);
      }

      console.log('✅ [BACKGROUND] Connected to PLC');
      
      // Add variables to read
      conn.setTranslationCB((tag) => tag); // Use default translation
      conn.addItems(Object.values(variables));
      
      // Read the variables
      conn.readAllItems((err, data) => {
        if (err) {
          console.error('❌ [BACKGROUND] Failed to read from PLC:', err);
          errorCount++;
          return reject(err);
        }
        
        // Format the data for storage
        const formattedData = {};
        Object.entries(variables).forEach(([key, address]) => {
          formattedData[key] = data[address];
        });
        
        console.log('📊 [BACKGROUND] Read data from PLC:', formattedData);
        
        // Store the data in the database
        const timestamp = new Date().toISOString();
        storePlcData({ timestamp, data: formattedData })
          .then(() => {
            console.log('✅ [BACKGROUND] Data stored in InfluxDB at', timestamp);
            successCount++;
            lastRunTime = timestamp;
            resolve({ success: true, data: formattedData, timestamp });
          })
          .catch((error) => {
            console.error('❌ [BACKGROUND] Failed to store data in InfluxDB:', error);
            errorCount++;
            reject(error);
          });
      });
    });
  });
}

// Initialize Next.js
app.prepare().then(() => {
  // Create HTTP server
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    
    // Special route for checking background service status
    if (parsedUrl.pathname === '/api/background-status') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        status: 'running',
        successCount,
        errorCount,
        lastRunTime
      }));
      return;
    }
    
    // Handle all other routes with Next.js
    handle(req, res, parsedUrl);
  });
  
  // Start the server
  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('🚀 Server running on http://localhost:3000');
    
    // Schedule the background task to run every 10 seconds
    console.log('🕒 Setting up background PLC data collection (every 10 seconds)');
    
    // Run immediately on startup
    readAndStorePlcData()
      .then(() => console.log('✅ Initial PLC data collection completed'))
      .catch(err => console.error('❌ Initial PLC data collection failed:', err));
    
    // Schedule regular runs
    cron.schedule('*/10 * * * * *', () => {
      console.log('⏰ [BACKGROUND] Running scheduled PLC data collection');
      readAndStorePlcData()
        .catch(err => console.error('❌ Scheduled PLC data collection failed:', err));
    });
  });
});
