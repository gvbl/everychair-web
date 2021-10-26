import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios, { AxiosError } from 'axios'
import User from '../../models/api/User'
import { Loading } from '../../models/Loading'
import { RootState } from '../../store'
import { ErrorResponse, ValidationError } from '../../util/errors'
import { ChangePasswordData } from '../settings/ChangePasswordModal'
import { DeleteAccountData } from '../settings/DeleteAccountModal'
import { EditAvatarData } from '../settings/EditAvatarModal'
import { EditNameData } from '../settings/EditNameModal'
import { AuthData } from './AuthForm'

interface PersonalName {
  firstName: string
  lastName: string
}

export const syncEmailConfirmed = createAction('syncEmailConfirmed')
export const syncPersonalName = createAction<PersonalName>('syncPersonalName')

export const logout = createAction('logout')

export const fetchUser = createAsyncThunk<User, void, { state: RootState }>(
  'user/fetch',
  async () => {
    const { data } = await axios.get<User>('/api/users/current')
    return data
  },
  {
    condition: (_, { getState }) => {
      const loading = getState().user.loading
      if (loading === Loading.PENDING || loading === Loading.SUCCEEDED) {
        return false
      }
    },
  }
)

export const signUp = createAsyncThunk<
  User,
  AuthData,
  { state: RootState; rejectValue: ValidationError[] }
>('user/signup', async (authData: AuthData, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<User>('/api/signup/local', authData)
    return data
  } catch (err: any) {
    const error: AxiosError<ErrorResponse> = err
    if (!error.response) {
      throw err
    }
    return rejectWithValue(error.response.data.errors)
  }
})

export const logIn = createAsyncThunk<
  User,
  AuthData,
  { state: RootState; rejectValue: ValidationError[] }
>('user/login', async (authData: AuthData, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<User>('/api/login/local', authData)
    return data
  } catch (err: any) {
    const error: AxiosError<ErrorResponse> = err
    if (!error.response) {
      throw err
    }
    return rejectWithValue(error.response.data.errors)
  }
})

export const changePassword = createAsyncThunk<
  undefined,
  ChangePasswordData,
  {
    rejectValue: ValidationError[]
  }
>(
  'user/change/password',
  async (changePasswordData: ChangePasswordData, { rejectWithValue }) => {
    try {
      await axios.put(
        `/api/users/${changePasswordData.userId}/password`,
        changePasswordData.body
      )
    } catch (err: any) {
      const error: AxiosError<ErrorResponse> = err
      if (!error.response) {
        throw err
      }
      return rejectWithValue(error.response.data.errors)
    }
  }
)

export const editName = createAsyncThunk<
  undefined,
  EditNameData,
  {
    rejectValue: ValidationError[]
  }
>('user/edit/name', async (editNameData: EditNameData, { rejectWithValue }) => {
  try {
    await axios.put(`/api/users/${editNameData.userId}/name`, editNameData.body)
  } catch (err: any) {
    const error: AxiosError<ErrorResponse> = err
    if (!error.response) {
      throw err
    }
    return rejectWithValue(error.response.data.errors)
  }
})

export const editAvatar = createAsyncThunk(
  'user/edit/avatar',
  async (editAvatarData: EditAvatarData) => {
    const { data } = await axios.put<User>(
      `/api/users/${editAvatarData.userId}/avatar`,
      editAvatarData.body
    )
    return data.avatarUrl
  }
)

export const removeAvatar = createAsyncThunk(
  'user/remove/avatar',
  async (userId: string) => {
    await axios.delete(`/api/users/${userId}/avatar`)
  }
)

export const deleteAccount = createAsyncThunk<
  undefined,
  DeleteAccountData,
  {
    rejectValue: ValidationError[]
  }
>(
  'user/delete/account',
  async (deleteAccountData: DeleteAccountData, { rejectWithValue }) => {
    try {
      await axios.post<User>(
        `/api/users/${deleteAccountData.userId}/delete-account`,
        deleteAccountData.body
      )
    } catch (err: any) {
      const error: AxiosError<ErrorResponse> = err
      if (!error.response) {
        throw err
      }
      return rejectWithValue(error.response.data.errors)
    }
  }
)

interface UserState {
  loading: Loading
  entity?: User
}

const initialState: UserState = { loading: Loading.IDLE }

export const users = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUser.pending, (state) => {
      state.loading = Loading.PENDING
    })
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      state.loading = Loading.SUCCEEDED
      state.entity = action.payload
    })
    builder.addCase(fetchUser.rejected, (state) => {
      state.loading = Loading.FAILED
    })

    builder.addCase(signUp.fulfilled, (state, action) => {
      state.entity = action.payload
    })

    builder.addCase(logIn.fulfilled, (state, action) => {
      state.entity = action.payload
    })

    builder.addCase(editName.fulfilled, (state, action) => {
      if (!state.entity) {
        return
      }
      state.entity.firstName = action.meta.arg.body.firstName
      state.entity.lastName = action.meta.arg.body.lastName
    })
    builder.addCase(editAvatar.fulfilled, (state, action) => {
      if (!state.entity) {
        return
      }
      state.entity.avatarUrl = action.payload
    })
    builder.addCase(removeAvatar.fulfilled, (state) => {
      if (!state.entity) {
        return
      }
      state.entity.avatarUrl = undefined
    })
    builder.addCase(syncEmailConfirmed, (state) => {
      if (!state.entity) {
        return
      }
      state.entity.emailConfirmed = true
    })
    builder.addCase(syncPersonalName, (state, action) => {
      if (!state.entity) {
        return
      }
      state.entity.firstName = action.payload.firstName
      state.entity.lastName = action.payload.lastName
    })
  },
})
