import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import adminService from '../services/adminService';

const DAYS_TO_SHOW = 7;

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const formatCompactNumber = (value) =>
  Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

// PDF-safe formatters — jsPDF standard fonts don't support the ₹ Unicode glyph
const formatPdfCurrency = (value) => {
  const num = Number(value || 0);
  return `Rs. ${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

// Compact variant for tight bar-chart labels
const formatPdfChartCurrency = (value) => {
  const num = Number(value || 0);
  if (num >= 10000000) return `Rs.${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `Rs.${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `Rs.${(num / 1000).toFixed(1)}K`;
  return `Rs.${num.toFixed(0)}`;
};

const getDateKey = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
};

const buildRecentDateRange = (days) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - index - 1));

    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      fullDate: date,
    };
  });
};

const buildSeries = (days, source, getDate, getValue) => {
  const buckets = new Map(days.map((day) => [day.key, 0]));

  source.forEach((item) => {
    const dateValue = getDate(item);

    if (!dateValue) {
      return;
    }

    const key = getDateKey(dateValue);

    if (!buckets.has(key)) {
      return;
    }

    buckets.set(key, buckets.get(key) + getValue(item));
  });

  return days.map((day) => ({
    ...day,
    value: buckets.get(day.key) || 0,
  }));
};

const PDF_MARGIN = 14;
const PDF_PAGE_HEIGHT = 297;
const PDF_PAGE_WIDTH = 210;

const ensurePdfSpace = (pdf, currentY, requiredHeight) => {
  if (currentY + requiredHeight <= PDF_PAGE_HEIGHT - PDF_MARGIN) {
    return currentY;
  }

  pdf.addPage();
  return PDF_MARGIN;
};

const addPdfSectionTitle = (pdf, title, currentY) => {
  const nextY = ensurePdfSpace(pdf, currentY, 14);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(15, 23, 42);
  pdf.text(title, PDF_MARGIN, nextY);
  return nextY + 8;
};

const addPdfMetricGrid = (pdf, metrics, startY) => {
  let currentY = ensurePdfSpace(pdf, startY, 36);
  const totalWidth = PDF_PAGE_WIDTH - PDF_MARGIN * 2;
  const gap = 4;
  const boxWidth = (totalWidth - gap * (metrics.length - 1)) / metrics.length;
  const boxHeight = 26;

  metrics.forEach((metric, index) => {
    const x = PDF_MARGIN + index * (boxWidth + gap);

    pdf.setFillColor(metric.fill[0], metric.fill[1], metric.fill[2]);
    pdf.roundedRect(x, currentY, boxWidth, boxHeight, 3, 3, 'F');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(71, 85, 105);
    pdf.text(metric.label, x + 3, currentY + 7);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(15, 23, 42);
    pdf.text(String(metric.value), x + 3, currentY + 19);
  });

  return currentY + boxHeight + 10;
};

const addPdfBarChart = (pdf, title, subtitle, data, color, valueFormatter, startY) => {
  let currentY = addPdfSectionTitle(pdf, title, startY);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 116, 139);
  pdf.text(subtitle, PDF_MARGIN, currentY);
  currentY += 6;

  currentY = ensurePdfSpace(pdf, currentY, 70);
  const chartX = PDF_MARGIN;
  const chartY = currentY;
  const chartWidth = PDF_PAGE_WIDTH - PDF_MARGIN * 2;
  const chartHeight = 48;
  const maxValue = Math.max(...data.map((item) => item.value), 0);

  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(chartX, chartY, chartWidth, chartHeight, 2, 2);

  if (maxValue > 0) {
    const stepWidth = chartWidth / data.length;
    const barWidth = Math.min(16, stepWidth - 4);

    data.forEach((item, index) => {
      const barHeight = Math.max((item.value / maxValue) * (chartHeight - 14), 2);
      const x = chartX + index * stepWidth + (stepWidth - barWidth) / 2;
      const y = chartY + chartHeight - barHeight - 8;

      pdf.setFillColor(color[0], color[1], color[2]);
      pdf.roundedRect(x, y, barWidth, barHeight, 1, 1, 'F');
      pdf.setFontSize(8);
      pdf.setTextColor(71, 85, 105);
      pdf.text(item.label, x + barWidth / 2, chartY + chartHeight - 2, { align: 'center' });
      pdf.text(valueFormatter(item.value), x + barWidth / 2, Math.max(y - 2, chartY + 4), { align: 'center' });
    });
  } else {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(10);
    pdf.setTextColor(148, 163, 184);
    pdf.text('No data available', chartX + chartWidth / 2, chartY + chartHeight / 2, { align: 'center' });
  }

  return chartY + chartHeight + 10;
};

const addPdfList = (pdf, title, items, formatter, startY) => {
  let currentY = addPdfSectionTitle(pdf, title, startY);

  if (!items.length) {
    currentY = ensurePdfSpace(pdf, currentY, 10);
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(10);
    pdf.setTextColor(148, 163, 184);
    pdf.text('No data available', PDF_MARGIN, currentY);
    return currentY + 10;
  }

  items.forEach((item) => {
    currentY = ensurePdfSpace(pdf, currentY, 10);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(51, 65, 85);
    const label = pdf.splitTextToSize(item.label, 120);
    pdf.text(label, PDF_MARGIN, currentY);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text(formatter(item), PDF_PAGE_WIDTH - PDF_MARGIN, currentY, { align: 'right' });
    currentY += Math.max(8, label.length * 5);
  });

  return currentY + 4;
};

const StatCard = ({ title, value, accentClass, icon }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-6 ${accentClass}`}>
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
      </div>
      <div className="h-12 w-12 rounded-2xl bg-white/70 text-slate-700 flex items-center justify-center shadow-sm">
        {icon}
      </div>
    </div>
  </div>
);

