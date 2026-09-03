package br.com.gommo.modules.storage.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class StoragePathInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(StoragePathInitializer.class);

    private final StorageProperties properties;

    public StoragePathInitializer(StorageProperties properties) {
        this.properties = properties;
    }

    @Override
    public void run(ApplicationArguments args) {
        Path base = Path.of(properties.localBasePath()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(base);
            Path probe = base.resolve(".write-probe");
            Files.writeString(probe, "ok");
            Files.deleteIfExists(probe);
            log.info("Storage local pronto: {}", base);
        } catch (IOException e) {
            log.error(
                    "Storage local nao gravavel em {} — uploads retornarao STORAGE_UPLOAD_FAILED. "
                            + "Verifique volume persistente montado e permissoes (usuario gommo).",
                    base,
                    e);
        }
    }
}
