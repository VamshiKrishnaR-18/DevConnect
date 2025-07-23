import { useState } from 'react';
import { Users, FileText, Search, UserCircle, Calendar, Mail, Phone } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { Input } from './components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';

// Mock data
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Admin', status: 'Active', joinDate: '2024-01-15', phone: '+1 (555) 123-4567' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Editor', status: 'Active', joinDate: '2024-02-20', phone: '+1 (555) 234-5678' },
  { id: 3, name: 'Mike Johnson', email: 'mike.johnson@example.com', role: 'User', status: 'Inactive', joinDate: '2024-01-10', phone: '+1 (555) 345-6789' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah.wilson@example.com', role: 'Editor', status: 'Active', joinDate: '2024-03-05', phone: '+1 (555) 456-7890' },
  { id: 5, name: 'Alex Brown', email: 'alex.brown@example.com', role: 'User', status: 'Active', joinDate: '2024-02-28', phone: '+1 (555) 567-8901' },
];

const mockPosts = [
  { id: 1, title: 'Getting Started with React', author: 'John Doe', category: 'Technology', status: 'Published', date: '2024-03-15', views: 1250 },
  { id: 2, title: 'Design Systems Best Practices', author: 'Jane Smith', category: 'Design', status: 'Draft', date: '2024-03-14', views: 0 },
  { id: 3, title: 'The Future of Web Development', author: 'Mike Johnson', category: 'Technology', status: 'Published', date: '2024-03-12', views: 3200 },
  { id: 4, title: 'User Experience Principles', author: 'Sarah Wilson', category: 'Design', status: 'Published', date: '2024-03-10', views: 2100 },
  { id: 5, title: 'Building Scalable Applications', author: 'Alex Brown', category: 'Technology', status: 'Published', date: '2024-03-08', views: 1850 },
];

const sidebarItems = [
  { title: 'Users', icon: Users, id: 'users' },
  { title: 'Posts', icon: FileText, id: 'posts' },
];

function UsersSection() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Users Management</h1>
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face`} />
                        <AvatarFallback>
                          <UserCircle size={16} />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'Admin' ? 'destructive' : user.role === 'Editor' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Calendar size={14} />
                      <span>{user.joinDate}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Mail size={12} />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Phone size={12} />
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function PostsSection() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPosts = mockPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Posts Management</h1>
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Posts ({filteredPosts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div>
                      <div className="text-sm">{post.title}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=24&h=24&fit=crop&crop=face`} />
                        <AvatarFallback>
                          <UserCircle size={12} />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{post.author}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{post.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.status === 'Published' ? 'default' : 'secondary'}>
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Calendar size={14} />
                      <span>{post.date}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {post.views.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState('users');

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <div className="p-4">
              <h2 className="text-primary">Admin Dashboard</h2>
            </div>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveSection(item.id)}
                        isActive={activeSection === item.id}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="border-b px-6 py-4 flex items-center">
            <SidebarTrigger />
            <div className="ml-4">
              <h1 className="text-primary">
                {activeSection === 'users' ? 'Users' : 'Posts'} Management
              </h1>
            </div>
          </header>

          <div className="flex-1 p-6 bg-muted/20">
            {activeSection === 'users' && <UsersSection />}
            {activeSection === 'posts' && <PostsSection />}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
