import React, { useState } from 'react'
import {
  Button,
  Carousel,
  Col,
  Container,
  Image,
  ListGroup,
  Nav,
  Navbar,
  Row,
} from 'react-bootstrap'
import { CaretDownFill, Envelope } from 'react-bootstrap-icons'
import { LinkContainer } from 'react-router-bootstrap'
import { useLocation } from 'react-router-dom'
import { Shape } from '../../components/HiddenAltImage'
import IconAltImage from '../../components/IconAltImage'
import SprayBottle from '../../components/icons/SprayBottle'
import { isSmallScreen } from '../../models/mediaQueries'

interface TimeSlotExample {
  name: string
  time: string
  avatarSrc?: string
}

const TimeSlotExample = ({ name, time, avatarSrc }: TimeSlotExample) => {
  return (
    <div className="d-flex align-items-center" style={{ flexGrow: 1 }}>
      <IconAltImage
        title="TimeSlotExample"
        src={avatarSrc}
        width="2.75rem"
        height="2.75rem"
        icon={<SprayBottle color="white" size={26} />}
        shape={Shape.RoundedCircle}
      />
      <div className="text-contained" style={{ marginLeft: '0.5rem' }}>
        {name}
        <br />
        <small>{time}</small>
      </div>
    </div>
  )
}

