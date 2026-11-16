// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { action, observable } from 'mobx';
import client from 'client';
import Base from 'stores/base';
import { MAX_REPORT_DAYS } from 'resources/cloudkitty/reporting';

// The rating summary is served by CloudKitty's v2 `/v2/summary` endpoint.
// It returns aggregated cost data grouped by an arbitrary set of columns
// (e.g. `type`, `resource_id`, `project_id`). The rating dashboard (current
// and last month totals, forecast, breakdown and top cost generators) is built
// on top of this single endpoint.
export class CloudKittySummaryStore extends Base {
  @observable
  summary = {
    currentMonthTotal: 0,
    lastMonthTotal: 0,
    forecastTotal: 0,
    breakdown: [],
    topResources: [],
    projectTotals: [],
    currentMonthName: '',
    lastMonthName: '',
  };

  @observable
  report = {
    repartition: [],
    timeline: [],
    series: [],
    totalCost: 0,
    projectTotals: [],
  };

  get client() {
    return client.cloudkitty.summary;
  }

  get legacySummaryClient() {
    return client.cloudkitty.legacySummary;
  }

  // v1 uses tenant_id for the project filter and grouping key.
  async fetchLegacySummary({ begin, end, groupby, scope, projectId }) {
    const groups = (groupby || []).map((key) =>
      key === 'project_id' ? 'tenant_id' : key === 'type' ? 'res_type' : null
    );
    if (groups.includes(null)) {
      throw new Error('CloudKitty v1 cannot group by the requested field.');
    }
    const result = await this.legacySummaryClient.list({
      begin,
      end,
      groupby: groups.length ? groups.join(',') : undefined,
      tenant_id: scope === 'project' ? projectId : undefined,
      // Use the v1 default for project scope. Sending the string "false" can
      // select all tenants and clear the policy target.
      ...(scope === 'all' ? { all_tenants: true } : {}),
    });
    if (!Array.isArray(result?.summary)) {
      throw new Error('CloudKitty returned an invalid v1 summary response.');
    }
    const results = result.summary.map(({ res_type, tenant_id, ...item }) => ({
      ...item,
      type: res_type,
      project_id: tenant_id,
      rate: Number(item.rate),
    }));
    if (results.some((item) => !Number.isFinite(item.rate))) {
      throw new Error('CloudKitty returned an invalid report cost.');
    }
    return { results, total: results.length };
  }

  async fetchV2Summary(params) {
    const results = [];
    let total;
    do {
      // Fetch all pages so the report and CSV cannot omit service types.
      // eslint-disable-next-line no-await-in-loop
      const page = await this.client.list({
        ...params,
        offset: results.length,
      });
      if (
        !Array.isArray(page?.results) ||
        !Number.isInteger(page.total) ||
        page.total < 0 ||
        (total !== undefined && total !== page.total)
      ) {
        throw new Error('CloudKitty returned an invalid or changing summary.');
      }
      total = page.total;
      if (!page.results.length && results.length < total) {
        throw new Error('CloudKitty returned an incomplete summary.');
      }
      results.push(
        ...page.results.map((item) => ({ ...item, rate: Number(item.rate) }))
      );
      if (
        results.length > total ||
        results.some((item) => !Number.isFinite(item.rate))
      ) {
        throw new Error('CloudKitty returned invalid report data.');
      }
    } while (results.length < total);
    return { results, total };
  }

