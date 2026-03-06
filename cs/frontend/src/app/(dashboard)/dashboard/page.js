'use client';
import { useState, useEffect } from 'react';
import { Users, BookOpen, Layers, TrendingUp, AlertCircle, Activity, UserPlus, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import TopBar from '@/components/layout/TopBar';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { dashboardAPI } from '@/lib/api';
import ActivityCard from '@/components/ui/ActivityCard';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats().then((res) => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <><TopBar title="Dashboard" /><LoadingSpinner /></>;
  if (!data) return <><TopBar title="Dashboard" /><div className="p-8 text-center text-[var(--text-muted)]">Failed to load data</div></>;

  const { stats, recentStudents, recentPayments } = data;

  const pieData = [
    { name: 'Collected', value: stats.totalRevenue, color: '#14b8a6' },
    { name: 'Pending', value: stats.totalPendingFees, color: '#f59e0b' },
  ];

  const barData = recentPayments?.map((p, i) => ({
    name: p.student?.name?.split(' ')[0] || `#${i + 1}`,
    amount: p.amount,
  })) || [];

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="page-enter p-4 md:p-8 space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard icon={Users} label="Total Students" value={stats.totalStudents} color="primary" />
          <StatCard icon={Activity} label="Active Students" value={stats.activeStudents} color="success" />
          <StatCard icon={BookOpen} label="Courses" value={stats.totalCourses} color="info" />
          <StatCard icon={Layers} label="Batches" value={stats.totalBatches} color="warning" />
          <StatCard icon={TrendingUp} label="Revenue" value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} color="success" />
          <StatCard icon={AlertCircle} label="Pending Fees" value={`₹${(stats.totalPendingFees || 0).toLocaleString()}`} color="danger" />
        </div>

        {/* Activity Card (ScreenTimeCard-inspired) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityCard
            totalLabel="Weekly Enrollments"
            totalValue={`${stats.totalStudents} students`}
            barData={[2, 5, 3, 8, 4, 6, 7, 3, 9, 5, 4, 6, 8, 3, 7, 5, 2, 6, 4, 8]}
            timeLabels={['Mon', 'Wed', 'Fri', 'Sun']}
            topItems={[
              { icon: <UserPlus className="h-4 w-4" />, value: `${stats.activeStudents}`, label: 'Active' },
              { icon: <CreditCard className="h-4 w-4" />, value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, label: 'Collected' },
              { icon: <AlertCircle className="h-4 w-4" />, value: `₹${(stats.totalPendingFees || 0).toLocaleString()}`, label: 'Pending' },
            ]}
          />
          <ActivityCard
            totalLabel="Payment Activity"
            totalValue={`${recentPayments?.length || 0} recent`}
            barData={[4, 7, 2, 9, 5, 3, 8, 6, 4, 7, 5, 2, 8, 3, 6, 9, 4, 5, 7, 3]}
            timeLabels={['Week 1', 'Week 2', 'Week 3', 'Week 4']}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-1.5 w-1.5 rounded-full bg-accent-500" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-wide">Recent Payments</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '13px', boxShadow: 'var(--shadow-lg)' }}
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                  cursor={{ fill: 'var(--glow)' }}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
                <Bar dataKey="amount" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-wide">Fee Collection</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <defs>
                  <linearGradient id="pieCollected" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={i === 0 ? 'url(#pieCollected)' : entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '13px', boxShadow: 'var(--shadow-lg)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex justify-center gap-6">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-[var(--text-muted)]">{d.name}: <span className="font-medium text-[var(--text-secondary)]">₹{d.value?.toLocaleString()}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-1.5 w-1.5 rounded-full bg-accent-500" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-wide">Recent Students</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="pb-3 pr-4 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Name</th>
                    <th className="pb-3 pr-4 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Course</th>
                    <th className="pb-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Fees</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents?.map((s) => (
                    <tr key={s._id} className="border-b border-[var(--border)]/50 last:border-0 hover:bg-[var(--bg-surface)]/50 transition-colors">
                      <td className="py-3 pr-4 font-medium text-[var(--text-primary)]">{s.name}</td>
                      <td className="py-3 pr-4 text-[var(--text-secondary)]">{s.course?.name}</td>
                      <td className="py-3 text-right">
                        <Badge variant={s.feesPaid >= s.totalFees ? 'success' : 'warning'}>
                          ₹{s.feesPaid}/{s.totalFees}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-wide">Recent Payments</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="pb-3 pr-4 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Student</th>
                    <th className="pb-3 pr-4 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Mode</th>
                    <th className="pb-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments?.map((p) => (
                    <tr key={p._id} className="border-b border-[var(--border)]/50 last:border-0 hover:bg-[var(--bg-surface)]/50 transition-colors">
                      <td className="py-3 pr-4 font-medium text-[var(--text-primary)]">{p.student?.name}</td>
                      <td className="py-3 pr-4"><Badge>{p.paymentMode}</Badge></td>
                      <td className="py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">₹{p.amount?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
