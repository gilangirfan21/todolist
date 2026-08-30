import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as authService from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const session = ref(null)
  const loading = ref(true)
  const error = ref(null)

  async function init() {
    const { data } = await authService.getSession()
    session.value = data.session
    user.value = data.session?.user ?? null
    loading.value = false

    authService.onAuthStateChange((_event, newSession) => {
      session.value = newSession
      user.value = newSession?.user ?? null
    })
  }

  async function signUp(email, password) {
    error.value = null
    const { data, error: err } = await authService.signUp(email, password)
    if (err) {
      error.value = err.message
      throw err
    }
    session.value = data.session
    user.value = data.user
    return data
  }

  async function signIn(email, password) {
    error.value = null
    const { data, error: err } = await authService.signIn(email, password)
    if (err) {
      error.value = err.message
      throw err
    }
    session.value = data.session
    user.value = data.user
    return data
  }

  async function signOut() {
    await authService.signOut()
    session.value = null
    user.value = null
  }

  return { user, session, loading, error, init, signUp, signIn, signOut }
})
