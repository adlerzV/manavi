"use client";

import { Component, type ReactNode } from "react";

interface ImageErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ImageErrorBoundaryState {
  hasError: boolean;
}

export class ImageErrorBoundary extends Component<ImageErrorBoundaryProps, ImageErrorBoundaryState> {
  state: ImageErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}