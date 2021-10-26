import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios, { AxiosError } from 'axios'
import _ from 'lodash'
import Membership from '../../models/api/Membership'
import Organization from '../../models/api/Organization'
import { Plan } from '../../models/api/Plan'
import PlanSubscription from '../../models/api/PlanSubscription'
import { Role } from '../../models/api/Role'
import { Loading } from '../../models/Loading'
import { RootState } from '../../store'
import { ErrorResponse, ValidationError } from '../../util/errors'
import { EditCleaningData } from '../manage/EditCleaningModal'
import { EditOrganizationIconData } from '../manage/EditOrganizationIconModal'
import { EditOrganizationNameData } from '../manage/EditOrganizationNameModal'
import { deleteClientDesksByOrganizationId } from '../desks/desksSlice'
import { deleteClientLocationsByOrganizationId } from '../desks/locationsSlice'
import { deleteClientSpacesByOrganizationId } from '../desks/spacesSlice'
import { deleteClientInvitationsByOrganizationId } from '../members/invitationsSlice'
import { deleteClientMembersByOrganizationId } from '../members/membersSlice'
import { ChangePlanData } from '../pricing-plan/ChangePlanPage'
import { deleteClientReservationsByOrganizationId } from '../reservations/reservationsSlice'

interface SyncMembershipRolesData {
  organizationId: string
  roles: Role[]
}

export const addMembership = createAction<Membership>('addMembership')
export const syncMembership = createAction<SyncMembershipRolesData>(
  'syncMembership'
)

export const fetchMemberships = createAsyncThunk<
  Record<string, Membership>,
  void,
  { state: RootState }
>(
  'memberships/fetch',
  async () => {
    const { data } = await axios.get<Membership[]>('/api/memberships')
    return _.mapKeys<Membership>(data, 'organization.id')
  },
  {
    condition: (_, { getState }) => {
      const loading = getState().memberships.loading
      if (loading === Loading.PENDING || loading === Loading.SUCCEEDED) {
        return false
      }
    },
  }
)

export const createOrganization = createAsyncThunk<
  Record<string, Membership>,
  FormData,
  { state: RootState; rejectValue: ValidationError[] }
>(
  'memberships/organization/create',
  async (createOrganizationData: FormData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post<Membership>(
        '/api/organizations',
        createOrganizationData
      )
      return _.mapKeys<Membership>([data], 'organization.id')
    } catch (err: any) {
      const error: AxiosError<ErrorResponse> = err
      if (!error.response) {
        throw err
      }
      return rejectWithValue(error.response.data.errors)
    }
  }
)

export const editOrganizationName = createAsyncThunk<
  undefined,
  EditOrganizationNameData,
  { state: RootState; rejectValue: ValidationError[] }
