import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Send, Eye, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface PeerReviewSystemProps {
  assignmentId: string;
  submissionId?: string;
}

interface PeerReview {
  id: string;
  rating: number;
  feedback: string;
  criteria: any;
  status: string;
  created_at: string;
  reviewer: {
    display_name: string;
    avatar_url: string;
  };
}

interface ReviewCriteria {
  clarity: number;
  accuracy: number;
  creativity: number;
  completeness: number;
}

export default function PeerReviewSystem({ assignmentId, submissionId }: PeerReviewSystemProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<PeerReview[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [currentReview, setCurrentReview] = useState({
    rating: 0,
    feedback: '',
    criteria: { clarity: 0, accuracy: 0, creativity: 0, completeness: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'give' | 'received'>('give');

  useEffect(() => {
    if (assignmentId) {
      fetchReviews();
      fetchPendingReviews();
    }
  }, [assignmentId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('peer_reviews')
        .select(`
          *,
          reviewer:user_profiles!reviewer_id(display_name, avatar_url)
        `)
        .eq('assignment_id', assignmentId)
        .eq('reviewee_id', user?.id);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingReviews = async () => {
    try {
      // Get submissions that need review (excluding own submission)
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          student:user_profiles!user_id(display_name, avatar_url)
        `)
        .eq('assignment_id', assignmentId)
        .neq('user_id', user?.id)
        .limit(3); // Limit to 3 peer reviews per assignment

      if (error) throw error;

      // Filter out already reviewed submissions
      const { data: existingReviews } = await supabase
        .from('peer_reviews')
        .select('submission_id')
        .eq('reviewer_id', user?.id)
        .eq('assignment_id', assignmentId);

      const reviewedIds = existingReviews?.map(r => r.submission_id) || [];
      const pendingSubmissions = data?.filter(sub => !reviewedIds.includes(sub.id)) || [];

      setPendingReviews(pendingSubmissions);
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
    }
  };

  const submitReview = async (submissionId: string, revieweeId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('collaboration-manager', {
        body: {
          action: 'create_peer_review',
          data: {
            assignmentId,
            reviewerId: user?.id,
            revieweeId,
            submissionId,
            rating: currentReview.rating,
            feedback: currentReview.feedback,
            criteria: currentReview.criteria
          }
        }
      });

      if (error) throw error;

      setCurrentReview({
        rating: 0,
        feedback: '',
        criteria: { clarity: 0, accuracy: 0, creativity: 0, completeness: 0 }
      });
      
      fetchPendingReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const renderStarRating = (rating: number, onRate?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 cursor-pointer ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
            onClick={() => onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  const criteriaLabels = {
    clarity: 'Clarity of Expression',
    accuracy: 'Accuracy of Content',
    creativity: 'Creativity & Originality',
    completeness: 'Completeness'
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading peer reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b">
        <Button
          variant={activeTab === 'give' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('give')}
        >
          Give Reviews ({pendingReviews.length})
        </Button>
        <Button
          variant={activeTab === 'received' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('received')}
        >
          Reviews Received ({reviews.length})
        </Button>
      </div>

      {activeTab === 'give' && (
        <div className="space-y-4">
          {pendingReviews.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <p className="text-gray-600">All peer reviews completed!</p>
              </CardContent>
            </Card>
          ) : (
            pendingReviews.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={submission.student?.avatar_url} />
                      <AvatarFallback>
                        {submission.student?.display_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        Review {submission.student?.display_name}'s Work
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        Submitted {new Date(submission.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Submission Content:</h4>
                    <p className="text-sm">{submission.content?.substring(0, 200)}...</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Overall Rating:</label>
                    {renderStarRating(currentReview.rating, (rating) => 
                      setCurrentReview({...currentReview, rating})
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(criteriaLabels).map(([key, label]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium mb-1">{label}:</label>
                        {renderStarRating(
                          currentReview.criteria[key as keyof ReviewCriteria],
                          (rating) => setCurrentReview({
                            ...currentReview,
                            criteria: { ...currentReview.criteria, [key]: rating }
                          })
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Feedback:</label>
                    <Textarea
                      value={currentReview.feedback}
                      onChange={(e) => setCurrentReview({...currentReview, feedback: e.target.value})}
                      placeholder="Provide constructive feedback..."
                      rows={4}
                    />
                  </div>

                  <Button 
                    onClick={() => submitReview(submission.id, submission.user_id)}
                    disabled={!currentReview.rating || !currentReview.feedback.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Submit Review
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'received' && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Eye className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No peer reviews received yet.</p>
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={review.reviewer?.avatar_url} />
                        <AvatarFallback>
                          {review.reviewer?.display_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          Review from {review.reviewer?.display_name}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderStarRating(review.rating)}
                      <Badge variant="secondary">{review.rating}/5</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(review.criteria || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm">{criteriaLabels[key as keyof ReviewCriteria]}:</span>
                          {renderStarRating(value as number)}
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Feedback:</h4>
                      <p className="text-sm text-gray-700">{review.feedback}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}