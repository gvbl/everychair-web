import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios, { AxiosError } from 'axios'
import _ from 'lodash'
import Desk from '../../models/api/Desk'
import { Loading } from '../../models/Loading'
import { RootState } from '../../store'
import { ErrorResponse, ValidationError } from '../../util/errors'
import { deleteClientReservationsByDeskId } from '../reservations/reservationsSlice'
import { AddDeskData } from './AddDeskModal'

export const deleteClientDesksByOrganizationId = createAction<string>(
  'deleteClientDesksByOrganizationId'
)
export const deleteClientDesksByLocationId = createAction<string>(
  'deleteClientDesksByLocationId'
)
export const deleteClientDesksBySpaceId = createAction<string>(
  'deleteClientDesksBySpaceId'
)
export const resetDesks = createAction('resetDesks')

export const fetchDesks = createAsyncThunk<
  Record<string, Desk>,
  string[],
  { state: RootState; rejectValue: AxiosError }
>(
  'desks/fetch',
  async (organizationIds: string[]) => {
    const { data } = await axios.get<Desk[]>(
      `/api/desks?organizationIds=${organizationIds.join(',')}`
    )
    return _.mapKeys<Desk>(data, 'id')
  },
  {
    condition: (_, { getState }) => {
      const loading = getState().desks.loading
      if (loading === Loading.PENDING || loading === Loading.SUCCEEDED) {
        return false
      }
    },
  }
)

export const updateDesks = createAsyncThunk<
  Record<string, Desk>,
  string[],
  { state: RootState; rejectValue: AxiosError }
>(
  'desks/update',
  async (organizationIds: string[]) => {
    const { data } = await axios.get<Desk[]>(
      `/api/desks?organizationIds=${organizationIds.join(',')}`
    )
    return _.mapKeys<Desk>(data, 'id')
  },
  {
    condition: (_, { getState }) => {
      const loading = getState().desks.loading
      if (loading === Loading.IDLE || loading === Loading.PENDING) {
        return false
      }
    },
  }
)

export const addDesk = createAsyncThunk<
  Record<string, Desk>,
  AddDeskData,
  { state: RootState; rejectValue: ValidationError[] }
>('desks/add', async (addDeskData: AddDeskData, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<Desk>(
      `/api/organizations/${addDeskData.organizationId}/locations/${addDeskData.locationId}/spaces/${addDeskData.spaceId}/desks`,
      addDeskData.formData
    )
    const map: Record<string, Desk> = {}
    map[data.id] = data
    return map
  } catch (err: any) {
    const error: AxiosError<ErrorResponse> = err
    if (!error.response) {
      throw err
    }
    return rejectWithValue(error.response.data.errors)
  }
})

export const deleteDesk = createAsyncThunk(
  'desks/delete',
  async (deskId: string, { dispatch }) => {
    axios.delete(`/api/desks/${deskId}`).then(() => {
      dispatch(deleteClientReservationsByDeskId(deskId))
    })
  }
)

interface DesksState {
  entity: Record<string, Desk>
  loading: Loading
}

const initialState: DesksState = {
  entity: {},
  loading: Loading.IDLE,
}

export const desks = createSlice({
  name: 'desks',
  initialState: initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder.addCase(fetchDesks.pending, (state) => {
      state.loading = Loading.PENDING
    })
    builder.addCase(fetchDesks.fulfilled, (state, action) => {
      state.loading = Loading.SUCCEEDED
      state.entity = action.payload
    })
    builder.addCase(fetchDesks.rejected, (state) => {
      state.loading = Loading.FAILED
    })
    builder.addCase(updateDesks.fulfilled, (state, action) => {
      state.loading = Loading.SUCCEEDED
      state.entity = action.payload
    })
    builder.addCase(addDesk.fulfilled, (state, action) => {
      state.entity = {
        ...state.entity,
        ...action.payload,
      }
    })
    builder.addCase(deleteDesk.fulfilled, (state, action) => {
      state.entity = _.omit(state.entity, action.meta.arg)
    })
    builder.addCase(deleteClientDesksByOrganizationId, (state, action) => {
      state.entity = _.omitBy(
        state.entity,
        (desk) => desk.organizationId === action.payload
      )
    })
    builder.addCase(deleteClientDesksByLocationId, (state, action) => {
      state.entity = _.omitBy(
        state.entity,
        (desk) => desk.locationId === action.payload
      )
    })
    builder.addCase(deleteClientDesksBySpaceId, (state, action) => {
      state.entity = _.omitBy(
        state.entity,
        (desk) => desk.spaceId === action.payload
      )
    })
    builder.addCase(resetDesks, (state) => {
      state.loading = Loading.IDLE
      state.entity = {}
    })
  },
})
