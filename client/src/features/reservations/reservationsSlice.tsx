import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios, { AxiosError } from 'axios'
import _ from 'lodash'
import Reservation from '../../models/api/Reservation'
import { Loading } from '../../models/Loading'
import { RootState } from '../../store'
import { ErrorResponse, ValidationError } from '../../util/errors'
import { CancelDayData } from './CancelDayModal'
import { ReserveData } from './reservemodal/ReserveModal'

export const deleteClientReservationsByOrganizationId = createAction<string>(
  'deleteClientReservationsByOrganizationId'
)
export const deleteClientReservationsByLocationId = createAction<string>(
  'deleteClientReservationsByLocationId'
)
export const deleteClientReservationsBySpaceId = createAction<string>(
  'deleteClientReservationsBySpaceId'
)
export const deleteClientReservationsByDeskId = createAction<string>(
  'deleteClientReservationsByDeskId'
)

export const fetchReservations = createAsyncThunk<
  Record<string, Reservation>,
  string[],
  { state: RootState; rejectValue: AxiosError }
>(
  'reservations/fetch',
  async (organizationIds: string[]) => {
    const { data } = await axios.get<Reservation[]>(
      `/api/reservations?organizationIds=${organizationIds.join(',')}`
    )
    return _.mapKeys<Reservation>(data, 'id')
  },
  {
    condition: (_, { getState }) => {
      const loading = getState().reservations.loading
      if (loading === Loading.PENDING || loading === Loading.SUCCEEDED) {
        return false
      }
    },
  }
)

export const updateReservations = createAsyncThunk<
  Record<string, Reservation>,
  string[],
  { state: RootState; rejectValue: AxiosError }
>(
  'reservations/update',
  async (organizationIds: string[]) => {
    const { data } = await axios.get<Reservation[]>(
      `/api/reservations?organizationIds=${organizationIds.join(',')}`
    )
    return _.mapKeys<Reservation>(data, 'id')
  },
  {
    condition: (_, { getState }) => {
      const loading = getState().reservations.loading
      if (loading === Loading.IDLE || loading === Loading.PENDING) {
        return false
      }
    },
  }
)

export const addReservation = createAsyncThunk<
  Record<string, Reservation>,
  ReserveData,
  { state: RootState; rejectValue: ValidationError[] }
>('reservations/add', async (reserveData: ReserveData, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<Reservation>(
      `/api/organizations/${reserveData.organizationId}/locations/${reserveData.locationId}/spaces/${reserveData.spaceId}/desks/${reserveData.deskId}/reservations`,
      reserveData.body
    )
    const map: Record<string, Reservation> = {}
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

export const cancelDay = createAsyncThunk(
  'reservations/cancel-day',
  async (cancelDayData: CancelDayData) => {
    await axios.delete(
      `/api/reservations/${cancelDayData.reservationId}/days/${cancelDayData.timeRangeId}`
    )
  }
)

export const cancelReservation = createAsyncThunk(
  'reservations/cancel',
  async (reservationId: string) => {
    await axios.delete(`/api/reservations/${reservationId}`)
  }
)

interface ReservationsState {
  entity: Record<string, Reservation>
  loading: Loading
}

const initialState: ReservationsState = {
  entity: {},
  loading: Loading.IDLE,
}

export const reservations = createSlice({
  name: 'reservations',
  initialState: initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder.addCase(fetchReservations.pending, (state) => {
      state.loading = Loading.PENDING
    })
    builder.addCase(fetchReservations.fulfilled, (state, action) => {
      state.loading = Loading.SUCCEEDED
      state.entity = action.payload
    })
    builder.addCase(fetchReservations.rejected, (state) => {
      state.loading = Loading.FAILED
    })
    builder.addCase(updateReservations.fulfilled, (state, action) => {
      state.loading = Loading.SUCCEEDED
      state.entity = action.payload
    })
    builder.addCase(addReservation.fulfilled, (state, action) => {
      state.entity = {
        ...state.entity,
        ...action.payload,
      }
    })
    builder.addCase(cancelDay.fulfilled, (state, action) => {
      state.entity[action.meta.arg.reservationId].timeRanges = state.entity[
        action.meta.arg.reservationId
      ].timeRanges.filter(
        (timeRange) => timeRange.id !== action.meta.arg.timeRangeId
      )
    })
    builder.addCase(cancelReservation.fulfilled, (state, action) => {
      state.entity = _.omit(state.entity, action.meta.arg)
    })
    builder.addCase(
      deleteClientReservationsByOrganizationId,
      (state, action) => {
        state.entity = _.omitBy(
          state.entity,
          (reservation) => reservation.organizationId === action.payload
        )
      }
    )
    builder.addCase(deleteClientReservationsByLocationId, (state, action) => {
      state.entity = _.omitBy(
        state.entity,
        (reservation) => reservation.locationId === action.payload
      )
    })
    builder.addCase(deleteClientReservationsBySpaceId, (state, action) => {
      state.entity = _.omitBy(
        state.entity,
        (reservation) => reservation.spaceId === action.payload
      )
    })
    builder.addCase(deleteClientReservationsByDeskId, (state, action) => {
      state.entity = _.omitBy(
        state.entity,
        (reservation) => reservation.deskId === action.payload
      )
    })
  },
})
