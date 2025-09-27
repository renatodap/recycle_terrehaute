import AsyncStorage from '@react-native-async-storage/async-storage';

interface CompressionMetrics {
  totalUploads: number;
  totalOriginalSize: number;
  totalCompressedSize: number;
  averageCompressionRatio: number;
  averageUploadTime: number;
  lastUpdated: string;
}

const METRICS_KEY = '@compression_metrics';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private uploadStartTime: number = 0;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startUploadTimer(): void {
    this.uploadStartTime = Date.now();
  }

  async recordCompressionMetrics(
    originalSize: number,
    compressedSize: number,
    compressionRatio: number
  ): Promise<void> {
    try {
      const uploadTime = this.uploadStartTime ? Date.now() - this.uploadStartTime : 0;
      const metrics = await this.getMetrics();

      const updatedMetrics: CompressionMetrics = {
        totalUploads: metrics.totalUploads + 1,
        totalOriginalSize: metrics.totalOriginalSize + originalSize,
        totalCompressedSize: metrics.totalCompressedSize + compressedSize,
        averageCompressionRatio:
          (metrics.averageCompressionRatio * metrics.totalUploads + compressionRatio) /
          (metrics.totalUploads + 1),
        averageUploadTime:
          (metrics.averageUploadTime * metrics.totalUploads + uploadTime) /
          (metrics.totalUploads + 1),
        lastUpdated: new Date().toISOString(),
      };

      await AsyncStorage.setItem(METRICS_KEY, JSON.stringify(updatedMetrics));

      // Log performance improvements
      const savedBytes = originalSize - compressedSize;
      const savedKB = Math.round(savedBytes / 1024);
      console.log(`Performance Report:
        - Image compressed by ${compressionRatio}%
        - Saved ${savedKB}KB of data
        - Upload time: ${uploadTime}ms
        - Average compression ratio: ${Math.round(updatedMetrics.averageCompressionRatio)}%
        - Average upload time: ${Math.round(updatedMetrics.averageUploadTime)}ms
      `);
    } catch (error) {
      console.error('Failed to record compression metrics:', error);
    }
  }

  async getMetrics(): Promise<CompressionMetrics> {
    try {
      const stored = await AsyncStorage.getItem(METRICS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to get metrics:', error);
    }

    return {
      totalUploads: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      averageCompressionRatio: 0,
      averageUploadTime: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getPerformanceSummary(): Promise<string> {
    const metrics = await this.getMetrics();

    if (metrics.totalUploads === 0) {
      return 'No uploads yet';
    }

    const totalSavedMB = (metrics.totalOriginalSize - metrics.totalCompressedSize) / (1024 * 1024);
    const averageUploadTimeSeconds = metrics.averageUploadTime / 1000;

    return `Performance Summary:
      Total Uploads: ${metrics.totalUploads}
      Data Saved: ${totalSavedMB.toFixed(2)}MB
      Average Compression: ${Math.round(metrics.averageCompressionRatio)}%
      Average Upload Time: ${averageUploadTimeSeconds.toFixed(1)}s
      Last Updated: ${new Date(metrics.lastUpdated).toLocaleDateString()}
    `;
  }

  async resetMetrics(): Promise<void> {
    try {
      await AsyncStorage.removeItem(METRICS_KEY);
      console.log('Performance metrics reset');
    } catch (error) {
      console.error('Failed to reset metrics:', error);
    }
  }
}

// Lazy initialization to prevent crash on app start
let _performanceMonitor: PerformanceMonitor | null = null;

export const performanceMonitor = {
  startUploadTimer(): void {
    if (!_performanceMonitor) {
      _performanceMonitor = PerformanceMonitor.getInstance();
    }
    _performanceMonitor.startUploadTimer();
  },

  async recordCompressionMetrics(
    originalSize: number,
    compressedSize: number,
    compressionRatio: number
  ): Promise<void> {
    if (!_performanceMonitor) {
      _performanceMonitor = PerformanceMonitor.getInstance();
    }
    return _performanceMonitor.recordCompressionMetrics(originalSize, compressedSize, compressionRatio);
  },

  async getMetrics(): Promise<any> {
    if (!_performanceMonitor) {
      _performanceMonitor = PerformanceMonitor.getInstance();
    }
    return _performanceMonitor.getMetrics();
  },

  async getPerformanceSummary(): Promise<string> {
    if (!_performanceMonitor) {
      _performanceMonitor = PerformanceMonitor.getInstance();
    }
    return _performanceMonitor.getPerformanceSummary();
  },

  async resetMetrics(): Promise<void> {
    if (!_performanceMonitor) {
      _performanceMonitor = PerformanceMonitor.getInstance();
    }
    return _performanceMonitor.resetMetrics();
  }
};