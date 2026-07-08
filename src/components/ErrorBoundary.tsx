// @ts-nocheck
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Download } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    console.error("Uncaught runtime application error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    if (window.confirm("This will clear your local practice attempts, custom settings, and high-speed offline cache to restore default settings. Do you want to proceed?")) {
      try {
        localStorage.clear();
        // Clear IndexedDB collections
        const req = indexedDB.deleteDatabase("at-mock-quiz-db");
        req.onsuccess = () => {
          console.log("IndexedDB cleared successfully.");
          window.location.reload();
        };
        req.onerror = () => {
          window.location.reload();
        };
      } catch (e) {
        window.location.reload();
      }
    }
  };

  private handleSaveLogs = () => {
    if (!this.state.error) return;
    const logContent = `Runtime error: ${this.state.error.message}\n\nStack:\n${this.state.error.stack}\n\nInfo:\n${JSON.stringify(this.state.errorInfo)}`;
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div id="error-boundary-root" className="min-h-screen bg-slate-50 dark:bg-slate-955 flex items-center justify-center p-4 font-sans selection:bg-rose-500/10">
          <div id="error-card" className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-2xl overflow-hidden p-6 sm:p-8 animate-fade-in relative">
            
            {/* Background elements */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-2xl" />

            <div className="flex flex-col items-center text-center">
              <div id="error-icon-wrapper" className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-400 flex items-center justify-center mb-6 border border-rose-100 dark:border-rose-900/30">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <h1 id="error-title" className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                Oops! App Safeguard Tripped
              </h1>
              
              <p id="error-desc" className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-3 max-w-sm">
                To prevent the application from becoming sluggish or unresponsive, the built-in sandbox caught a rendering exception. You can restore working state immediately without losing access to your offline mock databases.
              </p>

              {/* Collapsible details */}
              <div id="error-details" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 my-6 text-left overflow-x-auto max-h-[150px] scrollbar-thin">
                <div className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 mb-1 tracking-wider">ERROR DETAILS:</div>
                <code className="block text-xs font-mono text-slate-700 dark:text-slate-350 whitespace-pre-wrap word-break-all break-words">
                  {this.state.error?.toString() || "Unknown error detected"}
                </code>
              </div>

              {/* Action buttons list */}
              <div id="error-actions" className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <button
                  id="error-btn-reload"
                  onClick={this.handleReload}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-95 active:scale-98 transition duration-200 cursor-pointer shadow-md"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload App
                </button>
                <button
                  id="error-btn-logs"
                  onClick={this.handleSaveLogs}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-250 dark:hover:bg-slate-750 active:scale-98 transition duration-200 cursor-pointer border border-slate-200/30 dark:border-slate-700/30"
                >
                  <Download className="w-4 h-4" />
                  Save Error Logs
                </button>
              </div>

              <div className="w-full border-t border-slate-100 dark:border-slate-800/80 mt-5 pt-4">
                <button
                  id="error-btn-reset"
                  onClick={this.handleResetCache}
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-505 hover:text-rose-500 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Factory Reset Local Database Cache
                </button>
              </div>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
