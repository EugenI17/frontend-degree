
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { userService, CreateUserDto } from '@/services/userService';

interface AddEmployeeFormProps {
  onSuccess: () => void;
}

const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const queryClient = useQueryClient();

  // Create user mutation
  const { mutate: createUser, isPending: isCreating } = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setUsername('');
      setPassword('');
      toast.success('Employee created successfully!');
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Failed to create employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Handle form submission
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Username and password are required');
      return;
    }
    
    createUser({ username, password });
  };

  return (
    <form onSubmit={handleAddEmployee} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
        />
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Create Employee'}
        </Button>
      </div>
    </form>
  );
};

export default AddEmployeeForm;
