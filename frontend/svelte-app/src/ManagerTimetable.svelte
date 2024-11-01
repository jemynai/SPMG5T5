import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const TeamTimetable = () => {
  const [departmentId, setDepartmentId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [arrangements, setArrangements] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  
  const API_BASE_URL = 'http://localhost:8080'; 
  const fetchTimetableData = async () => {
    if (!departmentId) {
      setError('Please enter a department ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let url = `${API_BASE_URL}/mngr_view_ttbl?department_id=${encodeURIComponent(departmentId)}`;
      if (statusFilter) {
        url += `&status=${encodeURIComponent(statusFilter)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to fetch timetable data');
      }

      setArrangements(data.arrangements);
    } catch (err) {
      setError(err.message || 'Error fetching timetable data');
      setArrangements([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Calculate location distribution for pie chart
  const getLocationDistribution = () => {
    if (!arrangements.length) return [];
    
    const distribution = arrangements.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(distribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      percentage: ((value / arrangements.length) * 100).toFixed(1)
    }));
  };

  const COLORS = ['#3b82f6', '#22c55e']; // Blue for office, Green for home

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Team Timetable Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                placeholder="Enter Department ID"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2"
              >
                <option value="">All Locations</option>
                <option value="office">Office</option>
                <option value="home">Home</option>
              </select>
              <Button 
                onClick={fetchTimetableData} 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'View Timetable'
                )}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              {arrangements.map((arrangement, index) => (
                <div
                  key={arrangement.id || index}
                  className={`p-4 rounded-lg border ${
                    arrangement.status === 'office' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{arrangement.employee_id}</h3>
                      <p className="text-sm text-gray-600">ID: {arrangement.id}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        arrangement.status === 'office' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {arrangement.status.toUpperCase()}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">{formatDate(arrangement.date)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {arrangements.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getLocationDistribution()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {getLocationDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamTimetable;