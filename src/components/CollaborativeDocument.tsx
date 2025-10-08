import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Save, Users, History, Share } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface CollaborativeDocumentProps {
  documentId?: string;
  groupId?: string;
  assignmentId?: string;
}

interface Document {
  id: string;
  title: string;
  content: string;
  document_type: string;
  updated_at: string;
}

interface Collaborator {
  id: string;
  user_id: string;
  permission: string;
  user_profiles: {
    display_name: string;
    avatar_url: string;
  };
}

export default function CollaborativeDocument({ documentId, groupId, assignmentId }: CollaborativeDocumentProps) {
  const { user } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (documentId) {
      fetchDocument();
      fetchCollaborators();
      subscribeToChanges();
    }
  }, [documentId]);

  useEffect(() => {
    // Auto-save after 2 seconds of inactivity
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (document && (content !== document.content || title !== document.title)) {
        saveDocument();
      }
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, title]);

  const fetchDocument = async () => {
    try {
      const { data, error } = await supabase
        .from('shared_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) throw error;

      setDocument(data);
      setContent(data.content || '');
      setTitle(data.title || '');
    } catch (error) {
      console.error('Error fetching document:', error);
    }
  };

  const fetchCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from('document_collaborators')
        .select(`
          *,
          user_profiles(display_name, avatar_url)
        `)
        .eq('document_id', documentId);

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };

  const subscribeToChanges = () => {
    const channel = supabase
      .channel(`document:${documentId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'shared_documents',
        filter: `id=eq.${documentId}`
      }, (payload) => {
        const updatedDoc = payload.new as Document;
        if (updatedDoc.updated_at !== document?.updated_at) {
          setDocument(updatedDoc);
          setContent(updatedDoc.content || '');
          setTitle(updatedDoc.title || '');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const saveDocument = async () => {
    if (!document || saving) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('shared_documents')
        .update({
          title,
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', document.id);

      if (error) throw error;

      // Create version history
      await supabase
        .from('document_versions')
        .insert({
          document_id: document.id,
          content,
          version_number: 1, // Simplified versioning
          created_by: user?.id,
          change_summary: 'Document updated'
        });

    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setSaving(false);
    }
  };

  const createNewDocument = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('collaboration-manager', {
        body: {
          action: 'create_shared_document',
          data: {
            title: 'New Document',
            content: '',
            type: 'text',
            groupId,
            assignmentId,
            userId: user?.id
          }
        }
      });

      if (error) throw error;
      
      if (data.document) {
        setDocument(data.document);
        setTitle(data.document.title);
        setContent(data.document.content || '');
      }
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  if (!document && !groupId && !assignmentId) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 mb-4">No document selected</p>
          <Button onClick={createNewDocument}>Create New Document</Button>
        </CardContent>
      </Card>
    );
  }

  if (!document) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 mb-4">Create a new collaborative document</p>
          <Button onClick={createNewDocument}>Create Document</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold border-none p-0 h-auto"
              placeholder="Document title..."
            />
            <div className="flex items-center space-x-2">
              {saving && <Badge variant="secondary">Saving...</Badge>}
              <Button size="sm" onClick={saveDocument} disabled={saving}>
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="text-sm text-gray-500">{collaborators.length} collaborators</span>
            </div>
            <div className="flex -space-x-2">
              {collaborators.slice(0, 5).map((collaborator) => (
                <Avatar key={collaborator.id} className="w-6 h-6 border-2 border-white">
                  <AvatarImage src={collaborator.user_profiles?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {collaborator.user_profiles?.display_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing your collaborative document..."
            className="min-h-96 resize-none"
          />
        </CardContent>
      </Card>
    </div>
  );
}