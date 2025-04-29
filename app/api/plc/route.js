import { NextResponse } from 'next/server';
import { storePlcData } from '../../lib/db';

// Since nodes7 uses CommonJS, we need to import it dynamically in a Next.js environment
let nodes7;
try {
  // Try to import nodes7 at runtime
  nodes7 = require('nodes7');
} catch (error) {
  console.error('Error loading nodes7:', error);
}

// PLC connection configuration
const plcConfig = {
  ip: '192.168.0.1', // Updated IP address
  rack: 0,
  slot: 1,
  port: 102
};

// Handles GET requests to /api/plc
export async function GET() {
  if (!nodes7) {
    return NextResponse.json(
      { error: 'PLC communication library not available' },
      { status: 500 }
    );
  }

  try {
    // Create a new S7 connection
    const conn = new nodes7();
    
    // Configure connection
    const connectPromise = new Promise((resolve, reject) => {
      conn.initiateConnection({
        host: plcConfig.ip,
        rack: plcConfig.rack,
        slot: plcConfig.slot,
        port: plcConfig.port,
        debug: false
      }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    await connectPromise;

    // Define variables to read from PLC
    // Reading 12 Integer variables starting from offset 0 and 1 Real variable at offset 24
    const variables = {
      T1: 'DB1,INT0',    // Integer at offset 0
      T2: 'DB1,INT2',    // Integer at offset 2
      T3: 'DB1,INT4',    // Integer at offset 4
      T4: 'DB1,INT6',    // Integer at offset 6
      T5: 'DB1,INT8',    // Integer at offset 8
      T6: 'DB1,INT10',   // Integer at offset 10
      T7: 'DB1,INT12',   // Integer at offset 12
      T8: 'DB1,INT14',   // Integer at offset 14
      T9: 'DB1,INT16',   // Integer at offset 16
      T10: 'DB1,INT18',  // Integer at offset 18
      H1: 'DB1,INT20',   // Integer at offset 20
      H2: 'DB1,INT22',   // Integer at offset 22
      Air_Speed: 'DB1,REAL24', // Real at offset 24
    };

    // Create a promise to handle the asynchronous PLC reading
    const readPLC = () => {
      return new Promise((resolve, reject) => {
        conn.setTranslationCB((tag) => {
          return variables[tag];
        });
        
        conn.addItems(Object.entries(variables).map(([key]) => key));
        
        conn.readAllItems((err, values) => {
          if (err) {
            reject(`Error reading from PLC: ${err.toString()}`);
            return;
          }
          
          // Close the connection
          conn.dropConnection();
          resolve(values);
        });
      });
    };

    try {
      const data = await readPLC();
      const timestamp = new Date().toISOString();
      
      // Store the data in the database
      const result = { timestamp, data };
      await storePlcData(result);
      
      return NextResponse.json({ 
        success: true, 
        data,
        timestamp
      });
    } catch (error) {
      return NextResponse.json(
        { error: error.toString() },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: `Unexpected error: ${error.toString()}` },
      { status: 500 }
    );
  }
} 