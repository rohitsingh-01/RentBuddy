import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserProfile {
  id?: string
  name?: string
  email?: string
  image?: string
  isVerified?: boolean
  rentItsSignedUp?: boolean
  universityName?: string
  phoneNumber?: string
  phoneVerified?: boolean
  profile?: {
    bio?: string
    budget?: { min: number; max: number }
    moveInDate?: string
    location?: string
    course?: string
    year?: number
    lifestyle?: {
      sleepTime?: string
      cleanliness?: string
      noise?: string
      guests?: string
      smoking?: boolean
      pets?: boolean
    }
  }
}

interface AppState {
  user: UserProfile | null
  profileComplete: boolean
  setUser: (u: UserProfile | null) => void
  updateUser: (patch: Partial<UserProfile>) => void
  setProfileComplete: (v: boolean) => void

  // Splits
  activeSplitId: string | null
  setActiveSplitId: (id: string | null) => void

  // UI
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      profileComplete: false,
      setUser: (u) => set({ user: u }),
      updateUser: (patch) =>
        set({ user: get().user ? { ...get().user!, ...patch } : patch }),
      setProfileComplete: (v) => set({ profileComplete: v }),

      activeSplitId: null,
      setActiveSplitId: (id) => set({ activeSplitId: id }),

      sidebarOpen: true,
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
    }),
    {
      name: 'rentbuddy-store',
      partialize: (state) => ({
        activeSplitId: state.activeSplitId,
        profileComplete: state.profileComplete,
      }),
    }
  )
)
