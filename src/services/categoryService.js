import { supabase } from '../lib/supabase'

export async function fetchCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) throw error
  return data
}

export async function createCategory(category) {
  const { data, error } = await supabase.from('categories').insert(category).select().single()
  if (error) throw error
  return data
}

export async function updateCategory(id, changes) {
  const { data, error } = await supabase.from('categories').update(changes).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}
