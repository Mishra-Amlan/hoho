import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HOTEL_AUDIT_CHECKLIST, ChecklistItem } from '@shared/auditChecklist';
import { useAudits, useUpdateAudit } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Save, Send, Camera, Video, MessageSquare } from 'lucide-react';

export default function AuditorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [draftNotes, setDraftNotes] = useState('');
  const [selectedChecklistItem, setSelectedChecklistItem] = useState<ChecklistItem | null>(null);
  const [itemScores, setItemScores] = useState<Record<string, { score: number | null; comments: string; media: any[] }>>({});
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [currentMediaType, setCurrentMediaType] = useState<'photo' | 'video' | 'text'>('photo');

  const { data: audits = [], isLoading } = useAudits({ auditorId: user?.id });
  const updateAudit = useUpdateAudit();
  const currentAudit = audits.find((audit: any) => audit.status === 'in_progress') || audits[0];

  const handleSaveDraft = async () => {
    if (!currentAudit) return;
    
    try {
      await updateAudit.mutateAsync({
        id: currentAudit.id,
        status: 'in_progress'
      });
      
      toast({
        title: "Draft Saved",
        description: "Your audit progress has been saved successfully.",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save draft. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmitForReview = async () => {
    if (!currentAudit) return;
    
    try {
      await updateAudit.mutateAsync({
        id: currentAudit.id,
        status: 'submitted',
        submittedAt: new Date().toISOString()
      });
      
      toast({
        title: "Submitted for Review",
        description: "Your audit has been submitted for review successfully.",
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "Unable to submit audit. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMediaCapture = (itemId: string, mediaType: 'photo' | 'video' | 'text', content: any) => {
    setItemScores(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        media: [
          ...(prev[itemId]?.media || []),
          { type: mediaType, content, timestamp: new Date().toISOString() }
        ]
      }
    }));
  };

  const handleScoreChange = (itemId: string, score: number, comments: string) => {
    setItemScores(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        score,
        comments
      }
    }));
  };

  const getItemScore = (itemId: string) => itemScores[itemId] || { score: null, comments: '', media: [] };
  
  const getCompletedItemsCount = () => {
    return Object.values(itemScores).filter(item => item.score !== null).length;
  };

  const getTotalItemsCount = () => {
    return HOTEL_AUDIT_CHECKLIST.reduce((total, category) => total + category.items.length, 0);
  };

  const getOverallProgress = () => {
    const completed = getCompletedItemsCount();
    const total = getTotalItemsCount();
    return total > 0 ? (completed / total) * 100 : 0;
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentAudit) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Assigned Audits</h2>
              <p className="text-gray-600">You don't have any audits assigned to you at the moment.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">My Assigned Audits</h1>
          <p className="text-gray-700 text-lg">Conduct audits, record observations, and upload evidence</p>
        </div>

        {/* Current Audit Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Audit: Property ID {currentAudit.propertyId}</CardTitle>
              <span className={`px-3 py-1 text-sm rounded-full ${
                currentAudit.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                currentAudit.status === 'completed' ? 'bg-green-100 text-green-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {currentAudit.status.charAt(0).toUpperCase() + currentAudit.status.slice(1).replace('_', ' ')}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Overview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Overall Progress</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {getCompletedItemsCount()}/{getTotalItemsCount()} items completed
                      </span>
                    </div>
                    <Progress value={getOverallProgress()} className="h-3" />
                  </div>
                  
                  {HOTEL_AUDIT_CHECKLIST.map((category) => {
                    const categoryCompleted = category.items.filter(item => getItemScore(item.id).score !== null).length;
                    const categoryProgress = category.items.length > 0 ? (categoryCompleted / category.items.length) * 100 : 0;
                    
                    return (
                      <div key={category.id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">{category.name}</span>
                          <span className="text-sm font-semibold text-gray-700">
                            {categoryCompleted}/{category.items.length}
                          </span>
                        </div>
                        <Progress value={categoryProgress} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comprehensive Hotel Audit Checklist */}
        <div className="space-y-6">
          {HOTEL_AUDIT_CHECKLIST.map((category) => (
            <Card key={category.id} className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{category.name}</span>
                  <span className="text-sm text-gray-500">
                    {category.items.filter(item => getItemScore(item.id).score !== null).length}/{category.items.length} completed
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {category.items.map((item) => {
                    const itemData = getItemScore(item.id);
                    return (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{item.item}</h3>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Max Score: {item.maxScore}</span>
                              <span className="text-xs text-gray-500">Weight: {item.weight}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <Select 
                              value={itemData.score?.toString() || ''} 
                              onValueChange={(value) => handleScoreChange(item.id, parseInt(value), itemData.comments)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select Score" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: item.maxScore }, (_, i) => i + 1).map((score) => (
                                  <SelectItem key={score} value={score.toString()}>
                                    {score}/{item.maxScore}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        {/* Media Upload Options */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Evidence Collection</label>
                          <div className="flex gap-2 mb-3">
                            {item.mediaTypes.includes('photo') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) {
                                      handleMediaCapture(item.id, 'photo', URL.createObjectURL(file));
                                    }
                                  };
                                  input.click();
                                }}
                                className="flex items-center gap-1"
                              >
                                <Camera className="h-4 w-4" />
                                Photo
                                {item.requiredMedia?.includes('photo') && <span className="text-red-500">*</span>}
                              </Button>
                            )}
                            {item.mediaTypes.includes('video') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'video/*';
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) {
                                      handleMediaCapture(item.id, 'video', URL.createObjectURL(file));
                                    }
                                  };
                                  input.click();
                                }}
                                className="flex items-center gap-1"
                              >
                                <Video className="h-4 w-4" />
                                Video
                                {item.requiredMedia?.includes('video') && <span className="text-red-500">*</span>}
                              </Button>
                            )}
                            {item.mediaTypes.includes('text') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const textNote = prompt('Enter your text note:');
                                  if (textNote) {
                                    handleMediaCapture(item.id, 'text', textNote);
                                  }
                                }}
                                className="flex items-center gap-1"
                              >
                                <MessageSquare className="h-4 w-4" />
                                Text Notes
                                {item.requiredMedia?.includes('text') && <span className="text-red-500">*</span>}
                              </Button>
                            )}
                          </div>
                          
                          {/* Display collected media */}
                          {itemData.media.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mb-4">
                              {itemData.media.map((media: any, index: number) => (
                                <div key={index} className="border rounded p-2 bg-gray-50">
                                  <div className="text-xs text-gray-600 mb-1">
                                    {media.type === 'photo' && '📷 Photo'}
                                    {media.type === 'video' && '📹 Video'}
                                    {media.type === 'text' && '📝 Text Note'}
                                  </div>
                                  {media.type === 'text' && (
                                    <p className="text-sm text-gray-800 truncate">{media.content}</p>
                                  )}
                                  {media.type === 'photo' && (
                                    <img src={media.content} alt="Evidence" className="w-full h-16 object-cover rounded" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Comments */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Auditor Comments</label>
                          <Textarea 
                            rows={3} 
                            value={itemData.comments}
                            onChange={(e) => handleScoreChange(item.id, itemData.score || 0, e.target.value)}
                            placeholder="Add your observations and comments..."
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Additional Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Audit Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                placeholder="Add any additional observations, recommendations, or overall assessment notes..."
                className="min-h-24"
              />
              
              {/* Submit Actions */}
              <div className="flex space-x-4 mt-6">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleSaveDraft}
                  disabled={updateAudit.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateAudit.isPending ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button 
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  onClick={handleSubmitForReview}
                  disabled={updateAudit.isPending}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {updateAudit.isPending ? 'Submitting...' : 'Submit for Review'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}