>(
  'memberships/organization/edit/name',
  async (
    editOrganizationNameData: EditOrganizationNameData,
    { rejectWithValue }
  ) => {
    try {
      await axios.put(
        `/api/organizations/${editOrganizationNameData.organizationId}/name`,
        editOrganizationNameData.body
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

export const editOrganizationIcon = createAsyncThunk(
  'memberships/organization/edit/icon',
  async (editOrganizationIconData: EditOrganizationIconData) => {
    const { data } = await axios.put<Organization>(
      `/api/organizations/${editOrganizationIconData.organizationId}/icon`,
      editOrganizationIconData.body
    )
    return data.iconUrl
  }
)

export const removeOrganizationIcon = createAsyncThunk(
  'memberships/organization/remove/icon',
  async (organizationId: string) => {
    await axios.delete(`/api/organizations/${organizationId}/icon`)
  }
)

export const editCleaning = createAsyncThunk(
  'memberships/organization/edit/cleaning',
  async (editCleaningData: EditCleaningData) => {
    const { data } = await axios.put<Organization>(
      `/api/organizations/${editCleaningData.organizationId}/cleaning`,
      editCleaningData.body
    )
    return data.cleaning
  }
)

export const refreshPlanSubscription = createAsyncThunk(
  'memberships/organization/refresh-plan-subscription',
  async (organizationId: string) => {
    const { data } = await axios.post<PlanSubscription>(
      `/api/organizations/${organizationId}/refresh-plan-subscription`
    )
    return data
  }
)

export const changePlan = createAsyncThunk(
  'memberships/organization/plan/change',
  async (changePlanData: ChangePlanData) => {
    await axios.put(
      `/api/organizations/${changePlanData.organizationId}/change-plan`,
      changePlanData.body
    )
  }
)

export const cancelPlan = createAsyncThunk(
  'memberships/organization/plan/cancel',
  async (organizationId: string) => {
    await axios.put(`/api/organizations/${organizationId}/cancel-plan`)
  }
)

export const deleteOrganization = createAsyncThunk(
  'memberships/organization/delete',
  async (organizationId: string, { dispatch }) => {
    await axios
      .delete<Organization>(`/api/organizations/${organizationId}`)
      .then(() => {
        dispatch(deleteClientReservationsByOrganizationId(organizationId))
        dispatch(deleteClientLocationsByOrganizationId(organizationId))
        dispatch(deleteClientSpacesByOrganizationId(organizationId))
        dispatch(deleteClientDesksByOrganizationId(organizationId))
        dispatch(deleteClientInvitationsByOrganizationId(organizationId))
        dispatch(deleteClientMembersByOrganizationId(organizationId))
      })
  }
)

interface MembershipsState {
  loading: Loading
  entity: Record<string, Membership>
}

const initialState: MembershipsState = { loading: Loading.IDLE, entity: {} }

export const memberships = createSlice({
  name: 'memberships',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMemberships.pending, (state) => {
      state.loading = Loading.PENDING
    })
    builder.addCase(fetchMemberships.fulfilled, (state, action) => {
      state.loading = Loading.SUCCEEDED
      state.entity = action.payload
    })
    builder.addCase(fetchMemberships.rejected, (state) => {
      state.loading = Loading.FAILED
    })

    builder.addCase(createOrganization.fulfilled, (state, action) => {
      state.entity = { ...state.entity, ...action.payload }
    })
    builder.addCase(editOrganizationName.fulfilled, (state, action) => {
      state.entity[action.meta.arg.organizationId].organization.name =
        action.meta.arg.body.name
    })
    builder.addCase(editOrganizationIcon.fulfilled, (state, action) => {
      state.entity[action.meta.arg.organizationId].organization.iconUrl =
        action.payload
    })
    builder.addCase(removeOrganizationIcon.fulfilled, (state, action) => {
      state.entity[action.meta.arg].organization.iconUrl = undefined
    })
    builder.addCase(editCleaning.fulfilled, (state, action) => {
      state.entity[action.meta.arg.organizationId].organization.cleaning =
        action.payload
    })
    builder.addCase(refreshPlanSubscription.fulfilled, (state, action) => {
      state.entity[action.meta.arg].organization.plan = action.payload.plan
      state.entity[action.meta.arg].organization.subscription = action.payload
        .subscription as any
    })
    builder.addCase(changePlan.fulfilled, (state, action) => {
      state.entity[action.meta.arg.organizationId].organization.plan =
        action.meta.arg.body.plan
    })
    builder.addCase(cancelPlan.fulfilled, (state, action) => {
      state.entity[action.meta.arg].organization.plan = Plan.FREE
      state.entity[action.meta.arg].organization.subscription = undefined
    })
    builder.addCase(deleteOrganization.fulfilled, (state, action) => {
      state.entity = _.omit(state.entity, action.meta.arg)
    })

    builder.addCase(addMembership, (state, action) => {
      state.entity[action.payload.organization.id] = action.payload
    })
    builder.addCase(syncMembership, (state, action) => {
      state.entity[action.payload.organizationId].roles = action.payload.roles
    })
  },
})