const VerticalBarChart = ({ title, subtitle, data, colorFrom, colorTo, valueFormatter }) => {
  const maxValue = Math.max(...data.map((item) => item.value), 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>

      {maxValue === 0 ? (
        <div className="h-64 rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 text-sm">
          No data available yet
        </div>
      ) : (
        <div className="h-64 flex items-end gap-3 rounded-2xl bg-slate-50 px-4 py-6">
          {data.map((item) => {
            const height = Math.max((item.value / maxValue) * 100, 8);

            return (
              <div key={item.key} className="flex-1 h-full flex flex-col items-center justify-end">
                <span className="mb-2 text-[11px] font-semibold text-slate-600 text-center">
                  {valueFormatter(item.value)}
                </span>
                <div
                  className="w-full max-w-12 rounded-t-2xl shadow-sm"
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(180deg, ${colorFrom} 0%, ${colorTo} 100%)`,
                  }}
                />
                <span className="mt-3 text-xs font-medium text-slate-500">{item.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const DistributionCard = ({ title, subtitle, items, formatter, trackClass }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
    <div className="mb-6">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
    </div>

    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-400 text-sm">
          No data available yet
        </div>
      ) : (
        items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="font-medium text-slate-700">{item.label}</span>
              <span className="font-semibold text-slate-900">{formatter(item.value)}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
              <div className={`h-full rounded-full ${trackClass}`} style={{ width: `${item.percentage}%` }} />
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const Analytics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const [statsResponse, ordersResponse, usersResponse] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAllOrders(),
        adminService.getAllUsers(),
      ]);

      if (!statsResponse.success) {
        throw new Error(statsResponse.message || 'Failed to load dashboard stats');
      }

      if (!ordersResponse.success) {
        throw new Error(ordersResponse.message || 'Failed to load orders');
      }

      if (!usersResponse.success) {
        throw new Error(usersResponse.message || 'Failed to load users');
      }

      setStats(statsResponse.stats || {});
      setOrders(ordersResponse.orders || []);
      setUsers(usersResponse.users || []);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      alert('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      const pdf = new jsPDF('p', 'mm', 'a4');
      let currentY = PDF_MARGIN;

      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, PDF_PAGE_WIDTH, 24, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Oil Store Analytics Report', PDF_MARGIN, 15);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105);
      currentY = 32;
      pdf.text(`Generated: ${new Date().toLocaleString('en-IN')}`, PDF_MARGIN, currentY);
      currentY += 8;

      currentY = addPdfMetricGrid(
        pdf,
        [
          { label: 'Revenue', value: formatPdfCurrency(analyticsStats.totalRevenue), fill: [209, 250, 229] },
          { label: 'Orders', value: formatCompactNumber(analyticsStats.totalOrders), fill: [254, 243, 199] },
          { label: 'Paid Orders', value: formatCompactNumber(analyticsStats.paidOrders), fill: [219, 234, 254] },
          { label: 'New Users', value: formatCompactNumber(analyticsStats.recentUsers), fill: [237, 233, 254] },
        ],
        currentY
      );

      currentY = addPdfBarChart(
        pdf,
        'Revenue Overview',
        'Paid revenue captured in the recent daily trend',
        revenueSeries,
        [5, 150, 105],
        formatPdfChartCurrency,
        currentY
      );

      currentY = addPdfBarChart(
        pdf,
        'Order Trends',
        'Orders created in the recent daily trend',
        orderSeries,
        [29, 78, 216],
        formatCompactNumber,
        currentY
      );

      currentY = addPdfList(
        pdf,
        'Order Status Breakdown',
        orderStatusBreakdown,
        (item) => `${formatCompactNumber(item.value)} orders`,
        currentY
      );

      currentY = addPdfList(
        pdf,
        'Top Products',
        topProducts,
        (item) => `${item.value} sold | ${formatPdfCurrency(item.revenue)}`,
        currentY
      );

      currentY = addPdfList(
        pdf,
        'User Activity Snapshot',
        [
          { label: 'New Users', value: analyticsStats.recentUsers },
          { label: 'Active Users', value: analyticsStats.activeUsers },
          { label: 'Inactive Users', value: Math.max((stats?.totalUsers || 0) - analyticsStats.activeUsers, 0) },
          { label: 'Cancelled Orders', value: analyticsStats.cancelledOrders },
        ],
        (item) => formatCompactNumber(item.value),
        currentY
      );

      pdf.save(`analytics-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Error exporting analytics PDF:', error);
      alert('Failed to export analytics PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const recentDays = useMemo(() => buildRecentDateRange(DAYS_TO_SHOW), []);

  const rangeStartDate = useMemo(() => {
    const firstDay = recentDays[0]?.fullDate;

    if (!firstDay) {
      return null;
    }

    const date = new Date(firstDay);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [recentDays]);

  const filteredOrders = useMemo(() => {
    if (!rangeStartDate) {
      return orders;
    }

    return orders.filter((order) => new Date(order.createdAt) >= rangeStartDate);
  }, [orders, rangeStartDate]);

  const filteredUsers = useMemo(() => {
    if (!rangeStartDate) {
      return users;
    }

    return users.filter((user) => new Date(user.createdAt) >= rangeStartDate);
  }, [users, rangeStartDate]);

  const revenueSeries = useMemo(
    () =>
      buildSeries(
        recentDays,
        filteredOrders.filter((order) => order.paymentStatus === 'paid' && order.status !== 'cancelled'),
        (order) => order.paidAt || order.createdAt,
        (order) => Number(order.totalAmount || 0)
      ),
    [filteredOrders, recentDays]
  );

  const orderSeries = useMemo(
    () => buildSeries(recentDays, filteredOrders, (order) => order.createdAt, () => 1),
    [filteredOrders, recentDays]
  );

  const userSignupSeries = useMemo(
    () => buildSeries(recentDays, filteredUsers, (user) => user.createdAt, () => 1),
    [filteredUsers, recentDays]
  );

  const orderStatusBreakdown = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const counts = filteredOrders.reduce((accumulator, order) => {
      const status = order.status || 'pending';
      accumulator[status] = (accumulator[status] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts)
      .map(([label, value]) => ({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value,
        percentage: totalOrders ? Math.max((value / totalOrders) * 100, 6) : 0,
      }))
      .sort((left, right) => right.value - left.value);
  }, [filteredOrders]);

  const topProducts = useMemo(() => {
    const productMap = filteredOrders.reduce((accumulator, order) => {
      order.items?.forEach((item) => {
        const key = item.name || item.product?.name || 'Unnamed Product';

        if (!accumulator[key]) {
          accumulator[key] = {
            label: key,
            quantity: 0,
            revenue: 0,
          };
        }

        accumulator[key].quantity += Number(item.quantity || 0);
        accumulator[key].revenue += Number(item.subtotal || Number(item.price || 0) * Number(item.quantity || 0));
      });

      return accumulator;
    }, {});

    const entries = Object.values(productMap)
      .sort((left, right) => right.quantity - left.quantity)
      .slice(0, 5);

    const maxQuantity = Math.max(...entries.map((item) => item.quantity), 0);

    return entries.map((item) => ({
      label: item.label,
      value: item.quantity,
      revenue: item.revenue,
      percentage: maxQuantity ? Math.max((item.quantity / maxQuantity) * 100, 10) : 0,
    }));
  }, [filteredOrders]);

  const analyticsStats = useMemo(() => {
    const totalRevenue = filteredOrders
      .filter((order) => order.paymentStatus === 'paid' && order.status !== 'cancelled')
      .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const paidOrders = filteredOrders.filter((order) => order.paymentStatus === 'paid' && order.status !== 'cancelled').length;
    const cancelledOrders = filteredOrders.filter((order) => order.status === 'cancelled').length;
    const recentUsers = userSignupSeries.reduce((sum, item) => sum + item.value, 0);

    return {
      totalUsers: filteredUsers.length,
      activeUsers: stats?.activeUsers || 0,
      totalProducts: stats?.totalProducts || 0,
      totalOrders: filteredOrders.length,
      totalRevenue,
      paidOrders,
      cancelledOrders,
      recentUsers,
    };
  }, [filteredOrders, filteredUsers.length, stats, userSignupSeries]);

  const maxSignupValue = Math.max(...userSignupSeries.map((item) => item.value), 0);

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
              <p className="text-slate-500 mt-1">Revenue, order flow, and customer activity overview</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadAnalytics}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors font-medium"
            >
              Refresh Data
            </button>
            <button
              onClick={handleExportPdf}
              disabled={loading || isExporting}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isExporting ? 'Exporting PDF...' : 'Export PDF'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
            <p className="mt-4 text-slate-600">Loading analytics...</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mb-8">
              <StatCard
                title="Revenue"
                value={formatCurrency(analyticsStats.totalRevenue)}
                accentClass="bg-gradient-to-br from-emerald-100 to-white"
                icon={<span className="text-xl font-bold">₹</span>}
              />
              <StatCard
                title="Orders"
                value={formatCompactNumber(analyticsStats.totalOrders)}
                accentClass="bg-gradient-to-br from-amber-100 to-white"
                icon={<span className="text-xl font-bold">#</span>}
              />
              <StatCard
                title="Paid Orders"
                value={formatCompactNumber(analyticsStats.paidOrders)}
                accentClass="bg-gradient-to-br from-sky-100 to-white"
                icon={<span className="text-xl font-bold">✓</span>}
              />
              <StatCard
                title="New Users"
                value={formatCompactNumber(analyticsStats.recentUsers)}
                accentClass="bg-gradient-to-br from-violet-100 to-white"
                icon={<span className="text-xl font-bold">U</span>}
              />
              <StatCard
                title="Products"
                value={formatCompactNumber(analyticsStats.totalProducts)}
                accentClass="bg-gradient-to-br from-rose-100 to-white"
                icon={<span className="text-xl font-bold">P</span>}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              <VerticalBarChart
                title="Revenue Overview"
                subtitle="Paid revenue captured in the recent daily trend"
                data={revenueSeries}
                colorFrom="#34d399"
                colorTo="#059669"
                valueFormatter={formatCurrency}
              />
              <VerticalBarChart
                title="Order Trends"
                subtitle="Orders created in the recent daily trend"
                data={orderSeries}
                colorFrom="#60a5fa"
                colorTo="#1d4ed8"
                valueFormatter={formatCompactNumber}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <DistributionCard
                title="Order Status"
                subtitle="Current distribution across recent orders"
                items={orderStatusBreakdown}
                formatter={formatCompactNumber}
                trackClass="bg-linear-to-r from-amber-400 to-orange-500"
              />

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Top Products</h3>
                  <p className="text-sm text-slate-500 mt-1">Best-selling products by quantity ordered</p>
                </div>

                <div className="space-y-4">
                  {topProducts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-400 text-sm">
                      No product sales data available yet
                    </div>
                  ) : (
                    topProducts.map((product) => (
                      <div key={product.label}>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <p className="font-medium text-slate-800 line-clamp-1">{product.label}</p>
                            <p className="text-xs text-slate-500">Revenue {formatCurrency(product.revenue)}</p>
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{product.value} sold</span>
                        </div>
                        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-fuchsia-500 to-pink-500"
                            style={{ width: `${product.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900">User Activity</h3>
                  <p className="text-sm text-slate-500 mt-1">New signups and overall user health snapshot</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <p className="text-sm text-slate-500">New Users</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">{analyticsStats.recentUsers}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <p className="text-sm text-slate-500">Cancelled Orders</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">{analyticsStats.cancelledOrders}</p>
                  </div>
                </div>

                <div className="h-44 flex items-end gap-3 rounded-2xl bg-slate-50 px-4 py-6 mb-6">
                  {userSignupSeries.map((item) => {
                    const height = maxSignupValue ? Math.max((item.value / maxSignupValue) * 100, 8) : 8;

                    return (
                      <div key={item.key} className="flex-1 h-full flex flex-col items-center justify-end">
                        <span className="mb-2 text-[11px] font-semibold text-slate-600">{item.value}</span>
                        <div
                          className="w-full max-w-10 rounded-t-2xl bg-linear-to-b from-violet-400 to-indigo-600"
                          style={{ height: `${height}%` }}
                        />
                        <span className="mt-3 text-xs font-medium text-slate-500">{item.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="font-medium text-slate-700">Active Users</span>
                      <span className="font-semibold text-slate-900">{analyticsStats.activeUsers}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-violet-500 to-indigo-600"
                        style={{
                          width: `${stats?.totalUsers ? Math.max((analyticsStats.activeUsers / stats.totalUsers) * 100, 6) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="font-medium text-slate-700">Inactive Users</span>
                      <span className="font-semibold text-slate-900">{Math.max((stats?.totalUsers || 0) - analyticsStats.activeUsers, 0)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-slate-400 to-slate-600"
                        style={{
                          width: `${stats?.totalUsers ? Math.max((((stats?.totalUsers || 0) - analyticsStats.activeUsers) / stats.totalUsers) * 100, 6) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;

