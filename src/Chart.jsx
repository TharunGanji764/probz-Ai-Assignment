import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import './chart.css';

const Chart = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [timeframe, setTimeframe] = useState('daily');

  useEffect(() => {
    fetch('/data.json')
      .then(response => response.json())
      .then(data => {
        setData(data);
        setFilteredData(data);
      });
  }, []);

  const handleTimeframe = (newTime) => {
    setTimeframe(newTime);
    let filteredData;

    switch (newTime) {
      case 'daily':
        filteredData = data;
        break;
      case 'weekly':
        filteredData = groupByWeek(data);
        break;
      case 'monthly':
        filteredData = groupByMonth(data);
        break;
      default:
        filteredData = data;
    }

    setFilteredData(filteredData);
  };

  const groupByWeek = (data) => {
    const weeks = data.reduce((acc, current) => {
      const date = new Date(current.timestamp);
      const startOfWeek = getStartOfWeek(date);
      const key = startOfWeek.toISOString();

      if (!acc[key]) {
        acc[key] = { timestamp: key, value: 0, count: 0 };
      }

      acc[key].value += current.value;
      acc[key].count += 1;
      return acc;
    }, {});

    return Object.values(weeks).map(item => ({
      timestamp: item.timestamp,
      value: item.value / item.count,
    }));
  };

  const groupByMonth = (data) => {
    const months = data.reduce((acc, current) => {
      const date = new Date(current.timestamp);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month}`;

      if (!acc[key]) {
        acc[key] = { timestamp: key, value: 0, count: 0 };
      }

      acc[key].value += current.value;
      acc[key].count += 1;
      return acc;
    }, {});

    return Object.values(months).map(item => ({
      timestamp: item.timestamp,
      value: item.value / item.count,
    }));
  };

  const getStartOfWeek = (date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  };

  const handleClick = (data) => {
    alert(`Timestamp: ${data.activeLabel}, Value: ${data.activePayload[0].value}`);
  };


  return (
    <div className='container'>
      <div className='chart-container'>
        <div className='buttons'>
          <button onClick={() => handleTimeframe('daily')} className='button'>Daily</button>
          <button onClick={() => handleTimeframe('weekly')} className='button'>Weekly</button>
          <button onClick={() => handleTimeframe('monthly')} className='button'>Monthly</button>
        </div>
        <div className="chart">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={filteredData} onClick={handleClick}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Chart;
