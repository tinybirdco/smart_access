"use client";

import { BarChart, AreaChart, DonutChart, Title, Col, Card, Grid, Flex, Metric, ProgressBar, Text, DateRangePicker, MultiSelect, TextInput, MultiSelectItem, Select, SelectItem, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from "@tremor/react";
import { useState, useEffect } from "react";
import useInterval from '../hooks/useInterval';
import { fetchTinybirdUrl, fetchTinybirdUrlToTremorChart, getCategories } from "../utils";
import {
  RefreshIcon, StopIcon,
} from "@heroicons/react/outline";
import Head from "next/head";


const TINYBIRD_HOST = process.env.NEXT_PUBLIC_TINYBIRD_HOST;
const TINYBIRD_TOKEN = process.env.NEXT_PUBLIC_TINYBIRD_TOKEN;

const MS_REFRESH = 2000;

export default function Dashboard() {
  let msRefresh = MS_REFRESH;

  const [token, setToken] = useState(TINYBIRD_TOKEN);

  const now = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000);

  const [dates, setDates] = useState({
    from: new Date(2023, 1, 1),
    to: new Date()
  }
  );

  const [quickRefresh, setQuickRefresh] = useState(
    false
  );

  const [accessMethods, setAccessMethods] = useState([]);
  const [accessPoints, setAccessPoints] = useState([]);
  const [accessTimes, setAccessTimes] = useState([]);
  const [latestActivity, setLatestActivity] = useState([]);
  const [accessDenied, setAccessDenied] = useState([]);

  const [customers, setCustomers] = useState('');
  const [customerId, setCustomerId] = useState('Customer12988');

  const [accessTimesGrouping, setAccessTimesGrouping] = useState('hourly');

  let date_from = dates.from ? new Date(dates.from.getTime() - dates.from.getTimezoneOffset() * 60000).toISOString() : date_from;
  let date_to = dates.to ? new Date(dates.to.getTime() - dates.to.getTimezoneOffset() * 60000 + 60000 * 60 * 24 - 1).toISOString() : date_from;

  let filterCustomers = `https://${TINYBIRD_HOST}/v0/pipes/filter_customers.json?token=${token}`;

  let apiAccessMethods = `https://${TINYBIRD_HOST}/v0/pipes/api_access_methods.json?customerId=${customerId}&token=${token}${date_from ? `&datetime_start=${date_from}` : ''}${date_to ? `&datetime_end=${date_to}` : ''}`;
  let apiAccessPoints = `https://${TINYBIRD_HOST}/v0/pipes/api_access_points.json?customerId=${customerId}&token=${token}${date_from ? `&datetime_start=${date_from}` : ''}${date_to ? `&datetime_end=${date_to}` : ''}`;
  let apiAccessTimes = `https://${TINYBIRD_HOST}/v0/pipes/api_access_times.json?customerId=${customerId}&token=${token}${date_from ? `&datetime_start=${date_from}` : ''}${date_to ? `&datetime_end=${date_to}` : ''}&x_axis=${accessTimesGrouping}`;
  let apiLatestActivity = `https://${TINYBIRD_HOST}/v0/pipes/api_latest_activity.json?customerId=${customerId}&token=${token}${date_from ? `&datetime_start=${date_from}` : ''}${date_to ? `&datetime_end=${date_to}` : ''}`;
  let apiAccessDenied = `https://${TINYBIRD_HOST}/v0/pipes/api_access_denied.json?customerId=${customerId}&token=${token}${date_from ? `&datetime_start=${date_from}` : ''}${date_to ? `&datetime_end=${date_to}` : ''}`;

  // quickRefresh ?
  //   useInterval(() => {
  //     fetchTinybirdUrl(apiAccessMethods, setAccessMethods);
  //   }, msRefresh)
  //   :
  //   useInterval(() => {
  //     fetchTinybirdUrl(apiAccessMethods, setAccessMethods);
  //   }, msRefresh * 10000)

  useInterval(() => {
    fetchTinybirdUrl(apiAccessMethods, setAccessMethods);
  }, msRefresh)

  useInterval(() => {
    fetchTinybirdUrl(apiAccessPoints, setAccessPoints);
  }, msRefresh)

  useInterval(() => {
    fetchTinybirdUrl(apiAccessTimes, setAccessTimes);
  }, msRefresh)

  useInterval(() => {
    fetchTinybirdUrl(apiLatestActivity, setLatestActivity);
  }, msRefresh)

  useInterval(() => {
    fetchTinybirdUrl(apiAccessDenied, setAccessDenied);
  }, msRefresh)


  useEffect(() => {
    fetchTinybirdUrl(apiAccessMethods, setAccessMethods);
  }, [apiAccessMethods]);

  useEffect(() => {
    fetchTinybirdUrl(apiAccessPoints, setAccessPoints);
  }, [apiAccessPoints]);

  useEffect(() => {
    fetchTinybirdUrl(apiAccessTimes, setAccessTimes);
  }, [apiAccessTimes]);

  useEffect(() => {
    fetchTinybirdUrl(apiLatestActivity, setLatestActivity);
  }, [apiLatestActivity]);

  useEffect(() => {
    fetchTinybirdUrl(apiAccessDenied, setAccessDenied);
  }, [apiAccessDenied]);

  useEffect(() => {
    fetchTinybirdUrl(filterCustomers, setCustomers);
  }, [filterCustomers]);

  const handleChangeCustomer = (value) => {
    setCustomerId(value);
    console.log(value)
  };

  const validateInputToken = async (inputValue) => {
    const response = await fetch(`https://${TINYBIRD_HOST}/v0/pipes?token=${inputValue}`);
    // console.log(response.status)
    return response.status === 200;
  };


  const handleInputTokenChange = async (event) => {
    const newToken = event.target.value;
    const isValid = await validateInputToken(newToken);
    if (isValid) {
      setToken(newToken);
      // console.log(newToken);
    }
  };

  const percentageFormatter = (number) => `${Intl.NumberFormat("us").format(number).toString()}%`;

  return (
    <>
      <Head>
        <title>Coverwallet Partner Dashboard</title>
        <title>Smart Access Dashboard</title>
      </Head>
      <main className="bg-slate-50 p-6 sm:p-10">
        <Grid
          numColsSm={2}
          numColsMd={4}
          numColsLg={6}
          gapX="gap-x-3"
          gapY="gap-y-3"
          className="mt-3 mb-2"
        >
          <div className="ml-4 mt-2">
            <Text>Token</Text>
            <TextInput
              value={token}
              onChange={handleInputTokenChange}
              className="mt-2 max-w-xs"
            // error={async (value) => !await validateInputToken(value)}
            />
          </div>

          {customers && customers.length > 1 ?
            <div className="ml-4 mt-2">
              <Text>Company</Text>
              <Select
                defaultValue={customerId}
                value={customerId}
                onValueChange={handleChangeCustomer}
                placeholder="All"
                className="mt-2 max-w-xs"
              >
                {customers && customers.map((elem, i) => (
                  <SelectItem key={i} value={elem.id}>{elem.name}</SelectItem>
                ))}
              </Select>
            </div> : ''}
        </Grid>


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
          <DateRangePicker
            value={dates}
            onValueChange={setDates}
            enableYearPagination={true}
            dropdownPlaceholder="Pick dates"
            className="mt-2"
          />
        </Card>

        <Grid numItems={1} numItemsMd={2} className="gap-6 mt-4">


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
            <DateRangePicker
              value={dates}
              onValueChange={setDates}
              enableYearPagination={true}
              dropdownPlaceholder="Pick dates"
              className="mt-2"
            />
          </Card>
          <Card>

            <Title>Key types</Title>
            <Grid numItems={2} numItemsMd={2} className="gap-6 mt-4">

              <DonutChart
                className="mt-6"
                data={accessMethods}
                category="percentage"
                index="device_type"
                variant="pie"
                valueFormatter={percentageFormatter}
                colors={["amber", "indigo", "rose", "cyan"]}

              />
              <div>

                {accessMethods && accessMethods.map((elem, i) => (<div className="mt-2" key={`${i}-user-type`}>
                  <Flex className="mt-4" justifyContent="around" flexDirection="col">
                    <Title className="mt-2">{elem.device_type}</Title>
                    <Metric>{elem.percentage} %</Metric>
                  </Flex>
                </div>))}
              </div>
            </Grid>

            <DateRangePicker
              value={dates}
              onValueChange={setDates}
              enableYearPagination={true}
              dropdownPlaceholder="Pick dates"
              className="mb-2 mt-auto"
            />
          </Card>
        </Grid>

        <Grid numItems={1} numItemsMd={2} className="gap-6 mt-4">


          <Card>
            <Title>Latest Activity</Title>
            <Table className="mt-5">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Timestamp</TableHeaderCell>
                  <TableHeaderCell>Event</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {latestActivity && latestActivity.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item.timestamp}</TableCell>
                    <TableCell>{item.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card>
            <Title>Access Denied</Title>
            <Table className="mt-5">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>When</TableHeaderCell>
                  <TableHeaderCell>Who</TableHeaderCell>
                  <TableHeaderCell>Where</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accessDenied && accessDenied.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item.when}</TableCell>
                    <TableCell>{item.who}</TableCell>
                    <TableCell>{item.where}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

        </Grid>

      </main>
    </>
  );
}