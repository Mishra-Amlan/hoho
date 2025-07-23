import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarDays, Users, TrendingUp, AlertCircle, Building, FileText, Bot, Eye, History } from 'lucide-react';
import { useProperties, useAudits, useHealthCheck, useProperty } from '@/hooks/use-api';
import { Badge } from '@/components/ui/badge';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminDashboard() {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [showAuditHistory, setShowAuditHistory] = useState(false);
  const { data: properties, isLoading: propertiesLoading, error: propertiesError } = useProperties();
  const { data: audits, isLoading: auditsLoading, error: auditsError } = useAudits();
  const { data: selectedProperty } = useProperty(selectedPropertyId || 0);
  const { data: propertyAudits } = useAudits(selectedPropertyId ? { propertyId: selectedPropertyId } : undefined);
  const { data: healthStatus } = useHealthCheck();

  if (propertiesLoading || auditsLoading) {
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

  if (propertiesError || auditsError) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Connection Error</span>
              </div>
              <p className="text-red-700 mt-2">
                Unable to connect to the backend API. Please ensure the Python backend is running on port 8000.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
                variant="outline"
              >
                Retry Connection
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalProperties = properties?.length || 0;
  const totalAudits = audits?.length || 0;
  const pendingAudits = audits?.filter((audit: any) => audit.status === 'scheduled' || audit.status === 'in_progress').length || 0;
  const completedAudits = audits?.filter((audit: any) => audit.status === 'completed').length || 0;

  // Calculate compliance distribution
  const complianceStats = {
    green: audits?.filter((audit: any) => audit.complianceZone === 'green').length || 0,
    amber: audits?.filter((audit: any) => audit.complianceZone === 'amber').length || 0,
    red: audits?.filter((audit: any) => audit.complianceZone === 'red').length || 0,
  };

  const handleScheduleAudit = () => {
    setShowScheduleModal(true);
  };

  const handleViewDetails = (propertyId: number) => {
    setSelectedPropertyId(propertyId);
    setShowPropertyDetails(true);
  };

  const handleAuditHistory = (propertyId: number) => {
    setSelectedPropertyId(propertyId);
    setShowAuditHistory(true);
  };

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage properties, audits, and system configuration</p>
          
          {/* System Status */}
          {healthStatus && (
            <div className="mt-4 flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Backend Connected</span>
              </div>
              <Badge variant="outline" className="text-xs">
                <Bot className="w-3 h-3 mr-1" />
                Gemini AI Ready
              </Badge>
            </div>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-modern shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{totalProperties}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Audits</p>
                  <p className="text-2xl font-bold text-gray-900">{totalAudits}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Audits</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingAudits}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <CalendarDays className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedAudits}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="card-modern shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Compliance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-800">Green Zone</span>
                  <Badge className="bg-green-100 text-green-800">{complianceStats.green}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium text-yellow-800">Amber Zone</span>
                  <Badge className="bg-yellow-100 text-yellow-800">{complianceStats.amber}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-red-800">Red Zone</span>
                  <Badge className="bg-red-100 text-red-800">{complianceStats.red}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2" />
                AI Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm">Photo Analysis with Gemini Vision</span>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm">Automated Report Generation</span>
                </div>
                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-sm">Smart Score Suggestions</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

            {/* Properties Table */}
            <Card className="card-modern shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Properties</span>
              <Button onClick={handleScheduleAudit} className="btn-primary">
                Schedule New Audit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {properties && properties.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Property Name</th>
                      <th className="text-left py-2">Location</th>
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Created</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property: any) => (
                      <tr key={property.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 font-medium">{property.name}</td>
                        <td className="py-3 text-gray-600">{property.location}</td>
                        <td className="py-3 text-gray-600">{property.region || 'Hotel'}</td>
                        <td className="py-3 text-gray-600">
                          {property.createdAt ? new Date(property.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleViewDetails(property.id)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View Details
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAuditHistory(property.id)}
                              className="flex items-center gap-1"
                            >
                              <History className="h-3 w-3" />
                              Audit History
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No properties found. Add your first property to get started.</p>
              </div>
            )}
          </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard audits={audits || []} properties={properties || []} />
          </TabsContent>

          <TabsContent value="properties">
            <Card>
              <CardHeader>
                <CardTitle>Property Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Property management features will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Report Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Report generation and management features will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Schedule Audit Modal */}
        <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Audit</DialogTitle>
              <DialogDescription>
                Create a new audit for a property with AI-powered features.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Property</label>
                  <select className="w-full p-2 border rounded-lg">
                    <option>Select a property...</option>
                    {properties?.map((property: any) => (
                      <option key={property.id} value={property.id}>{property.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Auditor</label>
                  <select className="w-full p-2 border rounded-lg">
                    <option>Select an auditor...</option>
                    <option value="auditor1">Sarah Johnson</option>
                    <option value="auditor2">Michael Chen</option>
                    <option value="auditor3">Emily Davis</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Audit Date</label>
                  <input 
                    type="date" 
                    className="w-full p-2 border rounded-lg"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Audit Type</label>
                  <select className="w-full p-2 border rounded-lg">
                    <option>Standard Brand Audit</option>
                    <option>Compliance Audit</option>
                    <option>Mystery Guest Audit</option>
                    <option>Follow-up Audit</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <select className="w-full p-2 border rounded-lg">
                    <option>Normal</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Special Instructions</label>
                  <textarea 
                    className="w-full p-2 border rounded-lg h-20"
                    placeholder="Add any special instructions for the auditor..."
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-center text-blue-800">
                <Bot className="h-4 w-4 mr-2" />
                <span className="font-semibold">AI Features Included</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                This audit includes photo analysis, automated scoring, and intelligent reporting powered by Google Gemini.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
                Cancel
              </Button>
              <Button 
                className="btn-primary"
                onClick={() => {
                  // Handle scheduling logic here
                  setShowScheduleModal(false);
                }}
              >
                Schedule Audit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
