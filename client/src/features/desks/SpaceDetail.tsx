import React, { useEffect, useRef } from 'react'
import { Button, Container, Table } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { LinkContainer } from 'react-router-bootstrap'
import { Link, useLocation, useParams } from 'react-router-dom'
import { AppDispatch } from '../..'
import AbsoluteSpinner from '../../components/AbsoluteSpinner'
import StopError from '../../components/StopError'
import Desk from '../../models/api/Desk'
import Space from '../../models/api/Space'
import { isLoading, Loading } from '../../models/Loading'
import { SpaceParams } from '../../models/SpaceParams'
import { RootState } from '../../store'
import AddDeskButton from './AddDeskButton'
import DesksList from './DesksList'
import { fetchDesks } from './desksSlice'
import { fetchSpaces } from './spacesSlice'

interface SpaceDetailInnerProps {
  space: Space
}

const SpaceDetailInner = ({ space }: SpaceDetailInnerProps) => {
  const urlLocation = useLocation()
  const containerRef = React.useRef<HTMLDivElement>(null)

  const desks = useSelector<RootState, Desk[]>((state) =>
    Object.values(state.desks.entity ?? []).filter(
      (desk) => desk.spaceId === space.id
    )
  )

  const prevDesksCount = React.useRef<number>(desks.length)
  const desksCount = desks.length
  useEffect(() => {
    if (prevDesksCount.current < desksCount) {
      containerRef.current?.scrollTo(0, containerRef.current?.scrollHeight)
    }
    prevDesksCount.current = desksCount
  })

  return (
    <div
      className="h-100 w-100"
      style={{ overflowY: 'auto' }}
      ref={containerRef}
    >
      <Container style={{ padding: '0' }}>
        <Table className="table-borderless">
          <tbody>
            <tr>
              <td>
                <b>Space name</b>
                <p>{space.name}</p>
              </td>
              <td className="text-right">
                <Link to={`${urlLocation.pathname}/edit-space-name`}>Edit</Link>
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                <h4>Desks</h4>
                <div style={{ marginTop: '1rem' }}>
                  <DesksList desks={desks} />
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="text-center">
                <LinkContainer to={`${urlLocation.pathname}/delete-space`}>
                  <Button variant="danger">Delete space</Button>
                </LinkContainer>
              </td>
            </tr>
          </tbody>
        </Table>
        <AddDeskButton />
      </Container>
    </div>
  )
}

interface SpacesDetailSelected {
  space?: Space
  spacesLoading: Loading
  desksLoading: Loading
}

const SpaceDetail = () => {
  const { spaceId } = useParams<SpaceParams>()
  const dispatch = useDispatch<AppDispatch>()
  const organizationIds = useRef<string[]>([])

  const { space, spacesLoading, desksLoading } = useSelector<
    RootState,
    SpacesDetailSelected
  >((state) => {
    organizationIds.current = Object.keys(state.memberships.entity)
    return {
      space: spaceId ? state.spaces.entity[spaceId] : undefined,
      spacesLoading: state.spaces.loading,
      desksLoading: state.desks.loading,
    }
  })

  useEffect(() => {
    dispatch(fetchSpaces(organizationIds.current))
    dispatch(fetchDesks(organizationIds.current))
  }, [organizationIds, dispatch])

  if (isLoading(spacesLoading) || isLoading(desksLoading)) {
    return <AbsoluteSpinner />
  }
  if (spacesLoading === Loading.FAILED || desksLoading === Loading.FAILED) {
    return <StopError />
  }

  return space ? <SpaceDetailInner space={space} /> : null
}

export default SpaceDetail
