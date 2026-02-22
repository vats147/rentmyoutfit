'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Package, Settings, Bell, Shield,
  TrendingUp, DollarSign, AlertTriangle, ChevronRight, Search,
  Ban, Eye, CheckCircle, XCircle, Clock, MapPin, LogOut,
  BarChart3, PieChart, Activity, Lock, Unlock, Mail, Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/stores';
import { PLATFORM_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface AdminStats {
  totalUsers: number;
  activeListings: number;
  pendingReviews: number;
  totalBookings: number;
  revenue: number;
  disputes: number;
}

// Mock data for admin dashboard
const mockStats: AdminStats = {
  totalUsers: 1247,
  activeListings: 389,
  pendingReviews: 23,
  totalBookings: 892,
  revenue: 284750,
  disputes: 7,
};

const mockUsers = [
  { id: '1', name: 'Priya Sharma', email: 'priya@email.com', phone: '+91 98765 43210', role: 'both', status: 'active', listings: 12, joined: '2024-01-15' },
  { id: '2', name: 'Raj Malhotra', email: 'raj@email.com', phone: '+91 87654 32109', role: 'seller', status: 'active', listings: 8, joined: '2024-02-20' },
  { id: '3', name: 'Anjali Patel', email: 'anjali@email.com', phone: '+91 76543 21098', role: 'customer', status: 'hold', listings: 0, joined: '2024-03-10' },
  { id: '4', name: 'Vikram Singh', email: 'vikram@email.com', phone: '+91 65432 10987', role: 'seller', status: 'banned', listings: 5, joined: '2024-01-25' },
  { id: '5', name: 'Meera Gupta', email: 'meera@email.com', phone: '+91 54321 09876', role: 'both', status: 'active', listings: 15, joined: '2024-02-05' },
];

const mockListings = [
  { id: '1', title: 'Bridal Red Lehenga Choli', seller: 'Priya Sharma', status: 'active', price: 1500, views: 234, category: 'Lehenga Choli' },
  { id: '2', title: 'Designer Sherwani Set', seller: 'Raj Malhotra', status: 'pending_review', price: 1200, views: 156, category: 'Sherwani' },
  { id: '3', title: 'Pink Anarkali Suit', seller: 'Anjali Patel', status: 'paused', price: 800, views: 89, category: 'Anarkali' },
  { id: '4', title: 'Royal Blue Bandhgala', seller: 'Vikram Singh', status: 'delisted', price: 1000, views: 67, category: 'Bandhgala' },
];

const mockBookings = [
  { id: '1', listing: 'Bridal Lehenga', customer: 'Krina Desai', seller: 'Priya Sharma', dates: '15-17 Mar', status: 'rented', amount: 4500 },
  { id: '2', listing: 'Sherwani Set', customer: 'Amit Kumar', seller: 'Raj Malhotra', dates: '18-19 Mar', status: 'otp_pending', amount: 2400 },
  { id: '3', listing: 'Anarkali Suit', customer: 'Neha Singh', seller: 'Anjali Patel', dates: '20-22 Mar', status: 'deposit_paid', amount: 2400 },
  { id: '4', listing: 'Banarasi Saree', customer: 'Riya Sharma', seller: 'Meera Gupta', dates: '23-24 Mar', status: 'returned', amount: 1200 },
];

const mockDisputes = [
  { id: '1', booking: 'BK-001', customer: 'Krina Desai', seller: 'Priya Sharma', reason: 'Damaged outfit', status: 'open', created: '2024-03-15' },
  { id: '2', booking: 'BK-002', customer: 'Amit Kumar', seller: 'Raj Malhotra', reason: 'Late return', status: 'under_review', created: '2024-03-14' },
];

interface AdminPanelProps {
  onLogout?: () => void;
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);

  // Configuration state
  const [config, setConfig] = useState({
    platformFee: PLATFORM_CONFIG.platformFeePercent,
    minDeposit: PLATFORM_CONFIG.minDeposit,
    referralEnabled: true,
    referralDiscount: 10,
    referralCredit: 200,
    arTryOnEnabled: true,
    depositReleaseHours: 24,
    maxSearchRadius: 50,
  });

  const renderStatCard = (title: string, value: string | number, icon: React.ReactNode, trend?: number, color?: string) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <p className={cn("text-xs mt-1", trend > 0 ? "text-green-600" : "text-red-600")}>
                {trend > 0 ? '+' : ''}{trend}% from last month
              </p>
            )}
          </div>
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            color || "bg-[#1B4332]/10"
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {renderStatCard('Total Users', mockStats.totalUsers.toLocaleString(), <Users className="w-6 h-6 text-[#1B4332]" />, 12)}
        {renderStatCard('Active Listings', mockStats.activeListings, <Package className="w-6 h-6 text-[#1B4332]" />, 8)}
        {renderStatCard('Pending Reviews', mockStats.pendingReviews, <Clock className="w-6 h-6 text-amber-600" />)}
        {renderStatCard('Total Bookings', mockStats.totalBookings, <Activity className="w-6 h-6 text-[#1B4332]" />, 23)}
        {renderStatCard('Revenue', `Rs.${mockStats.revenue.toLocaleString()}`, <DollarSign className="w-6 h-6 text-[#C9A84C]" />, 18)}
        {renderStatCard('Open Disputes', mockStats.disputes, <AlertTriangle className="w-6 h-6 text-red-500" />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Booking Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end gap-2">
              {[65, 80, 45, 90, 75, 95, 85, 70, 88, 92, 78, 96].map((height, i) => (
                <div key={i} className="flex-1 bg-[#1B4332] rounded-t" style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Jan</span>
              <span>Dec</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Lehenga Choli', percent: 35, color: 'bg-[#1B4332]' },
                { name: 'Sherwani', percent: 25, color: 'bg-[#2D6A4F]' },
                { name: 'Saree', percent: 20, color: 'bg-[#C9A84C]' },
                { name: 'Kurta Set', percent: 12, color: 'bg-[#F0D080]' },
                { name: 'Others', percent: 8, color: 'bg-gray-300' },
              ].map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{cat.name}</span>
                    <span>{cat.percent}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", cat.color)} style={{ width: `${cat.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: 'New user registered', user: 'Krina Desai', time: '2 min ago', type: 'user' },
              { action: 'Listing approved', user: 'Bridal Lehenga', time: '5 min ago', type: 'listing' },
              { action: 'Booking completed', user: 'BK-2341', time: '12 min ago', type: 'booking' },
              { action: 'Dispute opened', user: 'BK-2338', time: '25 min ago', type: 'dispute' },
              { action: 'Review submitted', user: 'Priya Sharma', time: '1 hour ago', type: 'review' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  activity.type === 'user' ? 'bg-blue-100' :
                  activity.type === 'listing' ? 'bg-green-100' :
                  activity.type === 'booking' ? 'bg-purple-100' :
                  activity.type === 'dispute' ? 'bg-red-100' : 'bg-yellow-100'
                )}>
                  {activity.type === 'user' && <Users className="w-4 h-4 text-blue-600" />}
                  {activity.type === 'listing' && <Package className="w-4 h-4 text-green-600" />}
                  {activity.type === 'booking' && <Activity className="w-4 h-4 text-purple-600" />}
                  {activity.type === 'dispute' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                  {activity.type === 'review' && <CheckCircle className="w-4 h-4 text-yellow-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search users by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listings</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockUsers.filter(u => 
                  u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.email.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1B4332] flex items-center justify-center text-white font-medium">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="capitalize">{user.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn(
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'hold' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      )}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">{user.listings}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.joined}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setShowUserDetail(true); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {user.status !== 'banned' && (
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Ban className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <AnimatePresence>
        {showUserDetail && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowUserDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#1B4332] flex items-center justify-center text-white text-xl font-medium">
                      {selectedUser.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{selectedUser.name}</h3>
                      <p className="text-gray-500">@{selectedUser.name.toLowerCase().replace(' ', '')}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowUserDetail(false)}>
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedUser.phone}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-[#1B4332]">{selectedUser.listings}</p>
                      <p className="text-xs text-gray-500">Listings</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-[#1B4332]">24</p>
                      <p className="text-xs text-gray-500">Bookings</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-[#C9A84C]">4.8</p>
                      <p className="text-xs text-gray-500">Rating</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Account Status</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Lock className="w-4 h-4 mr-1" />
                        Hold Selling
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                        <Ban className="w-4 h-4 mr-1" />
                        Ban User
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">IP History</h4>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Current IP</span>
                        <span>103.152.xxx.xxx</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Last Login</span>
                        <span>Today, 2:30 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Device</span>
                        <span>iPhone 14 Pro</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderListings = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="delisted">Delisted</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="lehenga">Lehenga Choli</SelectItem>
            <SelectItem value="sherwani">Sherwani</SelectItem>
            <SelectItem value="saree">Saree</SelectItem>
            <SelectItem value="anarkali">Anarkali</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Listings Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listing</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm">{listing.title}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{listing.seller}</td>
                    <td className="px-4 py-3 text-sm">{listing.category}</td>
                    <td className="px-4 py-3 text-sm font-medium">Rs.{listing.price}/day</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{listing.views}</td>
                    <td className="px-4 py-3">
                      <Badge className={cn(
                        listing.status === 'active' ? 'bg-green-100 text-green-800' :
                        listing.status === 'pending_review' ? 'bg-amber-100 text-amber-800' :
                        listing.status === 'paused' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      )}>
                        {listing.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {listing.status === 'pending_review' && (
                          <>
                            <Button variant="ghost" size="sm" className="text-green-600">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm">{booking.listing}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{booking.customer}</td>
                    <td className="px-4 py-3 text-sm">{booking.seller}</td>
                    <td className="px-4 py-3 text-sm">{booking.dates}</td>
                    <td className="px-4 py-3 text-sm font-medium">Rs.{booking.amount}</td>
                    <td className="px-4 py-3">
                      <Badge className={cn(
                        booking.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'otp_pending' ? 'bg-amber-100 text-amber-800' :
                        booking.status === 'deposit_paid' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      )}>
                        {booking.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDisputes = () => (
    <div className="space-y-4">
      {mockDisputes.map((dispute) => (
        <Card key={dispute.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={cn(
                    dispute.status === 'open' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  )}>
                    {dispute.status}
                  </Badge>
                  <span className="text-sm text-gray-500">{dispute.booking}</span>
                </div>
                <h3 className="font-medium">{dispute.reason}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Customer: {dispute.customer} | Seller: {dispute.seller}
                </p>
                <p className="text-xs text-gray-400 mt-1">Opened: {dispute.created}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button size="sm" className="bg-[#1B4332] hover:bg-[#2D6A4F]">
                  Resolve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Platform Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platform Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Platform Fee (%)</Label>
              <Input
                type="number"
                value={config.platformFee}
                onChange={(e) => setConfig({ ...config, platformFee: parseInt(e.target.value) })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Minimum Deposit (Rs.)</Label>
              <Input
                type="number"
                value={config.minDeposit}
                onChange={(e) => setConfig({ ...config, minDeposit: parseInt(e.target.value) })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Deposit Release (hours)</Label>
              <Input
                type="number"
                value={config.depositReleaseHours}
                onChange={(e) => setConfig({ ...config, depositReleaseHours: parseInt(e.target.value) })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Max Search Radius (km)</Label>
              <Input
                type="number"
                value={config.maxSearchRadius}
                onChange={(e) => setConfig({ ...config, maxSearchRadius: parseInt(e.target.value) })}
                className="mt-1.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Referral Program</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Referral Program</Label>
              <p className="text-xs text-gray-500">Allow users to earn rewards by referring friends</p>
            </div>
            <Switch
              checked={config.referralEnabled}
              onCheckedChange={(checked) => setConfig({ ...config, referralEnabled: checked })}
            />
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Referrer Discount (%)</Label>
              <Input
                type="number"
                value={config.referralDiscount}
                onChange={(e) => setConfig({ ...config, referralDiscount: parseInt(e.target.value) })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Referral Credit (Rs.)</Label>
              <Input
                type="number"
                value={config.referralCredit}
                onChange={(e) => setConfig({ ...config, referralCredit: parseInt(e.target.value) })}
                className="mt-1.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature Flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>AR Try-On</Label>
              <p className="text-xs text-gray-500">Enable virtual try-on feature for users</p>
            </div>
            <Switch
              checked={config.arTryOnEnabled}
              onCheckedChange={(checked) => setConfig({ ...config, arTryOnEnabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-[#1B4332] hover:bg-[#2D6A4F]">
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Send Push Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input placeholder="Notification title" className="mt-1.5" />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea placeholder="Notification message" className="mt-1.5" rows={3} />
          </div>
          <div>
            <Label>Target Audience</Label>
            <Select defaultValue="all">
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="customers">Customers Only</SelectItem>
                <SelectItem value="sellers">Sellers Only</SelectItem>
                <SelectItem value="city">By City</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Schedule</Button>
            <Button className="bg-[#1B4332] hover:bg-[#2D6A4F]">Send Now</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F6F0]">
      {/* Header */}
      <header className="bg-[#1B4332] text-white sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#C9A84C]" />
            <div>
              <h1 className="font-bold">ShahidRa Admin</h1>
              <p className="text-xs text-white/70">Super Admin</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-white hover:bg-white/10">
            <LogOut className="w-4 h-4 mr-2" />
            Exit Admin
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-16 md:w-56 bg-white border-r min-h-[calc(100vh-60px)] sticky top-[60px]">
          <div className="p-2 space-y-1">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'users', icon: Users, label: 'Users' },
              { id: 'listings', icon: Package, label: 'Listings' },
              { id: 'bookings', icon: Activity, label: 'Bookings' },
              { id: 'disputes', icon: AlertTriangle, label: 'Disputes' },
              { id: 'settings', icon: Settings, label: 'Settings' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                  activeTab === item.id 
                    ? "bg-[#1B4332] text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="hidden md:block text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'users' && renderUsers()}
              {activeTab === 'listings' && renderListings()}
              {activeTab === 'bookings' && renderBookings()}
              {activeTab === 'disputes' && renderDisputes()}
              {activeTab === 'settings' && renderSettings()}
              {activeTab === 'notifications' && renderNotifications()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
