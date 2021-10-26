import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import _ from 'lodash'
import Member from '../../models/api/Member'
import { Loading } from '../../models/Loading'
import { RootState } from '../../store'
import { SyncSelfMemberAvatarUrlData } from '../settings/EditAvatarModal'
import { SyncSelfMemberNameData } from '../settings/EditNameModal'
import { EditRolesData } from './EditRolesModal'

export const syncFormerCleaningMembers = createAction<Member[]>(
  'syncFormerCleaningMembers'
)
export const syncSelfMemberName = createAction<SyncSelfMemberNameData>(
  'syncSelfMemberName'
)
export const syncSelfMemberAvatarUrl = createAction<SyncSelfMemberAvatarUrlData>(
  'syncSelfMemberAvatarUrl'
)
export const deleteClientMembersByOrganizationId = createAction<string>(
  'deleteClientMembersByOrganizationId'
)
export const resetMembers = createAction('resetMembers')

export const fetchMembers = createAsyncThunk<
  Record<string, Member>,
  string[],
  { state: RootState }
>(
  'members/fetch',
  async (organizationIds: string[]) => {
    const { data } = await axios.get<Member[]>(
      `/api/members?organizationIds=${organizationIds.join(',')}`
    )
    return _.mapKeys<Member>(data, 'membershipId')
  },
  {
    condition: (_, { getState }) => {
      const loading = getState().members.loading
      if (loading === Loading.PENDING || loading === Loading.SUCCEEDED) {
        return false
      }
    },
  }
)

export const updateMembers = createAsyncThunk<
  Record<string, Member>,
  string[],
  { state: RootState }
>(
  'members/update',
  async (organizationIds: string[]) => {
    const { data } = await axios.get<Member[]>(
      `/api/members?organizationIds=${organizationIds.join(',')}`
    )
    return _.mapKeys<Member>(data, 'membershipId')
  },
  {
    condition: (_, { getState }) => {
      const loading = getState().members.loading
      if (loading === Loading.IDLE || loading === Loading.PENDING) {
        return false
      }
    },
  }
)

export const removeMember = createAsyncThunk(
  'members/remove',
  async (membershipId: string) => {
    await axios.delete(`/api/memberships/${membershipId}`)
  }
)

export const editRoles = createAsyncThunk(
  'members/edit/roles',
  async (editRolesData: EditRolesData) => {
    await axios.put(
      `/api/memberships/${editRolesData.membershipId}/roles`,
      editRolesData.body
    )
  }
)

interface MembersState {
  loading: Loading
  entity: Record<string, Member>
}

const initialState: MembersState = { loading: Loading.IDLE, entity: {} }

export const members = createSlice({
  name: 'members',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMembers.pending, (state) => {
      state.loading = Loading.PENDING
    })
    builder.addCase(fetchMembers.fulfilled, (state, action) => {
      state.loading = Loading.SUCCEEDED
      state.entity = action.payload
    })
    builder.addCase(fetchMembers.rejected, (state) => {
      state.loading = Loading.FAILED
    })
    builder.addCase(updateMembers.fulfilled, (state, action) => {
      state.loading = Loading.SUCCEEDED
      state.entity = action.payload
    })
    builder.addCase(removeMember.fulfilled, (state, action) => {
      state.entity = _.omit(state.entity, action.meta.arg)
    })
    builder.addCase(editRoles.fulfilled, (state, action) => {
      state.entity[action.meta.arg.membershipId].roles =
        action.meta.arg.body.roles
    })
    builder.addCase(syncFormerCleaningMembers, (state, action) => {
      const mapFormerCleaningMembers = _.mapKeys<Member>(action.payload, 'id')
      state.entity = {
        ...state.entity,
        ...mapFormerCleaningMembers,
      }
    })
    builder.addCase(syncSelfMemberName, (state, action) => {
      state.entity[action.payload.membershipId].firstName =
        action.payload.firstName
      state.entity[action.payload.membershipId].lastName =
        action.payload.lastName
    })
    builder.addCase(syncSelfMemberAvatarUrl, (state, action) => {
      state.entity[action.payload.membershipId].avatarUrl =
        action.payload.avatarUrl
    })
    builder.addCase(deleteClientMembersByOrganizationId, (state, action) => {
      state.entity = _.omitBy(
        state.entity,
        (member) => member.organizationId === action.payload
      )
    })
    builder.addCase(resetMembers, (state) => {
      state.loading = Loading.IDLE
      state.entity = {}
    })
  },
})
