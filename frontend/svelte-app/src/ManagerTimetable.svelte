<script>
  import { onMount } from 'svelte';
  import { Calendar, Loader2 } from 'lucide-svelte';
  import { Alert, AlertDescription } from '@/components/ui/alert';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  import { Input } from '@/components/ui/input';
  import { Button } from '@/components/ui/button';
  import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

  let departmentId = '';
  let statusFilter = '';
  let arrangements = [];
  let error = '';
  let loading = false;

  const API_BASE_URL = 'http://localhost:8080';

  async function fetchTimetableData() {
    if (!departmentId) {
      error = 'Please enter a department ID';
      return;
    }

    loading = true;
    error = '';

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

      arrangements = data.arrangements;
    } catch (err) {
      error = err.message || 'Error fetching timetable data';
      arrangements = [];
    } finally {
      loading = false;
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  $: locationDistribution = arrangements.length ? 
    Object.entries(
      arrangements.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      percentage: ((value / arrangements.length) * 100).toFixed(1)
    })) : [];

  const COLORS = ['#3b82f6', '#22c55e']; // Blue for office, Green for home
</script>

<div class="max-w-4xl mx-auto p-4 space-y-4">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Calendar class="h-6 w-6" />
          Team Timetable Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            placeholder="Enter Department ID"
            bind:value={departmentId}
            class="w-full"
          />
          <select
            bind:value={statusFilter}
            class="w-full rounded-md border border-gray-200 px-3 py-2"
          >
            <option value="">All Locations</option>
            <option value="office">Office</option>
            <option value="home">Home</option>
          </select>
          <Button 
            on:click={fetchTimetableData} 
            class="w-full"
            disabled={loading}
          >
            {#if loading}
              <Loader2 class="mr-2 h-4 w-4 animate-spin" />
              Loading...
            {:else}
              View Timetable
            {/if}
          </Button>
        </div>

        {#if error}
          <Alert variant="destructive" class="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        {/if}

        <div class="space-y-2">
          {#each arrangements as arrangement, index (arrangement.id || index)}
            <div
              class="p-4 rounded-lg border {
                arrangement.status === 'office' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'
              }"
            >
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-medium">{arrangement.employee_id}</h3>
                  <p class="text-sm text-gray-600">ID: {arrangement.id}</p>
                </div>
                <div class="text-right">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {
                    arrangement.status === 'office' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }">
                    {arrangement.status.toUpperCase()}
                  </span>
                  <p class="text-sm text-gray-600 mt-1">{formatDate(arrangement.date)}</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Location Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {#if arrangements.length > 0}
          <div class="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={locationDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {#each locationDistribution as entry, index}
                    <Cell fill={COLORS[index % COLORS.length]} />
                  {/each}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        {:else}
          <div class="h-64 flex items-center justify-center text-gray-500">
            No data available
          </div>
        {/if}
      </CardContent>
    </Card>
  </div>
</div>

<style>
  :global(.animate-spin) {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
