import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Property, Audit } from '@shared/schema';

export default function AdminDashboard() {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  const { data: audits } = useQuery<Audit[]>({
    queryKey: ['/api/audits'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
                  <div className="h-12 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleScheduleAudit = () => {
    setShowScheduleModal(true);
  };

  const handleAssignAuditor = (propertyId: number) => {
    console.log('Assigning auditor to property:', propertyId);
    // Here you would implement auditor assignment logic
  };

  const handleViewReports = () => {
    console.log('Opening reports view');
    // Navigate to reports page
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-700 text-lg">Manage audit scheduling, assign auditors, and track progress</p>
          
          <div className="mt-4 flex gap-4">
            <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
              <DialogTrigger asChild>
                <Button className="btn-warning">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Schedule New Audit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Schedule New Audit</DialogTitle>
                  <DialogDescription>
                    Create a new audit assignment for a property.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="property">Property</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties?.map((property) => (
                          <SelectItem key={property.id} value={property.id.toString()}>
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="auditor">Assigned Auditor</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an auditor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sarah">Sarah Johnson</SelectItem>
                        <SelectItem value="mike">Mike Chen</SelectItem>
                        <SelectItem value="lisa">Lisa Thompson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Audit Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
                    Cancel
                  </Button>
                  <Button className="btn-success" onClick={() => {
                    console.log('Scheduling audit...');
                    setShowScheduleModal(false);
                  }}>
                    Schedule Audit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={handleViewReports} className="hover:bg-gray-50">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Reports
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-modern card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Audits</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {audits?.filter(audit => audit.status === 'in_progress').length || 24}
                  </p>
                  <p className="text-xs text-green-600 font-medium">↑ 12% from last month</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl flex items-center justify-center shadow-md">
                  <AlertCircle className="text-orange-600 text-2xl" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Auditors</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">12</p>
                  <p className="text-xs text-green-600 font-medium">5 assigned today</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center shadow-md">
                  <Users className="text-green-600 text-2xl" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">8</p>
                  <p className="text-xs text-purple-600 font-medium">2 urgent</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center shadow-md">
                  <AlertCircle className="text-purple-600 text-2xl" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">92%</p>
                  <p className="text-xs text-emerald-600 font-medium">↑ 5% this month</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center shadow-md">
                  <TrendingUp className="text-emerald-600 text-2xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Properties Due for Audit */}
          <div className="lg:col-span-2">
            <Card className="card-modern">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900">Properties Due for Audit</CardTitle>
                  <Button 
                    className="btn-warning" 
                    onClick={handleScheduleAudit}
                  >
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Schedule New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {properties?.slice(0, 3).map((property) => (
                    <div key={property.id} className="interactive-hover flex items-center justify-between p-5 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm">
                      <div className="flex items-center">
                        <img 
                          src={property.image || 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'} 
                          alt={property.name}
                          className="w-16 h-16 rounded-xl object-cover mr-4 shadow-md"
                        />
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{property.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">Due: {property.nextAuditDate ? new Date(property.nextAuditDate).toLocaleDateString() : 'TBD'}</p>
                          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                            property.status === 'red' 
                              ? 'status-red'
                              : property.status === 'amber'
                              ? 'status-amber' 
                              : 'status-green'
                          }`}>
                            {property.status === 'red' ? 'High Priority' : 
                             property.status === 'amber' ? 'Medium Priority' : 'Normal Priority'}
                          </span>
                        </div>
                      </div>
                      <Button 
                        className="btn-warning" 
                        size="sm"
                        onClick={() => handleAssignAuditor(property.id)}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Assign Auditor
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-white text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Sarah Johnson assigned to Taj Palace audit</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-check text-white text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Taj Gateway report approved by QA</p>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-calendar text-white text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">New audit scheduled for Taj Coromandel</p>
                      <p className="text-xs text-gray-500">6 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
