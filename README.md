# PLC S7-1200 Data Reader for Next.js

This project provides a modern dashboard interface for reading and visualizing data from a Siemens S7-1200 PLC using Next.js and the nodes7 library.

For detailed documentation, please see [README_NODE.md](./README_NODE.md).

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Features

- Reads data from S7-1200 PLC using S7comm protocol
- Modern dashboard UI with icons and card-based layout
- Interactive charts for historical data visualization
- Database integration for storing and retrieving historical PLC data
- Time range selection for historical data (24h, 7d, 30d)
- Real-time data updates every 10 seconds
- Full RTL support for Arabic interface
- Beautiful styling for temperature, humidity, and air speed data
