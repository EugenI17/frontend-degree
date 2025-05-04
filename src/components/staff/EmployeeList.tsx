
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Table, TableBody, TableCaption, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { userService, User } from '@/services/userService';

interface EmployeeListProps {
  onDeleteClick: (id: number) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ onDeleteClick }) => {
  // Fetch users
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers
  });

  // Get role badge colors
  const getRoleBadge = (roles: string[]) => {
    if (roles.some(role => role.includes('ADMIN') || role.includes('Admin'))) {
      return <Badge className="bg-red-500">Admin</Badge>;
    }
    if (roles.some(role => role.includes('EMPLOYEE') || role.includes('Employee'))) {
      return <Badge className="bg-blue-500">Employee</Badge>;
    }
    return <Badge variant="outline">No Role</Badge>;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading employees...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading employees. Please try again.
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No employees found.
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>List of restaurant employees</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell className="font-medium">{user.username}</TableCell>
            <TableCell>{getRoleBadge(user.roles)}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteClick(user.id)}
                disabled={user.roles.some(role => role.includes('ADMIN'))}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default EmployeeList;
