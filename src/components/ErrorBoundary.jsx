import { Component } from 'react';

/**
 * Error Boundary – תופס שגיאות render בקומפוננטות React ומציג fallback UI
 * במקום מסך לבן / קריסה מוחלטת של האפליקציה.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-card">
            <div className="error-boundary-icon">😕</div>
            <h1 className="error-boundary-title">אופס, משהו השתבש</h1>
            <p className="error-boundary-message">
              נתקלנו בשגיאה לא צפויה. אל דאגה, הנתונים שלכם בטוחים!
            </p>
            {this.state.error && (
              <details className="error-boundary-details">
                <summary>פרטי השגיאה (למפתחים)</summary>
                <pre>{this.state.error.toString()}</pre>
              </details>
            )}
            <div className="error-boundary-actions">
              <button
                className="btn-primary"
                onClick={this.handleReload}
              >
                🔄 רענון העמוד
              </button>
              <button
                className="btn-secondary"
                onClick={this.handleReset}
              >
                ↩️ ניסיון חוזר
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
