import { supabase } from '../lib/supabase'

export async function fetchTodos() {
  const { data, error } = await supabase
    .from('todos')
    .select('*, category:categories(id, name, color)')
    .order('position', { ascending: true })
  if (error) throw error
  return data
}

export async function createTodo(todo) {
  const { data, error } = await supabase
    .from('todos')
    .insert(todo)
    .select('*, category:categories(id, name, color)')
    .single()
  if (error) throw error
  return data
}

export async function updateTodo(id, changes) {
  const { data, error } = await supabase
    .from('todos')
    .update(changes)
    .eq('id', id)
    .select('*, category:categories(id, name, color)')
    .single()
  if (error) throw error
  return data
}

export async function deleteTodo(id) {
  const { error } = await supabase.from('todos').delete().eq('id', id)
  if (error) throw error
}

export async function reorderTodos(items) {
  const results = await Promise.all(
    items.map(({ id, position }) => supabase.from('todos').update({ position }).eq('id', id)),
  )
  const failed = results.find((r) => r.error)
  if (failed) throw failed.error
}
