// AdminDashboard.tsx
// Comprehensive admin panel for Literary Genius Academy

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  TrendingUp,
  Eye,
  Download,
  Search,
  Filter,
  Calendar,
  Award,
  BarChart3,
  Settings,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Trash2,
  Edit,
  MoreVertical,
  ChevronDown,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AdminService } from '@/services/adminService';

interface AdminDashboardProps {
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'books' | 'analytics'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalBooks: 0,
    publishedBooks: 0,
    draftBooks: 0,
    activeToday: 0,
    totalPages: 0
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      console.log('📊 [AdminDashboard] Loading admin data...');
      
      // Get real statistics
      const statsResult = await AdminService.getStatistics();
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
        console.log('✅ [AdminDashboard] Stats loaded:', statsResult.data);
      }

      // Get real students
      const studentsResult = await AdminService.getAllStudents();
      if (studentsResult.success) {
        setStudents(studentsResult.data);
        console.log(`✅ [AdminDashboard] Loaded ${studentsResult.data.length} students`);
      }

      // Get real books
      const booksResult = await AdminService.getAllBooks();
      if (booksResult.success) {
        setAllBooks(booksResult.data);
        console.log(`✅ [AdminDashboard] Loaded ${booksResult.data.length} books`);
      }

    } catch (error) {
      console.error('❌ [AdminDashboard] Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Students</p>
                <p className="text-4xl font-bold mt-2">{stats.totalStudents}</p>
                <p className="text-blue-100 text-xs mt-2">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +3 this week
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#ffd700] to-[#e6c200] text-[#1a2744] border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#1a2744]/70 text-sm font-medium">Total Books</p>
                <p className="text-4xl font-bold mt-2">{stats.totalBooks}</p>
                <p className="text-[#1a2744]/70 text-xs mt-2">
                  <BookOpen className="w-3 h-3 inline mr-1" />
                  {stats.publishedBooks} published
                </p>
              </div>
              <BookOpen className="w-12 h-12 text-[#1a2744]/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Today</p>
                <p className="text-4xl font-bold mt-2">{stats.activeToday}</p>
                <p className="text-green-100 text-xs mt-2">
                  <Activity className="w-3 h-3 inline mr-1" />
                  {Math.round((stats.activeToday / stats.totalStudents) * 100)}% engagement
                </p>
              </div>
              <Activity className="w-12 h-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Pages</p>
                <p className="text-4xl font-bold mt-2">{stats.totalPages}</p>
                <p className="text-purple-100 text-xs mt-2">
                  <FileText className="w-3 h-3 inline mr-1" />
                  Avg {Math.round(stats.totalPages / stats.totalBooks)} per book
                </p>
              </div>
              <FileText className="w-12 h-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#1a2744]">
              <Clock className="w-5 h-5 text-[#ffd700]" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { student: 'Emma Wilson', action: 'published', book: 'The Magic Garden', time: '5 min ago' },
                { student: 'Lucas Martinez', action: 'created', book: 'Space Adventure', time: '1 hour ago' },
                { student: 'Sophia Chen', action: 'saved draft', book: 'Mystery at School', time: '2 hours ago' },
                { student: 'Noah Johnson', action: 'joined', book: null, time: '3 hours ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#ffd700] rounded-full"></div>
                    <div>
                      <p className="font-medium text-[#1a2744]">{activity.student}</p>
                      <p className="text-sm text-gray-600">
                        {activity.action} {activity.book && `"${activity.book}"`}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#1a2744]">
              <TrendingUp className="w-5 h-5 text-[#ffd700]" />
              Popular Books
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'The Dragon\'s Secret', author: 'Emma W.', pages: 12, downloads: 15 },
                { title: 'Adventures in Space', author: 'Lucas M.', pages: 8, downloads: 12 },
                { title: 'The Magical Forest', author: 'Sophia C.', pages: 10, downloads: 10 },
                { title: 'My Pet Robot', author: 'Noah J.', pages: 6, downloads: 8 },
              ].map((book, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium text-[#1a2744]">{book.title}</p>
                    <p className="text-sm text-gray-600">by {book.author} • {book.pages} pages</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Download className="w-4 h-4" />
                    {book.downloads}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#1a2744]">
            <Settings className="w-5 h-5 text-[#ffd700]" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col bg-[#ffd700] text-[#1a2744] hover:bg-[#e6c200]">
              <Mail className="w-6 h-6 mb-2" />
              Email All Parents
            </Button>
            <Button className="h-20 flex-col" variant="outline">
              <Download className="w-6 h-6 mb-2" />
              Export Data
            </Button>
            <Button className="h-20 flex-col" variant="outline">
              <Award className="w-6 h-6 mb-2" />
              View Achievements
            </Button>
            <Button className="h-20 flex-col" variant="outline">
              <BarChart3 className="w-6 h-6 mb-2" />
              Detailed Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const StudentsTab = () => (
    <div className="space-y-6">
      {/* Search & Filters */}
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <Button className="bg-[#ffd700] text-[#1a2744] hover:bg-[#e6c200]">
              Add Student
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#1a2744]">All Students ({stats.totalStudents})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-[#1a2744]">Student Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#1a2744]">Parent Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#1a2744]">Books</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#1a2744]">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#1a2744]">Last Active</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#1a2744]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#ffd700]/20 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-[#ffd700]" />
                        </div>
                        <div>
                          <p className="font-medium text-[#1a2744]">{student.name}</p>
                          <p className="text-sm text-gray-500">
                            Joined {student.joinDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{student.email}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#ffd700]" />
                        <span className="font-medium">{student.booksCount}</span>
                        <span className="text-sm text-gray-500">
                          ({student.publishedCount} published)
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        Active
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {student.lastActive.toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <Button size="sm" variant="outline" className="gap-2">
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const BooksTab = () => (
    <div className="space-y-6">
      {/* Books Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Published Books</p>
                <p className="text-3xl font-bold text-[#1a2744] mt-1">{stats.publishedBooks}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Draft Books</p>
                <p className="text-3xl font-bold text-[#1a2744] mt-1">{stats.draftBooks}</p>
              </div>
              <Edit className="w-10 h-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Pages</p>
                <p className="text-3xl font-bold text-[#1a2744] mt-1">{stats.totalPages}</p>
              </div>
              <FileText className="w-10 h-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Books List */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#1a2744]">All Books</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: '1',
                title: 'The Magic Garden',
                author: 'Emma Wilson',
                pages: 12,
                status: 'published',
                created: new Date('2024-12-01'),
                downloads: 15
              },
              {
                id: '2',
                title: 'Space Adventure',
                author: 'Lucas Martinez',
                pages: 8,
                status: 'draft',
                created: new Date('2024-12-10'),
                downloads: 0
              },
              // More mock books...
            ].map((book) => (
              <div key={book.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-16 bg-gradient-to-br from-[#1a2744] to-[#2d3e5f] rounded flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-[#ffd700]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#1a2744]">{book.title}</h4>
                    <p className="text-sm text-gray-600">
                      by {book.author} • {book.pages} pages • Created {book.created.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={book.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                    {book.status}
                  </Badge>
                  {book.status === 'published' && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Download className="w-4 h-4" />
                      {book.downloads}
                    </div>
                  )}
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const AnalyticsTab = () => (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#1a2744]">Analytics Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              Detailed analytics and reporting features will be available here.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Track engagement, popular features, writing trends, and more!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-[#1a2744] to-[#2d3e5f] text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#ffd700] rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#1a2744]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-gray-300">Literary Genius Academy</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="text-white border-white hover:bg-white/10">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button 
                onClick={onLogout}
                className="bg-[#ffd700] text-[#1a2744] hover:bg-[#e6c200]"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-[73px] z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'books', label: 'Books', icon: BookOpen },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#ffd700] text-[#1a2744] font-semibold'
                    : 'border-transparent text-gray-600 hover:text-[#1a2744]'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-[#ffd700] border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading admin data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'students' && <StudentsTab />}
            {activeTab === 'books' && <BooksTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
          </>
        )}
      </main>
    </div>
  );
};
