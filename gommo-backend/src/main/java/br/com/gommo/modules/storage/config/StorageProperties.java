package br.com.gommo.modules.storage.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;

@ConfigurationProperties(prefix = "gommo.storage")
public record StorageProperties(String localBasePath, String bucket, DataSize maxFileSize) {

    public StorageProperties {
        if (maxFileSize == null || maxFileSize.toBytes() <= 0) {
            maxFileSize = DataSize.ofMegabytes(25);
        }
    }

    public long maxFileSizeBytes() {
        return maxFileSize.toBytes();
    }
}
