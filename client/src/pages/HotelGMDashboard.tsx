import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function HotelGMDashboard() {
  const propertyStats = {
    currentScore: 85,
    complianceZone: 'amber',
    nextAuditDays: 45,
    improvement: 8
  };

  const auditResults = {
    overall: 85,
    cleanliness: 92,
    branding: 78,
    operational: 88
  };

  const findings = [
    {
      type: 'positive',
      title: 'Excellent housekeeping standards',
      description: 'All guest rooms and public areas well maintained',
      icon: 'fas fa-check'
    },
    {
      type: 'warning',
      title: 'Logo placement issues in lobby',
      description: 'Some brand elements not aligned with guidelines',
      icon: 'fas fa-exclamation'
    },
    {
      type: 'positive', 
      title: 'Staff service quality high',
      description: 'Professional demeanor and brand knowledge',
      icon: 'fas fa-check'
    }
  ];

  const actionPlan = [
    {
      id: 1,
      title: 'Lobby Brand Element Alignment',
      description: 'Adjust logo placement and brand signage to match corporate guidelines',
      priority: 'high',
      dueDate: 'March 30, 2024',
      assignedTo: 'Facilities Team',
      progress: 40,
      status: 'in_progress'
    },
    {
      id: 2,
      title: 'Staff Uniform Review',
      description: 'Ensure all department uniforms meet updated brand standards',
      priority: 'medium',
      dueDate: 'April 15, 2024', 
      assignedTo: 'HR Department',
      progress: 100,
      status: 'completed'
    },
    {
      id: 3,
      title: 'Guest Service Training Refresh',
      description: 'Conduct refresher training on updated service protocols',
      priority: 'low',
      dueDate: 'May 1, 2024',
      assignedTo: 'Training Manager',
      progress: 10,
      status: 'pending'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Taj Palace, New Delhi - Property Dashboard</h1>
          <p className="text-gray-600">Monitor your property's compliance status and improvement plans</p>
        </div>

        {/* Property Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Score</p>
                  <p className="text-3xl font-bold text-green-600">{propertyStats.currentScore}%</p>
                  <p className="text-xs text-green-600">↑ {propertyStats.improvement}% from last audit</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-trophy text-green-600 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Compliance Zone</p>
                  <p className="text-2xl font-bold text-yellow-600 capitalize">{propertyStats.complianceZone}</p>
                  <p className="text-xs text-yellow-600">Minor issues to address</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-shield-alt text-yellow-600 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Next Audit</p>
                  <p className="text-2xl font-bold text-blue-600">{propertyStats.nextAuditDays} Days</p>
                  <p className="text-xs text-blue-600">Quarterly schedule</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-calendar text-blue-600 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Latest Audit Report */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Latest Audit Report</CardTitle>
              <Badge className="bg-green-100 text-green-800">Completed</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Score Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Cleanliness & Hygiene</span>
                      <span className="text-sm font-semibold text-green-600">{auditResults.cleanliness}%</span>
                    </div>
                    <Progress value={auditResults.cleanliness} className="h-3" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Branding Compliance</span>
                      <span className="text-sm font-semibold text-yellow-600">{auditResults.branding}%</span>
                    </div>
                    <Progress value={auditResults.branding} className="h-3" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Operational Efficiency</span>
                      <span className="text-sm font-semibold text-green-600">{auditResults.operational}%</span>
                    </div>
                    <Progress value={auditResults.operational} className="h-3" />
                  </div>
                </div>
              </div>

              {/* Key Findings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Findings</h3>
                <div className="space-y-3">
                  {findings.map((finding, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                        finding.type === 'positive' ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        <i className={`${finding.icon} text-xs ${
                          finding.type === 'positive' ? 'text-green-600' : 'text-yellow-600'
                        }`}></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{finding.title}</p>
                        <p className="text-xs text-gray-600">{finding.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Corrective Action Plan</CardTitle>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <i className="fas fa-plus mr-2"></i>Add Action
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {actionPlan.map((action) => (
                <div key={action.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <Badge 
                          variant={action.priority === 'high' ? 'destructive' : 
                                  action.priority === 'medium' ? 'default' : 'secondary'}
                          className={action.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
                                    action.priority === 'medium' ? 'bg-green-100 text-green-800' :
                                    'bg-blue-100 text-blue-800'}
                        >
                          {action.priority.charAt(0).toUpperCase() + action.priority.slice(1)} Priority
                        </Badge>
                        <span className="text-xs text-gray-500">Due: {action.dueDate}</span>
                        <span className="text-xs text-gray-500">Assigned: {action.assignedTo}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-gray-600">
                        <i className="fas fa-edit"></i>
                      </button>
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-2 rounded-full ${
                            action.status === 'completed' ? 'bg-green-500' :
                            action.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${action.progress}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs ${
                        action.status === 'completed' ? 'text-green-600' :
                        action.status === 'in_progress' ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {action.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
