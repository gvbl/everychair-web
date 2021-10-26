import { Action, AnyAction, combineReducers } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { memberships } from '../features/app/membershipsSlice'
import { users } from '../features/app/userSlice'
import { desks } from '../features/desks/desksSlice'
import { locations } from '../features/desks/locationsSlice'
import { spaces } from '../features/desks/spacesSlice'
import { invitations } from '../features/members/invitationsSlice'
import { members } from '../features/members/membersSlice'
import { reservations } from '../features/reservations/reservationsSlice'

const appReducer = combineReducers({
  user: users.reducer,
  memberships: memberships.reducer,
  members: members.reducer,
  invitations: invitations.reducer,
  locations: locations.reducer,
  spaces: spaces.reducer,
  desks: desks.reducer,
  reservations: reservations.reducer,
})

type AppState = ReturnType<typeof appReducer> | undefined

export const rootReducer = (state: AppState, action: AnyAction) => {
  if (action.type === 'logout') {
    return appReducer(undefined, action)
  }

  return appReducer(state, action)
}

export type RootState = ReturnType<typeof rootReducer>

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
