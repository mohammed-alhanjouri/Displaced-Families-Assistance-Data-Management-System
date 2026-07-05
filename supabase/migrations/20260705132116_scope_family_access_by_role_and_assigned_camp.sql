drop policy if exists "Authenticated users can read families" on public.families;
drop policy if exists "Active data entry staff can update their registered families" on public.families;

create policy "Managers can read all families"
on public.families for select to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.status = 'active'::public.account_status
      and p.user_role in (
        'system_administrator'::public.user_role,
        'organization_manager'::public.user_role
      )
  )
);

create policy "Data entry can read families in assigned camp"
on public.families for select to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.status = 'active'::public.account_status
      and p.user_role = 'data_entry_staff'::public.user_role
      and p.assigned_camp_id = families.current_camp_id
  )
);

create policy "Data entry can update families in assigned camp"
on public.families for update to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.status = 'active'::public.account_status
      and p.user_role = 'data_entry_staff'::public.user_role
      and p.assigned_camp_id = families.current_camp_id
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.status = 'active'::public.account_status
      and p.user_role = 'data_entry_staff'::public.user_role
      and p.assigned_camp_id = families.current_camp_id
  )
);
