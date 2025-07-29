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
import { AlertCircle, BarChart3, Building, CheckCircle, Clock, MessageSquare, Send, TrendingUp, Users, Zap } from 'lucide-react';

export default function CorporateDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [recommendationOpen, setRecommendationOpen] = useState(false);
  const [surveyData, setSurveyData] = useState({
    title: '',
    description: '',
    questions: ['']
  });
  const [recommendationData, setRecommendationData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    targetProperties: 'all'
  });

  // Fetch real-time data
  const { data: audits = [], isLoading: auditsLoading } = useQuery({
    queryKey: ['/audits'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['/properties'],
    refetchInterval: 30000
  });

  // Calculate real-time KPIs
  const kpiData = {
    overallCompliance: (audits as any[]).length > 0 ? Math.round((audits as any[]).reduce((sum: number, audit: any) => sum + (audit.overallScore || 0), 0) / (audits as any[]).length) : 0,
    totalProperties: (properties as any[]).length,
    criticalIssues: (audits as any[]).filter((audit: any) => audit.overallScore && audit.overallScore < 70).length,
    auditsThisMonth: (audits as any[]).filter((audit: any) => {
      const auditDate = new Date(audit.submittedAt || audit.createdAt);
      const now = new Date();
      return auditDate.getMonth() === now.getMonth() && auditDate.getFullYear() === now.getFullYear();
    }).length
  };

  // Debug logging
  console.log('Corporate - Audits data:', audits);
  console.log('Corporate - Properties data:', properties);
  console.log('Corporate - KPI data:', kpiData);

  // Calculate regional data from real audits
  const regionalData = (properties as any[]).map((property: any) => {
    const propertyAudits = (audits as any[]).filter((audit: any) => audit.propertyId === property.id);
    const avgScore = propertyAudits.length > 0 
      ? Math.round(propertyAudits.reduce((sum: number, audit: any) => sum + (audit.overallScore || 0), 0) / propertyAudits.length)
      : 0;
    
    return {
      region: property.region || property.location,
      score: avgScore,
      color: avgScore >= 85 ? 'bg-green-500' : avgScore >= 70 ? 'bg-yellow-500' : 'bg-red-500',
      propertyName: property.name
    };
  });

  // Get critical properties from real data
  const criticalProperties = (properties as any[])
    .map((property: any) => {
      const propertyAudits = (audits as any[]).filter((audit: any) => audit.propertyId === property.id);
      const latestAudit = propertyAudits.sort((a: any, b: any) => 
        new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime()
      )[0];
      
      return {
        ...property,
        score: latestAudit?.overallScore || 0,
        lastAudit: latestAudit ? new Date(latestAudit.submittedAt || latestAudit.createdAt).toLocaleDateString() : 'No audits',
        issues: latestAudit?.findings ? ['Compliance Issues'] : ['No Issues']
      };
    })
    .filter((property: any) => property.score > 0 && property.score < 80)
    .sort((a: any, b: any) => a.score - b.score);

  // Survey creation mutation
  const createSurvey = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create survey');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Survey Created",
        description: "Survey has been distributed to all properties",
      });
      setSurveyOpen(false);
      setSurveyData({ title: '', description: '', questions: [''] });
    }
  });

  // Recommendation creation mutation
  const createRecommendation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create recommendation');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Recommendation Sent",
        description: "Recommendation has been sent to target properties",
      });
      setRecommendationOpen(false);
      setRecommendationData({ title: '', description: '', priority: 'medium', targetProperties: 'all' });
    }
  });

  return (
    <div className="min-h-screen corporate-bg">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Corporate Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor brand compliance and performance across all properties</p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-8">
          <Dialog open={surveyOpen} onOpenChange={setSurveyOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <MessageSquare className="h-4 w-4 mr-2" />
                Create Survey
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Property Survey</DialogTitle>
                <DialogDescription>
                  Send a survey to all properties to gather feedback and insights
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="survey-title">Survey Title</Label>
                  <Input
                    id="survey-title"
                    value={surveyData.title}
                    onChange={(e) => setSurveyData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter survey title"
                  />
                </div>
                <div>
                  <Label htmlFor="survey-description">Description</Label>
                  <Textarea
                    id="survey-description"
                    value={surveyData.description}
                    onChange={(e) => setSurveyData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the purpose of this survey"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Questions</Label>
                  {surveyData.questions.map((question, index) => (
                    <div key={index} className="flex space-x-2 mt-2">
                      <Input
                        value={question}
                        onChange={(e) => {
                          const newQuestions = [...surveyData.questions];
                          newQuestions[index] = e.target.value;
                          setSurveyData(prev => ({ ...prev, questions: newQuestions }));
                        }}
                        placeholder={`Question ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const newQuestions = [...surveyData.questions, ''];
                          setSurveyData(prev => ({ ...prev, questions: newQuestions }));
                        }}
                      >
                        +
                      </Button>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={() => createSurvey.mutate(surveyData)}
                  disabled={createSurvey.isPending}
                  className="w-full"
                >
                  {createSurvey.isPending ? 'Creating...' : 'Send Survey'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={recommendationOpen} onOpenChange={setRecommendationOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                <Send className="h-4 w-4 mr-2" />
                Send Recommendation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Recommendation</DialogTitle>
                <DialogDescription>
                  Send improvement recommendations to properties
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rec-title">Recommendation Title</Label>
                  <Input
                    id="rec-title"
                    value={recommendationData.title}
                    onChange={(e) => setRecommendationData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter recommendation title"
                  />
                </div>
                <div>
                  <Label htmlFor="rec-description">Description</Label>
                  <Textarea
                    id="rec-description"
                    value={recommendationData.description}
                    onChange={(e) => setRecommendationData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the recommendation"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={recommendationData.priority}
                    onChange={(e) => setRecommendationData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <Button 
                  onClick={() => createRecommendation.mutate(recommendationData)}
                  disabled={createRecommendation.isPending}
                  className="w-full"
                >
                  {createRecommendation.isPending ? 'Sending...' : 'Send Recommendation'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPI Cards - Real-time Data */}
        <div className="dashboard-section">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 dashboard-grid">
          <div className="metric-card-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Overall Compliance</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{kpiData.overallCompliance}%</p>
                <p className="text-xs text-green-600 mt-1">Live data from audits</p>
              </div>
              <div className="icon-container-success">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="metric-card-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Total Properties</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{kpiData.totalProperties}</p>
                <p className="text-xs text-blue-600 mt-1">Active properties</p>
              </div>
              <div className="icon-container-primary">
                <Building className="h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="metric-card-danger">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-700 uppercase tracking-wide">Critical Issues</p>
                <p className="text-3xl font-bold text-red-900 mt-2">{kpiData.criticalIssues}</p>
                <p className="text-xs text-red-600 mt-1">Score below 70%</p>
              </div>
              <div className="icon-container-danger">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="metric-card-warning">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Audits This Month</p>
                <p className="text-3xl font-bold text-amber-900 mt-2">{kpiData.auditsThisMonth}</p>
                <p className="text-xs text-amber-600 mt-1">Recent submissions</p>
              </div>
              <div className="icon-container-warning">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </div>
          </div>
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
                {regionalData.map((region: any, index: number) => (
                  <div key={`${region.region}-${index}`} className="flex items-center justify-between">
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
        <div className="modern-table">
          <div className="p-6 border-b border-gray-100/50">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Properties Requiring Attention</h3>
              <Button className="btn-warning">
                <i className="fas fa-download mr-2"></i>Export Report
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Property</th>
                  <th className="table-header-cell">Score</th>
                  <th className="table-header-cell">Issues</th>
                  <th className="table-header-cell">Last Audit</th>
                  <th className="table-header-cell">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50">
                  {criticalProperties.map((property: any) => (
                    <tr key={property.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center">
                          <img 
                            src={property.image}
                            alt={property.name}
                            className="w-12 h-12 rounded-xl object-cover mr-4 shadow-md"
                          />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{property.name}</div>
                            <div className="text-xs text-gray-600">{property.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={property.score >= 75 ? "status-badge-amber" : "status-badge-red"}>
                          {property.score}%
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {property.issues.join(', ')}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-600">{property.lastAudit}</div>
                      </td>
                      <td className="table-cell">
                        <button className="text-amber-600 hover:text-amber-800 font-medium text-sm px-4 py-2 rounded-lg hover:bg-amber-50 transition-colors">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
      </div>
    </div>
  );
}
