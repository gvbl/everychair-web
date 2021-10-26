import React from 'react'
import StopError from './StopError'
import axios from 'axios'

interface ErrorBoundaryState {
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps extends React.PropsWithChildren<{}> {
  component?: React.ComponentType<any>
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      error: null,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
    axios.post('/api/log/error', {
      message: error.message,
    })
  }

  formatError = () => {
    if (!this.state.error) {
      return
    }
    if (this.state.errorInfo) {
      return `${this.state.error.toString()}\n${
        this.state.errorInfo.componentStack
      }`
    }
    return this.state.error.toString()
  }

  render() {
    return (
      <>
        {this.state.error ? (
          <div className="h-100" style={{ overflowY: 'auto' }}>
            <StopError details={this.formatError()} />
          </div>
        ) : (
          <>
            {this.props.component
              ? React.createElement(this.props.component)
              : this.props.children}
          </>
        )}
      </>
    )
  }
}

export default ErrorBoundary
