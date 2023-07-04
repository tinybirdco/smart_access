"use client";

import { LineChart, DonutChart, Title, Bold, BadgeDelta, Card, Grid, DeltaType, Flex, Metric, ProgressBar, Text, DateRangePicker, MultiSelect, TextInput, MultiSelectItem } from "@tremor/react"; 
import { useState, useEffect } from "react";
import useInterval from '../hooks/useInterval';
import { fetchTinybirdUrl, fetchTinybirdUrlToTremorChart, getCategories } from "../utils";
import { 
   RefreshIcon,StopIcon,
 } from "@heroicons/react/outline";

const TINYBIRD_HOST = process.env.NEXT_PUBLIC_TINYBIRD_HOST;
const TINYBIRD_TOKEN = process.env.NEXT_PUBLIC_TINYBIRD_TOKEN;

const MS_REFRESH = 2000;

export default function KpiCardGrid() {
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

  let date_from = new Date(dates[0].getTime() - dates[0].getTimezoneOffset() * 60000).toISOString();
  let date_to = dates[1] ? new Date(dates[1].getTime() - dates[1].getTimezoneOffset() * 60000 + 60000 * 60 * 24 - 1).toISOString() : date_from;

  let apiAccessMethods = `https://${TINYBIRD_HOST}/v0/pipes/api_access_methods.json?customerId=Customer92092&token=${token}${date_from ? `&datetime_start=${date_from}` : ''}${date_to ? `&datetime_end=${date_to}` : ''}`;

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

  const percentageFormatter=(number)  => `${Intl.NumberFormat("us").format(number).toString()}%`;

  return (
  <>
    <title>Smart Access Dashboard</title>
  
    <Card className="max-w-lg">
    <Title>Access Methods</Title>
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
    </>
  );
}