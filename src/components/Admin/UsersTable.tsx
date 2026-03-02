import { Check, X } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { DashboardUser } from '@/types';

function PermissionBadge({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <Check className='inline-block size-4 text-green-500' />
  ) : (
    <X className='inline-block size-4 text-muted-foreground/40' />
  );
}

export default function UsersTable({
  users,
  isLoading,
}: {
  users: DashboardUser[] | undefined;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>All registered accounts and their permissions.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='h-48 w-full animate-pulse rounded bg-muted' />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className='text-center'>Admin</TableHead>
                <TableHead className='text-center'>Stories</TableHead>
                <TableHead className='text-center'>Audio</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className='font-medium'>{u.name}</TableCell>
                  <TableCell className='text-muted-foreground'>{u.email}</TableCell>
                  <TableCell className='text-center'>
                    <PermissionBadge enabled={u.isAdmin} />
                  </TableCell>
                  <TableCell className='text-center'>
                    <PermissionBadge enabled={u.canCreateStory} />
                  </TableCell>
                  <TableCell className='text-center'>
                    <PermissionBadge enabled={u.canCreateAudio} />
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {new Date(u.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
