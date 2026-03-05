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
import { Textarea } from '@/components/ui/textarea';

import { getStoryRequirementsColumns } from '@/components/Admin/StoryRequirementsColumns';

import { useAdminPreferences } from '@/hooks/useAdminPreferences';

import type { StoryRequirementCategory } from '@/db/queries/settings';

type RequirementForm = {
  key: string;
  label: string;
  count: number;
  template: string;
  options: string;
};

const emptyForm: RequirementForm = {
  key: '',
  label: '',
  count: 1,
  template: '',
  options: '',
};

function formFromCategory(cat: StoryRequirementCategory): RequirementForm {
  return {
    key: cat.key,
    label: cat.label,
    count: cat.count,
    template: cat.template,
    options: cat.options.map(String).join('\n'),
  };
}

function parseOptions(optionsStr: string): (string | number)[] {
  return optionsStr
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const num = Number(s);

      return isNaN(num) ? s : num;
    });
}

export function StoryRequirementsTable() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RequirementForm>(emptyForm);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { storyRequirementsSorting: sorting, setStoryRequirementsSorting: setSorting } =
    useAdminPreferences();

  const { data: categories = [], isLoading } = useQuery<StoryRequirementCategory[]>({
    queryKey: ['admin-story-requirements'],
    queryFn: async () => {
      const res = await fetch('/api/admin/settings/story-requirements');
      if (!res.ok) throw new Error('Failed to fetch');

      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (
      data: { id?: string } & Omit<RequirementForm, 'options'> & { options: (string | number)[] },
    ) => {
      const url = data.id
        ? `/api/admin/settings/story-requirements/${data.id}`
        : '/api/admin/settings/story-requirements';
      const res = await fetch(url, {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to save');

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-story-requirements'] });
      queryClient.invalidateQueries({ queryKey: ['config'] });
      setDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/settings/story-requirements/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-story-requirements'] });
      queryClient.invalidateQueries({ queryKey: ['config'] });
    },
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (cat: StoryRequirementCategory) => {
    setEditingId(cat.id);
    setForm(formFromCategory(cat));
    setDialogOpen(true);
  };

  const handleSave = () => {
    const options = parseOptions(form.options);
    saveMutation.mutate({
      id: editingId ?? undefined,
      key: form.key,
      label: form.label,
      count: form.count,
      template: form.template,
      options,
    });
  };

  const openDeleteConfirm = (id: string) => setDeleteTargetId(id);
  const closeDeleteConfirm = () => setDeleteTargetId(null);
  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId);
      closeDeleteConfirm();
    }
  };

  const columns = getStoryRequirementsColumns(openEdit, openDeleteConfirm);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns non-memoizable functions
  const table = useReactTable({
    data: categories,
    columns,
    state: { sorting },
    onSortingChange: (updaterOrValue) =>
      setSorting(typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading)
    return (
      <div className='text-center p-8 text-muted-foreground'>Loading story requirements...</div>
    );

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Story Requirements ({categories.length})</h3>
        <Button size='sm' onClick={openCreate}>
          <Plus className='size-4 mr-1' />
          Add Category
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
                No requirement categories configured.
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
            <AlertDialogTitle>Delete requirement category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the requirement category.
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
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Requirement Category' : 'Add Requirement Category'}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='req-key'>Key</Label>
                <Input
                  id='req-key'
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value })}
                  placeholder='e.g. tones'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='req-label'>Label</Label>
                <Input
                  id='req-label'
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder='e.g. Tones to incorporate'
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='req-count'>Pick Count</Label>
              <Input
                id='req-count'
                type='number'
                min={1}
                value={form.count}
                onChange={(e) => setForm({ ...form, count: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='req-template'>Template</Label>
              <Input
                id='req-template'
                value={form.template}
                onChange={(e) => setForm({ ...form, template: e.target.value })}
                placeholder='e.g. Use these tones: {value}'
              />
              <p className='text-xs text-muted-foreground'>
                Use {'{value}'} for the selected option(s) and {'{plural}'} for conditional plural
                suffix.
              </p>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='req-options'>Options (one per line)</Label>
              <Textarea
                id='req-options'
                value={form.options}
                onChange={(e) => setForm({ ...form, options: e.target.value })}
                placeholder={'excitement\nanger\njoy'}
                rows={3}
                className='min-h-[5.5rem] max-h-[8.5rem] overflow-y-auto'
              />
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
