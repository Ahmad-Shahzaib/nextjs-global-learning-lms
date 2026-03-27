import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/redux/hooks';
import { fetchStaffs } from '@/store/redux/thunks/staffsThunk';
import CommonTable, { ColumnDef } from '@/components/common/CommonTable';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const statusColor: Record<string, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  inactive: 'secondary',
  banned: 'destructive',
};

const roleColor: Record<string, 'default' | 'secondary' | 'destructive'> = {
  admin: 'default',
  education: 'secondary',
};

const AllStaff = () => {
  const dispatch = useAppDispatch();
  const { staffs, loading, error } = useAppSelector((state) => state.staffs);

  useEffect(() => {
    dispatch(fetchStaffs());
  }, [dispatch]);

  const columns: ColumnDef<any>[] = [
    {
      header: 'Avatar',
      accessor: (row) => (
        <Avatar>
          {row.avatar ? (
            <AvatarImage src={row.avatar} alt={row.full_name} />
          ) : (
            <AvatarFallback>{row.full_name?.[0] || '?'}</AvatarFallback>
          )}
        </Avatar>
      ),
      className: 'w-16',
    },
    { header: 'Name', accessor: 'full_name', className: 'font-semibold' },
    { header: 'Email', accessor: 'email' },
    { header: 'Mobile', accessor: 'mobile' },
    {
      header: 'Role',
      accessor: (row) => (
        <Badge variant={roleColor[row.role_name] || 'secondary'}>{row.role_name}</Badge>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={statusColor[row.status] || 'secondary'}>{row.status}</Badge>
      ),
    },
    {
      header: 'Joined',
      accessor: (row) => {
        const date = new Date(Number(row.created_at) * 1000);
        return date.toLocaleDateString();
      },
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-left">All Staff</h1>
      <div className="bg-white rounded-lg shadow p-4">
        <CommonTable
          columns={columns}
          data={staffs}
          loading={loading}
          emptyMessage={error || 'No staff found.'}
          rowKey={(row) => row.id}
        />
      </div>
    </div>
  );
};

export default AllStaff;