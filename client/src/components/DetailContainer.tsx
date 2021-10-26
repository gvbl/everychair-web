import React from 'react'

const DetailContainer = ({ children }: React.PropsWithChildren<{}>) => {
  return (
    <div className="d-flex h-100" style={{ flex: '2' }}>
      {children}
    </div>
  )
}

export default DetailContainer
