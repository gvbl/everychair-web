import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios, { AxiosError } from 'axios'
import _ from 'lodash'
import Location from '../../models/api/Location'
import { Loading } from '../../models/Loading'
import { RootState } from '../../store'
import { ErrorResponse, ValidationError } from '../../util/errors'
import { deleteClientReservationsByLocationId } from '../reservations/reservationsSlice'
import { AddLocationData } from './AddLocationModal'
import { deleteClientDesksByLocationId } from './desksSlice'
import { EditLocationAddressData } from './EditLocationAddressModal'
import { EditLocationImageData } from './EditLocationImageModal'
import { EditLocationNameData } from './EditLocationNameModal'
import { deleteClientSpacesByLocationId } from './spacesSlice'

export const deleteClientLocationsByOrganizationId = createAction<string>(
  'deleteClientLocationsByOrganizationId'
)
export const resetLocations = createAction('resetLocations')

export const fetchLocations = createAsyncThunk<
  Record<string, Location>,
  string[],
  { state: RootState; rejectValue: AxiosError }
>(
  'locations/fetch',
  async (organizationIds: string[]) => {
    const { data } = await axios.get<Location[]>(
      `/api/locations?organizationIds=${organizationIds.join(',')}`
    )
    return _.mapKeys<Location>(data, 'id')
  },
  {
    condition: (_, { getState }) => {
      const loading = getState().locations.loading
      if (loading === Loading.PENDING || loading === Loading.SUCCEEDED) {
        return false
      }
    },
  }
)

export const updateLocations = createAsyncThunk<
  Record<string, Location>,
  string[],
  { state: RootState; rejectValue: AxiosError }
>(
  'locations/update',
  async (organizationIds: string[]) => {
    const { data } = await axios.get<Location[]>(
      `/api/locations?organizationIds=${organizationIds.join(',')}`
    )
    return _.mapKeys<Location>(data, 'id')
  },
  {
    condition: (_, { getState }) => {
      const loading = getState().locations.loading
      if (loading === Loading.IDLE || loading === Loading.PENDING) {
        return false
      }
    },
  }
)

export const addLocation = createAsyncThunk<
  Record<string, Location>,
  AddLocationData,
  { state: RootState; rejectValue: ValidationError[] }
>(
  'locations/add',
  async (addLocationData: AddLocationData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post<Location>(
        `/api/organizations/${addLocationData.organizationId}/locations`,
        addLocationData.formData
      )
      const map: Record<string, Location> = {}
      map[data.id] = data
      return map
    } catch (err: any) {
      const error: AxiosError<ErrorResponse> = err
      if (!error.response) {
        throw err
      }
      return rejectWithValue(error.response.data.errors)
    }
  }
)

export const deleteLocation = createAsyncThunk(
  'locations/delete',
  async (locationId: string, { dispatch }) => {
    axios.delete(`/api/locations/${locationId}`).then(() => {
      dispatch(deleteClientReservationsByLocationId(locationId))
      dispatch(deleteClientSpacesByLocationId(locationId))
      dispatch(deleteClientDesksByLocationId(locationId))
    })
  }
)

export const editLocationName = createAsyncThunk<
  undefined,
  EditLocationNameData,
  { state: RootState; rejectValue: ValidationError[] }
>(
  'locations/edit/name',
  async (editLocationNameData: EditLocationNameData, { rejectWithValue }) => {
    try {
      await axios.put(
        `/api/locations/${editLocationNameData.locationId}/name`,
        editLocationNameData.body
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

export const editLocationImage = createAsyncThunk(
  'locations/edit/image',
  async (editLocationImageData: EditLocationImageData) => {
    const { data } = await axios.put<Location>(
      `/api/locations/${editLocationImageData.locationId}/image`,
      editLocationImageData.body
    )
    return data.imageUrl
  }
)

export const removeLocationImage = createAsyncThunk(
  'locations/remove/image',
  async (locationId: string) => {
    await axios.delete(`/api/locations/${locationId}/image`)
  }
)

export const editLocationAddress = createAsyncThunk<
  Location,
  EditLocationAddressData,
  { state: RootState; rejectValue: ValidationError[] }
>(
  'locations/edit/address',
  async (
    editLocationAddressData: EditLocationAddressData,
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axios.put<Location>(
        `/api/locations/${editLocationAddressData.locationId}/address`,
        editLocationAddressData.body
      )
      return data
    } catch (err: any) {
      const error: AxiosError<ErrorResponse> = err
      if (!error.response) {
        throw err
      }
      return rejectWithValue(error.response.data.errors)
    }
  }
)

export const removeLocationAddress = createAsyncThunk(
  'locations/remove/address',
  async (locationId: string) => {
    await axios.delete(`/api/locations/${locationId}/address`)
  }
)

interface SpacesState {
  entity: Record<string, Location>
  loading: Loading
}

const initialState: SpacesState = {
  entity: {},
  loading: Loading.IDLE,
}

export const locations = createSlice({
  name: 'locations',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchLocations.pending, (state) => {
      state.loading = Loading.PENDING
    })
    builder.addCase(fetchLocations.fulfilled, (state, action) => {
      state.loading = Loading.SUCCEEDED
      state.entity = action.payload
    })
    builder.addCase(fetchLocations.rejected, (state) => {
      state.loading = Loading.FAILED
    })
    builder.addCase(updateLocations.fulfilled, (state, action) => {
      state.loading = Loading.SUCCEEDED
      state.entity = action.payload
    })
    builder.addCase(addLocation.fulfilled, (state, action) => {
      state.entity = {
        ...state.entity,
        ...action.payload,
      }
    })
    builder.addCase(deleteLocation.fulfilled, (state, action) => {
      state.entity = _.omit(state.entity, action.meta.arg)
    })
    builder.addCase(deleteClientLocationsByOrganizationId, (state, action) => {
      state.entity = _.omitBy(
        state.entity,
        (location) => location.organizationId === action.payload
      )
    })
    builder.addCase(editLocationName.fulfilled, (state, action) => {
      state.entity[action.meta.arg.locationId].name = action.meta.arg.body.name
    })
    builder.addCase(editLocationImage.fulfilled, (state, action) => {
      state.entity[action.meta.arg.locationId].imageUrl = action.payload
    })
    builder.addCase(removeLocationImage.fulfilled, (state, action) => {
      state.entity[action.meta.arg].imageUrl = undefined
    })
    builder.addCase(editLocationAddress.fulfilled, (state, action) => {
      state.entity[action.meta.arg.locationId].timeZone =
        action.payload.timeZone
      state.entity[action.meta.arg.locationId].address = {
        street: action.meta.arg.body.street,
        city: action.meta.arg.body.city,
        state: action.meta.arg.body.state,
        zip: action.meta.arg.body.zip,
      }
    })
    builder.addCase(removeLocationAddress.fulfilled, (state, action) => {
      state.entity[action.meta.arg].address = undefined
    })
    builder.addCase(resetLocations, (state) => {
      state.loading = Loading.IDLE
      state.entity = {}
    })
  },
})
