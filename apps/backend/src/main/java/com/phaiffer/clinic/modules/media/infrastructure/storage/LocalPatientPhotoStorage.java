package com.phaiffer.clinic.modules.media.infrastructure.storage;

import com.phaiffer.clinic.shared.config.media.MediaStorageProperties;
import com.phaiffer.clinic.shared.exception.ResourceNotFoundException;
import com.phaiffer.clinic.shared.exception.media.StorageOperationException;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Component
public class LocalPatientPhotoStorage implements PatientPhotoStorage {

    private static final Map<String, String> EXTENSIONS_BY_CONTENT_TYPE = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp"
    );

    private final Path rootDirectory;

    public LocalPatientPhotoStorage(MediaStorageProperties properties) {
        this.rootDirectory = Path.of(properties.getPatientPhotoStorageRoot()).toAbsolutePath().normalize();
    }

    @Override
    public StoredPatientPhotoFile store(UUID patientId, MultipartFile file) {
        String contentType = normalizeContentType(file.getContentType());
        String extension = EXTENSIONS_BY_CONTENT_TYPE.getOrDefault(contentType, "");
        LocalDate today = LocalDate.now();
        Path relativeDirectory = Path.of(
                patientId.toString(),
                String.valueOf(today.getYear()),
                String.format("%02d", today.getMonthValue())
        );
        String fileName = UUID.randomUUID() + extension;
        Path targetPath = resolveStoragePath(relativeDirectory.resolve(fileName).toString());

        try {
            Files.createDirectories(targetPath.getParent());
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return new StoredPatientPhotoFile(fileName, rootDirectory.relativize(targetPath).toString().replace('\\', '/'));
        } catch (IOException exception) {
            throw new StorageOperationException("Unable to store patient photo", exception);
        }
    }

    @Override
    public Resource loadAsResource(String storagePath) {
        Path resolvedPath = resolveStoragePath(storagePath);
        if (!Files.exists(resolvedPath) || !Files.isRegularFile(resolvedPath)) {
            throw new ResourceNotFoundException("Stored patient photo file not found");
        }

        return new FileSystemResource(resolvedPath);
    }

    @Override
    public void delete(String storagePath) {
        Path resolvedPath = resolveStoragePath(storagePath);

        try {
            Files.deleteIfExists(resolvedPath);
        } catch (IOException exception) {
            throw new StorageOperationException("Unable to delete patient photo file", exception);
        }
    }

    private Path resolveStoragePath(String storagePath) {
        Path resolvedPath = rootDirectory.resolve(storagePath).normalize();
        if (!resolvedPath.startsWith(rootDirectory)) {
            throw new StorageOperationException("Invalid storage path");
        }

        return resolvedPath;
    }

    private String normalizeContentType(String contentType) {
        if (contentType == null) {
            return "";
        }

        return contentType.trim().toLowerCase(Locale.ROOT);
    }
}
