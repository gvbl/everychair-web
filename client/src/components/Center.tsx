import React from 'react'

const Center = ({ children }: React.PropsWithChildren<{}>) => {
  return (
    <div className="d-flex w-100 justify-content-center">
      <div
        className="flex-fill"
        style={{ maxWidth: '32rem', marginTop: '6rem' }}
      >
        {children}
      </div>
    </div>
  )
}

export default Center
