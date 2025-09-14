-- Function to handle new user profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$;

-- Trigger to auto-create profile on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to update room participant count
create or replace function public.update_room_participant_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    update public.rooms 
    set current_participants = current_participants + 1,
        updated_at = now()
    where id = NEW.room_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update public.rooms 
    set current_participants = current_participants - 1,
        updated_at = now()
    where id = OLD.room_id;
    return OLD;
  end if;
  return null;
end;
$$;

-- Triggers for room participant count
drop trigger if exists on_room_participant_added on public.room_participants;
create trigger on_room_participant_added
  after insert on public.room_participants
  for each row
  execute function public.update_room_participant_count();

drop trigger if exists on_room_participant_removed on public.room_participants;
create trigger on_room_participant_removed
  after delete on public.room_participants
  for each row
  execute function public.update_room_participant_count();

-- Function to update timestamps
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  NEW.updated_at = timezone('utc'::text, now());
  return NEW;
end;
$$;

-- Triggers for updated_at timestamps
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at_column();

create trigger update_rooms_updated_at before update on public.rooms
  for each row execute function public.update_updated_at_column();
