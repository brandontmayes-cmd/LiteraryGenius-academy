import { supabase } from './supabase';

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  tag?: string;
}

export const notificationService = {
  async sendAssignmentNotification(assignmentId: string, studentIds: string[]) {
    const { data: assignment } = await supabase
      .from('assignments')
      .select('title, due_date')
      .eq('id', assignmentId)
      .single();

    if (assignment) {
      const payload: NotificationPayload = {
        title: 'New Assignment',
        body: `${assignment.title} - Due: ${new Date(assignment.due_date).toLocaleDateString()}`,
        icon: '/icon-192.png',
        tag: `assignment-${assignmentId}`,
        data: { type: 'assignment', id: assignmentId }
      };

      await this.sendToUsers(studentIds, payload);
    }
  },

  async sendGradeNotification(submissionId: string, studentId: string) {
    const { data: submission } = await supabase
      .from('submissions')
      .select('grade, assignment:assignments(title)')
      .eq('id', submissionId)
      .single();

    if (submission) {
      const payload: NotificationPayload = {
        title: 'Grade Posted',
        body: `Your grade for ${submission.assignment.title}: ${submission.grade}%`,
        icon: '/icon-192.png',
        tag: `grade-${submissionId}`,
        data: { type: 'grade', id: submissionId }
      };

      await this.sendToUsers([studentId], payload);
    }
  },

  async sendMessageNotification(messageId: string, recipientId: string, senderName: string) {
    const payload: NotificationPayload = {
      title: `Message from ${senderName}`,
      body: 'You have a new message',
      icon: '/icon-192.png',
      tag: `message-${messageId}`,
      data: { type: 'message', id: messageId }
    };

    await this.sendToUsers([recipientId], payload);
  },

  async sendToUsers(userIds: string[], payload: NotificationPayload) {
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .in('user_id', userIds);

    if (subscriptions) {
      for (const sub of subscriptions) {
        try {
          const subscription = JSON.parse(sub.subscription);
          await fetch('/api/send-push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription, payload })
          });
        } catch (error) {
          console.error('Failed to send notification:', error);
        }
      }
    }
  }
};
