"use client";

import { BarChart, AreaChart, DonutChart, Title, Bold, BadgeDelta, Card, Grid, DeltaType, Flex, Metric, ProgressBar, Text, DateRangePicker, MultiSelect, TextInput, MultiSelectItem, Select, SelectItem } from "@tremor/react";
import { useState, useEffect } from "react";
import useInterval from '../hooks/useInterval';
import { fetchTinybirdUrl, fetchTinybirdUrlToTremorChart, getCategories } from "../utils";
import {
  RefreshIcon, StopIcon,
} from "@heroicons/react/outline";

const TINYBIRD_HOST = process.env.NEXT_PUBLIC_TINYBIRD_HOST;
const TINYBIRD_TOKEN = process.env.NEXT_PUBLIC_TINYBIRD_TOKEN;

const MS_REFRESH = 2000;

export default function Dashboard() {
  let msRefresh = MS_REFRESH;

  const [token, setToken] = useState(TINYBIRD_TOKEN);

  const now = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000);

  const [dates, setDates] = useState([
    new Date(2022, 1, 1),
    new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ]);

  const [quickRefresh, setQuickRefresh] = useState(
    false
  );

  const [accessMethods, setAccessMethods] = useState([]);
  const [accessPoints, setAccessPoints] = useState([]);
  const [accessTimes, setAccessTimes] = useState([]);

  const [accessTimesGrouping, setAccessTimesGrouping] = useState('hourly');

  let date_from = new Date(dates[0].getTime() - dates[0].getTimezoneOffset() * 60000).toISOString();
  let date_to = dates[1] ? new Date(dates[1].getTime() - dates[1].getTimezoneOffset() * 60000 + 60000 * 60 * 24 - 1).toISOString() : date_from;

  let apiAccessMethods = `https://${TINYBIRD_HOST}/v0/pipes/api_access_methods.json?customerId=Customer92092&token=${token}${date_from ? `&datetime_start=${date_from}` : ''}${date_to ? `&datetime_end=${date_to}` : ''}`;
  let apiAccessPoints = `https://${TINYBIRD_HOST}/v0/pipes/api_access_points.json?customerId=Customer92092&token=${token}${date_from ? `&datetime_start=${date_from}` : ''}${date_to ? `&datetime_end=${date_to}` : ''}`;
  let apiAccessTimes = `https://${TINYBIRD_HOST}/v0/pipes/api_access_times.json?customerId=Customer92092&token=${token}${date_from ? `&datetime_start=${date_from}` : ''}${date_to ? `&datetime_end=${date_to}` : ''}&x_axis=${accessTimesGrouping}`;

  quickRefresh ?
    useInterval(() => {
      fetchTinybirdUrl(apiAccessMethods, setAccessMethods);
    }, msRefresh)
    :
    useInterval(() => {
      fetchTinybirdUrl(apiAccessMethods, setAccessMethods);
    }, msRefresh * 10000)


  useEffect(() => {
    fetchTinybirdUrl(apiAccessMethods, setAccessMethods);
  }, [apiAccessMethods]);

  useEffect(() => {
    fetchTinybirdUrl(apiAccessPoints, setAccessPoints);
  }, [apiAccessPoints]);

  useEffect(() => {
    fetchTinybirdUrl(apiAccessTimes, setAccessTimes);
  }, [apiAccessTimes]);

  const percentageFormatter = (number) => `${Intl.NumberFormat("us").format(number).toString()}%`;

  return (
    <>
      <title>Smart Access Dashboard</title>

      <Card className="max-w-lg">
        <Title>Key types</Title>

        <DonutChart
          className="mt-6"
          data={accessMethods}
          category="percentage"
          index="device_type"
          variant="pie"
          valueFormatter={percentageFormatter}
          colors={["amber", "indigo", "rose", "cyan"]}

        />
      </Card>
      <Card>
        <Title>Most used access points</Title>
        <BarChart
          className="mt-6"
          data={accessPoints}
          index="access_point_id"
          categories={getCategories(accessPoints, 'access_point_id')}
          colors={["blue", "teal", "amber", "rose", "indigo", "emerald"]}
          yAxisWidth={120}
          layout="vertical"
        />
      </Card>
      <Card>
        <Flex>
          <Title>When people access</Title>
          <div className="max-w-sm">

            <Select value={accessTimesGrouping} onValueChange={setAccessTimesGrouping}>
              <SelectItem value="hourly">
                Hourly
              </SelectItem>
              <SelectItem value="daily">
                Daily
              </SelectItem>
              <SelectItem value="monthly">
                Monthly
              </SelectItem>
              <SelectItem value="none">
                No Grouping
              </SelectItem>
            </Select>
          </div>
        </Flex>
        <AreaChart
          className="mt-4"
          data={accessTimes}
          index="t"
          categories={["total"]}
          colors={["blue"]}
        />
      </Card>
    </>
  );
}