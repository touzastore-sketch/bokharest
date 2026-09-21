import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertCircle, UtensilsCrossed } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Bokharest Black Uncaught Error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6 text-center select-none" dir="rtl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 text-amber-400">
            <UtensilsCrossed className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold font-serif text-amber-400 mb-2">
            بوخارست بلاك | Bokharest Black
          </h1>
          <p className="text-neutral-400 text-sm max-w-sm mb-6 leading-relaxed">
            حدث خطأ غير متوقع أثناء تحميل الواجهة. يرجى الضغط على الزر أدناه لإعادة تشغيل التطبيق.
          </p>

          <button
            onClick={this.handleReload}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold text-sm hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة تحميل التطبيق</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
