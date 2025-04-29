// InfluxDB connection for storing and retrieving PLC data
import { InfluxDB, Point } from 'influx';
import moment from 'moment';

// InfluxDB connection configuration
const influx = new InfluxDB({
  host: 'localhost',
  port: 8086,
  database: 'plc_data',
  username: 'admin',  // Change these credentials as needed
  password: 'admin',  // Change these credentials as needed
  schema: [
    {
      measurement: 'plc_readings',
      fields: {
        T1: InfluxDB.FieldType.FLOAT,
        T2: InfluxDB.FieldType.FLOAT,
        T3: InfluxDB.FieldType.FLOAT,
        T4: InfluxDB.FieldType.FLOAT,
        T5: InfluxDB.FieldType.FLOAT,
        T6: InfluxDB.FieldType.FLOAT,
        T7: InfluxDB.FieldType.FLOAT,
        T8: InfluxDB.FieldType.FLOAT,
        T9: InfluxDB.FieldType.FLOAT,
        T10: InfluxDB.FieldType.FLOAT,
        H1: InfluxDB.FieldType.FLOAT,
        H2: InfluxDB.FieldType.FLOAT,
        Air_Speed: InfluxDB.FieldType.FLOAT
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
    // Check if the database exists, create it if it doesn't
    const databases = await influx.getDatabaseNames();
    if (!databases.includes('plc_data')) {
      console.log('Creating InfluxDB database: plc_data');
      await influx.createDatabase('plc_data');
      
      // Set up retention policies if needed
      await influx.createRetentionPolicy('one_month', {
        database: 'plc_data',
        duration: '30d',
        replication: 1,
        isDefault: true
      });
    }
    return true;
  } catch (error) {
    console.error('Error initializing InfluxDB database:', error);
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
    await initializeDatabase();
    
    console.log('Storing PLC data in InfluxDB:', data.timestamp);
    
    // Create a point with all the PLC data fields
    const point = new Point('plc_readings')
      .tag('source', 'plc_s7_1200')
      .timestamp(new Date(data.timestamp));
    
    // Add all data fields to the point
    for (const [key, value] of Object.entries(data.data)) {
      // Convert string values to numbers if needed
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      point.floatField(key, numValue);
    }
    
    // Write the point to InfluxDB
    await influx.writePoints([point]);
    
    return true;
  } catch (error) {
    console.error('Error storing PLC data in InfluxDB:', error);
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
    await initializeDatabase();
    
    console.log('Fetching historical data for range:', timeRange);
    
    // Calculate time range for the query
    let timeFilter;
    
    if (timeRange === 'custom' && customRange) {
      // Use custom date range if provided
      const startDate = moment(customRange.startDate).toISOString();
      const endDate = moment(customRange.endDate).toISOString();
      timeFilter = `time >= '${startDate}' AND time <= '${endDate}'`;
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
    }
    
    // Query temperature data
    const temperatureQuery = `
      SELECT T1, T2, T3, T4, T5, T6, T7, T8, T9, T10
      FROM plc_readings
      WHERE ${timeFilter}
    `;
    
    // Query humidity data
    const humidityQuery = `
      SELECT H1, H2
      FROM plc_readings
      WHERE ${timeFilter}
    `;
    
    // Query air speed data
    const airSpeedQuery = `
      SELECT Air_Speed
      FROM plc_readings
      WHERE ${timeFilter}
    `;
    
    // Execute all queries in parallel
    const [temperatureResults, humidityResults, airSpeedResults] = await Promise.all([
      influx.query(temperatureQuery),
      influx.query(humidityQuery),
      influx.query(airSpeedQuery)
    ]);
    
    // Process and format the results
    const temperatures = temperatureResults.map(point => ({
      time: point.time.toISOString(),
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
    
    const humidity = humidityResults.map(point => ({
      time: point.time.toISOString(),
      H1: point.H1 || null,
      H2: point.H2 || null
    }));
    
    const airSpeed = airSpeedResults.map(point => ({
      time: point.time.toISOString(),
      Air_Speed: point.Air_Speed || null
    }));
    
    return {
      temperatures,
      humidity,
      airSpeed
    };
  } catch (error) {
    console.error('Error fetching historical data from InfluxDB:', error);
    
    // Return empty data on error
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
      return null;
    }
    
    return results[0];
  } catch (error) {
    console.error('Error fetching latest data from InfluxDB:', error);
    return null;
  }
} 