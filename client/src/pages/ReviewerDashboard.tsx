import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

export default function ReviewerDashboard() {
  const [reviewQueue] = useState([
    {
      id: 1,
      property: 'Taj Palace, New Delhi',
      auditor: 'Sarah Johnson',
      submittedAt: '2 hours ago',
      aiScore: 85,
      aiFlags: ['Branding'],
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      status: 'high_priority'
    },
    {
      id: 2,
      property: 'Taj Mahal, Mumbai', 
      auditor: 'Mike Chen',
      submittedAt: '4 hours ago',
      aiScore: 92,
      aiFlags: [],
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      status: 'normal'
    },
    {
      id: 3,
      property: 'Taj Lake Palace, Udaipur',
      auditor: 'Lisa Thompson',
      submittedAt: '6 hours ago',
      aiScore: 68,
      aiFlags: ['Critical Issues'],
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100',
      status: 'critical'
    }
  ]);

  const [selectedReview] = useState({
    property: 'Taj Palace, New Delhi',
    overallScore: 85,
    scores: {
      cleanliness: 92,
      branding: 78,
      operational: 88
    },
    aiInsights: [
      '⚠️ Logo placement inconsistency detected in lobby area. Recommend brand guideline review.'
    ]
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Queue</h1>
          <p className="text-gray-600">Validate audit reports and AI-generated scores</p>
        </div>

        {/* Review Queue */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pending Reviews</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">All</Button>
                <Button size="sm" className="bg-purple-500 hover:bg-purple-600">High Priority</Button>
                <Button variant="outline" size="sm">AI Flagged</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviewQueue.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={item.image}
                        alt={item.property}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.property}</h3>
                        <p className="text-sm text-gray-600">Submitted by: {item.auditor}</p>
                        <p className="text-xs text-gray-500">{item.submittedAt}</p>
                        <div className="flex space-x-2 mt-2">
                          <Badge 
                            variant={item.aiScore >= 85 ? "default" : item.aiScore >= 75 ? "secondary" : "destructive"}
                            className={item.aiScore >= 85 ? "bg-green-100 text-green-800" : 
                                     item.aiScore >= 75 ? "bg-yellow-100 text-yellow-800" : 
                                     "bg-red-100 text-red-800"}
                          >
                            AI Score: {item.aiScore}%
                          </Badge>
                          {item.aiFlags.length > 0 ? (
                            <Badge variant="destructive" className="bg-yellow-100 text-yellow-800">
                              AI Flagged: {item.aiFlags.join(', ')}
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">No Issues</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button className="bg-purple-500 hover:bg-purple-600">Review</Button>
                      <Button variant="outline">Quick Approve</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Review Section */}
        <Card>
          <CardHeader>
            <CardTitle>Review: {selectedReview.property}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* AI Analysis */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis Results</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Overall Score</span>
                      <span className="text-2xl font-bold text-green-600">{selectedReview.overallScore}%</span>
                    </div>
                    <Progress value={selectedReview.overallScore} className="h-3" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cleanliness & Hygiene</span>
                      <span className="font-semibold text-green-600">{selectedReview.scores.cleanliness}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Branding Compliance</span>
                      <span className="font-semibold text-yellow-600">{selectedReview.scores.branding}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Operational Efficiency</span>
                      <span className="font-semibold text-green-600">{selectedReview.scores.operational}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-2">AI-Generated Insights</h4>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      {selectedReview.aiInsights.map((insight, index) => (
                        <p key={index} className="text-sm text-yellow-800">{insight}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Actions</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Override Overall Score</label>
                    <Input 
                      type="number" 
                      defaultValue={selectedReview.overallScore} 
                      min="0" 
                      max="100" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Compliance Zone</label>
                    <Select defaultValue="amber">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="green">Green - Compliant</SelectItem>
                        <SelectItem value="amber">Amber - Minor Issues</SelectItem>
                        <SelectItem value="red">Red - Critical Issues</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer Comments</label>
                    <Textarea 
                      rows={4} 
                      placeholder="Add your review comments..."
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <Button variant="destructive" className="flex-1">
                      <i className="fas fa-times mr-2"></i>Reject
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <i className="fas fa-edit mr-2"></i>Request Changes
                    </Button>
                    <Button className="flex-1 bg-purple-500 hover:bg-purple-600">
                      <i className="fas fa-check mr-2"></i>Approve & Submit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
