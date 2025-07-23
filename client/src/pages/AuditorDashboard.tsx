import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Audit, AuditItem } from '@shared/schema';
import { AuditChecklistModal } from '@/components/AuditChecklistModal';
import { PhotoUploadModal } from '@/components/PhotoUploadModal';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { DragDropUpload } from '@/components/DragDropUpload';
import { useAudits, useUpdateAudit } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Save, Send, FileText, Camera, Mic } from 'lucide-react';

export default function AuditorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [draftNotes, setDraftNotes] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<any[]>([]);
  const [checklistItems] = useState([
    {
      id: 1,
      title: 'Logo Display Compliance',
      description: 'Check if all Taj logos are properly displayed and meet brand guidelines',
      category: 'branding',
      score: null,
      comments: '',
      photos: []
    },
    {
      id: 2, 
      title: 'Staff Uniform Standards',
      description: 'Verify staff uniforms meet brand standards and are well-maintained',
      category: 'branding',
      score: 4,
      comments: 'All staff uniforms are clean and properly maintained. Name tags are clearly visible.',
      photos: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200',
        'https://images.unsplash.com/photo-1568992687947-868a62a9f521?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200'
      ]
    }
  ]);

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

  const handleVoiceRecording = (audioBlob: Blob, transcription?: string) => {
    const newVoiceNote = {
      id: Date.now().toString(),
      audioBlob,
      transcription,
      timestamp: new Date().toISOString()
    };
    setVoiceNotes(prev => [...prev, newVoiceNote]);
  };

  const handleFilesChange = (files: any[]) => {
    setAttachedFiles(files);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Progress Overview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Cleanliness & Hygiene</span>
                      <span className="text-sm font-semibold text-green-600">
                        {currentAudit.cleanlinessScore ? `${currentAudit.cleanlinessScore}/5` : 'Pending'}
                      </span>
                    </div>
                    <Progress value={currentAudit.cleanlinessScore ? (currentAudit.cleanlinessScore / 5) * 100 : 0} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Branding Compliance</span>
                      <span className="text-sm font-semibold text-yellow-600">
                        {currentAudit.brandingScore ? `${currentAudit.brandingScore}/5` : 'Pending'}
                      </span>
                    </div>
                    <Progress value={currentAudit.brandingScore ? (currentAudit.brandingScore / 5) * 100 : 0} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Operational Efficiency</span>
                      <span className="text-sm font-semibold text-gray-400">
                        {currentAudit.operationalScore ? `${currentAudit.operationalScore}/5` : 'Pending'}
                      </span>
                    </div>
                    <Progress value={currentAudit.operationalScore ? (currentAudit.operationalScore / 5) * 100 : 0} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    className="w-full btn-success" 
                    onClick={() => setShowChecklistModal(true)}
                  >
                    <FileText className="h-4 w-4 mr-2" />Continue Checklist
                  </Button>
                  <Button 
                    className="w-full btn-primary" 
                    onClick={() => setShowPhotoModal(true)}
                  >
                    <Camera className="h-4 w-4 mr-2" />Upload Photos
                  </Button>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200" 
                    onClick={handleSaveDraft}
                  >
                    <Mic className="h-4 w-4 mr-2" />Record Voice Note
                  </Button>
                  <Button 
                    className="w-full bg-gray-500 hover:bg-gray-600"
                    onClick={handleSaveDraft}
                    disabled={updateAudit.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateAudit.isPending ? 'Saving...' : 'Save Draft'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Audit Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Audit Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>Branding Compliance Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {checklistItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <Select defaultValue={item.score?.toString()}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select Score" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">Excellent (5)</SelectItem>
                            <SelectItem value="4">Good (4)</SelectItem>
                            <SelectItem value="3">Average (3)</SelectItem>
                            <SelectItem value="2">Poor (2)</SelectItem>
                            <SelectItem value="1">Critical (1)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Enhanced Photo Upload with Drag & Drop */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Evidence Photos</label>
                        {item.photos.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            {item.photos.map((photo, index) => (
                              <img
                                key={index} 
                                src={photo}
                                alt={`Evidence ${index + 1}`}
                                className="rounded-lg object-cover h-32 w-full"
                              />
                            ))}
                          </div>
                        ) : (
                          <DragDropUpload
                            onFilesChange={handleFilesChange}
                            acceptedTypes={['image/*']}
                            maxFiles={5}
                            maxSizeInMB={10}
                            className="mb-2"
                          />
                        )}
                      </div>

                      {/* Comments */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                        <Textarea 
                          rows={3} 
                          defaultValue={item.comments}
                          placeholder="Add your observations and comments..."
                        />
                      </div>
                    </div>
                  ))}

                  {/* Additional Notes Section */}
                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-3">Additional Audit Notes</h3>
                    <Textarea 
                      value={draftNotes}
                      onChange={(e) => setDraftNotes(e.target.value)}
                      placeholder="Add any additional observations, recommendations, or overall assessment notes..."
                      className="min-h-24"
                    />
                  </div>

                  {/* Enhanced Submit Actions */}
                  <div className="flex space-x-4 pt-6">
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Tools */}
          <div className="space-y-6">
            {/* Voice Recorder */}
            <VoiceRecorder 
              onRecordingComplete={handleVoiceRecording}
              className="w-full"
            />

            {/* File Upload Center */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Media Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DragDropUpload
                  onFilesChange={handleFilesChange}
                  acceptedTypes={['image/*', 'video/*', '.pdf']}
                  maxFiles={10}
                  maxSizeInMB={50}
                />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setShowChecklistModal(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Continue Checklist
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setShowPhotoModal(true)}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Photos
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modals */}
        <AuditChecklistModal
          isOpen={showChecklistModal}
          onOpenChange={setShowChecklistModal}
          auditId={currentAudit.id}
          propertyName={`Property ${currentAudit.propertyId}`}
        />

        <PhotoUploadModal
          isOpen={showPhotoModal}
          onOpenChange={setShowPhotoModal}
          auditId={currentAudit.id}
          propertyName={`Property ${currentAudit.propertyId}`}
        />
      </div>
    </div>
  );
}
