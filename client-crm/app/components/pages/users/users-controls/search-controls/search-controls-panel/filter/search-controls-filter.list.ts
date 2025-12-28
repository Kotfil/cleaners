/**
 * List of user status filter options
 */
export const USER_STATUS_FILTER_OPTIONS: Array<{
  value: 'active' | 'suspended' | 'archived' | null;
  label: string;
}> = [
  { value: null, label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'archived', label: 'Archived' },
];