  getMonthDates(year, month) {
    const start = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    // day 0 of the next month == last day of this month
    const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));
    return { start, end };
  }

  // Admin tokens are not automatically project-scoped by CloudKitty v2.
  // The panel's scope must therefore be explicit for every request.
  async fetchSummaryForPeriod({
    begin,
    end,
    groupby,
    strict = false,
    allowLegacy = false,
    scope = 'project',
    projectId = this.currentProjectId,
  } = {}) {
    if (scope === 'project' && !projectId) {
      throw new Error('Select a project before loading CloudKitty costs.');
    }
    if (scope !== 'project' && scope !== 'all') {
      throw new Error('Invalid CloudKitty cost scope.');
    }
    const params = {
      begin: begin.toISOString(),
      end: end.toISOString(),
      response_format: 'object',
    };
    if (groupby) {
      params.groupby = groupby;
    }
    if (scope === 'project') {
      // MultiDictQueryParam expects filters=key:value, not filters[key]=value.
      params.filters = `project_id:${projectId}`;
    }
    try {
      if (allowLegacy && this.reportApiVersion === 'v1') {
        return await this.fetchLegacySummary({ ...params, scope, projectId });
      }
      try {
        return await this.fetchV2Summary(params);
      } catch (error) {
        if (!allowLegacy || error.response?.status !== 404) {
          throw error;
        }
        // Only a missing endpoint triggers compatibility mode. Authentication,
        // policy, transport and server errors must remain visible failures.
        const result = await this.fetchLegacySummary({
          ...params,
          scope,
          projectId,
        });
        this.reportApiVersion = 'v1';
        return result;
      }
    } catch (e) {
      if (strict) {
        throw e;
      }
      return { results: [], total: 0 };
    }
  }

  calculateForecast(currentTotal, daysElapsed, daysInMonth) {
    if (daysElapsed <= 0) {
      return currentTotal;
    }
    return (currentTotal / daysElapsed) * daysInMonth;
  }

  getProjectTotals(results = []) {
    const totals = new Map();
    results.forEach(({ project_id: projectId, rate }) => {
      if (projectId) {
        totals.set(projectId, (totals.get(projectId) || 0) + rate);
      }
    });
    return [...totals]
      .map(([project_id, rate]) => ({ project_id, rate }))
      .sort((a, b) => b.rate - a.rate);
  }

  @action
  async fetchSummary({
    scope = 'project',
    projectId = this.currentProjectId,
  } = {}) {
    this.isLoading = true;
    this.reportApiVersion = 'v2';
    this.summaryScope = null;
    try {
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = now.getUTCMonth();
      const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      const daysElapsed = now.getUTCDate();

      const { start: currentStart } = this.getMonthDates(year, month);
      const lastMonthDates = this.getMonthDates(year, month - 1);

      const query = { scope, projectId, strict: true, allowLegacy: true };
      const byType = await this.fetchSummaryForPeriod({
        ...query,
        begin: currentStart,
        end: now,
        groupby: ['type'],
      });
      const [lastMonth, topResources, projects] = await Promise.all([
        this.fetchSummaryForPeriod({
          ...query,
          begin: lastMonthDates.start,
          end: lastMonthDates.end,
        }),
        this.reportApiVersion === 'v1'
          ? { results: [] }
          : this.fetchSummaryForPeriod({
              ...query,
              begin: currentStart,
              end: now,
              groupby: ['type', 'resource_id'],
            }),
        scope === 'all'
          ? this.fetchSummaryForPeriod({
              ...query,
              begin: currentStart,
              end: now,
              groupby: ['project_id'],
            })
          : { results: [] },
      ]);

      const currentMonthData = byType.results || [];
      const currentMonthTotal = currentMonthData.reduce(
        (acc, cur) => acc + (cur.rate || 0),
        0
      );
      const lastMonthTotal = (lastMonth.results || []).reduce(
        (acc, cur) => acc + (cur.rate || 0),
        0
      );
      const forecastTotal = this.calculateForecast(
        currentMonthTotal,
        daysElapsed,
        daysInMonth
      );

      const breakdown = currentMonthData.map((item) => {
        const rate = item.rate || 0;
        const percentage =
          currentMonthTotal > 0
            ? Math.round((rate / currentMonthTotal) * 1000) / 10
            : 0;
        return {
          type: item.type || 'Unknown',
          rate,
          percentage,
        };
      });

      const topResourcesData = [...(topResources.results || [])]
        .sort((a, b) => (b.rate || 0) - (a.rate || 0))
        .slice(0, 10);

      const monthNameOptions = { year: 'numeric', month: 'long' };
      const summary = {
        currentMonthTotal,
        lastMonthTotal,
        forecastTotal,
        breakdown,
        topResources: topResourcesData,
        projectTotals: this.getProjectTotals(projects.results),
        currentMonthName: now.toLocaleDateString(undefined, monthNameOptions),
        lastMonthName: lastMonthDates.start.toLocaleDateString(
          undefined,
          monthNameOptions
        ),
        daysElapsed,
        daysInMonth,
      };
      this.summary = summary;
      this.summaryScope = scope === 'all' ? 'all' : `project:${projectId}`;
      return summary;
    } finally {
      this.isLoading = false;
    }
  }

  // Build a date-range cost report: one grouped-by-type call for the cumulated
  // totals (pie chart) plus one call per day in the range for the time-series
  // breakdown. Every query uses the panel's explicit scope.
  @action
  async fetchReport({
    begin,
    end,
    scope = 'project',
    projectId = this.currentProjectId,
  } = {}) {
    const startDay = this.startOfUTCDay(begin);
    const endDay = this.startOfUTCDay(end);
    const dayCount = (endDay - startDay) / (24 * 60 * 60 * 1000) + 1;
    if (
      !Number.isFinite(dayCount) ||
      dayCount < 1 ||
      dayCount > MAX_REPORT_DAYS
    ) {
      throw new Error(
        `Select a reporting range of 1 to ${MAX_REPORT_DAYS} days.`
      );
    }
    this.isLoading = true;
    this.reportApiVersion = 'v2';
    this.reportScope = null;
    try {
      const endExclusive = this.endOfUTCDay(end);
      const query = { scope, projectId, strict: true, allowLegacy: true };

      // Cumulated totals by type across the whole range.
      const cumulative = await this.fetchSummaryForPeriod({
        ...query,
        begin: startDay,
        end: endExclusive,
        groupby: ['type'],
      });
      const projects =
        scope === 'all'
          ? await this.fetchSummaryForPeriod({
              ...query,
              begin: startDay,
              end: endExclusive,
              groupby: ['project_id'],
            })
          : { results: [] };

      const byType = {};
      (cumulative.results || []).forEach((item) => {
        const type = item.type || 'Unknown';
        byType[type] = (byType[type] || 0) + (item.rate || 0);
      });

      const repartition = Object.keys(byType)
        .map((type) => ({ type, rate: byType[type] }))
        .sort((a, b) => b.rate - a.rate);

      // Cover the entire selected period, including six-month/year presets.
      // Bound concurrency rather than silently truncating the chart at 92 days.
      const days = this.enumerateUTCDays(startDay, end, MAX_REPORT_DAYS);
      const dayResults = [];
      for (let offset = 0; offset < days.length; offset += 7) {
        // Each batch must finish before starting another to limit API load.
        // eslint-disable-next-line no-await-in-loop
        const batch = await Promise.all(
          days.slice(offset, offset + 7).map((day) =>
            this.fetchSummaryForPeriod({
              ...query,
              begin: this.startOfUTCDay(day),
              end: this.endOfUTCDay(day),
              groupby: ['type'],
            })
          )
        );
        dayResults.push(...batch);
      }

      const timeline = days.map((day, i) => {
        const perType = {};
        (dayResults[i].results || []).forEach((item) => {
          const type = item.type || 'Unknown';
          perType[type] = (perType[type] || 0) + (item.rate || 0);
        });
        return {
          date: this.formatUTCDate(day),
          total: Object.values(perType).reduce((acc, v) => acc + v, 0),
          perType,
        };
      });

      // Flatten the timeline into { date, type, rate } rows for a grouped line
      // chart, ensuring every type has a point on every day (0 when absent).
      const types = repartition.map((r) => r.type);
      const series = [];
      timeline.forEach((point) => {
        types.forEach((type) => {
          series.push({
            date: point.date,
            type,
            rate: point.perType[type] || 0,
          });
        });
      });

      const totalCost = repartition.reduce((acc, r) => acc + r.rate, 0);

      this.report = {
        begin: this.formatUTCDate(startDay),
        end: this.formatUTCDate(endDay),
        repartition,
        timeline,
        series,
        totalCost,
        projectTotals: this.getProjectTotals(projects.results),
      };
      this.reportScope = scope === 'all' ? 'all' : `project:${projectId}`;
      return this.report;
    } finally {
      this.isLoading = false;
    }
  }

  startOfUTCDay(d) {
    const date = new Date(d);
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        0,
        0,
        0
      )
    );
  }

  endOfUTCDay(d) {
    const date = new Date(d);
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        23,
        59,
        59
      )
    );
  }

  enumerateUTCDays(begin, end, maxDays) {
    const days = [];
    let current = this.startOfUTCDay(begin);
    const last = this.startOfUTCDay(end);
    while (current <= last && days.length < maxDays) {
      days.push(new Date(current));
      current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
    }
    return days;
  }

  formatUTCDate(d) {
    const date = new Date(d);
    const y = date.getUTCFullYear();
    const m = `${date.getUTCMonth() + 1}`.padStart(2, '0');
    const day = `${date.getUTCDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

const globalCloudKittySummaryStore = new CloudKittySummaryStore();
export default globalCloudKittySummaryStore;
