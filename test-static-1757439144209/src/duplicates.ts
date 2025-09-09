
        export function withDuplicates(): void {
          const configuration = getDefaultConfiguration();
          const processed = processWithConfiguration(configuration);
          const configuration = getDefaultConfiguration();
          const validated = validateProcessedData(processed);
          const processed = processWithConfiguration(configuration);
        }
