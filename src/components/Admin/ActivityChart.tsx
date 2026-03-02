import { useMemo } from 'react';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { DashboardStats } from '@/types';

const DATE_RANGE_OPTIONS = [
  { label: '7d', value: '7' },
  { label: '14d', value: '14' },
  { label: '30d', value: '30' },
  { label: '60d', value: '60' },
  { label: '90d', value: '90' },
  { label: '180d', value: '180' },
  { label: 'All', value: '' },
] as const;

const storiesChartConfig = {
  stories: {
    label: 'Stories',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

const tokensChartConfig = {
  inputTokens: {
    label: 'Input Tokens',
    color: 'var(--chart-1)',
  },
  outputTokens: {
    label: 'Output Tokens',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

function fillDateGaps<T extends Record<string, unknown>>(
  data: T[],
  days: string,
  defaults: Omit<T, 'date'>,
): T[] {
  if (!data.length && !days) return data;

  const dataMap = new Map(data.map((d) => [d.date as string, d]));

  const end = new Date();
  end.setHours(0, 0, 0, 0);

  let start: Date;
  if (!days) {
    if (!data.length) return data;
    start = new Date((data[0].date as string) + 'T00:00:00');
  } else {
    start = new Date(end);
    start.setDate(start.getDate() - parseInt(days) + 1);
  }

  const filled: T[] = [];
  const current = new Date(start);

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    filled.push(dataMap.get(dateStr) ?? ({ date: dateStr, ...defaults } as unknown as T));
    current.setDate(current.getDate() + 1);
  }

  return filled;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ChartSkeleton() {
  return <div className='h-[350px] w-full animate-pulse rounded bg-muted' />;
}

export default function ActivityChart({
  data,
  days,
  setDays,
  chartTab,
  setChartTab,
  isLoading,
}: {
  data: DashboardStats | undefined;
  days: string;
  setDays: (value: string) => void;
  chartTab: string;
  setChartTab: (value: string) => void;
  isLoading: boolean;
}) {
  const storiesByDay = useMemo(
    () => fillDateGaps(data?.charts.storiesByDay ?? [], days, { stories: 0 }),
    [data?.charts.storiesByDay, days],
  );

  const tokensByDay = useMemo(
    () => fillDateGaps(data?.charts.tokensByDay ?? [], days, { inputTokens: 0, outputTokens: 0 }),
    [data?.charts.tokensByDay, days],
  );

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Daily story generation and token usage.</CardDescription>
          </div>
          <div className='flex gap-1'>
            {DATE_RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setDays(option.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  days === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={chartTab} onValueChange={setChartTab}>
          <TabsList>
            <TabsTrigger value='stories'>Stories</TabsTrigger>
            <TabsTrigger value='tokens'>Tokens</TabsTrigger>
          </TabsList>

          <TabsContent value='stories' className='mt-4'>
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <ChartContainer config={storiesChartConfig} className='h-[350px] w-full'>
                <BarChart data={storiesByDay} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey='date'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={formatDateLabel}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent labelFormatter={formatDateLabel} />}
                  />
                  <Bar dataKey='stories' fill='var(--color-stories)' radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </TabsContent>

          <TabsContent value='tokens' className='mt-4'>
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <ChartContainer config={tokensChartConfig} className='h-[350px] w-full'>
                <BarChart data={tokensByDay} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey='date'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={formatDateLabel}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip
                    content={<ChartTooltipContent labelFormatter={formatDateLabel} />}
                  />
                  <Bar
                    dataKey='inputTokens'
                    stackId='tokens'
                    fill='var(--color-inputTokens)'
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey='outputTokens'
                    stackId='tokens'
                    fill='var(--color-outputTokens)'
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
