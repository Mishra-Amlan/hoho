import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function CorporateDashboard() {
  const kpiData = {
    overallCompliance: 87,
    totalProperties: 156,
    criticalIssues: 12,
    auditsThisMonth: 84
  };

  const regionalData = [
    { region: 'North India', score: 92, color: 'bg-green-500' },
    { region: 'West India', score: 89, color: 'bg-green-500' },
    { region: 'South India', score: 76, color: 'bg-yellow-500' },
    { region: 'East India', score: 82, color: 'bg-yellow-500' },
    { region: 'International', score: 94, color: 'bg-green-500' }
  ];

  const criticalProperties = [
    {
      id: 1,
      name: 'Taj Gateway, Bangalore',
      location: 'Karnataka',
      score: 68,
      issues: ['Cleanliness', 'Branding'],
      lastAudit: '2 days ago',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50'
    },
    {
      id: 2,
      name: 'Taj Exotica, Goa', 
      location: 'Goa',
      score: 74,
      issues: ['Operational Efficiency'],
      lastAudit: '3 days ago',
      image: 'https://images.unsplash.com/photo-1455587734955-081b22074882?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50'
    },
    {
      id: 3,
      name: 'Taj Coromandel, Chennai',
      location: 'Tamil Nadu',
      score: 79,
      issues: ['Staff Training'],
      lastAudit: '1 week ago', 
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Corporate Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor brand compliance and performance across all properties</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Compliance</p>
                  <p className="text-3xl font-bold text-green-600">{kpiData.overallCompliance}%</p>
                  <p className="text-xs text-green-600">↑ 3% from last month</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-chart-line text-green-600 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-3xl font-bold text-blue-600">{kpiData.totalProperties}</p>
                  <p className="text-xs text-gray-500">Across 12 regions</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-building text-blue-600 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                  <p className="text-3xl font-bold text-red-600">{kpiData.criticalIssues}</p>
                  <p className="text-xs text-red-600">Require immediate attention</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Audits This Month</p>
                  <p className="text-3xl font-bold text-amber-600">{kpiData.auditsThisMonth}</p>
                  <p className="text-xs text-amber-600">↑ 12% from last month</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-clipboard-check text-amber-600 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Compliance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-chart-line text-4xl text-gray-400 mb-2"></i>
                  <p className="text-gray-600">Compliance trend chart visualization</p>
                  <p className="text-sm text-gray-500">Shows 6-month compliance trends</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Regional Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Regional Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionalData.map((region) => (
                  <div key={region.region} className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{region.region}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${region.color} h-2 rounded-full`}
                          style={{ width: `${region.score}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-semibold ${
                        region.score >= 85 ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {region.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Issues Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Properties Requiring Attention</CardTitle>
              <Button className="bg-amber-500 hover:bg-amber-600">
                <i className="fas fa-download mr-2"></i>Export Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issues</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Audit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {criticalProperties.map((property) => (
                    <tr key={property.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img 
                            src={property.image}
                            alt={property.name}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{property.name}</div>
                            <div className="text-sm text-gray-500">{property.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={property.score >= 75 ? "secondary" : "destructive"}
                          className={property.score >= 75 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}
                        >
                          {property.score}%
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {property.issues.join(', ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {property.lastAudit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-amber-600 hover:text-amber-800">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
