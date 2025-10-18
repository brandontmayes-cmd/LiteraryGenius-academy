import { supabase } from './supabase';

export interface ScheduledEmail {
  userId: string;
  email: string;
  templateName: string;
  templateData: any;
  scheduledFor: Date;
}

export class EmailScheduler {
  static async scheduleEmail(emailData: ScheduledEmail) {
    const { data, error } = await supabase
      .from('email_notifications')
      .insert({
        user_id: emailData.userId,
        email: emailData.email,
        template_name: emailData.templateName,
        template_data: emailData.templateData,
        status: 'scheduled',
        scheduled_for: emailData.scheduledFor.toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async scheduleAssignmentReminder(
    assignmentId: string,
    dueDate: Date,
    reminderHours: number = 24
  ) {
    const { data: assignment } = await supabase
      .from('assignments')
      .select('*, students!inner(user_id, user_profiles(full_name, email))')
      .eq('id', assignmentId)
      .single();

    if (!assignment) return;

    const reminderDate = new Date(dueDate);
    reminderDate.setHours(reminderDate.getHours() - reminderHours);

    const students = assignment.students;
    for (const student of students) {
      await this.scheduleEmail({
        userId: student.user_id,
        email: student.user_profiles.email,
        templateName: 'assignment_reminder',
        templateData: {
          studentName: student.user_profiles.full_name,
          assignmentTitle: assignment.title,
          dueDate: dueDate.toLocaleDateString(),
          assignmentUrl: `${window.location.origin}/assignments/${assignmentId}`
        },
        scheduledFor: reminderDate
      });
    }
  }

  static async sendGradeNotification(gradeId: string) {
    const { data: grade } = await supabase
      .from('grades')
      .select('*, assignments(title), students(user_id, user_profiles(full_name, email))')
      .eq('id', gradeId)
      .single();

    if (!grade) return;

    await supabase.functions.invoke('send-email-notification', {
      body: {
        userId: grade.students.user_id,
        email: grade.students.user_profiles.email,
        templateName: 'grade_posted',
        templateData: {
          studentName: grade.students.user_profiles.full_name,
          assignmentTitle: grade.assignments.title,
          grade: grade.score,
          feedback: grade.feedback,
          gradeUrl: `${window.location.origin}/grades/${gradeId}`
        }
      }
    });
  }

  static async sendParentMessage(messageId: string) {
    const { data: message } = await supabase
      .from('messages')
      .select('*, sender:user_profiles!sender_id(full_name), recipient:user_profiles!recipient_id(full_name, email)')
      .eq('id', messageId)
      .single();

    if (!message) return;

    await supabase.functions.invoke('send-email-notification', {
      body: {
        userId: message.recipient_id,
        email: message.recipient.email,
        templateName: 'parent_message',
        templateData: {
          parentName: message.recipient.full_name,
          teacherName: message.sender.full_name,
          studentName: message.subject,
          message: message.content,
          messageUrl: `${window.location.origin}/messages/${messageId}`
        }
      }
    });
  }

  static async sendWeeklySummary(userId: string) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: grades } = await supabase
      .from('grades')
      .select('score')
      .eq('student_id', userId)
      .gte('created_at', weekAgo.toISOString());

    const { data: achievements } = await supabase
      .from('achievements')
      .select('*')
      .eq('student_id', userId)
      .gte('earned_at', weekAgo.toISOString());

    const avgGrade = grades?.length 
      ? Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length)
      : 0;

    await supabase.functions.invoke('send-email-notification', {
      body: {
        userId,
        email: profile?.email,
        templateName: 'weekly_summary',
        templateData: {
          studentName: profile?.full_name,
          completedAssignments: grades?.length || 0,
          averageGrade: avgGrade,
          xpEarned: achievements?.reduce((sum, a) => sum + (a.xp_reward || 0), 0) || 0,
          achievements: achievements?.length || 0
        }
      }
    });
  }
}
