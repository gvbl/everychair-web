import React from 'react'

const MainContainer = ({ children }: React.PropsWithChildren<{}>) => {
  return (
    <div
      className="d-flex h-100"
      style={{
        flex: '1',
      }}
    >
      {children}
    </div>
  )
}

export default MainContainer
