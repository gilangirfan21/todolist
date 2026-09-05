import { supabase } from '../lib/supabase'

export async function fetchSubtasks() {
  const { data, error } = await supabase
    .from('subtasks')
    .select('*')
    .order('position', { ascending: true })
  if (error) throw error
  return data
}

export async function createSubtask(subtask) {
  const { data, error } = await supabase.from('subtasks').insert(subtask).select().single()
  if (error) throw error
  return data
}

export async function updateSubtask(id, changes) {
  const { data, error } = await supabase
    .from('subtasks')
    .update(changes)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteSubtask(id) {
  const { error } = await supabase.from('subtasks').delete().eq('id', id)
  if (error) throw error
}

export async function reorderSubtasks(items) {
  const results = await Promise.all(
    items.map(({ id, position }) => supabase.from('subtasks').update({ position }).eq('id', id)),
  )
  const failed = results.find((r) => r.error)
  if (failed) throw failed.error
}
