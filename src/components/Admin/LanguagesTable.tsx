'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { getLanguagesColumns } from '@/components/Admin/LanguagesColumns';

import { useAdminPreferences } from '@/hooks/useAdminPreferences';

import type { LanguageWithStoryCount } from '@/db/queries/settings';

type LanguageForm = {
  name: string;
  languageCode: string;
  googleCloudTts: boolean;
  active: boolean;
};

const emptyForm: LanguageForm = {
  name: '',
  languageCode: '',
  googleCloudTts: false,
  active: true,
};

export function LanguagesTable() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LanguageForm>(emptyForm);
  const { languagesSorting: sorting, setLanguagesSorting: setSorting } = useAdminPreferences();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { data: languages = [], isLoading } = useQuery<LanguageWithStoryCount[]>({
    queryKey: ['admin-languages'],
    queryFn: async () => {
      const res = await fetch('/api/admin/settings/languages');
      if (!res.ok) throw new Error('Failed to fetch');

      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: LanguageForm & { id?: string }) => {
      const url = data.id
        ? `/api/admin/settings/languages/${data.id}`
        : '/api/admin/settings/languages';
      const res = await fetch(url, {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save');

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-languages'] });
      queryClient.invalidateQueries({ queryKey: ['config'] });
      setDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/settings/languages/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-languages'] });
      queryClient.invalidateQueries({ queryKey: ['config'] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await fetch(`/api/admin/settings/languages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error('Failed to update');

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-languages'] });
      queryClient.invalidateQueries({ queryKey: ['config'] });
    },
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (lang: LanguageWithStoryCount) => {
    setEditingId(lang.id);
    setForm({
      name: lang.name,
      languageCode: lang.languageCode,
      googleCloudTts: lang.googleCloudTts,
      active: lang.active,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate({ ...form, id: editingId ?? undefined });
  };

  const toggleActive = (id: string, active: boolean) => {
    toggleActiveMutation.mutate({ id, active });
  };

  const openDeleteConfirm = (id: string) => setDeleteTargetId(id);
  const closeDeleteConfirm = () => setDeleteTargetId(null);
  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId);
      closeDeleteConfirm();
    }
  };

  const columns = getLanguagesColumns(openEdit, openDeleteConfirm, toggleActive);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns non-memoizable functions
  const table = useReactTable({
    data: languages,
    columns,
    state: { sorting },
    onSortingChange: (updaterOrValue) =>
      setSorting(typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading)
    return <div className='text-center p-8 text-muted-foreground'>Loading languages...</div>;

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Languages ({languages.length})</h3>
        <Button size='sm' onClick={openCreate}>
          <Plus className='size-4 mr-1' />
          Add Language
        </Button>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className='text-center text-muted-foreground'>
                No languages configured.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && closeDeleteConfirm()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete language?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the language.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant='destructive' onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Language' : 'Add Language'}</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='lang-name'>Name</Label>
              <Input
                id='lang-name'
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder='e.g. German'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='lang-code'>Language Code</Label>
              <Input
                id='lang-code'
                value={form.languageCode}
                onChange={(e) => setForm({ ...form, languageCode: e.target.value })}
                placeholder='e.g. de-DE'
              />
              <p className='text-xs text-muted-foreground'>
                Use a{' '}
                <a
                  href='https://gist.github.com/typpo/b2b828a35e683b9bf8db91b5404f1bd1'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-500 hover:underline'
                >
                  BCP47 language tag
                </a>
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='lang-tts'
                checked={form.googleCloudTts}
                onChange={(e) => setForm({ ...form, googleCloudTts: e.target.checked })}
              />
              <Label htmlFor='lang-tts'>Google Cloud TTS supported</Label>
            </div>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='lang-active'
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              <Label htmlFor='lang-active'>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