const HomePage = () => {
  let urlLocation = useLocation()

  const [index, setIndex] = useState(0)

  const handleSelect = (selectedIndex: number) => {
    setIndex(selectedIndex)
  }

  return (
    <div className="d-flex h-100 flex-column" style={{ overflowY: 'auto' }}>
      <Container>
        <Row style={{ marginTop: '2rem' }}>
          <Col className="d-flex align-items-center" xs={12} md={6}>
            <div className="d-flex flex-column">
              <h1 className="display-4">
                Desk reservation system for the future of flexwork
              </h1>
              <p className="lead">
                Automate your flexible office space. Remote teams can manage
                their in-office schedules from desktop or mobile devices.
                Cleaning alerts help your staff manage workspace sanitization.
              </p>
              <div style={{ display: 'block' }}>
                <LinkContainer
                  to={
                    urlLocation.pathname.endsWith('/')
                      ? `${urlLocation.pathname}signup`
                      : `${urlLocation.pathname}/signup`
                  }
                >
                  <Button size="sm" variant="dark">
                    Sign up for free
                  </Button>
                </LinkContainer>
              </div>
            </div>
          </Col>
          <Col xs={12} md={6} hidden={isSmallScreen()}>
            <div
              style={{
                position: 'absolute',
                width: '50rem',
                height: '30rem',
                background:
                  'linear-gradient(to left, white, transparent, transparent), url(/assets/images/hero.png)',
                backgroundSize: '50rem',
              }}
            />
          </Col>
        </Row>
        <Row
          style={
            isSmallScreen() ? { marginTop: '5rem' } : { marginTop: '10rem' }
          }
        >
          <Col>
            <h4>Why Everychair</h4>
          </Col>
        </Row>
        <Row>
          <Col xs={6} md={3} style={{ marginTop: '1rem' }}>
            <div className="d-flex flex-column">
              <div>
                <b>Free</b>
              </div>
              Try our Free plan to find out if Everychair is right for your
              organization. There is no time limit, our software is free for
              small teams.
            </div>
          </Col>
          <Col xs={6} md={3} style={{ marginTop: '1rem' }}>
            <div className="d-flex flex-column">
              <div>
                <b>Focused</b>
              </div>
              If your team is looking for a single purpose solution for desk
              reservations, we think you'll be delighted with Everychair.
            </div>
          </Col>
          <Col xs={6} md={3} style={{ marginTop: '1rem' }}>
            <div className="d-flex flex-column">
              <div>
                <b>Responsive</b>
              </div>
              Made for screens of any size, no app required. Everychair is high
              quality software built with modern design principles.
            </div>
          </Col>
          <Col xs={6} md={3} style={{ marginTop: '1rem' }}>
            <div className="d-flex flex-column">
              <div>
                <b>Connected</b>
              </div>
              Our customer centered philosphy drives feature development. Join
              us and see what comes next.
            </div>
          </Col>
        </Row>
        <Row
          style={
            isSmallScreen() ? { marginTop: '5rem' } : { marginTop: '10rem' }
          }
          hidden={isSmallScreen()}
        >
          <Col>
            <h4>Feature highlight</h4>
            <p className="lead">Cleaning alerts</p>
          </Col>
        </Row>
        <Row style={{ marginTop: '1rem' }} hidden={isSmallScreen()}>
          <Col
            xs={1}
            className="no-padding d-flex flex-column justify-content-end"
          >
            <div
              style={{
                height: '1rem',
                backgroundColor: 'lightgray',
                borderRadius: '0.25rem 0 0 0.25rem',
              }}
            />
          </Col>
          <Col xs={4} className="no-padding d-flex flex-column">
            <div className="d-flex" style={{ justifyContent: 'space-between' }}>
              <div style={{ margin: '0.5rem' }}>
                <TimeSlotExample
                  name="Osian Reilly"
                  time="9:00am-12:00pm"
                  avatarSrc="/assets/images/avatar-one.png"
                />
              </div>
              <div />
              <div className="d-flex flex-column align-items-center">
                <div style={{ flexGrow: 1 }} />
                <div className="d-flex align-items-center">
                  <Envelope />
                  <div style={{ marginLeft: '0.25rem' }}>Cleaning alert</div>
                </div>
                <div style={{ lineHeight: '1' }}>
                  <CaretDownFill />
                </div>
              </div>
            </div>
            <div
              style={{
                height: '1rem',
                backgroundColor: '#007bff',
              }}
            />
          </Col>
          <Col
            xs={1}
            className="no-padding d-flex flex-column justify-content-end"
          >
            <div style={{ height: '1rem', backgroundColor: '#28a745' }} />
          </Col>
          <Col
            xs={1}
            className="no-padding d-flex flex-column justify-content-end"
          >
            <div style={{ height: '1rem', backgroundColor: 'lightgray' }} />
          </Col>
          <Col xs={4} className="no-padding d-flex flex-column">
            <div className="d-flex" style={{ justifyContent: 'space-between' }}>
              <div style={{ margin: '0.5rem' }}>
                <TimeSlotExample
                  name="Mariam Todd"
                  time="1:00pm-5:00pm"
                  avatarSrc="/assets/images/avatar-two.png"
                />
              </div>
              <div />
              <div className="d-flex flex-column align-items-center">
                <div style={{ flexGrow: 1 }} />
                <div className="d-flex align-items-center">
                  <Envelope />
                  <div style={{ marginLeft: '0.25rem' }}>Cleaning alert</div>
                </div>
                <div style={{ lineHeight: '1' }}>
                  <CaretDownFill />
                </div>
              </div>
            </div>
            <div
              style={{
                height: '1rem',
                backgroundColor: '#007bff',
              }}
            />
          </Col>
          <Col
            xs={1}
            className="no-padding d-flex flex-column justify-content-end"
          >
            <div
              style={{
                height: '1rem',
                backgroundColor: '#28a745',
                borderRadius: '0 0.25rem 0.25rem 0',
              }}
            />
          </Col>
        </Row>
        <Row style={{ marginTop: '1rem' }} hidden={isSmallScreen()}>
          <Col xs={1} />
          <Col xs={4} />
          <Col xs={1} className="no-padding">
            <div style={{ position: 'absolute' }}>
              <TimeSlotExample name="Cleaning" time="12:00-12:30pm" />
            </div>
          </Col>
          <Col xs={1} />
          <Col xs={4} />
          <Col xs={1} className="no-padding">
            <div style={{ position: 'absolute' }}>
              <TimeSlotExample name="Cleaning" time="5:00-5:30pm" />
            </div>
          </Col>
        </Row>
        <Row style={{ marginTop: '4rem' }} hidden={isSmallScreen()}>
          <Col xs={12} md={6}>
            Members assigned cleaning roles receive automatic alerts 15 minutes
            before a reservation ends. A 30 minute cleaning period follows each
            reservation allowing time for desk sanitization.
          </Col>
          <Col xs={0} md={6} />
        </Row>
        <Row
          style={
            isSmallScreen() ? { marginTop: '5rem' } : { marginTop: '10rem' }
          }
        >
          <Col>
            <h4>Scalable</h4>
          </Col>
        </Row>
        <Row style={{ marginTop: '1rem' }}>
          <Col xs={12} md={6}>
            Everychair is built with scalable cloud infrastructure with features
            to meet the requirements of large companies.
            <ListGroup variant="flush" style={{ marginTop: '1rem' }}>
              <ListGroup.Item
                action
                onClick={() => handleSelect(0)}
                style={{ cursor: 'pointer' }}
              >
                <span style={index === 0 ? { fontWeight: 600 } : {}}>
                  Multiple organization accounts with billing setup per
                  organization.
                </span>
              </ListGroup.Item>
              <ListGroup.Item
                action
                onClick={() => handleSelect(1)}
                style={{ cursor: 'pointer' }}
              >
                <span style={index === 1 ? { fontWeight: 600 } : {}}>
                  Admin roles to delegate responsibility.
                </span>
              </ListGroup.Item>
              <ListGroup.Item
                action
                onClick={() => handleSelect(2)}
                style={{ cursor: 'pointer' }}
              >
                <span style={index === 2 ? { fontWeight: 600 } : {}}>
                  Run on scalable cloud infrastructure.
                </span>
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col xs={0} md={6}>
            <Carousel
              indicators={false}
              activeIndex={index}
              onSelect={handleSelect}
            >
              <Carousel.Item>
                <Image
                  src="/assets/images/enterprise.png"
                  style={{ width: 'auto', height: '20rem' }}
                />
              </Carousel.Item>
              <Carousel.Item>
                <Image
                  src="/assets/images/delegate.png"
                  style={{ width: 'auto', height: '20rem' }}
                />
              </Carousel.Item>
              <Carousel.Item>
                <Image
                  src="/assets/images/cloud.png"
                  style={{ width: 'auto', height: '20rem' }}
                />
              </Carousel.Item>
            </Carousel>
          </Col>
        </Row>
        <Row
          style={
            isSmallScreen() ? { marginTop: '5rem' } : { marginTop: '10rem' }
          }
        >
          <Col>
            <h4>Get started</h4>
          </Col>
        </Row>
        <Row style={{ marginTop: '1rem', marginBottom: '6rem' }}>
          <Col>
            <LinkContainer
              to={
                urlLocation.pathname.endsWith('/')
                  ? `${urlLocation.pathname}signup`
                  : `${urlLocation.pathname}/signup`
              }
            >
              <Button size="sm" variant="dark">
                Sign up for free
              </Button>
            </LinkContainer>
          </Col>
        </Row>
      </Container>
      <div style={{ flexGrow: 1 }} />
      <div style={{ backgroundColor: '#343a40' }}>
        <Container>
          <Navbar bg="dark" variant="dark">
            <Nav
              className="d-flex flex-fill"
              style={{ justifyContent: 'space-between' }}
            >
              <div>
                <LinkContainer to="/support">
                  <Nav.Link active={false}>Support</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/privacy-policy">
                  <Nav.Link active={false}>Privacy</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/terms">
                  <Nav.Link active={false}>Terms</Nav.Link>
                </LinkContainer>
              </div>
              <Nav.Link style={{ pointerEvents: 'none' }}>
                © Everychair
              </Nav.Link>
            </Nav>
          </Navbar>
        </Container>
      </div>
    </div>
  )
}

export default HomePage
