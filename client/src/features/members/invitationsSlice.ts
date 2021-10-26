import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios, { AxiosError } from 'axios'
import _ from 'lodash'
import Invitation from '../../models/api/Invitation'
import { Loading } from '../../models/Loading'
import { RootState } from '../../store'
import { ErrorResponse, ValidationError } from '../../util/errors'
import { InviteData } from './InviteModal'

export const deleteClientInvitationsByOrganizationId = createAction<string>(
  'deleteClientInvitationsByOrganizationId'
)
export const resetInvitations = createAction('resetInvitations')

export const fetchInvitations = createAsyncThunk<
  Record<string, Invitation>,
  string[],
  { state: RootState }
>(
  'invitations/fetch',
  async (organizationIds: string[]) => {
    const { data } = await axios.get<Invitation[]>(
      `/api/invitations?organizationIds=${organizationIds.join(',')}`
    )
    return _.mapKeys<Invitation>(data, 'id')
  },
  {
    condition: (_, { getState }) => {
      const loading = getState().invitations.loading
      if (loading === Loading.PENDING || loading === Loading.SUCCEEDED) {
        return false
      }
    },
  }
)

export const updateInvitations = createAsyncThunk<
  Record<string, Invitation>,
  string[],
  { state: RootState }
>(
  'invitations/update',
  async (organizationIds: string[]) => {
    const { data } = await axios.get<Invitation[]>(
      `/api/invitations?organizationIds=${organizationIds.join(',')}`
    )
    return _.mapKeys<Invitation>(data, 'id')
  },
  {
    condition: (_, { getState }) => {
      const loading = getState().invitations.loading
      if (loading === Loading.IDLE || loading === Loading.PENDING) {
        return false
      }
    },
  }
)

export const createInvitations = createAsyncThunk<
  Record<string, Invitation>,
  InviteData,
  { state: RootState; rejectValue: ValidationError[] }
>('invitations/create', async (inviteData: InviteData, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<Invitation[]>(
      `/api/organizations/${inviteData.organizationId}/invitations`,
      { emails: inviteData.emails }
    )
    return _.mapKeys<Invitation>(data, 'id')
  } catch (err: any) {
    const error: AxiosError<ErrorResponse> = err
    if (!error.response) {
      throw err
    }
    return rejectWithValue(error.response.data.errors)
  }
})

export const cancelInvitation = createAsyncThunk(
  'invitations/cancel',
  async (invitationId: string) => {
    await axios.delete(`/api/invitations/${invitationId}`)
  }
)

interface InvitationsState {
  loading: Loading
  entity: Record<string, Invitation>
}

const initialState: InvitationsState = { loading: Loading.IDLE, entity: {} }

export const invitations = createSlice({
  name: 'invitations',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchInvitations.pending, (state) => {
      state.loading = Loading.PENDING
    })
    builder.addCase(fetchInvitations.fulfilled, (state, action) => {
      state.loading = Loading.SUCCEEDED
      state.entity = action.payload
    })
    builder.addCase(fetchInvitations.rejected, (state) => {
      state.loading = Loading.FAILED
    })
    builder.addCase(updateInvitations.fulfilled, (state, action) => {
      state.loading = Loading.SUCCEEDED
      state.entity = action.payload
    })
    builder.addCase(createInvitations.fulfilled, (state, action) => {
      state.entity = {
        ...state.entity,
        ...action.payload,
      }
    })
    builder.addCase(cancelInvitation.fulfilled, (state, action) => {
      state.entity = _.omit(state.entity, action.meta.arg)
    })
    builder.addCase(
      deleteClientInvitationsByOrganizationId,
      (state, action) => {
        state.entity = _.omitBy(
          state.entity,
          (invitation) => invitation.organizationId === action.payload
        )
      }
    )
    builder.addCase(resetInvitations, (state) => {
      state.loading = Loading.IDLE
      state.entity = {}
    })
  },
})
