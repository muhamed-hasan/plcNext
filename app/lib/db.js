// InfluxDB connection for storing and retrieving PLC data
import { InfluxDB, FieldType } from 'influx';
import moment from 'moment';

// InfluxDB connection configuration - without authentication since user doesn't have credentials
const influx = new InfluxDB({
  host: 'localhost',
  port: 8086,
  database: 'plc_data',
  // No username/password as mentioned by user
  schema: [
    {
      measurement: 'plc_readings',
      fields: {
        // Using FieldType.FLOAT as shown in the documentation example
        T1: FieldType.FLOAT,
        T2: FieldType.FLOAT,
        T3: FieldType.FLOAT,
        T4: FieldType.FLOAT,
        T5: FieldType.FLOAT,
        T6: FieldType.FLOAT,
        T7: FieldType.FLOAT,
        T8: FieldType.FLOAT,
        T9: FieldType.FLOAT,
        T10: FieldType.FLOAT,
        H1: FieldType.FLOAT,
        H2: FieldType.FLOAT,
        Air_Speed: FieldType.FLOAT  // Re-added Air_Speed field
      },
      tags: ['source']
    }
  ]
});

/**
 * Initialize the InfluxDB database if it doesn't exist
 */
async function initializeDatabase() {
  try {
    console.log('🔍 Attempting to connect to InfluxDB at localhost:8086...');
    
    // Check if we can connect to InfluxDB
    try {
      const ping = await influx.ping(5000);
      console.log('✅ InfluxDB connection successful:', {
        version: ping[0].version,
        online: ping[0].online,
        responseTime: `${ping[0].rtt}ms`
      });
    } catch (pingError) {
      console.error('❌ InfluxDB connection failed:', pingError.message);
      return false;
    }
    
    // Check if the database exists, create it if it doesn't
    console.log('🔍 Checking for database: plc_data');
    const databases = await influx.getDatabaseNames();
    console.log('📋 Available databases:', databases);
    
    if (!databases.includes('plc_data')) {
      console.log('🔧 Creating InfluxDB database: plc_data');
      await influx.createDatabase('plc_data');
      console.log('✅ Database created successfully');
      
      // Set up retention policies if needed
      console.log('🔧 Setting up retention policy: one_month');
      await influx.createRetentionPolicy({
        name: 'one_month',
        database: 'plc_data',
        duration: '30d',
        replication: 1,
        isDefault: true
      });
      console.log('✅ Retention policy created successfully');
    } else {
      console.log('✅ Database plc_data already exists');
    }
    
    // Check if the measurement exists
    console.log('🔍 Checking for measurement: plc_readings');
    try {
      const measurements = await influx.getMeasurements();
      console.log('📋 Available measurements:', measurements);
      
      if (measurements.includes('plc_readings')) {
        console.log('✅ Measurement plc_readings exists');
      } else {
        console.log('⚠️ Measurement plc_readings does not exist yet. It will be created when data is written.');
      }
    } catch (measurementError) {
      console.error('❌ Error checking measurements:', measurementError.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error initializing InfluxDB database:', error);
    return false;
  }
}

/**
 * Store PLC data in the InfluxDB database
 * @param {Object} data - The PLC data to store (contains timestamp and data fields)
 * @returns {Promise<boolean>} - Success status
 */
export async function storePlcData(data) {
  try {
    // Ensure database exists
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.error('⚠️ Database initialization failed, cannot store data');
      return false;
    }
    
    console.log('📊 Preparing to store PLC data in InfluxDB:', data.timestamp);
    
    // Create points array for InfluxDB
    const points = [
      {
        measurement: 'plc_readings',
        tags: { source: 'plc_s7_1200' },
        fields: {},
        timestamp: new Date(data.timestamp)
      }
    ];
    
    // Add all data fields to the point
    let fieldCount = 0;
    console.log('🔍 Processing PLC data fields...');
    
    // Create a fields object separately first
    const fields = {};
    
    for (const [key, value] of Object.entries(data.data)) {
      // Process temperature, humidity, and Air_Speed fields
      if (key.startsWith('T') || key.startsWith('H') || key === 'Air_Speed') {
        try {
          // Explicitly convert to float and ensure no NaN values
          const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
          const finalValue = isNaN(numValue) ? 0.0 : numValue;
          
          // Store as a number, not as a string
          fields[key] = finalValue;
          fieldCount++;
          console.log(`  - Field ${key}: ${finalValue} (${typeof finalValue})`);
        } catch (fieldError) {
          console.warn(`  - Skipping field ${key} due to error:`, fieldError.message);
        }
      }
    }
    
    // Set all fields at once
    points[0].fields = fields;
    
    console.log(`✅ Processed ${fieldCount} fields for storage`);
    
    if (fieldCount === 0) {
      console.warn('⚠️ No valid fields found to store');
      return false;
    }
    
    // Log the point being written
    console.log('📝 Writing point to InfluxDB:', {
      measurement: points[0].measurement,
      timestamp: points[0].timestamp,
      tags: points[0].tags,
      fieldCount: Object.keys(points[0].fields).length
    });
    
    // Write the point to InfluxDB
    await influx.writePoints(points);
    console.log('✅ Data successfully written to InfluxDB');
    
    return true;
  } catch (error) {
    console.error('❌ Error storing PLC data in InfluxDB:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return false;
  }
}

/**
 * Get historical PLC data from the InfluxDB database
 * @param {string} timeRange - Time range to fetch data for (e.g., '24h', '7d', '30d', 'custom')
 * @param {Object} customRange - Custom time range with start and end dates (only used when timeRange is 'custom')
 * @returns {Promise<Object>} - Historical data
 */
export async function getHistoricalData(timeRange = '24h', customRange = null) {
  try {
    // Ensure database exists
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.error('⚠️ Database initialization failed, cannot retrieve historical data');
      return { temperatures: [], humidity: [], airSpeed: [] };
    }
    
    console.log('📊 Fetching historical data for range:', timeRange);
    
    // Calculate time range for the query
    let timeFilter;
    
    if (timeRange === 'custom' && customRange) {
      // Use custom date range if provided
      const startDate = moment(customRange.startDate).toISOString();
      const endDate = moment(customRange.endDate).toISOString();
      timeFilter = `time >= '${startDate}' AND time <= '${endDate}'`;
      console.log(`📅 Using custom date range: ${startDate} to ${endDate}`);
    } else {
      // Use predefined time ranges
      switch (timeRange) {
        case '24h':
          timeFilter = 'time > now() - 24h';
          break;
        case '7d':
          timeFilter = 'time > now() - 7d';
          break;
        case '30d':
          timeFilter = 'time > now() - 30d';
          break;
        default:
          timeFilter = 'time > now() - 24h'; // Default to 24 hours
      }
      console.log(`📅 Using predefined time range: ${timeRange} (${timeFilter})`);
    }
    
    // Query temperature data
    const temperatureQuery = `
      SELECT T1, T2, T3, T4, T5, T6, T7, T8, T9, T10
      FROM plc_readings
      WHERE ${timeFilter}
    `;
    console.log('🔍 Temperature query:', temperatureQuery.trim());
    
    // Query humidity data
    const humidityQuery = `
      SELECT H1, H2
      FROM plc_readings
      WHERE ${timeFilter}
    `;
    console.log('🔍 Humidity query:', humidityQuery.trim());
    
    // Query air speed data
    const airSpeedQuery = `
      SELECT Air_Speed
      FROM plc_readings
      WHERE ${timeFilter}
    `;
    console.log('🔍 Air Speed query:', airSpeedQuery.trim());
    
    // Execute temperature, humidity, and air speed queries in parallel
    console.log('🔍 Executing queries...');
    const [temperatureResults, humidityResults, airSpeedResults] = await Promise.all([
      influx.query(temperatureQuery),
      influx.query(humidityQuery),
      influx.query(airSpeedQuery)
    ]);
    
    console.log(`✅ Queries completed. Results: Temperature: ${temperatureResults.length} points, Humidity: ${humidityResults.length} points, Air Speed: ${airSpeedResults.length} points`);
    
    // Process and format the results
    console.log('📊 Processing temperature data...');
    const temperatures = temperatureResults.map(point => ({
      time: new Date(point.time).toISOString(),
      T1: point.T1 || null,
      T2: point.T2 || null,
      T3: point.T3 || null,
      T4: point.T4 || null,
      T5: point.T5 || null,
      T6: point.T6 || null,
      T7: point.T7 || null,
      T8: point.T8 || null,
      T9: point.T9 || null,
      T10: point.T10 || null
    }));
    
    console.log('📊 Processing humidity data...');
    const humidity = humidityResults.map(point => ({
      time: new Date(point.time).toISOString(),
      H1: point.H1 || null,
      H2: point.H2 || null
    }));
    
    // Process air speed data
    console.log('📊 Processing air speed data...');
    const airSpeed = airSpeedResults.map(point => ({
      time: new Date(point.time).toISOString(),
      Air_Speed: point.Air_Speed || null
    }));
    
    console.log(`✅ Historical data processing complete. Returning ${temperatures.length} data points.`);
    
    return {
      temperatures,
      humidity,
      airSpeed
    };
  } catch (error) {
    console.error('❌ Error fetching historical data:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return {
      temperatures: [],
      humidity: [],
      airSpeed: []
    };
  }
}

/**
 * Get the latest PLC data from InfluxDB
 * @returns {Promise<Object>} - Latest data point
 */
export async function getLatestData() {
  try {
    // Ensure database exists
    await initializeDatabase();
    
    // Query to get the most recent data point
    const query = `
      SELECT *
      FROM plc_readings
      ORDER BY time DESC
      LIMIT 1
    `;
    
    const results = await influx.query(query);
    
    if (results.length === 0) {
      console.log('No data found in InfluxDB');
      return null;
    }
    
    return results[0];
  } catch (error) {
    console.error('Error fetching latest data from InfluxDB:', error);
    return null;
  }
} 