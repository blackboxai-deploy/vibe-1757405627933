'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const AVAILABLE_GRADES = [
  'Pemula (7-9 tahun)',
  'Grade 4',
  'Grade 5', 
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'Dewasa',
];

interface Announcement {
  _id: string;
  title: string;
  content: string;
  link?: string;
  targetGrades: string[];
  author: {
    name: string;
    role: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    link: '',
    targetGrades: [] as string[],
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const url = user?.role === 'teacher' 
        ? '/api/announcements?author=me'
        : '/api/announcements';
        
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setAnnouncements(data.announcements || []);
      } else {
        setError(data.error || 'Failed to load announcements');
      }
    } catch (err) {
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || formData.targetGrades.length === 0) {
      setError('Title, content, and target grades are required');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const url = editing ? `/api/announcements/${editing}` : '/api/announcements';
      const method = editing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(editing ? 'Announcement updated successfully' : 'Announcement created successfully');
        resetForm();
        fetchAnnouncements();
        setIsDialogOpen(false);
      } else {
        setError(data.error || 'Failed to save announcement');
      }
    } catch (err) {
      setError('Failed to save announcement');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      link: announcement.link || '',
      targetGrades: announcement.targetGrades,
    });
    setEditing(announcement._id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setSuccess('Announcement deleted successfully');
        fetchAnnouncements();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete announcement');
      }
    } catch (err) {
      setError('Failed to delete announcement');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      link: '',
      targetGrades: [],
    });
    setEditing(null);
    setError('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002394]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-poppins text-3xl font-bold text-[#212121]">
            Announcements
          </h1>
          <p className="text-gray-600">
            Create and manage announcements for students
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#002394] hover:bg-[#001a73] text-white"
              onClick={() => resetForm()}
            >
              Create New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="font-poppins text-xl text-[#212121]">
                {editing ? 'Edit Announcement' : 'Create New Announcement'}
              </DialogTitle>
              <DialogDescription>
                Share important updates and information with students in specific grades.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-[#212121]">
                  Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 border-gray-200 focus:border-[#002394] focus:ring-[#002394]"
                  placeholder="Enter announcement title"
                  disabled={creating}
                  required
                />
              </div>

              <div>
                <Label htmlFor="content" className="text-sm font-medium text-[#212121]">
                  Content *
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="mt-1 border-gray-200 focus:border-[#002394] focus:ring-[#002394] min-h-[120px]"
                  placeholder="Enter announcement content"
                  disabled={creating}
                  required
                />
              </div>

              <div>
                <Label htmlFor="link" className="text-sm font-medium text-[#212121]">
                  Link (Optional)
                </Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  className="mt-1 border-gray-200 focus:border-[#002394] focus:ring-[#002394]"
                  placeholder="https://example.com (e.g., Zoom meeting link)"
                  disabled={creating}
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-[#212121]">
                  Target Grades *
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {AVAILABLE_GRADES.map((grade) => (
                    <label key={grade} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.targetGrades.includes(grade)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              targetGrades: [...prev.targetGrades, grade]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              targetGrades: prev.targetGrades.filter(g => g !== grade)
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-[#002394] focus:ring-[#002394]"
                        disabled={creating}
                      />
                      <span className="text-sm text-gray-700">{grade}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#002394] hover:bg-[#001a73] text-white"
                  disabled={creating}
                >
                  {creating ? 'Saving...' : editing ? 'Update' : 'Create'} Announcement
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card className="border-gray-100">
            <CardContent className="py-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h3 className="font-poppins text-lg font-medium text-gray-600 mb-2">
                No announcements yet
              </h3>
              <p className="text-gray-500">
                Create your first announcement to share updates with students.
              </p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement._id} className="border-gray-100 hover:border-[#002394] transition-colors duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="font-poppins text-lg text-[#212121] mb-2">
                      {announcement.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      By {announcement.author.name} • {formatDate(announcement.createdAt)}
                      {announcement.updatedAt !== announcement.createdAt && ' • Edited'}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(announcement)}
                      className="border-[#002394] text-[#002394] hover:bg-[#002394] hover:text-white"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(announcement._id)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                  {announcement.content}
                </p>
                
                {announcement.link && (
                  <div className="mb-4">
                    <a
                      href={announcement.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#002394] hover:text-[#001a73] underline text-sm"
                    >
                      {announcement.link}
                    </a>
                  </div>
                )}

                <div className="flex flex-wrap gap-1">
                  {announcement.targetGrades.map((grade) => (
                    <Badge key={grade} variant="outline" className="text-xs">
                      {grade}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}