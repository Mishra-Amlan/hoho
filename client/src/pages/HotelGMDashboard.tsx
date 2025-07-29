import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { AlertCircle, BarChart3, Building, CheckCircle, Clock, MessageSquare, Send, TrendingUp, Users, Zap, Award, Target, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function HotelGMDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });

  // Fetch real-time data for the property (assuming user is GM of property 1)
  const propertyId = 1; // In a real app, this would come from user context
  
  const { data: audits = [], isLoading: auditsLoading } = useQuery({
    queryKey: ['/audits'],
    refetchInterval: 30000
  });

  const { data: property, isLoading: propertyLoading } = useQuery({
    queryKey: [`/properties/${propertyId}`],
    refetchInterval: 30000
  });

  const { data: auditItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: [`/audits/1/items`], // Assuming audit 1 is for this property
    refetchInterval: 30000
  });

  // Filter audits for this property
  const propertyAudits = (audits as any[]).filter((audit: any) => audit.propertyId === propertyId);
  const latestAudit = propertyAudits.sort((a: any, b: any) => 
    new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime()
  )[0];
  
  // Debug logging
  console.log('Audits data:', audits);
  console.log('Property audits:', propertyAudits);
  console.log('Latest audit:', latestAudit);

  // Calculate real-time property stats
  const propertyStats = {
    currentScore: latestAudit?.overallScore || 0,
    complianceZone: latestAudit?.overallScore >= 85 ? 'green' : latestAudit?.overallScore >= 70 ? 'amber' : 'red',
    nextAuditDays: 45, // This could be calculated based on last audit date
    improvement: propertyAudits.length >= 2 ? 
      (propertyAudits[0]?.overallScore || 0) - (propertyAudits[1]?.overallScore || 0) : 0
  };

  // Calculate audit results from real data
  const auditResults = {
    overall: latestAudit?.overallScore || 0,
    cleanliness: latestAudit?.cleanlinessScore || 0,
    branding: latestAudit?.brandingScore || 0,
    operational: latestAudit?.operationalScore || 0
  };

  // Generate findings from real audit data
  const findings = [
    {
      type: auditResults.cleanliness >= 85 ? 'positive' : 'warning',
      title: `Housekeeping Standards: ${auditResults.cleanliness}%`,
      description: auditResults.cleanliness >= 85 ? 'Excellent cleanliness standards maintained' : 'Cleanliness needs improvement',
      icon: auditResults.cleanliness >= 85 ? CheckCircle : AlertCircle
    },
    {
      type: auditResults.branding >= 85 ? 'positive' : 'warning',
      title: `Brand Compliance: ${auditResults.branding}%`,
      description: auditResults.branding >= 85 ? 'Brand elements properly aligned' : 'Brand compliance issues identified',
      icon: auditResults.branding >= 85 ? CheckCircle : AlertCircle
    },
    {
      type: auditResults.operational >= 85 ? 'positive' : 'warning',
      title: `Operational Efficiency: ${auditResults.operational}%`,
      description: auditResults.operational >= 85 ? 'Operations running smoothly' : 'Operational improvements needed',
      icon: auditResults.operational >= 85 ? CheckCircle : AlertCircle
    }
  ];

  // Generate action plan from real audit findings
  const actionPlan = [
    {
      id: 1,
      title: 'Address Priority Issues',
      description: latestAudit?.findings || 'Implement recommendations from latest audit',
      priority: 'high',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      assignedTo: 'Management Team',
      progress: 20,
      status: 'in_progress'
    },
    {
      id: 2,
      title: 'Follow Action Plan',
      description: latestAudit?.actionPlan || 'Execute improvement action plan',
      priority: 'medium',
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      assignedTo: 'Department Heads',
      progress: 0,
      status: 'pending'
    }
  ];

  // Feedback submission mutation
  const submitFeedback = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          propertyId,
          userId: user?.id,
          timestamp: new Date().toISOString()
        })
      });
      if (!response.ok) throw new Error('Failed to submit feedback');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Your feedback has been sent to corporate team",
      });
      setFeedbackOpen(false);
      setFeedbackData({ subject: '', message: '', priority: 'medium' });
    }
  });

  return (
    <div className="min-h-screen hotelgm-bg">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property?.name || 'Property Dashboard'}</h1>
              <p className="text-gray-600">Monitor your property's compliance status and improvement plans - Real-time data</p>
            </div>
            <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Feedback
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Feedback to Corporate</DialogTitle>
                  <DialogDescription>
                    Share your concerns, suggestions, or requests with the corporate team
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="feedback-subject">Subject</Label>
                    <Input
                      id="feedback-subject"
                      value={feedbackData.subject}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Enter feedback subject"
                    />
                  </div>
                  <div>
                    <Label htmlFor="feedback-message">Message</Label>
                    <Textarea
                      id="feedback-message"
                      value={feedbackData.message}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Describe your feedback, suggestions, or concerns"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      id="priority"
                      value={feedbackData.priority}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full p-2 border rounded"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <Button 
                    onClick={() => submitFeedback.mutate(feedbackData)}
                    disabled={submitFeedback.isPending}
                    className="w-full"
                  >
                    {submitFeedback.isPending ? 'Sending...' : 'Send Feedback'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Property Status Cards - Real-time Data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="metric-card-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Current Score</p>
                <p className={`text-3xl font-bold text-green-900 mt-2 ${propertyStats.currentScore >= 85 ? 'text-green-900' : propertyStats.currentScore >= 70 ? 'text-amber-900' : 'text-red-900'}`}>
                  {propertyStats.currentScore}%
                </p>
                <p className={`text-xs mt-1 ${propertyStats.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {propertyStats.improvement >= 0 ? '↑' : '↓'} {Math.abs(propertyStats.improvement)}% from last audit
                </p>
              </div>
              <div className="icon-container-success">
                <Award className="h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="metric-card-warning">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Compliance Zone</p>
                <p className={`text-3xl font-bold capitalize text-amber-900 mt-2 ${
                  propertyStats.complianceZone === 'green' ? 'text-green-900' :
                  propertyStats.complianceZone === 'amber' ? 'text-amber-900' : 'text-red-900'
                }`}>
                  {propertyStats.complianceZone}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  {propertyStats.complianceZone === 'green' ? 'Excellent compliance' :
                   propertyStats.complianceZone === 'amber' ? 'Minor issues to address' : 'Immediate action required'}
                </p>
              </div>
              <div className="icon-container-warning">
                <Target className="h-6 w-6" />
              </div>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Next Audit</p>
                  <p className="text-2xl font-bold text-blue-600">{propertyStats.nextAuditDays} Days</p>
                  <p className="text-xs text-blue-600">Quarterly schedule</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Audits</p>
                  <p className="text-2xl font-bold text-purple-600">{propertyAudits.length}</p>
                  <p className="text-xs text-gray-500">Historical data</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
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
