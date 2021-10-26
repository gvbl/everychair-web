import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios, { AxiosError } from 'axios'
import _ from 'lodash'
import Space from '../../models/api/Space'
import { Loading } from '../../models/Loading'
import { RootState } from '../../store'
import { ErrorResponse, ValidationError } from '../../util/errors'
import { deleteClientReservationsBySpaceId } from '../reservations/reservationsSlice'
import { AddSpaceData } from './AddSpaceModal'
import { deleteClientDesksBySpaceId } from './desksSlice'
import { EditSpaceNameData } from './EditSpaceNameModal'

export const deleteClientSpacesByOrganizationId = createAction<string>(
  'deleteClientSpacesByOrganizationId'
)
export const deleteClientSpacesByLocationId = createAction<string>(
  'deleteClientSpacesByLocationId'
)
export const resetSpaces = createAction('resetSpaces')

export const fetchSpaces = createAsyncThunk<
  Record<string, Space>,
  string[],
  { state: RootState; rejectValue: AxiosError }
>(
  'spaces/fetch',
  async (organizationIds: string[]) => {
    const { data } = await axios.get<Space[]>(
      `/api/spaces?organizationIds=${organizationIds.join(',')}`
    )
    return _.mapKeys<Space>(data, 'id')
  },
  {
    condition: (_, { getState }) => {
      const loading = getState().spaces.loading
      if (loading === Loading.PENDING || loading === Loading.SUCCEEDED) {
        return false
      }
    },
  }
)

export const updateSpaces = createAsyncThunk<
  Record<string, Space>,
  string[],
  { state: RootState; rejectValue: AxiosError }
>(
  'spaces/update',
  async (organizationIds: string[]) => {
    const { data } = await axios.get<Space[]>(
      `/api/spaces?organizationIds=${organizationIds.join(',')}`
    )
    return _.mapKeys<Space>(data, 'id')
  },
  {
    condition: (_, { getState }) => {
      const loading = getState().spaces.loading
      if (loading === Loading.IDLE || loading === Loading.PENDING) {
        return false
      }
    },
  }
)

export const addSpace = createAsyncThunk<
  Record<string, Space>,
  AddSpaceData,
  { state: RootState; rejectValue: ValidationError[] }
>('spaces/add', async (addSpaceData: AddSpaceData, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<Space>(
      `/api/organizations/${addSpaceData.organizationId}/locations/${addSpaceData.locationId}/spaces`,
      addSpaceData.formData
    )
    const map: Record<string, Space> = {}
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

export const deleteSpace = createAsyncThunk(
  'spaces/delete',
  async (spaceId: string, { dispatch }) => {
    axios.delete(`/api/spaces/${spaceId}`).then(() => {
      dispatch(deleteClientReservationsBySpaceId(spaceId))
      dispatch(deleteClientDesksBySpaceId(spaceId))
    })
  }
)

export const editSpaceName = createAsyncThunk<
  undefined,
  EditSpaceNameData,
  { state: RootState; rejectValue: ValidationError[] }
>(
  'spaces/edit/name',
  async (editSpaceNameData: EditSpaceNameData, { rejectWithValue }) => {
    try {
      await axios.put(
        `/api/spaces/${editSpaceNameData.spaceId}/name`,
        editSpaceNameData.body
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

interface SpacesState {
  entity: Record<string, Space>
  loading: Loading
}

const initialState: SpacesState = {
  entity: {},
  loading: Loading.IDLE,
}

export const spaces = createSlice({
  name: 'spaces',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSpaces.pending, (state) => {
      state.loading = Loading.PENDING
    })
    builder.addCase(fetchSpaces.fulfilled, (state, action) => {
      state.loading = Loading.SUCCEEDED
      state.entity = action.payload
    })
    builder.addCase(fetchSpaces.rejected, (state) => {
      state.loading = Loading.FAILED
    })
    builder.addCase(updateSpaces.fulfilled, (state, action) => {
      state.loading = Loading.SUCCEEDED
      state.entity = action.payload
    })
    builder.addCase(addSpace.fulfilled, (state, action) => {
      state.entity = {
        ...state.entity,
        ...action.payload,
      }
    })
    builder.addCase(deleteSpace.fulfilled, (state, action) => {
      state.entity = _.omit(state.entity, action.meta.arg)
    })
    builder.addCase(deleteClientSpacesByOrganizationId, (state, action) => {
      state.entity = _.omitBy(
        state.entity,
        (space) => space.organizationId === action.payload
      )
    })
    builder.addCase(deleteClientSpacesByLocationId, (state, action) => {
      state.entity = _.omitBy(
        state.entity,
        (space) => space.locationId === action.payload
      )
    })
    builder.addCase(editSpaceName.fulfilled, (state, action) => {
      state.entity[action.meta.arg.spaceId].name = action.meta.arg.body.name
    })
    builder.addCase(resetSpaces, (state) => {
      state.loading = Loading.IDLE
      state.entity = {}
    })
  },
})
